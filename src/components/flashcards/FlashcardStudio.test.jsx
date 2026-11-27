import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("../../lib/speech.js", () => {
  const RANDOM_VOICE = {
    id: "random",
    label: "Ngẫu nhiên",
    shortLabel: "Xoay vòng 5 giọng Bắc",
    gender: "mixed",
    region: "Bắc",
    style: "Tự động chọn trong 5 giọng Miền Bắc",
  };
  const NORTHERN_VOICES = [
    { id: "ngochuyen", label: "Ngọc Huyền", shortLabel: "Nữ · Bắc · Tự nhiên", gender: "female", region: "Bắc", style: "Giọng đọc tự nhiên" },
    { id: "trucly", label: "Trúc Ly", shortLabel: "Nữ · Bắc · Tự nhiên", gender: "female", region: "Bắc", style: "Phong cách tự nhiên" },
    { id: "maianh", label: "Mai Anh", shortLabel: "Nữ · Bắc · Tin tức rõ chữ", gender: "female", region: "Bắc", style: "Phong cách tin tức rõ chữ" },
    { id: "haidang", label: "Hải Đăng", shortLabel: "Nam · Bắc · Tự nhiên", gender: "male", region: "Bắc", style: "Phong cách tự nhiên" },
    { id: "thienminh", label: "Thiện Minh", shortLabel: "Nam · Bắc · Kể chuyện", gender: "male", region: "Bắc", style: "Phong cách kể chuyện" },
  ];
  const ALL_VOICE_OPTIONS = [RANDOM_VOICE, ...NORTHERN_VOICES];
  return {
    RANDOM_VOICE_ID: "random",
    DEFAULT_VOICE_ID: "random",
    RANDOM_VOICE_OPTION: RANDOM_VOICE,
    VIETNAMESE_VOICES: NORTHERN_VOICES,
    VOICE_OPTIONS: ALL_VOICE_OPTIONS,
    VOICE_STORAGE_KEY: "vietflow_tts_voice",
    VOICE_CHANGE_EVENT: "vietflow:voice-change",
    getSelectedVoice: vi.fn(() => "random"),
    setSelectedVoice: vi.fn((id) => id),
    getVoiceMeta: vi.fn((id) => ALL_VOICE_OPTIONS.find((v) => v.id === id) || RANDOM_VOICE),
    prefetchVietnamese: vi.fn(),
    speakVietnamese: vi.fn(() => Promise.resolve({ source: "api" })),
    stopSpeaking: vi.fn(),
    isSpeechRecognitionSupported: vi.fn(() => true),
    startVietnameseListening: vi.fn(),
  };
});

vi.mock("../../lib/pdfImport.js", async () => {
  const actual = await vi.importActual("../../lib/pdfImport.js");
  return {
    ...actual,
    extractTextFromStudyFile: vi.fn(),
  };
});

vi.mock("../../lib/pronunciation.js", () => ({
  scoreVietnamesePronunciation: vi.fn((expected, spoken) => ({
    score: expected === spoken ? 96 : 68,
    rating: expected === spoken ? "excellent" : "fair",
    toneAccuracy: expected === spoken ? 100 : 60,
    wordAccuracy: 90,
    feedbackVi: expected === spoken ? "Phát âm rất tự nhiên và đúng thanh điệu!" : "Chú ý dấu thanh ở âm tiết thứ hai.",
    wordDiffs: [
      {
        expected,
        spoken,
        status: expected === spoken ? "exact" : "tone-mismatch",
        expectedTone: "huyen",
        spokenTone: "sac",
      },
    ],
  })),
}));

import { FlashcardStudio } from "./FlashcardStudio.jsx";
import {
  isSpeechRecognitionSupported,
  prefetchVietnamese,
  setSelectedVoice,
  speakVietnamese,
  startVietnameseListening,
} from "../../lib/speech.js";
import { SCANNED_PDF_ERROR_VI, extractTextFromStudyFile } from "../../lib/pdfImport.js";
import { MASTERY_LEVELS } from "../../lib/contracts.js";

