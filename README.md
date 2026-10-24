# ArogyaMitra AI — Smarter Healthcare for Everyone 🏥🤖

ArogyaMitra AI is a secure, multilingual, full-stack healthcare assistance web application engineered for citizens across India and beyond. It features real AI-powered health consultations, browser-based voice synthesis & recognition, interactive OpenStreetMap hospital discovery with turn-by-turn directions, India Universal Immunisation Programme (UIP) vaccination tracking, verified emergency hotlines (112, 108, 102), and an evidence-based medical education library.

---

## 🌟 Key Features & Implementation Status

| Feature | Description | Status | Provider / Technology |
|---|---|---|---|
| **AI Health Assistant** | Real conversational chatbot with emergency symptom detection, regional language adaptation, and chat history. | ✅ Fully Working | Google Gemini API / OpenAI + Server Proxy |
| **Voice Assistant** | Hands-free speech recognition & regional voice playback in 4 languages with editable transcript. | ✅ Fully Working | Web Speech Recognition + SpeechSynthesis |
| **Nearby Hospitals** | Interactive Leaflet map, GPS "Find Near Me", city geocoding, distance calculation, and direct routing. | ✅ Fully Working | Leaflet + OpenStreetMap + Overpass API |
| **Vaccination Guide** | India Universal Immunisation Programme (UIP) directory, age filters, reminders, and notifications. | ✅ Fully Working | MoHFW / UIP Guidelines + Supabase RLS |
| **Emergency Assistance** | Verified India emergency numbers (112, 108, 102, 181, 1098), 1-tap call, first-aid protocols, contacts manager. | ✅ Fully Working | National Emergency 112 + First Aid |
| **Health Library** | Medically verified education articles, category filtering, search, and bookmarking. | ✅ Fully Working | WHO, MoHFW, ICMR-NIN + Supabase RLS |
| **User Profile & Settings** | Language preferences, display density, and account data persisted with Row Level Security. | ✅ Fully Working | Supabase PostgreSQL + RLS |
| **Multilingual i18n** | Full native UI translation across English, Marathi (मराठी), Hindi (हिन्दी), and Kannada (ಕನ್ನಡ). | ✅ Fully Working | Custom i18n Context & Verified Dictionaries |

---

## 🏗️ Technology Architecture

```
arogyamitra-ai/
├── public/                       # Static public assets (hero.png, icons, favicons)
├── server/
│   └── server.js                 # Secure local Express/Node proxy for AI API calls
├── src/
│   ├── components/               # Reusable UI (Brand, Sidebar, TopBar, ProtectedRoute, LeafletMap)
│   ├── context/                  # AuthContext (Supabase Auth) & LanguageContext (i18n)
│   ├── data/                     # Verified UIP vaccines, emergency numbers, first aid, translations
│   ├── pages/                    # 6 core feature pages + Landing, Login, Profile, Settings
│   ├── services/                 # supabase.js, aiService.js, placesService.js
│   ├── App.css                   # Responsive layout & healthcare design system
│   ├── index.css                 # Global fonts, Leaflet styles & animations
│   ├── App.jsx                   # React Router with protected dashboard routes
│   └── main.jsx                  # Application entry point
├── supabase/
│   ├── migrations/               # PostgreSQL schema, triggers, RLS policies & seed data
│   │   └── 20261021_init_schema.sql
│   └── functions/chat/           # Supabase Edge Function (Deno) for cloud deployment
│       └── index.ts
├── test/
│   └── app.test.js               # Node.js automated unit tests
├── .env.example                  # Safe configuration template
├── package.json
└── vite.config.js                # Vite configuration with /api backend proxy
```

---

## 🚀 Beginner-Friendly Setup Guide (Windows / VS Code)

