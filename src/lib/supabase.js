import { createClient } from "@supabase/supabase-js";
import { USER_ROLES } from "./contracts.js";

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

export const STUDENT_EMAIL_DOMAIN = "students.vietflow.app";

export const DEFAULT_TEACHER_CODE = (
  import.meta.env?.VITE_TEACHER_CODE || "MUNNN01-GV"
)
  .trim()
  .toUpperCase();

/**
 * Normalize a role string into `"teacher"` or `"student"`.
 * @param {unknown} value
 * @returns {import("./contracts.js").UserRole}
 */
function normalizeUserRole(value) {
  return String(value || "").trim().toLowerCase() === USER_ROLES.TEACHER
    ? USER_ROLES.TEACHER
    : USER_ROLES.STUDENT;
}

/**
 * Determine whether the active profile/user has the teacher role.
 * Trusts the loaded `profile.role` when available; falls back to
 * `user.user_metadata.role` only when `profile` has not loaded yet.
 * @param {Record<string, any> | null | undefined} profile
 * @param {import("@supabase/supabase-js").User | null | undefined} user
 * @returns {boolean}
 */
export function isTeacherProfile(profile, user) {
  if (
    profile &&
    typeof profile === "object" &&
    profile.role !== undefined &&
    profile.role !== null
  ) {
    return normalizeUserRole(profile.role) === USER_ROLES.TEACHER;
  }
  return normalizeUserRole(user?.user_metadata?.role) === USER_ROLES.TEACHER;
}

/**
 * Normalize a student's name: NFC Unicode form, trimmed, collapsed internal whitespace.
 * @param {string} rawName
 * @returns {string}
 */
export function normalizeStudentName(rawName) {
  if (rawName === null || rawName === undefined) return "";
  return String(rawName).normalize("NFC").trim().replace(/\s+/g, " ");
}

/**
 * True when an email address is an internal synthetic student identifier
 * (`...@students.vietflow.app`) that must never be displayed in the UI.
 * @param {string | null | undefined} email
 * @returns {boolean}
 */
export function isSyntheticStudentEmail(email) {
  const clean = String(email || "").trim().toLowerCase();
  return clean.endsWith(`@${STUDENT_EMAIL_DOMAIN}`);
}

/**
 * Resolve the human-friendly student name from profile + Supabase auth user.
 * Never returns a raw email address or synthetic `@students.vietflow.app` address.
 * @param {Record<string, any> | null | undefined} profile
 * @param {import("@supabase/supabase-js").User | null | undefined} user
 * @param {string} [fallback="Học sinh"]
 * @returns {string}
 */
export function resolveStudentDisplayName(profile, user, fallback = "Học sinh") {
  const fromProfile = normalizeStudentName(
    profile?.displayName ?? profile?.display_name
  );
  if (fromProfile && !isSyntheticStudentEmail(fromProfile)) {
    return fromProfile;
  }
  const fromMeta = normalizeStudentName(user?.user_metadata?.display_name);
  if (fromMeta && !isSyntheticStudentEmail(fromMeta)) {
    return fromMeta;
  }
  return fallback;
}

