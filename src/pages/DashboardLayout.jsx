import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { preferences } = useAuth();

  return (
    <div
      className={`dashboard-shell ${collapsed ? "is-collapsed" : ""} ${
        preferences?.compact_cards ? "compact-mode" : ""
      }`}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="dashboard-main">
        <TopBar setMobileOpen={setMobileOpen} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
