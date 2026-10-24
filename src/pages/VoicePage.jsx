// ==============================================================================
// ArogyaMitra AI — Multilingual Voice Assistant
// Web Speech Recognition + Real AI Backend + Speech Synthesis
// ==============================================================================

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Bot,
  AlertTriangle,
  ShieldCheck,
  Languages,
  LoaderCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { askAIAssistant } from "../services/aiService.js";

const SPEECH_LOCALES = {
  en: "en-IN",
  mr: "mr-IN",
  hi: "hi-IN",
  kn: "kn-IN",
};

export default function VoicePage() {
  const { language, setLanguage, languages, t } = useLanguage();
  const isSpeechSupported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const [listening, setListening] = useState(false);
  const [supported] = useState(isSpeechSupported);
  const [spokenText, setSpokenText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    isSpeechSupported
      ? ""
      : "Voice recognition is not natively supported by this browser. You can type your question below or use Chrome/Edge for voice input."
  );
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LOCALES[language] || "en-IN";

    recognition.onstart = () => {
      setListening(true);
      setErrorMessage("");
      setStatusMessage(t("listening"));
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setSpokenText(final || interim);
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed") {
        setErrorMessage(
          "Microphone permission was denied. Please allow microphone access in your browser address bar and try again."
        );
      } else if (event.error === "no-speech") {
        setStatusMessage("No speech was detected. Tap the microphone and try speaking again.");
      } else {
        setErrorMessage(`Speech recognition error: ${event.error}.`);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, t]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setErrorMessage("");
      setStatusMessage("");
      try {
        recognitionRef.current.lang = SPEECH_LOCALES[language] || "en-IN";
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  };

  const handleAskAI = async (textToSubmit = spokenText) => {
    const text = textToSubmit.trim();
    if (!text || loading) return;

    setLoading(true);
    setErrorMessage("");
    setAiResponse("");

    // Cancel any previous speech playback
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const result = await askAIAssistant([{ role: "user", content: text }], language);
    setLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setAiResponse(result.reply);

    // Speak response automatically
    speakAnswer(result.reply);
  };

  const speakAnswer = (textToSpeak = aiResponse) => {
    if (!("speechSynthesis" in window) || !textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = SPEECH_LOCALES[language] || "en-IN";
    utterance.rate = 0.95; // Slightly slower for clarity in medical guidance

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon" style={{ color: "#8553ed", background: "#f0e7ff" }}>
          <Mic size={27} />
        </span>
        <div>
          <span className="section-kicker">HANDS-FREE ACCESSIBLE HEALTHCARE</span>
          <h1>{t("voice")}</h1>
          <p>Speak in English, Marathi, Hindi, or Kannada and listen to spoken educational guidance.</p>
        </div>
      </div>

      <div className="voice-layout">
        <div className="voice-card">
          <span className="section-kicker">VOICE INPUT</span>

          <button
            className={`mic-orb ${listening ? "is-listening" : ""}`}
            onClick={toggleListening}
            type="button"
            aria-label={listening ? "Stop microphone" : "Start microphone"}
            disabled={!supported}
          >
            <span className="mic-ring ring-one" />
            <span className="mic-ring ring-two" />
            {listening ? <MicOff size={42} /> : <Mic size={42} />}
          </button>

          <h2>{listening ? t("listening") : "Tap Microphone to Speak"}</h2>
          <p>
            {supported
              ? "Ensure your microphone is connected and speak clearly in your chosen language."
              : "Speech recognition is unavailable in this browser. Please type below."}
          </p>

          <button
            className={`button ${listening ? "button-danger" : "button-primary"}`}
            onClick={toggleListening}
            type="button"
            disabled={!supported}
            style={{ marginTop: "10px" }}
          >
            {listening ? (
              <>
                <MicOff size={18} /> {t("stopListening")}
              </>
            ) : (
              <>
                <Mic size={18} /> {t("startListening")}
              </>
            )}
          </button>

          {statusMessage && (
            <p className="status-message" style={{ marginTop: "15px", textAlign: "left" }}>
              {statusMessage}
            </p>
          )}

          {errorMessage && (
            <div className="error-message" style={{ marginTop: "15px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={16} /> <span>{errorMessage}</span>
              </div>
              {errorMessage.includes("GEMINI_API_KEY") && (
                <small style={{ color: "#5a3a12", background: "#fff5ea", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ebd9bf" }}>
                  Add <code>GEMINI_API_KEY=AIzaSy...</code> from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: "#0866f5", textDecoration: "underline" }}>Google AI Studio</a> to your <code>.env</code> file.
                </small>
              )}
            </div>
          )}

          <div className="voice-language">
            <Languages size={18} />
            <label htmlFor="voice-lang-select" style={{ fontWeight: 600 }}>
              Speaking Language:
            </label>
            <select
              id="voice-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                marginLeft: "8px",
                padding: "4px 8px",
                borderRadius: "8px",
                border: "1px solid #c9d8ee",
                background: "white",
                fontSize: "12px",
              }}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} ({l.native})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results & Speech Synthesis playback */}
        <div className="voice-result-column">
          <div className="result-card">
            <h3>
              <Mic size={18} /> Recognized Question (Editable)
            </h3>
            <textarea
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              placeholder="Your spoken words will appear here. You can also edit or type manually..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #dfe8f6",
                borderRadius: "10px",
                resize: "vertical",
                fontSize: "13px",
                marginTop: "10px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                className="button button-primary"
                type="button"
                onClick={() => handleAskAI()}
                disabled={!spokenText.trim() || loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={16} style={{ animation: "spin 1s linear infinite" }} /> Asking AI...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit to AI
                  </>
                )}
              </button>
              {spokenText && (
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => {
                    setSpokenText("");
                    setAiResponse("");
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="result-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3>
                <Bot size={18} /> Assistant Voice Response
              </h3>
              {aiResponse && (
                <div style={{ display: "flex", gap: "8px" }}>
                  {speaking ? (
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={stopSpeaking}
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "11px", color: "#ed4765" }}
                    >
                      <VolumeX size={15} /> Stop Voice
                    </button>
                  ) : (
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() => speakAnswer()}
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "11px" }}
                    >
                      <Volume2 size={15} /> {t("readAloud")}
                    </button>
                  )}
                </div>
              )}
            </div>

            <p style={{ marginTop: "12px", minHeight: "60px", color: aiResponse ? "#15345f" : "#8094b0" }}>
              {aiResponse || "Submit a spoken or written health question to hear the assistant's voice response."}
            </p>
          </div>

          <div className="dashboard-info" style={{ margin: 0 }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <p>
              Audio is processed through browser speech synthesis and your private server AI. No recordings are retained or
              monetized.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
