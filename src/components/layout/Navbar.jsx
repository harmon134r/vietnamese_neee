import React from "react";
import {
  Cloud,
  Compass,
  Flame,
  Gamepad2,
  HardDrive,
  Layers,
  LayoutDashboard,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Tổng quan", shortLabel: "Tổng quan", icon: LayoutDashboard },
  { id: "games", label: "Trò chơi 4 kỹ năng", shortLabel: "Trò chơi", icon: Gamepad2 },
  { id: "flashcards", label: "Flashcard Studio", shortLabel: "Flashcard", icon: Layers },
  { id: "topics", label: "6 Chủ đề", shortLabel: "6 Chủ đề", icon: Compass },
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
  const xp = Math.round(Number(skillProgress?.xp || 0));
  const streakDays = Math.round(Number(skillProgress?.streakDays || 0));
  const isCloud = storageMode === "supabase" && Boolean(user);

  const userDisplayName =
    userProfile?.displayName ||
    user?.user_metadata?.display_name ||
    (user?.email ? user.email.split("@")[0] : "");

  const syncButtonLabel = isCloud
    ? `${userDisplayName || "Cloud"} · Supabase`
    : isSupabaseConfigured
      ? "Chế độ Local · Đăng nhập"
      : "Chế độ Local";

  return (
    <>
      <header className="vf-navbar">
        <div className="vf-navbar-inner">
          <button
            type="button"
            className="vf-brand"
            onClick={() => onNavigate("dashboard")}
            aria-label="ViệtFlow — Về trang tổng quan"
          >
            <span className="vf-brand-mark" aria-hidden="true">
              V
            </span>
            <span className="vf-brand-text">
              <span className="vf-brand-name">ViệtFlow</span>
              <span className="vf-brand-badge">Pre-Intermediate A2–B1</span>
            </span>
          </button>

          <nav className="vf-nav-tabs" aria-label="Điều hướng chính">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`vf-nav-tab ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="vf-nav-right">
            <span className="vf-stat-pill vf-stat-pill--xp" title="Điểm kinh nghiệm tích lũy">
              <Zap size={14} aria-hidden="true" />
              <span>{xp.toLocaleString("vi-VN")} XP</span>
            </span>

            <span className="vf-stat-pill vf-stat-pill--streak" title="Chuỗi ngày luyện tập liên tiếp">
              <Flame size={14} aria-hidden="true" />
              <span>{streakDays} ngày</span>
            </span>

            <button
              type="button"
              className={`vf-sync-btn ${isCloud ? "is-cloud" : ""}`}
              onClick={onOpenAuth}
              title={
                isCloud
                  ? "Đang đồng bộ dữ liệu với Supabase"
                  : "Xem trạng thái lưu trữ Local / Đồng bộ Supabase"
              }
            >
              <span className={`vf-status-dot ${isCloud ? "is-cloud" : ""}`} aria-hidden="true" />
              {isCloud ? (
                <Cloud size={15} aria-hidden="true" />
              ) : (
                <HardDrive size={15} aria-hidden="true" />
              )}
              <span className="vf-sync-label">{syncButtonLabel}</span>
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
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default Navbar;
