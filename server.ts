/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure ipv4 bindings work correctly
dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit
  app.use(express.json());

  // Set up Google GenAI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // In-memory cache to store identical mathematical explanations for ultra-fast instant load
  const explanationCache = new Map<string, string>();

  // API Route for AI Helper Solver
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { num1, num2, op, text, lang } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not defined. Please add it to your Settings > Secrets.",
        });
      }

      // 1. Check in-memory cache first for absolute instant performance
      const cacheKey = `${num1}_${num2}_${op}_${lang || "en"}`;
      if (explanationCache.has(cacheKey)) {
        console.log(`[Cache Hit] Serving explanation for key: ${cacheKey}`);
        return res.json({
          success: true,
          explanation: explanationCache.get(cacheKey),
          cached: true,
        });
      }

      // Compose child-friendly instructional math helper prompt
      const prompt = `
You are Chiku, a super cute, encouraging chimpanzee math classroom helper for primary school young children.
The child has clicked the 'AI Solver Hint' to get help on this math question:
"${text}" (Calculation details: Number 1 is ${num1}, Number 2 is ${num2}, Operator is ${op}).

Please write a step-by-step kid-friendly explanation under 4 lines/sentences of how to think or calculate it easily.
Make sure to explain standard kid-friendly arithmetic decomposition (e.g. splitting into tens or multiplying/adding in manageable portions).
Ensure the reply is written entirely in the requested system language: "${lang || "en"}".

Language rules:
- If language is 'bn' (Bengali): Speak in cute Bengali. Use sweet affectionate lines like "Tumi oboshshoi parbe!", "Chiku satheri ache!", "Khete thako chinta koro nah!".
- If language is 'hi' (Hindi): Speak cute Hindi like "Tum aasaani se kar sakte ho!", "Chiku aapke saath hai!".
- If language is 'en' (English): Speak cute encouraging English.
- Always be ultra encouraging and keep it extremely short, playful, and fun!
`;

      // 2. Query Gemini with latency-saving configuration (thinkingLevel: "LOW")
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.6, // slightly lower temperature for faster & more focused structure
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW, // minimize latency on Gemini 3.5
          },
        },
      });

      const explanation = response.text || "Keep thinking, you can solve this math puzzle!";

      // 3. Save to in-memory cache
      explanationCache.set(cacheKey, explanation);

      res.json({
        success: true,
        explanation: explanation,
        cached: false,
      });
    } catch (error: any) {
      console.error("Gemini API server proxy error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate hint",
      });
    }
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Light Math Server" });
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
