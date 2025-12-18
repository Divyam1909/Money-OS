
import React, { useState } from 'react';
import { Target, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { analyzeGoal } from '../services/geminiService';
import { Goal, GoalAnalysisResponse, Budget } from '../types';
import { API_BASE_URL } from '../constants';

interface GoalsProps {
    goals: Goal[];
    budgets: Budget[];
    token: string;
    onUpdate: () => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, budgets, token, onUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [analysis, setAnalysis] = useState<GoalAnalysisResponse | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
        const result = await analyzeGoal(name, Number(target), 0, deadline, budgets);
        setAnalysis(result);
    } catch (e) {
        console.error(e);
        alert("Failed to analyze goal.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const addGoal = async () => {
    if (!analysis) return;
    const newGoal = {
        id: Date.now().toString(),
        name,
        targetAmount: Number(target),
        savedAmount: 0,
        deadline,
        status: analysis.feasibility === 'Impossible' || analysis.feasibility === 'Hard' ? 'At Risk' : 'On Track'
    };

    try {
        await fetch(`${API_BASE_URL}/api/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ goal: newGoal })
        });
        onUpdate();
        setAnalysis(null);
        setName('');
        setTarget('');
        setDeadline('');
    } catch (e) {
        alert("Failed to save goal.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Existing Goals */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <span className="text-gray-500 font-mono text-lg">#</span>
            <Target className="text-primary" />
            <span>Your Savings Goals</span>
        </h2>
        <div className="space-y-4">
            {goals.length === 0 && <p className="text-gray-500">No active goals.</p>}
            {goals.map(goal => {
                const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                return (
                    <div key={goal.id} className="bg-background border border-gray-700 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg">{goal.name}</h3>
                                <div className="text-xs text-gray-500">Target: {goal.deadline}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded border ${
                                goal.status === 'On Track' ? 'border-success text-success bg-success/10' : 'border-danger text-danger bg-danger/10'
                            }`}>
                                {goal.status}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">₹{goal.savedAmount} saved</span>
                            <span className="font-bold">₹{goal.targetAmount}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all" style={{ width: `${percent}%` }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* New Goal Wizard */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <span className="text-gray-500 font-mono text-lg">#</span>
            <Calculator className="text-accent" />
            <span>Goal Planner</span>
        </h2>
        
        {!analysis ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">GOAL NAME</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-gray-600 rounded-xl p-2 outline-none" placeholder="e.g. Europe Trip" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">TARGET AMOUNT (₹)</label>
                    <input type="number" required value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-background border border-gray-600 rounded-xl p-2 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DEADLINE</label>
                    <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-background border border-gray-600 rounded-xl p-2 outline-none" />
                </div>
                <button type="submit" disabled={isAnalyzing} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 transition-all">
                    {isAnalyzing ? 'Calculating Impact...' : 'Analyze Feasibility'}
                </button>
            </form>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom duration-300 flex-1 flex flex-col">
                <div className="bg-background border border-gray-700 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm font-bold uppercase flex items-center gap-2">
                            <span className="text-gray-600 font-mono text-[10px]">#</span> Verdict
                        </span>
                        <span className={`font-bold ${analysis.feasibility === 'Impossible' ? 'text-danger' : 'text-success'}`}>{analysis.feasibility}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">₹{analysis.monthlySavingsNeeded}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                    <p className="text-xs text-gray-500">Required savings rate</p>
                </div>

                <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl mb-4 flex-1">
                     <h4 className="font-bold text-warning text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14} /> AI Suggestions</h4>
                     <p className="text-sm leading-relaxed">{analysis.suggestions}</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setAnalysis(null)} className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 font-bold text-sm">Cancel</button>
                    <button onClick={addGoal} className="flex-1 py-3 rounded-xl bg-success hover:bg-emerald-600 text-black font-bold text-sm flex items-center justify-center gap-2">
                        <CheckCircle size={16} /> Save Goal
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
