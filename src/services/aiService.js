// ==============================================================================
// ArogyaMitra AI — Real AI Client Service
// Calls secure server-side endpoint (/api/chat) or Supabase Edge Function
// Never exposes private API keys to browser
// ==============================================================================

const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function askAIAssistant(messages, language = "en") {
  const targetUrl = edgeFunctionUrl || "/api/chat";

  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return { reply: null, isEmergency: false, error: "Please enter a question first." };
    }

    const validMessages = messages
      .filter(
        (m) =>
          m &&
          typeof (m.content || m.text) === "string" &&
          ["user", "assistant", "model"].includes(m.role)
      )
      .map((m) => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: (m.content || m.text || "").trim(),
      }))
      .filter((m) => m.content.length > 0);

    if (validMessages.length === 0) {
      return { reply: null, isEmergency: false, error: "Your question is empty. Please enter a question." };
    }

    const headers = {
      "Content-Type": "application/json",
    };

    if (edgeFunctionUrl && supabaseAnonKey) {
      headers["apikey"] = supabaseAnonKey;
      headers["Authorization"] = `Bearer ${supabaseAnonKey}`;
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: validMessages,
        language,
      }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      if (response.status === 503) {
        return {
          reply: null,
          isEmergency: false,
          error:
            data?.error ||
            "AI Provider Key is not yet configured. Please set GEMINI_API_KEY in your server .env file.",
          isConfigured: false,
        };
      }

      return {
        reply: null,
        isEmergency: false,
        error:
          data?.error ||
          data?.message ||
          `Server responded with status ${response.status}. Please ensure the secure backend server is running.`,
      };
    }

    const reply =
      data?.reply ??
      data?.answer ??
      data?.text ??
      data?.data?.reply ??
      data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return {
        reply: null,
        isEmergency: false,
        error: "The AI service responded, but no message content was received.",
      };
    }

    return {
      reply: reply.trim(),
      isEmergency: Boolean(data?.isEmergency),
      language: data?.language || language,
      error: null,
    };
  } catch (err) {
    console.error("ArogyaMitra AI client error:", err);
    return {
      reply: null,
      isEmergency: false,
      error:
        "Could not connect to the AI service. If running locally, ensure Vite dev server or Express backend is active.",
    };
  }
}

export async function checkAIServerHealth() {
  try {
    const res = await fetch("/api/health", { method: "GET" });
    if (!res.ok) {
      return { online: false, healthy: false, aiConfigured: false, message: `Status ${res.status}` };
    }
    const data = await res.json();
    return {
      online: true,
      healthy: true,
      aiConfigured: Boolean(data.aiConfigured),
      provider: data.provider || "gemini",
      message: data.aiConfigured ? "AI service active" : "AI service online, key missing",
    };
  } catch {
    return { online: false, healthy: false, aiConfigured: false, message: "AI backend unreachable" };
  }
}
