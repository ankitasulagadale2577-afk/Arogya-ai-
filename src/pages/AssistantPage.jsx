// ==============================================================================
// ArogyaMitra AI — Real AI Health Assistant
// Connected to Secure Server-Side AI API & Supabase Conversation History
// ==============================================================================


import { useState, useEffect, useRef } from "react";
import {
  Bot,
  UserRound,
  Send,
  Trash2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Phone,
  LoaderCircle,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { askAIAssistant } from "../services/aiService.js";
import { chatDbService } from "../services/supabase.js";

const SUGGESTED_PROMPTS = {
  en: [
    "How can I sleep better?",
    "What is a balanced diet?",
    "What are common symptoms of dehydration?",
    "How can I prevent seasonal infections?",
    "Explain blood pressure in simple language.",
  ],
  mr: [
    "मला चांगली झोप कशी येईल?",
    "समतोल आहार म्हणजे काय?",
    "डिहायड्रेशनची (पाणी कमी होण्याची) लक्षणे कोणती?",
    "हंगामी संसर्ग कसे टाळावेत?",
    "रक्तदाब (Blood Pressure) सोप्या भाषेत समजवा.",
  ],
  hi: [
    "मुझे अच्छी नींद कैसे आ सकती है?",
    "संतुलित आहार क्या होता है?",
    "डिहाइड्रेशन (शरीर में पानी की कमी) के लक्षण क्या हैं?",
    "मौसमी संक्रमण से कैसे बचें?",
    "ब्लड प्रेशर को सरल भाषा में समझाएं।",
  ],
  kn: [
    "ನಾನು ಚೆನ್ನಾಗಿ ನಿದ್ರೆ ಮಾಡುವುದು ಹೇಗೆ?",
    "ಸಮತೋಲಿತ ಆಹಾರ ಎಂದರೇನು?",
    "ನಿರ್ಜಲೀಕರಣದ ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು ಯಾವುವು?",
    "ಋತುಮಾನದ ಸೋಂಕುಗಳನ್ನು ತಡೆಗಟ್ಟುವುದು ಹೇಗೆ?",
    "ರಕ್ತದೊತ್ತಡವನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ.",
  ],
};

let messageCounter = 0;
const generateMsgId = () => `temp-msg-${Date.now()}-${++messageCounter}`;

export default function AssistantPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [apiError, setApiError] = useState("");
  const messagesEndRef = useRef(null);

  // Load user's conversations from Supabase
  useEffect(() => {
    let active = true;
    async function loadConversations() {
      if (!user) return;
      const { data } = await chatDbService.getConversations(user.id);
      if (active && data) {
        setConversations(data);
        if (data.length > 0) {
          setCurrentConversation((curr) => curr || data[0]);
        }
      }
    }
    loadConversations();
    return () => {
      active = false;
    };
  }, [user]);

  // Load messages whenever current conversation changes
  useEffect(() => {
    let active = true;
    async function loadMessages() {
      if (!currentConversation) {
        setMessages([]);
        return;
      }
      const { data } = await chatDbService.getMessages(currentConversation.id);
      if (active && data) {
        setMessages(data);
      }
    }
    loadMessages();
    return () => {
      active = false;
    };
  }, [currentConversation]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleStartNewChat = async () => {
    if (!user) return;
    const title = `Health Chat ${new Date().toLocaleDateString()}`;
    const { data } = await chatDbService.createConversation(user.id, title, language);
    if (data) {
      setConversations((prev) => [data, ...prev]);
      setCurrentConversation(data);
      setMessages([]);
      setEmergencyAlert(false);
      setApiError("");
    }
  };

  const handleSendMessage = async (textToSend = input) => {
    const text = textToSend.trim();
    if (!text || loading || !user) return;

    setInput("");
    setApiError("");

    // Create a conversation if none exists
    let activeConv = currentConversation;
    if (!activeConv) {
      const title = text.slice(0, 30) + "...";
      const { data } = await chatDbService.createConversation(user.id, title, language);
      if (data) {
        activeConv = data;
        setConversations((prev) => [data, ...prev]);
        setCurrentConversation(data);
      } else {
        return setApiError("Could not start conversation session.");
      }
    }

    // Append user message optimistically
    const optimisticUserMsg = {
      id: generateMsgId(),
      conversation_id: activeConv.id,
      user_id: user.id,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setLoading(true);

    // Save user message to database
    await chatDbService.addMessage(activeConv.id, user.id, "user", text);

    // Prepare message history for AI
    const historyPayload = messages.concat(optimisticUserMsg).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Call real AI service
    const aiResult = await askAIAssistant(historyPayload, language);

    setLoading(false);

    if (aiResult.error) {
      setApiError(aiResult.error);
      return;
    }

    if (aiResult.isEmergency) {
      setEmergencyAlert(true);
    }

    // Append AI response
    const optimisticAiMsg = {
      id: generateMsgId(),
      conversation_id: activeConv.id,
      user_id: user.id,
      role: "assistant",
      content: aiResult.reply,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticAiMsg]);

    // Save AI response to database
    await chatDbService.addMessage(activeConv.id, user.id, "assistant", aiResult.reply);
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    await chatDbService.deleteConversation(convId);
    const updated = conversations.filter((c) => c.id !== convId);
    setConversations(updated);
    if (currentConversation?.id === convId) {
      setCurrentConversation(updated[0] || null);
      setMessages([]);
    }
  };

  const suggestions = SUGGESTED_PROMPTS[language] || SUGGESTED_PROMPTS.en;

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon">
          <Bot size={27} />
        </span>
        <div>
          <span className="section-kicker">AROGYAMITRA AI</span>
          <h1>{t("assistant")}</h1>
          <p>Evidence-based, multilingual health information powered by AI.</p>
        </div>
      </div>

      {emergencyAlert && (
        <div
          className="emergency-alert"
          style={{ marginBottom: "20px", border: "2px solid #ed4765" }}
        >
          <AlertTriangle size={28} />
          <div>
            <strong>Potential Medical Emergency Detected</strong>
            <p>
              Your inquiry describes symptoms that may require urgent medical evaluation. Do not delay emergency
              care. Call 112 immediately or proceed to the nearest emergency department.
            </p>
          </div>
          <a href="tel:112" className="button button-danger">
            <Phone size={16} /> Call 112
          </a>
        </div>
      )}

      <div className="chat-layout">
        <div className="chat-card">
          <div className="chat-top">
            <span className="online-dot" />
            <div>
              <strong>ArogyaMitra Health Assistant</strong>
              <small>Evidence-based AI · Multilingual Mode</small>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                className="button button-outline"
                onClick={handleStartNewChat}
                style={{ minHeight: "34px", padding: "6px 12px", fontSize: "11px" }}
                title="Start a new conversation"
              >
                <Plus size={14} /> New Chat
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <span className="feature-icon blue">
                  <Bot size={28} />
                </span>
                <h2>Namaste & Welcome 👋</h2>
                <p>
                  Ask any health, wellness, or prevention question. I can explain conditions, nutrition, and symptoms in
                  simple terms.
                </p>
                <div className="suggestion-grid">
                  {suggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      <span>{prompt}</span>
                      <Sparkles size={14} style={{ color: "#0866f5", flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`chat-message ${m.role}`}>
                <span className="message-avatar">
                  {m.role === "user" ? <UserRound size={17} /> : <Bot size={17} />}
                </span>
                <div>
                  <small>{m.role === "user" ? "You" : "ArogyaMitra AI"}</small>
                  <p>{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="typing-indicator" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LoaderCircle size={15} style={{ animation: "spin 1s linear infinite" }} />
                <span>Consulting health database and formulating answer...</span>
              </div>
            )}

            {apiError && (
              <div
                className="status-message"
                style={{
                  margin: "12px 0",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#fff9f0",
                  border: "1px solid #fae8cc",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  color: "#83531b"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                  <AlertTriangle size={18} style={{ color: "#d88316" }} />
                  <span>Real AI Provider Setup Required</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#6a4a1d" }}>
                  {apiError}
                </p>
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#5a3a12", background: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ebd9bf" }}>
                  <strong>How to enable real AI in 30 seconds:</strong>
                  <ol style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    <li>Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: "#0866f5", textDecoration: "underline", fontWeight: 700 }}>Google AI Studio (free)</a></li>
                    <li>Open your project's <code>.env</code> file in VS Code</li>
                    <li>Set <code>GEMINI_API_KEY=your_copied_key_here</code></li>
                    <li>Restart the development server: <code>npm run dev</code></li>
                  </ol>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("askQuestion")}
              aria-label="Ask health question"
              disabled={loading}
              maxLength={2000}
            />
            <button
              className="button button-primary"
              type="submit"
              disabled={!input.trim() || loading}
            >
              <Send size={16} /> {t("send")}
            </button>
          </form>

          <p className="safety-note">
            <ShieldCheck size={15} /> {t("disclaimer")}
          </p>
        </div>

        {/* Conversation History & Side Tips */}
        <aside className="side-tip-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "14px" }}>
              <MessageSquare size={16} style={{ verticalAlign: "middle", marginRight: "6px" }} />
              Past Conversations
            </h3>
            <button
              onClick={handleStartNewChat}
              style={{ border: 0, background: "none", color: "#0866f5", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}
            >
              + New
            </button>
          </div>

          <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "20px" }}>
            {conversations.length === 0 ? (
              <p style={{ color: "#8ca0be", fontSize: "11px" }}>No previous conversations saved.</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setCurrentConversation(c)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    marginBottom: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: currentConversation?.id === c.id ? "#eaf2ff" : "#f7f9fd",
                    color: currentConversation?.id === c.id ? "#0866f5" : "#324e73",
                    fontWeight: currentConversation?.id === c.id ? 700 : 500,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                    {c.title}
                  </span>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    style={{ border: 0, background: "none", color: "#9aaec7", cursor: "pointer", padding: "2px" }}
                    title="Delete chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: "1px solid #eef3fb", paddingTop: "14px" }}>
            <span className="feature-icon purple" style={{ width: "38px", height: "38px" }}>
              <Sparkles size={18} />
            </span>
            <h3 style={{ marginTop: "10px" }}>Safety Tips</h3>
            <p>
              Share symptoms objectively. Never enter bank details, government ID numbers, or passwords. In case of chest
              tightness, severe bleeding, or loss of consciousness, dial 112 immediately.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
