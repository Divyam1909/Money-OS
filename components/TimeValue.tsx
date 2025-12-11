
import React, { useState } from 'react';
import { analyzeTimeValue } from '../services/geminiService';
import { TimeValueAnalysis, UserProfile } from '../types';
import { Clock, TrendingDown, Star, Package, Monitor } from 'lucide-react';

interface TimeValueProps {
    userSettings: UserProfile | null;
}

const TimeValue: React.FC<TimeValueProps> = ({ userSettings }) => {
  const [activeTab, setActiveTab] = useState<'subs' | 'items'>('subs');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TimeValueAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Custom Item State
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [itemUsage, setItemUsage] = useState('');
  const [itemResult, setItemResult] = useState<TimeValueAnalysis | null>(null);

  // Use real data or empty
  const subscriptions = userSettings?.recurringExpenses || [];

  const handleAnalyzeSub = async (subId: string) => {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;
    
    setSelectedSubId(subId);
    setLoading(true);
    setAnalysis(null);
    
    try {
        // Assume simplified hours if not tracked
        const hoursEstimated = sub.frequency === 'Yearly' ? 10 : 20; 
        const result = await analyzeTimeValue(sub.name, sub.amount, hoursEstimated, sub.frequency);
        setAnalysis(result);
    } catch (e) {
        console.error(e);
        alert("Analysis failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleAnalyzeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const result = await analyzeTimeValue(itemName, Number(itemCost), Number(itemUsage), 'One-time Purchase');
        setItemResult(result);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const selectedSub = subscriptions.find(s => s.id === selectedSubId);

  return (
    <div className="space-y-6">
        {/* Tab Switcher */}
        <div className="flex bg-surface p-1 rounded-xl w-full md:w-fit border border-gray-700">
            <button 
                onClick={() => setActiveTab('subs')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'subs' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
                <Monitor size={16} /> Subscriptions
            </button>
            <button 
                onClick={() => setActiveTab('items')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'items' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
                <Package size={16} /> One-Time Items
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            {activeTab === 'subs' ? (
                <>
                    {/* List */}
                    <div className="bg-surface border border-gray-700 rounded-2xl p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                            <Clock className="text-warning" />
                            <span>Active Subscriptions</span>
                        </h2>
                        {subscriptions.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                <p>No recurring expenses found.</p>
                                <p className="text-xs mt-2">Add them in Settings or re-run setup.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {subscriptions.map(sub => {
                                    const isSelected = selectedSubId === sub.id;

                                    return (
                                        <div 
                                            key={sub.id} 
                                            onClick={() => handleAnalyzeSub(sub.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                isSelected 
                                                ? 'bg-primary/20 border-primary' 
                                                : 'bg-background border-gray-700 hover:border-gray-500'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{sub.name}</h3>
                                                <div className="text-right">
                                                    <div className="font-mono font-bold">₹{sub.amount}</div>
                                                    <div className="text-xs text-gray-500">{sub.frequency}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-400">
                                                <span>Click to analyze value</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
                        {!selectedSubId ? (
                            <div className="text-center text-gray-500">
                                <TrendingDown size={48} className="mx-auto mb-2 opacity-20" />
                                <p>Select a subscription to analyze its efficiency.</p>
                            </div>
                        ) : loading ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p>Calculating value metrics...</p>
                            </div>
                        ) : analysis && selectedSub ? (
                            <div className="w-full h-full flex flex-col animate-in fade-in zoom-in duration-300">
                                <div className="mb-6 text-center">
                                    <h2 className="text-2xl font-bold mb-1">{selectedSub.name}</h2>
                                    <div className="text-gray-400">Value Score</div>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className={`relative w-40 h-40 rounded-full border-8 flex items-center justify-center ${
                                        analysis.score > 70 ? 'border-success text-success' : 
                                        analysis.score > 40 ? 'border-warning text-warning' : 'border-danger text-danger'
                                    }`}>
                                        <span className="text-4xl font-bold">{analysis.score}</span>
                                    </div>
                                </div>

                                <div className="bg-background/50 rounded-xl p-4 border border-gray-700 mb-4">
                                    <h4 className="font-bold text-sm text-gray-400 mb-2 uppercase">Verdict</h4>
                                    <p className="font-medium text-lg">{analysis.verdict}</p>
                                </div>

                                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 flex-1">
                                    <h4 className="font-bold text-sm text-primary mb-2 uppercase flex items-center gap-2">
                                        <Star size={14} /> Advice
                                    </h4>
                                    <p className="text-sm leading-relaxed">{analysis.actionableAdvice}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </>
            ) : (
                <>
                    {/* Item Input */}
                     <div className="bg-surface border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                            <Package className="text-accent" />
                            <span>Cost-Per-Use Calculator</span>
                        </h2>
                        <form onSubmit={handleAnalyzeItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">ITEM NAME</label>
                                <input 
                                    type="text" 
                                    value={itemName} onChange={e => setItemName(e.target.value)}
                                    className="w-full bg-background border border-gray-600 rounded-xl p-2 outline-none focus:border-accent"
                                    placeholder="e.g. Gaming PC, Winter Jacket"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">TOTAL COST (₹)</label>
                                <input 
                                    type="number" 
                                    value={itemCost} onChange={e => setItemCost(e.target.value)}
                                    className="w-full bg-background border border-gray-600 rounded-xl p-2 outline-none focus:border-accent"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">USAGE (HOURS/MONTH)</label>
                                <input 
                                    type="number" 
                                    value={itemUsage} onChange={e => setItemUsage(e.target.value)}
                                    className="w-full bg-background border border-gray-600 rounded-xl p-2 outline-none focus:border-accent"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading || !itemName}
                                className="w-full bg-accent hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                {loading ? 'Analyzing...' : 'Calculate Efficiency'}
                            </button>
                        </form>
                     </div>

                     {/* Item Result */}
                     <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex items-center justify-center">
                        {!itemResult ? (
                            <div className="text-center text-gray-500">
                                <Package size={48} className="mx-auto mb-2 opacity-20" />
                                <p>Enter details to check if it's worth it.</p>
                            </div>
                        ) : (
                            <div className="w-full animate-in fade-in zoom-in">
                                <div className="text-center mb-6">
                                    <div className="text-6xl font-bold mb-2">{itemResult.score}</div>
                                    <div className="text-gray-400 uppercase tracking-widest text-xs">Value Score</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-background p-4 rounded-xl border border-gray-700">
                                        <div className="text-gray-400 text-xs font-bold uppercase mb-1">Verdict</div>
                                        <div className="text-lg">{itemResult.verdict}</div>
                                    </div>
                                    <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                                        <div className="text-accent text-xs font-bold uppercase mb-1">Suggestion</div>
                                        <div className="text-sm">{itemResult.actionableAdvice}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                     </div>
                </>
            )}
        </div>
    </div>
  );
};

export default TimeValue;
