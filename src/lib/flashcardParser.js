import { generateId, isValidTopicId, normalizeFlashcard } from "./contracts.js";

export const VIETNAMESE_POS_OPTIONS = Object.freeze([
  { value: "danh từ", label: "Danh từ (n)" },
  { value: "động từ", label: "Động từ (v)" },
  { value: "tính từ", label: "Tính từ (adj)" },
  { value: "trạng từ", label: "Trạng từ (adv)" },
  { value: "cụm từ", label: "Cụm từ (phrase)" },
  { value: "thành ngữ", label: "Thành ngữ (idiom)" },
  { value: "câu giao tiếp", label: "Câu giao tiếp" },
  { value: "liên từ", label: "Liên từ (conj)" },
  { value: "giới từ", label: "Giới từ (prep)" },
  { value: "đại từ", label: "Đại từ (pron)" },
  { value: "thán từ", label: "Thán từ" },
  { value: "khác", label: "Khác" },
]);

const POS_NORMALIZE_MAP = Object.freeze({
  n: "danh từ",
  noun: "danh từ",
  "danh từ": "danh từ",
  "danh tu": "danh từ",
  dt: "danh từ",
  v: "động từ",
  verb: "động từ",
  "động từ": "động từ",
  "dong tu": "động từ",
  đt: "động từ",
  adj: "tính từ",
  adjective: "tính từ",
  "tính từ": "tính từ",
  "tinh tu": "tính từ",
  tt: "tính từ",
  adv: "trạng từ",
  adverb: "trạng từ",
  "trạng từ": "trạng từ",
  "trang tu": "trạng từ",
  "phó từ": "trạng từ",
  phrase: "cụm từ",
  phr: "cụm từ",
  "phr v": "cụm từ",
  "cụm từ": "cụm từ",
  "cum tu": "cụm từ",
  "cụm động từ": "cụm từ",
  "cụm danh từ": "cụm từ",
  idiom: "thành ngữ",
  "thành ngữ": "thành ngữ",
  "thanh ngu": "thành ngữ",
  expression: "câu giao tiếp",
  sentence: "câu giao tiếp",
  "câu giao tiếp": "câu giao tiếp",
  "mẫu câu": "câu giao tiếp",
  conj: "liên từ",
  conjunction: "liên từ",
  "liên từ": "liên từ",
  "lien tu": "liên từ",
  prep: "giới từ",
  preposition: "giới từ",
  "giới từ": "giới từ",
  "gioi tu": "giới từ",
  pron: "đại từ",
  pronoun: "đại từ",
  "đại từ": "đại từ",
  "dai tu": "đại từ",
  interj: "thán từ",
  interjection: "thán từ",
  "thán từ": "thán từ",
  other: "khác",
  khác: "khác",
});

/**
 * Normalize a part-of-speech input into clean Vietnamese lowercase label.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeVietnamesePos(raw = "") {
  const cleaned = String(raw || "")
    .trim()
    .replace(/^[([{\s]+|[)\]}\s.,;:]+$/g, "")
    .replace(/\s+/g, " ");
  if (!cleaned) return "";
  const lower = cleaned.toLocaleLowerCase("vi");
  return POS_NORMALIZE_MAP[lower] || cleaned;
}

/**
 * Check if a string looks like a part-of-speech token.
 * @param {string} raw
 * @returns {boolean}
 */
export function isPosToken(raw = "") {
  const cleaned = String(raw || "")
    .trim()
    .replace(/^[([{\s]+|[)\]}\s.,;:]+$/g, "")
    .toLocaleLowerCase("vi");
  return Boolean(cleaned && POS_NORMALIZE_MAP[cleaned]);
}

/**
 * Check if a string looks like an IPA / phonetic token (e.g. "/kảm thấy/" or "[...]").
 * @param {string} raw
 * @returns {boolean}
 */
export function isIpaToken(raw = "") {
  const trimmed = String(raw || "").trim();
  return /^\/[^/]+\/$/.test(trimmed) || /^\[[^\]]+\]$/.test(trimmed);
}

