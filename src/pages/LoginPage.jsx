import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import Brand from "../components/Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage, LANGUAGES } from "../context/LanguageContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, resetPassword, isConfigured } = useAuth();
  const { language, setLanguage } = useLanguage();

  const isSignUpInitial = new URLSearchParams(location.search).get("signup") === "true";
  const [mode, setMode] = useState(isSignUpInitial ? "signup" : "login"); // 'login' | 'signup' | 'forgot'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prefLang, setPrefLang] = useState(language);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !email.includes("@")) {
      return setError("Please provide a valid email address.");
    }

    if (mode === "forgot") {
      setSubmitting(true);
      const res = await resetPassword(email.trim());
      setSubmitting(false);
      if (res.success) {
        setSuccess("Password reset instructions have been sent to your email.");
      } else {
        setError(res.error || "Could not send reset email.");
      }
      return;
    }

    if (!password || password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (mode === "signup" && !fullName.trim()) {
      return setError("Please enter your full name.");
    }

    setSubmitting(true);

    if (mode === "signup") {
      const res = await signUp(email.trim(), password, fullName.trim(), prefLang);
      setSubmitting(false);
      if (res.success) {
        setLanguage(prefLang);
        navigate("/dashboard", { replace: true });
      } else {
        setError(res.error || "Failed to create account.");
      }
    } else {
      const res = await login(email.trim(), password);
      setSubmitting(false);
      if (res.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(res.error || "Invalid email or password.");
      }
    }
  };

  return (
    <main className="auth-page">
      <Link to="/" className="back-home">
        ← Back to home
      </Link>

      <section className="auth-card">
        <Brand />

        <span className="section-kicker">
          {mode === "signup"
            ? "CREATE YOUR HEALTH ACCOUNT"
            : mode === "forgot"
            ? "RECOVER YOUR ACCOUNT"
            : "WELCOME BACK"}
        </span>

        <h1>
          {mode === "signup"
            ? "Join ArogyaMitra AI"
            : mode === "forgot"
            ? "Reset Password"
            : "Sign in to Dashboard"}
        </h1>

        <p className="muted">
          {mode === "signup"
            ? "Create an account to securely save your health conversations and reminders."
            : mode === "forgot"
            ? "Enter your email to receive a password reset link."
            : "Access your personalized health assistant and saved tools."}
        </p>

        {error && (
          <p className="error-message" style={{ marginTop: "12px" }}>
            <AlertCircle size={16} /> {error}
          </p>
        )}

        {success && (
          <p className="success-message" style={{ marginTop: "12px" }}>
            <CheckCircle2 size={16} /> {success}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <label>
                Full Name
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Preferred Language
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "44px",
                    padding: "11px 12px",
                    border: "1px solid #dfe8f6",
                    borderRadius: "11px",
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label} ({l.native})
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          {mode !== "forgot" && (
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
              />
            </label>
          )}

          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: "-6px" }}>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  border: 0,
                  background: "none",
                  color: "#0866f5",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            className="button button-primary full-width"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Processing..."
              : mode === "signup"
              ? "Create Account"
              : mode === "forgot"
              ? "Send Reset Link"
              : "Sign In"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>

        <p className="auth-switch">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              {mode === "forgot" ? "Remember your password? " : "New to ArogyaMitra AI? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "forgot" ? "login" : "signup");
                  setError("");
                  setSuccess("");
                }}
              >
                {mode === "forgot" ? "Sign In" : "Create Account"}
              </button>
            </>
          )}
        </p>

        <p className="auth-note">
          <ShieldCheck size={16} />
          {isConfigured ? (
            <span>Secured with Supabase Authentication & PostgreSQL Row Level Security (RLS).</span>
          ) : (
            <span>
              Connected in local sandbox mode. Add your Supabase keys to <code>.env</code> for live cloud authentication.
            </span>
          )}
        </p>
      </section>
    </main>
  );
}
