import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function TopBar({ setMobileOpen }) {
  const [query, setQuery] = useState("");
  const { language, setLanguage, languages, t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.trim()[0]?.toUpperCase() || "U";

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    if (q.includes("chat") || q.includes("bot") || q.includes("assist")) {
      navigate("/assistant");
    } else if (q.includes("voice") || q.includes("mic") || q.includes("speak")) {
      navigate("/voice");
    } else if (q.includes("hosp") || q.includes("doctor") || q.includes("clinic") || q.includes("map")) {
      navigate("/hospitals");
    } else if (q.includes("vaccin") || q.includes("dose") || q.includes("remind")) {
      navigate("/vaccination");
    } else if (q.includes("emerg") || q.includes("112") || q.includes("108") || q.includes("aid")) {
      navigate("/emergency");
    } else if (q.includes("pref") || q.includes("sett")) {
      navigate("/settings");
    } else {
      navigate(`/library?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="dashboard-topbar">
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      <form className="dashboard-search" onSubmit={handleSearch}>
        <Search size={17} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label="Search features or articles"
        />
      </form>

      <select
        className="top-language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Choose language"
      >
        {languages.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      <button
        className="dashboard-bell"
        title="Notifications"
        type="button"
        onClick={() => alert("Notification: All systems and emergency numbers are active.")}
      >
        <Bell size={19} />
      </button>

      <div
        className="dashboard-user"
        onClick={() => navigate("/profile")}
        style={{ cursor: "pointer" }}
        title="View profile"
      >
        <span className="user-avatar">{initial}</span>
        <span>
          <strong>{displayName}</strong>
          <small>Arogya Member</small>
        </span>
      </div>
    </header>
  );
}
