import React, { useState } from 'react';
import { INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from '../constants';
import { Budget, BudgetsResponse } from '../types';
import { runShiftBudget } from '../services/geminiService';
import { ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [suggestion, setSuggestion] = useState<BudgetsResponse | null>(null);

  const handleShiftBudget = async () => {
    setIsAdjusting(true);
    try {
        const result = await runShiftBudget(budgets, INITIAL_TRANSACTIONS);
        setSuggestion(result);
    } catch (e) {
        console.error(e);
        alert("Failed to run ShiftBudget. Check API Key.");
    } finally {
        setIsAdjusting(false);
    }
  };

  const applyChanges = () => {
    if (!suggestion) return;
    
    const newBudgets = budgets.map(b => {
        const adj = suggestion.adjustments.find(a => a.category === b.category);
        return adj ? { ...b, limit: adj.newLimit } : b;
    });
    
    setBudgets(newBudgets);
    setSuggestion(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold">ShiftBudget Engine</h2>
            <p className="text-gray-400 text-sm">Adaptive budgeting based on your spending behavior.</p>
        </div>
        <button 
            onClick={handleShiftBudget}
            disabled={isAdjusting}
            className="bg-accent hover:bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
        >
            <RefreshCw size={18} className={isAdjusting ? "animate-spin" : ""} />
            <span>{isAdjusting ? 'Calculating...' : 'Run Auto-Adjust'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Budgets */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-gray-300">CURRENT WEEKLY ALLOCATION</h3>
            <div className="space-y-4">
                {budgets.map((b) => {
                    const percent = Math.min((b.spent / b.limit) * 100, 100);
                    const color = percent > 90 ? 'bg-danger' : percent > 70 ? 'bg-warning' : 'bg-success';
                    
                    return (
                        <div key={b.category}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{b.category}</span>
                                <span className="font-mono text-gray-400">{b.spent} / {b.limit}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-700 rounded-full">
                                <div className={`h-2 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Adjustments Panel */}
        <div className={`bg-surface border border-gray-700 rounded-2xl p-6 relative ${!suggestion ? 'flex items-center justify-center' : ''}`}>
            {!suggestion ? (
                <div className="text-center text-gray-500">
                    <RefreshCw size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Run Auto-Adjust to see AI recommendations.</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                    <h3 className="font-bold mb-2 text-accent">PROPOSED CHANGES</h3>
                    <p className="text-sm text-gray-400 mb-4 italic">"{suggestion.summary}"</p>
                    
                    <div className="space-y-3 mb-6">
                        {suggestion.adjustments.map((adj, idx) => {
                            const oldLimit = budgets.find(b => b.category === adj.category)?.limit || 0;
                            const diff = adj.newLimit - oldLimit;
                            
                            return (
                                <div key={idx} className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-gray-700">
                                    <div>
                                        <div className="font-medium text-sm">{adj.category}</div>
                                        <div className="text-xs text-gray-500">{adj.reason}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500 line-through text-xs">₹{oldLimit}</span>
                                        <ArrowRight size={14} className="text-gray-500" />
                                        <span className={`font-mono font-bold ${diff > 0 ? 'text-success' : 'text-warning'}`}>
                                            ₹{adj.newLimit}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        onClick={applyChanges}
                        className="w-full bg-success/20 hover:bg-success/30 text-success border border-success/30 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                        <CheckCircle size={18} />
                        <span>Apply New Budget</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
