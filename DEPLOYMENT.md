# 🚀 How to Deploy MoneyOS for Free

This guide will help you deploy the Frontend (React) and Backend (Node.js/Express) completely for free using **Vercel** and **Render**.

---

## Part 1: Database (MongoDB Atlas)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  Create a new Cluster (Select **Shared** -> **Free Tier**).
3.  Go to **Database Access** -> Add New Database User (Username/Password).
4.  Go to **Network Access** -> Add IP Address -> Allow Access from Anywhere (`0.0.0.0/0`).
5.  Go to **Database** -> Connect -> Drivers -> Copy the connection string.
    *   It looks like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/...`
    *   Replace `<password>` with your actual user password.

---

## Part 2: Backend Deployment (Render)

We will deploy `server.js` as a web service.

1.  **Prepare Repository:**
    *   Create a `package.json` in your root if you haven't already. Ensure it has:
        ```json
        "scripts": {
          "start": "node server.js"
        }
        ```
    *   Push your code to GitHub.

2.  **Deploy on Render:**
    *   Go to [Render.com](https://render.com) and sign up.
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
    *   **Settings:**
        *   **Environment:** Node
        *   **Build Command:** `npm install`
        *   **Start Command:** `node server.js`
    *   **Environment Variables (Advanced Section):**
        *   Key: `MONGO_URI` | Value: (Your MongoDB Connection String)
        *   Key: `JWT_SECRET` | Value: (A random strong string)
    *   Click **Create Web Service**.
    *   Once live, copy your backend URL (e.g., `https://moneyos-api.onrender.com`).

3.  **Update Frontend Code:**
    *   In `components/Auth.tsx` and `components/Transactions.tsx`, replace `http://localhost:3001` with your new Render URL.

---

## Part 3: Frontend Deployment (Vercel)

1.  **Deploy on Vercel:**
    *   Go to [Vercel.com](https://vercel.com) and sign up.
    *   Click **Add New** -> **Project**.
    *   Import your GitHub repository.
    *   **Build Settings:**
        *   Framework Preset: Create React App (or Vite, depending on your setup).
        *   Build Command: `npm run build` (or `npm run build` depending on bundler).
        *   Output Directory: `build` (or `dist`).
    *   **Environment Variables:**
        *   Key: `API_KEY` | Value: (Your Gemini API Key)
    *   Click **Deploy**.

---

## Summary

1.  **MongoDB** stores your data.
2.  **Render** runs your Node.js server (`server.js`).
3.  **Vercel** hosts your React Frontend.

Enjoy your deployed Financial Operating System! 🚀
