// ==============================================================================
// ArogyaMitra AI — User Profile & Health Space Management
// ==============================================================================

import { useState, useEffect } from "react";
import {
  UserRound,
  CheckCircle2,
  BookmarkCheck,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage, LANGUAGES } from "../context/LanguageContext.jsx";
import { articleService, vaccinationService, emergencyContactService } from "../services/supabase.js";

export default function ProfilePage() {
  const { user, profile, updateProfile, logout } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derived fields without cascading useEffect renders
  const fullName = formData?.fullName ?? profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "";
  const preferredLang = formData?.preferredLang ?? profile?.preferred_language ?? "en";
  const birthYear = formData?.birthYear ?? (profile?.birth_year ? String(profile.birth_year) : "");
  const region = formData?.region ?? profile?.region ?? "India";

  // Summaries
  const [savedArticles, setSavedArticles] = useState([]);
  const [remindersCount, setRemindersCount] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      if (!user) return;

      const { data: arts } = await articleService.getArticles();
      const { data: savedIds } = await articleService.getSavedArticleIds(user.id);
      if (mounted && arts && savedIds) {
        setSavedArticles(arts.filter((a) => savedIds.includes(a.id)));
      }

      const { data: rems } = await vaccinationService.getReminders(user.id);
      if (mounted && rems) {
        setRemindersCount(rems.length);
      }

      const { data: cnts } = await emergencyContactService.getContacts(user.id);
      if (mounted && cnts) {
        setContactsCount(cnts.length);
      }
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    await updateProfile({
      full_name: fullName.trim(),
      preferred_language: preferredLang,
      birth_year: birthYear ? parseInt(birthYear, 10) : null,
      region: region.trim(),
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const initial = (fullName || user?.email || "U").trim()[0]?.toUpperCase() || "U";

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon">
          <UserRound size={27} />
        </span>
        <div>
          <span className="section-kicker">PERSONAL ACCOUNT</span>
          <h1>{t("profile")}</h1>
          <p>Manage your account settings, regional preferences, and healthcare summary.</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Avatar & Summary Card */}
        <div className="profile-avatar-card">
          <span className="profile-large-avatar">{initial}</span>
          <h2>{fullName || "Healthcare Member"}</h2>
          <p>{user?.email}</p>
          <span className="category-tag">Verified Member</span>

          <div
            style={{
              width: "100%",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #edf1f8",
              textAlign: "left",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
              <span style={{ color: "#748cae" }}>Saved Articles:</span>
              <strong>{savedArticles.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
              <span style={{ color: "#748cae" }}>Vaccine Reminders:</span>
              <strong>{remindersCount}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
              <span style={{ color: "#748cae" }}>Emergency Contacts:</span>
              <strong>{contactsCount}</strong>
            </div>
          </div>

          <button
            className="button button-outline full-width"
            type="button"
            onClick={logout}
            style={{ marginTop: "20px", color: "#e63d58" }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Edit Profile Form */}
        <form className="panel-card stack-form" onSubmit={handleSaveProfile}>
          <h2>Personal Preferences</h2>

          <label>
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email Address (Authenticated Account)
            <input type="email" value={user?.email || ""} disabled style={{ background: "#f8fafd", color: "#788ea8" }} />
          </label>

          <label>
            Birth Year (Optional for age-appropriate health recommendations)
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setFormData((prev) => ({ ...prev, birthYear: e.target.value }))}
              placeholder="e.g. 1995"
            />
          </label>

          <label>
            State / Country
            <input
              type="text"
              value={region}
              onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
              placeholder="e.g. Maharashtra, India"
            />
          </label>

          <label>
            Default Language
            <select
              value={preferredLang}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferredLang: e.target.value }))}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} ({l.native})
                </option>
              ))}
            </select>
          </label>

          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : t("saveProfile")}
          </button>

          {savedSuccess && (
            <p className="success-message">
              <CheckCircle2 size={16} /> Profile and language preferences updated successfully!
            </p>
          )}
        </form>
      </div>

      {/* Saved Articles Section */}
      <div className="panel-card saved-articles">
        <h2>
          <BookmarkCheck size={20} /> Saved Health Reads ({savedArticles.length})
        </h2>
        {savedArticles.length === 0 ? (
          <p className="muted">
            You haven't bookmarked any health articles yet. Explore the Health Library to bookmark topics.
          </p>
        ) : (
          savedArticles.map((art) => (
            <p key={art.id}>
              <strong>{art.title}</strong>
              <span className="category-tag">{art.category}</span>
            </p>
          ))
        )}
      </div>

      <p className="safety-note">
        <ShieldCheck size={16} /> Data is secured via PostgreSQL Row Level Security (RLS). Only your authenticated session
        can access personal preferences.
      </p>
    </section>
  );
}