const MOCK_DECKS = [
  {
    id: "deck-food",
    title: "Ẩm thực Việt Nam",
    description: "Từ vựng ăn uống trình độ A2-B1",
    topicId: "food",
    color: "#f59e0b",
    isDefault: true,
    cards: [
      {
        id: "card-1",
        deckId: "deck-food",
        frontVi: "hài lòng",
        pos: "tính từ",
        ipa: "/haːj˨˩ lɔŋ˨˩/",
        definition: "cảm thấy vừa ý, thỏa mãn với điều gì đó",
        exampleVi: "Tôi rất hài lòng với món phở ở quán này.",
        exampleEn: "I am very satisfied with the pho at this restaurant.",
        notes: "Thường đi kèm với giới từ 'với'.",
        topicId: "food",
        masteryLevel: 0,
        position: 0,
      },
      {
        id: "card-2",
        deckId: "deck-food",
        frontVi: "đậm đà",
        pos: "tính từ",
        ipa: "",
        definition: "có hương vị rõ nét, hòa quyện và hấp dẫn",
        exampleVi: "Nước dùng bún bò Huế rất đậm đà.",
        exampleEn: "",
        notes: "",
        topicId: "food",
        masteryLevel: MASTERY_LEVELS.REVIEW,
        position: 1,
      },
    ],
  },
];

