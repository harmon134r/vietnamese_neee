import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("../../lib/speech.js", () => ({
  speakVietnamese: vi.fn(() => Promise.resolve({ source: "api" })),
  stopSpeaking: vi.fn(),
  isSpeechRecognitionSupported: vi.fn(() => true),
  startVietnameseListening: vi.fn(),
}));

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
  speakVietnamese,
  startVietnameseListening,
} from "../../lib/speech.js";
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

  it("renders the dark flashcard front with Vietnamese word, POS - /IPA/, tooltip, controls, and shortcut legend", () => {
    render(<FlashcardStudio decks={MOCK_DECKS} activeDeckId="deck-food" />);

    expect(screen.getByRole("heading", { level: 3, name: "hài lòng" })).toBeInTheDocument();
    const subline = screen.getByTestId("fc-front-subline");
    expect(subline).toHaveTextContent("tính từ");
    expect(subline).toHaveTextContent("-");
    expect(subline).toHaveTextContent("/haːj˨˩ lɔŋ˨˩/");

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
    expect(screen.getByRole("dialog", { name: "Cài đặt flashcard" })).toBeInTheDocument();

    // Change speed to 0.75x and test speaker uses 0.75
    fireEvent.click(screen.getByRole("button", { name: "0.75x" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Nghe phát âm hài lòng" })[0]);
    await waitFor(() => {
      expect(speakVietnamese).toHaveBeenCalledWith(
        "hài lòng",
        expect.objectContaining({ rate: 0.75 })
      );
    });

    // Hide POS & IPA subline
    fireEvent.click(screen.getByLabelText("Hiển thị loại từ & phiên âm"));
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
    fireEvent.click(screen.getByRole("tab", { name: "Nhập nhanh hàng loạt" }));

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

    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa thẻ hài lòng" }));
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
});
