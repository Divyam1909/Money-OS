
import React, { useState } from 'react';
import { Transaction, Budget, Persona, FirewallDecision } from '../types';
import { checkTransactionWithFirewall } from '../services/geminiService';
import { parseSMS } from '../services/smsParser';
import { ShieldCheck, ShieldAlert, ShieldBan, Bot, CloudDownload, RefreshCw, ClipboardPlus, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface TransactionsProps {
    transactions: Transaction[];
    budgets: Budget[];
    token: string;
    onUpdate: () => void;
    isSyncing: boolean;
    onManualSync: () => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, budgets, token, onUpdate, isSyncing, onManualSync }) => {
  const [persona, setPersona] = useState<Persona>('BALANCED');
  
  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(budgets[0]?.category || 'Uncategorized');
  const [type, setType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [firewallResult, setFirewallResult] = useState<{decision: FirewallDecision, reason: string, futureImpact: string} | null>(null);

  // Paste Modal State
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedSMS, setPastedSMS] = useState('');

  const handleManualParse = async () => {
      if (!pastedSMS) return;
      
      const mockMsg = {
          body: pastedSMS,
          receivedAt: new Date().toISOString(),
          _id: Date.now().toString(),
          from: "ManualPaste"
      };

      const parsed = parseSMS(mockMsg);

      if (parsed) {
          setAmount(parsed.amount.toString());
          setDescription(parsed.description);
          setCategory(parsed.category);
          setType(parsed.type);
          setShowPasteModal(false);
          setPastedSMS('');
      } else {
          alert("Could not extract transaction details.");
      }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    
    if (type === 'CREDIT') {
        confirmTransaction();
        return;
    }

    setIsAnalyzing(true);
    try {
        const result = await checkTransactionWithFirewall(
            { amount: Number(amount), category, description, type: 'DEBIT' },
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

  const confirmTransaction = async () => {
    const newTx: Partial<Transaction> = {
        amount: Number(amount),
        category,
        description,
        type,
        firewallDecision: firewallResult?.decision || 'ALLOW',
        firewallReason: firewallResult?.reason || (type === 'CREDIT' ? 'Income' : 'Manual Entry')
    };
    
    try {
         await fetch(`${API_BASE_URL}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                transaction: { ...newTx, date: new Date().toISOString().split('T')[0], id: Date.now().toString() }
            })
        });
        onUpdate();
        setFirewallResult(null);
        setAmount('');
        setDescription('');
    } catch (e) {
        alert("Failed to save transaction");
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)] relative">
      {/* Paste Modal Overlay */}
      {showPasteModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-surface border border-gray-700 p-6 rounded-2xl w-96 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Paste SMS Text</h3>
                      <button onClick={() => setShowPasteModal(false)}><X size={20} /></button>
                  </div>
                  <textarea 
                      value={pastedSMS}
                      onChange={e => setPastedSMS(e.target.value)}
                      placeholder="e.g. Rs. 500 debited from HDFC Bank for Zomato..."
                      className="w-full h-32 bg-background border border-gray-600 rounded-xl p-3 text-sm outline-none mb-4 resize-none"
                  />
                  <button 
                      onClick={handleManualParse}
                      className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded-xl"
                  >
                      Parse & Auto-fill
                  </button>
              </div>
          </div>
      )}

      {/* Transaction Feed */}
      <div className="lg:col-span-2 bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
                <ShieldCheck className="text-primary" />
                <span>Transaction Log</span>
            </h2>
            <div className="flex space-x-2">
                <button 
                    onClick={() => setShowPasteModal(true)}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center space-x-2 transition-all"
                >
                    <ClipboardPlus size={14} />
                    <span className="hidden sm:inline">Paste SMS</span>
                </button>
                <button 
                    onClick={onManualSync}
                    disabled={isSyncing}
                    className="bg-primary/20 text-primary hover:bg-primary/30 text-xs font-bold py-2 px-3 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50 border border-primary/20"
                >
                    <CloudDownload size={14} className={isSyncing ? 'animate-bounce' : ''} />
                    <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Force Sync'}</span>
                </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {transactions.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    <RefreshCw size={40} className="mx-auto mb-2 opacity-20" />
                    <p>Waiting for new transactions...</p>
                    <p className="text-xs">MoneyOS syncs with your phone automatically.</p>
                </div>
            )}
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                    <div>
                        <div className="flex items-center gap-2">
                            {tx.type === 'CREDIT' ? <ArrowDownLeft size={16} className="text-success" /> : <ArrowUpRight size={16} className="text-gray-400" />}
                            <div className="font-semibold">{tx.description}</div>
                        </div>
                        <div className="text-xs text-gray-500 pl-6">{tx.category} • {tx.date}</div>
                        {tx.firewallReason && tx.firewallReason !== 'Imported from SMS' && tx.type !== 'CREDIT' && (
                             <div className="text-[10px] text-gray-400 mt-1 italic pl-6">AI: {tx.firewallReason}</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className={`font-mono font-bold ${tx.type === 'CREDIT' ? 'text-success' : 'text-white'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </div>
                        {tx.firewallDecision && tx.type === 'DEBIT' && (
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
            <form onSubmit={handleAnalyze} className="space-y-4 flex-1">
                <div className="flex gap-2 mb-2 bg-background p-1 rounded-lg">
                    <button 
                        type="button"
                        onClick={() => setType('DEBIT')}
                        className={`flex-1 py-1 text-xs font-bold rounded ${type === 'DEBIT' ? 'bg-danger text-white' : 'text-gray-500'}`}
                    >
                        Expense
                    </button>
                    <button 
                        type="button"
                        onClick={() => setType('CREDIT')}
                        className={`flex-1 py-1 text-xs font-bold rounded ${type === 'CREDIT' ? 'bg-success text-white' : 'text-gray-500'}`}
                    >
                        Income
                    </button>
                </div>

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
                        placeholder={type === 'DEBIT' ? "What did you buy?" : "Source of income?"}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">CATEGORY</label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-background border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    >
                        {budgets.length > 0 ? budgets.map(b => (
                            <option key={b.category} value={b.category}>{b.category}</option>
                        )) : <option value="Uncategorized">Uncategorized</option>}
                        <option value="Income">Income</option>
                        <option value="Transfer">Transfer</option>
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
                                <span>{type === 'DEBIT' ? 'Check with Firewall' : 'Add Income'}</span>
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
