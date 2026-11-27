import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import {
  STUDENT_EMAIL_DOMAIN,
  isSyntheticStudentEmail,
  mapSupabaseAuthError,
  normalizeStudentName,
  resolveStudentDisplayName,
  studentNameToEmail,
} from "./supabase.js";

describe("Student name normalization and synthetic email derivation", () => {
  it("normalizes Unicode NFC, trims, and collapses internal whitespace", () => {
    const nfd = "Nguy\u00ea\u0303n   Anh\t\tTh\u01b0  ";
    const nfc = "Nguyễn Anh Thư";
    expect(normalizeStudentName(nfd)).toBe(nfc);
    expect(normalizeStudentName("   ")).toBe("");
    expect(normalizeStudentName(null)).toBe("");
    expect(normalizeStudentName(undefined)).toBe("");
  });

  it("maps equivalent Vietnamese names with/without diacritics and spacing to the exact same email", () => {
    const a = studentNameToEmail("Nguyễn Anh Thư");
    const b = studentNameToEmail("nguyen anh thu");
    const c = studentNameToEmail("  NGUYỄN   ANH   THƯ  ");
    const d = studentNameToEmail("Nguy\u00ea\u0303n Anh Th\u01b0");

    expect(a).toBe(`nguyen.anh.thu@${STUDENT_EMAIL_DOMAIN}`);
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(d).toBe(a);
  });

  it("converts Vietnamese đ/Đ accurately", () => {
    expect(studentNameToEmail("Đặng Minh Đức")).toBe(
      `dang.minh.duc@${STUDENT_EMAIL_DOMAIN}`
    );
    expect(studentNameToEmail("đặng minh đức")).toBe(
      `dang.minh.duc@${STUDENT_EMAIL_DOMAIN}`
    );
    expect(studentNameToEmail("ĐỖ THỊ HỒNG ÁNH")).toBe(
      `do.thi.hong.anh@${STUDENT_EMAIL_DOMAIN}`
    );
    expect(studentNameToEmail("Nguyễn Anh Thư 2")).toBe(
      `nguyen.anh.thu.2@${STUDENT_EMAIL_DOMAIN}`
    );
  });

  it("deterministically UTF-8 hex-encodes non-Latin international learner names", () => {
    const kr1 = studentNameToEmail("김민수");
    const kr2 = studentNameToEmail("  김민수  ");
    const jpKanji = studentNameToEmail("田中");
    const jpHira = studentNameToEmail("たなか");
    const zh = studentNameToEmail("王明");

    const hexPattern = new RegExp(`^u\\.[0-9a-f]+@${STUDENT_EMAIL_DOMAIN.replace(/\./g, "\\.")}$`);
    expect(kr1).toMatch(hexPattern);
    expect(kr2).toBe(kr1);
    expect(jpKanji).toMatch(hexPattern);
    expect(jpHira).toMatch(hexPattern);
    expect(zh).toMatch(hexPattern);
    expect(new Set([kr1, jpKanji, jpHira, zh]).size).toBe(4);

    // Non-Latin names with trailing digits must not collide with each other
    expect(studentNameToEmail("김민수 2")).not.toBe(studentNameToEmail("박지성 2"));
  });

  it("keeps email local parts within RFC 5321 64-character limit for very long names", () => {
    const longLatin = studentNameToEmail(
      "Nguyễn Hoàng Phương Thảo Minh Anh Ngọc Khánh Linh Quỳnh Chi Bảo Trâm"
    );
    const longKorean = studentNameToEmail("김민수박지성이영희최철수정수진강호동유재석");

    expect(longLatin.split("@")[0].length).toBeLessThanOrEqual(64);
    expect(longKorean.split("@")[0].length).toBeLessThanOrEqual(64);
  });

  it("preserves explicit email inputs lowercased for backwards compatibility", () => {
    expect(studentNameToEmail("  Student.One@Example.COM  ")).toBe(
      "student.one@example.com"
    );
  });

  it("rejects empty, whitespace, too-short, and symbol-only names", () => {
    expect(() => studentNameToEmail("")).toThrow(/tối thiểu 2 ký tự/i);
    expect(() => studentNameToEmail("   ")).toThrow(/tối thiểu 2 ký tự/i);
    expect(() => studentNameToEmail("A")).toThrow(/tối thiểu 2 ký tự/i);
    expect(() => studentNameToEmail("...")).toThrow(/chữ cái hoặc chữ số/i);
  });

  it("detects synthetic student emails and resolves clean display names without leaking emails", () => {
    expect(isSyntheticStudentEmail("nguyen.anh.thu@students.vietflow.app")).toBe(true);
    expect(isSyntheticStudentEmail("U.EAB980@STUDENTS.VIETFLOW.APP")).toBe(true);
    expect(isSyntheticStudentEmail("real@example.com")).toBe(false);
    expect(isSyntheticStudentEmail("")).toBe(false);

    const syntheticUser = {
      id: "u-1",
      email: "nguyen.anh.thu@students.vietflow.app",
      user_metadata: { display_name: "Nguyễn Anh Thư" },
    };
    expect(resolveStudentDisplayName({ displayName: "Nguyễn Anh Thư" }, syntheticUser)).toBe(
      "Nguyễn Anh Thư"
    );
    expect(resolveStudentDisplayName(null, syntheticUser)).toBe("Nguyễn Anh Thư");
    expect(
      resolveStudentDisplayName(null, {
        id: "u-2",
        email: "nguyen.anh.thu@students.vietflow.app",
        user_metadata: {},
      })
    ).toBe("Học sinh");
  });

  it("maps Supabase auth errors to friendly Vietnamese messages without exposing synthetic domains", () => {
    expect(
      mapSupabaseAuthError({ message: "Invalid login credentials" }, "signin")
    ).toBe("Sai tên học sinh hoặc mật khẩu. Vui lòng kiểm tra lại.");

    expect(
      mapSupabaseAuthError({ message: "User already registered" }, "signup")
    ).toBe(
      "Tên học sinh này đã có tài khoản. Bạn hãy chuyển sang tab Đăng nhập hoặc thêm biệt danh (ví dụ: Nguyễn Anh Thư 2)."
    );

    expect(
      mapSupabaseAuthError({ message: "Email not confirmed" }, "signin")
    ).toBe(
      "Tài khoản chưa được kích hoạt xác thực. Vui lòng tắt 'Confirm email' trong Supabase Auth."
    );

    expect(
      mapSupabaseAuthError(
        { message: "Password should be at least 6 characters." },
        "signup"
      )
    ).toBe("Mật khẩu cần tối thiểu 6 ký tự.");

    const sanitized = mapSupabaseAuthError(
      { message: "Error for nguyen.anh.thu@students.vietflow.app" },
      "signin"
    );
    expect(sanitized).not.toContain("students.vietflow.app");
    expect(sanitized).not.toContain("@");
  });
});

