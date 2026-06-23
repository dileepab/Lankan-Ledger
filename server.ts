import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy initializer for Google Gen AI client with appropriate telemetry
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// REST route: AI Co-Pilot Assistant
app.post("/api/gemini/co-pilot", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required parameters." });
    }

    const ai = getAI();
    
    const prompt = `You are a legendary Senior Journalist and Managing Director at "Lankan Ledger" — a premium national newspaper. Analyze this article:
Headline: "${title}"
Body: "${content}"

Task:
Generate:
1. One captivating, professional summary subtitle (around 15-20 words, in an elegant, authoritative journalistic style, with a strong hook - no emojis).
2. A list of exactly 4-5 relevant, highly impactful categorization tags in UPPERCASE (e.g., "IMF", "PORT DEVELOPMENT", "FOREIGN INVESTMENT", "AGRICULTURE").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedSubtitle: {
              type: Type.STRING,
              description: "Elegant, authoritative summary subtitle around 15-20 words, with a strong hook and no emojis."
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of exactly 4-5 relevant, highly impactful categorization tags in UPPERCASE."
            }
          },
          required: ["suggestedSubtitle", "suggestedTags"]
        }
      }
    });

    const responseText = response.text?.trim() || "";
    try {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON. Raw was:", responseText);
      return res.json({
        suggestedSubtitle: "A comprehensive reporting analyze of current market dynamics and national interests.",
        suggestedTags: ["SRI LANKA", "LATEST"]
      });
    }

  } catch (err) {
    console.error("Gemini Co-Pilot Service Error:", err);
    res.status(500).json({ 
      error: err instanceof Error ? err.message : "Internal system error occurred in the Desk Co-Pilot nodes." 
    });
  }
});

// REST route: AI Article Translation Service
app.post("/api/gemini/translate", async (req, res) => {
  try {
    const { title, subtitle, content, targetLanguage } = req.body;
    if (!title || !content || !targetLanguage) {
      return res.status(400).json({ error: "title, content, and targetLanguage are required parameters." });
    }

    const ai = getAI();
    const languageLabel = targetLanguage === "SI" || targetLanguage === "Sinhala" ? "Sinhala (සිංහල)" : "Tamil (தமிழ்)";

    const prompt = `You are an elite bilingual Senior Editor and Chief Translator at "Lankan Ledger".
Your task is to translate this English news report into highly fluent, grammatically accurate, and professional journalistic ${languageLabel}.

Source Article:
- Headline (Title): "${title}"
- Subheading (Subtitle): "${subtitle || "(None)"}"
- Body Content:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The translated Headline (Title)."
            },
            subtitle: {
              type: Type.STRING,
              description: "The translated Subheading (Subtitle)."
            },
            content: {
              type: Type.STRING,
              description: "The translated Body Content, preserving paragraphs and structure."
            }
          },
          required: ["title", "subtitle", "content"]
        }
      }
    });

    const responseText = response.text?.trim() || "";
    try {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse Translation output as JSON. Raw response was:", responseText);
      // Fallback response with raw values translated gracefully or annotated
      return res.json({
        title: title + ` [Translated to ${languageLabel}]`,
        subtitle: subtitle ? subtitle + ` [Translated to ${languageLabel}]` : "",
        content: content + `\n\n[Translation to ${languageLabel} failed to parse, showing raw content.]`
      });
    }

  } catch (err) {
    console.error("Gemini Translation Service Error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Internal translation system error occurred."
    });
  }
});

// Serve Vite dev server or static builds
const startHostServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Lankan Ledger host system booted on http://0.0.0.0:${PORT}`);
  });
};

startHostServer();
