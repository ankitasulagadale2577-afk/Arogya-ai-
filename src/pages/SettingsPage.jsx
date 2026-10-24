// ==============================================================================
// ArogyaMitra AI — Application Settings & Connectivity Status
// ==============================================================================

import { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  Sparkles,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Server,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage, LANGUAGES } from "../context/LanguageContext.jsx";
import { checkAIServerHealth } from "../services/aiService.js";

export default function SettingsPage() {
  const { preferences, updatePreferences, isConfigured } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [compact, setCompact] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [serverStatus, setServerStatus] = useState({ online: false, aiConfigured: false, checking: true });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isCompact = compact !== null ? compact : Boolean(preferences?.compact_cards);
  const isNotifications = notifications !== null ? notifications : Boolean(preferences?.notifications_enabled);

  useEffect(() => {
    let active = true;
    async function checkServer() {
      const res = await checkAIServerHealth();
      if (active) {
        setServerStatus({ ...res, checking: false });
      }
    }
    checkServer();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveSettings = async () => {
    await updatePreferences({
      compact_cards: isCompact,
      notifications_enabled: isNotifications,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon">
          <Settings size={27} />
        </span>
        <div>
          <span className="section-kicker">APPLICATION PREFERENCES</span>
          <h1>{t("settings")}</h1>
          <p>Customize language, display density, and check service connectivity.</p>
        </div>
      </div>

      <div className="settings-list panel-card">
        {/* Language setting */}
        <div className="settings-row">
          <span className="feature-icon blue">
            <Globe size={22} />
          </span>
          <div>
            <strong>Interface & Assistant Language</strong>
            <p>Select the default language used for navigation, chatbot explanations, and speech synthesis.</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Application Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label} ({l.native})
              </option>
            ))}
          </select>
        </div>

        {/* Compact card layout */}
        <div className="settings-row">
          <span className="feature-icon purple">
            <Sparkles size={22} />
          </span>
          <div>
            <strong>{t("compactCards")}</strong>
            <p>Reduce card padding for high-density information display on wide desktop monitors.</p>
          </div>
          <input
            type="checkbox"
            checked={isCompact}
            onChange={(e) => setCompact(e.target.checked)}
            aria-label="Toggle compact cards"
          />
        </div>

        {/* Notifications */}
        <div className="settings-row">
          <span className="feature-icon orange">
            <Bell size={22} />
          </span>
          <div>
            <strong>{t("notifications")}</strong>
            <p>Allow browser reminders for upcoming vaccination dates and urgent health alerts.</p>
          </div>
          <input
            type="checkbox"
            checked={isNotifications}
            onChange={(e) => {
              setNotifications(e.target.checked);
              if (e.target.checked && "Notification" in window) {
                Notification.requestPermission();
              }
            }}
            aria-label="Toggle browser notifications"
          />
        </div>

        {/* Backend Connectivity Status */}
        <div className="settings-row">
          <span className="feature-icon cyan">
            <Server size={22} />
          </span>
          <div>
            <strong>Backend & AI Service Status</strong>
            <p>
              Supabase Auth:{" "}
              <strong style={{ color: isConfigured ? "#087b57" : "#d88316" }}>
                {isConfigured ? "Connected (Live Cloud RLS)" : "Local Development Sandbox"}
              </strong>{" "}
              · Local AI Server:{" "}
              <strong style={{ color: serverStatus.online ? "#087b57" : "#7084a3" }}>
                {serverStatus.checking
                  ? "Checking..."
                  : serverStatus.online
                  ? `Active (${serverStatus.aiConfigured ? "API Key Loaded" : "Key Needed"})`
                  : "Inactive (Start with 'npm run server')"}
              </strong>
            </p>
          </div>
        </div>

        {/* Safety & Compliance info */}
        <div className="settings-row">
          <span className="feature-icon indigo">
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>Medical Safety & Privacy Safeguards</strong>
            <p>
              All conversations are handled with medical safety guardrails. User records are strictly partitioned using
              Supabase Row Level Security. ArogyaMitra AI does not share health inquiries with third-party advertisers.
            </p>
          </div>
        </div>

        <button className="button button-primary" type="button" onClick={handleSaveSettings}>
          Save Settings
        </button>

        {savedSuccess && (
          <p className="success-message" style={{ marginTop: "12px" }}>
            <CheckCircle2 size={16} /> Preferences successfully updated.
          </p>
        )}
      </div>
    </section>
  );
}