describe("signIn & signUp with mocked Supabase client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock("@supabase/supabase-js");
  });

  it("derives synthetic email, stores display_name metadata, maps errors, and validates before network calls", async () => {
    const signInWithPassword = vi.fn();
    const signUpMock = vi.fn();
    const getSessionMock = vi.fn();
    const upsertSingleMock = vi.fn();
    const maybeSingleMock = vi.fn();

    const mockClient = {
      auth: {
        signInWithPassword,
        signUp: signUpMock,
        getSession: getSessionMock,
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: maybeSingleMock,
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: upsertSingleMock,
          })),
        })),
      })),
    };

    vi.stubEnv("VITE_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-test-key");
    vi.resetModules();
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => mockClient),
    }));

    const supa = await import("./supabase.js");
    expect(supa.isSupabaseConfigured).toBe(true);

    // Rejects too-short name BEFORE calling Supabase
    await expect(supa.signIn({ studentName: "A", password: "password123" })).rejects.toThrow(
      /tối thiểu 2 ký tự/i
    );
    expect(signInWithPassword).not.toHaveBeenCalled();

    // Sign up with Vietnamese name
    const createdUser = {
      id: "user-thu",
      email: "nguyen.anh.thu@students.vietflow.app",
      user_metadata: { display_name: "Nguyễn Anh Thư" },
      identities: [{ id: "id-1" }],
    };
    signUpMock.mockResolvedValueOnce({
      data: { user: createdUser, session: { user: createdUser } },
      error: null,
    });
    getSessionMock.mockResolvedValue({
      data: { session: { user: createdUser } },
      error: null,
    });
    upsertSingleMock.mockResolvedValueOnce({
      data: {
        user_id: "user-thu",
        display_name: "Nguyễn Anh Thư",
        cefr_level: "A2-B1",
      },
      error: null,
    });

    const signUpRes = await supa.signUp({
      studentName: "  Nguyễn   Anh   Thư ",
      password: "password123",
    });

    expect(signUpMock).toHaveBeenCalledWith({
      email: "nguyen.anh.thu@students.vietflow.app",
      password: "password123",
      options: {
        data: {
          display_name: "Nguyễn Anh Thư",
        },
      },
    });
    expect(signUpRes.profile?.displayName).toBe("Nguyễn Anh Thư");
    expect(signUpRes.profile?.email).toBe("");

    // Sign in without diacritics matches the exact same synthetic email
    signInWithPassword.mockResolvedValueOnce({
      data: { user: createdUser, session: { user: createdUser } },
      error: null,
    });
    maybeSingleMock.mockResolvedValueOnce({
      data: {
        user_id: "user-thu",
        display_name: "Nguyễn Anh Thư",
        cefr_level: "A2-B1",
      },
      error: null,
    });

    const signInRes = await supa.signIn({
      studentName: "nguyen anh thu",
      password: "password123",
    });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "nguyen.anh.thu@students.vietflow.app",
      password: "password123",
    });
    expect(signInRes.profile?.displayName).toBe("Nguyễn Anh Thư");

    // Friendly Vietnamese error on invalid login
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });
    await expect(
      supa.signIn({ studentName: "Nguyễn Anh Thư", password: "wrongpassword" })
    ).rejects.toThrow("Sai tên học sinh hoặc mật khẩu. Vui lòng kiểm tra lại.");
  });
});

