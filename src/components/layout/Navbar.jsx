import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Compass, Gamepad2, Layers, Volume2 } from "lucide-react";
import { resolveStudentDisplayName } from "../../lib/supabase";
import {
  VIETNAMESE_VOICES,
  VOICE_CHANGE_EVENT,
  VOICE_STORAGE_KEY,
  getSelectedVoice,
  setSelectedVoice,
  stopSpeaking,
} from "../../lib/speech";

const NAV_ITEMS = [
  { id: "dashboard", label: "Tổng quan", icon: BookOpen },
  { id: "games", label: "Trò chơi", icon: Gamepad2 },
  { id: "flashcards", label: "Flashcard", icon: Layers },
  { id: "topics", label: "Chủ đề", icon: Compass },
];

export function Navbar({
  activeView,
  onNavigate,
  skillProgress,
  user,
  userProfile,
  storageMode,
  isSupabaseConfigured,
  onOpenAuth,
}) {
  const [voiceId, setVoiceId] = useState(() => getSelectedVoice());
  const [voiceJustChanged, setVoiceJustChanged] = useState(false);
  const pulseTimerRef = useRef(null);

  useEffect(() => {
    const syncVoice = (event) => {
      const next = event?.detail?.voice || getSelectedVoice();
      setVoiceId(next);
    };
    const handleStorage = (event) => {
      if (!event?.key || event.key === VOICE_STORAGE_KEY) {
        setVoiceId(getSelectedVoice());
      }
    };

    window.addEventListener(VOICE_CHANGE_EVENT, syncVoice);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(VOICE_CHANGE_EVENT, syncVoice);
      window.removeEventListener("storage", handleStorage);
      if (pulseTimerRef.current !== null) {
        clearTimeout(pulseTimerRef.current);
      }
    };
  }, []);

  const currentVoiceIndex = Math.max(
    0,
    VIETNAMESE_VOICES.findIndex((v) => v.id === voiceId)
  );
  const currentVoice = VIETNAMESE_VOICES[currentVoiceIndex] || VIETNAMESE_VOICES[0];
  const nextVoice =
    VIETNAMESE_VOICES[(currentVoiceIndex + 1) % VIETNAMESE_VOICES.length] ||
    VIETNAMESE_VOICES[0];

  const handleCycleVoice = () => {
    stopSpeaking();
    const updated = setSelectedVoice(nextVoice.id);
    setVoiceId(updated);
    setVoiceJustChanged(true);
    if (pulseTimerRef.current !== null) {
      clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = setTimeout(() => {
      setVoiceJustChanged(false);
      pulseTimerRef.current = null;
    }, 900);
  };

  const xp = Math.round(Number(skillProgress?.xp || 0));
  const streakDays = Math.round(Number(skillProgress?.streakDays || 0));
  const isCloud = storageMode === "supabase" && Boolean(user);

  const userDisplayName = user
    ? resolveStudentDisplayName(userProfile, user, "Học sinh")
    : "";

  const authButtonLabel = isCloud
    ? userDisplayName || "Học sinh"
    : isSupabaseConfigured
      ? "Đăng nhập"
      : "Lưu cục bộ";

  return (
    <>
      <header className="vf-navbar">
        <div className="vf-navbar-inner">
          <div className="vf-navbar-left">
            <button
              type="button"
              className="vf-brand"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onNavigate("dashboard")}
              aria-label="ViệtFlow — Về trang tổng quan"
            >
              <span className="vf-brand-name">ViệtFlow</span>
              <span className="vf-brand-level">A2–B1</span>
            </button>

            <nav className="vf-nav-links" aria-label="Điều hướng chính">
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`vf-nav-link ${isActive ? "is-active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onNavigate(item.id)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="vf-nav-right">
            <span
              className="vf-nav-meta"
              title="Điểm kinh nghiệm và chuỗi ngày luyện tập"
            >
              {xp.toLocaleString("vi-VN")} XP · {streakDays} ngày
            </span>

            <button
              type="button"
              className="vf-nav-auth-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCycleVoice}
              title={`Giọng đọc: ${currentVoice.shortLabel} — Bấm để đổi sang ${nextVoice.label}`}
              aria-label={`Đổi giọng đọc tiếng Việt, hiện tại ${currentVoice.shortLabel}`}
              data-voice={currentVoice.id}
              style={{
                borderColor: voiceJustChanged
                  ? "var(--border-highlight)"
                  : undefined,
                color: voiceJustChanged
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              }}
            >
              <Volume2
                size={14}
                aria-hidden="true"
                style={{
                  color: voiceJustChanged
                    ? "var(--accent-primary)"
                    : "var(--text-muted)",
                  flexShrink: 0,
                  transition: "color var(--transition-fast)",
                }}
              />
              <span>{currentVoice.label}</span>
            </button>

            <button
              type="button"
              className="vf-nav-auth-btn"
              onClick={onOpenAuth}
              title={
                isCloud
                  ? `Đang đồng bộ tài khoản ${userDisplayName || ""}`
                  : isSupabaseConfigured
                    ? "Đăng nhập để đồng bộ tiến độ giữa các thiết bị"
                    : "Đang lưu dữ liệu trên trình duyệt này"
              }
            >
              {isCloud && (
                <span className="vf-status-dot is-cloud" aria-hidden="true" />
              )}
              <span>{authButtonLabel}</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="vf-mobile-nav" aria-label="Điều hướng di động">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`vf-mobile-tab ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default Navbar;
