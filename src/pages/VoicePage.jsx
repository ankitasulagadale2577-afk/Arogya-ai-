
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Send, Bot,
  AlertTriangle, ShieldCheck, Languages, LoaderCircle,
  Trash2, RotateCcw,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { askAIAssistant } from "../services/aiService.js";

const LOCALES = {
  en: "en-IN",
  mr: "mr-IN",
  hi: "hi-IN",
  kn: "kn-IN",
};

const isSpeechRecognitionSupported =
  typeof window !== "undefined" &&
  Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function VoicePage() {
  const { language, setLanguage, languages, t } = useLanguage();

  const [supported] = useState(isSpeechRecognitionSupported);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    isSpeechRecognitionSupported
      ? ""
      : "Voice input is not supported in this browser. Type your question instead, or try Chrome or Edge."
  );
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const responseRef = useRef("");
  const mountedRef = useRef(false);

  const locale = LOCALES[language] || "en-IN";

  // Initialize the browser speech-recognition engine.
  useEffect(() => {
    mountedRef.current = true;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return () => {
        mountedRef.current = false;
      };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = locale;

    recognition.onstart = () => {
      listeningRef.current = true;
      setListening(true);
      setErrorMessage("");
      setStatusMessage("Listening… speak clearly.");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setSpokenText(transcript.trim());
    };

    recognition.onerror = (event) => {
      listeningRef.current = false;
      setListening(false);

      const messages = {
        "not-allowed":
          "Microphone permission was denied. Allow microphone access in your browser settings.",
        "service-not-allowed":
          "The browser blocked speech recognition. Check your browser permissions.",
        "no-speech":
          "No speech detected. Tap the microphone and try again.",
        "audio-capture":
          "No microphone was found. Connect or enable a microphone.",
        network:
          "Speech recognition network error. Check your internet connection.",
        aborted: "",
      };

      const message =
        messages[event.error] ??
        `Speech recognition failed: ${event.error}.`;

      setStatusMessage(message);
      if (message && event.error !== "no-speech") {
        setErrorMessage(message);
      }
    };

    recognition.onend = () => {
      listeningRef.current = false;
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      mountedRef.current = false;
      listeningRef.current = false;

      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      try {
        recognition.abort();
      } catch {
        // Recognition may already have stopped.
      }

      recognitionRef.current = null;

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [locale]);

  // Stop speech when the user changes the language.
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setErrorMessage("Voice recognition is unavailable. Type your question instead.");
      return;
    }

    if (listeningRef.current) {
      recognition.stop();
      return;
    }

    stopSpeaking();
    setErrorMessage("");
    setStatusMessage("");

    try {
      recognition.lang = LOCALES[language] || "en-IN";
      setSpokenText("");
      recognition.start();
    } catch (error) {
      console.error("Could not start microphone:", error);
      setErrorMessage(
        "The microphone could not start. Wait a moment, check permissions, and try again."
      );
    }
  };

  const speakAnswer = useCallback((text) => {
    if (!text?.trim()) return;

    if (!("speechSynthesis" in window)) {
      setErrorMessage("Spoken playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALES[language] || "en-IN";
    utterance.rate = 0.9;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => {
      setSpeaking(false);
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setStatusMessage(
          "Audio playback failed. Your written answer is still available."
        );
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [language]);

  const handleAskAI = async () => {
    const question = spokenText.trim();

    if (!question || loading) return;

    if (listeningRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore a recognition stop race.
      }
    }

    stopSpeaking();
    setLoading(true);
    setErrorMessage("");
    setStatusMessage("Sending your question to the AI assistant…");
    setAiResponse("");

    try {
      const result = await askAIAssistant(
        [{ role: "user", content: question }],
        language
      );

      if (!mountedRef.current) return;

      if (!result || result.error || !result.reply?.trim()) {
        throw new Error(
          result?.error || "The AI returned an empty response. Please try again."
        );
      }

      responseRef.current = result.reply;
      setAiResponse(result.reply);
      setStatusMessage("Answer ready.");
      speakAnswer(result.reply);
    } catch (error) {
      console.error("Voice assistant AI error:", error);

      if (mountedRef.current) {
        setErrorMessage(
          error?.message ||
          "Could not reach the AI assistant. Check your connection and backend configuration."
        );
        setStatusMessage("Your question was not answered. Please try again.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const clearConversation = () => {
    stopSpeaking();
    setSpokenText("");
    setAiResponse("");
    responseRef.current = "";
    setErrorMessage("");
    setStatusMessage("");
  };

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span
          className="feature-heading-icon"
          style={{ color: "#16845b", background: "#e2f6e9" }}
        >
          <Mic size={27} />
        </span>
        <div>
          <span className="section-kicker">MULTILINGUAL HEALTHCARE</span>
          <h1>{t("voice") || "Voice Assistant"}</h1>
          <p>
            Ask health-education questions in English, Marathi, Hindi, or Kannada.
          </p>
        </div>
      </div>

      <div className="voice-layout">
        <div className="voice-card">
          <span className="section-kicker">VOICE INPUT</span>

          <button
            className={`mic-orb ${listening ? "is-listening" : ""}`}
            onClick={toggleListening}
            type="button"
            disabled={!supported || loading}
            aria-label={listening ? "Stop microphone" : "Start microphone"}
          >
            {listening ? <MicOff size={42} /> : <Mic size={42} />}
          </button>

          <h2>{listening ? "Listening…" : "Tap to speak"}</h2>
          <p>
            {supported
              ? "Allow microphone access and speak in your selected language."
              : "Voice input is unavailable. You can still type a question."}
          </p>

          <button
            className={`button ${listening ? "button-danger" : "button-primary"}`}
            type="button"
            onClick={toggleListening}
            disabled={!supported || loading}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
            {listening ? "Stop listening" : "Start listening"}
          </button>

          <div className="voice-language" style={{ marginTop: 22 }}>
            <Languages size={18} />
            <label htmlFor="voice-lang-select">Language:</label>
            <select
              id="voice-lang-select"
              value={language}
              disabled={loading}
              onChange={(event) => {
                stopSpeaking();
                setLanguage(event.target.value);
                setSpokenText("");
                setStatusMessage("Language changed.");
                setErrorMessage("");
              }}
            >
              {languages.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label} ({item.native})
                </option>
              ))}
            </select>
          </div>

          {statusMessage && (
            <p className="status-message" role="status" aria-live="polite">
              {statusMessage}
            </p>
          )}

          {errorMessage && (
            <div className="error-message" role="alert">
              <AlertTriangle size={17} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="voice-result-column">
          <div className="result-card">
            <h3><Mic size={18} /> Your question</h3>

            <textarea
              value={spokenText}
              onChange={(event) => setSpokenText(event.target.value)}
              placeholder="Your recognized words appear here. You can also type a question…"
              rows={4}
              aria-label="Edit your health question"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 12,
                border: "1px solid #dfe8f6",
                borderRadius: 10,
                resize: "vertical",
                fontSize: 14,
                marginTop: 10,
                fontFamily: "inherit",
              }}
            />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              <button
                className="button button-primary"
                type="button"
                onClick={handleAskAI}
                disabled={!spokenText.trim() || loading}
              >
                {loading ? (
                  <><LoaderCircle size={17} /> Thinking…</>
                ) : (
                  <><Send size={17} /> Ask AI</>
                )}
              </button>

              <button
                className="button button-outline"
                type="button"
                onClick={clearConversation}
                disabled={loading && !spokenText}
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </div>

          <div className="result-card">
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}>
              <h3><Bot size={19} /> AI voice response</h3>

              {aiResponse && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => speaking ? stopSpeaking() : speakAnswer(aiResponse)}
                    style={{ minHeight: 34, padding: "5px 10px" }}
                  >
                    {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    {speaking ? "Stop audio" : "Read aloud"}
                  </button>
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => speakAnswer(aiResponse)}
                    title="Replay response"
                    style={{ minHeight: 34, padding: "5px 10px" }}
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              )}
            </div>

            <p
              aria-live="polite"
              style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                marginTop: 12,
                minHeight: 60,
                color: aiResponse ? "#15345f" : "#8094b0",
              }}
            >
              {loading
                ? "Preparing your answer…"
                : aiResponse || "Your AI response will appear here."}
            </p>
          </div>

          <div className="dashboard-info" style={{ margin: 0 }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <p>
              For health education only, not a diagnosis. Do not rely on this
              assistant for emergencies. Call your local emergency service when
              immediate medical help is needed. Browser speech recognition may
              use external services; privacy depends on your browser and backend.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
