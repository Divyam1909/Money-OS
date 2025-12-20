
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

---

## Part 3: Frontend Deployment (Vercel)

1.  **Deploy on Vercel:**
    *   Go to [Vercel.com](https://vercel.com) and sign up.
    *   Click **Add New** -> **Project**.
    *   Import your GitHub repository.
    *   **Build Settings:**
        *   Framework Preset: Create React App (or Vite, depending on your setup).
        *   Build Command: `npm run build`.
        *   Output Directory: `dist`.
    *   **Environment Variables:**
        *   Key: `VITE_API_KEY` | Value: (Your Gemini API Key)
        *   (Optional) Key: `VITE_GEMINI_API_KEY` | Value: (Same as above, if you prefer a clearer name)
    *   Click **Deploy**.

---

## Part 4: 🔄 Updating & Connecting (CRITICAL)

After deploying both parts, you must connect them.

1.  **Get your Backend URL** from the Render Dashboard (e.g., `https://my-app.onrender.com`).
2.  **Update `constants.ts`** in your code:
    *   Change `export const API_BASE_URL = "..."` to your new Render URL.
3.  **Commit and Push** this change to GitHub.
4.  **Vercel will automatically redeploy** your frontend with the new configuration.

**How to Update in the Future:**
*   To update code: Just `git push`. Render and Vercel auto-deploy on push.
*   To update secrets: Go to the "Environment Variables" section in the respective dashboard and Redeploy.
