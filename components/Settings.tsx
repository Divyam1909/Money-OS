import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CreditCard, DollarSign, Activity } from 'lucide-react';
import { RecurringExpense } from '../types';
import { API_BASE_URL } from '../constants';

const Settings: React.FC = () => {
    const [income, setIncome] = useState<string>('');
    const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
    
    // New Recurring Item State
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDate, setNewDate] = useState('1');
    const [newFreq, setNewFreq] = useState<'Monthly' | 'Yearly' | 'Weekly'>('Monthly');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const token = localStorage.getItem('moneyos_token');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.settings) {
                setIncome(data.settings.monthlyIncome.toString());
                setRecurring(data.settings.recurringExpenses || []);
            }
        } catch (e) {
            console.error("Failed to load settings");
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('moneyos_token');
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    monthlyIncome: Number(income),
                    recurringExpenses: recurring
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage("System configuration updated successfully!");
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (e) {
            setMessage("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const addRecurring = () => {
        if (!newName || !newAmount) return;
        const newItem: RecurringExpense = {
            id: Date.now().toString(),
            name: newName,
            amount: Number(newAmount),
            date: Number(newDate),
            frequency: newFreq
        };
        setRecurring([...recurring, newItem]);
        setNewName('');
        setNewAmount('');
        setNewDate('1');
        setNewFreq('Monthly');
    };

    const removeRecurring = (id: string) => {
        setRecurring(recurring.filter(item => item.id !== id));
    };

    // Calculations
    const totalFixed = recurring.reduce((acc, item) => {
        if (item.frequency === 'Yearly') return acc + (item.amount / 12);
        if (item.frequency === 'Weekly') return acc + (item.amount * 4);
        return acc + item.amount;
    }, 0);

    const numIncome = Number(income) || 0;
    const freeCashFlow = numIncome - totalFixed;
    const healthScore = numIncome > 0 ? Math.round((freeCashFlow / numIncome) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
            {/* Configuration Form */}
            <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col overflow-y-auto">
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <Activity className="text-primary" />
                    <span>System Configuration</span>
                </h2>

                <div className="space-y-6">
                    {/* Income Section */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Monthly Inflow</label>
                        <div className="bg-background border border-gray-600 rounded-xl p-4 flex items-center space-x-4">
                            <div className="p-3 bg-success/10 rounded-lg text-success">
                                <DollarSign size={24} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Total Monthly Income</label>
                                <input 
                                    type="number" 
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    className="w-full bg-transparent text-xl font-bold outline-none placeholder-gray-600"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recurring Expenses Section */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Fixed Outflow (Autopay)</label>
                        <div className="bg-background border border-gray-600 rounded-xl p-4 mb-4">
                            <div className="flex gap-2 mb-2">
                                <input 
                                    className="flex-1 bg-surface border border-gray-700 rounded-lg p-2 text-sm outline-none focus:border-primary"
                                    placeholder="Name (e.g. Netflix)"
                                    value={newName} onChange={e => setNewName(e.target.value)}
                                />
                                <input 
                                    className="w-24 bg-surface border border-gray-700 rounded-lg p-2 text-sm outline-none focus:border-primary"
                                    placeholder="Amt"
                                    type="number"
                                    value={newAmount} onChange={e => setNewAmount(e.target.value)}
                                />
                                <select
                                    className="w-24 bg-surface border border-gray-700 rounded-lg p-2 text-xs outline-none focus:border-primary"
                                    value={newFreq} onChange={e => setNewFreq(e.target.value as any)}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                                    <option value="Weekly">Weekly</option>
                                </select>
                            </div>
                            <button 
                                onClick={addRecurring}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1"
                            >
                                <Plus size={14} /> <span>Add Recurring Expense</span>
                            </button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {recurring.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-gray-700">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-warning"></div>
                                        <div>
                                            <div className="font-bold text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.frequency}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="font-mono">₹{item.amount}</span>
                                        <button onClick={() => removeRecurring(item.id)} className="text-gray-500 hover:text-danger">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    {message && <div className="text-success text-center text-sm mb-2">{message}</div>}
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Update Financial Profile'}
                    </button>
                </div>
            </div>

            {/* Analysis Panel */}
            <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <DollarSign size={200} />
                </div>
                
                <h3 className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-sm z-10">Calculated Baseline</h3>

                <div className="space-y-6 z-10">
                    <div className="flex justify-between items-end border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Total Income</span>
                        <span className="text-2xl font-bold text-success">+ ₹{numIncome.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Fixed Obligations (Monthly Avg)</span>
                        <span className="text-2xl font-bold text-danger">- ₹{totalFixed.toFixed(0)}</span>
                    </div>
                    
                    <div className="bg-background/50 p-6 rounded-2xl border border-gray-600 mt-4">
                        <div className="text-sm text-gray-400 font-bold uppercase mb-1">Free Cash Flow (Discretionary)</div>
                        <div className="text-4xl font-bold text-white mb-2">₹{freeCashFlow.toFixed(0)}</div>
                        <div className="text-xs text-gray-500">
                            This is the actual amount available for your daily budgets (Food, Transport, etc.) after bills are paid.
                        </div>
                    </div>

                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-primary font-bold text-sm">Financial Health Score</span>
                             <span className="text-white font-bold">{healthScore}/100</span>
                         </div>
                         <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                             <div className={`h-full ${healthScore > 50 ? 'bg-success' : 'bg-danger'}`} style={{ width: `${healthScore}%` }}></div>
                         </div>
                         <p className="text-xs text-gray-400 mt-2">
                             {healthScore > 50 ? "Healthy margin. You have room to save." : "Tight budget. Review fixed expenses."}
                         </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;