# 🚀 ArogyaMitra AI — Deployment Guide

This guide explains how to deploy **ArogyaMitra AI** to the web for free with live AI assistance, interactive hospital maps, and Supabase authentication.

---

## ⚡ Option 1: Vercel (Recommended — 100% Free & Fastest)

Vercel is the best platform for this project because it natively runs the **Vite frontend** and **AI serverless backend (`/api/chat`)** together without needing a separate server.

### Step 1: Sign Up & Import Repository
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select your repository: `ankitasulagadale2577-afk/Arogya-ai-` and click **Import**.

### Step 2: Configure Build Settings
Vercel will automatically detect Vite:
* **Framework Preset:** `Vite`
* **Root Directory:** `./`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`

### Step 3: Add Environment Variables
Expand the **Environment Variables** section and add the following 3 variables:

| Variable Name | Description | Example / Value |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://yuylpodhvvzxvwyfzczy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key | `sb_publishable_XC9xTW0D4Vx4etF2UwI6Nw_eh5Ssauh` |
| `GEMINI_API_KEY` | Google Gemini API Key for server AI | `AQ.Ab8RN6IQDSx...` *(from https://aistudio.google.com)* |

### Step 4: Click Deploy
* Click **Deploy**. Vercel will install dependencies, build the app, and give you a free live URL (e.g., `https://arogya-ai.vercel.app`).
* Every future push to your `main` branch on GitHub will automatically trigger a new deployment!

---

## 🌐 Option 2: Netlify

1. Go to [netlify.com](https://www.netlify.com) and log in with GitHub.
2. Click **"Add new site"** → **"Import an existing project"** → select `Arogya-ai-`.
3. Set:
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
4. Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`) under **Site configuration → Environment variables**.
5. Click **Deploy Site**.

*(The repository includes `public/_redirects` which automatically prevents 404 errors on browser refresh).*

---

## 🖥️ Option 3: Render (Full Node.js Production Web Service)

If you prefer hosting the Express backend (`server/server.js`) together with the frontend:

1. Go to [render.com](https://render.com) and click **"New +"** → **"Web Service"**.
2. Connect your GitHub repository `Arogya-ai-`.
3. Choose:
   * **Environment:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
4. Add your environment variables:
   * `PORT` = `5000`
   * `GEMINI_API_KEY` = your Gemini API key
   * `VITE_SUPABASE_URL` = your Supabase URL
   * `VITE_SUPABASE_ANON_KEY` = your Supabase Anon key
5. Click **Create Web Service**.

---

## 📋 Pre-Deployment Checklist

- [x] `vercel.json` configured for SPA routing & `/api` serverless rewrites.
- [x] Serverless function `api/chat.js` created for Gemini AI model cascade.
- [x] Serverless function `api/health.js` created for backend status monitoring.
- [x] `public/_redirects` created for SPA client-side routing on Netlify/Cloudflare.
- [x] `server/server.js` configured to serve `dist/` production assets for Node hosts.
- [x] `npm start` script registered in `package.json`.
- [x] Sensitive keys kept safe in server environment variables (never exposed in frontend bundles).
