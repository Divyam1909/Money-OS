
import React, { useState } from 'react';
import { analyzeSmartSplit } from '../services/geminiService';
import { SplitResponse } from '../types';
import { Users, FileText, ArrowRight, Wand2, Link } from 'lucide-react';

const SmartSplit: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SplitResponse | null>(null);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
        const data = await analyzeSmartSplit(inputText);
        setResult(data);
    } catch (e) {
        console.error(e);
        alert("SmartSplit failed. Check API Key.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Input Section */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <span className="text-gray-500 font-mono text-lg">#</span>
            <Users className="text-primary" />
            <span>Group Finance Harmonizer</span>
        </h2>
        <p className="text-sm text-gray-400 mb-4">
            Paste a receipt, a UPI message, or just describe the event (e.g., "Lunch with Rahul and Anjali, I paid 1200 for pizza, Rahul paid 200 for drinks").
        </p>
        
        <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text here..."
            className="flex-1 bg-background border border-gray-600 rounded-xl p-4 resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4 font-mono text-sm"
        />
        
        <button
            onClick={handleProcess}
            disabled={isProcessing || !inputText}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
            {isProcessing ? (
                <span>Parsing Context...</span>
            ) : (
                <>
                    <Wand2 size={18} />
                    <span>Analyze & Split</span>
                </>
            )}
        </button>
      </div>

      {/* Result Section */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex flex-col overflow-hidden">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <span className="text-gray-500 font-mono text-lg">#</span>
            <FileText className="text-accent" />
            <span>Breakdown</span>
        </h2>
        
        {!result ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-center">
                <p>Results will appear here.</p>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                
                {/* Fairness Analysis */}
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-sm">
                    <span className="font-bold text-primary block mb-1">FAIRNESS AI:</span>
                    {result.fairnessAnalysis}
                </div>

                {/* Expenses List */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-gray-600 font-mono text-xs">#</span> Identified Expenses
                    </h3>
                    <div className="space-y-2">
                        {result.expenses.map((exp, i) => (
                            <div key={i} className="bg-background p-3 rounded-lg text-sm border border-gray-700">
                                <div className="flex justify-between font-bold">
                                    <span>{exp.item}</span>
                                    <span>₹{exp.cost}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Paid by <span className="text-white">{exp.paidBy}</span> • Split by {exp.sharedBy.join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settlements */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-gray-600 font-mono text-xs">#</span> Settlement Plan
                    </h3>
                    <div className="space-y-2">
                        {result.settlements.map((set, i) => (
                            <div key={i} className="flex items-center justify-between bg-success/10 border border-success/20 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold">{set.from}</span>
                                    <ArrowRight size={14} className="text-gray-500" />
                                    <span className="font-bold">{set.to}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="font-mono font-bold text-success">₹{set.amount}</span>
                                    <button className="p-1.5 bg-success text-black rounded hover:bg-emerald-400" title="Copy Payment Link">
                                        <Link size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SmartSplit;
