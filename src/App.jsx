
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  HeartPulse,
  Sparkles,
  Mic,
  Globe,
  MapPin,
  Syringe,
  Siren,
  BookOpen,
  Bot,
  Activity,
  Hospital,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  UserRound,
  Settings,
  LogOut,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  CalendarDays,
  Home,
  ChevronRight,
} from "lucide-react";
import "./App.css";

const features = [
  {
    title: "AI Health Assistant",
    description: "Ask health questions and receive simple health information.",
    path: "/assistant",
    icon: Bot,
    color: "blue",
  },
  {
    title: "Voice Assistant",
    description: "Speak naturally and listen to helpful responses.",
    path: "/voice",
    icon: Mic,
    color: "purple",
  },
  {
    title: "Nearby Hospitals",
    description: "Find healthcare facilities near your location.",
    path: "/hospitals",
    icon: Hospital,
    color: "cyan",
  },
  {
    title: "Vaccination",
    description: "Explore vaccination information and manage reminders.",
    path: "/vaccination",
    icon: Syringe,
    color: "orange",
  },
  {
    title: "Emergency Assistance",
    description: "Quick access to emergency guidance and contacts.",
    path: "/emergency",
    icon: Siren,
    color: "red",
  },
  {
    title: "Health Library",
    description: "Explore health articles, wellness tips and information.",
    path: "/library",
    icon: BookOpen,
    color: "blue",
  },
];

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "AI Assistant", path: "/assistant", icon: Bot },
  { label: "Voice Assistant", path: "/voice", icon: Mic },
  { label: "Nearby Hospitals", path: "/hospitals", icon: Hospital },
  { label: "Vaccination", path: "/vaccination", icon: Syringe },
  { label: "Emergency", path: "/emergency", icon: Siren },
  { label: "Health Library", path: "/library", icon: BookOpen },
  { label: "My Profile", path: "/profile", icon: UserRound },
  { label: "Settings", path: "/settings", icon: Settings },
];

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="ArogyaMitra AI home">
      <span className="brand-icon">
        <HeartPulse size={29} strokeWidth={2.3} />
      </span>
      <span className="brand-copy">
        <strong>
          ArogyaMitra <em>AI</em>
        </strong>
        <small>Smarter Healthcare for Everyone</small>
      </span>
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Brand />

        <button
          className="mobile-nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Health Library</a>
        </nav>

        <div className="nav-actions">
          <span className="language-pill">
            <Globe size={17} /> English
          </span>
          <Link to="/login" className="button button-outline">Login</Link>
          <Link to="/login?signup=true" className="button button-primary">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function LandingPage() {
  return (
    <>
      <Header />

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} />
              AI POWERED · MULTILINGUAL · EASY TO USE
            </span>

            <h1>
              Your <span>AI Healthcare</span> Companion
            </h1>

            <p className="hero-subtitle">
              Smarter Healthcare for Everyone
            </p>

            <div className="hero-benefits">
              <div className="benefit">
                <Mic size={23} />
                <strong>Voice Chat</strong>
                <small>Speak, get answers</small>
              </div>
              <div className="benefit">
                <Sparkles size={23} />
                <strong>Easy to Use</strong>
                <small>Simple and clean UI</small>
              </div>
              <div className="benefit">
                <Globe size={23} />
                <strong>Multilingual</strong>
                <small>English · Marathi · Hindi · Kannada</small>
              </div>
              <div className="benefit">
                <MapPin size={23} />
                <strong>Live Locations</strong>
                <small>Find hospitals nearby</small>
              </div>
            </div>

            <Link to="/login?signup=true" className="button button-primary hero-cta">
              Get Started <ArrowRight size={20} />
            </Link>

            <p className="hero-note">
              Your health journey starts with accessible information.
            </p>
          </div>

          <div className="hero-visual">
            <img
              src="/hero.png"
              alt="Woman using a laptop with healthcare technology"
              className="hero-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="hero-fallback">
              <div className="fallback-orbit orbit-one" />
              <div className="fallback-orbit orbit-two" />
              <div className="fallback-heart">
                <HeartPulse size={95} />
              </div>
              <div className="fallback-caption">
                <Sparkles size={17} /> AI-powered health support
              </div>
            </div>

            <div className="floating-chip ai-chip">
              <span className="chip-icon"><Bot size={21} /></span>
              <span><strong>AI Assistant</strong><small>Here to help</small></span>
            </div>
            <div className="floating-chip location-chip">
              <MapPin size={20} />
              <strong>Nearby Hospitals</strong>
            </div>
            <div className="floating-chip vaccine-chip">
              <Syringe size={20} />
              <strong>Vaccination</strong>
            </div>
            <div className="floating-chip emergency-chip">
              <Siren size={20} />
              <strong>Emergency</strong>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="section-kicker">YOUR HEALTH, ONE PLACE</span>
            <h2>Explore Our Features</h2>
            <p>Simple tools to help you access healthcare information.</p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  to="/login?signup=true"
                  className="feature-card"
                  key={feature.title}
                >
                  <span className={`feature-icon ${feature.color}`}>
                    <Icon size={27} />
                  </span>
                  <span className="feature-card-copy">
                    <strong>{feature.title}</strong>
                    <small>{feature.description}</small>
                    <span className="learn-more">
                      Get started <ArrowUpRight size={15} />
                    </span>
                  </span>
                  <span className="feature-arrow">
                    <ChevronRight size={18} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-intro">
            <span className="section-kicker">DESIGNED AROUND YOU</span>
            <h2>Healthcare information, made easier.</h2>
            <p>
              ArogyaMitra AI brings helpful health information, voice
              interaction, nearby healthcare discovery and wellness resources
              into one accessible experience.
            </p>
            <Link to="/login?signup=true" className="button button-primary">
              Explore your dashboard <ArrowRight size={17} />
            </Link>
          </div>

          <div className="about-points">
            <div className="about-point">
              <span className="about-icon"><Globe size={23} /></span>
              <div>
                <strong>Multilingual support</strong>
                <p>Designed for English, Marathi, Hindi and Kannada.</p>
              </div>
            </div>
            <div className="about-point">
              <span className="about-icon"><MapPin size={23} /></span>
              <div>
                <strong>Location-aware discovery</strong>
                <p>Find nearby healthcare facilities when connected to a location service.</p>
              </div>
            </div>
            <div className="about-point">
              <span className="about-icon"><ShieldCheck size={23} /></span>
              <div>
                <strong>Health-conscious design</strong>
                <p>Health information is educational and does not replace professional medical care.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Brand />
        <p>
          ArogyaMitra AI offers educational health information, not medical
          diagnosis or emergency medical treatment.
        </p>
        <small>© {new Date().getFullYear()} ArogyaMitra AI</small>
      </footer>
    </>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = new URLSearchParams(location.search).get("signup") === "true";

  const [signup, setSignup] = useState(isSignup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (signup && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // Demo-only sign-in. Replace with a real authentication provider later.
    const savedUser = {
      name: signup ? name.trim() : (email.split("@")[0] || "User"),
      email: email.trim(),
    };

    onLogin(savedUser);
    navigate("/dashboard", { replace: true });
  }

  return (
    <main className="auth-page">
      <Link to="/" className="back-home">← Back to home</Link>

      <section className="auth-card">
        <Brand />

        <div className="auth-heading">
          <span className="section-kicker">
            {signup ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
          </span>
          <h1>{signup ? "Get started today" : "Login to ArogyaMitra"}</h1>
          <p>
            {signup
              ? "Create an account to explore your healthcare dashboard."
              : "Sign in to access your personal dashboard."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {signup && (
            <label>
              Full name
              <span className="auth-input">
                <UserRound size={17} />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </span>
            </label>
          )}

          <label>
            Email address
            <span className="auth-input">
              <Mail size={17} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label>
            Password
            <span className="auth-input">
              <LockKeyhole size={17} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete={signup ? "new-password" : "current-password"}
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="button button-primary auth-submit" type="submit">
            {signup ? "Create account" : "Login"} <ArrowRight size={17} />
          </button>
        </form>

        <p className="auth-switch">
          {signup ? "Already have an account?" : "New to ArogyaMitra AI?"}
          <button
            type="button"
            onClick={() => {
              setSignup(!signup);
              setError("");
            }}
          >
            {signup ? "Login" : "Create account"}
          </button>
        </p>

        <p className="auth-note">
          <ShieldCheck size={15} /> This is a frontend demonstration.
          Authentication is not secure until connected to a real backend.
        </p>
      </section>
    </main>
  );
}

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, onLogout }) {
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          <span>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </button>

        <button className="sidebar-link sidebar-logout" onClick={onLogout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

function DashboardLayout({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();

  const activeFeature = features.find((feature) => feature.path === location.pathname);
  const pageTitle =
    navigation.find((item) => item.path === location.pathname)?.label ||
    activeFeature?.title ||
    "Dashboard";

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className={`dashboard-shell ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={onLogout}
      />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={21} />
          </button>

          <div className="dashboard-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search features..."
              aria-label="Search features"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  const match = features.find((feature) =>
                    feature.title.toLowerCase().includes(search.toLowerCase())
                  );
                  if (match) window.location.hash = "";
                  if (match) window.location.assign(match.path);
                }
              }}
            />
          </div>

          <button
            className="dashboard-bell"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => window.alert("You have no new notifications.")}
          >
            <Bell size={19} />
          </button>

          <div className="dashboard-user">
            <span className="user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span>
              <strong>{user?.name || "User"}</strong>
              <small>Member</small>
            </span>
          </div>
        </header>

        <main className="dashboard-content">
          {location.pathname === "/dashboard" ? (
            <>
              <section className="dashboard-welcome">
                <div>
                  <span className="section-kicker">YOUR HEALTH, ONE PLACE</span>
                  <h1>Hello, {firstName}! 👋</h1>
                  <p>How can we help you take care of your health today?</p>
                </div>
                <span className="welcome-art"><HeartPulse size={43} /></span>
              </section>

              <div className="dashboard-section-title">
                <h2>Quick Access</h2>
                <p>Choose a feature to get started.</p>
              </div>

              <div className="dashboard-feature-grid">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Link
                      to={feature.path}
                      key={feature.path}
                      className="dashboard-feature-card"
                    >
                      <span className={`feature-icon ${feature.color}`}>
                        <Icon size={25} />
                      </span>
                      <strong>{feature.title}</strong>
                      <p>{feature.description}</p>
                      <span className="learn-more">
                        Open feature <ArrowRight size={15} />
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="dashboard-info">
                <ShieldCheck size={22} />
                <p>
                  <strong>Health reminder:</strong> ArogyaMitra AI provides
                  general educational information. Contact a qualified
                  healthcare professional for personal medical advice.
                </p>
              </div>
            </>
          ) : (
            <FeaturePage
              title={pageTitle}
              feature={activeFeature}
              user={user}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function FeaturePage({ title, feature, user }) {
  const Icon = feature?.icon || (
    title === "My Profile" ? UserRound :
    title === "Settings" ? Settings : Activity
  );

  return (
    <section className="feature-detail">
      <Link to="/dashboard" className="back-dashboard">
        <ArrowRight size={15} className="back-arrow" /> Back to dashboard
      </Link>

      <div className="feature-detail-card">
        <span className={`feature-icon ${feature?.color || "blue"}`}>
          <Icon size={30} />
        </span>
        <span className="section-kicker">AROGYAMITRA AI</span>
        <h1>{title}</h1>
        <p>
          {feature?.description ||
            (title === "My Profile"
              ? "View and manage your account information."
              : title === "Settings"
              ? "Personalize your ArogyaMitra AI experience."
              : "Explore this section of your healthcare dashboard.")}
        </p>

        {title === "My Profile" ? (
          <div className="profile-details">
            <p><strong>Name:</strong> {user?.name || "User"}</p>
            <p><strong>Email:</strong> {user?.email || "Not provided"}</p>
          </div>
        ) : title === "Settings" ? (
          <p className="feature-coming-soon">
            Language and accessibility settings can be connected here next.
          </p>
        ) : (
          <p className="feature-coming-soon">
            This page is connected to your dashboard. Its real functionality
            will be added in the next development step.
          </p>
        )}

        <Link to="/dashboard" className="button button-primary">
          Return to dashboard <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

function AppRoutes() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("arogya-demo-user")) || null;
    } catch {
      return null;
    }
  });

  function handleLogin(savedUser) {
    sessionStorage.setItem("arogya-demo-user", JSON.stringify(savedUser));
    setUser(savedUser);
  }

  function handleLogout() {
    sessionStorage.removeItem("arogya-demo-user");
    setUser(null);
  }

  function ProtectedDashboard() {
    return user ? (
      <DashboardLayout user={user} onLogout={handleLogout} />
    ) : (
      <Navigate to="/login" replace />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/dashboard" element={<ProtectedDashboard />} />

      {navigation
        .filter((item) => item.path !== "/dashboard")
        .map((item) => (
          <Route
            key={item.path}
            path={item.path}
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
