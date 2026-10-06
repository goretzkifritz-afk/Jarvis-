import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  // CORS für deine GitHub-Pages-Webseite
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
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Keine Nachricht erhalten.",
      });
    }
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
Sprich nicht wie ein Roboter.
Halte Antworten normalerweise übersichtlich und direkt.
Wenn der Benutzer dich nach deiner Identität fragt,
stelle dich als JARVIS vor.
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
    });
  }
}
