import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  // CORS für GitHub Pages
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://goretzkifritz-afk.github.io"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
  // Browser-Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // Nur POST erlauben
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }
  try {
    const { message } = req.body || {};
    // Nachricht prüfen
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Keine Nachricht erhalten.",
      });
    }
    // Prüfen ob API-Key vorhanden ist
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY fehlt in Vercel.");
      return res.status(500).json({
        error: "OPENAI_API_KEY ist nicht gesetzt.",
      });
    }
    // OpenAI Responses API
    const response = await client.responses.create({
      model: "gpt-6-luna",
      instructions: `
Du bist JARVIS, der persönliche KI-Assistent von Fritz.
Antworte immer auf Deutsch.
Dein Charakter:
- ruhig
- intelligent
- präzise
- höflich
- technisch versiert
- natürlich
- selbstbewusst, aber nicht arrogant
Sprich natürlich und nicht wie ein Roboter.
Nenne dich selbst JARVIS, wenn nach deiner Identität gefragt wird.
Halte Antworten normalerweise übersichtlich und direkt.
`,
      input: message,
    });
    return res.status(200).json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("JARVIS API ERROR:", error);
    return res.status(500).json({
      error: "JARVIS konnte gerade keine Antwort erzeugen.",
      details: error?.message || "Unbekannter Fehler",
    });
  }
}
