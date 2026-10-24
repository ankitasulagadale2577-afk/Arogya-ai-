// ==============================================================================
// ArogyaMitra AI — AI Client Service
// Calls secure server-side endpoint (/api/chat) or Supabase Edge Function
// Never exposes private API keys to browser
// ==============================================================================

const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;

export async function askAIAssistant(messages, language = "en") {
  const targetUrl = edgeFunctionUrl || "/api/chat";

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        language,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 503) {
        return {
          reply: null,
          isEmergency: false,
          error: "AI Provider Key is not yet configured. Please set GEMINI_API_KEY in your server .env file or Supabase Edge Function Secrets.",
          isConfigured: false,
        };
      }

      return {
        reply: null,
        isEmergency: false,
        error: data?.error || `Server responded with status ${response.status}. Please ensure the secure backend server is running.`,
      };
    }

    return {
      reply: data?.reply || "No response received.",
      isEmergency: Boolean(data?.isEmergency),
      language: data?.language,
      error: null,
    };
  } catch {
    return {
      reply: null,
      isEmergency: false,
      error: "Could not connect to the AI service. If testing locally, please start the secure backend server using 'npm run server'.",
    };
  }
}

export async function checkAIServerHealth() {
  try {
    const res = await fetch("/api/health", { method: "GET" });
    if (!res.ok) return { online: false, aiConfigured: false };
    const data = await res.json();
    return { online: true, aiConfigured: data.aiConfigured, provider: data.provider };
  } catch {
    return { online: false, aiConfigured: false };
  }
}
