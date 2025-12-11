import { Budget, Subscription, Transaction, Goal } from "./types";

export const INITIAL_BUDGETS: Budget[] = [
  { category: 'Food & Dining', limit: 10000, spent: 4500 },
  { category: 'Transportation', limit: 5000, spent: 1200 },
  { category: 'Entertainment', limit: 3000, spent: 2800 }, // Near limit
  { category: 'Shopping', limit: 5000, spent: 1500 },
  { category: 'Utilities', limit: 4000, spent: 3800 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 450, category: 'Food & Dining', description: 'Lunch at Cafe', date: '2023-10-24', firewallDecision: 'ALLOW', firewallReason: 'Within daily allowance.' },
  { id: '2', amount: 1200, category: 'Shopping', description: 'New Sneakers', date: '2023-10-23', firewallDecision: 'CAUTION', firewallReason: 'Slightly high for mid-month.' },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix', cost: 649, frequency: 'Monthly', hoursUsedPerMonth: 10 },
  { id: '2', name: 'Gym Membership', cost: 2000, frequency: 'Monthly', hoursUsedPerMonth: 4 },
  { id: '3', name: 'Spotify', cost: 119, frequency: 'Monthly', hoursUsedPerMonth: 40 },
  { id: '4', name: 'Adobe CC', cost: 4200, frequency: 'Monthly', hoursUsedPerMonth: 2 },
];

export const INITIAL_GOALS: Goal[] = [
  { id: '1', name: 'Trip to Goa', targetAmount: 25000, savedAmount: 5000, deadline: '2023-12-25', status: 'On Track' },
  { id: '2', name: 'New Laptop', targetAmount: 80000, savedAmount: 15000, deadline: '2024-03-01', status: 'At Risk' },
];

export const MOCK_AUTOPILOT_LOGS = [
  { id: 1, action: "Moved ₹300 to emergency fund", reason: "Under-spending in Transport detected." },
  { id: 2, action: "Flagged impulse purchase", reason: "₹1200 sneakers tagged as non-essential." },
  { id: 3, action: "Reminder: Pay Electricity", reason: "Due in 2 days to optimize cashflow." },
];