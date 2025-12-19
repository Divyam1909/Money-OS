import React, { useState } from 'react';
import { Budget, BudgetsResponse, Transaction } from '../types';
import { runShiftBudget } from '../services/geminiService';
import { ArrowRight, RefreshCw, CheckCircle, Plus, Trash2, Edit2, X, Save, Loader } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface BudgetsProps {
    budgets: Budget[];
    transactions: Transaction[];
    token: string;
    onUpdate: () => void;
}

const Budgets: React.FC<BudgetsProps> = ({ budgets, transactions, token, onUpdate }) => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [suggestion, setSuggestion] = useState<BudgetsResponse | null>(null);

  // Manual Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');
  
  // Add New State
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleShiftBudget = async () => {
    setIsAdjusting(true);
    try {
        const result = await runShiftBudget(budgets, transactions.slice(0, 20)); 
        setSuggestion(result);
    } catch (e) {
        console.error(e);
        alert("Failed to run ShiftBudget. Check API Key.");
    } finally {
        setIsAdjusting(false);
    }
  };

  const applyChanges = async () => {
    if (!suggestion) return;
    setActionLoading('apply');
    
    const newBudgets = budgets.map(b => {
        const adj = suggestion.adjustments.find(a => a.category === b.category);
        return adj ? { ...b, limit: adj.newLimit } : b;
    });

    try {
        await fetch(`${API_BASE_URL}/api/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ budgets: newBudgets })
        });
        await onUpdate();
        setSuggestion(null);
    } catch (e) {
        alert("Failed to update budgets");
    } finally {
        setActionLoading(null);
    }
  };

  const deleteBudget = async (id: string) => {
      if (!id) return;
      if(!confirm("Are you sure you want to delete this budget category?")) return;
      
      setActionLoading(id);
      try {
          const res = await fetch(`${API_BASE_URL}/api/budgets/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
              await onUpdate();
          } else {
              alert("Delete failed. Server error.");
          }
      } catch (e) {
          console.error("Delete failed:", e);
          alert("Network error.");
      } finally {
          setActionLoading(null);
      }
  };

  const saveEdit = async (b: Budget) => {
      setActionLoading(b._id || 'edit');
      try {
          await fetch(`${API_BASE_URL}/api/budgets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ budgets: [{ ...b, limit: Number(editLimit) }] })
          });
          setEditingId(null);
          await onUpdate();
      } catch (e) {
          alert("Update failed");
      } finally {
          setActionLoading(null);
      }
  };

  const addNewBudget = async () => {
      if(!newCat || !newLimit) return;
      setActionLoading('add');
      try {
           await fetch(`${API_BASE_URL}/api/budgets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ budgets: [{ category: newCat, limit: Number(newLimit), spent: 0 }] })
          });
          setNewCat('');
          setNewLimit('');
          setShowAdd(false);
          await onUpdate();
      } catch (e) {
          alert("Add failed");
      } finally {
          setActionLoading(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-500 font-mono text-xl">#</span>
                <h2 className="text-2xl font-bold">ShiftBudget Engine</h2>
            </div>
            <p className="text-gray-400 text-sm">Adaptive budgeting based on your spending behavior.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowAdd(!showAdd)}
                className="bg-gray-700 hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all font-bold"
            >
                <Plus size={18} />
                <span>Add Budget</span>
            </button>
            <button 
                onClick={handleShiftBudget}
                disabled={isAdjusting}
                className="bg-accent hover:bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50 font-bold"
            >
                <RefreshCw size={18} className={isAdjusting ? "animate-spin" : ""} />
                <span>{isAdjusting ? 'Calculating...' : 'Run Auto-Adjust'}</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Budgets */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-gray-300 uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="text-gray-600 font-mono text-xs">#</span> Allocations
            </h3>
            
            {showAdd && (
                <div className="mb-4 p-3 bg-background border border-gray-600 rounded-xl flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
                    <input 
                        placeholder="Category Name" 
                        value={newCat} onChange={e => setNewCat(e.target.value)}
                        className="flex-1 bg-surface rounded p-2 text-sm outline-none"
                    />
                    <input 
                        type="number" placeholder="Limit" 
                        value={newLimit} onChange={e => setNewLimit(e.target.value)}
                        className="w-24 bg-surface rounded p-2 text-sm outline-none"
                    />
                    <button onClick={addNewBudget} disabled={actionLoading === 'add'} className="bg-success p-2 rounded text-black flex items-center justify-center">
                        {actionLoading === 'add' ? <Loader size={16} className="animate-spin"/> : <CheckCircle size={16} />}
                    </button>
                </div>
            )}

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {budgets.length === 0 && <p className="text-gray-500">No budgets set.</p>}
                {budgets.map((b) => {
                    const percent = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
                    const color = percent > 90 ? 'bg-danger' : percent > 70 ? 'bg-warning' : 'bg-success';
                    const isEditing = editingId === b._id;
                    const isLoading = actionLoading === b._id;

                    return (
                        <div key={b._id || b.category} className="group">
                            <div className="flex justify-between text-sm mb-1 items-center">
                                <span className="font-bold">{b.category}</span>
                                <div className="flex items-center gap-3">
                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                            <input 
                                                autoFocus
                                                type="number" 
                                                value={editLimit} 
                                                onChange={e => setEditLimit(e.target.value)}
                                                className="w-20 bg-background border border-gray-600 rounded px-1 py-0.5 text-right font-mono"
                                            />
                                            <button onClick={() => saveEdit(b)} className="text-success hover:text-emerald-400">
                                                {isLoading ? <Loader size={14} className="animate-spin"/> : <Save size={14} />}
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <span className="font-mono text-gray-400">
                                            ₹{b.spent} / <span className="text-white">₹{b.limit}</span>
                                        </span>
                                    )}
                                    
                                    {!isEditing && (
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                                            <button onClick={() => { setEditingId(b._id!); setEditLimit(b.limit.toString()); }} className="text-gray-500 hover:text-primary">
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => deleteBudget(b._id!)} disabled={isLoading} className="text-gray-500 hover:text-danger">
                                                {isLoading ? <Loader size={12} className="animate-spin"/> : <Trash2 size={12} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                <div className="animate-in fade-in slide-in-from-right duration-300 w-full">
                    <h3 className="font-bold mb-2 text-accent flex items-center gap-2">
                        <span className="text-gray-600 font-mono text-xs">#</span> PROPOSED CHANGES
                    </h3>
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
                        disabled={actionLoading === 'apply'}
                        className="w-full bg-success/20 hover:bg-success/30 text-success border border-success/30 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                        {actionLoading === 'apply' ? <Loader size={18} className="animate-spin"/> : <CheckCircle size={18} />}
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