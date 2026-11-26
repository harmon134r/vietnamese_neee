import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Cloud,
  Copy,
  Database,
  Eye,
  EyeOff,
  HardDrive,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { isSupabaseConfigured, signIn, signOut, signUp } from "../../lib/supabase";
import { syncLocalToCloud } from "../../lib/storage";

const ENV_SNIPPET = `VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`;

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
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
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
      onNotify?.("Không thể sao chép tự động, vui lòng bôi đen đoạn mã.", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setErrorMsg("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const result = await signIn({ email: cleanEmail, password });
        onAuthSuccess?.(result.user, result.profile);
        onNotify?.("Đăng nhập thành công! Dữ liệu đang đồng bộ với Supabase.", "success");
        setPassword("");
        onClose();
      } else {
        const result = await signUp({
          email: cleanEmail,
          password,
          displayName: displayName.trim(),
        });
        if (result.needsEmailConfirmation) {
          setInfoMsg(
            "Tài khoản đã được tạo! Vui lòng kiểm tra hộp thư email để xác nhận trước khi đăng nhập."
          );
          setMode("signin");
        } else {
          onAuthSuccess?.(result.user, result.profile);
          onNotify?.("Tạo tài khoản và đăng nhập thành công!", "success");
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
      const { syncedDecks = 0, syncedCards = 0, syncedSessions = 0 } = await syncLocalToCloud();
      const parts = [];
      if (syncedDecks > 0) parts.push(`${syncedDecks} bộ thẻ`);
      if (syncedCards > 0) parts.push(`${syncedCards} flashcard`);
      if (syncedSessions > 0) parts.push(`${syncedSessions} phiên luyện tập`);
      if (parts.length > 0) {
        const msg = `Đã đồng bộ ${parts.join(", ")} từ máy lên Supabase.`;
        setInfoMsg(msg);
        onNotify?.(msg, "success");
      } else {
        setInfoMsg("Dữ liệu trên trình duyệt đã đồng bộ đầy đủ với tài khoản Supabase.");
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
      onNotify?.("Đã đăng xuất. Ứng dụng chuyển về chế độ lưu cục bộ.", "info");
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể đăng xuất lúc này.");
    } finally {
      setBusy(false);
    }
  };

  const resolvedName =
    userProfile?.displayName ||
    user?.user_metadata?.display_name ||
    (user?.email ? user.email.split("@")[0] : "Học viên ViệtFlow");
  const initials = resolvedName.trim().slice(0, 2).toUpperCase() || "VF";

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
          <div>
            <h2 id="vf-auth-modal-title" className="vf-modal-title">
              {!isSupabaseConfigured
                ? "Chế độ Lưu Cục Bộ (Local)"
                : user
                  ? "Tài khoản & Đồng bộ Supabase"
                  : "Đăng nhập Đồng bộ Supabase"}
            </h2>
            <p className="vf-modal-subtitle">
              {!isSupabaseConfigured
                ? "Tự động lưu bộ thẻ và tiến độ ngay trên trình duyệt"
                : user
                  ? "Flashcard và tiến độ 4 kỹ năng đang được đồng bộ đám mây"
                  : "Lưu bộ thẻ tùy chỉnh và lịch sử học trên mọi thiết bị"}
            </p>
          </div>

          <button
            type="button"
            className="vf-modal-close"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <X size={18} />
          </button>
        </div>

        <div className="vf-modal-body">
          {/* Case 1: Supabase is NOT configured yet */}
          {!isSupabaseConfigured && (
            <>
              <div className="vf-alert vf-alert--info">
                <HardDrive size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Ứng dụng đang hoạt động hoàn chỉnh ở chế độ Local.</strong> Mọi flashcard bạn tạo,
                  điểm 4 kỹ năng, XP và chuỗi ngày học đều được tự động lưu trong <code>localStorage</code>{" "}
                  của trình duyệt mà không cần đăng nhập.
                </div>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: "0.86rem", fontWeight: 600 }}>
                  Muốn bật đồng bộ tài khoản khi deploy lên Vercel + Supabase?
                </p>
                <p style={{ margin: "0 0 10px", fontSize: "0.84rem", color: "var(--text-muted)" }}>
                  Thêm chính xác 2 biến môi trường sau vào <code>.env.local</code> hoặc Vercel Environment
                  Variables:
                </p>

                <div className="vf-code-box">
                  <button
                    type="button"
                    className="vf-copy-btn"
                    onClick={handleCopyEnv}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                  <pre>{ENV_SNIPPET}</pre>
                </div>
              </div>

              <ol className="vf-steps-list">
                <li>
                  Tạo project mới trên Supabase và chạy file migration{" "}
                  <code>supabase/migrations/001_initial_schema.sql</code> trong SQL Editor.
                </li>
                <li>
                  Vào <strong>Project Settings → API</strong> để lấy Project URL và{" "}
                  <code>anon public</code> key.
                </li>
                <li>
                  Dán 2 biến trên vào Vercel và Redeploy — nút này sẽ tự động mở giao diện Đăng nhập /
                  Đăng ký và đồng bộ dữ liệu local lên đám mây.
                </li>
              </ol>

              <button type="button" className="vf-btn vf-btn--primary" onClick={onClose}>
                <ShieldCheck size={16} />
                <span>Tiếp tục học ở chế độ Local</span>
              </button>
            </>
          )}

          {/* Case 2: Supabase configured & User is Signed In */}
          {isSupabaseConfigured && user && (
            <>
              <div className="vf-profile-card">
                <div className="vf-avatar" aria-hidden="true">
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="vf-profile-name">{resolvedName}</p>
                  <p className="vf-profile-email">{user.email}</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <span className="vf-pill vf-pill--emerald">
                      <Cloud size={12} />
                      Đang đồng bộ Supabase
                    </span>
                    <span className="vf-pill vf-pill--indigo">
                      {userProfile?.cefrLevel || "A2–B1"}
                    </span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="vf-alert vf-alert--error" role="alert">
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="vf-alert vf-alert--success">
                  <Check size={17} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{infoMsg}</span>
                </div>
              )}

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(15, 23, 42, 0.55)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.86rem", fontWeight: 600 }}>
                  <Database size={16} color="var(--accent-sky)" />
                  <span>Đồng bộ dữ liệu từ trình duyệt</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Nếu bạn đã tạo flashcard hoặc luyện tập trước khi đăng nhập, hãy nhấn nút dưới đây để
                  tải toàn bộ dữ liệu local lên tài khoản Supabase của bạn.
                </p>
                <button
                  type="button"
                  className="vf-btn vf-btn--emerald"
                  onClick={handleSyncLocal}
                  disabled={syncing || busy}
                >
                  <RefreshCw size={15} className={syncing ? "vf-spin" : ""} />
                  <span>{syncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu local lên Supabase"}</span>
                </button>
              </div>

              <button
                type="button"
                className="vf-btn vf-btn--danger"
                onClick={handleSignOut}
                disabled={busy || syncing}
              >
                <LogOut size={16} />
                <span>{busy ? "Đang đăng xuất..." : "Đăng xuất"}</span>
              </button>
            </>
          )}

          {/* Case 3: Supabase configured & Guest user (Sign In / Sign Up) */}
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
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="vf-alert vf-alert--success">
                  <Check size={17} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{infoMsg}</span>
                </div>
              )}

              <form className="vf-form" onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <div className="vf-field">
                    <label htmlFor="vf-auth-name">Tên hiển thị</label>
                    <input
                      id="vf-auth-name"
                      type="text"
                      className="vf-input"
                      placeholder="Ví dụ: Minh Anh"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="vf-field">
                  <label htmlFor="vf-auth-email">Email</label>
                  <input
                    id="vf-auth-email"
                    type="email"
                    className="vf-input"
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
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
                      placeholder={mode === "signup" ? "Tối thiểu 6 ký tự" : "Nhập mật khẩu"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      required
                    />
                    <button
                      type="button"
                      className="vf-input-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="vf-btn vf-btn--primary vf-btn--lg"
                  disabled={busy}
                >
                  {mode === "signin" ? <LogIn size={17} /> : <UserPlus size={17} />}
                  <span>
                    {busy
                      ? "Đang xử lý..."
                      : mode === "signin"
                        ? "Đăng nhập & Đồng bộ"
                        : "Đăng ký tài khoản"}
                  </span>
                </button>
              </form>

              <p style={{ margin: 0, fontSize: "0.79rem", color: "var(--text-muted)", textAlign: "center" }}>
                Bạn vẫn có thể học không cần tài khoản — dữ liệu hiện tại được giữ an toàn trong trình
                duyệt và có thể đẩy lên Supabase bất cứ lúc nào sau khi đăng nhập.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
