import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Zap, Users, Clock, ShieldCheck, Activity, AlertTriangle, CheckCircle, Mic, Loader, X, EyeOff, Calendar } from 'lucide-react';
import { Transaction, Budget, UserProfile } from '../types';
import { parseVoiceCommand } from '../services/geminiService';
import { API_BASE_URL } from '../constants';

interface DashboardProps {
    transactions: Transaction[];
    budgets: Budget[];
    userSettings: UserProfile | null;
    isPrivacy: boolean;
}

type ChartRange = '1D' | '1W' | '1M' | '1Y';

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets, userSettings, isPrivacy }) => {
  
  // 🆕 CHART FILTER STATE
  const [chartRange, setChartRange] = useState<ChartRange>('1W');

  // --- 1. CORE CALCULATIONS ---
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const savingsHealth = totalLimit > 0 ? Math.round(((totalLimit - totalSpent) / totalLimit) * 100) : 0;

  const calculateTimeValueScore = () => {
      if (!userSettings || !userSettings.monthlyIncome || userSettings.monthlyIncome === 0) return 0;
      
      const monthlyFixedCost = userSettings.recurringExpenses.reduce((acc, item) => {
          if (item.frequency === 'Yearly') return acc + (item.amount / 12);
          if (item.frequency === 'Weekly') return acc + (item.amount * 4);
          return acc + item.amount;
      }, 0);

      const lockedPercentage = (monthlyFixedCost / userSettings.monthlyIncome) * 100;
      return Math.max(0, 100 - Math.round(lockedPercentage));
  };

  const timeValueScore = calculateTimeValueScore();

  // --- 2. LOGS & CHART DATA (UPDATED) ---
  const generateSystemLogs = () => {
      const logs = [];
      const blockedTx = transactions.find(t => t.firewallDecision === 'BLOCK');
      if (blockedTx) {
          logs.push({ 
              id: 'blk', 
              action: 'Firewall Intervention', 
              reason: `Blocked purchase at ${blockedTx.description.substring(0, 10)}...`, 
              icon: <ShieldCheck size={14} className="text-danger" /> 
          });
      }

      const highTx = transactions.find(t => t.amount > 5000 && t.type === 'DEBIT');
      if (highTx) {
          logs.push({ 
              id: 'high', 
              action: 'High Value Detected', 
              reason: `₹${highTx.amount} spent on ${highTx.category}`, 
              icon: <AlertTriangle size={14} className="text-warning" /> 
          });
      }

      const incomeTx = transactions.find(t => t.type === 'CREDIT');
      if (incomeTx) {
          logs.push({ 
              id: 'inc', 
              action: 'Inflow Processed', 
              reason: `Credit of ₹${incomeTx.amount} received`, 
              icon: <TrendingUp size={14} className="text-success" /> 
          });
      }

      if (logs.length === 0) {
          logs.push({ 
              id: 'sys', 
              action: 'System Secured', 
              reason: 'MoneyOS kernel active. No anomalies.', 
              icon: <Zap size={14} className="text-primary" /> 
          });
      }
      return logs;
  };

  const systemLogs = generateSystemLogs();

  // 🆕 DYNAMIC FORWARD-LINEAR CHART LOGIC
  const chartData = useMemo(() => {
    const data: { name: string; debit: number; credit: number; dateKey: string }[] = [];
    const now = new Date();

    if (chartRange === '1D') {
        // Breakdown by 4-hour blocks for today
        for (let i = 0; i < 24; i += 4) {
            const startHour = i;
            const endHour = i + 4;
            const label = `${startHour}:00`;
            
            // Filter transactions for this specific block today
            const blockDebit = transactions.reduce((sum, t) => {
                const tDate = new Date(t.date);
                const isToday = tDate.toDateString() === now.toDateString();
                const inHourRange = tDate.getHours() >= startHour && tDate.getHours() < endHour;
                return (isToday && inHourRange && t.type === 'DEBIT') ? sum + t.amount : sum;
            }, 0);

            const blockCredit = transactions.reduce((sum, t) => {
                const tDate = new Date(t.date);
                const isToday = tDate.toDateString() === now.toDateString();
                const inHourRange = tDate.getHours() >= startHour && tDate.getHours() < endHour;
                return (isToday && inHourRange && t.type === 'CREDIT') ? sum + t.amount : sum;
            }, 0);

            data.push({ name: label, debit: blockDebit, credit: blockCredit, dateKey: label });
        }
    } 
    else if (chartRange === '1W' || chartRange === '1M') {
        const daysToLookBack = chartRange === '1W' ? 7 : 30;
        
        // Loop backwards from 0 (today) to 6 (7 days ago) or 29 (30 days ago)
        // We actually want the loop to go from Oldest -> Newest for the graph X-Axis
        for (let i = daysToLookBack - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon"
            const dateNum = d.getDate();
            const label = chartRange === '1W' ? dayName : `${dateNum} ${dayName}`; // 1W: "Mon", 1M: "21 Mon"
            const dateKey = d.toDateString(); // "Mon Dec 21 2025" for matching

            const dayDebit = transactions.reduce((sum, t) => {
                const tDate = new Date(t.date);
                return (tDate.toDateString() === dateKey && t.type === 'DEBIT') ? sum + t.amount : sum;
            }, 0);

            const dayCredit = transactions.reduce((sum, t) => {
                const tDate = new Date(t.date);
                return (tDate.toDateString() === dateKey && t.type === 'CREDIT') ? sum + t.amount : sum;
            }, 0);

            data.push({ name: label, debit: dayDebit, credit: dayCredit, dateKey });
        }
    } 
    else if (chartRange === '1Y') {
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            
            const monthName = d.toLocaleDateString('en-US', { month: 'short' }); // "Dec"
            const yearKey = d.getFullYear(); // 2025
            
            const monthDebit = transactions.reduce((sum, t) => {
                const tDate = new Date(t.date);
                return (tDate.getMonth() === d.getMonth() && tDate.getFullYear() === yearKey && t.type === 'DEBIT') ? sum + t.amount : sum;
            }, 0);

            const monthCredit = transactions.reduce((sum, t) => {
                const tDate = new Date(t.date);
                return (tDate.getMonth() === d.getMonth() && tDate.getFullYear() === yearKey && t.type === 'CREDIT') ? sum + t.amount : sum;
            }, 0);

            data.push({ name: monthName, debit: monthDebit, credit: monthCredit, dateKey: `${monthName}-${yearKey}` });
        }
    }

    return data;
  }, [transactions, chartRange]);

  // --- 3. VOICE MODE LOGIC ---
  const [isListening, setIsListening] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{text: string, data: Partial<Transaction> | null} | null>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Browser does not support voice. Use Chrome.");
        return;
    }
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US'; 
    
    setIsListening(true);
    
    recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setVoiceProcessing(true);
        
        const parsedData = await parseVoiceCommand(transcript);
        setVoiceProcessing(false);
        setVoiceResult({ text: transcript, data: parsedData });
    };

    recognition.onerror = () => {
        setIsListening(false);
        alert("Voice recognition failed. Try again.");
    };

    recognition.start();
  };

  const confirmVoiceTransaction = async () => {
    if (!voiceResult?.data) return;
    try {
        const token = localStorage.getItem('moneyos_token');
        await fetch(`${API_BASE_URL}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                transaction: { 
                    ...voiceResult.data, 
                    date: new Date().toISOString(), 
                    id: Date.now().toString(),
                    firewallReason: 'Voice Command'
                }
            })
        });
        window.location.reload(); 
    } catch (e) {
        alert("Failed to save.");
    }
  };

  // --- 4. STEALTH MODE HELPER ---
  const formatMoney = (amount: number) => {
      if (isPrivacy) return '₹****';
      return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      
      {/* 🎤 VOICE OVERLAY MODAL */}
      {(isListening || voiceProcessing || voiceResult) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
                  <button onClick={() => {setIsListening(false); setVoiceResult(null);}} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                  
                  <div className="text-center pt-4 pb-6">
                      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${
                          isListening ? 'bg-danger/20 text-danger animate-pulse scale-110' : 
                          voiceProcessing ? 'bg-accent/20 text-accent animate-spin' : 
                          'bg-success/20 text-success'
                      }`}>
                          {isListening && <Mic size={40} />}
                          {voiceProcessing && <Loader size={40} />}
                          {voiceResult && <CheckCircle size={40} />}
                      </div>

                      <h3 className="text-xl font-bold mb-2">
                          {isListening ? "Listening..." : voiceProcessing ? "Processing..." : "Confirm Transaction"}
                      </h3>
                      
                      {isListening && <p className="text-gray-500 text-sm">"Spent 500 on Pizza"</p>}
                      
                      {voiceResult && (
                          <div className="bg-background/50 p-4 rounded-xl border border-gray-700 text-left space-y-2">
                              <p className="text-xs text-gray-500 italic mb-2">"{voiceResult.text}"</p>
                              {voiceResult.data ? (
                                  <>
                                      <div className="flex justify-between font-bold">
                                          <span>{voiceResult.data.category}</span>
                                          <span className={voiceResult.data.type === 'CREDIT' ? 'text-success' : 'text-danger'}>
                                              {voiceResult.data.type === 'CREDIT' ? '+' : '-'}₹{voiceResult.data.amount}
                                          </span>
                                      </div>
                                      <div className="text-sm text-gray-400">{voiceResult.data.description}</div>
                                  </>
                              ) : (
                                  <p className="text-danger">Could not understand. Try again.</p>
                              )}
                          </div>
                      )}
                  </div>

                  {voiceResult?.data && (
                      <button 
                          onClick={confirmVoiceTransaction}
                          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all"
                      >
                          Save Transaction
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono text-xl">#</span>
            <h2 className="text-2xl font-bold">Mission Control</h2>
            {/* Privacy Indicator */}
            {isPrivacy && (
                <div className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                    <EyeOff size={10} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Stealth Mode</span>
                </div>
            )}
          </div>
          
          <button 
            onClick={startListening}
            className="bg-accent hover:bg-violet-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
          >
            <Mic size={18} />
            <span className="font-bold text-sm hidden sm:inline">Voice Log</span>
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HEALTH METER (PRIVACY ENABLED) */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={120} />
          </div>
          <h3 className="text-gray-400 text-xs font-bold mb-2 tracking-widest uppercase flex items-center gap-2">
            <span className="text-gray-600 font-mono text-[10px]">#</span>
            <Activity size={14} className="text-primary" />
            SAVINGS HEALTH
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className={`text-5xl font-black tracking-tighter transition-all ${savingsHealth > 30 ? 'text-success' : 'text-danger'} ${isPrivacy ? 'blur-sm' : ''}`}>
              {savingsHealth}%
            </span>
            <span className="text-gray-500 font-medium">buffer</span>
          </div>
          <div className="w-full bg-gray-800 h-3 rounded-full mt-6 p-0.5 border border-gray-700">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)] ${savingsHealth > 30 ? 'bg-success' : 'bg-danger'}`} 
              style={{ width: `${savingsHealth}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 font-mono">
              UTILIZATION: {formatMoney(totalSpent)} / {formatMoney(totalLimit)}
          </p>
        </div>

        {/* FIREWALL STATUS */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col justify-between">
            <h3 className="text-gray-400 text-xs font-bold mb-4 tracking-widest uppercase flex items-center gap-2">
                <span className="text-gray-600 font-mono text-[10px]">#</span>
                <ShieldCheck size={14} className="text-accent" />
                FIREWALL ENGINE
            </h3>
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-success font-bold text-lg">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                    </span>
                    ACTIVE
                </div>
                <p className="text-xs text-gray-500 mt-1">Real-time spending verification is operational.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-[10px] text-gray-400 font-mono">ENCRYPTION: AES-256-GCM</p>
            </div>
        </div>

        {/* AUTOPILOT ACTIONS */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6">
          <h3 className="text-gray-400 text-xs font-bold mb-4 tracking-widest uppercase flex items-center space-x-2">
            <span className="text-gray-600 font-mono text-[10px]">#</span>
            <Zap size={14} className="text-warning" />
            <span>SYSTEM EVENTS</span>
          </h3>
          <div className="space-y-4 max-h-32 overflow-y-auto custom-scrollbar">
            {systemLogs.map((log) => (
              <div key={log.id} className="text-xs border-l-2 border-gray-700 pl-3 py-1 hover:border-warning transition-colors">
                <div className="flex items-center gap-2 mb-0.5">
                    {log.icon}
                    <p className="text-white font-semibold">{log.action}</p>
                </div>
                <p className="text-gray-500 text-[10px] uppercase">{log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMARTSPLIT CARD */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex items-center justify-between hover:border-primary/50 transition-colors">
            <div>
                <h3 className="text-gray-400 text-xs font-bold mb-1 tracking-widest uppercase flex items-center gap-2">
                    <span className="text-gray-600 font-mono text-[10px]">#</span>
                    <Users size={14} className="text-primary" />
                    SMARTSPLIT METRIC
                </h3>
                <p className="text-sm text-gray-300">Synchronize group debts via natural language.</p>
            </div>
            <div className="text-right">
                <button 
                    onClick={() => window.location.hash = 'groups'}
                    className="text-primary text-xs font-bold hover:underline tracking-widest"
                >
                    OPEN HARMONIZER
                </button>
            </div>
        </div>

        {/* TIME-VALUE CARD */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex items-center justify-between hover:border-accent/50 transition-colors">
            <div>
                 <h3 className="text-gray-400 text-xs font-bold mb-1 tracking-widest uppercase flex items-center gap-2">
                    <span className="text-gray-600 font-mono text-[10px]">#</span>
                    <Clock size={14} className="text-accent" />
                    TIME-VALUE SCORE
                </h3>
                <p className="text-sm text-gray-300">
                    {timeValueScore > 80 ? "High Autonomy. You own your time." : "Heavy Fixed Costs. Locked in."}
                </p>
            </div>
            <div className="text-right">
                <div className={`text-3xl font-mono font-bold transition-all ${timeValueScore > 50 ? 'text-success' : 'text-danger'} ${isPrivacy ? 'blur-md' : ''}`}>
                    {timeValueScore}
                </div>
                <div className="text-[10px] text-gray-500 font-mono">/ 100</div>
            </div>
        </div>
      </div>

      {/* 🆕 MAIN CHART (DYNAMIC & PRIVACY ENABLED) */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h3 className="text-gray-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-1">
                    <span className="text-gray-600 font-mono text-[10px]">#</span> REAL-TIME SPENDING OSCILLOSCOPE
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-success rounded-full"></span> CREDIT
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-danger rounded-full"></span> DEBIT
                    </div>
                </div>
            </div>

            {/* 🆕 TIME RANGE TABS */}
            <div className="flex bg-gray-800/50 p-1 rounded-lg border border-gray-700/50">
                {(['1D', '1W', '1M', '1Y'] as ChartRange[]).map((range) => (
                    <button
                        key={range}
                        onClick={() => setChartRange(range)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                            chartRange === range 
                            ? 'bg-gray-700 text-white shadow-sm border border-gray-600' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
        
        {/* CHART CONTAINER WITH BLUR EFFECT */}
        <div className={`h-72 w-full transition-all duration-300 ${isPrivacy ? 'blur-md opacity-40 grayscale pointer-events-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fontSize: 10, fontWeight: 700}}
                    interval={chartRange === '1M' ? 3 : 0} // Skip ticks for month view to prevent clutter
                />
                <YAxis 
                    stroke="#475569" 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `₹${val}`} 
                    tick={{fontSize: 10, fontWeight: 700}}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                    cursor={{ stroke: '#334155', strokeWidth: 2 }}
                    itemStyle={{ fontWeight: 700 }}
                    formatter={(value: number, name: string) => [
                        isPrivacy ? '₹****' : `₹${value}`, 
                        name === 'credit' ? 'INCOME' : 'EXPENSE'
                    ]}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="credit" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorCredit)" 
                    animationDuration={1500}
                />
                <Area 
                    type="monotone" 
                    dataKey="debit" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorDebit)" 
                    animationDuration={1500}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* OVERLAY MESSAGE FOR PRIVACY MODE */}
        {isPrivacy && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 px-4 py-2 rounded-xl border border-gray-600 flex items-center gap-2 shadow-2xl backdrop-blur-md">
                    <EyeOff size={16} className="text-gray-300" />
                    <span className="text-xs font-bold text-gray-300 tracking-widest">SENSITIVE DATA MASKED</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;