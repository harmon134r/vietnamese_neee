import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Database,
  Eye,
  EyeOff,
  GraduationCap,
  HardDrive,
  LogOut,
  RefreshCw,
  X,
} from "lucide-react";
import {
  isSupabaseConfigured,
  isTeacherProfile,
  normalizeStudentName,
  resolveStudentDisplayName,
  signIn,
  signOut,
  signUp,
} from "../../lib/supabase";
import { d1Health, isD1Configured } from "../../lib/d1Client";
import { syncLocalToCloud } from "../../lib/storage";
import { APP_ART } from "../../data/illustrations";

const ENV_SNIPPET = `VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`;

function formatByteSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "";
  if (value < 1024) return `${Math.round(value)} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatD1UsageSummary(stats) {
  if (!stats || typeof stats !== "object") return "";
  const parts = [];
  const usedLabel = formatByteSize(stats.usedBytes);
  if (usedLabel) {
    parts.push(`Đã dùng ${usedLabel} / 5 GB`);
  }
  const deckCount = Number(stats.counts?.decks);
  if (Number.isFinite(deckCount)) {
    parts.push(`${deckCount.toLocaleString("vi-VN")} bộ thẻ`);
  }
  const cardCount = Number(stats.counts?.flashcards);
  if (Number.isFinite(cardCount)) {
    parts.push(`${cardCount.toLocaleString("vi-VN")} flashcard`);
  }
  return parts.join(" · ");
}

function getAccountInitials(name, fallback = "HS") {
  const parts = normalizeStudentName(name).split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (parts[0] || fallback).slice(0, 2).toUpperCase();
}

export function AuthModal({
  isOpen,
  onClose,
  user,
  userProfile,
  isTeacher: isTeacherProp,
  onAuthSuccess,
  onSynced,
  onNotify,
  onToast,
  inline = false,
  mandatory = false,
}) {
  const [role, setRole] = useState("student"); // "student" | "teacher"
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [d1Stats, setD1Stats] = useState(null);

  const d1Active = isD1Configured();
  const notifyUser = onNotify || onToast;

  useEffect(() => {
    if (!isOpen) return undefined;
    setErrorMsg("");
    setInfoMsg("");

    if (mandatory) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mandatory, onClose]);

  useEffect(() => {
    if (!isOpen || !user || !d1Active) {
      setD1Stats(null);
      return undefined;
    }

    let cancelled = false;
    d1Health()
      .then((data) => {
        if (!cancelled && data?.ok) {
          setD1Stats(data);
        }
      })
      .catch(() => {
        if (!cancelled) setD1Stats(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user, d1Active]);

  if (!isOpen) return null;

  const isTeacherTab = role === "teacher";
  const signedInIsTeacher =
    typeof isTeacherProp === "boolean"
      ? isTeacherProp
      : Boolean(isTeacherProfile?.(userProfile, user));

  const handleRoleChange = (nextRole) => {
    if (nextRole === role) return;
    setRole(nextRole);
    setErrorMsg("");
    setInfoMsg("");
    if (nextRole === "student") {
      setTeacherCode("");
    }
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setErrorMsg("");
    setInfoMsg("");
  };

  const handleCopyEnv = async () => {
    try {
      await navigator.clipboard.writeText(ENV_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      notifyUser?.("Không thể sao chép tự động, bạn hãy bôi đen đoạn mã nhé.", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanName = normalizeStudentName(accountName);
    const cleanCode = teacherCode.trim();
    const roleLabel = isTeacherTab ? "giáo viên" : "học sinh";

    if (!cleanName || !password) {
      setErrorMsg(`Vui lòng nhập đầy đủ tên ${roleLabel} và mật khẩu.`);
      return;
    }
    if (cleanName.length < 2) {
      setErrorMsg(`Vui lòng nhập tên ${roleLabel} tối thiểu 2 ký tự.`);
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }
    if (isTeacherTab && mode === "signup" && !cleanCode) {
      setErrorMsg("Vui lòng nhập mã giáo viên để tạo tài khoản giáo viên.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const isEmailInput = isTeacherTab && cleanName.includes("@");
        const result = await signIn({
          studentName: isEmailInput ? undefined : cleanName,
          email: isEmailInput ? cleanName : undefined,
          password,
          expectedRole: role,
        });
        const displayName = resolveStudentDisplayName(
          result.profile,
          result.user,
          cleanName
        );
        onAuthSuccess?.(result.user, result.profile);
        notifyUser?.(
          isTeacherTab
            ? `Chào ${displayName}! Đã đăng nhập tài khoản giáo viên.`
            : `Chào ${displayName}! Đã đăng nhập và bắt đầu đồng bộ dữ liệu.`,
          "success"
        );
        setPassword("");
        setTeacherCode("");
        onClose?.();
      } else {
        const result = await signUp({
          studentName: cleanName,
          password,
          displayName: cleanName,
          role,
          ...(isTeacherTab ? { teacherCode: cleanCode } : {}),
        });
        if (result.needsEmailConfirmation) {
          setErrorMsg(
            "Tài khoản chưa được kích hoạt xác thực. Vui lòng tắt 'Confirm email' trong Supabase Auth."
          );
        } else {
          const displayName = resolveStudentDisplayName(
            result.profile,
            result.user,
            cleanName
          );
          onAuthSuccess?.(result.user, result.profile);
          notifyUser?.(
            isTeacherTab
              ? `Chào mừng ${displayName}! Đã tạo tài khoản giáo viên và đăng nhập.`
              : `Chào mừng ${displayName}! Đã tạo tài khoản và đăng nhập.`,
            "success"
          );
          onClose?.();
        }
        setPassword("");
        setTeacherCode("");
      }
    } catch (err) {
      setErrorMsg(err?.message || "Đã xảy ra lỗi xác thực. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const handleSyncLocal = async () => {
    setSyncing(true);
    setErrorMsg("");
    setInfoMsg("");
    try {
      const { syncedDecks = 0, syncedCards = 0, syncedSessions = 0 } =
        await syncLocalToCloud();
      const parts = [];
      if (syncedDecks > 0) parts.push(`${syncedDecks} bộ thẻ`);
      if (syncedCards > 0) parts.push(`${syncedCards} flashcard`);
      if (syncedSessions > 0) parts.push(`${syncedSessions} bài luyện`);
      if (parts.length > 0) {
        const msg = `Đã đồng bộ ${parts.join(", ")} từ máy lên tài khoản.`;
        setInfoMsg(msg);
        notifyUser?.(msg, "success");
      } else {
        setInfoMsg("Dữ liệu trên trình duyệt đã khớp hoàn toàn với tài khoản.");
      }
      await onSynced?.();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể đồng bộ dữ liệu lúc này.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setErrorMsg("");
    try {
      await signOut();
      onAuthSuccess?.(null, null);
      notifyUser?.("Đã đăng xuất thành công.", "info");
      onClose?.();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể đăng xuất lúc này.");
    } finally {
      setBusy(false);
    }
  };

  const resolvedName = resolveStudentDisplayName(
    userProfile,
    user,
    signedInIsTeacher ? "Giáo viên" : "Học sinh"
  );
  const initials = getAccountInitials(resolvedName, signedInIsTeacher ? "GV" : "HS");

  const nameFieldLabel = isTeacherTab
    ? mode === "signin"
      ? "Tên giáo viên hoặc Email"
      : "Tên giáo viên"
    : "Tên học sinh";

  const nameFieldPlaceholder = isTeacherTab
    ? "Ví dụ: Cô Minh"
    : "Ví dụ: Nguyễn Anh Thư";

  const mascotGreeting = isTeacherTab
    ? mode === "signup"
      ? "Mở lớp mới!"
      : "Chào thầy cô!"
    : mode === "signup"
      ? "Cùng học nào!"
      : "Chào bạn!";

  const animateMascot = Boolean(inline || mandatory || (isSupabaseConfigured && !user));
  const showMascotGreeting = Boolean(isSupabaseConfigured && !user);
  const swapKey = `${role}-${mode}`;

  const modalContent = (
    <>
      <div className="vf-modal-header">
        <div className="vf-modal-header-main">
          <div
            className={`vf-art-frame vf-modal-mascot ${animateMascot ? "vf-auth-mascot--alive" : ""}`}
          >
            <img
              src={APP_ART.mascot.src}
              alt={APP_ART.mascot.alt}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="vf-modal-header-copy">
            <div className="vf-modal-title-row">
              <h2 id="vf-auth-modal-title" className="vf-modal-title">
                {!isSupabaseConfigured
                  ? "Lưu dữ liệu cục bộ"
                  : user
                    ? "Tài khoản & đồng bộ"
                    : mode === "signup"
                      ? "Tạo tài khoản"
                      : "Đăng nhập"}
              </h2>
              {showMascotGreeting && (
                <span
                  key={swapKey}
                  className={`vf-mascot-bubble ${isTeacherTab ? "is-teacher" : ""}`}
                  data-testid="auth-mascot-greeting"
                >
                  {mascotGreeting}
                </span>
              )}
            </div>
            <p
              key={showMascotGreeting ? `sub-${swapKey}` : "sub-static"}
              className={`vf-modal-subtitle ${showMascotGreeting ? "vf-auth-panel-swap" : ""}`}
            >
              {!isSupabaseConfigured
                ? "Thẻ từ và tiến độ đang được lưu trực tiếp trên trình duyệt này."
                : user
                  ? signedInIsTeacher
                    ? d1Active
                      ? "Có thể tạo & giao bộ thẻ PDF cho toàn lớp qua Cloudflare D1."
                      : "Có thể tạo & giao bộ thẻ PDF cho toàn lớp qua Supabase."
                    : d1Active
                      ? "Đồng bộ tiến độ & bài Flashcard giáo viên giao qua Cloudflare D1."
                      : "Đồng bộ tiến độ & bài Flashcard giáo viên giao qua Supabase."
                  : isTeacherTab
                    ? "Tạo và giao bộ thẻ Flashcard từ file PDF cho toàn lớp học."
                    : "Nhập tên học sinh và mật khẩu để lưu tiến độ học và bộ flashcard trên nhiều thiết bị."}
            </p>
          </div>
        </div>

        {!mandatory && (
          <button
            type="button"
            className="vf-modal-close"
            onClick={() => onClose?.()}
            aria-label="Đóng hộp thoại"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="vf-modal-body">
        {/* Case 1: Supabase not configured */}
        {!isSupabaseConfigured && (
          <>
            <div className="vf-alert vf-alert--info">
              <HardDrive size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                Bạn có thể học đầy đủ mà không cần tài khoản. Mọi thẻ tự tạo và điểm 4 kỹ năng đều
                được lưu tự động trong <code>localStorage</code> của trình duyệt.
              </div>
            </div>

            <div>
              <p style={{ margin: "0 0 6px", fontSize: "0.85rem", fontWeight: 500 }}>
                Bật đồng bộ tài khoản Học sinh &amp; Giáo viên với Supabase
              </p>
              <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Thêm 2 biến môi trường sau vào <code>.env.local</code> hoặc cấu hình deploy:
              </p>

              <div className="vf-code-box">
                <button
                  type="button"
                  className="vf-copy-btn"
                  onClick={handleCopyEnv}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
                <pre>{ENV_SNIPPET}</pre>
              </div>
            </div>

            <ol className="vf-steps-list">
              <li>
                Tạo project trên Supabase, chạy các file migration trong{" "}
                <code>supabase/migrations/</code> (bao gồm{" "}
                <code>003_teacher_student_roles.sql</code>) trong SQL Editor và tắt{" "}
                <strong>Confirm email</strong> trong cài đặt Supabase Auth.
              </li>
              <li>
                Vào <strong>Project Settings → API</strong> để lấy Project URL và{" "}
                <code>anon public</code> key.
              </li>
              <li>
                Cập nhật 2 biến trên và deploy lại để bật đăng nhập Học sinh / Giáo viên và giao
                bộ thẻ PDF cho toàn lớp.
              </li>
            </ol>

            {!mandatory && (
              <button
                type="button"
                className="vf-btn vf-btn--primary"
                onClick={() => onClose?.()}
              >
                Tiếp tục học cục bộ
              </button>
            )}
          </>
        )}

        {/* Case 2: Signed In */}
        {isSupabaseConfigured && user && (
          <>
            <div className="vf-profile-card">
              <div
                className={`vf-avatar ${signedInIsTeacher ? "is-teacher" : ""}`}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="vf-profile-name">{resolvedName}</p>
                <p className="vf-profile-email">
                  {signedInIsTeacher
                    ? "Có thể tạo & giao bộ thẻ PDF cho toàn lớp"
                    : "Đồng bộ tiến độ & bài Flashcard giáo viên giao"}
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <span
                    className={`vf-tag ${signedInIsTeacher ? "vf-tag--teacher" : "vf-tag--good"}`}
                  >
                    {signedInIsTeacher ? "Giáo viên" : "Học sinh"}
                  </span>
                  {d1Active ? (
                    <span className="vf-tag vf-tag--good" data-testid="d1-capacity-pill">
                      <Database size={11} aria-hidden="true" />
                      <span>Cloudflare D1 · 5 GB</span>
                    </span>
                  ) : (
                    <span className="vf-tag vf-tag--good">Đang đồng bộ</span>
                  )}
                  {!signedInIsTeacher && (
                    <span className="vf-tag">{userProfile?.cefrLevel || "A2–B1"}</span>
                  )}
                </div>
                {d1Active && d1Stats && formatD1UsageSummary(d1Stats) && (
                  <p
                    data-testid="d1-health-stats"
                    style={{
                      margin: "6px 0 0",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {formatD1UsageSummary(d1Stats)}
                  </p>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="vf-alert vf-alert--error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="vf-alert vf-alert--success">
                <Check size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{infoMsg}</span>
              </div>
            )}

            <div className="vf-sync-panel">
              <span style={{ fontSize: "0.86rem", fontWeight: 500 }}>
                Gộp dữ liệu từ trình duyệt
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.81rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Nếu bạn từng tạo thẻ hoặc làm bài trước khi đăng nhập, nhấn nút dưới để đẩy toàn
                bộ dữ liệu trên máy lên tài khoản.
              </p>
              <button
                type="button"
                className="vf-btn vf-btn--good"
                onClick={handleSyncLocal}
                disabled={syncing || busy}
              >
                <RefreshCw size={14} className={syncing ? "vf-spin" : ""} />
                <span>
                  {syncing
                    ? "Đang đồng bộ..."
                    : d1Active
                      ? "Đồng bộ dữ liệu cục bộ lên Cloudflare D1"
                      : "Đồng bộ dữ liệu cục bộ lên Supabase"}
                </span>
              </button>
            </div>

            <button
              type="button"
              className="vf-btn vf-btn--danger"
              onClick={handleSignOut}
              disabled={busy || syncing}
            >
              <LogOut size={15} />
              <span>{busy ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </button>
          </>
        )}

        {/* Case 3: Guest / Mandatory Sign In & Sign Up */}
        {isSupabaseConfigured && !user && (
          <>
            <div
              className="vf-role-switcher"
              role="tablist"
              aria-label="Chọn vai trò tài khoản"
            >
              <button
                type="button"
                role="tab"
                aria-selected={role === "student"}
                className={`vf-role-pill ${role === "student" ? "is-active" : ""}`}
                onClick={() => handleRoleChange("student")}
              >
                <BookOpen size={14} aria-hidden="true" />
                <span>Học sinh</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === "teacher"}
                className={`vf-role-pill is-teacher ${role === "teacher" ? "is-active" : ""}`}
                onClick={() => handleRoleChange("teacher")}
              >
                <GraduationCap size={14} aria-hidden="true" />
                <span>Giáo viên</span>
              </button>
            </div>

            <div className="vf-auth-tabs" role="tablist" aria-label="Chế độ xác thực">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                className={`vf-auth-tab ${mode === "signin" ? "is-active" : ""}`}
                onClick={() => handleModeChange("signin")}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                className={`vf-auth-tab ${mode === "signup" ? "is-active" : ""}`}
                onClick={() => handleModeChange("signup")}
              >
                Tạo tài khoản
              </button>
            </div>

            {errorMsg && (
              <div className="vf-alert vf-alert--error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="vf-alert vf-alert--success">
                <Check size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{infoMsg}</span>
              </div>
            )}

            <form className="vf-form" onSubmit={handleSubmit}>
              <div className="vf-field">
                <label
                  key={`label-${swapKey}`}
                  htmlFor="vf-auth-account-name"
                  className="vf-auth-panel-swap"
                >
                  {nameFieldLabel}
                </label>
                <input
                  id="vf-auth-account-name"
                  type="text"
                  className="vf-input"
                  placeholder={nameFieldPlaceholder}
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="vf-field">
                <label htmlFor="vf-auth-password">Mật khẩu</label>
                <div className="vf-input-wrap">
                  <input
                    id="vf-auth-password"
                    type={showPassword ? "text" : "password"}
                    className="vf-input vf-input--password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="vf-input-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isTeacherTab && mode === "signup" && (
                <div className="vf-field vf-field--slide-in">
                  <label htmlFor="vf-auth-teacher-code">Mã giáo viên</label>
                  <input
                    id="vf-auth-teacher-code"
                    type="text"
                    className="vf-input vf-input--code"
                    placeholder="Nhập mã giáo viên"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <p className="vf-field-helper">
                    Dùng để xác nhận quyền giáo viên khi giao bài PDF cho học sinh.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="vf-btn vf-btn--primary vf-btn--lg"
                disabled={busy}
              >
                <span key={`submit-${swapKey}`} className="vf-auth-panel-swap">
                  {busy
                    ? "Đang xử lý..."
                    : mode === "signin"
                      ? isTeacherTab
                        ? "Đăng nhập giáo viên"
                        : "Đăng nhập"
                      : isTeacherTab
                        ? "Tạo tài khoản giáo viên"
                        : "Tạo tài khoản"}
                </span>
              </button>
            </form>

            <p key={`note-${swapKey}`} className="vf-auth-footer-note vf-auth-panel-swap">
              {mandatory
                ? isTeacherTab
                  ? "Giáo viên tạo tài khoản bằng mã lớp để tải PDF, tạo flashcard và giao bài thẳng cho học sinh."
                  : "Học sinh tạo tài khoản miễn phí chỉ với tên và mật khẩu — không cần email. Tiến độ và flashcard được lưu tự động."
                : "Bạn vẫn có thể học không cần đăng nhập — dữ liệu hiện tại được giữ trên trình duyệt và có thể đồng bộ bất cứ lúc nào."}
            </p>
          </>
        )}
      </div>
    </>
  );

  if (inline) {
    return (
      <div
        className="vf-modal vf-modal--inline"
        data-auth-role={role}
        role="region"
        aria-label="Đăng nhập hoặc đăng ký tài khoản"
      >
        <span className="vf-modal-shimmer" aria-hidden="true">
          <span className="vf-modal-shimmer-track" />
        </span>
        {modalContent}
      </div>
    );
  }

  return (
    <div
      className="vf-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (!mandatory && event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="vf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vf-auth-modal-title"
      >
        {modalContent}
      </div>
    </div>
  );
}

export default AuthModal;
