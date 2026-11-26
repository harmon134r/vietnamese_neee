import { describe, expect, it } from "vitest";
import {
  SAMPLE_BULK_TEMPLATE,
  formatIpaDisplay,
  normalizeVietnamesePos,
  parseBulkFlashcards,
} from "./flashcardParser.js";

describe("flashcardParser utilities", () => {
  it("normalizes Vietnamese and English POS aliases cleanly", () => {
    expect(normalizeVietnamesePos("n")).toBe("danh từ");
    expect(normalizeVietnamesePos("Verb")).toBe("động từ");
    expect(normalizeVietnamesePos("adj")).toBe("tính từ");
    expect(normalizeVietnamesePos("phrase")).toBe("cụm từ");
    expect(normalizeVietnamesePos("(tính từ)")).toBe("tính từ");
    expect(normalizeVietnamesePos("thành ngữ")).toBe("thành ngữ");
  });

  it("formats IPA consistently with slashes", () => {
    expect(formatIpaDisplay("")).toBe("");
    expect(formatIpaDisplay("haːj˨˩ lɔŋ˨˩")).toBe("/haːj˨˩ lɔŋ˨˩/");
    expect(formatIpaDisplay("/bɒnd/")).toBe("/bɒnd/");
    expect(formatIpaDisplay("[mɔn˧˥]")).toBe("[mɔn˧˥]");
  });

  it("parses pipe-delimited lines with 3, 4, and 5 columns", () => {
    const input = [
      "món ăn đặc sản | món ăn nổi tiếng của địa phương | Phở là món ăn đặc sản của Hà Nội.",
      "hài lòng | adj | cảm thấy vừa ý | Tôi rất hài lòng với bữa tối.",
      "thói quen | danh từ | /tʰɔj˧˥ kwɛn˧˧/ | việc làm lặp lại hằng ngày | Anh ấy có thói quen chạy bộ buổi sáng.",
    ].join("\n");

    const { cards, warnings } = parseBulkFlashcards(input, {
      deckId: "deck-1",
      topicId: "food",
    });

    expect(warnings).toHaveLength(0);
    expect(cards).toHaveLength(3);

    expect(cards[0]).toMatchObject({
      deckId: "deck-1",
      topicId: "food",
      frontVi: "món ăn đặc sản",
      pos: "",
      definition: "món ăn nổi tiếng của địa phương",
      exampleVi: "Phở là món ăn đặc sản của Hà Nội.",
    });

    expect(cards[1]).toMatchObject({
      frontVi: "hài lòng",
      pos: "tính từ",
      definition: "cảm thấy vừa ý",
      exampleVi: "Tôi rất hài lòng với bữa tối.",
    });

    expect(cards[2]).toMatchObject({
      frontVi: "thói quen",
      pos: "danh từ",
      ipa: "/tʰɔj˧˥ kwɛn˧˧/",
      definition: "việc làm lặp lại hằng ngày",
      exampleVi: "Anh ấy có thói quen chạy bộ buổi sáng.",
    });
  });

  it("parses labeled multi-line Vietnamese blocks", () => {
    const input = `
Từ: dễ chịu
Loại từ: tính từ
Phiên âm: /ze˦ˀ˥ tɕiəw˧˨ʔ/
Định nghĩa: mang lại cảm giác thoải mái, êm dịu
Ví dụ: Thời tiết hôm nay rất mát mẻ và dễ chịu.
Dịch: The weather today is very cool and pleasant.
Ghi chú: Thường dùng cho thời tiết hoặc không khí

Từ vựng: theo quan điểm của tôi
Loại từ: cụm từ
Nghĩa: cách mở đầu lịch sự khi nêu ý kiến cá nhân
VD: Theo quan điểm của tôi, làm việc từ xa khá linh hoạt.
`;
    const { cards, warnings } = parseBulkFlashcards(input);
    expect(warnings).toHaveLength(0);
    expect(cards).toHaveLength(2);

    expect(cards[0]).toMatchObject({
      frontVi: "dễ chịu",
      pos: "tính từ",
      ipa: "/ze˦ˀ˥ tɕiəw˧˨ʔ/",
      definition: "mang lại cảm giác thoải mái, êm dịu",
      exampleVi: "Thời tiết hôm nay rất mát mẻ và dễ chịu.",
      exampleEn: "The weather today is very cool and pleasant.",
      notes: "Thường dùng cho thời tiết hoặc không khí",
    });

    expect(cards[1]).toMatchObject({
      frontVi: "theo quan điểm của tôi",
      pos: "cụm từ",
      definition: "cách mở đầu lịch sự khi nêu ý kiến cá nhân",
      exampleVi: "Theo quan điểm của tôi, làm việc từ xa khá linh hoạt.",
    });
  });

  it("parses colon/dash format with inline POS, IPA, numbering, and VD:", () => {
    const input = [
      "1. hào hứng (adj) /haːw˨˩ hɨŋ˧˥/: cảm thấy rất vui và mong đợi - VD: Tôi rất hào hứng với chuyến đi này.",
      "2. thư giãn - nghỉ ngơi cho thoải mái - Cuối tuần tôi nghe nhạc để thư giãn.",
    ].join("\n");

    const { cards, warnings } = parseBulkFlashcards(input);
    expect(warnings).toHaveLength(0);
    expect(cards).toHaveLength(2);

    expect(cards[0]).toMatchObject({
      frontVi: "hào hứng",
      pos: "tính từ",
      ipa: "/haːw˨˩ hɨŋ˧˥/",
      definition: "cảm thấy rất vui và mong đợi",
      exampleVi: "Tôi rất hào hứng với chuyến đi này.",
    });

    expect(cards[1]).toMatchObject({
      frontVi: "thư giãn",
      definition: "nghỉ ngơi cho thoải mái",
      exampleVi: "Cuối tuần tôi nghe nhạc để thư giãn.",
    });
  });

  it("parses tab-separated lines (Excel/Sheets) and skips header rows", () => {
    const tsv = [
      "Từ vựng\tLoại từ\tĐịnh nghĩa\tVí dụ",
      "bận rộn\ttính từ\tcó rất nhiều việc phải làm\tTuần này công việc của tôi khá bận rộn.",
      "cân bằng\tđộng từ\tgiữ sự hài hòa giữa các mặt\tTôi cố gắng cân bằng giữa công việc và cuộc sống.",
    ].join("\n");

    const { cards, warnings } = parseBulkFlashcards(tsv);
    expect(warnings).toHaveLength(0);
    expect(cards).toHaveLength(2);
    expect(cards[0].frontVi).toBe("bận rộn");
    expect(cards[0].pos).toBe("tính từ");
    expect(cards[1].frontVi).toBe("cân bằng");
  });

  it("deduplicates repeated words and emits warnings for malformed lines", () => {
    const input = [
      "ẩm thực | nghệ thuật nấu nướng | Ẩm thực Huế rất tinh tế.",
      "Ẩm Thực | trùng lặp | Không nên tạo lại",
      "dòng không có dấu phân cách gì cả",
    ].join("\n");

    const { cards, warnings } = parseBulkFlashcards(input);
    expect(cards).toHaveLength(1);
    expect(warnings.length).toBe(2);
  });

  it("parses SAMPLE_BULK_TEMPLATE cleanly with zero warnings", () => {
    const { cards, warnings } = parseBulkFlashcards(SAMPLE_BULK_TEMPLATE);
    expect(warnings).toHaveLength(0);
    expect(cards).toHaveLength(4);
    expect(cards.every((c) => c.frontVi && c.definition && c.exampleVi)).toBe(true);
  });
});
