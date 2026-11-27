import React, { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Gamepad2,
  Layers,
  Volume2,
} from "lucide-react";
import { resolveStudentDisplayName } from "../../lib/supabase";
import * as speechApi from "../../lib/speech";

const FALLBACK_NORTHERN_VOICES = Object.freeze([
  Object.freeze({
    id: "ngochuyen",
    label: "Ngọc Huyền",
    shortLabel: "Nữ · Bắc · Tự nhiên",
    gender: "female",
    region: "Bắc",
    style: "Giọng đọc tự nhiên",
  }),
  Object.freeze({
    id: "trucly",
    label: "Trúc Ly",
    shortLabel: "Nữ · Bắc · Tự nhiên",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tự nhiên",
  }),
  Object.freeze({
    id: "maianh",
    label: "Mai Anh",
    shortLabel: "Nữ · Bắc · Tin tức",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tin tức",
  }),
  Object.freeze({
    id: "haidang",
    label: "Hải Đăng",
    shortLabel: "Nam · Bắc · Tự nhiên",
    gender: "male",
    region: "Bắc",
    style: "Phong cách tự nhiên",
  }),
  Object.freeze({
    id: "thienminh",
    label: "Thiện Minh",
    shortLabel: "Nam · Bắc · Kể chuyện",
    gender: "male",
    region: "Bắc",
    style: "Phong cách kể chuyện",
  }),
]);

function getNorthernVoices() {
  if (
    Array.isArray(speechApi.VIETNAMESE_VOICES) &&
    speechApi.VIETNAMESE_VOICES.length > 0
  ) {
    return speechApi.VIETNAMESE_VOICES;
  }
  return FALLBACK_NORTHERN_VOICES;
}

function formatVoiceSublabel(voice) {
  if (!voice) return "";
  if (voice.shortLabel) {
    return voice.shortLabel.replace(/\s*·\s*Bắc(?=\s*·|\s*$)/u, "").trim();
  }
  const genderLabel = voice.gender === "male" ? "Nam" : "Nữ";
  return voice.style ? `${genderLabel} · ${voice.style}` : genderLabel;
}

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
  const voices = getNorthernVoices();
  const [voiceId, setVoiceId] = useState(
    () => speechApi.getSelectedVoice?.() || voices[0]?.id || "ngochuyen"
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [voiceJustChanged, setVoiceJustChanged] = useState(false);
  const voicePickerRef = useRef(null);
  const voiceTriggerRef = useRef(null);
  const pulseTimerRef = useRef(null);

  useEffect(() => {
    const voiceChangeEvent =
      speechApi.VOICE_CHANGE_EVENT || "vietflow:voice-change";
    const voiceStorageKey = speechApi.VOICE_STORAGE_KEY || "vietflow_tts_voice";

    const syncVoice = (event) => {
      const next = event?.detail?.voice || speechApi.getSelectedVoice?.();
      if (next) setVoiceId(next);
    };
    const handleStorage = (event) => {
      if (!event?.key || event.key === voiceStorageKey) {
        const next = speechApi.getSelectedVoice?.();
        if (next) setVoiceId(next);
      }
    };

    window.addEventListener(voiceChangeEvent, syncVoice);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(voiceChangeEvent, syncVoice);
      window.removeEventListener("storage", handleStorage);
      if (pulseTimerRef.current !== null) {
        clearTimeout(pulseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (
        voicePickerRef.current &&
        !voicePickerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        voiceTriggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const currentVoice =
    voices.find((v) => v.id === voiceId) ||
    speechApi.getVoiceMeta?.(voiceId) ||
    voices[0];

  const handleSelectVoice = (nextId) => {
    speechApi.stopSpeaking?.();
    const updated = speechApi.setSelectedVoice?.(nextId) || nextId;
    setVoiceId(updated);
    setMenuOpen(false);
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

            <div className="vf-voice-picker" ref={voicePickerRef}>
              <button
                ref={voiceTriggerRef}
                type="button"
                className={`vf-nav-auth-btn vf-voice-trigger ${
                  menuOpen ? "is-open" : ""
                } ${voiceJustChanged ? "is-changed" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setMenuOpen((prev) => !prev)}
                title={`Giọng đọc Miền Bắc: ${currentVoice.label} (${formatVoiceSublabel(currentVoice)})`}
                aria-label={`Chọn giọng đọc Miền Bắc, hiện tại ${currentVoice.label}`}
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                data-voice={currentVoice.id}
                data-testid="navbar-voice-trigger"
              >
                <Volume2
                  size={14}
                  aria-hidden="true"
                  className="vf-voice-icon"
                />
                <span className="vf-voice-trigger-label">
                  {currentVoice.label}
                </span>
                <ChevronDown
                  size={13}
                  aria-hidden="true"
                  className={`vf-voice-chevron ${menuOpen ? "is-open" : ""}`}
                />
              </button>

              {menuOpen && (
                <div
                  className="vf-voice-menu"
                  role="listbox"
                  aria-label="Giọng đọc Miền Bắc"
                  data-testid="navbar-voice-menu"
                >
                  <div className="vf-voice-menu-head">
                    Giọng đọc Miền Bắc · VieNeu-TTS
                  </div>
                  <div className="vf-voice-list">
                    {voices.map((voiceOpt) => {
                      const isSelected = voiceOpt.id === currentVoice.id;
                      return (
                        <button
                          key={voiceOpt.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`vf-voice-option ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => handleSelectVoice(voiceOpt.id)}
                          data-voice-option={voiceOpt.id}
                        >
                          <span className="vf-voice-option-copy">
                            <span className="vf-voice-option-name">
                              {voiceOpt.label}
                            </span>
                            <span className="vf-voice-option-sub">
                              {formatVoiceSublabel(voiceOpt)}
                            </span>
                          </span>
                          {isSelected && (
                            <span
                              className="vf-voice-check"
                              aria-hidden="true"
                            >
                              <Check size={15} strokeWidth={2.2} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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
