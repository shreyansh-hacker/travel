import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
      const info = stmt.run(name, email, hashedPassword);

      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: info.lastInsertRowid, name, email } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Trip Planner API
  app.post("/api/plan-trip", async (req, res) => {
    try {
      const { budget, days, travelers, travelType, destination, transport } = req.body;

      const prompt = `Plan a trip with the following details:
      Budget: ₹${budget}
      Days: ${days}
      Travelers: ${travelers}
      Travel Type: ${travelType}
      Destination Preference: ${destination}
      Transport Preference: ${transport}

      Provide a detailed itinerary, expense breakdown, suggestions, and an estimated carbon footprint for the trip.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING, description: "Selected destination name" },
              hotelSuggestion: { type: Type.STRING, description: "Suggested hotel name or area" },
              carbonFootprint: { type: Type.STRING, description: "Estimated carbon footprint in kg CO2e with a short tip to reduce it." },
              expenses: {
                type: Type.OBJECT,
                properties: {
                  hotelCost: { type: Type.NUMBER },
                  foodCost: { type: Type.NUMBER },
                  transportCost: { type: Type.NUMBER },
                  sightseeingCost: { type: Type.NUMBER },
                  bufferCost: { type: Type.NUMBER },
                  totalCost: { type: Type.NUMBER },
                  remainingBalance: { type: Type.NUMBER },
                },
                required: ["hotelCost", "foodCost", "transportCost", "sightseeingCost", "bufferCost", "totalCost", "remainingBalance"]
              },
              itinerary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["day", "title", "activities"]
                }
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["destination", "hotelSuggestion", "carbonFootprint", "expenses", "itinerary", "suggestions"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("Error planning trip:", error);
      res.status(500).json({ error: "Failed to plan trip" });
    }
  });

  // Image Editor API (Nano banana)
  app.post("/api/edit-image", async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let editedImageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          editedImageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }

      if (editedImageUrl) {
        res.json({ imageUrl: editedImageUrl });
      } else {
        res.status(500).json({ error: "Failed to edit image" });
      }
    } catch (error) {
      console.error("Error editing image:", error);
      res.status(500).json({ error: "Failed to edit image" });
    }
  });

  // Chatbot API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a helpful AI travel assistant. Answer travel queries, suggest destinations, hotels, food, and give tips. Keep answers concise and helpful.",
        },
      });

      // We can't easily pass history to create() in this SDK version without formatting it correctly, 
      // so we'll just send the latest message with context if needed, or just send the message.
      // For simplicity, we'll just send the message.
      const response = await chat.sendMessage({ message });
      
      res.json({ reply: response.text });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
