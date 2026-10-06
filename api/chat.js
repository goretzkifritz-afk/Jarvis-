import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Keine Nachricht erhalten." });
    }

    const response = await client.responses.create({
      model: "gpt-6-luna",
      instructions: `
Du bist JARVIS, ein intelligenter persönlicher KI-Assistent.
Antworte immer auf Deutsch.
Sei ruhig, präzise, höflich und intelligent.
Sprich natürlich und nicht wie ein Roboter.
Nenne dich selbst JARVIS.
`,
      input: message,
    });

    return res.status(200).json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "JARVIS konnte gerade keine Antwort erzeugen.",
    });
  }
}
