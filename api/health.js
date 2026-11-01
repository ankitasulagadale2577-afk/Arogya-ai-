// ==============================================================================
// ArogyaMitra AI — Vercel Serverless Function: /api/health
// ==============================================================================

export default function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const rawKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const geminiKey = rawKey && !rawKey.includes("your_gemini") ? rawKey.trim() : null;
  const openaiKey = process.env.OPENAI_API_KEY;

  res.status(200).json({
    status: "ok",
    service: "ArogyaMitra AI Serverless",
    aiConfigured: Boolean(geminiKey || openaiKey),
    provider: geminiKey ? "gemini" : (openaiKey ? "openai" : "none"),
  });
}
