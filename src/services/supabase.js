// ==============================================================================
// ArogyaMitra AI — Supabase Client & RLS-Compliant Database Services
// ==============================================================================

import { createClient } from "@supabase/supabase-js";
import { ARTICLES_DATA } from "../data/initialData.js";

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid credentials are provided
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  !envUrl.includes("your-project-id") &&
  envUrl.startsWith("https://")
);

// Fallback dummy URL and anon key to prevent createClient from crashing if unconfigured
const supabaseUrl = isSupabaseConfigured ? envUrl : "https://placeholder-arogyamitra.supabase.co";
const supabaseAnonKey = isSupabaseConfigured ? envAnonKey : "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper for local demo storage when Supabase is not yet connected
function getLocalStorage(key, fallback = []) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

// ==============================================================================
// AUTH SERVICES
// ==============================================================================
export const authService = {
  async signUp(email, password, fullName, preferredLanguage = "en") {
    if (!isSupabaseConfigured) {
      // Local fallback mode
      const demoUser = {
        id: "demo-user-" + Date.now(),
        email,
        user_metadata: { full_name: fullName, preferred_language: preferredLanguage },
      };
      setLocalStorage("arogya_demo_session", { user: demoUser });
      return { data: { user: demoUser, session: { user: demoUser } }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          preferred_language: preferredLanguage,
        },
      },
    });
    return { data, error };
  },

  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: "demo-user-1",
        email,
        user_metadata: { full_name: email.split("@")[0], preferred_language: "en" },
      };
      setLocalStorage("arogya_demo_session", { user: demoUser });
      return { data: { user: demoUser, session: { user: demoUser } }, error: null };
    }

    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      localStorage.removeItem("arogya_demo_session");
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  async resetPassword(email) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
  },

  async getSession() {
    if (!isSupabaseConfigured) {
      const session = getLocalStorage("arogya_demo_session", null);
      return { data: { session }, error: null };
    }
    return await supabase.auth.getSession();
  },

  onAuthStateChange(callback) {
    if (!isSupabaseConfigured) {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ==============================================================================
// PROFILES & USER PREFERENCES
// ==============================================================================
export const profileService = {
  async getProfile(userId) {
    if (!isSupabaseConfigured || !userId) {
      return {
        data: getLocalStorage("arogya_user_profile", {
          id: userId || "demo-user-1",
          full_name: "Arogya Member",
          preferred_language: "en",
          region: "India",
        }),
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  },

  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured || !userId) {
      const current = getLocalStorage("arogya_user_profile", {});
      const updated = { ...current, ...updates, id: userId, updated_at: new Date().toISOString() };
      setLocalStorage("arogya_user_profile", updated);
      return { data: updated, error: null };
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    return { data, error };
  },

  async getPreferences(userId) {
    if (!isSupabaseConfigured || !userId) {
      return {
        data: getLocalStorage("arogya_user_prefs", { compact_cards: false, notifications_enabled: false }),
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    return { data, error };
  },

  async updatePreferences(userId, prefs) {
    if (!isSupabaseConfigured || !userId) {
      setLocalStorage("arogya_user_prefs", prefs);
      return { data: prefs, error: null };
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() })
      .select()
      .single();

    return { data, error };
  },
};

// ==============================================================================
// CHAT CONVERSATIONS & MESSAGES
// ==============================================================================
export const chatDbService = {
  async getConversations(userId) {
    if (!isSupabaseConfigured || !userId) {
      return { data: getLocalStorage("arogya_conversations", []), error: null };
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    return { data: data || [], error };
  },

  async createConversation(userId, title, language = "en") {
    if (!isSupabaseConfigured || !userId) {
      const newConv = {
        id: "conv-" + Date.now(),
        user_id: userId,
        title,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const list = [newConv, ...getLocalStorage("arogya_conversations", [])];
      setLocalStorage("arogya_conversations", list);
      return { data: newConv, error: null };
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: userId, title, language })
      .select()
      .single();

    return { data, error };
  },

  async getMessages(conversationId) {
    if (!isSupabaseConfigured || !conversationId) {
      const allMsgs = getLocalStorage("arogya_chat_messages", {});
      return { data: allMsgs[conversationId] || [], error: null };
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    return { data: data || [], error };
  },

  async addMessage(conversationId, userId, role, content) {
    if (!isSupabaseConfigured || !conversationId) {
      const msg = {
        id: "msg-" + Date.now() + Math.random(),
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        created_at: new Date().toISOString(),
      };
      const allMsgs = getLocalStorage("arogya_chat_messages", {});
      allMsgs[conversationId] = [...(allMsgs[conversationId] || []), msg];
      setLocalStorage("arogya_chat_messages", allMsgs);
      return { data: msg, error: null };
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: conversationId, user_id: userId, role, content })
      .select()
      .single();

    // Update conversation timestamp
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { data, error };
  },

  async deleteConversation(conversationId) {
    if (!isSupabaseConfigured) {
      const list = getLocalStorage("arogya_conversations", []).filter((c) => c.id !== conversationId);
      setLocalStorage("arogya_conversations", list);
      return { error: null };
    }

    return await supabase.from("chat_conversations").delete().eq("id", conversationId);
  },
};

// ==============================================================================
// VACCINATION REMINDERS
// ==============================================================================
export const vaccinationService = {
  async getReminders(userId) {
    if (!isSupabaseConfigured || !userId) {
      return { data: getLocalStorage("arogya_vaccine_reminders", []), error: null };
    }

    const { data, error } = await supabase
      .from("vaccination_reminders")
      .select("*")
      .eq("user_id", userId)
      .order("planned_date", { ascending: true });

    return { data: data || [], error };
  },

  async addReminder(userId, { recipient_name, vaccine_name, planned_date, notes }) {
    if (!isSupabaseConfigured || !userId) {
      const reminder = {
        id: "rem-" + Date.now(),
        user_id: userId,
        recipient_name,
        vaccine_name,
        planned_date,
        is_completed: false,
        notes: notes || "",
        created_at: new Date().toISOString(),
      };
      const list = [...getLocalStorage("arogya_vaccine_reminders", []), reminder].sort((a, b) =>
        a.planned_date.localeCompare(b.planned_date)
      );
      setLocalStorage("arogya_vaccine_reminders", list);
      return { data: reminder, error: null };
    }

    const { data, error } = await supabase
      .from("vaccination_reminders")
      .insert({
        user_id: userId,
        recipient_name,
        vaccine_name,
        planned_date,
        notes,
      })
      .select()
      .single();

    return { data, error };
  },

  async toggleComplete(reminderId, isCompleted) {
    if (!isSupabaseConfigured) {
      const list = getLocalStorage("arogya_vaccine_reminders", []).map((r) =>
        r.id === reminderId ? { ...r, is_completed: isCompleted } : r
      );
      setLocalStorage("arogya_vaccine_reminders", list);
      return { error: null };
    }

    return await supabase
      .from("vaccination_reminders")
      .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
      .eq("id", reminderId);
  },

  async deleteReminder(reminderId) {
    if (!isSupabaseConfigured) {
      const list = getLocalStorage("arogya_vaccine_reminders", []).filter((r) => r.id !== reminderId);
      setLocalStorage("arogya_vaccine_reminders", list);
      return { error: null };
    }

    return await supabase.from("vaccination_reminders").delete().eq("id", reminderId);
  },
};

// ==============================================================================
// EMERGENCY CONTACTS
// ==============================================================================
export const emergencyContactService = {
  async getContacts(userId) {
    if (!isSupabaseConfigured || !userId) {
      return { data: getLocalStorage("arogya_emergency_contacts", []), error: null };
    }

    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { data: data || [], error };
  },

  async addContact(userId, { name, phone, relationship }) {
    if (!isSupabaseConfigured || !userId) {
      const contact = {
        id: "cnt-" + Date.now(),
        user_id: userId,
        name,
        phone,
        relationship: relationship || "Family/Friend",
        created_at: new Date().toISOString(),
      };
      const list = [contact, ...getLocalStorage("arogya_emergency_contacts", [])];
      setLocalStorage("arogya_emergency_contacts", list);
      return { data: contact, error: null };
    }

    const { data, error } = await supabase
      .from("emergency_contacts")
      .insert({ user_id: userId, name, phone, relationship })
      .select()
      .single();

    return { data, error };
  },

  async deleteContact(contactId) {
    if (!isSupabaseConfigured) {
      const list = getLocalStorage("arogya_emergency_contacts", []).filter((c) => c.id !== contactId);
      setLocalStorage("arogya_emergency_contacts", list);
      return { error: null };
    }

    return await supabase.from("emergency_contacts").delete().eq("id", contactId);
  },
};

// ==============================================================================
// HEALTH ARTICLES & BOOKMARKS
// ==============================================================================
export const articleService = {
  async getArticles() {
    if (!isSupabaseConfigured) {
      return { data: ARTICLES_DATA, error: null };
    }

    const { data, error } = await supabase
      .from("health_articles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return { data: ARTICLES_DATA, error: null };
    }

    return { data, error: null };
  },

  async getSavedArticleIds(userId) {
    if (!isSupabaseConfigured || !userId) {
      return { data: getLocalStorage("arogya_saved_articles", []), error: null };
    }

    const { data, error } = await supabase
      .from("saved_articles")
      .select("article_id")
      .eq("user_id", userId);

    const ids = data ? data.map((d) => d.article_id) : [];
    return { data: ids, error };
  },

  async toggleSaveArticle(userId, articleId, isSaved) {
    if (!isSupabaseConfigured || !userId) {
      let saved = getLocalStorage("arogya_saved_articles", []);
      if (isSaved) {
        saved = [...new Set([...saved, articleId])];
      } else {
        saved = saved.filter((id) => id !== articleId);
      }
      setLocalStorage("arogya_saved_articles", saved);
      return { error: null };
    }

    if (isSaved) {
      return await supabase.from("saved_articles").insert({ user_id: userId, article_id: articleId });
    } else {
      return await supabase
        .from("saved_articles")
        .delete()
        .eq("user_id", userId)
        .eq("article_id", articleId);
    }
  },
};
