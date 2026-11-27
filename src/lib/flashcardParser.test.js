import { describe, expect, it } from "vitest";
import {
  PDF_FORMAT_EXAMPLES,
  SAMPLE_BULK_TEMPLATE,
  formatIpaDisplay,
  normalizeVietnamesePos,
  parseBulkFlashcards,
} from "./flashcardParser.js";
import {
  reconstructPageLines,
  suggestDeckTitleFromFilename,
} from "./pdfImport.js";

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

  it("parses all 3 exported PDF_FORMAT_EXAMPLES with zero warnings", () => {
    expect(PDF_FORMAT_EXAMPLES).toHaveLength(3);
    for (const example of PDF_FORMAT_EXAMPLES) {
      const { cards, warnings } = parseBulkFlashcards(example.template);
      expect(warnings).toEqual([]);
      expect(cards.length).toBeGreaterThanOrEqual(3);
      expect(cards.every((c) => c.frontVi && c.definition && c.exampleVi)).toBe(true);
    }
  });

  it("parses numbered PDF lines, bullet prefixes, and ignores page numbers", () => {
    const pdfExtracted = [
      "Trang 1",
      "1. cân bằng (động từ): giữ sự hài hòa giữa các mặt - VD: Tôi cố gắng cân bằng công việc và gia đình.",
      "• linh hoạt | tính từ | dễ thích nghi theo hoàn cảnh | Lịch làm việc của tôi rất linh hoạt.",
      "▪ đồng nghiệp (danh từ): người cùng làm việc trong một công ty",
      "Ví dụ: Đồng nghiệp mới ở phòng tôi rất nhiệt tình.",
      "---",
      "2 / 4",
    ].join("\n");

    const { cards, warnings } = parseBulkFlashcards(pdfExtracted);
    expect(warnings).toEqual([]);
    expect(cards).toHaveLength(3);

    expect(cards[0]).toMatchObject({
      frontVi: "cân bằng",
      pos: "động từ",
      definition: "giữ sự hài hòa giữa các mặt",
      exampleVi: "Tôi cố gắng cân bằng công việc và gia đình.",
    });
    expect(cards[1]).toMatchObject({
      frontVi: "linh hoạt",
      pos: "tính từ",
      definition: "dễ thích nghi theo hoàn cảnh",
      exampleVi: "Lịch làm việc của tôi rất linh hoạt.",
    });
    expect(cards[2]).toMatchObject({
      frontVi: "đồng nghiệp",
      pos: "danh từ",
      definition: "người cùng làm việc trong một công ty",
      exampleVi: "Đồng nghiệp mới ở phòng tôi rất nhiệt tình.",
    });
  });

  it("parses wrapped multi-line PDF paragraphs inside labeled blocks including colons and bullet markers", () => {
    const wrappedPdf = [
      "- Từ: đúng giờ",
      "- Loại từ: cụm từ",
      "- Định nghĩa: có mặt vào đúng thời điểm đã hẹn trước,",
      "không đến muộn dù lịch trình bận rộn",
      "- Ví dụ: Anh ấy nói: tôi luôn đến văn phòng lúc",
      "8:30 sáng mỗi ngày.",
      "- Dịch: He said: I always arrive at the office at",
      "8:30 every morning.",
      "- Ghi chú: Thường dùng trong công việc và cuộc hẹn",
      "hằng ngày.",
      "",
      "2. Từ: trải nghiệm",
      "Loại từ: danh từ",
      "Định nghĩa: điều bản thân trực tiếp trải qua và",
      "cảm nhận sâu sắc",
      "Ví dụ: Chuyến đi Hội An là một trải nghiệm",
      "khó quên đối với tôi.",
    ].join("\n");

    const { cards, warnings } = parseBulkFlashcards(wrappedPdf);
    expect(warnings).toEqual([]);
    expect(cards).toHaveLength(2);

    expect(cards[0]).toMatchObject({
      frontVi: "đúng giờ",
      pos: "cụm từ",
      definition: "có mặt vào đúng thời điểm đã hẹn trước, không đến muộn dù lịch trình bận rộn",
      exampleVi: "Anh ấy nói: tôi luôn đến văn phòng lúc 8:30 sáng mỗi ngày.",
      exampleEn: "He said: I always arrive at the office at 8:30 every morning.",
      notes: "Thường dùng trong công việc và cuộc hẹn hằng ngày.",
    });

    expect(cards[1]).toMatchObject({
      frontVi: "trải nghiệm",
      pos: "danh từ",
      definition: "điều bản thân trực tiếp trải qua và cảm nhận sâu sắc",
      exampleVi: "Chuyến đi Hội An là một trải nghiệm khó quên đối với tôi.",
    });
  });

  it("reconstructs Vietnamese PDF lines with Y clustering, combining marks, and paragraph breaks", () => {
    const items = [
      // Row 1 (y = 700): "Từ: cân bằng" split into separate runs + NFD combining accent
      { str: "Tu\u031b\u0300:", transform: [1, 0, 0, 12, 40, 700], width: 22, height: 12 },
      { str: "cân", transform: [1, 0, 0, 12, 68, 700.4], width: 20, height: 12 },
      { str: "bằng", transform: [1, 0, 0, 12, 92, 699.7], width: 28, height: 12 },
      // Row 2 (y = 684): "Định nghĩa: hài hòa" (normal line step = 16)
      { str: "Định nghĩa:", transform: [1, 0, 0, 12, 40, 684], width: 60, height: 12 },
      { str: "hài hòa", transform: [1, 0, 0, 12, 106, 684], width: 42, height: 12 },
      // Row 3 (y = 640): large vertical gap (44pt) -> should insert paragraph blank line!
      { str: "Từ: thư giãn", transform: [1, 0, 0, 12, 40, 640], width: 72, height: 12 },
    ];

    const text = reconstructPageLines(items);
    expect(text).toBe("Từ: cân bằng\nĐịnh nghĩa: hài hòa\n\nTừ: thư giãn");
    expect(suggestDeckTitleFromFilename("Tu_vung_B1_Am_thuc.pdf")).toBe("Tu vung B1 Am thuc");
  });
});
