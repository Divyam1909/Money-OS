
export type Persona = 'STRICT' | 'BALANCED' | 'CHILL';

export type FirewallDecision = 'ALLOW' | 'CAUTION' | 'BLOCK';

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  date: number; // Day of month (1-31)
}

export interface UserProfile {
  monthlyIncome: number;
  currency: string;
  recurringExpenses: RecurringExpense[];
  currentBalance?: number;
  onboardingComplete?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  firewallDecision?: FirewallDecision;
  firewallReason?: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  frequency: 'Monthly' | 'Yearly';
  hoursUsedPerMonth: number;
}

export interface SplitExpense {
  id: string;
  item: string;
  cost: number;
  paidBy: string;
  sharedBy: string[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  status: 'On Track' | 'At Risk' | 'Achieved';
}

export interface FirewallResponse {
  decision: FirewallDecision;
  reason: string;
  futureImpact: string;
}

export interface BudgetsResponse {
    adjustments: Array<{
        category: string;
        newLimit: number;
        reason: string;
    }>;
    summary: string;
}

export interface SplitResponse {
    expenses: SplitExpense[];
    settlements: Settlement[];
    fairnessAnalysis: string;
}

export interface TimeValueAnalysis {
    score: number;
    verdict: string;
    actionableAdvice: string;
}

export interface GoalAnalysisResponse {
    feasibility: string;
    monthlySavingsNeeded: number;
    suggestions: string;
}

export interface InsightReport {
    spendingHabits: string;
    budgetDrift: string;
    triggers: string[];
    behavioralNotes: string;
}
