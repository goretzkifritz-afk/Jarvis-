export default async function handler(req, res) {
  // CORS für GitHub Pages
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
  // Browser Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // GET = API Status
  if (req.method === "GET") {
    return res.status(200).json({
      status: "online",
      jarvis: "JARVIS API läuft",
      openaiKey: process.env.OPENAI_API_KEY
        ? "vorhanden"
        : "fehlt"
    });
  }
  // Nur POST für Chat
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }
  try {
    // API Key prüfen
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY fehlt"
      });
    }
    // Nachricht aus Request
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Keine Nachricht erhalten"
      });
    }
    // OpenAI Responses API direkt über HTTPS
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5",
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
Halte Antworten übersichtlich und direkt.
          `,
          input: message
        })
      }
    );
    // OpenAI Fehler auslesen
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error(
        "OPENAI ERROR:",
        openaiResponse.status,
        errorText
      );
      return res.status(500).json({
        error: "OpenAI API Fehler",
        status: openaiResponse.status,
        details: errorText
      });
    }
    // Antwort lesen
    const data = await openaiResponse.json();
    // Antworttext extrahieren
    let reply = "";
    if (data.output_text) {
      reply = data.output_text;
    } else if (data.output) {
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const content of item.content) {
            if (content.type === "output_text") {
              reply += content.text;
            }
          }
        }
      }
    }
    if (!reply) {
      return res.status(500).json({
        error: "OpenAI hat keinen Antworttext geliefert",
        details: JSON.stringify(data)
      });
    }
    // Erfolgreiche JARVIS Antwort
    return res.status(200).json({
      reply
    });
  } catch (error) {
    console.error("JARVIS API ERROR:", error);
    return res.status(500).json({
      error: "JARVIS API Fehler",
      details: error?.message || String(error)
    });
  }
}