/**
 * Format an IPA string consistently with enclosing slashes when present.
 * @param {string} ipa
 * @returns {string}
 */
export function formatIpaDisplay(ipa = "") {
  const trimmed = String(ipa || "").trim();
  if (!trimmed) return "";
  if (
    (trimmed.startsWith("/") && trimmed.endsWith("/")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return trimmed;
  }
  return `/${trimmed}/`;
}

const LEADING_LIST_MARKER_RE =
  /^(?:(?:\(?\d{1,3}\)?[.)]|\d{1,3}\/)\s+|[•·▪▫◦‣⁃➢➤❖▸▹✓✔]\s*|[-*–—]\s+)/;

function stripLeadingListMarker(line = "") {
  return String(line || "")
    .trim()
    .replace(LEADING_LIST_MARKER_RE, "")
    .trim();
}

function isIgnorablePdfNoiseLine(trimmed = "") {
  if (!trimmed) return true;
  // Pure page numbers like "1", "Trang 2", "Page 2 / 5", "- 3 -"
  if (/^(?:trang|page|p\.)?\s*[-–—]?\s*\d{1,4}\s*(?:\/\s*\d{1,4})?\s*[-–—]?$/iu.test(trimmed)) {
    return true;
  }
  // Pure decorative horizontal rules exported from Docs/Word/Canva
  if (/^[-=_*•·~–—]{3,}$/.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Extract optional inline `(pos)` and `/ipa/` from a front-word fragment.
 * Example: "ẩm thực (danh từ) /əm˧˩ tʰɨk˧˨ʔ/" -> { frontVi: "ẩm thực", pos: "danh từ", ipa: "/əm˧˩ tʰɨk˧˨ʔ/" }
 */
function extractInlineMeta(fragment = "") {
  let working = stripLeadingListMarker(fragment);
  let pos = "";
  let ipa = "";

  const ipaMatch = working.match(/(?:^|\s)(\/[^/]+\/|\[[^\]]+\])(?:\s|$)/);
  if (ipaMatch) {
    ipa = ipaMatch[1].trim();
    working = working.replace(ipaMatch[0], " ").replace(/\s+/g, " ").trim();
  }

  const posMatch = working.match(/\(([^()]{1,30})\)/);
  if (posMatch) {
    const candidate = posMatch[1].trim();
    if (isPosToken(candidate) || candidate.split(/\s+/).length <= 3) {
      pos = normalizeVietnamesePos(candidate);
      working = working.replace(posMatch[0], " ").replace(/\s+/g, " ").trim();
    }
  }

  return {
    frontVi: working.trim(),
    pos,
    ipa,
  };
}

function isLikelyHeaderRow(cols) {
  if (!Array.isArray(cols) || cols.length < 2) return false;
  const first = String(cols[0] || "").trim().toLocaleLowerCase("vi");
  const second = String(cols[1] || "").trim().toLocaleLowerCase("vi");
  const headerFirst = ["từ", "từ vựng", "cụm từ", "term", "word", "front", "front_vi", "tiếng việt"];
  const headerSecond = [
    "định nghĩa",
    "nghĩa",
    "loại từ",
    "từ loại",
    "pos",
    "definition",
    "meaning",
    "phiên âm",
    "ipa",
  ];
  return headerFirst.includes(first) && headerSecond.includes(second);
}

function mapColumnsToCard(rawCols) {
  const cols = rawCols.map((c) => String(c || "").trim());
  while (cols.length > 0 && !cols[cols.length - 1]) {
    cols.pop();
  }
  if (cols.length < 2 || isLikelyHeaderRow(cols)) return null;

  const head = extractInlineMeta(cols[0]);
  let frontVi = head.frontVi;
  let pos = head.pos;
  let ipa = head.ipa;
  let definition = "";
  let exampleVi = "";
  let exampleEn = "";
  let notes = "";

  const rest = cols.slice(1);

  if (rest.length === 1) {
    definition = rest[0];
  } else if (rest.length === 2) {
    // Could be [pos, definition] if col2 is strictly a POS token, otherwise [definition, exampleVi]
    if (!pos && isPosToken(rest[0])) {
      pos = normalizeVietnamesePos(rest[0]);
      definition = rest[1];
    } else if (!ipa && isIpaToken(rest[0])) {
      ipa = rest[0];
      definition = rest[1];
    } else {
      definition = rest[0];
      exampleVi = rest[1];
    }
  } else if (rest.length === 3) {
    if (!pos && isPosToken(rest[0])) {
      pos = normalizeVietnamesePos(rest[0]);
      definition = rest[1];
      exampleVi = rest[2];
    } else if (!ipa && isIpaToken(rest[0])) {
      ipa = rest[0];
      definition = rest[1];
      exampleVi = rest[2];
    } else {
      definition = rest[0];
      exampleVi = rest[1];
      exampleEn = rest[2];
    }
  } else if (rest.length === 4) {
    if (!pos && isPosToken(rest[0]) && !ipa && isIpaToken(rest[1])) {
      pos = normalizeVietnamesePos(rest[0]);
      ipa = rest[1];
      definition = rest[2];
      exampleVi = rest[3];
    } else if (!pos && isPosToken(rest[0])) {
      pos = normalizeVietnamesePos(rest[0]);
      definition = rest[1];
      exampleVi = rest[2];
      exampleEn = rest[3];
    } else {
      definition = rest[0];
      exampleVi = rest[1];
      exampleEn = rest[2];
      notes = rest[3];
    }
  } else {
    // 5+ columns after front: [pos, ipa, definition, exampleVi, exampleEn, notes]
    if (!pos && (isPosToken(rest[0]) || rest[0] === "")) {
      pos = normalizeVietnamesePos(rest[0]);
      ipa = ipa || rest[1];
      definition = rest[2] || "";
      exampleVi = rest[3] || "";
      exampleEn = rest[4] || "";
      notes = rest[5] || "";
    } else {
      pos = pos || normalizeVietnamesePos(rest[0]);
      ipa = ipa || rest[1];
      definition = rest[2] || "";
      exampleVi = rest[3] || "";
      exampleEn = rest[4] || "";
      notes = rest[5] || "";
    }
  }

  // Strip optional "VD:" / "Ví dụ:" prefix inside example column
  exampleVi = exampleVi.replace(/^(?:ví\s*dụ|vd|example|ex)\s*[:：\-]\s*/iu, "").trim();
  definition = definition.replace(/^(?:định\s*nghĩa|nghĩa|def|definition|meaning)\s*[:：\-]\s*/iu, "").trim();

  if (!frontVi || !definition) return null;

  return {
    frontVi,
    pos,
    ipa: ipa ? formatIpaDisplay(ipa) : "",
    definition,
    exampleVi,
    exampleEn,
    notes,
  };
}

const LABELED_FIELD_REGEX =
  /^(?:(?:\(?\d{1,3}\)?[.)]|\d{1,3}\/)\s+|[•·▪▫◦‣⁃➢➤❖▸▹✓✔]\s*|[-*–—]\s+)?(?:\*\*)?(từ\s*vựng|từ|cụm\s*từ|mặt\s*trước|term|word|front|loại\s*từ|từ\s*loại|pos|phiên\s*âm|ipa|cách\s*đọc|định\s*nghĩa|nghĩa|giải\s*thích|mặt\s*sau|definition|meaning|back|câu\s*ví\s*dụ|ví\s*dụ|vd|example|ex|dịch\s*ví\s*dụ|dịch|tiếng\s*anh|english|en|translation|ghi\s*chú|lưu\s*ý|notes?)(?:\*\*)?\s*[:：]\s*(.*)$/iu;

