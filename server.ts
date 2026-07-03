import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for lazy Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is missing.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Helper for resilient AI generation with retry and model fallback
async function generateWithRetry(ai: GoogleGenAI, prompt: string, isJson: boolean = false): Promise<string> {
  const models = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash"
  ];

  let lastErr: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          ...(isJson ? { config: { responseMimeType: "application/json" } } : {})
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastErr = err;
        const msg = (err?.message || JSON.stringify(err) || "").toLowerCase();
        const isTransient = msg.includes("503") || 
                            msg.includes("unavailable") || 
                            msg.includes("429") || 
                            msg.includes("resource_exhausted") || 
                            msg.includes("high demand") || 
                            msg.includes("overloaded");

        if (isTransient && attempt < 2) {
          console.warn(`[Oracle] Model ${model} busy (attempt ${attempt}). Retrying in ${attempt}s...`);
          await new Promise(r => setTimeout(r, 1000 * attempt));
        } else if (isTransient) {
          console.warn(`[Oracle] Model ${model} temporarily unavailable. Falling back to next model...`);
        } else {
          // Non-transient error, break to try next model
          break;
        }
      }
    }
  }

  throw lastErr || new Error("The Arcane Oracle is currently overwhelmed by magical energies.");
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiAvailable: !!process.env.GEMINI_API_KEY });
});

// Arcane Oracle Coach: Get strategic advice on the current board & card hand
app.post("/api/oracle/advise", async (req, res) => {
  try {
    const { boardSummary, hand, energy, playerColor, turn } = req.body;
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ 
        error: "Arcane Oracle is slumbering (GEMINI_API_KEY not configured)." 
      });
    }

    const prompt = `
You are the Arcane Oracle, a mystical grandmaster of Tactical Card Chess (where chess meets magical ability cards of rarities D, C, B, A, and S).
Analyze this current situation for Player ${playerColor === 'w' ? 'White' : 'Black'}:
- Turn Number: ${turn}
- Energy / Mana: ${energy}
- Board State Summary: ${boardSummary}
- Cards in Hand: ${JSON.stringify(hand)}

Provide concise, tactical, and atmospheric advice (2-3 short bullet points):
1. Recommend whether to play a card from their hand (and which one) or make a standard chess move.
2. Highlight any hidden tactical risks or opportunities on the board.
Keep your tone wise, strategic, and slightly mystical.
`;

    const text = await generateWithRetry(ai, prompt, false);
    res.json({ advice: text });
  } catch (err: any) {
    console.error("Oracle Advise Error:", err);
    const msg = (err?.message || JSON.stringify(err) || "").toLowerCase();
    if (msg.includes("high demand") || msg.includes("unavailable") || msg.includes("503") || msg.includes("429")) {
      res.status(503).json({ error: "The Oracle is currently experiencing high demand. Please try again in a few seconds!" });
    } else {
      res.status(500).json({ error: "The mystical fog clouded the Oracle's vision. Please try again!" });
    }
  }
});

// Custom Card Generator: Let users invent a balanced card with AI
app.post("/api/oracle/generate-card", async (req, res) => {
  try {
    const { theme, desiredRarity } = req.body;
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ 
        error: "Arcane Oracle is slumbering (GEMINI_API_KEY not configured)." 
      });
    }

    const prompt = `
You are a master game designer for Tactical Card Chess. Generate a brand new ability card based on this theme/idea: "${theme || 'Random magical artifact or spell'}".
Requested Rarity: ${desiredRarity || 'Any (D, C, B, A, or S)'}.

Rarity Guidelines:
- D Rank (Negative Spell/Curse): Cost 0. Freezes an enemy piece, slows enemy movement range, or shrouds enemy piece in fog.
- C Rank (Small Benefit): Cost 1. Draw extra cards, reveal threat, brief shield.
- B Rank (Useful): Cost 2. Swap pieces, reposition minor piece, recall pawn.
- A Rank (Powerful): Cost 3. Teleport (Blink), extra turn (Time Warp), Queen movement for 1 turn.
- S Rank (Extremely Rare): Cost 4. Revive any piece (Miracle), Undo turn (Fate Rewrite), Checkmate negation.

Return ONLY a valid JSON object matching this schema:
{
  "name": "String (2-3 words)",
  "rarity": "D" | "C" | "B" | "A" | "S",
  "cost": Number (0-4),
  "description": "Clear functional rule description (1-2 sentences)",
  "flavorText": "Italicized mystical lore quote",
  "category": "curse" | "utility" | "tactical" | "power" | "miracle"
}
`;

    const text = await generateWithRetry(ai, prompt, true);
    const cardData = JSON.parse(text || "{}");
    res.json({ card: cardData });
  } catch (err: any) {
    console.error("Card Generation Error:", err);
    const msg = (err?.message || JSON.stringify(err) || "").toLowerCase();
    if (msg.includes("high demand") || msg.includes("unavailable") || msg.includes("503") || msg.includes("429")) {
      res.status(503).json({ error: "The Oracle is currently experiencing high demand. Please try again in a few seconds!" });
    } else {
      res.status(500).json({ error: "Failed to forge spell card. The mystical energies were disrupted!" });
    }
  }
});

// Vite middleware setup
async function startServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
