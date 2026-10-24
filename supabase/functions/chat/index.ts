// Supabase Edge Function: AI Health Assistant
// Runs on Deno / Supabase Edge Runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMERGENCY_KEYWORDS = [
  "chest pain",
  "heart attack",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "severe bleeding",
  "heavy bleeding",
  "stroke",
  "facial drooping",
  "unconscious",
  "poisoning",
  "seizure",
  "choking"
];

function checkEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' array in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const latestMessage = messages[messages.length - 1];
    const userText = latestMessage?.content || latestMessage?.text || "";

    const isEmergency = checkEmergency(userText);

    // Language guidelines for the AI
    const languageMap: Record<string, string> = {
      en: "English",
      mr: "Marathi (मराठी)",
      hi: "Hindi (हिन्दी)",
      kn: "Kannada (ಕನ್ನಡ)",
    };

    const targetLanguage = languageMap[language] || "English";

    const systemPrompt = `You are ArogyaMitra AI, an empathetic, evidence-based healthcare educational assistant for India.
Primary Language: You MUST reply fluently in ${targetLanguage}.
Essential Rules:
1. Provide clear, supportive, and scientifically grounded general health education.
2. DO NOT provide a definitive diagnosis or replace a licensed physician.
3. If the user mentions red flag symptoms or a medical emergency, advise immediate emergency care (calling 112 or visiting the nearest emergency department).
4. Explain conditions in simple, beginner-friendly terms.
5. Emphasize lifestyle, hydration, nutrition, and when to seek professional in-person medical care.
6. Never recommend prescription drug dosages or dangerous off-label treatments.
7. Keep responses concise, clear, and easy to read.`;

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    let replyText = "";

    if (geminiKey) {
      // Use Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      
      const contents = [
        {
          role: "user",
          parts: [{ text: `System instruction: ${systemPrompt}` }]
        },
        ...messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || m.text || "" }]
        }))
      ];

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.4,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to formulate a response.";

    } else if (openaiKey) {
      // Use OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content || m.text || ""
            }))
          ],
          max_tokens: 800,
          temperature: 0.4,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      replyText = data.choices?.[0]?.message?.content || "I was unable to formulate a response.";

    } else {
      return new Response(
        JSON.stringify({
          error: "AI provider not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in Supabase Edge Function Secrets.",
          isConfigured: false
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        reply: replyText,
        isEmergency,
        language: targetLanguage
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