function shortDeterministicHash(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function utf8ToHex(text) {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Deterministically convert a student's name into an internal Supabase email.
 * - Preserves strings already containing `@` (lowercased) for backwards compatibility.
 * - Normalizes Vietnamese diacritics (`Nguyễn Anh Thư` / `nguyen anh thu` -> `nguyen.anh.thu@students.vietflow.app`).
 * - Encodes non-Latin names (Korean, Japanese, Chinese, etc.) via UTF-8 hex (`u.<hex>@students.vietflow.app`).
 * @param {string} rawName
 * @returns {string}
 */
export function studentNameToEmail(rawName) {
  const normalized = normalizeStudentName(rawName);
  if (normalized.length < 2) {
    throw new Error("Vui lòng nhập tên học sinh tối thiểu 2 ký tự.");
  }

  if (normalized.includes("@")) {
    return normalized.toLowerCase();
  }

  if (!/[\p{L}\p{N}]/u.test(normalized)) {
    throw new Error("Tên học sinh cần chứa ít nhất một chữ cái hoặc chữ số.");
  }

  const lowerNfc = normalized.toLowerCase();
  const stripped = lowerNfc
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const hasNonLatinLetters = /\p{L}/u.test(stripped.replace(/[a-z0-9\s]/g, ""));
  const tokens = hasNonLatinLetters ? [] : stripped.match(/[a-z0-9]+/g) || [];

  let localPart;
  if (tokens.length > 0) {
    localPart = tokens.join(".");
    if (localPart.length > 64) {
      const prefix = localPart.slice(0, 55).replace(/\.+$/, "");
      localPart = `${prefix}.${shortDeterministicHash(localPart)}`;
    }
  } else {
    const hex = utf8ToHex(lowerNfc);
    if (hex.length <= 62) {
      localPart = `u.${hex}`;
    } else {
      localPart = `u.${hex.slice(0, 53)}.${shortDeterministicHash(lowerNfc)}`;
    }
  }

  return `${localPart}@${STUDENT_EMAIL_DOMAIN}`;
}

/**
 * Map Supabase Auth errors into friendly Vietnamese student-name messages.
 * Never exposes synthetic `@students.vietflow.app` addresses.
 * @param {Error | { message?: string, code?: string } | null | undefined} error
 * @param {"signin" | "signup"} [context="signin"]
 * @returns {string}
 */
export function mapSupabaseAuthError(error, context = "signin") {
  const rawMessage = String(error?.message || "").trim();
  const code = String(error?.code || "").trim().toLowerCase();
  const lower = rawMessage.toLowerCase();

  if (
    code === "invalid_credentials" ||
    lower.includes("invalid login credentials")
  ) {
    return "Sai tên học sinh hoặc mật khẩu. Vui lòng kiểm tra lại.";
  }

  if (
    code === "user_already_exists" ||
    lower.includes("user already registered") ||
    lower.includes("already been registered")
  ) {
    return "Tên học sinh này đã có tài khoản. Bạn hãy chuyển sang tab Đăng nhập hoặc thêm biệt danh (ví dụ: Nguyễn Anh Thư 2).";
  }

  if (
    code === "email_not_confirmed" ||
    lower.includes("email not confirmed")
  ) {
    return "Tài khoản chưa được kích hoạt xác thực. Vui lòng tắt 'Confirm email' trong Supabase Auth.";
  }

  if (
    code === "weak_password" ||
    (lower.includes("password") &&
      (lower.includes("at least") ||
        lower.includes("6") ||
        lower.includes("short") ||
        lower.includes("weak") ||
        lower.includes("length")))
  ) {
    return "Mật khẩu cần tối thiểu 6 ký tự.";
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    lower.includes("rate limit") ||
    lower.includes("too many requests")
  ) {
    return "Bạn thao tác hơi nhanh. Vui lòng đợi một chút rồi thử lại.";
  }

  if (
    lower.includes("invalid email") ||
    lower.includes("unable to validate email") ||
    lower.includes("email address")
  ) {
    return "Tên học sinh không hợp lệ. Vui lòng nhập tên đầy đủ (ví dụ: Nguyễn Anh Thư).";
  }

  if (
    lower.includes("signup is disabled") ||
    lower.includes("signups not allowed")
  ) {
    return "Tính năng tạo tài khoản hiện đang tạm tắt trên hệ thống.";
  }

  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";
  }

  if (
    !rawMessage ||
    lower.includes(STUDENT_EMAIL_DOMAIN) ||
    lower.includes("email")
  ) {
    return context === "signup"
      ? "Không thể tạo tài khoản lúc này. Vui lòng thử lại."
      : "Sai tên học sinh hoặc mật khẩu. Vui lòng kiểm tra lại.";
  }

  return rawMessage;
}

const PROFILE_COLUMNS_WITH_ROLE =
  "user_id,display_name,role,avatar_url,cefr_level,native_lang,daily_goal_minutes,preferences";
const PROFILE_COLUMNS_LEGACY =
  "user_id,display_name,avatar_url,cefr_level,native_lang,daily_goal_minutes,preferences";

/**
 * Map a `user_profiles` row + auth user to a normalized UserProfile.
 * @param {Record<string, any> | null} profileRow
 * @param {import("@supabase/supabase-js").User} user
 * @returns {import("./contracts.js").UserProfile}
 */
function toUserProfile(profileRow, user) {
  const role =
    profileRow && profileRow.role !== undefined && profileRow.role !== null
      ? normalizeUserRole(profileRow.role)
      : normalizeUserRole(user?.user_metadata?.role);

  return {
    id: user.id,
    email: isSyntheticStudentEmail(user.email) ? "" : user.email || "",
    displayName: resolveStudentDisplayName(
      profileRow,
      user,
      role === USER_ROLES.TEACHER ? "Giáo viên" : "Học sinh"
    ),
    role,
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
 * @param {import("@supabase/supabase-js").User | null} [fallbackUser=null]
 * @returns {Promise<import("./contracts.js").UserProfile | null>}
 */
export async function getUserProfile(userId, fallbackUser = null) {
  if (!supabase) return null;
  const user = (await getCurrentUser()) || fallbackUser;
  if (!user) return null;

  const targetId = userId || user.id;
  let { data, error } = await supabase
    .from("user_profiles")
    .select(PROFILE_COLUMNS_WITH_ROLE)
    .eq("user_id", targetId)
    .maybeSingle();

  if (error && String(error.message || "").toLowerCase().includes("role")) {
    const legacyRes = await supabase
      .from("user_profiles")
      .select(PROFILE_COLUMNS_LEGACY)
      .eq("user_id", targetId)
      .maybeSingle();
    data = legacyRes.data;
    error = legacyRes.error;
  }

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

  let { data, error } = await supabase
    .from("user_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select(PROFILE_COLUMNS_WITH_ROLE)
    .single();

  if (error && String(error.message || "").toLowerCase().includes("role")) {
    const legacyRes = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select(PROFILE_COLUMNS_LEGACY)
      .single();
    data = legacyRes.data;
    error = legacyRes.error;
  }

  if (error) throw error;
  return toUserProfile(data, user);
}

/**
 * Sign in with student/teacher name (or legacy email) and password via Supabase Auth.
 * When `expectedRole` is provided (`"student"` or `"teacher"`), verifies the account's
 * persisted role and signs out cleanly with a clear Vietnamese message on mismatch.
 * @param {{ studentName?: string, email?: string, password: string, expectedRole?: import("./contracts.js").UserRole }} credentials
 * @returns {Promise<{ session: import("@supabase/supabase-js").Session | null, user: import("@supabase/supabase-js").User, profile: import("./contracts.js").UserProfile | null }>}
 */
export async function signIn({ studentName, email, password, expectedRole } = {}) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình. Ứng dụng đang chạy ở chế độ lưu cục bộ.");
  }

  const internalEmail = studentNameToEmail(studentName ?? email ?? "");
  const cleanPassword = String(password || "");
  if (!cleanPassword) {
    throw new Error("Vui lòng nhập mật khẩu.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password: cleanPassword,
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error, "signin"));
  }

  const profile = await getUserProfile(data.user.id, data.user);
  const normalizedExpectedRole = expectedRole
    ? String(expectedRole).trim().toLowerCase()
    : null;

  if (
    normalizedExpectedRole === USER_ROLES.TEACHER &&
    profile?.role !== USER_ROLES.TEACHER
  ) {
    await signOut().catch(() => {});
    throw new Error(
      "Tài khoản này là tài khoản học sinh. Hãy chuyển sang tab Học sinh để đăng nhập."
    );
  }

  if (
    normalizedExpectedRole === USER_ROLES.STUDENT &&
    profile?.role === USER_ROLES.TEACHER
  ) {
    await signOut().catch(() => {});
    throw new Error(
      "Tài khoản này là tài khoản giáo viên. Hãy chuyển sang tab Giáo viên để đăng nhập."
    );
  }

  return {
    session: data.session,
    user: data.user,
    profile,
  };
}

/**
 * Sign up a new student or teacher account with name (or legacy email) and password.
 * Students require zero email and zero teacher code; teachers must provide the valid teacher code.
 * @param {{ studentName?: string, email?: string, password: string, displayName?: string, role?: import("./contracts.js").UserRole, teacherCode?: string }} params
 * @returns {Promise<{ session: import("@supabase/supabase-js").Session | null, user: import("@supabase/supabase-js").User | null, profile: import("./contracts.js").UserProfile | null, needsEmailConfirmation: boolean }>}
 */
export async function signUp({
  studentName,
  email,
  password,
  displayName = "",
  role = USER_ROLES.STUDENT,
  teacherCode = "",
} = {}) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình. Ứng dụng đang chạy ở chế độ lưu cục bộ.");
  }

  const normalizedRole = normalizeUserRole(role);
  const cleanCode = String(teacherCode || "").trim().toUpperCase();

  if (normalizedRole === USER_ROLES.TEACHER && cleanCode !== DEFAULT_TEACHER_CODE) {
    throw new Error(
      "Mã giáo viên không đúng. Vui lòng nhập đúng mã giáo viên để tạo tài khoản."
    );
  }

  const rawIdentifier = studentName ?? email ?? "";
  const internalEmail = studentNameToEmail(rawIdentifier);
  const cleanPassword = String(password || "");
  if (cleanPassword.length < 6) {
    throw new Error("Mật khẩu cần tối thiểu 6 ký tự.");
  }

  const normalizedInput = normalizeStudentName(displayName || studentName);
  const fallbackName = normalizedRole === USER_ROLES.TEACHER ? "Giáo viên" : "Học sinh";
  const cleanName =
    normalizedInput && !normalizedInput.includes("@")
      ? normalizedInput
      : normalizeStudentName(displayName) ||
        (String(rawIdentifier).includes("@")
          ? normalizeStudentName(String(rawIdentifier).split("@")[0])
          : normalizeStudentName(rawIdentifier)) ||
        fallbackName;

  const metadata = {
    display_name: cleanName,
    role: normalizedRole,
    ...(normalizedRole === USER_ROLES.TEACHER ? { teacher_code: cleanCode } : {}),
  };

  const { data, error } = await supabase.auth.signUp({
    email: internalEmail,
    password: cleanPassword,
    options: {
      data: metadata,
    },
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error, "signup"));
  }

  if (
    data?.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    throw new Error(
      mapSupabaseAuthError({ message: "User already registered" }, "signup")
    );
  }

  let profile = null;
  if (data.session && data.user) {
    try {
      profile = await updateUserProfile({ displayName: cleanName });
    } catch {
      profile = toUserProfile(
        { display_name: cleanName, role: normalizedRole },
        data.user
      );
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
