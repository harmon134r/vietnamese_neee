import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  HardDrive,
  LogOut,
  RefreshCw,
  X,
} from "lucide-react";
import {
  isSupabaseConfigured,
  normalizeStudentName,
  resolveStudentDisplayName,
  signIn,
  signOut,
  signUp,
} from "../../lib/supabase";
import { syncLocalToCloud } from "../../lib/storage";
import { APP_ART } from "../../data/illustrations";

const ENV_SNIPPET = `VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`;

function getStudentInitials(name) {
  const parts = normalizeStudentName(name).split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (parts[0] || "HS").slice(0, 2).toUpperCase();
}

export function AuthModal({
  isOpen,
  onClose,
  user,
  userProfile,
  onAuthSuccess,
  onSynced,
  onNotify,
}) {
  const [mode, setMode] = useState("signin");
  const [studentName, setStudentName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg("");
    setInfoMsg("");

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEnv = async () => {
    try {
      await navigator.clipboard.writeText(ENV_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      onNotify?.("Không thể sao chép tự động, bạn hãy bôi đen đoạn mã nhé.", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanName = normalizeStudentName(studentName);
    if (!cleanName || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ tên học sinh và mật khẩu.");
      return;
    }
    if (cleanName.length < 2) {
      setErrorMsg("Vui lòng nhập tên học sinh tối thiểu 2 ký tự.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const result = await signIn({ studentName: cleanName, password });
        const displayName = resolveStudentDisplayName(
          result.profile,
          result.user,
          cleanName
        );
        onAuthSuccess?.(result.user, result.profile);
        onNotify?.(`Chào ${displayName}! Đã đăng nhập và bắt đầu đồng bộ dữ liệu.`, "success");
        setPassword("");
        onClose();
      } else {
        const result = await signUp({
          studentName: cleanName,
          password,
          displayName: cleanName,
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
          onNotify?.(`Chào mừng ${displayName}! Đã tạo tài khoản và đăng nhập.`, "success");
          onClose();
        }
        setPassword("");
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
        onNotify?.(msg, "success");
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
      onNotify?.("Đã đăng xuất. Ứng dụng chuyển về lưu trên trình duyệt.", "info");
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể đăng xuất lúc này.");
    } finally {
      setBusy(false);
    }
  };

  const resolvedName = resolveStudentDisplayName(userProfile, user, "Học sinh");
  const initials = getStudentInitials(resolvedName);

  return (
    <div
      className="vf-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="vf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vf-auth-modal-title"
      >
        <div className="vf-modal-header">
          <div className="vf-modal-header-main">
            <div className="vf-art-frame vf-modal-mascot">
              <img
                src={APP_ART.mascot.src}
                alt={APP_ART.mascot.alt}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="vf-modal-header-copy">
              <h2 id="vf-auth-modal-title" className="vf-modal-title">
                {!isSupabaseConfigured
                  ? "Lưu dữ liệu cục bộ"
                  : user
                    ? "Tài khoản & đồng bộ"
                    : mode === "signup"
                      ? "Tạo tài khoản"
                      : "Đăng nhập"}
              </h2>
              <p className="vf-modal-subtitle">
                {!isSupabaseConfigured
                  ? "Thẻ từ và tiến độ đang được lưu trực tiếp trên trình duyệt này."
                  : user
                    ? "Thẻ từ và lịch sử luyện tập đang đồng bộ qua Supabase."
                    : "Nhập tên học sinh và mật khẩu để lưu tiến độ học và bộ flashcard trên nhiều thiết bị."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="vf-modal-close"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <X size={16} />
          </button>
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
                  Bật đồng bộ tài khoản học sinh với Supabase
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
                  Tạo project trên Supabase, chạy file{" "}
                  <code>supabase/migrations/001_initial_schema.sql</code> trong SQL Editor và tắt{" "}
                  <strong>Confirm email</strong> trong phần cài đặt Supabase Auth để học sinh đăng
                  ký trực tiếp bằng tên và mật khẩu.
                </li>
                <li>
                  Vào <strong>Project Settings → API</strong> để lấy Project URL và{" "}
                  <code>anon public</code> key.
                </li>
                <li>
                  Cập nhật 2 biến trên và deploy lại để bật mục đăng nhập bằng tên học sinh và đồng
                  bộ đám mây.
                </li>
              </ol>

              <button type="button" className="vf-btn vf-btn--primary" onClick={onClose}>
                Tiếp tục học cục bộ
              </button>
            </>
          )}

          {/* Case 2: Signed In */}
          {isSupabaseConfigured && user && (
            <>
              <div className="vf-profile-card">
                <div className="vf-avatar" aria-hidden="true">
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="vf-profile-name">{resolvedName}</p>
                  <p className="vf-profile-email">Tài khoản học sinh · Đang đồng bộ Supabase</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <span className="vf-tag vf-tag--good">Đang đồng bộ</span>
                    <span className="vf-tag">{userProfile?.cefrLevel || "A2–B1"}</span>
                  </div>
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
                <p style={{ margin: 0, fontSize: "0.81rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Nếu bạn từng tạo thẻ hoặc làm bài trước khi đăng nhập, nhấn nút dưới để đẩy toàn bộ dữ liệu trên máy lên tài khoản.
                </p>
                <button
                  type="button"
                  className="vf-btn vf-btn--good"
                  onClick={handleSyncLocal}
                  disabled={syncing || busy}
                >
                  <RefreshCw size={14} className={syncing ? "vf-spin" : ""} />
                  <span>{syncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu từ máy"}</span>
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

          {/* Case 3: Guest Sign In / Sign Up */}
          {isSupabaseConfigured && !user && (
            <>
              <div className="vf-auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signin"}
                  className={`vf-auth-tab ${mode === "signin" ? "is-active" : ""}`}
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg("");
                  }}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signup"}
                  className={`vf-auth-tab ${mode === "signup" ? "is-active" : ""}`}
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                  }}
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
                  <label htmlFor="vf-auth-student-name">Tên học sinh</label>
                  <input
                    id="vf-auth-student-name"
                    type="text"
                    className="vf-input"
                    placeholder="Ví dụ: Nguyễn Anh Thư"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
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

                <button
                  type="submit"
                  className="vf-btn vf-btn--primary vf-btn--lg"
                  disabled={busy}
                >
                  {busy
                    ? "Đang xử lý..."
                    : mode === "signin"
                      ? "Đăng nhập"
                      : "Tạo tài khoản"}
                </button>
              </form>

              <p
                style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Bạn vẫn có thể học không cần đăng nhập — dữ liệu hiện tại được giữ trên trình duyệt
                và có thể đồng bộ bất cứ lúc nào.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
