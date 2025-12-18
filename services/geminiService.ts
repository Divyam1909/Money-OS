
import { GoogleGenAI, Type } from "@google/genai";
import { Budget, FirewallResponse, Persona, Transaction, BudgetsResponse, SplitResponse, TimeValueAnalysis, GoalAnalysisResponse, InsightReport } from "../types";

const getAI = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const checkTransactionWithFirewall = async (
    transaction: Omit<Transaction, 'id' | 'date' | 'firewallDecision'>,
    currentBudgets: Budget[],
    persona: Persona
): Promise<FirewallResponse> => {
    const ai = getAI();
    
    const budgetContext = currentBudgets.map(b => `${b.category}: Spent ${b.spent}/${b.limit}`).join(', ');
    
    const prompt = `
        You are a financial firewall with the persona: ${persona}.
        
        Persona definitions:
        - STRICT: Aggressively blocks overspending. Very critical.
        - BALANCED: Nudges but allows reasonable expenses. Educational.
        - CHILL: Humorous, relaxed, but points out big mistakes.
        
        Context:
        Current Budgets: ${budgetContext}
        Transaction Attempt: Spend ${transaction.amount} on ${transaction.description} (${transaction.category}).
        
        Analyze this transaction based on the persona and budget status.
        Return a decision (ALLOW, CAUTION, BLOCK), a reason, and a specific future impact statement (e.g., "This delays your vacation saving").
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    decision: { type: Type.STRING, enum: ['ALLOW', 'CAUTION', 'BLOCK'] },
                    reason: { type: Type.STRING },
                    futureImpact: { type: Type.STRING }
                },
                required: ['decision', 'reason', 'futureImpact']
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as FirewallResponse;
};

export const runShiftBudget = async (
    currentBudgets: Budget[],
    recentTransactions: Transaction[]
): Promise<BudgetsResponse> => {
    const ai = getAI();

    const prompt = `
        You are the ShiftBudget Auto-Adjustment Engine.
        Analyze the spending patterns and suggest budget updates for next week.
        
        Current Budgets: ${JSON.stringify(currentBudgets)}
        Recent Transactions: ${JSON.stringify(recentTransactions.slice(0, 10))}
        
        Rules:
        - Decrease budgets where spending is consistently low.
        - Increase budgets where essential spending is high.
        - Suggest moving funds to savings if possible.
        
        Output a summary of changes and a list of specific adjustments.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    adjustments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                category: { type: Type.STRING },
                                newLimit: { type: Type.NUMBER },
                                reason: { type: Type.STRING }
                            },
                            required: ['category', 'newLimit', 'reason']
                        }
                    }
                },
                required: ['summary', 'adjustments']
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as BudgetsResponse;
};

export const analyzeSmartSplit = async (inputText: string): Promise<SplitResponse> => {
    const ai = getAI();

    const prompt = `
        You are SmartSplit AI. Parse the following text (receipt content, UPI message, or natural language description) to determine shared expenses.
        
        Input Text: "${inputText}"
        
        Tasks:
        1. Identify expenses, who paid, and who shares it. If shared by "all", assume all names found in text share it.
        2. Calculate settlements (who owes whom) to minimize transaction count.
        3. Provide a fairness analysis comment.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    expenses: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                item: { type: Type.STRING },
                                cost: { type: Type.NUMBER },
                                paidBy: { type: Type.STRING },
                                sharedBy: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ['id', 'item', 'cost', 'paidBy', 'sharedBy']
                        }
                    },
                    settlements: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                from: { type: Type.STRING },
                                to: { type: Type.STRING },
                                amount: { type: Type.NUMBER }
                            },
                            required: ['from', 'to', 'amount']
                        }
                    },
                    fairnessAnalysis: { type: Type.STRING }
                },
                required: ['expenses', 'settlements', 'fairnessAnalysis']
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as SplitResponse;
};

export const analyzeTimeValue = async (
    name: string,
    cost: number,
    hours: number,
    frequency: string
): Promise<TimeValueAnalysis> => {
    const ai = getAI();

    const prompt = `
        Analyze the value-for-money of this subscription/item.
        Item: ${name}
        Cost: ${cost} (${frequency})
        Usage: ${hours} hours/month
        
        Calculate the cost per hour of engagement.
        Provide a "Time-Value Score" (0-100, where 100 is excellent value).
        Provide a verdict and actionable advice (e.g., "Cancel", "Keep", "Downgrade plan").
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    verdict: { type: Type.STRING },
                    actionableAdvice: { type: Type.STRING }
                },
                required: ['score', 'verdict', 'actionableAdvice']
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as TimeValueAnalysis;
};

export const analyzeGoal = async (
    name: string,
    target: number,
    saved: number,
    deadline: string,
    currentBudgets: Budget[]
): Promise<GoalAnalysisResponse> => {
    const ai = getAI();
    const budgetSummary = currentBudgets.map(b => `${b.category} limit: ${b.limit}`).join(', ');

    const prompt = `
        Analyze this financial goal:
        Goal: ${name}
        Target: ${target}
        Saved So Far: ${saved}
        Deadline: ${deadline}
        Current Date: ${new Date().toISOString().split('T')[0]}
        
        Current Budget Constraints: ${budgetSummary}
        
        1. Calculate monthly savings needed.
        2. Assess feasibility (Easy, Moderate, Hard, Impossible).
        3. Suggest specific budget cuts to achieve this.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    feasibility: { type: Type.STRING },
                    monthlySavingsNeeded: { type: Type.NUMBER },
                    suggestions: { type: Type.STRING }
                },
                required: ['feasibility', 'monthlySavingsNeeded', 'suggestions']
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as GoalAnalysisResponse;
};

export const generateMonthlyInsights = async (
    transactions: Transaction[],
    budgets: Budget[]
): Promise<InsightReport> => {
    const ai = getAI();

    const prompt = `
        Generate a "System Insights" report for the user based on their data.
        Transactions: ${JSON.stringify(transactions.slice(0, 15))}
        Budgets: ${JSON.stringify(budgets)}
        
        Identify:
        1. Spending habits/trends.
        2. Budget drift (where they consistently overspend).
        3. Emotional triggers (e.g., impulse buys on weekends).
        4. Behavioral behavioral notes.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    spendingHabits: { type: Type.STRING },
                    budgetDrift: { type: Type.STRING },
                    triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    behavioralNotes: { type: Type.STRING }
                },
                required: ['spendingHabits', 'budgetDrift', 'triggers', 'behavioralNotes']
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as InsightReport;
};