### Prerequisites
1. **Node.js** (version 18 or higher): Download from [nodejs.org](https://nodejs.org).
2. **VS Code**: Visual Studio Code with a terminal.

### 1. Clone & Install Dependencies
Open a PowerShell terminal in your project directory:
```powershell
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```powershell
Copy-Item .env.example .env
```
Open `.env` in VS Code and fill in your keys:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# Optional: Supabase Edge Function URL (if deployed to Supabase Cloud)
VITE_SUPABASE_FUNCTION_URL=

# Backend Port (default 5000)
PORT=5000

# Google Gemini API Key (Get free key from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here
```

> [!NOTE]
> Even if you have not yet created a Supabase account or set your Gemini key, ArogyaMitra AI runs out-of-the-box with a built-in local development sandbox so you can explore the entire UI, map, vaccination tools, and health library immediately!

---

## 🗄️ Supabase Database & Authentication Setup

A complete, production-ready SQL migration script is located at:
`supabase/migrations/20261021_init_schema.sql`.

### Steps to Run the Migration:
1. Log in to [Supabase](https://supabase.com) and create a free project.
2. In your Supabase dashboard, click **SQL Editor** in the left menu.
3. Click **New Query**, copy the entire contents of `supabase/migrations/20261021_init_schema.sql`, and paste it into the editor.
4. Click **Run**.
5. This automatically creates:
   - `profiles` with an automated trigger on new sign-ups.
   - `chat_conversations` & `chat_messages` for conversation history.
   - `vaccination_reminders` for personal schedule alerts.
   - `emergency_contacts` for family/physician contacts.
   - `health_articles` & `saved_articles` with verified initial articles.
   - **Row Level Security (RLS)** policies ensuring users can only read, insert, update, or delete their own data!
6. Go to **Project Settings** -> **API**, copy your **Project URL** and **anon public key**, and paste them into your `.env` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 🤖 AI Provider Setup (Google Gemini / OpenAI)

ArogyaMitra AI calls the AI model exclusively from a secure backend server or Supabase Edge Function. **Private API keys are never exposed in the browser.**

### Option A: Local Backend Server (Recommended for local development)
1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set `GEMINI_API_KEY=your_key` in your root `.env` file.
3. Start the secure server in a terminal:
   ```powershell
   npm run server
   ```
   *(Server starts on `http://localhost:5000` with the `/api/chat` endpoint and health status).*

### Option B: Supabase Edge Functions (For cloud deployment)
1. Install Supabase CLI: `npm i -g supabase`.
2. Link your project: `supabase link --project-ref your-project-id`.
3. Set your secret in Supabase:
   ```powershell
   supabase secrets set GEMINI_API_KEY=your_gemini_key
   ```
4. Deploy the edge function:
   ```powershell
   supabase functions deploy chat
   ```
5. Set `VITE_SUPABASE_FUNCTION_URL=https://your-project-id.supabase.co/functions/v1/chat` in `.env`.

---

## 🗺️ Real Interactive Maps & Hospital Search

ArogyaMitra AI uses **Leaflet** with **OpenStreetMap** tile layers and queries the **Overpass API** for real healthcare facilities in real time.
- **No API key is required.**
- **Geolocation:** Clicking **"Find Near Me"** requests permission to use device GPS coordinates.
- **Manual City Search:** Entering any city (e.g. "Pune", "Bengaluru", "Mumbai", "Delhi") uses **Nominatim Geocoding** to locate coordinates.
- **Facility Data:** Real source-backed names, addresses, approximate distances in km, phone numbers, and emergency status.
- **Directions:** Clicking directions launches direct turn-by-turn routing in Google Maps or OpenStreetMap.
- **Attribution:** Complies with OpenStreetMap Open Database License (ODbL).

---

## 💻 Running the Application Locally

You can run both the frontend and the local AI server side-by-side:

### Terminal 1 (Frontend):
```powershell
npm run dev
```
Open your browser at `http://localhost:5173`.

### Terminal 2 (Secure AI Backend):
```powershell
npm run server
```

---

## 🧪 Testing & Verification

ArogyaMitra AI includes automated unit tests, strict ESLint rules, and Vite production builds.

### 1. Run Automated Tests
```powershell
npm test
```
*Runs the Node.js test suite covering internationalization, emergency number verifications, UIP vaccine definitions, and acute emergency symptom detection logic.*

### 2. Run Linting
```powershell
npm run lint
```
*Validates that 0 syntax errors, 0 undefined variables, and 0 unused imports exist.*

### 3. Build for Production
```powershell
npm run build
```
*Compiles minified production bundles into the `dist/` directory.*

---

## 🔒 Medical & Emergency Safety Notice

> [!IMPORTANT]
> ArogyaMitra AI is designed strictly for health literacy, preventive guidance, and educational support. It is **NOT** a substitute for clinical diagnosis, prescription medications, or emergency medical dispatch.
> 
> In any life-threatening situation (chest tightness, severe difficulty breathing, sudden stroke symptoms, severe hemorrhage, or loss of consciousness):
> - **In India:** Call **112** (All-in-One Emergency) or **108** (Ambulance) immediately.
> - **Mental Health Helpline (Tele-MANAS):** Call **14416** or **1800-891-4416** (24/7 Free).
