
import { Budget, Subscription, Transaction, Goal } from "./types";

// ------------------------------------------------------------------
// 🔧 DEPLOYMENT CONFIGURATION
// ------------------------------------------------------------------
// Only one URL is needed now!
export const API_BASE_URL = "https://sms-backend-production-cad9.up.railway.app";
// ------------------------------------------------------------------

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

export const INITIAL_GOALS: Goal[] = [];

export const MOCK_AUTOPILOT_LOGS = [
  { id: 1, action: "System Initialized", reason: "MoneyOS kernel is now active." },
  { id: 2, action: "Firewall Active", reason: "Spending protection enabled." }
];
