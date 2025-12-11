
import React, { useState, useEffect } from 'react';
import { Transaction, Budget, Persona, FirewallDecision } from '../types';
import { checkTransactionWithFirewall } from '../services/geminiService';
import { parseSMS } from '../services/smsParser';
import { INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from '../constants';
import { ShieldCheck, ShieldAlert, ShieldBan, Bot, Send, CloudDownload, RefreshCw } from 'lucide-react';

const Transactions: React.FC = () => {
  // Load initial state from LocalStorage if available, else use constants
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('moneyos_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [persona, setPersona] = useState<Persona>('BALANCED');
  
  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(INITIAL_BUDGETS[0].category);
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [firewallResult, setFirewallResult] = useState<{decision: FirewallDecision, reason: string, futureImpact: string} | null>(null);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  // Persist transactions whenever they change
  useEffect(() => {
    localStorage.setItem('moneyos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleSyncSMS = async () => {
    setIsSyncing(true);
    try {
        const response = await fetch('https://sms-parser-qkzu.onrender.com/api/sync-sms');
        const data = await response.json();

        if (data.success && data.messages.length > 0) {
            const newTransactions: Transaction[] = [];
            let count = 0;

            data.messages.forEach((msg: any) => {
                const parsed = parseSMS(msg);
                if (parsed) {
                    // Avoid duplicates based on ID
                    if (!transactions.some(t => t.id === parsed.id)) {
                        newTransactions.push(parsed);
                        count++;
                    }
                }
            });

            if (count > 0) {
                setTransactions(prev => [...newTransactions, ...prev]);
                alert(`Successfully synced ${count} financial transactions from ${data.count} SMS messages.`);
            } else {
                alert(`Fetched ${data.count} messages, but no new financial transactions found.`);
            }
        } else {
            alert("No new messages found on cloud.");
        }
    } catch (error) {
        console.error("Sync failed:", error);
        alert("Sync failed. Check connection to backend.");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setIsAnalyzing(true);
    try {
        const result = await checkTransactionWithFirewall(
            { amount: Number(amount), category, description },
            budgets,
            persona
        );
        setFirewallResult(result);
    } catch (error) {
        console.error(error);
        alert("AI Firewall unavailable. Please check API Key.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const confirmTransaction = () => {
    if (!firewallResult) return;
    
    const newTx: Transaction = {
        id: Date.now().toString(),
        amount: Number(amount),
        category,
        description,
        date: new Date().toISOString().split('T')[0],
        firewallDecision: firewallResult.decision,
        firewallReason: firewallResult.reason
    };
    
    setTransactions([newTx, ...transactions]);
    setFirewallResult(null);
    setAmount('');
    setDescription('');
  };

  const getDecisionColor = (decision?: FirewallDecision) => {
    switch (decision) {
        case 'ALLOW': return 'text-success border-success/20 bg-success/10';
        case 'CAUTION': return 'text-warning border-warning/20 bg-warning/10';
        case 'BLOCK': return 'text-danger border-danger/20 bg-danger/10';
        default: return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Transaction Feed */}
      <div className="lg:col-span-2 bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
                <ShieldCheck className="text-primary" />
                <span>Transaction Log</span>
            </h2>
            <button 
                onClick={handleSyncSMS}
                disabled={isSyncing}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
            >
                <CloudDownload size={14} className={isSyncing ? 'animate-bounce' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync SMS from Cloud'}</span>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {transactions.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    <RefreshCw size={40} className="mx-auto mb-2 opacity-20" />
                    <p>No transactions found. Sync from SMS or add manually.</p>
                </div>
            )}
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                    <div>
                        <div className="font-semibold">{tx.description}</div>
                        <div className="text-xs text-gray-500">{tx.category} • {tx.date}</div>
                        {tx.firewallReason && tx.firewallReason !== 'Imported from SMS' && (
                             <div className="text-[10px] text-gray-400 mt-1 italic">AI: {tx.firewallReason}</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="font-mono font-bold">₹{tx.amount}</div>
                        {tx.firewallDecision && (
                            <div className={`text-xs px-2 py-0.5 rounded-full inline-block border mt-1 ${getDecisionColor(tx.firewallDecision)}`}>
                                {tx.firewallDecision}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Input & Firewall */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <Bot className="text-accent" />
            <span>AI Spending Firewall</span>
        </h2>

        {/* Persona Selector */}
        <div className="flex bg-background rounded-lg p-1 mb-6">
            {(['STRICT', 'BALANCED', 'CHILL'] as Persona[]).map((p) => (
                <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                        persona === p ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    {p}
                </button>
            ))}
        </div>

        {/* Firewall Modal Result - Overlay within this column */}
        {firewallResult ? (
            <div className="flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-300">
                <div className={`p-6 rounded-2xl border-2 mb-4 text-center ${
                    firewallResult.decision === 'BLOCK' ? 'border-danger bg-danger/5' :
                    firewallResult.decision === 'CAUTION' ? 'border-warning bg-warning/5' :
                    'border-success bg-success/5'
                }`}>
                    {firewallResult.decision === 'BLOCK' && <ShieldBan size={48} className="mx-auto text-danger mb-3" />}
                    {firewallResult.decision === 'CAUTION' && <ShieldAlert size={48} className="mx-auto text-warning mb-3" />}
                    {firewallResult.decision === 'ALLOW' && <ShieldCheck size={48} className="mx-auto text-success mb-3" />}
                    
                    <h3 className="text-2xl font-bold mb-2">{firewallResult.decision}</h3>
                    <p className="text-sm mb-4">{firewallResult.reason}</p>
                    
                    <div className="bg-background/50 p-3 rounded-lg text-xs text-left mb-4">
                        <span className="font-bold text-gray-400 block mb-1">FUTURE IMPACT:</span>
                        {firewallResult.futureImpact}
                    </div>

                    <div className="flex space-x-3">
                        <button onClick={() => setFirewallResult(null)} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm">Cancel</button>
                        <button onClick={confirmTransaction} className={`flex-1 py-2 rounded-lg font-bold text-black text-sm ${
                            firewallResult.decision === 'BLOCK' ? 'bg-danger hover:bg-red-400' :
                            firewallResult.decision === 'CAUTION' ? 'bg-warning hover:bg-yellow-400' :
                            'bg-success hover:bg-emerald-400'
                        }`}>
                            {firewallResult.decision === 'BLOCK' ? 'Override & Spend' : 'Proceed'}
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            /* Input Form */
            <form onSubmit={handleAnalyze} className="space-y-4 flex-1">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">AMOUNT</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-background border border-gray-600 rounded-xl py-2 pl-8 pr-4 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DESCRIPTION</label>
                    <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-background border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        placeholder="What are you buying?"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">CATEGORY</label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-background border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    >
                        {budgets.map(b => (
                            <option key={b.category} value={b.category}>{b.category}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isAnalyzing}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <span>Analyzing...</span>
                        ) : (
                            <>
                                <Bot size={18} />
                                <span>Check with Firewall</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default Transactions;
