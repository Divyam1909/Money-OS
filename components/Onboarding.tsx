import React, { useState } from 'react';
import { ArrowRight, DollarSign, Wallet, Calendar, CheckCircle } from 'lucide-react';
import { RecurringExpense, Budget } from '../types';
import { API_BASE_URL } from '../constants';

interface OnboardingProps {
    token: string;
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ token, onComplete }) => {
    const [step, setStep] = useState(1);
    const [income, setIncome] = useState('');
    const [incomeFreq, setIncomeFreq] = useState('Monthly'); // Monthly, Yearly
    const [balance, setBalance] = useState('');
    const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
    
    // Recurring Form
    const [recName, setRecName] = useState('');
    const [recAmount, setRecAmount] = useState('');
    const [recFreq, setRecFreq] = useState<'Monthly' | 'Yearly' | 'Weekly'>('Monthly');

    const [loading, setLoading] = useState(false);

    const addRecurring = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recName || !recAmount) return;
        setRecurring([...recurring, {
            id: Date.now().toString(),
            name: recName,
            amount: Number(recAmount),
            date: 1,
            frequency: recFreq
        }]);
        setRecName('');
        setRecAmount('');
        setRecFreq('Monthly');
    };

    const finishOnboarding = async () => {
        setLoading(true);
        try {
            // Calculate Monthly Normalized Income for Backend
            let monthlyIncomeVal = Number(income);
            if (incomeFreq === 'Yearly') monthlyIncomeVal = monthlyIncomeVal / 12;

            // Generate basic 50/30/20 style budgets
            const initialBudgets: Budget[] = [
                { category: 'Food & Dining', limit: monthlyIncomeVal * 0.15, spent: 0 },
                { category: 'Transportation', limit: monthlyIncomeVal * 0.10, spent: 0 },
                { category: 'Entertainment', limit: monthlyIncomeVal * 0.05, spent: 0 },
                { category: 'Shopping', limit: monthlyIncomeVal * 0.10, spent: 0 },
                { category: 'Utilities', limit: monthlyIncomeVal * 0.10, spent: 0 },
            ];

            const res = await fetch(`${API_BASE_URL}/api/onboarding`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    monthlyIncome: monthlyIncomeVal,
                    currentBalance: Number(balance),
                    recurringExpenses: recurring,
                    initialBudgets: initialBudgets
                })
            });
            
            if (res.ok) {
                onComplete();
            } else {
                alert("Setup failed. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-surface border border-gray-700 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary mb-2">Welcome to MoneyOS</h1>
                    <p className="text-gray-400">Let's calibrate your financial operating system.</p>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 bg-background/50 p-4 rounded-xl border border-gray-600">
                            <DollarSign className="text-success" size={28} />
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">INCOME</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={income}
                                        onChange={e => setIncome(e.target.value)}
                                        placeholder="50000"
                                        className="flex-1 bg-transparent text-xl font-bold outline-none"
                                    />
                                    <select 
                                        value={incomeFreq}
                                        onChange={e => setIncomeFreq(e.target.value)}
                                        className="bg-gray-700 text-sm rounded-lg px-2 outline-none"
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                         <div className="flex items-center space-x-4 bg-background/50 p-4 rounded-xl border border-gray-600">
                            <Wallet className="text-accent" size={28} />
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">CURRENT BANK BALANCE</label>
                                <input 
                                    type="number" 
                                    value={balance}
                                    onChange={e => setBalance(e.target.value)}
                                    placeholder="15000"
                                    className="w-full bg-transparent text-xl font-bold outline-none"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            disabled={!income || !balance}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                         <div className="text-center mb-4">
                             <Calendar className="mx-auto text-warning mb-2" size={32} />
                             <h3 className="text-lg font-bold">Fixed Expenses</h3>
                             <p className="text-xs text-gray-400">Rent, Netflix, Gym, etc.</p>
                         </div>

                         <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                             {recurring.map((item, idx) => (
                                 <div key={idx} className="flex justify-between items-center p-3 bg-background rounded-lg border border-gray-700">
                                     <span>{item.name}</span>
                                     <div className="flex items-center gap-2">
                                         <span className="font-mono">₹{item.amount}</span>
                                         <span className="text-xs bg-gray-700 px-1 rounded">{item.frequency}</span>
                                     </div>
                                 </div>
                             ))}
                             {recurring.length === 0 && <div className="text-center text-gray-500 text-sm py-4">No recurring expenses added.</div>}
                         </div>

                         <div className="flex gap-2">
                             <input 
                                value={recName} onChange={e => setRecName(e.target.value)}
                                placeholder="Name"
                                className="flex-1 bg-background border border-gray-600 rounded-lg p-2 text-sm outline-none"
                             />
                             <input 
                                type="number"
                                value={recAmount} onChange={e => setRecAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-20 bg-background border border-gray-600 rounded-lg p-2 text-sm outline-none"
                             />
                             <select 
                                value={recFreq} 
                                onChange={(e) => setRecFreq(e.target.value as any)}
                                className="w-24 bg-background border border-gray-600 rounded-lg p-2 text-xs outline-none"
                             >
                                <option value="Monthly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                                <option value="Weekly">Weekly</option>
                             </select>
                             <button onClick={addRecurring} className="bg-gray-700 hover:bg-white hover:text-black p-2 rounded-lg font-bold">+</button>
                         </div>

                         <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-bold text-sm">Back</button>
                            <button 
                                onClick={finishOnboarding}
                                disabled={loading}
                                className="flex-[2] bg-success hover:bg-emerald-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                {loading ? 'Setting up...' : 'Finish Setup'} <CheckCircle size={18} />
                            </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;