function classifyLabel(rawLabel = "") {
  const label = rawLabel.trim().toLocaleLowerCase("vi").replace(/\s+/g, " ");
  if (["từ", "từ vựng", "cụm từ", "mặt trước", "term", "word", "front"].includes(label)) {
    return "frontVi";
  }
  if (["loại từ", "từ loại", "pos"].includes(label)) return "pos";
  if (["phiên âm", "ipa", "cách đọc"].includes(label)) return "ipa";
  if (["định nghĩa", "nghĩa", "giải thích", "mặt sau", "definition", "meaning", "back"].includes(label)) {
    return "definition";
  }
  if (["câu ví dụ", "ví dụ", "vd", "example", "ex"].includes(label)) return "exampleVi";
  if (["dịch ví dụ", "dịch", "tiếng anh", "english", "en", "translation"].includes(label)) {
    return "exampleEn";
  }
  if (["ghi chú", "lưu ý", "note", "notes"].includes(label)) return "notes";
  return null;
}

function looksLikeNewInlineCard(trimmed = "") {
  if (!trimmed) return false;
  if (trimmed.includes("|") || trimmed.includes("\t")) return true;
  // Numbered/bulleted entry with explicit colon separator: "2. từ mới (danh từ): ..."
  if (/^(?:(?:\(?\d{1,3}\)?[.)]|\d{1,3}\/)\s+|[•▪▫◦➢➤❖▸▹]\s*).+\s*[:：]\s+\S/u.test(trimmed)) {
    return true;
  }
  // Inline "(pos): definition" pattern starting a new entry
  const colonIdx = trimmed.search(/[:：]/);
  if (colonIdx > 0) {
    const left = trimmed.slice(0, colonIdx).trim();
    const right = trimmed.slice(colonIdx + 1).trim();
    if (right && /\([^()]{1,24}\)\s*$/.test(left)) {
      return true;
    }
  }
  return false;
}

