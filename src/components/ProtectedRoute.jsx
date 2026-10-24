import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LoaderCircle } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        color: "#0866f5",
        background: "#f5f8ff"
      }}>
        <div style={{ textAlign: "center" }}>
          <LoaderCircle size={36} className="spin" style={{ animation: "spin 1s linear infinite", margin: "auto" }} />
          <p style={{ marginTop: "12px", color: "#6680a1", fontSize: "13px" }}>Loading ArogyaMitra session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
