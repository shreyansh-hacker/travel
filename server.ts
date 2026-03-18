import express from "express";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "./db.js";
import { optimizeBudget } from "./optimizeBudget.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";
const MODEL = "llama-3.3-70b-versatile";

// ── Auth Middleware ──────────────────────────────────────────────────────────

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ── AI Helper ───────────────────────────────────────────────────────────────

async function askAI(systemPrompt: string, userPrompt: string, json = true) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: MODEL,
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
  });
  const raw = completion.choices[0]?.message?.content || (json ? "{}" : "");
  return json ? JSON.parse(raw) : raw;
}

// ── Server ──────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/health", (_req, res) => res.json({ status: "ok", version: "2.0" }));

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

      const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existing) return res.status(400).json({ error: "Email already exists" });

      const hashed = await bcrypt.hash(password, 10);
      const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashed);

      // Create default preferences
      db.prepare('INSERT OR IGNORE INTO preferences (user_id) VALUES (?)').run(info.lastInsertRowid);

      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: info.lastInsertRowid, name, email } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });
    try {
      const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
      const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.id);
      if (!user) return res.status(404).json({ error: "Not found" });
      res.json({ user });
    } catch { res.status(401).json({ error: "Invalid token" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SMART BUDGET OPTIMIZER — TRIP PLANNER V2
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/plan-trip", async (req, res) => {
    try {
      const { budget, days, travelers, travelType, destination, transport, mood, cities } = req.body;

      const citiesStr = Array.isArray(cities) && cities.length > 0
        ? cities.map((c: any) => `${c.city} (${c.days} days)`).join(", ")
        : destination;

      const prompt = `You are an expert travel budget optimizer. Plan an optimized trip:

TRIP DETAILS:
- Budget: ₹${budget} total for ${travelers} traveler(s)
- Duration: ${days} days
- Travelers: ${travelers}
- Travel Style: ${travelType}
- Mood: ${mood || "balanced"}
- Destinations: ${citiesStr}
- Transport Preference: ${transport}

RESPOND WITH VALID JSON matching this EXACT structure:
{
  "destination": "${destination}",
  "hotelSuggestion": "Hotel name",
  "bestRoute": {
    "recommended": "cheapest type",
    "alternatives": [
      { "type": "flight", "cost": 0, "duration": "2h" },
      { "type": "train", "cost": 0, "duration": "6h" },
      { "type": "bus", "cost": 0, "duration": "8h" }
    ],
    "savings": 0
  },
  "expenses": {
    "transport": 0,
    "hotel": { "budget": 0, "premium": 0 },
    "food": { "street": 0, "restaurants": 0 },
    "entryFees": 0,
    "activities": 0,
    "total": 0
  },
  "foodSuggestions": {
    "budget": [{ "name": "Dish", "cost": 0, "location": "Place" }],
    "famous": [{ "name": "Dish", "cost": 0, "location": "Restaurant" }]
  },
  "itinerary": [{ "day": 1, "title": "Title", "activities": ["activity"] }],
  "tips": ["tip"],
  "ecoImpact": "Carbon footprint description",
  "carbonKg": 0
}

RULES:
- ALL costs in realistic INR for ${destination}.
- hotel.budget/premium = total for ${days} nights. food.street/restaurants = total for ${days} days.
- At least 2 transport alternatives, 3+ budget & 3+ famous food items, 4+ tips.
- Day-by-day itinerary for all ${days} days.
- carbonKg = estimated CO2 in kg for the entire trip.
- Mood "${mood || "balanced"}" should influence suggestions (e.g., chill = spas, adventure = trekking).`;

      const sys = "You are a travel budget optimization AI. Respond ONLY with valid JSON. All monetary values must be numbers. Realistic costs in INR (₹).";
      const raw = await askAI(sys, prompt);
      const optimized = optimizeBudget(raw, Number(budget));
      res.json(optimized);
    } catch (error) {
      console.error("Trip planning error:", error);
      res.status(500).json({ error: "Failed to plan trip" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SAFETY SCORING
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/safety-score", async (req, res) => {
    try {
      const { destination } = req.body;
      if (!destination) return res.status(400).json({ error: "Destination required" });

      const prompt = `Analyze the travel safety of "${destination}" for tourists. Return JSON:
{
  "destination": "${destination}",
  "score": {
    "overall": 0,
    "crimeRisk": "low|moderate|high",
    "scamRisk": "low|moderate|high",
    "healthRisk": "low|moderate|high",
    "transportSafety": "safe|moderate|risky",
    "naturalDisaster": "low|moderate|high"
  },
  "commonScams": [{ "name": "", "description": "", "avoidTip": "" }],
  "emergencyNumbers": [{ "service": "", "number": "" }],
  "healthTips": [""],
  "travelAdvisory": "",
  "safeAreas": [""],
  "avoidAreas": [""]
}
Provide at least 3 scams, 3 emergency numbers, 3 health tips, 2 safe areas, 2 avoid areas. Overall score 0-100.`;

      const result = await askAI("You are a travel safety analyst AI. Respond with valid JSON only.", prompt);
      res.json(result);
    } catch (error) {
      console.error("Safety scoring error:", error);
      res.status(500).json({ error: "Failed to analyze safety" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOD DISCOVERY
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/food-discover", async (req, res) => {
    try {
      const { destination, budget, dietary } = req.body;
      if (!destination) return res.status(400).json({ error: "Destination required" });

      const prompt = `Discover the best food experiences in "${destination}" ${dietary ? `for someone with dietary preference: ${dietary}` : ''}. Budget level: ${budget || 'moderate'}. Return JSON:
{
  "destination": "${destination}",
  "hiddenGems": [{ "name": "", "type": "street|cafe|restaurant|hidden-gem", "cuisine": "", "avgCost": 0, "location": "", "safetyScore": 8, "mustTry": [""], "tip": "" }],
  "budgetPicks": [{ "name": "", "type": "street", "cuisine": "", "avgCost": 0, "location": "", "safetyScore": 8, "mustTry": [""], "tip": "" }],
  "famousSpots": [{ "name": "", "type": "restaurant", "cuisine": "", "avgCost": 0, "location": "", "safetyScore": 9, "mustTry": [""], "tip": "" }],
  "dietaryNotes": [""],
  "waterSafety": ""
}
At least 3 items per category. Costs in INR. safetyScore 1-10.`;

      const result = await askAI("You are a food discovery AI. Respond with valid JSON only.", prompt);
      res.json(result);
    } catch (error) {
      console.error("Food discovery error:", error);
      res.status(500).json({ error: "Failed to discover food" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HOTEL INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/hotel-intelligence", async (req, res) => {
    try {
      const { destination, budget, days } = req.body;
      if (!destination) return res.status(400).json({ error: "Destination required" });

      const prompt = `Analyze hotels in "${destination}" for a ${days || 5}-day trip within budget ₹${budget || 50000}. Return JSON:
{
  "destination": "${destination}",
  "recommended": { "name": "", "category": "mid-range", "pricePerNight": 0, "safetyScore": 8, "cleanlinessScore": 8, "locationScore": 9, "noiseLevel": "quiet", "nearbyLandmarks": [""], "tip": "" },
  "budgetOptions": [{ "name": "", "category": "budget", "pricePerNight": 0, "safetyScore": 7, "cleanlinessScore": 7, "locationScore": 7, "noiseLevel": "moderate", "nearbyLandmarks": [""], "tip": "" }],
  "premiumOptions": [{ "name": "", "category": "premium", "pricePerNight": 0, "safetyScore": 9, "cleanlinessScore": 9, "locationScore": 9, "noiseLevel": "quiet", "nearbyLandmarks": [""], "tip": "" }],
  "scamWarnings": [""],
  "tips": [""]
}
At least 2 budget and 2 premium options. Prices per night in INR. Scores 1-10.`;

      const result = await askAI("You are a hotel analysis AI. Respond with valid JSON only.", prompt);
      res.json(result);
    } catch (error) {
      console.error("Hotel intelligence error:", error);
      res.status(500).json({ error: "Failed to analyze hotels" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY SUGGESTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/activity-suggest", async (req, res) => {
    try {
      const { destination, days, mood, budget } = req.body;
      if (!destination) return res.status(400).json({ error: "Destination required" });

      const prompt = `Suggest activities and a packing list for "${destination}" — ${days || 5} days, mood: ${mood || "balanced"}, budget: ₹${budget || 50000}. Return JSON:
{
  "destination": "${destination}",
  "days": ${days || 5},
  "activities": [{ "name": "", "type": "cultural|adventure|relaxation|nightlife|nature|shopping", "cost": 0, "duration": "2h", "bestTime": "morning", "weatherDependent": false, "crowdLevel": "moderate", "rating": 4.5, "tip": "" }],
  "packingList": [{ "item": "", "category": "clothes|tech|documents|medicine|misc", "essential": true }],
  "weatherForecast": "Expected weather description",
  "bestTimeToVisit": "Best months to visit"
}
At least 8 activities and 12 packing items. Costs in INR.`;

      const result = await askAI("You are a travel activity planner AI. Respond with valid JSON only.", prompt);
      res.json(result);
    } catch (error) {
      console.error("Activity suggestion error:", error);
      res.status(500).json({ error: "Failed to suggest activities" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CHATBOT V2 (Persistent History)
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const sid = sessionId || crypto.randomUUID();

      // Load last 10 messages for context
      const history = db.prepare(
        'SELECT role, content FROM chat_history WHERE session_id = ? ORDER BY created_at DESC LIMIT 10'
      ).all(sid) as { role: string; content: string }[];

      const contextMessages = history.reverse().map(h => ({
        role: h.role === 'user' ? 'user' as const : 'assistant' as const,
        content: h.content,
      }));

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are AeroVoyage AI — a premium travel assistant. You remember conversation context. Answer travel queries with specific, helpful advice. Suggest destinations, hotels, food, budgets, and safety tips. Be concise, friendly, and knowledgeable. Format important info with bullet points." },
          ...contextMessages,
          { role: "user", content: message },
        ],
        model: MODEL,
      });

      const reply = completion.choices[0]?.message?.content || "";

      // Save to history
      const insert = db.prepare('INSERT INTO chat_history (session_id, role, content) VALUES (?, ?, ?)');
      insert.run(sid, 'user', message);
      insert.run(sid, 'bot', reply);

      res.json({ reply, sessionId: sid });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TRIPS (Save / List / Get)
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/trips", authMiddleware, (req: any, res) => {
    try {
      const { destination, cities, mood, budget, days, travelers, data, antigravityScore, carbonKg } = req.body;
      const shareToken = crypto.randomUUID().slice(0, 8);
      const info = db.prepare(
        `INSERT INTO trips (user_id, destination, cities, mood, budget, days, travelers, data, antigravity_score, carbon_kg, share_token)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(req.userId, destination, JSON.stringify(cities || []), mood || 'balanced', budget, days, travelers, JSON.stringify(data), antigravityScore || 0, carbonKg || 0, shareToken);
      res.json({ id: info.lastInsertRowid, shareToken });
    } catch (error) {
      console.error("Save trip error:", error);
      res.status(500).json({ error: "Failed to save trip" });
    }
  });

  app.get("/api/trips", authMiddleware, (req: any, res) => {
    try {
      const trips = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
      res.json({ trips });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/shared/:token", (req, res) => {
    try {
      const trip = db.prepare('SELECT * FROM trips WHERE share_token = ?').get(req.params.token);
      if (!trip) return res.status(404).json({ error: "Trip not found" });
      res.json({ trip });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PREFERENCES
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/preferences", authMiddleware, (req: any, res) => {
    try {
      let prefs = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(req.userId) as any;
      if (!prefs) {
        db.prepare('INSERT INTO preferences (user_id) VALUES (?)').run(req.userId);
        prefs = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(req.userId);
      }
      res.json({ preferences: prefs });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.put("/api/preferences", authMiddleware, (req: any, res) => {
    try {
      const { defaultMood, budgetStyle, dietaryPref, interests, carbonConscious, theme } = req.body;
      db.prepare(
        `INSERT INTO preferences (user_id, default_mood, budget_style, dietary_pref, interests, carbon_conscious, theme, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(user_id) DO UPDATE SET
           default_mood = excluded.default_mood,
           budget_style = excluded.budget_style,
           dietary_pref = excluded.dietary_pref,
           interests = excluded.interests,
           carbon_conscious = excluded.carbon_conscious,
           theme = excluded.theme,
           updated_at = excluded.updated_at`
      ).run(req.userId, defaultMood || 'chill', budgetStyle || 'moderate', JSON.stringify(dietaryPref || []), JSON.stringify(interests || []), carbonConscious ? 1 : 0, theme || 'dark');
      res.json({ success: true });
    } catch (error) {
      console.error("Preferences error:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE EDITOR (Stub)
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/edit-image", async (_req, res) => {
    res.status(400).json({ error: "Image editing requires a vision-capable API. Coming in Phase 2." });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VITE MIDDLEWARE
  // ═══════════════════════════════════════════════════════════════════════════
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 AeroVoyage V2 running on http://localhost:${PORT}`);
  });
}

startServer();
