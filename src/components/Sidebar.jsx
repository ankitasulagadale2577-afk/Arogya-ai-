import { NavLink } from "react-router-dom";
import {
  Home,
  Bot,
  Mic,
  Hospital,
  Syringe,
  Siren,
  BookOpen,
  UserRound,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
} from "lucide-react";
import Brand from "./Brand.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { t } = useLanguage();
  const { logout } = useAuth();

  const navigationItems = [
    { label: t("dashboard"), path: "/dashboard", icon: Home },
    { label: t("assistant"), path: "/assistant", icon: Bot },
    { label: t("voice"), path: "/voice", icon: Mic },
    { label: t("hospitals"), path: "/hospitals", icon: Hospital },
    { label: t("vaccination"), path: "/vaccination", icon: Syringe },
    { label: t("emergency"), path: "/emergency", icon: Siren },
    { label: t("library"), path: "/library", icon: BookOpen },
    { label: t("profile"), path: "/profile", icon: UserRound },
    { label: t("settings"), path: "/settings", icon: Settings },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`dashboard-sidebar ${collapsed ? "sidebar-collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <Brand to="/dashboard" />
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {navigationItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              title={collapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          <span>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </button>

        <button
          className="sidebar-link sidebar-logout"
          onClick={logout}
          title={t("logout")}
        >
          <LogOut size={19} />
          <span>{t("logout")}</span>
        </button>
      </aside>
    </>
  );
}
