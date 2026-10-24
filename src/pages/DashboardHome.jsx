import { Link } from "react-router-dom";
import {
  HeartPulse,
  Bot,
  Mic,
  Hospital,
  Syringe,
  Siren,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const firstName =
    profile?.full_name?.trim()?.split(/\s+/)[0] ||
    user?.user_metadata?.full_name?.trim()?.split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const features = [
    {
      title: t("assistant"),
      path: "/assistant",
      icon: Bot,
      color: "blue",
      description: "Chat with the AI health assistant about symptoms, lifestyle, and prevention.",
    },
    {
      title: t("voice"),
      path: "/voice",
      icon: Mic,
      color: "purple",
      description: "Hands-free voice recognition with real-time speech responses in your language.",
    },
    {
      title: t("hospitals"),
      path: "/hospitals",
      icon: Hospital,
      color: "cyan",
      description: "Locate nearby hospitals, clinics, and doctors with interactive map and directions.",
    },
    {
      title: t("vaccination"),
      path: "/vaccination",
      icon: Syringe,
      color: "orange",
      description: "Universal Immunisation Programme schedules and personalized reminders.",
    },
    {
      title: t("emergency"),
      path: "/emergency",
      icon: Siren,
      color: "red",
      description: "Emergency numbers in India (112, 108), rapid calling links, and first-aid steps.",
    },
    {
      title: t("library"),
      path: "/library",
      icon: BookOpen,
      color: "indigo",
      description: "Search medically reviewed articles on wellness, diabetes, and nutrition.",
    },
  ];

  return (
    <>
      <section className="dashboard-welcome">
        <div>
          <span className="section-kicker">YOUR HEALTH, ONE PLACE</span>
          <h1>Hello, {firstName}! 👋</h1>
          <p>How can we assist you with your health information today?</p>
        </div>
        <span className="welcome-art">
          <HeartPulse size={43} />
        </span>
      </section>

      <div className="dashboard-section-title">
        <div>
          <h2>{t("quickAccess")}</h2>
          <p>{t("quickAccessSub")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href="tel:112"
            className="button button-danger"
            style={{ minHeight: "36px", padding: "6px 14px", fontSize: "12px" }}
          >
            <Phone size={14} /> Emergency 112
          </a>
          <span className="live-pill">
            <span /> Active Health Portal
          </span>
        </div>
      </div>

      <div className="dashboard-feature-grid">
        {features.map(({ title, path, icon: Icon, color, description }) => (
          <Link to={path} key={path} className="dashboard-feature-card">
            <span className={`feature-icon ${color}`}>
              <Icon size={25} />
            </span>
            <strong>{title}</strong>
            <p>{description}</p>
            <span className="learn-more">
              Open feature <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </div>

      <div className="dashboard-info">
        <ShieldCheck size={22} style={{ flexShrink: 0 }} />
        <p>
          <strong>{t("disclaimerTitle")}:</strong> {t("disclaimer")}
        </p>
      </div>
    </>
  );
}
