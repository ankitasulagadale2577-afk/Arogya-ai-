import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Sparkles, HelpCircle } from "lucide-react";
import Brand from "../components/Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage, LANGUAGES } from "../context/LanguageContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, loginAsDemo, resetPassword, isConfigured } = useAuth();
  const { language, setLanguage } = useLanguage();

  const isSignUpInitial = new URLSearchParams(location.search).get("signup") === "true";
  const [mode, setMode] = useState(isSignUpInitial ? "signup" : "login"); // 'login' | 'signup' | 'forgot'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prefLang, setPrefLang] = useState(language);
  const [error, setError] = useState("");
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDemoAccess = () => {
    loginAsDemo(fullName.trim() || "Health Explorer", prefLang);
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsRateLimit(false);
    setIsUnconfirmed(false);

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
        const isRate = res.error?.toLowerCase().includes("rate limit");
        setIsRateLimit(isRate);
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
        if (res.session) {
          setLanguage(prefLang);
          navigate("/dashboard", { replace: true });
        } else {
          setSuccess("Account created! Please check your email inbox to confirm your account, or turn off 'Confirm email' in Supabase to login immediately.");
          setMode("login");
        }
      } else {
        setError(res.error || "Failed to create account.");
        setIsRateLimit(Boolean(res.isRateLimit || res.error?.toLowerCase().includes("rate limit")));
      }
    } else {
      const res = await login(email.trim(), password);
      setSubmitting(false);
      if (res.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(res.error || "Invalid email or password.");
        setIsUnconfirmed(Boolean(res.isUnconfirmed || res.error?.toLowerCase().includes("email not confirmed")));
        setIsRateLimit(Boolean(res.error?.toLowerCase().includes("rate limit")));
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

        {/* Actionable guidance if Supabase email rate limit is hit */}
        {isRateLimit && (
          <div
            style={{
              margin: "14px 0",
              padding: "16px",
              background: "#fff9f2",
              border: "1px solid #ffd8a8",
              borderRadius: "14px",
              fontSize: "12px",
              color: "#7e4000",
              lineHeight: "1.6",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", marginBottom: "6px", color: "#b95000" }}>
              <HelpCircle size={17} />
              <span>How to Solve Supabase Email Rate Limit</span>
            </div>
            <p style={{ margin: "0 0 8px" }}>
              Supabase free tier restricts built-in verification emails to <strong>3 emails/hour</strong>. To solve this immediately:
            </p>
            <ol style={{ margin: "0 0 10px", paddingLeft: "18px" }}>
              <li>Open your <strong>Supabase Dashboard</strong>.</li>
              <li>Go to <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Email</strong>.</li>
              <li>Toggle <strong>Confirm email</strong> to <strong>OFF</strong> and click <strong>Save</strong>.</li>
            </ol>
            <p style={{ margin: "0 0 10px" }}>
              This allows instant sign-ups and logins without sending confirmation emails.
            </p>
            <button
              type="button"
              className="button button-primary full-width"
              onClick={handleDemoAccess}
              style={{ minHeight: "36px", fontSize: "12px" }}
            >
              <Sparkles size={14} /> Continue with Instant Demo Access
            </button>
          </div>
        )}

        {/* Actionable guidance if user email is unconfirmed */}
        {isUnconfirmed && (
          <div
            style={{
              margin: "14px 0",
              padding: "16px",
              background: "#f0f7ff",
              border: "1px solid #c7e0fe",
              borderRadius: "14px",
              fontSize: "12px",
              color: "#0c4a6e",
              lineHeight: "1.6",
              textAlign: "left",
            }}
          >
            <strong style={{ display: "block", marginBottom: "6px", color: "#0369a1" }}>
              Email Confirmation Pending
            </strong>
            <p style={{ margin: "0 0 8px" }}>
              In your Supabase Dashboard: go to <strong>Authentication → Users</strong>, click on your user, and choose <strong>Confirm user</strong>. Or continue as demo user:
            </p>
            <button
              type="button"
              className="button button-primary full-width"
              onClick={handleDemoAccess}
              style={{ minHeight: "36px", fontSize: "12px" }}
            >
              <Sparkles size={14} /> Continue with Instant Demo Access
            </button>
          </div>
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
                  setIsRateLimit(false);
                  setIsUnconfirmed(false);
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

        {/* 1-Click Instant Demo Access button */}
        <div style={{ margin: "20px 0 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e2eaf5" }} />
          <span style={{ fontSize: "11px", color: "#8a9eb8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            OR
          </span>
          <div style={{ flex: 1, height: "1px", background: "#e2eaf5" }} />
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          className="button button-outline full-width"
          style={{
            borderColor: "#b9d3fa",
            background: "#f0f6ff",
            color: "#0866f5",
            fontWeight: 700,
            padding: "10px 14px",
          }}
          title="Bypass email verification and explore all features immediately"
        >
          <Sparkles size={16} /> Instant Demo Access (No Email Required)
        </button>

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
                  setIsRateLimit(false);
                  setIsUnconfirmed(false);
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
                  setIsRateLimit(false);
                  setIsUnconfirmed(false);
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
