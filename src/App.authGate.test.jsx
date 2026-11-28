import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { createEmptySkillProgress } from "./lib/contracts.js";

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const STUDENT_USER = {
  id: "user-student-thu",
  email: "nguyen.anh.thu@students.vietflow.app",
  user_metadata: { display_name: "Nguyễn Anh Thư", role: "student" },
};

const STUDENT_PROFILE = {
  id: "user-student-thu",
  email: "",
  displayName: "Nguyễn Anh Thư",
  role: "student",
  cefrLevel: "A2-B1",
};

const SAMPLE_DECKS = [
  {
    id: "deck-1",
    title: "Chào hỏi cơ bản",
    topicId: "self",
    cards: [
      {
        id: "card-1",
        deckId: "deck-1",
        frontVi: "Xin chào",
        definition: "Hello",
        masteryLevel: 2,
        reviewCount: 1,
      },
    ],
    cardCount: 1,
  },
];

describe("Mandatory Auth Gate (App + AuthModal)", () => {
  let authListeners;
  let getSessionMock;
  let getUserProfileMock;
  let signInMock;
  let signUpMock;
  let signOutMock;
  let loadDecksMock;
  let loadSkillProgressMock;
  let loadGameHistoryMock;
  let getStorageModeMock;
  let stopSpeakingMock;

  async function mountApp({ isSupabaseConfigured = true } = {}) {
    authListeners = [];
    getSessionMock = vi.fn().mockResolvedValue({
      session: null,
      user: null,
      error: null,
    });
    getUserProfileMock = vi.fn().mockResolvedValue(null);
    signInMock = vi.fn();
    signUpMock = vi.fn();
    signOutMock = vi.fn().mockResolvedValue(undefined);
    loadDecksMock = vi.fn().mockResolvedValue(SAMPLE_DECKS);
    loadSkillProgressMock = vi
      .fn()
      .mockResolvedValue({ ...createEmptySkillProgress(), xp: 120, streakDays: 3 });
    loadGameHistoryMock = vi.fn().mockResolvedValue([]);
    getStorageModeMock = vi.fn().mockResolvedValue(
      isSupabaseConfigured ? "supabase" : "local"
    );
    stopSpeakingMock = vi.fn();

    vi.resetModules();

    vi.doMock("./lib/supabase", async () => {
      const actual = await vi.importActual("./lib/supabase.js");
      return {
        ...actual,
        isSupabaseConfigured,
        getSession: getSessionMock,
        getUserProfile: getUserProfileMock,
        signIn: signInMock,
        signUp: signUpMock,
        signOut: signOutMock,
        onAuthStateChange: vi.fn((cb) => {
          authListeners.push(cb);
          return () => {
            authListeners = authListeners.filter((fn) => fn !== cb);
          };
        }),
      };
    });

    vi.doMock("./lib/storage", async () => {
      const actual = await vi.importActual("./lib/storage.js");
      return {
        ...actual,
        loadDecks: loadDecksMock,
        loadSkillProgress: loadSkillProgressMock,
        loadGameHistory: loadGameHistoryMock,
        getStorageMode: getStorageModeMock,
      };
    });

    vi.doMock("./lib/speech", async () => {
      const actual = await vi.importActual("./lib/speech.js");
      return {
        ...actual,
        stopSpeaking: stopSpeakingMock,
      };
    });

    const { App } = await import("./App.jsx");
    const { AuthModal } = await import("./components/layout/AuthModal.jsx");
    return { App, AuthModal };
  }

  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock("./lib/supabase");
    vi.doUnmock("./lib/storage");
    vi.doUnmock("./lib/speech");
  });

  it("shows loading screen while checking session, then locks the study area behind auth-gate without calling hydrateData", async () => {
    const { App } = await mountApp({ isSupabaseConfigured: true });
    const sessionDeferred = createDeferred();
    getSessionMock.mockReturnValueOnce(sessionDeferred.promise);

    const { container } = render(React.createElement(App));

    // During initial getSession() check: neither auth-gate nor Navbar/Dashboard flashes
    expect(screen.getByText("Đang kiểm tra tài khoản...")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-gate")).not.toBeInTheDocument();
    expect(container.querySelector(".vf-navbar")).toBeNull();
    expect(screen.queryByRole("button", { name: "Tổng quan" })).not.toBeInTheDocument();

    // Resolve with no session -> Auth Gate unlocks and hides entire study area
    await act(async () => {
      sessionDeferred.resolve({ session: null, user: null, error: null });
    });

    const gate = await screen.findByTestId("auth-gate");
    expect(gate).toBeInTheDocument();
    expect(screen.getByText("munnn01")).toBeInTheDocument();
    expect(screen.getByText("A2–B1")).toBeInTheDocument();
    expect(screen.getByText("@thembanhkhoai")).toBeInTheDocument();

    // Inline AuthModal region without fixed backdrop overlay
    expect(
      screen.getByRole("region", { name: "Đăng nhập hoặc đăng ký tài khoản" })
    ).toBeInTheDocument();
    expect(container.querySelector(".vf-modal-backdrop")).toBeNull();
    expect(container.querySelector(".vf-modal--inline")).not.toBeNull();

    // NONE of Navbar or study views are in the DOM
    expect(container.querySelector(".vf-navbar")).toBeNull();
    expect(screen.queryByRole("button", { name: "Tổng quan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trò chơi" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Flashcard" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chủ đề" })).not.toBeInTheDocument();
    expect(screen.queryByText(/hôm nay luyện gì/i)).not.toBeInTheDocument();

    // Startup did NOT hydrate study data while signed out
    expect(loadDecksMock).not.toHaveBeenCalled();
    expect(loadSkillProgressMock).not.toHaveBeenCalled();
    expect(loadGameHistoryMock).not.toHaveBeenCalled();
  });

  it("enforces mandatory mode: no close X button, Escape does not dismiss, and displays mandatory footer copy", async () => {
    const { App } = await mountApp({ isSupabaseConfigured: true });
    render(React.createElement(App));

    await screen.findByTestId("auth-gate");

    // No close button in mandatory mode
    expect(
      screen.queryByRole("button", { name: "Đóng hộp thoại" })
    ).not.toBeInTheDocument();

    // Pressing Escape keeps auth-gate locked
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByTestId("auth-gate")).toBeInTheDocument();

    // Mandatory student copy replaces old guest-mode copy
    expect(
      screen.queryByText(/Bạn vẫn có thể học không cần đăng nhập/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /Học sinh tạo tài khoản miễn phí chỉ với tên và mật khẩu/i
      )
    ).toBeInTheDocument();
  });

  it("supports role switching (Học sinh / Giáo viên) and mode switching (Đăng nhập / Tạo tài khoản) on the Auth Gate", async () => {
    const { App } = await mountApp({ isSupabaseConfigured: true });
    render(React.createElement(App));

    await screen.findByTestId("auth-gate");

    // Default: Học sinh + Đăng nhập
    expect(screen.getByLabelText("Tên học sinh")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mã giáo viên")).not.toBeInTheDocument();

    // Switch to Giáo viên -> mandatory teacher copy + teacher name/email label
    fireEvent.click(screen.getByRole("tab", { name: "Giáo viên" }));
    expect(screen.getByLabelText("Tên giáo viên hoặc Email")).toBeInTheDocument();
    expect(
      screen.getByText(/Giáo viên tạo tài khoản bằng mã lớp để tải PDF/i)
    ).toBeInTheDocument();

    // Switch to Tạo tài khoản -> reveals Mã giáo viên field
    fireEvent.click(screen.getByRole("tab", { name: "Tạo tài khoản" }));
    expect(screen.getByLabelText("Tên giáo viên")).toBeInTheDocument();
    expect(screen.getByLabelText("Mã giáo viên")).toBeInTheDocument();

    // Switch back to Học sinh -> hides Mã giáo viên and restores student copy
    fireEvent.click(screen.getByRole("tab", { name: "Học sinh" }));
    expect(screen.getByLabelText("Tên học sinh")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mã giáo viên")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /Học sinh tạo tài khoản miễn phí chỉ với tên và mật khẩu/i
      )
    ).toBeInTheDocument();
  });

  it("hydrates exactly once on sign-in without double hydration or empty flash, then returns immediately to auth-gate on sign-out", async () => {
    const { App } = await mountApp({ isSupabaseConfigured: true });

    const decksDeferred = createDeferred();
    loadDecksMock.mockReturnValueOnce(decksDeferred.promise);
    getUserProfileMock.mockResolvedValue(STUDENT_PROFILE);

    signInMock.mockImplementationOnce(async () => {
      // Simulate Supabase emitting SIGNED_IN right as signIn succeeds
      for (const listener of authListeners) {
        listener("SIGNED_IN", { user: STUDENT_USER });
      }
      return {
        session: { user: STUDENT_USER },
        user: STUDENT_USER,
        profile: STUDENT_PROFILE,
      };
    });

    const { container } = render(React.createElement(App));
    await screen.findByTestId("auth-gate");

    // Fill student sign-in form and submit
    fireEvent.change(screen.getByLabelText("Tên học sinh"), {
      target: { value: "Nguyễn Anh Thư" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "matkhau123" },
    });
    fireEvent.submit(container.querySelector("form"));

    // Shows brief loading screen while hydrating (no empty dashboard flash, auth-gate gone)
    await screen.findByText("Đang chuẩn bị bàn học...");
    expect(screen.queryByTestId("auth-gate")).not.toBeInTheDocument();

    // Finish hydration -> study area unlocked!
    await act(async () => {
      decksDeferred.resolve(SAMPLE_DECKS);
    });

    await waitFor(() => {
      expect(screen.getByText(/Nguyễn Anh Thư, hôm nay luyện gì/i)).toBeInTheDocument();
    });
    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    expect(within(mainNav).getByRole("button", { name: "Tổng quan" })).toBeInTheDocument();
    expect(within(mainNav).getByRole("button", { name: "Trò chơi" })).toBeInTheDocument();
    expect(within(mainNav).getByRole("button", { name: "Flashcard" })).toBeInTheDocument();
    expect(within(mainNav).getByRole("button", { name: "Chủ đề" })).toBeInTheDocument();

    // Hydrated EXACTLY once (even though both SIGNED_IN event and handleAuthSuccess ran)
    expect(loadDecksMock).toHaveBeenCalledTimes(1);
    expect(loadSkillProgressMock).toHaveBeenCalledTimes(1);
    expect(loadGameHistoryMock).toHaveBeenCalledTimes(1);

    // Open account modal from Navbar and click Đăng xuất
    stopSpeakingMock.mockClear();
    signOutMock.mockImplementationOnce(async () => {
      for (const listener of authListeners) {
        listener("SIGNED_OUT", null);
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Nguyễn Anh Thư" }));
    const signOutBtn = await screen.findByRole("button", { name: /Đăng xuất/i });
    fireEvent.click(signOutBtn);

    // Immediately returns to Auth Gate, clears study area, calls stopSpeaking, shows toast
    await screen.findByTestId("auth-gate");
    expect(screen.queryByRole("navigation", { name: "Điều hướng chính" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tổng quan" })).not.toBeInTheDocument();
    expect(screen.queryByText(/hôm nay luyện gì/i)).not.toBeInTheDocument();
    expect(screen.getByText("Đã đăng xuất thành công.")).toBeInTheDocument();
    expect(stopSpeakingMock).toHaveBeenCalled();

    // Sign-out did NOT trigger another hydrateData call
    expect(loadDecksMock).toHaveBeenCalledTimes(1);
  });

  it("skips Auth Gate without login flash when an active session already exists on reload", async () => {
    const { App } = await mountApp({ isSupabaseConfigured: true });
    getSessionMock.mockResolvedValueOnce({
      session: { user: STUDENT_USER },
      user: STUDENT_USER,
      error: null,
    });
    getUserProfileMock.mockResolvedValueOnce(STUDENT_PROFILE);

    render(React.createElement(App));

    await waitFor(() => {
      expect(screen.getByText(/Nguyễn Anh Thư, hôm nay luyện gì/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId("auth-gate")).not.toBeInTheDocument();
    expect(loadDecksMock).toHaveBeenCalledTimes(1);
  });

  it("keeps local offline fallback usable when Supabase is not configured", async () => {
    const { App } = await mountApp({ isSupabaseConfigured: false });
    render(React.createElement(App));

    await waitFor(() => {
      const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
      expect(within(mainNav).getByRole("button", { name: "Tổng quan" })).toBeInTheDocument();
    });
    expect(screen.queryByTestId("auth-gate")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lưu cục bộ" })).toBeInTheDocument();
    expect(loadDecksMock).toHaveBeenCalledTimes(1);
  });

  it("blocks backdrop-click and Escape dismissal when AuthModal is rendered with mandatory=true in modal mode", async () => {
    const { AuthModal } = await mountApp({ isSupabaseConfigured: true });
    const onClose = vi.fn();

    const { container } = render(
      React.createElement(AuthModal, {
        isOpen: true,
        mandatory: true,
        onClose,
        user: null,
        userProfile: null,
      })
    );

    expect(
      screen.queryByRole("button", { name: "Đóng hộp thoại" })
    ).not.toBeInTheDocument();

    const backdrop = container.querySelector(".vf-modal-backdrop");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
