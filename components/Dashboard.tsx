
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOCK_AUTOPILOT_LOGS } from '../constants';
import { TrendingUp, Zap, Users, Clock, ShieldCheck, Activity } from 'lucide-react';
import { Transaction, Budget } from '../types';

interface DashboardProps {
    transactions: Transaction[];
    budgets: Budget[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets }) => {
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const healthPercentage = totalLimit > 0 ? Math.round(((totalLimit - totalSpent) / totalLimit) * 100) : 100;

  const processChartData = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const data = days.map(d => ({ name: d, spend: 0 }));
      
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      transactions.forEach(t => {
          const tDate = new Date(t.date);
          if (tDate > last7Days) {
              const dayIndex = tDate.getDay();
              data[dayIndex].spend += t.amount;
          }
      });
      return data;
  };

  const chartData = processChartData();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-500 font-mono text-xl">#</span>
          <h2 className="text-2xl font-bold">Mission Control</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Meter */}
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
            <span className={`text-5xl font-black tracking-tighter ${healthPercentage > 30 ? 'text-success' : 'text-danger'}`}>
              {healthPercentage}%
            </span>
            <span className="text-gray-500 font-medium">buffer</span>
          </div>
          <div className="w-full bg-gray-800 h-3 rounded-full mt-6 p-0.5 border border-gray-700">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)] ${healthPercentage > 30 ? 'bg-success' : 'bg-danger'}`} 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 font-mono">
              UTILIZATION: ₹{totalSpent.toLocaleString()} / ₹{totalLimit.toLocaleString()}
          </p>
        </div>

        {/* System Firewall Status */}
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

        {/* Autopilot Actions */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6">
          <h3 className="text-gray-400 text-xs font-bold mb-4 tracking-widest uppercase flex items-center space-x-2">
            <span className="text-gray-600 font-mono text-[10px]">#</span>
            <Zap size={14} className="text-warning" />
            <span>AUTOPILOT LOG</span>
          </h3>
          <div className="space-y-4 max-h-32 overflow-y-auto custom-scrollbar">
            {MOCK_AUTOPILOT_LOGS.map((log) => (
              <div key={log.id} className="text-xs border-l-2 border-gray-700 pl-3 py-1 hover:border-warning transition-colors">
                <p className="text-white font-semibold">{log.action}</p>
                <p className="text-gray-500 text-[10px] uppercase">{log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <button className="text-primary text-xs font-bold hover:underline tracking-widest">OPEN HARMONIZER</button>
            </div>
        </div>

        <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex items-center justify-between hover:border-accent/50 transition-colors">
            <div>
                 <h3 className="text-gray-400 text-xs font-bold mb-1 tracking-widest uppercase flex items-center gap-2">
                    <span className="text-gray-600 font-mono text-[10px]">#</span>
                    <Clock size={14} className="text-accent" />
                    TIME-VALUE SCORE
                </h3>
                <p className="text-sm text-gray-300">Efficiency optimized via behavioral usage data.</p>
            </div>
            <div className="text-right">
                <div className="text-xl font-mono font-bold text-accent">--</div>
            </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6 shadow-xl relative">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-gray-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="text-gray-600 font-mono text-[10px]">#</span> REAL-TIME SPENDING OSCILLOSCOPE
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500">
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-primary rounded-full"></span> DEBITS</div>
                <div className="flex items-center gap-1">INTERVAL: 7D</div>
            </div>
        </div>
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fontSize: 10, fontWeight: 700}}
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
                    itemStyle={{ color: '#3b82f6', fontWeight: 700 }}
                    cursor={{ stroke: '#334155', strokeWidth: 2 }}
                />
                <Area 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorSpend)" 
                    animationDuration={1500}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
