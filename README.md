
# MoneyOS - AI Financial Operating System

## Feature Checklist

### 🔥 A. Dashboard (Mission Control)
- [x] Savings Health Indicator (Green/Yellow/Red)
- [x] Upcoming Bills & Alerts
- [x] Summary of Recent Autopilot Actions
- [x] Quick Spending Snapshot (weekly/monthly)
- [x] Group Expenses Overview (from SmartSplit)
- [x] Time-Value Efficiency Score

### 🔥 B. AI Spending Firewall (Persona-Based Decision System)
- [x] Transaction input/import (manual)
- [x] Real-time firewall evaluation for each transaction
- [x] Persona selection: Strict / Balanced / Chill
- [x] Verdict types: Allow, Caution (with impact explanation), Block (with override)
- [x] Gemini-generated reasoning for spending suggestions
- [x] Transaction tagging into budget categories

### 🔥 C. ShiftBudget Auto-Adjustment Engine
- [x] Weekly auto-budget recalculation
- [x] Adjustments based on spending, bills, goals
- [x] Gemini summary of "Why your budget changed"
- [x] Visualization of old vs new budget

### 🔥 D. SmartSplit AI (Group Finances Manager)
- [x] Create groups (friends, roommates, trips, etc.) via text context
- [x] Add expenses via receipt text / UPI message paste
- [x] AI extraction of "who paid what"
- [x] Automatic calculation of who owes whom
- [x] "Minimum transactions" settlement algorithm
- [x] Payment link generation (simulated)
- [x] Fairness analysis alerts

### 🔥 E. Time-Value Analyzer
- [x] Subscription list with cost-per-hour calculation
- [x] Cost-per-use for items (clothing, electronics, gym, etc.)
- [x] "Inefficiency flags" (auto-detected wasteful expenses)
- [x] Gemini recommendations ("Downgrade this", "Use this more", etc.)
- [x] Monthly efficiency score meter

### 🔥 F. Autopilot Actions (MoneyOS Behaviors)
- [x] Safe-to-save transfers (recommendations logs)
- [x] Bill payment timing optimization
- [x] Subscription pruning suggestions
- [x] Real-time spending limit nudges
- [x] Micro-adjustments to category budgets

### 🔥 G. Transactions Module
- [x] Add / import / edit transactions
- [x] Categorization
- [x] Firewall decision logged
- [x] Charts: spending trend
- [x] Search + filter (via Dashboard summary)

### 🔥 H. Goals & Planning Module
- [x] Users can define savings goals
- [x] Timeline estimation (Gemini-assisted)
- [x] Impact analysis ("If you buy this, your goal delays by X days")
- [x] Goal progress visualization

### 🔥 I. User Personalization
- [x] Persona selection (Strict / Balanced / Chill)
- [x] Monthly income & fixed expenses setup (via Budgets)
- [x] Notifications system (via Autopilot logs)

### 🔥 J. Visual & UX Essentials
- [x] Consistent OS-like layout
- [x] Clean, futuristic UI
- [x] Clear callouts for AI-generated insights
- [x] Mobile-friendly responsive design

### 🔥 K. System Insights Page
- [x] "What Autopilot Learned About You This Month"
- [x] Spending habits summary
- [x] Budget drift graph/analysis
- [x] Overspending triggers detected
- [x] Behavioral notes (Gemini-generated)

---

## 📱 SMS Parsing Guide

MoneyOS uses a Regex-based engine tailored for Indian banking SMS formats. Here is what works:

### ✅ Supported Formats
The parser looks for keywords (debited, paid, spent) combined with currency symbols (Rs., INR, ₹).

1.  **Bank Debits:**
    *   "Rs. 500 debited from a/c 1234 at Zomato on 12-05-24."
    *   "INR 1200.50 spent on your HDFC Card ending 8899 at STARBUCKS."

2.  **UPI Transactions:**
    *   "Paid Rs 250 to rahul@upi. Ref 123456."
    *   "Debited ₹1500; VPA: landlord@okicici."

3.  **Credit Alerts:**
    *   "Your a/c is credited with Rs 50,000 (Salary)."

4.  **Wallet Usage:**
    *   "Paytm: Paid Rs 40 for Uber."

### ❌ What is Ignored
To prevent spam and false positives, the system ignores messages containing:
*   OTP, Verification Code, Login
*   Plan Expiring, Recharge Offers
*   Loan Approvals (Spam)

---

## 🔮 Roadmap & Suggestions

1.  **Receipt Scanning (Gemini Vision)**
    *   Allow users to upload photos of physical receipts. Use Gemini 2.5 Flash to extract line items and totals automatically.

2.  **Voice Input Command**
    *   Add a microphone button to the Dashboard.
    *   "I just spent 500 rupees on a Taxi." -> Auto-creates transaction.

3.  **Visual Category Breakdown**
    *   Add a Donut Chart to the Dashboard to visualize % spend per category (Food vs Transport vs Savings).

4.  **PWA (Progressive Web App)**
    *   Make the site installable on mobile phones so users can access it like a native app.

5.  **Recurring Subscription Detection**
    *   If the AI sees "Netflix" or "Spotify" in transactions every month, auto-add it to the "Recurring Expenses" settings.
