import "dotenv/config";
import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "portfolios.json");

// --- AI (Gemini 2.5 Flash — free tier) --------------------------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt) {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 400 },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) throw new Error("Gemini returned an empty response");
  return text.trim();
}

function stripCodeFences(text) {
  return text.replace(/```json|```/g, "").trim();
}

// --- tiny JSON-file "database" -------------------------------------------
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function blankPortfolio() {
  return {
    name: "",
    title: "",
    tagline: "",
    bio: "",
    avatarUrl: "",
    email: "",
    location: "",
    socials: { github: "", linkedin: "", website: "", twitter: "" },
    skills: [],
    projects: [], // { id, title, description, link, tags: [] }
    theme: "blueprint",
    updatedAt: null,
  };
}

// --- app -------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const router = express.Router();

// Create a new portfolio, returns its id
router.post("/portfolios", (req, res) => {
  const db = readDb();
  const id = nanoid(10);
  const portfolio = { ...blankPortfolio(), ...req.body, updatedAt: new Date().toISOString() };
  db[id] = portfolio;
  writeDb(db);
  res.status(201).json({ id, portfolio });
});

// List all portfolios (id + name only, for a "my portfolios" list)
router.get("/portfolios", (_req, res) => {
  const db = readDb();
  const list = Object.entries(db).map(([id, p]) => ({
    id,
    name: p.name || "Untitled portfolio",
    title: p.title || "",
    updatedAt: p.updatedAt,
  }));
  res.json(list);
});

// Get one portfolio
router.get("/portfolios/:id", (req, res) => {
  const db = readDb();
  const portfolio = db[req.params.id];
  if (!portfolio) return res.status(404).json({ error: "Portfolio not found" });
  res.json({ id: req.params.id, portfolio });
});

// Update (full replace of editable fields)
router.put("/portfolios/:id", (req, res) => {
  const db = readDb();
  if (!db[req.params.id]) return res.status(404).json({ error: "Portfolio not found" });
  db[req.params.id] = {
    ...db[req.params.id],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  res.json({ id: req.params.id, portfolio: db[req.params.id] });
});

// Delete
router.delete("/portfolios/:id", (req, res) => {
  const db = readDb();
  if (!db[req.params.id]) return res.status(404).json({ error: "Portfolio not found" });
  delete db[req.params.id];
  writeDb(db);
  res.status(204).end();
});

// AI: generate a tagline + bio from name/title/skills (Gemini 2.5 Flash, free tier)
router.post("/ai/generate-bio", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "AI feature not configured. Add GEMINI_API_KEY to server/.env (see README).",
    });
  }

  const { name = "", title = "", tagline = "", skills = [], location = "" } = req.body || {};
  if (!name && !title && skills.length === 0) {
    return res.status(400).json({ error: "Add at least a name, title, or a few skills first." });
  }

  const prompt = `You are helping write content for a personal developer portfolio website.
Person's name: ${name || "Unknown"}
Professional title: ${title || "Unknown"}
Location: ${location || "Unknown"}
Skills: ${skills.length ? skills.join(", ") : "Unknown"}
Existing tagline (may be empty): ${tagline || "(none)"}

Write:
1. A short, punchy tagline (max 10 words, no quotes, no hashtags).
2. A professional "About Me" bio, 2-3 sentences, first person, confident but not arrogant, written for a portfolio website. No markdown, no emojis.

Respond ONLY with strict JSON, no code fences, no extra text, in this exact shape:
{"tagline": "...", "bio": "..."}`;

  try {
    const raw = await callGemini(prompt);
    let parsed;
    try {
      parsed = JSON.parse(stripCodeFences(raw));
    } catch {
      // Fallback: model didn't return clean JSON — use the raw text as the bio.
      parsed = { tagline: tagline || "", bio: stripCodeFences(raw) };
    }
    res.json({
      tagline: parsed.tagline || tagline || "",
      bio: parsed.bio || "",
    });
  } catch (err) {
    console.error("AI generate-bio failed:", err.message);
    res.status(502).json({ error: "Couldn't reach the AI service. Try again in a moment." });
  }
});

app.use("/api", router);

app.get("/", (_req, res) => {
  res.send("Portfolio Builder API is running. Try GET /api/portfolios");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Portfolio Builder API listening on http://localhost:${PORT}`);
});
