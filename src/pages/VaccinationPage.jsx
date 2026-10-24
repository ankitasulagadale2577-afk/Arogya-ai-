// ==============================================================================
// ArogyaMitra AI — Vaccination Information & Reminder Management
// Universal Immunisation Programme (UIP India) + Supabase Reminders
// ==============================================================================

import { useState, useEffect } from "react";
import {
  Syringe,
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Bell,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { VACCINES_DATA } from "../data/initialData.js";
import { vaccinationService } from "../services/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function VaccinationPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedGroup, setSelectedGroup] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [reminders, setReminders] = useState([]);
  const [recipientName, setRecipientName] = useState("");
  const [selectedVaccine, setSelectedVaccine] = useState(VACCINES_DATA[0].name);
  const [plannedDate, setPlannedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(() =>
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  // Load user's vaccination reminders from Supabase
  useEffect(() => {
    let mounted = true;
    async function loadReminders() {
      if (!user) return;
      const { data } = await vaccinationService.getReminders(user.id);
      if (mounted && data) {
        setReminders(data);
      }
    }
    loadReminders();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!recipientName.trim() || !plannedDate || !user) return;

    const { data } = await vaccinationService.addReminder(user.id, {
      recipient_name: recipientName.trim(),
      vaccine_name: selectedVaccine,
      planned_date: plannedDate,
      notes: notes.trim(),
    });

    if (data) {
      setReminders((prev) => [...prev, data].sort((a, b) => a.planned_date.localeCompare(b.planned_date)));
      setRecipientName("");
      setPlannedDate("");
      setNotes("");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      // Trigger test notification if granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Vaccination Reminder Added", {
          body: `Reminder set for ${recipientName}: ${selectedVaccine} on ${plannedDate}.`,
          icon: "/favicon.svg",
        });
      }
    }
  };

  const handleToggleComplete = async (reminderId, currentStatus) => {
    await vaccinationService.toggleComplete(reminderId, !currentStatus);
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, is_completed: !currentStatus } : r))
    );
  };

  const handleDeleteReminder = async (reminderId) => {
    await vaccinationService.deleteReminder(reminderId);
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
  };

  const groups = ["All", "Infants", "Children", "Adolescents & Adults", "All Ages"];

  const filteredVaccines = VACCINES_DATA.filter((v) => {
    const matchGroup = selectedGroup === "All" || v.group === selectedGroup;
    const matchQuery =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.schedule.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGroup && matchQuery;
  });

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon" style={{ color: "#d88316", background: "#fff0d9" }}>
          <Syringe size={27} />
        </span>
        <div>
          <span className="section-kicker">PREVENTIVE IMMUNISATION</span>
          <h1>{t("vaccination")}</h1>
          <p>India Universal Immunisation Programme guidelines, vaccine schedules, and reminder tracking.</p>
        </div>
      </div>

      <div className="vaccination-banner">
        <span className="feature-icon orange">
          <CalendarDays size={27} />
        </span>
        <div style={{ flex: 1 }}>
          <h2>National Immunisation Schedule (India)</h2>
          <p>
            Vaccines prevent debilitating infectious diseases. Below are schedules established by the Ministry of Health
            and Family Welfare (MoHFW) and WHO. Always confirm timing with a pediatrician or primary health centre.
          </p>
        </div>
        <div style={{ alignSelf: "center" }}>
          {notificationStatus !== "granted" ? (
            <button
              className="button button-outline"
              type="button"
              onClick={requestNotificationPermission}
              style={{ fontSize: "11px", whiteSpace: "nowrap" }}
            >
              <Bell size={14} /> Enable Notifications
            </button>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "#087b57",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} /> Notifications Active
            </span>
          )}
        </div>
      </div>

      {/* Guide Controls */}
      <div className="section-subhead" style={{ marginTop: "25px" }}>
        <div>
          <h2>Vaccine Directory</h2>
          <p>Search official Universal Immunisation Programme (UIP) vaccines.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vaccine name or disease..."
              style={{
                padding: "8px 12px 8px 32px",
                borderRadius: "10px",
                border: "1px solid #dfe8f6",
                fontSize: "12px",
                width: "220px",
              }}
            />
            <Search size={14} style={{ position: "absolute", left: "10px", top: "12px", color: "#7f94af" }} />
          </div>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            aria-label="Filter vaccine group"
            style={{ width: "auto" }}
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vaccine Information Grid */}
      <div className="vaccine-grid">
        {filteredVaccines.map((v) => (
          <article className="vaccine-card" key={v.id}>
            <div style={{ padding: "18px" }}>
              <span className="category-tag" style={{ marginBottom: "8px" }}>
                {v.group}
              </span>
              <h3 style={{ margin: "6px 0", color: "#142f59", fontSize: "16px" }}>{v.name}</h3>
              <p style={{ color: "#0866f5", fontWeight: 700, fontSize: "12px", margin: "4px 0 8px" }}>
                📅 Schedule: {v.schedule}
              </p>
              <p style={{ color: "#56708f", fontSize: "12px", lineHeight: "1.6" }}>{v.purpose}</p>

              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 10px",
                  background: "#f7faff",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#6c85a5",
                }}
              >
                <strong>Precaution:</strong> {v.precautions}
              </div>

              <div style={{ marginTop: "10px", fontSize: "10px", color: "#92a6c1" }}>
                Source: {v.source}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Reminders Layout */}
      <div className="reminder-layout">
        <section className="panel-card">
          <h2>
            <CalendarDays size={20} /> Add Personal Reminder
          </h2>
          <form className="stack-form" onSubmit={handleAddReminder}>
            <label>
              Recipient / Child's Name
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                required
              />
            </label>

            <label>
              Select Vaccine
              <select
                value={selectedVaccine}
                onChange={(e) => setSelectedVaccine(e.target.value)}
              >
                {VACCINES_DATA.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.group})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Planned Vaccination Date
              <input
                type="date"
                value={plannedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setPlannedDate(e.target.value)}
                required
              />
            </label>

            <label>
              Clinical Notes (Optional)
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., PHC Shivajinagar, Dr. Joshi"
              />
            </label>

            <button className="button button-primary" type="submit">
              <Plus size={16} /> Save Reminder
            </button>

            {savedSuccess && (
              <p className="success-message">
                <CheckCircle2 size={16} /> Vaccination reminder saved to your profile!
              </p>
            )}
          </form>
        </section>

        <section className="panel-card">
          <h2>
            Scheduled Reminders <span className="count-badge">{reminders.length}</span>
          </h2>

          {reminders.length === 0 ? (
            <p className="muted" style={{ padding: "20px 0" }}>
              {t("noReminders")}
            </p>
          ) : (
            reminders.map((r) => (
              <div
                className="reminder-item"
                key={r.id}
                style={{
                  opacity: r.is_completed ? 0.6 : 1,
                  background: r.is_completed ? "#f9fafb" : "transparent",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggleComplete(r.id, r.is_completed)}
                  style={{
                    border: 0,
                    background: "none",
                    cursor: "pointer",
                    color: r.is_completed ? "#087b57" : "#a2b4cb",
                  }}
                  title={r.is_completed ? "Mark pending" : "Mark completed"}
                >
                  <CheckCircle2 size={22} />
                </button>

                <div style={{ flex: 1 }}>
                  <strong
                    style={{
                      textDecoration: r.is_completed ? "line-through" : "none",
                      color: "#15355e",
                    }}
                  >
                    {r.vaccine_name}
                  </strong>
                  <p style={{ margin: "2px 0", color: "#617d9e", fontSize: "12px" }}>
                    👤 {r.recipient_name} · 📅 Planned: {r.planned_date}
                  </p>
                  {r.notes && (
                    <small style={{ color: "#8a9eb8", display: "block" }}>
                      📝 {r.notes}
                    </small>
                  )}
                </div>

                <button
                  className="icon-button"
                  type="button"
                  onClick={() => handleDeleteReminder(r.id)}
                  aria-label="Delete reminder"
                  title="Delete reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#fff9f0",
              border: "1px solid #fae8cc",
              borderRadius: "12px",
              fontSize: "11px",
              color: "#83531b",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Facility Stock Notice:</strong> Vaccine availability must be confirmed directly with your
              local health centre or the government <strong>U-WIN</strong> portal.
            </div>
          </div>
        </section>
      </div>

      <p className="safety-note">
        <ShieldCheck size={16} /> Vaccination schedules vary according to age, health history, and official MoHFW
        updates. Consult your healthcare provider before administering vaccines.
      </p>
    </section>
  );
}