function parseSingleLineFallback(rawLine) {
  const line = stripLeadingListMarker(rawLine);
  if (!line) return null;

  // Format A: pipe-delimited
  if (line.includes("|")) {
    return mapColumnsToCard(line.split("|"));
  }

  // Format B: tab-separated (Excel / Sheets)
  if (line.includes("\t")) {
    return mapColumnsToCard(line.split("\t"));
  }

  // Format C: colon/dash with optional inline "VD:" / "Ví dụ:" segment
  let mainPart = line;
  let exampleVi = "";
  const exSplit = line.match(/^(.*?)\s*(?:[-–—;•]\s*|\s+)(?:ví\s*dụ|vd|example|ex)\s*[:：]\s*(.+)$/iu);
  if (exSplit) {
    mainPart = exSplit[1].trim();
    exampleVi = exSplit[2].trim();
  }

  // Split term & definition by ":" or "：" first, or " - " / " – " / " — "
  const colonIdx = mainPart.search(/[:：]/);
  if (colonIdx > 0) {
    const left = mainPart.slice(0, colonIdx).trim();
    let right = mainPart.slice(colonIdx + 1).trim();
    if (left && right) {
      const meta = extractInlineMeta(left);
      let pos = meta.pos;
      if (!pos) {
        const leadingPos = right.match(/^\(([^()]{1,24})\)\s*(.+)$/);
        if (leadingPos && isPosToken(leadingPos[1])) {
          pos = normalizeVietnamesePos(leadingPos[1]);
          right = leadingPos[2].trim();
        }
      }
      if (meta.frontVi && right) {
        return {
          frontVi: meta.frontVi,
          pos,
          ipa: meta.ipa ? formatIpaDisplay(meta.ipa) : "",
          definition: right,
          exampleVi,
          exampleEn: "",
          notes: "",
        };
      }
    }
  }

  // Dash separated: "từ - định nghĩa - ví dụ"
  const dashParts = mainPart.split(/\s+[–—-]\s+/).map((p) => p.trim()).filter(Boolean);
  if (dashParts.length >= 2) {
    const mapped = mapColumnsToCard(exampleVi ? [...dashParts, exampleVi] : dashParts);
    if (mapped) return mapped;
  }

  return null;
}

