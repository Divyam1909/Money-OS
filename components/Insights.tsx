import React, { useState } from 'react';
import { generateMonthlyInsights } from '../services/geminiService';
import { InsightReport } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from '../constants';
import { BrainCircuit, TrendingUp, AlertOctagon, Lightbulb, Radar, ArrowRight } from 'lucide-react';

const Insights: React.FC = () => {
  const [report, setReport] = useState<InsightReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const data = await generateMonthlyInsights(INITIAL_TRANSACTIONS, INITIAL_BUDGETS);
        setReport(data);
    } catch (e) {
        console.error(e);
        alert("Failed to generate insights. Please check your API key.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl p-8 text-center shrink-0">
            <h1 className="text-3xl font-bold mb-2">System Insights</h1>
            <p className="text-gray-300">Deep behavioral analysis of your financial life.</p>
        </div>

        {!report ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 bg-surface/50 border border-gray-700/50 rounded-2xl m-4">
                <div className="relative">
                    <div className={`absolute inset-0 bg-accent/20 blur-xl rounded-full ${loading ? 'animate-pulse' : ''}`}></div>
                    <BrainCircuit size={80} className={`relative z-10 text-accent ${loading ? 'animate-spin' : ''}`} />
                </div>
                
                <div className="text-center max-w-md px-6">
                    <h3 className="text-xl font-bold mb-2">Ready to Analyze</h3>
                    <p className="text-gray-400 mb-6">
                        MoneyOS will scan your recent transactions, budget adherence, and spending patterns to generate a personalized behavioral report.
                    </p>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center mx-auto space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span>Processing Data...</span>
                        ) : (
                            <>
                                <Radar size={20} />
                                <span>Run System Analysis</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                {/* Spending Habits */}
                <div className="bg-surface border border-gray-700 rounded-2xl p-6 hover:border-primary/50 transition-colors">
                    <h3 className="text-primary font-bold mb-4 flex items-center gap-2 text-sm tracking-wider uppercase">
                        <TrendingUp size={18} /> Spending Habits
                    </h3>
                    <p className="leading-relaxed text-gray-300 text-sm">{report.spendingHabits}</p>
                </div>

                {/* Budget Drift */}
                <div className="bg-surface border border-gray-700 rounded-2xl p-6 hover:border-danger/50 transition-colors">
                    <h3 className="text-danger font-bold mb-4 flex items-center gap-2 text-sm tracking-wider uppercase">
                        <AlertOctagon size={18} /> Budget Drift
                    </h3>
                    <p className="leading-relaxed text-gray-300 text-sm">{report.budgetDrift}</p>
                </div>

                {/* Behavioral Notes */}
                <div className="bg-surface border border-gray-700 rounded-2xl p-6 hover:border-warning/50 transition-colors">
                     <h3 className="text-warning font-bold mb-4 flex items-center gap-2 text-sm tracking-wider uppercase">
                        <Lightbulb size={18} /> Behavioral Notes
                    </h3>
                    <p className="leading-relaxed text-gray-300 text-sm">{report.behavioralNotes}</p>
                </div>

                {/* Identified Triggers - Enhanced UI */}
                <div className="bg-surface border border-gray-700 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Radar size={80} />
                    </div>
                    <h3 className="text-accent font-bold mb-4 flex items-center gap-2 text-sm tracking-wider uppercase">
                        <Radar size={18} /> Identified Triggers
                    </h3>
                    
                    <div className="space-y-3 relative z-10">
                        {report.triggers.map((trigger, i) => (
                            <div key={i} className="flex items-start space-x-3 bg-background/60 p-3 rounded-lg border border-gray-700/50 hover:border-accent/50 transition-all">
                                <ArrowRight size={16} className="text-accent mt-1 shrink-0" />
                                <span className="text-sm text-gray-200">{trigger}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Insights;