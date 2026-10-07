import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://goretzkifritz-afk.github.io"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET = einfacher Status-Test
  if (req.method === "GET") {
    return res.status(200).json({
      status: "online",
      jarvis: "JARVIS API läuft",
      openaiKey: process.env.OPENAI_API_KEY
        ? "vorhanden"
        : "fehlt",
    });
  }

  // Nur POST für Chat
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY fehlt",
      });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Keine Nachricht erhalten",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-5",
      instructions: `
Du bist JARVIS, der persönliche KI-Assistent von Fritz.

Antworte immer auf Deutsch.

Du bist:
- ruhig
- intelligent
- präzise
- höflich
- technisch versiert
- natürlich
- selbstbewusst, aber nicht arrogant

Sprich natürlich und nicht wie ein Roboter.
Halte Antworten übersichtlich und direkt.
      `,
      input: message,
    });

    return res.status(200).json({
      reply: response.output_text,
    });

  } catch (error) {
    console.error("JARVIS API ERROR:", error);

    return res.status(500).json({
      error: "JARVIS API Fehler",
      details: error?.message || String(error),
      status: error?.status || 500,
    });
  }
}