/**
 * Smart multi-format bulk flashcard parser for Vietnamese vocabulary (paste & PDF text).
 * Supports:
 * 1) Labeled blocks (`Từ: ... / Loại từ: ... / Định nghĩa: ... / Ví dụ: ... / Dịch: ... / Ghi chú: ...`)
 *    including wrapped multi-line PDF paragraphs and bullet/number prefixes
 * 2) Pipe-delimited (`từ | định nghĩa | ví dụ` or 4-6 columns with POS/EN/notes)
 * 3) Tab-separated (pasted from Excel / Google Sheets)
 * 4) Numbered/bulleted textbook & colon/dash lines (`1. từ (loại từ): định nghĩa - VD: ví dụ`)
 *
 * @param {string} rawText
 * @param {{ deckId?: string, topicId?: string | null }} [options]
 * @returns {{ cards: import("./contracts.js").Flashcard[], warnings: string[], stats: { totalEntries: number, parsedCount: number, skippedCount: number } }}
 */
export function parseBulkFlashcards(rawText = "", options = {}) {
  const deckId = String(options.deckId || "");
  const topicId = isValidTopicId(options.topicId) ? options.topicId : null;

  const normalizedText = String(rawText || "")
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ");

  const lines = normalizedText.split("\n");
  const rawRecords = [];
  const warnings = [];

  let activeBlock = null;
  let lastField = null;
  let lastSingleRecord = null;
  let lastSingleField = null;

  const flushActiveBlock = () => {
    if (!activeBlock) return;
    const head = extractInlineMeta(activeBlock.frontVi || "");
    const frontVi = head.frontVi;
    const pos = activeBlock.pos ? normalizeVietnamesePos(activeBlock.pos) : head.pos;
    const ipa = activeBlock.ipa
      ? formatIpaDisplay(activeBlock.ipa)
      : head.ipa
        ? formatIpaDisplay(head.ipa)
        : "";
    const definition = String(activeBlock.definition || "").trim();

    if (frontVi && definition) {
      rawRecords.push({
        frontVi,
        pos,
        ipa,
        definition,
        exampleVi: String(activeBlock.exampleVi || "").trim(),
        exampleEn: String(activeBlock.exampleEn || "").trim(),
        notes: String(activeBlock.notes || "").trim(),
      });
    } else if (frontVi || definition) {
      warnings.push(
        `Thiếu ${!frontVi ? "từ vựng" : "định nghĩa"} cho mục "${frontVi || definition}".`
      );
    }
    activeBlock = null;
    lastField = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushActiveBlock();
      lastSingleRecord = null;
      lastSingleField = null;
      continue;
    }

    if (isIgnorablePdfNoiseLine(trimmed)) {
      continue;
    }

    // Check if this is a labeled line (only if it doesn't contain "|" or "\t" with multiple columns)
    const labelMatch =
      !trimmed.includes("|") && !trimmed.includes("\t")
        ? trimmed.match(LABELED_FIELD_REGEX)
        : null;

    if (labelMatch) {
      const field = classifyLabel(labelMatch[1]);
      const value = labelMatch[2].trim();

      if (field) {
        // Attach trailing Ví dụ / Dịch / Ghi chú / Loại từ directly to a preceding single-line card
        if (
          !activeBlock &&
          lastSingleRecord &&
          ["exampleVi", "exampleEn", "notes", "pos"].includes(field)
        ) {
          if (field === "pos") {
            lastSingleRecord.pos = normalizeVietnamesePos(value);
          } else {
            lastSingleRecord[field] = lastSingleRecord[field]
              ? `${lastSingleRecord[field]} ${value}`.replace(/\s+/g, " ").trim()
              : value;
          }
          lastSingleField = field;
          continue;
        }

        lastSingleRecord = null;
        lastSingleField = null;

        if (field === "frontVi" && activeBlock && (activeBlock.frontVi || activeBlock.definition)) {
          flushActiveBlock();
        }
        if (!activeBlock) {
          activeBlock = {
            frontVi: "",
            pos: "",
            ipa: "",
            definition: "",
            exampleVi: "",
            exampleEn: "",
            notes: "",
          };
        }
        activeBlock[field] = activeBlock[field]
          ? `${activeBlock[field]} ${value}`.replace(/\s+/g, " ").trim()
          : value;
        lastField = field;
        continue;
      }
    }

    // Continuation lines for a trailing labeled field attached to a single-line card (e.g. wrapped Ví dụ:)
    if (
      !activeBlock &&
      lastSingleRecord &&
      lastSingleField &&
      !looksLikeNewInlineCard(trimmed)
    ) {
      lastSingleRecord[lastSingleField] = `${lastSingleRecord[lastSingleField]} ${trimmed}`
        .replace(/\s+/g, " ")
        .trim();
      continue;
    }

    // Inside an active labeled block, append wrapped PDF paragraph continuation lines to the previous field
    if (activeBlock && lastField) {
      const blockComplete = Boolean(activeBlock.frontVi && activeBlock.definition);
      const startsNewInline =
        trimmed.includes("|") ||
        trimmed.includes("\t") ||
        (blockComplete && looksLikeNewInlineCard(trimmed));

      if (!startsNewInline) {
        activeBlock[lastField] = `${activeBlock[lastField]} ${trimmed}`
          .replace(/\s+/g, " ")
          .trim();
        continue;
      }
    }

    // Otherwise flush any open labeled block and parse as a single-line entry
    flushActiveBlock();
    lastSingleRecord = null;
    lastSingleField = null;

    const parsed = parseSingleLineFallback(trimmed);
    if (parsed) {
      rawRecords.push(parsed);
      lastSingleRecord = parsed;
    } else {
      // Ignore pure header rows silently
      const cols = trimmed.includes("|")
        ? trimmed.split("|")
        : trimmed.includes("\t")
          ? trimmed.split("\t")
          : [];
      if (!isLikelyHeaderRow(cols)) {
        warnings.push(`Dòng ${i + 1} chưa đúng định dạng: "${trimmed.slice(0, 60)}"`);
      }
    }
  }

  flushActiveBlock();

  // Deduplicate & normalize to canonical Flashcard shape
  const seen = new Set();
  const cards = [];
  let duplicateCount = 0;

  for (let idx = 0; idx < rawRecords.length; idx += 1) {
    const rec = rawRecords[idx];
    const key = rec.frontVi.toLocaleLowerCase("vi");
    if (seen.has(key)) {
      duplicateCount += 1;
      warnings.push(`Trùng từ "${rec.frontVi}" — đã tự động bỏ qua bản lặp.`);
      continue;
    }
    seen.add(key);

    cards.push(
      normalizeFlashcard(
        {
          id: generateId(),
          deckId,
          frontVi: rec.frontVi,
          pos: rec.pos,
          ipa: rec.ipa,
          definition: rec.definition,
          exampleVi: rec.exampleVi,
          exampleEn: rec.exampleEn,
          notes: rec.notes,
          topicId,
          masteryLevel: 0,
          position: cards.length,
        },
        deckId
      )
    );
  }

  return {
    cards,
    warnings,
    stats: {
      totalEntries: rawRecords.length + warnings.length - duplicateCount,
      parsedCount: cards.length,
      skippedCount: warnings.length,
    },
  };
}