describe("AuthModal, Navbar, and Dashboard student-name UI", () => {
  let signInMock;
  let signUpMock;
  let signOutMock;
  let AuthModal;
  let Navbar;
  let Dashboard;

  beforeEach(async () => {
    signInMock = vi.fn();
    signUpMock = vi.fn();
    signOutMock = vi.fn().mockResolvedValue(undefined);

    vi.resetModules();
    vi.doMock("./supabase.js", async () => {
      const actual = await vi.importActual("./supabase.js");
      return {
        ...actual,
        isSupabaseConfigured: true,
        signIn: signInMock,
        signUp: signUpMock,
        signOut: signOutMock,
      };
    });

    ({ AuthModal } = await import("../components/layout/AuthModal.jsx"));
    ({ Navbar } = await import("../components/layout/Navbar.jsx"));
    ({ Dashboard } = await import("../components/layout/Dashboard.jsx"));
  });

  afterEach(() => {
    cleanup();
    vi.resetModules();
    vi.doUnmock("./supabase.js");
  });

  it("renders only Tên học sinh + Mật khẩu inputs (zero Email field) on both Sign In and Sign Up tabs", async () => {
    const onAuthSuccess = vi.fn();
    const onNotify = vi.fn();
    const onClose = vi.fn();

    signUpMock.mockResolvedValueOnce({
      user: {
        id: "user-thu",
        email: "nguyen.anh.thu@students.vietflow.app",
        user_metadata: { display_name: "Nguyễn Anh Thư" },
      },
      profile: {
        id: "user-thu",
        email: "",
        displayName: "Nguyễn Anh Thư",
        cefrLevel: "A2-B1",
      },
      needsEmailConfirmation: false,
    });

    const { container } = render(
      React.createElement(AuthModal, {
        isOpen: true,
        onClose,
        user: null,
        userProfile: null,
        onAuthSuccess,
        onNotify,
      })
    );

    // Sign In tab: exactly 2 inputs (Tên học sinh + Mật khẩu), zero email inputs
    const signinInputs = container.querySelectorAll("form input");
    expect(signinInputs).toHaveLength(2);
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/tên hiển thị/i)).not.toBeInTheDocument();

    const nameInput = screen.getByLabelText("Tên học sinh");
    const passwordInput = screen.getByLabelText("Mật khẩu");
    expect(nameInput).toHaveAttribute("type", "text");
    expect(nameInput).toHaveAttribute("placeholder", "Ví dụ: Nguyễn Anh Thư");
    expect(nameInput).toHaveAttribute("autocomplete", "username");
    expect(nameInput).toBeRequired();

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("placeholder", "Tối thiểu 6 ký tự");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    expect(passwordInput).toHaveAttribute("minlength", "6");
    expect(passwordInput).toBeRequired();

    // Switch to Tạo tài khoản tab: still ONLY 2 inputs, zero Email or Tên hiển thị
    fireEvent.click(screen.getByRole("tab", { name: "Tạo tài khoản" }));
    expect(container.querySelectorAll("form input")).toHaveLength(2);
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/tên hiển thị/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute(
      "autocomplete",
      "new-password"
    );

    // Submit student name + password
    fireEvent.change(nameInput, { target: { value: "Nguyễn Anh Thư" } });
    fireEvent.change(passwordInput, { target: { value: "matkhau123" } });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        studentName: "Nguyễn Anh Thư",
        password: "matkhau123",
        displayName: "Nguyễn Anh Thư",
      });
    });
    expect(onAuthSuccess).toHaveBeenCalled();
    expect(onNotify).toHaveBeenCalledWith(
      expect.stringContaining("Nguyễn Anh Thư"),
      "success"
    );
    expect(onNotify.mock.calls[0][0]).not.toContain("students.vietflow.app");
  });

  it("displays only the student name and quiet subtitle when signed in, never exposing synthetic email", () => {
    const signedInUser = {
      id: "user-thu",
      email: "nguyen.anh.thu@students.vietflow.app",
      user_metadata: { display_name: "Nguyễn Anh Thư" },
    };
    const signedInProfile = {
      id: "user-thu",
      email: "",
      displayName: "Nguyễn Anh Thư",
      cefrLevel: "A2-B1",
    };

    const { container } = render(
      React.createElement(AuthModal, {
        isOpen: true,
        onClose: vi.fn(),
        user: signedInUser,
        userProfile: signedInProfile,
      })
    );

    expect(screen.getByText("Nguyễn Anh Thư")).toBeInTheDocument();
    expect(
      screen.getByText("Tài khoản học sinh · Đang đồng bộ Supabase")
    ).toBeInTheDocument();
    expect(container.textContent).not.toContain("@students.vietflow.app");
    expect(container.textContent).not.toContain("nguyen.anh.thu");
  });

  it("never leaks synthetic email in Navbar or Dashboard even when profile/metadata are empty", () => {
    const userWithoutMeta = {
      id: "user-anon",
      email: "nguyen.anh.thu@students.vietflow.app",
      user_metadata: {},
    };
    const userWithName = {
      id: "user-thu",
      email: "nguyen.anh.thu@students.vietflow.app",
      user_metadata: { display_name: "Nguyễn Anh Thư" },
    };

    const { container: navContainer1, unmount: unmountNav1 } = render(
      React.createElement(Navbar, {
        activeView: "dashboard",
        onNavigate: vi.fn(),
        skillProgress: { xp: 120, streakDays: 3 },
        user: userWithName,
        userProfile: { displayName: "Nguyễn Anh Thư" },
        storageMode: "supabase",
        isSupabaseConfigured: true,
        onOpenAuth: vi.fn(),
      })
    );
    expect(screen.getByText("Nguyễn Anh Thư")).toBeInTheDocument();
    expect(navContainer1.textContent).not.toContain("@students.vietflow.app");
    unmountNav1();

    const { container: navContainer2, unmount: unmountNav2 } = render(
      React.createElement(Navbar, {
        activeView: "dashboard",
        onNavigate: vi.fn(),
        skillProgress: { xp: 0, streakDays: 0 },
        user: userWithoutMeta,
        userProfile: null,
        storageMode: "supabase",
        isSupabaseConfigured: true,
        onOpenAuth: vi.fn(),
      })
    );
    expect(screen.getByText("Học sinh")).toBeInTheDocument();
    expect(navContainer2.textContent).not.toContain("nguyen.anh.thu");
    expect(navContainer2.textContent).not.toContain("@students.vietflow.app");
    unmountNav2();

    const { container: dashContainer } = render(
      React.createElement(Dashboard, {
        topics: [],
        decks: [],
        skillProgress: {},
        gameHistory: [],
        user: userWithoutMeta,
        userProfile: null,
        onLaunchGame: vi.fn(),
        onOpenFlashcards: vi.fn(),
        onCreateFlashcard: vi.fn(),
        onOpenTopicOverview: vi.fn(),
      })
    );
    expect(dashContainer.textContent).toContain("Chào bạn, hôm nay luyện gì?");
    expect(dashContainer.textContent).not.toContain("nguyen.anh.thu");
    expect(dashContainer.textContent).not.toContain("@students.vietflow.app");
  });
});
