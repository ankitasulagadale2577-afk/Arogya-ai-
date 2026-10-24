// ==============================================================================
// ArogyaMitra AI — Multilingual Internationalization Context (en, mr, hi, kn)
// ==============================================================================

import { createContext, useContext, useState, useEffect } from "react";
import { LANGUAGES, TRANSLATIONS } from "../data/translations.js";

export { LANGUAGES, TRANSLATIONS };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem("arogya_lang");
      return stored && ["en", "mr", "hi", "kn"].includes(stored) ? stored : "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (newLang) => {
    if (["en", "mr", "hi", "kn"].includes(newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem("arogya_lang", newLang);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
