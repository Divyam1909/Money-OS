
import { Budget, Subscription, Transaction, Goal } from "./types";

// ------------------------------------------------------------------
// 🔧 DEPLOYMENT CONFIGURATION
// ------------------------------------------------------------------
// Replace this URL with your own Render Backend URL after deployment.
export const API_BASE_URL = "https://sms-parser-qkzu.onrender.com";
// ------------------------------------------------------------------

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

export const INITIAL_GOALS: Goal[] = [];

export const MOCK_AUTOPILOT_LOGS = [
  { id: 1, action: "System Initialized", reason: "Welcome to MoneyOS." }
];
