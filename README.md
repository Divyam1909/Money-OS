# MoneyOS 🚀
**The AI-Powered Operating System for Your Personal Finances.**

MoneyOS is not just an expense tracker; it is a proactive financial intelligence system. It uses Google's Gemini AI to analyze your spending behavior, enforce budgets, split bills, and predict whether you can actually afford that new gadget.

It replaces the "guilt" of spending with **data-driven confidence**.

---

## 🌟 Key Features

### 1. Mission Control (Dashboard)
Your real-time financial cockpit.
- **Spending Oscilloscope:** A dual-wave chart (Green vs. Red) showing Income vs. Expenses over the last 7 days.
- **Savings Health Meter:** visualizes your "Financial Buffer"—how safe you are from hitting zero.
- **System Logs:** A live feed of important events (e.g., "High Value Transaction Detected", "Firewall Blocked Purchase").
- **Financial Freedom Score:** Calculates what % of your income is yours to keep vs. locked in fixed bills.

### 2. Transaction Log & AI Firewall 🛡️
Stop bad spending *before* it happens.
- **AI Firewall:** Before you buy something, ask the AI. It analyzes your current budget and gives a decision (**ALLOW**, **CAUTION**, or **BLOCK**) based on your chosen persona (Strict, Balanced, or Chill).
- **Smart SMS Parser:** Paste raw SMS text (e.g., *"Paid Rs. 250 to Uber"*), and the system automatically extracts the Amount, Merchant, and Category.
- **Smart Filters:** Instantly toggle between Expenses, Income, or All transactions.

### 3. ShiftBudget Engine 🔄
Budgets that adapt to real life.
- **Auto-Adjust:** If you overspend on "Food" but underspend on "Travel," the AI suggests moving money between categories to keep your total budget balanced.
- **Visual Allocations:** Color-coded progress bars (Green/Yellow/Red) show exactly how close you are to your limits.

### 4. SmartSplit Harmonizer 🤝
No more awkward math with friends.
- **Natural Language Splitter:** Just type or paste a messy note like *"Alice paid 500 for pizza, Bob paid 200 for taxi."*
- **AI Settlement Plan:** The system calculates the fairest way to settle debts and generates a clear "Who pays Whom" list.

### 5. Time-Value Analysis ⏳
Is that subscription worth your life energy?
- **Subscription Auditor:** Analyzes your recurring bills (Netflix, Gym) and calculates an "ROI Score" to tell you if you should Cancel or Keep them.
- **Purchase Simulator:** Input a potential big buy (e.g., "Gaming Console"), and the AI predicts if it’s a "High Utility Asset" or a "Money Pit."

### 6. Goals & Strategic Planning 🎯
Turn wishes into math.
- **Feasibility Check:** Tell the system *"I want to save ₹50,000 for a trip by December."* It analyzes your income and spending habits to tell you if it's **Easy**, **Stretch**, or **Impossible**.
- **Action Plans:** If a goal is impossible, it tells you exactly which budgets to cut to make it happen.

### 7. System Insights 🧠
Understand the *Why* behind your spending.
- **Behavioral Analysis:** The AI scans your history to find patterns (e.g., *"You consistently overspend on weekends"*).
- **Trigger Radar:** Identifies psychological triggers like "Stress Shopping" or "Social Pressure."

### 8. Category Intelligence (Settings) ⚙️
Teach the system your habits.
- **Dynamic Rules:** Add custom rules like *"If message contains 'BLINKIT', always categorize as 'Grocery'."*
- **Baseline Config:** Set your monthly income and fixed obligations to calculate your true discretionary cash flow.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), TypeScript, Tailwind CSS, Recharts (Data Viz), Lucide React (Icons).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Atlas/Railway).
* **AI Core:** Google Gemini Pro API (`@google/genai`).
* **Authentication:** JWT (JSON Web Tokens).

---

## 🚀 How to Run

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/yourusername/moneyos.git](https://github.com/yourusername/moneyos.git)
    ```

2.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create a .env file with MONGO_URI, JWT_SECRET, SMS_SECRET, and API_KEY (Gemini)
    npm start
    ```

4.  **Access:**
    Open `http://localhost:5173` in your browser.

---

## 🤖 AI Personas

MoneyOS allows you to choose your "Financial Boss":
* **STRICT:** Zero tolerance for overspending. Will block unnecessary purchases.
* **BALANCED:** The standard mode. Gives warnings but allows flexibility.
* **CHILL:** Relaxed. Focuses on big-picture trends rather than micro-transactions.

---

*Built with ❤️ for financial freedom.*