describe("FlashcardStudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSpeechRecognitionSupported.mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the flashcard front with Vietnamese word, POS only (no IPA), tooltip, controls, and shortcut legend", () => {
    render(<FlashcardStudio decks={MOCK_DECKS} activeDeckId="deck-food" />);

    expect(screen.getByRole("heading", { level: 3, name: "hài lòng" })).toBeInTheDocument();
    const subline = screen.getByTestId("fc-front-subline");
    expect(subline).toHaveTextContent("tính từ");
    expect(subline.textContent).not.toContain("-");
    expect(subline.textContent).not.toContain("/haːj˨˩ lɔŋ˨˩/");
    expect(screen.queryByText(/\/haːj˨˩ lɔŋ˨˩\//)).not.toBeInTheDocument();
    expect(screen.queryByText(/Phiên âm/i)).not.toBeInTheDocument();

    expect(screen.getAllByRole("tooltip")[0]).toHaveTextContent(
      "Tự động phát âm khi chuyển thẻ"
    );
    expect(screen.getByLabelText("Hướng dẫn phím tắt")).toHaveTextContent(
      "Phím tắt:"
    );
    expect(screen.getByTestId("fc-card-counter")).toHaveTextContent("Thẻ 1 / 2");
  });

  it("flips on click and keyboard Space/Enter, navigates with arrows, and auto-speaks when toggle is ON", async () => {
    render(<FlashcardStudio decks={MOCK_DECKS} activeDeckId="deck-food" />);

    const card = screen.getByTestId("fc-flashcard");
    expect(card).not.toHaveClass("is-flipped");

    // Flip via Space key
    fireEvent.keyDown(window, { code: "Space", key: " " });
    expect(card).toHaveClass("is-flipped");

    // Back displays definition & example
    expect(screen.getByText("cảm thấy vừa ý, thỏa mãn với điều gì đó")).toBeInTheDocument();

    // Example audio button speaks the example sentence without flipping back
    const exampleSpeakerBtn = screen.getByRole("button", {
      name: "Nghe câu ví dụ tiếng Việt",
    });
    fireEvent.click(exampleSpeakerBtn);
    await waitFor(() => {
      expect(speakVietnamese).toHaveBeenCalledWith(
        "Tôi rất hài lòng với món phở ở quán này.",
        expect.objectContaining({ rate: 1 })
      );
    });
    expect(card).toHaveClass("is-flipped");

    // Navigate to next card with ArrowRight — resets flip, omits '-' when IPA is empty, and auto-speaks!
    speakVietnamese.mockClear();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("fc-card-counter")).toHaveTextContent("Thẻ 2 / 2");
    expect(card).not.toHaveClass("is-flipped");
    expect(screen.getByTestId("fc-front-subline")).toHaveTextContent("tính từ");
    expect(screen.getByTestId("fc-front-subline").textContent).not.toContain("-");
    await waitFor(() => {
      expect(speakVietnamese).toHaveBeenCalledWith(
        "đậm đà",
        expect.objectContaining({ rate: 1 })
      );
    });

    // Turn off auto-speak toggle and navigate back — should NOT auto-speak
    speakVietnamese.mockClear();
    const toggleBtn = screen.getAllByRole("switch", {
      name: "Tự động phát âm khi chuyển thẻ",
    })[0];
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-checked", "false");

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByTestId("fc-card-counter")).toHaveTextContent("Thẻ 1 / 2");
    expect(speakVietnamese).not.toHaveBeenCalled();
  });

  it("does not trigger card flip or navigation when typing in the search input", () => {
    render(<FlashcardStudio decks={MOCK_DECKS} activeDeckId="deck-food" />);

    const card = screen.getByTestId("fc-flashcard");
    const searchInput = screen.getByLabelText("Tìm kiếm flashcard");
    searchInput.focus();

    fireEvent.keyDown(searchInput, { code: "Space", key: " " });
    fireEvent.keyDown(searchInput, { key: "ArrowRight" });

    expect(card).not.toHaveClass("is-flipped");
    expect(screen.getByTestId("fc-card-counter")).toHaveTextContent("Thẻ 1 / 2");
  });

  it("opens settings popover and allows changing TTS speed and toggling metadata visibility", async () => {
    render(<FlashcardStudio decks={MOCK_DECKS} activeDeckId="deck-food" />);

    fireEvent.click(screen.getByRole("button", { name: "Cài đặt thẻ flashcard" }));
    const settingsDialog = screen.getByRole("dialog", { name: "Cài đặt flashcard" });
    expect(settingsDialog).toBeInTheDocument();

    // Change speed to 0.75x and test speaker uses 0.75
    fireEvent.click(within(settingsDialog).getByRole("button", { name: "0.75x" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Nghe phát âm hài lòng" })[0]);
    await waitFor(() => {
      expect(speakVietnamese).toHaveBeenCalledWith(
        "hài lòng",
        expect.objectContaining({ rate: 0.75 })
      );
    });

    // Settings popover has Random mode (selected by default) + all 5 Northern Vietnamese voices
    const voiceGroup = within(settingsDialog).getByRole("group", {
      name: "Giọng đọc tiếng Việt (Miền Bắc)",
    });
    const randomBtn = within(voiceGroup).getByText("Ngẫu nhiên").closest("button");
    expect(randomBtn).not.toBeNull();
    expect(randomBtn).toHaveAttribute("aria-pressed", "true");
    expect(within(voiceGroup).getByText("Xoay vòng 5 giọng Bắc")).toBeInTheDocument();
    expect(within(voiceGroup).getByText("Ngọc Huyền")).toBeInTheDocument();
    expect(within(voiceGroup).getByText("Trúc Ly")).toBeInTheDocument();
    expect(within(voiceGroup).getByText("Mai Anh")).toBeInTheDocument();
    expect(within(voiceGroup).getByText("Nữ · Tin tức rõ chữ")).toBeInTheDocument();
    expect(within(voiceGroup).getByText("Thiện Minh")).toBeInTheDocument();
    const haiDangBtn = within(voiceGroup).getByText("Hải Đăng").closest("button");
    expect(haiDangBtn).not.toBeNull();
    fireEvent.click(haiDangBtn);
    expect(setSelectedVoice).toHaveBeenCalledWith("haidang");

    // Stage prefetches active card word, example, and upcoming card for the newly selected voice
    await waitFor(() => {
      expect(prefetchVietnamese).toHaveBeenCalledWith(
        ["hài lòng", "Tôi rất hài lòng với món phở ở quán này.", "đậm đà"],
        { voice: "haidang" }
      );
    });

    // Can switch back to Random mode
    fireEvent.click(randomBtn);
    expect(setSelectedVoice).toHaveBeenCalledWith("random");

    // Settings popover has no IPA toggle, only POS visibility
    expect(within(settingsDialog).queryByText(/phiên âm|IPA/i)).not.toBeInTheDocument();

    // Hide POS subline
    fireEvent.click(within(settingsDialog).getByLabelText("Hiển thị loại từ"));
    expect(screen.queryByTestId("fc-front-subline")).not.toBeInTheDocument();
  });

  it("records pronunciation via the white Mic button and displays inline accuracy feedback", () => {
    const onRecordPractice = vi.fn();
    startVietnameseListening.mockImplementation(({ onResult }) => {
      onResult("hài lòng");
      return { stop: vi.fn(), abort: vi.fn() };
    });

    render(
      <FlashcardStudio
        decks={MOCK_DECKS}
        activeDeckId="deck-food"
        onRecordPractice={onRecordPractice}
      />
    );

    const micBtn = screen.getAllByRole("button", {
      name: "Luyện phát âm tiếng Việt bằng micro",
    })[0];
    fireEvent.click(micBtn);

    expect(startVietnameseListening).toHaveBeenCalledTimes(1);
    const feedback = screen.getByTestId("fc-pron-feedback");
    expect(feedback).toHaveTextContent("96%");
    expect(feedback).toHaveTextContent("hài lòng");
    expect(onRecordPractice).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: "flashcard_review",
        skillTags: ["pronunciation", "speaking"],
      })
    );
  });

  it("marks mastery on the back face using Cần ôn and Đã thuộc buttons", () => {
    const onUpdateMastery = vi.fn();
    render(
      <FlashcardStudio
        decks={MOCK_DECKS}
        activeDeckId="deck-food"
        onUpdateMastery={onUpdateMastery}
      />
    );

    const card = screen.getByTestId("fc-flashcard");
    fireEvent.click(card);
    fireEvent.click(within(card).getByRole("button", { name: /Đã thuộc/ }));
    expect(onUpdateMastery).toHaveBeenCalledWith("card-1", MASTERY_LEVELS.MASTERED);

    fireEvent.click(within(card).getByRole("button", { name: /Cần ôn/ }));
    expect(onUpdateMastery).toHaveBeenCalledWith("card-1", MASTERY_LEVELS.REVIEW);
  });

  it("creates a single flashcard from Vietnamese word + definition + example", async () => {
    const onAddCard = vi.fn(() => Promise.resolve({ id: "card-new" }));
    render(
      <FlashcardStudio
        decks={MOCK_DECKS}
        activeDeckId="deck-food"
        onAddCard={onAddCard}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Tạo thẻ mới" }));
    expect(screen.getByTestId("fc-creator-panel")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Phiên âm/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Từ vựng \/ cụm từ tiếng Việt/), {
      target: { value: "bữa sáng" },
    });
    fireEvent.change(screen.getByLabelText(/Định nghĩa/), {
      target: { value: "bữa ăn đầu tiên trong ngày" },
    });
    fireEvent.change(screen.getByLabelText(/Câu ví dụ tiếng Việt/), {
      target: { value: "Tôi thường ăn bánh mì cho bữa sáng." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Tạo flashcard & học ngay/ }));

    await waitFor(() => {
      expect(onAddCard).toHaveBeenCalledWith(
        "deck-food",
        expect.objectContaining({
          frontVi: "bữa sáng",
          definition: "bữa ăn đầu tiên trong ngày",
          exampleVi: "Tôi thường ăn bánh mì cho bữa sáng.",
        })
      );
      expect(prefetchVietnamese).toHaveBeenCalledWith(["bữa sáng"]);
    });
  });

  it("imports multiple flashcards in bulk with live preview and one-click save", async () => {
    const onAddCardsBulk = vi.fn(() => Promise.resolve([]));
    render(
      <FlashcardStudio
        decks={MOCK_DECKS}
        activeDeckId="deck-food"
        onAddCardsBulk={onAddCardsBulk}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Tạo thẻ mới" }));
    fireEvent.click(screen.getByRole("tab", { name: "Dán danh sách" }));

    const bulkInput = screen.getByLabelText(/Dán danh sách từ vựng tiếng Việt/);
    fireEvent.change(bulkInput, {
      target: {
        value: [
          "món tráng miệng | danh từ | món ngọt ăn cuối bữa | Chè là món tráng miệng rất phổ biến.",
          "Từ: ấm bụng\nĐịnh nghĩa: ăn uống thấy ấm áp, dễ chịu\nVí dụ: Trời mưa ăn bát phở nóng thật ấm bụng.",
        ].join("\n\n"),
      },
    });

    const preview = screen.getByTestId("fc-bulk-preview-list");
    expect(preview).toBeInTheDocument();
    expect(screen.getByDisplayValue("món tráng miệng")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ấm bụng")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Tạo 2 flashcard & học ngay/ }));

    await waitFor(() => {
      expect(onAddCardsBulk).toHaveBeenCalledWith(
        "deck-food",
        expect.arrayContaining([
          expect.objectContaining({
            frontVi: "món tráng miệng",
            pos: "danh từ",
            definition: "món ngọt ăn cuối bữa",
          }),
          expect.objectContaining({
            frontVi: "ấm bụng",
            definition: "ăn uống thấy ấm áp, dễ chịu",
          }),
        ])
      );
      expect(prefetchVietnamese).toHaveBeenCalledWith(["món tráng miệng", "ấm bụng"]);
    });
  });

  it("shows graceful notice when browser speech recognition is unsupported", () => {
    isSpeechRecognitionSupported.mockReturnValue(false);
    render(<FlashcardStudio decks={MOCK_DECKS} activeDeckId="deck-food" />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Luyện phát âm tiếng Việt bằng micro" })[0]
    );
    expect(screen.getByText(/chưa hỗ trợ nhận diện giọng nói/i)).toBeInTheDocument();
  });

  it("allows editing and deleting cards in the Manage tab", async () => {
    const onUpdateCard = vi.fn(() => Promise.resolve());
    const onDeleteCard = vi.fn(() => Promise.resolve());
    render(
      <FlashcardStudio
        decks={MOCK_DECKS}
        activeDeckId="deck-food"
        onUpdateCard={onUpdateCard}
        onDeleteCard={onDeleteCard}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /Quản lý/ }));
    expect(screen.getByTestId("fc-deck-manager")).toBeInTheDocument();
    expect(screen.queryByText(/\/haːj˨˩ lɔŋ˨˩\//)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa thẻ hài lòng" }));
    expect(screen.queryByLabelText(/Sửa phiên âm/i)).not.toBeInTheDocument();
    const defInput = screen.getByLabelText("Sửa định nghĩa");
    fireEvent.change(defInput, { target: { value: "cảm thấy rất vừa ý và vui" } });
    fireEvent.click(screen.getByRole("button", { name: /Lưu thẻ/ }));

    await waitFor(() => {
      expect(onUpdateCard).toHaveBeenCalledWith(
        "card-1",
        expect.objectContaining({
          frontVi: "hài lòng",
          definition: "cảm thấy rất vừa ý và vui",
        })
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Xóa thẻ đậm đà" }));
    expect(onDeleteCard).toHaveBeenCalledWith("card-2");
  });

  it("shows the PDF upload tab with format guide examples and generates flashcards from an uploaded PDF", async () => {
    const onCreateDeck = vi.fn(() => Promise.resolve({ id: "deck-pdf-1" }));
    extractTextFromStudyFile.mockResolvedValueOnce({
      text: [
        "1. cân bằng (động từ): giữ sự hài hòa giữa các mặt - VD: Tôi cố gắng cân bằng công việc và gia đình.",
        "Từ: linh hoạt",
        "Loại từ: tính từ",
        "Định nghĩa: dễ thay đổi, thích nghi nhanh",
        "với hoàn cảnh thực tế",
        "Ví dụ: Lịch làm việc từ xa rất linh hoạt.",
      ].join("\n"),
      pageCount: 2,
      isEmpty: false,
      error: "",
      fileType: "pdf",
    });

    render(
      <FlashcardStudio
        decks={MOCK_DECKS}
        activeDeckId="deck-food"
        onCreateDeck={onCreateDeck}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Tạo thẻ mới" }));
    fireEvent.click(screen.getByRole("tab", { name: "Tải file PDF" }));

    expect(screen.getByTestId("fc-pdf-panel")).toBeInTheDocument();
    const guide = screen.getByTestId("fc-pdf-format-guide");
    expect(guide).toHaveTextContent("Cấu trúc file PDF gợi ý");
    expect(within(guide).getByRole("tab", { name: "Khối có nhãn" })).toBeInTheDocument();
    expect(within(guide).getByRole("tab", { name: "Gạch đứng (|)" })).toBeInTheDocument();
    expect(within(guide).getByRole("tab", { name: "Giáo trình đánh số" })).toBeInTheDocument();
    expect(within(guide).getByRole("button", { name: /Sao chép mẫu/ })).toBeInTheDocument();

    // Switch format example tab to verify interactive example switching
    fireEvent.click(within(guide).getByRole("tab", { name: "Gạch đứng (|)" }));
    expect(guide).toHaveTextContent("hài lòng | tính từ");

    // Upload a mocked PDF file
    const fileInput = screen.getByLabelText("Chọn file PDF hoặc TXT để tạo flashcard");
    const mockPdf = new File(["%PDF-1.4"], "Tu_vung_cong_viec_B1.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [mockPdf] } });

    await waitFor(() => {
      expect(extractTextFromStudyFile).toHaveBeenCalledWith(mockPdf, expect.any(Function));
      expect(screen.getByTestId("fc-pdf-preview-list")).toBeInTheDocument();
    });

    // Auto-suggested deck title derived from filename
    expect(screen.getByLabelText(/Tên bộ thẻ mới/)).toHaveValue("Tu vung cong viec B1");
    expect(screen.getByText("2 trang")).toBeInTheDocument();
    expect(screen.getByDisplayValue("cân bằng")).toBeInTheDocument();
    expect(screen.getByDisplayValue("linh hoạt")).toBeInTheDocument();

    // Toggleable raw PDF text editor works
    fireEvent.click(screen.getByRole("button", { name: /Xem chữ đọc từ PDF/ }));
    expect(screen.getByLabelText("Nội dung chữ đọc từ PDF")).toBeInTheDocument();

    // Create flashcards & new deck in 1 click
    fireEvent.click(screen.getByRole("button", { name: /Tạo 2 flashcard & học ngay/ }));

    await waitFor(() => {
      expect(onCreateDeck).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Tu vung cong viec B1",
          cards: expect.arrayContaining([
            expect.objectContaining({
              frontVi: "cân bằng",
              pos: "động từ",
              definition: "giữ sự hài hòa giữa các mặt",
            }),
            expect.objectContaining({
              frontVi: "linh hoạt",
              pos: "tính từ",
              definition: "dễ thay đổi, thích nghi nhanh với hoàn cảnh thực tế",
            }),
          ]),
        })
      );
      expect(prefetchVietnamese).toHaveBeenCalledWith(["cân bằng", "linh hoạt"]);
    });
  });

  it("displays a clear Vietnamese error when uploading a scanned PDF with no selectable text", async () => {
    extractTextFromStudyFile.mockResolvedValueOnce({
      text: "",
      pageCount: 3,
      isEmpty: true,
      error: SCANNED_PDF_ERROR_VI,
      fileType: "pdf",
    });

    render(<FlashcardStudio decks={MOCK_DECKS} activeDeckId="deck-food" />);

    fireEvent.click(screen.getByRole("tab", { name: "Tạo thẻ mới" }));
    fireEvent.click(screen.getByRole("tab", { name: "Tải file PDF" }));

    const fileInput = screen.getByLabelText("Chọn file PDF hoặc TXT để tạo flashcard");
    const scannedPdf = new File(["%PDF-1.4"], "scan_photo.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [scannedPdf] } });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(SCANNED_PDF_ERROR_VI);
    });
  });
});