export const PDF_FORMAT_EXAMPLES = Object.freeze([
  {
    id: "labeled",
    label: "Khối có nhãn",
    title: "Mẫu 1: Khối có nhãn (Khuyên dùng)",
    badge: "Chuẩn nhất cho Word / Google Docs",
    description:
      "Mỗi thẻ là một nhóm dòng bắt đầu bằng Từ:. Khi xuất PDF, dù định nghĩa hay câu ví dụ tự xuống dòng dài, hệ thống vẫn tự nối lại chính xác.",
    template: [
      "Từ: cân bằng",
      "Loại từ: động từ",
      "Định nghĩa: giữ sự hài hòa, không để một mặt lấn át mặt khác",
      "Ví dụ: Tôi luôn cố gắng cân bằng giữa công việc và thời gian cho gia đình.",
      "Dịch: I always try to balance work and family time.",
      "",
      "Từ: linh hoạt",
      "Loại từ: tính từ",
      "Định nghĩa: dễ thay đổi, thích nghi nhanh với hoàn cảnh thực tế",
      "Ví dụ: Lịch làm việc từ xa giúp tôi sắp xếp thời gian rất linh hoạt.",
      "Ghi chú: Thường dùng cho lịch trình, thời gian hoặc cách làm việc",
      "",
      "Từ: đồng nghiệp",
      "Loại từ: danh từ",
      "Định nghĩa: người cùng làm việc trong một công ty hoặc cơ quan",
      "Ví dụ: Các đồng nghiệp mới ở văn phòng rất thân thiện và cởi mở.",
    ].join("\n"),
  },
  {
    id: "pipe",
    label: "Gạch đứng (|)",
    title: "Mẫu 2: Gạch đứng 1 dòng (|)",
    badge: "Nhanh & gọn",
    description:
      "Mỗi dòng là một thẻ ngăn cách bằng dấu |. Hỗ trợ cả 3 cột (từ | nghĩa | ví dụ) hoặc 4 cột có loại từ, và tự bỏ qua dòng tiêu đề.",
    template: [
      "Từ vựng | Loại từ | Định nghĩa | Ví dụ",
      "hài lòng | tính từ | cảm thấy vừa ý, thỏa mãn với kết quả | Tôi rất hài lòng với chất lượng dịch vụ ở đây.",
      "đậm đà | tính từ | có hương vị rõ nét, hòa quyện và hấp dẫn | Nước dùng bún bò Huế ở quán này rất đậm đà.",
      "thói quen | danh từ | việc làm lặp đi lặp lại hằng ngày | Anh ấy giữ thói quen đi bộ ba mươi phút mỗi sáng.",
    ].join("\n"),
  },
  {
    id: "numbered",
    label: "Giáo trình đánh số",
    title: "Mẫu 3: Danh sách giáo trình (1. 2. 3.)",
    badge: "Giống tài liệu PDF sẵn có",
    description:
      "Phù hợp với tài liệu đánh số 1. 2. 3. hoặc gạch đầu dòng (•) kèm loại từ trong ngoặc và phần VD: ở cuối dòng.",
    template: [
      "1. hào hứng (tính từ): cảm thấy rất vui và mong đợi điều sắp tới - VD: Cả nhóm đều hào hứng với chuyến đi Đà Lạt cuối tuần này.",
      "2. thư giãn (động từ): nghỉ ngơi để tinh thần thoải mái, giảm căng thẳng - VD: Buổi tối tôi thường nghe nhạc nhẹ để thư giãn.",
      "3. trải nghiệm (danh từ): điều trực tiếp làm, chứng kiến và cảm nhận - VD: Du lịch một mình là một trải nghiệm rất đáng nhớ.",
    ].join("\n"),
  },
]);

export const SAMPLE_BULK_TEMPLATE = `hài lòng | tính từ | /haːj˨˩ lɔŋ˨˩/ | cảm thấy vừa ý, thỏa mãn với điều gì đó | Tôi rất hài lòng với món phở ở quán này.
ẩm thực | danh từ | /əm˧˩ tʰɨk˧˨ʔ/ | nghệ thuật nấu nướng và văn hóa ăn uống | Ẩm thực Việt Nam có sự cân bằng tuyệt vời giữa các vị.
thói quen | danh từ | /tʰɔj˧˥ kwɛn˧˧/ | hành động lặp đi lặp lại hằng ngày | Anh ấy có thói quen uống cà phê sữa đá mỗi sáng.
Từ: dễ chịu
Loại từ: tính từ
Định nghĩa: mang lại cảm giác thoải mái, êm dịu
Ví dụ: Thời tiết Đà Lạt buổi tối rất mát mẻ và dễ chịu.`;
