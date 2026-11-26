import React from "react";
import { BookOpen, Compass, Gamepad2, Layers } from "lucide-react";

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
  const xp = Math.round(Number(skillProgress?.xp || 0));
  const streakDays = Math.round(Number(skillProgress?.streakDays || 0));
  const isCloud = storageMode === "supabase" && Boolean(user);

  const userDisplayName =
    userProfile?.displayName ||
    user?.user_metadata?.display_name ||
    (user?.email ? user.email.split("@")[0] : "");

  const authButtonLabel = isCloud
    ? userDisplayName || "Tài khoản"
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
