// ==============================================================================
// ArogyaMitra AI — Main Application Router & Providers
// ==============================================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import AssistantPage from "./pages/AssistantPage.jsx";
import VoicePage from "./pages/VoicePage.jsx";
import HospitalsPage from "./pages/HospitalsPage.jsx";
import VaccinationPage from "./pages/VaccinationPage.jsx";
import EmergencyPage from "./pages/EmergencyPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

import "./App.css";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Dashboard & Feature Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/voice" element={<VoicePage />} />
              <Route path="/hospitals" element={<HospitalsPage />} />
              <Route path="/vaccination" element={<VaccinationPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
