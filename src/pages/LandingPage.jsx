import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Mic,
  Languages,
  MapPin,
  HeartPulse,
  Bot,
  Hospital,
  Syringe,
  Siren,
  BookOpen,
  ShieldCheck,
  Globe,
} from "lucide-react";
import Brand from "../components/Brand.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LandingPage() {
  const { t, language, setLanguage, languages } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      title: t("assistant"),
      path: "/assistant",
      icon: Bot,
      color: "blue",
      description: "Ask health questions in English, Marathi, Hindi, or Kannada with verified AI support.",
    },
    {
      title: t("voice"),
      path: "/voice",
      icon: Mic,
      color: "purple",
      description: "Speak naturally in your mother tongue and listen to spoken educational guidance.",
    },
    {
      title: t("hospitals"),
      path: "/hospitals",
      icon: Hospital,
      color: "cyan",
      description: "Find real mapped healthcare facilities, clinics, and doctors with OpenStreetMap directions.",
    },
    {
      title: t("vaccination"),
      path: "/vaccination",
      icon: Syringe,
      color: "orange",
      description: "Explore official Universal Immunisation Programme schedules and manage personal reminders.",
    },
    {
      title: t("emergency"),
      path: "/emergency",
      icon: Siren,
      color: "red",
      description: "Access verified Indian emergency numbers (112, 108), call links, and first-aid protocols.",
    },
    {
      title: t("library"),
      path: "/library",
      icon: BookOpen,
      color: "indigo",
      description: "Read medically reviewed health articles, wellness tips, and bookmark favorite topics.",
    },
  ];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Brand />
        <nav className="landing-nav">
          <a href="#home">{t("home")}</a>
          <a href="#features">{t("features")}</a>
          <a href="#about">{t("about")}</a>
          <Link to="/library">{t("library")}</Link>
        </nav>
        <div className="landing-actions">
          <div className="language-pill" style={{ padding: "6px 12px" }}>
            <Globe size={15} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                fontSize: "12px",
                fontWeight: 700,
                outline: "none",
                cursor: "pointer",
              }}
              aria-label="Select language"
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.native}
                </option>
              ))}
            </select>
          </div>
          {user ? (
            <Link to="/dashboard" className="button button-primary">
              {t("dashboard")} <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="button button-outline">
                {t("login")}
              </Link>
              <Link to="/login?signup=true" className="button button-primary">
                {t("getStarted")}
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div className="landing-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> AI POWERED · MULTILINGUAL · EVIDENCE-BASED
          </span>
          <h1>
            Your <span>AI Healthcare</span> Companion
          </h1>
          <p className="landing-subtitle">{t("heroSubtitle")}</p>
          <p className="landing-description">{t("heroDescription")}</p>
          <div className="hero-mini-grid">
            <div>
              <Mic />
              <strong>Voice Chat</strong>
              <small>Speak & listen in 4 languages</small>
            </div>
            <div>
              <Languages />
              <strong>4 Languages</strong>
              <small>English, Marathi, Hindi, Kannada</small>
            </div>
            <div>
              <MapPin />
              <strong>Real Hospital Finder</strong>
              <small>OpenStreetMap verified locations</small>
            </div>
          </div>
          <Link to={user ? "/dashboard" : "/login?signup=true"} className="button button-primary landing-cta">
            {t("getStarted")} <ArrowRight size={18} />
          </Link>
          <p className="muted tiny" style={{ marginTop: "12px" }}>
            Free for all citizens. Connecting healthcare information to everyone.
          </p>
        </div>
        <div className="landing-art">
          <img
            src="/hero.png"
            alt="Healthcare user on laptop with AI support"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="art-fallback">
            <div className="art-orbit">
              <HeartPulse size={88} />
            </div>
            <span className="art-label">
              <Sparkles size={16} /> ArogyaMitra AI Companion
            </span>
          </div>
          <span className="float-label float-ai">
            <Bot /> AI Health Assistant
          </span>
          <span className="float-label float-hospital">
            <Hospital /> Real Hospital Finder
          </span>
          <span className="float-label float-vaccine">
            <Syringe /> UIP Vaccination Guide
          </span>
        </div>
      </section>

      <section className="public-features section-wrap" id="features">
        <div className="section-heading">
          <span className="section-kicker">YOUR HEALTH, ONE PLACE</span>
          <h2>Explore Healthcare Features</h2>
          <p>Carefully engineered healthcare assistance tools designed for clarity, safety, and regional languages.</p>
        </div>
        <div className="public-feature-grid">
          {features.map(({ title, path, icon: Icon, color, description }) => (
            <Link
              to={user ? path : "/login?signup=true"}
              className="public-feature-card"
              key={path}
            >
              <span className={`feature-icon ${color}`}>
                <Icon size={25} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="learn-more">
                {user ? "Open Feature" : "Get Started"} <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-band" id="about">
        <ShieldCheck size={32} />
        <div>
          <h2>Healthcare Information, Made Accessible for Everyone.</h2>
          <p>
            ArogyaMitra AI is designed to support, not replace, qualified healthcare professionals. It adheres to strict
            medical disclaimers and provides immediate emergency guidance. For life-threatening emergencies in India, always
            dial <strong>112</strong> or <strong>108</strong>.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <Brand />
        <p>General educational information only. Not a substitute for professional medical diagnosis or clinical treatment.</p>
        <small>© {new Date().getFullYear()} ArogyaMitra AI. Built for India & Beyond.</small>
      </footer>
    </div>
  );
}
