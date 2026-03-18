# 🛫 AeroVoyage AI Travel Planner — Complete Project Overview

> **An AI-powered luxury travel planning platform with smart budget itineraries, interactive maps, chatbot assistant, and AI image editing.**

---

## 📋 Table of Contents

1. [Project Summary](#-project-summary)
2. [Tech Stack](#-tech-stack)
3. [Directory Structure](#-directory-structure)
4. [Architecture Overview](#-architecture-overview)
5. [Backend (Server & Database)](#-backend-server--database)
6. [Frontend (React App)](#-frontend-react-app)
7. [Pages & Components](#-pages--components)
8. [Design System (CSS)](#-design-system-css)
9. [API Endpoints](#-api-endpoints)
10. [Database Schema](#-database-schema)
11. [Environment Variables](#-environment-variables)
12. [How to Run](#-how-to-run)
13. [Security Notes](#-security-notes)
14. [Known Issues & Limitations](#-known-issues--limitations)
15. [Future Improvement Ideas](#-future-improvement-ideas)

---

## 🧭 Project Summary

**AeroVoyage** is a full-stack web application that lets users plan luxury trips using AI. Users can:

- **Plan Trips** — Enter budget, destination, days, travelers, travel type, and transport. The AI (Groq Llama3-70B) generates a detailed itinerary with expense breakdowns, hotel suggestions, eco-impact analysis, and travel tips.
- **Chat with AI** — A floating chatbot powered by Groq AI acts as a travel assistant for destination queries, tips, and suggestions.
- **Edit Images** — Upload travel photos and use AI to enhance them *(currently stubbed — not supported by Groq)*.
- **User Authentication** — Register/Login with JWT-based auth, passwords hashed with bcrypt, stored in SQLite.

---

## 🛠 Tech Stack

| Layer         | Technology                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------- |
| **Frontend**  | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, GSAP, Recharts, React-Leaflet      |
| **Backend**   | Express.js (Node), TypeScript (tsx runner)                                                      |
| **AI/LLM**    | Groq SDK → Llama3-70B-8192 model                                                               |
| **Database**  | SQLite via `better-sqlite3`                                                                     |
| **Auth**      | JWT (`jsonwebtoken`) + bcryptjs password hashing                                                |
| **Forms**     | React Hook Form + Zod validation                                                                |
| **State**     | Zustand (global auth state)                                                                     |
| **Maps**      | Leaflet + React-Leaflet (CartoDB dark tiles)                                                    |
| **Charts**    | Recharts (PieChart for expense analytics)                                                       |
| **Icons**     | Lucide React                                                                                    |
| **Fonts**     | Google Fonts — Outfit, Space Grotesk                                                            |

---

## 📁 Directory Structure

```
aerovoyage-ai-travel-planner/
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── README.md                 # Basic run instructions
├── PROJECT_OVERVIEW.md       # ← THIS FILE (full project docs)
├── index.html                # Root HTML entry (Vite SPA)
├── metadata.json             # App metadata (name, description)
├── package.json              # Dependencies & scripts
├── package-lock.json         # Locked dependency tree
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite + Tailwind + React plugin config
├── db.ts                     # SQLite database setup & table creation
├── server.ts                 # Express server — API routes + Vite middleware
├── travel.db                 # SQLite database file (auto-created)
├── travel.db.invalid.bak     # Backup of invalid DB
├── node_modules/             # Installed dependencies
│
└── src/                      # Frontend source (React)
    ├── main.tsx              # React entry point (renders <App />)
    ├── App.tsx               # Root component — Router + Layout + Routes
    ├── store.ts              # Zustand store (auth state management)
    ├── index.css             # Global CSS — theme, glassmorphism, scrollbar
    │
    ├── components/           # Reusable UI components
    │   ├── Navbar.tsx        # Top navigation bar with auth integration
    │   ├── AuthModal.tsx     # Login/Register modal (animated)
    │   └── Chatbot.tsx       # Floating AI chatbot widget
    │
    └── pages/                # Route-level page components
        ├── Home.tsx          # Landing page with hero, features, destinations
        ├── Planner.tsx       # AI trip planner form + results dashboard
        └── ImageEditor.tsx   # AI image editor (upload + prompt)
```

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Client)                   │
│  React 19 + Vite + Tailwind + Framer Motion + GSAP   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Home    │  │ Planner  │  │  Image Editor     │   │
│  │  (/)     │  │ (/planner)│  │  (/editor)       │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Navbar   │  │ AuthModal│  │  Chatbot (FAB)   │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
│                       │                              │
│                       │  fetch("/api/...")            │
└───────────────────────┼──────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│                Express Server (server.ts)             │
│                   Port: 3000                         │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ API Routes:                                     │ │
│  │  POST /api/auth/register   → Register user      │ │
│  │  POST /api/auth/login      → Login user         │ │
│  │  GET  /api/auth/me         → Get current user   │ │
│  │  POST /api/plan-trip       → AI trip planning   │ │
│  │  POST /api/edit-image      → Image editing (stub)│ │
│  │  POST /api/chat            → AI chatbot         │ │
│  │  GET  /api/health          → Health check       │ │
│  └─────────────────────────────────────────────────┘ │
│              │                        │              │
│     ┌────────┘                ┌───────┘              │
│     ▼                        ▼                       │
│  ┌──────────┐        ┌──────────────┐                │
│  │ SQLite   │        │  Groq SDK    │                │
│  │ (travel. │        │  Llama3-70B  │                │
│  │   db)    │        │  (AI model)  │                │
│  └──────────┘        └──────────────┘                │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 Backend (Server & Database)

### `server.ts` — Express Server

- Starts Express on **port 3000** with `0.0.0.0` binding
- In **dev mode**: uses Vite middleware for HMR (Hot Module Replacement)
- In **production**: serves static files from `dist/`
- Handles JSON payloads up to `50MB` (for image uploads)
- Uses **Groq SDK** with `llama3-70b-8192` model for AI responses
- JWT tokens expire after **7 days**

### `db.ts` — Database Setup

- Uses `better-sqlite3` (synchronous SQLite)
- Auto-creates `travel.db` with two tables: `users` and `itineraries`
- The `itineraries` table stores trip data as JSON (linked to users via foreign key)

---

## ⚛ Frontend (React App)

### `main.tsx` — Entry Point
- Renders `<App />` inside React `StrictMode`
- Imports global CSS (`index.css`)

### `App.tsx` — Root Component
- **React Router** with 3 routes: `/`, `/planner`, `/editor`
- Global particle background with blurred gradient orbs
- Includes `<Navbar />` and floating `<Chatbot />` on all pages

### `store.ts` — Zustand Auth Store
- Manages `user` state (id, name, email)
- `setUser()` to login, `logout()` to clear token & state

---

## 📄 Pages & Components

### Pages

| Page                | Route      | Description                                                                                                              |
| ------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Home.tsx**        | `/`        | Cinematic hero with parallax effect, animated feature grid (Smart Itineraries, Expense Analytics, Cinematic Memories), trending destinations showcase with Unsplash images |
| **Planner.tsx**     | `/planner` | Trip planning form (Zod validated) with budget, days, travelers, destination, travel type, transport. Results show: stat cards, PieChart expense breakdown, Leaflet map, drag-to-reorder itinerary timeline, eco-impact & travel tips |
| **ImageEditor.tsx** | `/editor`  | Upload image → enter AI prompt → generate edit. Currently **stubbed** (Groq doesn't support image editing). UI is fully built with upload preview, loading states, and download button |

### Components

| Component         | Description                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Navbar.tsx**     | Fixed top nav with glassmorphism, animated route indicator (Framer Motion `layoutId`), auth state toggle (Sign In/Sign Out), auto-fetches user on mount via `/api/auth/me` |
| **AuthModal.tsx**  | Animated modal for Login/Register, toggles between modes, handles API calls with loading/error states            |
| **Chatbot.tsx**    | Floating action button (bottom-right) that opens a chat panel. Sends messages to `/api/chat`, shows bot/user messages with styled bubbles, auto-scrolls to latest message |

---

## 🎨 Design System (CSS)

### Theme Variables (via Tailwind `@theme`)

| Variable            | Value       | Usage                          |
| ------------------- | ----------- | ------------------------------ |
| `--font-sans`       | Outfit      | Body text                      |
| `--font-display`    | Space Grotesk| Headings, display text        |
| `--color-navy`      | `#0B1120`   | Main background                |
| `--color-ocean`     | `#0F172A`   | Secondary background, cards    |
| `--color-teal`      | `#06B6D4`   | Primary accent                 |
| `--color-cyan-glow` | `#22D3EE`   | Highlighted text, glows        |
| `--color-success`   | `#10B981`   | Success states, ratings        |
| `--color-error`     | `#EF4444`   | Error states                   |
| `--color-grad-1`    | `#1E3A8A`   | Gradient start (blue)          |
| `--color-grad-2`    | `#0EA5E9`   | Gradient middle (sky blue)     |
| `--color-grad-3`    | `#F97316`   | Gradient end (orange)          |

### CSS Utilities

- **`.glass`** — Glassmorphism effect with blur + translucent background
- **`.glass-card`** — Card variant with gradient, blur, border glow on hover, lift animation
- **`.text-gradient`** — Multi-color gradient text (blue → sky → orange)
- **`.glow-button`** — Button with animated gradient border glow on hover
- **Custom scrollbar** — Styled dark scrollbar matching theme

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint              | Body                             | Response                          |
| ------ | --------------------- | -------------------------------- | --------------------------------- |
| POST   | `/api/auth/register`  | `{ name, email, password }`      | `{ token, user: { id, name, email } }` |
| POST   | `/api/auth/login`     | `{ email, password }`            | `{ token, user: { id, name, email } }` |
| GET    | `/api/auth/me`        | Header: `Authorization: Bearer <token>` | `{ user: { id, name, email } }` |

### AI Features

| Method | Endpoint          | Body                                                                   | Response                                           |
| ------ | ----------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| POST   | `/api/plan-trip`  | `{ budget, days, travelers, travelType, destination, transport }`      | JSON object with destination, expenses, itinerary, suggestions, carbonFootprint |
| POST   | `/api/chat`       | `{ message, history }`                                                 | `{ reply: "..." }`                                 |
| POST   | `/api/edit-image` | `{ imageBase64, mimeType, prompt }`                                    | **400 error** — feature not supported by Groq      |

### Utility

| Method | Endpoint       | Response             |
| ------ | -------------- | -------------------- |
| GET    | `/api/health`  | `{ status: "ok" }`  |

---

## 🗄 Database Schema

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,           -- bcrypt hashed
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Itineraries table (currently unused in API routes)
CREATE TABLE IF NOT EXISTS itineraries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    destination TEXT NOT NULL,
    data        JSON NOT NULL,           -- Full trip plan JSON
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 🔑 Environment Variables

| Variable          | Required | Description                                    |
| ----------------- | -------- | ---------------------------------------------- |
| `GEMINI_API_KEY`  | Optional | For Gemini AI API (not actively used in code)  |
| `GROQ_API_KEY`    | No*      | Groq API key (currently **hardcoded** in server.ts) |
| `JWT_SECRET`      | Optional | JWT signing secret (defaults to `"super-secret-key-for-dev"`) |
| `APP_URL`         | Optional | Hosted app URL (for OAuth callbacks etc.)      |
| `NODE_ENV`        | Optional | `production` for static file serving           |
| `DISABLE_HMR`     | Optional | Set to `"true"` to disable Vite HMR           |

---

## 🚀 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
#    - Copy .env.example to .env.local
#    - Set GEMINI_API_KEY (if needed)

# 3. Run in development mode
npm run dev
#    → Server starts on http://localhost:3000

# 4. Build for production
npm run build

# 5. Type check
npm run lint
```

---

## 🔒 Security Notes

> ⚠️ **CRITICAL — Fix before deploying to production:**

1. **Hardcoded Groq API Key** — The Groq API key is hardcoded directly in `server.ts` (line 11). This should be moved to an environment variable immediately.

2. **Weak JWT Secret** — The default JWT secret is `"super-secret-key-for-dev"`. In production, set a strong random `JWT_SECRET` environment variable.

3. **No Rate Limiting** — API endpoints have no rate limiting, making them vulnerable to abuse.

4. **No CORS Configuration** — No explicit CORS setup (works in dev with Vite proxy, but may cause issues in production).

5. **No Input Sanitization** — User inputs sent to AI are not sanitized for prompt injection.

---

## ⚠ Known Issues & Limitations

1. **Image Editor is stubbed** — The `/api/edit-image` endpoint always returns a 400 error because Groq doesn't support vision/image editing models. The frontend UI is fully built but non-functional.

2. **Itineraries table unused** — The `itineraries` table is created in the DB but no API routes save/retrieve trip plans. Users cannot persist their generated itineraries.

3. **Map shows static location** — The Leaflet map in the Planner always centers on India (20.5937°N, 78.9629°E) regardless of the actual destination.

4. **No mobile nav** — The navbar links and auth buttons are hidden on mobile (`hidden md:flex`) with no hamburger menu.

5. **Chat history not sent** — The chatbot sends `message` to the API but doesn't send conversation `history`, so every message is independent (no multi-turn context).

6. **Groq import mismatch** — `server.ts` imports `Groq` from `groq-sdk`, but this package is not listed in `package.json` dependencies.

---

## 💡 Future Improvement Ideas

1. **Save itineraries** — Add API endpoints to save/load trip plans using the existing `itineraries` table
2. **Switch to Gemini** — Use the already-configured `@google/genai` package for image editing support
3. **Dynamic map markers** — Geocode the destination and position the map marker accordingly
4. **Mobile responsive nav** — Add hamburger menu for mobile devices
5. **Multi-turn chat** — Send conversation history for contextual AI responses
6. **Trip sharing** — Generate shareable links for trip itineraries
7. **PDF export** — Export itineraries as styled PDF documents
8. **Move API key to env** — Replace hardcoded Groq API key with environment variable
9. **Add rate limiting** — Protect AI endpoints from abuse
10. **User dashboard** — Show saved trips, favorite destinations, chat history

---

*Generated on March 18, 2026 — Comprehensive overview of the AeroVoyage AI Travel Planner project.*
