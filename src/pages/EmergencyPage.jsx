// ==============================================================================
// ArogyaMitra AI — Verified Emergency Assistance & First Aid Guidance
// Emergency Helplines (Pan-India 112) + First-Aid Protocols + Contacts
// ==============================================================================

import { useState, useEffect } from "react";
import {
  Siren,
  Phone,
  AlertTriangle,
  ShieldCheck,
  UserRound,
  Plus,
  Trash2,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { EMERGENCY_NUMBERS_DATA, FIRST_AID_GUIDELINES } from "../data/initialData.js";
import { emergencyContactService } from "../services/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function EmergencyPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [contactSaved, setContactSaved] = useState(false);
  const [selectedAid, setSelectedAid] = useState(FIRST_AID_GUIDELINES[0].id);

  // Load user's emergency contacts from Supabase
  useEffect(() => {
    let mounted = true;
    async function loadContacts() {
      if (!user) return;
      const { data } = await emergencyContactService.getContacts(user.id);
      if (mounted && data) {
        setContacts(data);
      }
    }
    loadContacts();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !user) return;

    const { data } = await emergencyContactService.addContact(user.id, {
      name: name.trim(),
      phone: phone.trim(),
      relationship,
    });

    if (data) {
      setContacts((prev) => [data, ...prev]);
      setName("");
      setPhone("");
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2500);
    }
  };

  const handleDeleteContact = async (contactId) => {
    await emergencyContactService.deleteContact(contactId);
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  };

  const activeFirstAid = FIRST_AID_GUIDELINES.find((f) => f.id === selectedAid) || FIRST_AID_GUIDELINES[0];

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon" style={{ color: "#ed4765", background: "#ffe8ed" }}>
          <Siren size={27} />
        </span>
        <div>
          <span className="section-kicker">URGENT RESPONSE & SAFETY</span>
          <h1>{t("emergency")}</h1>
          <p>Authoritative Indian emergency helplines, one-tap calling, first-aid protocols, and emergency contacts.</p>
        </div>
      </div>

      {/* Prominent Emergency Banner */}
      <div className="emergency-alert">
        <AlertTriangle size={32} style={{ flexShrink: 0 }} />
        <div>
          <strong>Medical Emergency? Do Not Wait or Chat.</strong>
          <p>
            If you or someone near you has chest pain, difficulty breathing, profuse bleeding, or is unresponsive, call
            the national emergency service <strong>112</strong> immediately. This web application does NOT dispatch ambulances
            or emergency responders.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a href="tel:112" className="button button-danger" style={{ fontSize: "14px", padding: "12px 20px" }}>
            <Phone size={18} /> {t("call112")}
          </a>
          <a
            href="tel:108"
            className="button button-outline"
            style={{ fontSize: "14px", padding: "12px 20px", color: "#ed4765", borderColor: "#ed4765" }}
          >
            <Phone size={18} /> {t("callAmbulance")}
          </a>
        </div>
      </div>

      {/* Emergency Helplines Directory */}
      <div className="section-subhead">
        <div>
          <h2>Verified National Helplines (India)</h2>
          <p>Government certified toll-free emergency numbers accessible 24/7 across states.</p>
        </div>
      </div>

      <div className="emergency-number-grid">
        {EMERGENCY_NUMBERS_DATA.map((item) => (
          <article className="emergency-number-card" key={item.number}>
            <span className="feature-icon red">
              <Phone size={22} />
            </span>
            <div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span style={{ fontSize: "10px", color: "#879cb8", marginTop: "4px", display: "inline-block" }}>
                Area: {item.area} {item.tollFree ? "• Toll-Free" : ""}
              </span>
            </div>
            <a href={`tel:${item.number}`} className="phone-number" title={`Call ${item.number}`}>
              {item.number} <Phone size={15} />
            </a>
          </article>
        ))}
      </div>

      {/* First-Aid Guidance & Personal Emergency Contacts */}
      <div className="first-aid-layout">
        {/* First Aid Protocol Guide */}
        <section className="panel-card">
          <h2>
            <HeartHandshake size={20} /> {t("firstAidTitle")}
          </h2>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
            {FIRST_AID_GUIDELINES.map((fa) => (
              <button
                key={fa.id}
                type="button"
                onClick={() => setSelectedAid(fa.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid #dbe6f5",
                  background: selectedAid === fa.id ? "#0866f5" : "white",
                  color: selectedAid === fa.id ? "white" : "#456184",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {fa.title}
              </button>
            ))}
          </div>

          <div style={{ background: "#f8fbff", padding: "16px", borderRadius: "14px", border: "1px solid #e1ecfa" }}>
            <h3 style={{ margin: "0 0 8px", color: "#142f59", fontSize: "16px" }}>{activeFirstAid.title}</h3>

            <div
              style={{
                background: "#fff0f3",
                color: "#e63d58",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              ⚠️ {activeFirstAid.emergencyAction}
            </div>

            <ol style={{ paddingLeft: "20px", margin: "10px 0", color: "#3e5777", fontSize: "13px", lineHeight: "1.8" }}>
              {activeFirstAid.steps.map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ol>

            {activeFirstAid.donts && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "#fff9f0",
                  color: "#925916",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              >
                <strong>What NOT to do:</strong> {activeFirstAid.donts}
              </div>
            )}
          </div>

          <p className="safety-note">
            <ShieldCheck size={16} /> First-aid guidelines are introductory educational information from accredited health
            sources. Attend a certified CPR/first-aid training program for hands-on skills.
          </p>
        </section>

        {/* Personal Emergency Contacts */}
        <section className="panel-card">
          <h2>
            <UserRound size={20} /> {t("emergencyContacts")}
          </h2>

          <form className="stack-form" onSubmit={handleAddContact}>
            <label>
              Contact Person's Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </label>

            <label>
              Relationship
              <select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                <option value="Family">Family / Relative</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Parent">Parent</option>
                <option value="Friend">Trusted Friend / Neighbor</option>
                <option value="Physician">Family Doctor / Physician</option>
              </select>
            </label>

            <button className="button button-primary" type="submit">
              <Plus size={16} /> Add Emergency Contact
            </button>

            {contactSaved && (
              <p className="success-message">
                <CheckCircle2 size={16} /> Emergency contact saved securely!
              </p>
            )}
          </form>

          <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "14px", color: "#142f59", marginBottom: "10px" }}>
              Your Saved Contacts ({contacts.length})
            </h3>

            {contacts.length === 0 ? (
              <p className="muted" style={{ padding: "10px 0" }}>
                {t("noContacts")}
              </p>
            ) : (
              contacts.map((c) => (
                <div className="reminder-item" key={c.id}>
                  <span className="feature-icon blue">
                    <UserRound size={19} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>{c.name}</strong>
                      <span className="category-tag">{c.relationship || "Contact"}</span>
                    </div>
                    <p style={{ margin: "3px 0 6px" }}>{c.phone}</p>
                    <a
                      href={`tel:${c.phone}`}
                      style={{
                        color: "#0866f5",
                        fontWeight: 700,
                        fontSize: "11px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Phone size={12} /> Call Contact
                    </a>
                  </div>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => handleDeleteContact(c.id)}
                    aria-label="Delete contact"
                    title="Delete contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
