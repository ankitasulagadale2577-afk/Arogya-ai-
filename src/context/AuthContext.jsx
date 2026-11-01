// ==============================================================================
// ArogyaMitra AI — Real Supabase Auth & Session Management Context
// ==============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService, profileService, isSupabaseConfigured } from "../services/supabase.js";
import { useLanguage } from "./LanguageContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState({ compact_cards: false, notifications_enabled: false });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const { setLanguage } = useLanguage();

  // Load user profile and preferences
  const loadUserData = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      const { data: prof } = await profileService.getProfile(currentUser.id);
      if (prof) {
        setProfile(prof);
        if (prof.preferred_language) {
          setLanguage(prof.preferred_language);
        }
      }

      const { data: prefs } = await profileService.getPreferences(currentUser.id);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  }, [setLanguage]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data } = await authService.getSession();
          if (mounted && data?.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            await loadUserData(data.session.user);
            return;
          }
        }

        // Check for local demo session if no live cloud session
        const savedDemo = localStorage.getItem("arogya_demo_session");
        if (savedDemo && mounted) {
          try {
            const parsed = JSON.parse(savedDemo);
            if (parsed?.user) {
              setSession(parsed);
              setUser(parsed.user);
              await loadUserData(parsed.user);
            }
          } catch {
            return;
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Listen to Supabase auth events
    const { data: authListener } = authService.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        const savedDemo = localStorage.getItem("arogya_demo_session");
        if (!savedDemo) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [loadUserData]);

  const login = async (email, password) => {
    setAuthError("");
    const { data, error } = await authService.signIn(email, password);
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message, isUnconfirmed: error.isUnconfirmed };
    }
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      await loadUserData(data.user);
    }
    return { success: true };
  };

  const signUp = async (email, password, fullName, preferredLanguage) => {
    setAuthError("");
    const { data, error } = await authService.signUp(email, password, fullName, preferredLanguage);
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message, isRateLimit: error.isRateLimit };
    }
    if (data?.user && data?.session) {
      setUser(data.user);
      setSession(data.session);
      await loadUserData(data.user);
    }
    return { success: true, user: data?.user, session: data?.session };
  };

  const loginAsDemo = useCallback((name = "Health Explorer", lang = "en") => {
    const demoUser = {
      id: "demo-user-1",
      email: "demo@arogyamitra.ai",
      user_metadata: { full_name: name, preferred_language: lang },
    };
    const demoSession = { user: demoUser, access_token: "demo-token" };
    setUser(demoUser);
    setSession(demoSession);
    setProfile({
      id: demoUser.id,
      full_name: name,
      preferred_language: lang,
      region: "India",
    });
    localStorage.setItem("arogya_demo_session", JSON.stringify(demoSession));
    setLanguage(lang);
    return { success: true, user: demoUser };
  }, [setLanguage]);

  const logout = async () => {
    setAuthError("");
    localStorage.removeItem("arogya_demo_session");
    if (isSupabaseConfigured) {
      await authService.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    setAuthError("");
    const { error } = await authService.resetPassword(email);
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const { data, error } = await profileService.updateProfile(user.id, updates);
    if (!error && data) {
      setProfile(data);
      if (data.preferred_language) {
        setLanguage(data.preferred_language);
      }
    }
    return { data, error };
  };

  const updatePreferences = async (newPrefs) => {
    if (!user) return;
    const { data, error } = await profileService.updatePreferences(user.id, newPrefs);
    if (!error && data) {
      setPreferences(data);
    }
    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        preferences,
        loading,
        authError,
        isConfigured: isSupabaseConfigured,
        login,
        signUp,
        loginAsDemo,
        logout,
        resetPassword,
        updateProfile,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
