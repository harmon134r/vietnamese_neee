import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env?.VITE_SUPABASE_URL?.trim() || "";
const rawAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim() || "";

const isPlaceholder = (value) =>
  !value ||
  value.includes("YOUR_PROJECT") ||
  value.includes("YOUR_SUPABASE_ANON_KEY");

/**
 * True when real Supabase environment variables are configured.
 * When false, the app seamlessly falls back to localStorage.
 * @type {boolean}
 */
export const isSupabaseConfigured = Boolean(
  !isPlaceholder(rawUrl) && !isPlaceholder(rawAnonKey)
);

/**
 * Graceful Supabase browser client. `null` when env vars are missing.
 * @type {import("@supabase/supabase-js").SupabaseClient | null}
 */
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Map a `user_profiles` row + auth user to a normalized UserProfile.
 * @param {Record<string, any> | null} profileRow
 * @param {import("@supabase/supabase-js").User} user
 * @returns {import("./contracts.js").UserProfile}
 */
function toUserProfile(profileRow, user) {
  return {
    id: user.id,
    email: user.email || "",
    displayName:
      profileRow?.display_name ||
      user.user_metadata?.display_name ||
      (user.email ? user.email.split("@")[0] : "Học viên"),
    avatarUrl: profileRow?.avatar_url || null,
    cefrLevel: profileRow?.cefr_level || "A2-B1",
    nativeLang: profileRow?.native_lang || "en",
    dailyGoalMinutes: Number(profileRow?.daily_goal_minutes || 15),
    preferences:
      profileRow?.preferences && typeof profileRow.preferences === "object"
        ? profileRow.preferences
        : {},
  };
}

/**
 * Return the active Supabase session and user, or nulls when unconfigured/signed out.
 * @returns {Promise<{ session: import("@supabase/supabase-js").Session | null, user: import("@supabase/supabase-js").User | null, error: Error | null }>}
 */
export async function getSession() {
  if (!supabase) {
    return { session: null, user: null, error: null };
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { session: null, user: null, error };
  }
  const session = data?.session || null;
  return { session, user: session?.user || null, error: null };
}

/**
 * Return the currently authenticated Supabase user, or null.
 * @returns {Promise<import("@supabase/supabase-js").User | null>}
 */
export async function getCurrentUser() {
  const { user } = await getSession();
  return user;
}

/**
 * Fetch the signed-in user's profile row from `user_profiles`.
 * @param {string} [userId]
 * @returns {Promise<import("./contracts.js").UserProfile | null>}
 */
export async function getUserProfile(userId) {
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const targetId = userId || user.id;
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id,display_name,avatar_url,cefr_level,native_lang,daily_goal_minutes,preferences")
    .eq("user_id", targetId)
    .maybeSingle();

  if (error) {
    console.warn("Could not load user_profiles row:", error.message);
    return toUserProfile(null, user);
  }

  return toUserProfile(data, user);
}

/**
 * Update the signed-in user's profile row in `user_profiles`.
 * @param {{ displayName?: string, avatarUrl?: string | null, cefrLevel?: string, nativeLang?: string, dailyGoalMinutes?: number, preferences?: Record<string, any> }} updates
 * @returns {Promise<import("./contracts.js").UserProfile | null>}
 */
export async function updateUserProfile(updates = {}) {
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) throw new Error("Vui lòng đăng nhập để cập nhật hồ sơ.");

  const payload = { user_id: user.id };
  if (updates.displayName !== undefined) payload.display_name = String(updates.displayName).trim();
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
  if (updates.cefrLevel !== undefined) payload.cefr_level = String(updates.cefrLevel);
  if (updates.nativeLang !== undefined) payload.native_lang = String(updates.nativeLang);
  if (updates.dailyGoalMinutes !== undefined) {
    payload.daily_goal_minutes = Math.max(5, Math.round(Number(updates.dailyGoalMinutes) || 15));
  }
  if (updates.preferences !== undefined) payload.preferences = updates.preferences;

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("user_id,display_name,avatar_url,cefr_level,native_lang,daily_goal_minutes,preferences")
    .single();

  if (error) throw error;
  return toUserProfile(data, user);
}

/**
 * Sign in with email and password via Supabase Auth.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ session: import("@supabase/supabase-js").Session | null, user: import("@supabase/supabase-js").User, profile: import("./contracts.js").UserProfile | null }>}
 */
export async function signIn({ email, password }) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình. Ứng dụng đang chạy ở chế độ lưu cục bộ.");
  }

  const cleanEmail = String(email || "").trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: String(password || ""),
  });

  if (error) {
    throw new Error(error.message || "Email hoặc mật khẩu chưa chính xác.");
  }

  const profile = await getUserProfile(data.user.id);
  return {
    session: data.session,
    user: data.user,
    profile,
  };
}

/**
 * Sign up a new learner with email, password, and optional display name.
 * @param {{ email: string, password: string, displayName?: string }} params
 * @returns {Promise<{ session: import("@supabase/supabase-js").Session | null, user: import("@supabase/supabase-js").User | null, profile: import("./contracts.js").UserProfile | null, needsEmailConfirmation: boolean }>}
 */
export async function signUp({ email, password, displayName = "" }) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình. Ứng dụng đang chạy ở chế độ lưu cục bộ.");
  }

  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(displayName || "").trim() || cleanEmail.split("@")[0];

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: String(password || ""),
    options: {
      data: {
        display_name: cleanName,
      },
    },
  });

  if (error) {
    throw new Error(error.message || "Không thể đăng ký tài khoản.");
  }

  let profile = null;
  if (data.session && data.user) {
    try {
      profile = await updateUserProfile({ displayName: cleanName });
    } catch {
      profile = toUserProfile({ display_name: cleanName }, data.user);
    }
  }

  return {
    session: data.session || null,
    user: data.user || null,
    profile,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  };
}

/**
 * Sign out of the current Supabase session.
 * @returns {Promise<void>}
 */
export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Subscribe to Supabase auth state changes. Returns an unsubscribe function.
 * Safe no-op when Supabase is unconfigured.
 * @param {(event: string, session: import("@supabase/supabase-js").Session | null) => void} callback
 * @returns {() => void}
 */
export function onAuthStateChange(callback) {
  if (!supabase || typeof callback !== "function") {
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => {
    data?.subscription?.unsubscribe();
  };
}
