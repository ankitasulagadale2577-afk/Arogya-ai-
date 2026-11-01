import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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

function isMedicalEmergency(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
}

const LANGUAGE_MAP = {
  en: "English",
  mr: "Marathi (मराठी)",
  hi: "Hindi (हिन्दी)",
  kn: "Kannada (ಕನ್ನಡ)",
};

function aiDevMiddleware(env) {
  return {
    name: 'ai-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/health', (_req, res) => {
        const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        const isConfigured = Boolean(geminiKey && !geminiKey.includes("your_gemini") || openaiKey);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          service: 'ArogyaMitra AI Integrated Dev Server',
          aiConfigured: isConfigured,
          provider: geminiKey ? 'gemini' : (openaiKey ? 'openai' : 'none')
        }));
      });

      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');

          try {
            const { messages, language = 'en' } = JSON.parse(body || '{}');
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Messages array is required.' }));
              return;
            }

            const latestMessage = messages[messages.length - 1];
            const userText = latestMessage?.content || latestMessage?.text || '';
            const emergency = isMedicalEmergency(userText);
            const targetLanguage = LANGUAGE_MAP[language] || "English";

            const rawKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            const geminiKey = rawKey && !rawKey.includes("your_gemini") ? rawKey.trim() : null;
            const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

            if (!geminiKey && !openaiKey) {
              res.statusCode = 503;
              res.end(JSON.stringify({
                error: 'AI Provider Key not configured. Please add your GEMINI_API_KEY to your .env file.',
                isConfigured: false
              }));
              return;
            }

            const systemPrompt = `You are ArogyaMitra AI, an empathetic, evidence-based healthcare educational assistant for India.
Primary Language: You MUST reply fluently in ${targetLanguage}.
Essential Rules:
1. Provide clear, supportive, and scientifically grounded general health education.
2. DO NOT provide a definitive diagnosis or replace a licensed physician.
3. If the user mentions red flag symptoms or a medical emergency, advise immediate emergency care (calling 112 in India or visiting the nearest emergency department).
4. Explain conditions in simple, beginner-friendly terms.
5. Emphasize lifestyle, hydration, nutrition, and when to seek professional in-person medical care.
6. Never recommend prescription drug dosages or dangerous off-label treatments.
7. Keep responses concise, clear, and easy to read.`;

            let replyText = '';

            if (geminiKey) {
              const geminiModels = [
                'gemini-3.5-flash',
                'gemini-3.8-flash',
                'gemini-flash-latest',
                'gemini-2.5-flash',
                'gemini-2.5-flash-lite'
              ];

              const contents = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content || m.text || '' }]
              }));

              let lastErr = '';
              let lastStatus = 500;

              for (const model of geminiModels) {
                try {
                  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
                  const geminiRes = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      systemInstruction: { parts: [{ text: systemPrompt }] },
                      contents,
                      generationConfig: {
                        maxOutputTokens: 800,
                        temperature: 0.3
                      }
                    })
                  });

                  if (geminiRes.ok) {
                    const data = await geminiRes.json();
                    replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (replyText) break;
                  } else {
                    lastStatus = geminiRes.status;
                    lastErr = await geminiRes.text();
                  }
                } catch (e) {
                  lastErr = e.message;
                }
              }

              if (!replyText) {
                res.statusCode = lastStatus;
                res.end(JSON.stringify({ error: `Gemini API error: ${lastStatus}`, details: lastErr }));
                return;
              }
            } else if (openaiKey) {
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
                    ...messages.map((m) => ({
                      role: m.role,
                      content: m.content || m.text || ""
                    }))
                  ],
                  max_tokens: 800,
                  temperature: 0.3,
                })
              });

              if (!response.ok) {
                const errData = await response.text();
                res.statusCode = response.status;
                res.end(JSON.stringify({ error: `OpenAI API error: ${response.status}`, details: errData }));
                return;
              }

              const data = await response.json();
              replyText = data.choices?.[0]?.message?.content || 'No response formulated.';
            }

            res.end(JSON.stringify({
              reply: replyText,
              isEmergency: emergency,
              language: targetLanguage
            }));

          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Server error: ' + (err.message || 'unknown') }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), aiDevMiddleware(env)],
    server: {
      port: 5173,
    },
  };
});
