/**
 * Vietnamese Phonology, 6-Tone Analysis, Pronunciation Scorer & Dialogue Intent Matcher.
 * Designed for adult Pre-Intermediate (A2-B1) Vietnamese learners.
 */

/** @typedef {"ngang" | "huyen" | "sac" | "hoi" | "nga" | "nang"} ToneId */

/** @type {readonly ToneId[]} */
export const TONE_ORDER = Object.freeze([
  "ngang",
  "huyen",
  "sac",
  "hoi",
  "nga",
  "nang",
]);

/**
 * Metadata for the 6 tones of Standard Vietnamese.
 * @type {Readonly<Record<ToneId, {
 *   id: ToneId,
 *   nameVi: string,
 *   shortVi: string,
 *   markNameVi: string,
 *   symbol: string,
 *   contour: string,
 *   example: string,
 *   exampleMeaningVi: string,
 *   tipVi: string,
 *   color: string,
 * }>>}
 */
export const VIETNAMESE_TONES = Object.freeze({
  ngang: {
    id: "ngang",
    nameVi: "Thanh ngang",
    shortVi: "Ngang",
    markNameVi: "Không dấu",
    symbol: "—",
    contour: "33",
    example: "ma",
    exampleMeaningVi: "con ma",
    tipVi: "Giữ giọng ngang, đều và thoải mái ở tầm trung, không lên cũng không xuống.",
    color: "#94a3b8",
  },
  huyen: {
    id: "huyen",
    nameVi: "Thanh huyền",
    shortVi: "Huyền",
    markNameVi: "Dấu huyền (`)",
    symbol: "↘",
    contour: "21",
    example: "mà",
    exampleMeaningVi: "nhưng mà",
    tipVi: "Hạ giọng nhẹ nhàng, trầm và thư giãn xuống thấp như khi thở nhẹ.",
    color: "#38bdf8",
  },
  sac: {
    id: "sac",
    nameVi: "Thanh sắc",
    shortVi: "Sắc",
    markNameVi: "Dấu sắc (´)",
    symbol: "↗",
    contour: "35",
    example: "má",
    exampleMeaningVi: "đôi má / mẹ",
    tipVi: "Đẩy giọng vút lên cao, sáng và dứt khoát từ tầm trung lên cao.",
    color: "#34d399",
  },
  hoi: {
    id: "hoi",
    nameVi: "Thanh hỏi",
    shortVi: "Hỏi",
    markNameVi: "Dấu hỏi (̉)",
    symbol: "↘↗",
    contour: "313",
    example: "mả",
    exampleMeaningVi: "ngôi mả",
    tipVi: "Hạ giọng xuống sâu ở cổ họng rồi nhích nhẹ lên ở cuối âm tiết.",
    color: "#fbbf24",
  },
  nga: {
    id: "nga",
    nameVi: "Thanh ngã",
    shortVi: "Ngã",
    markNameVi: "Dấu ngã (~)",
    symbol: "↗⚡↗",
    contour: "3ʔ5",
    example: "mã",
    exampleMeaningVi: "mã số",
    tipVi: "Đọc lên cao có độ ngắt nhẹ (thanh hầu) ở giữa âm tiết rồi vút mạnh lên.",
    color: "#a78bfa",
  },
  nang: {
    id: "nang",
    nameVi: "Thanh nặng",
    shortVi: "Nặng",
    markNameVi: "Dấu nặng (.)",
    symbol: "⬇",
    contour: "21ʔ",
    example: "mạ",
    exampleMeaningVi: "cây mạ",
    tipVi: "Rơi giọng thật thấp, ngắn và dừng gọn dứt khoát.",
    color: "#fb7185",
  },
});

// Combining diacritical marks representing the 5 marked tones in Unicode NFD
const TONE_MARKS_REGEX = /[\u0300\u0301\u0309\u0303\u0323]/g;
const ALL_COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;

const COMBINING_TO_TONE = Object.freeze({
  "\u0300": "huyen", // COMBINING GRAVE ACCENT
  "\u0301": "sac",   // COMBINING ACUTE ACCENT
  "\u0309": "hoi",   // COMBINING HOOK ABOVE
  "\u0303": "nga",   // COMBINING TILDE
  "\u0323": "nang",  // COMBINING DOT BELOW
});

/**
 * Extract the Vietnamese tone of a syllable (handles all NFC/NFD vowel combinations
 * including `ă`, `â`, `ê`, `ô`, `ơ`, `ư` and diphthongs/triphthongs).
 *
 * @param {string} syllable
 * @returns {ToneId}
 */
export function extractVietnameseTone(syllable) {
  const decomposed = String(syllable || "").normalize("NFD");
  for (let i = 0; i < decomposed.length; i += 1) {
    const tone = COMBINING_TO_TONE[decomposed[i]];
    if (tone) return tone;
  }
  return "ngang";
}

/**
 * Remove ONLY the 5 Vietnamese tone marks while preserving vowel quality
 * letters (`ă`, `â`, `ê`, `ô`, `ơ`, `ư`) and `đ`/`Đ`.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripVietnameseTones(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(TONE_MARKS_REGEX, "")
    .normalize("NFC");
}

/**
 * Remove all Vietnamese tones, vowel diacritics, and convert `đ`/`Đ` to `d`/`D`.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripAllDiacritics(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(ALL_COMBINING_MARKS_REGEX, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFC");
}

/**
 * Normalize Vietnamese text for fair comparison:
 * NFC Unicode, lowercase, strip punctuation, collapse whitespace.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeVietnameseText(text) {
  return String(text || "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compute Levenshtein edit distance between two short strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshteinDistance(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j += 1) prev[j] = j;

  for (let i = 1; i <= m; i += 1) {
    curr[0] = i;
    const chA = a[i - 1];
    for (let j = 1; j <= n; j += 1) {
      const cost = chA === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[n];
}

/**
 * Classify similarity between an expected Vietnamese syllable and a spoken syllable.
 * Handles old vs new Vietnamese tone placement equivalence (e.g., `hòa` == `hoà`, `khỏe` == `khoẻ`).
 *
 * @param {string} expected
 * @param {string} spoken
 * @returns {{ status: "exact" | "tone-mismatch" | "close" | "mismatch", dpScore: number, expectedTone: ToneId, spokenTone: ToneId }}
 */
function compareSyllables(expected, spoken) {
  const expectedTone = extractVietnameseTone(expected);
  const spokenTone = extractVietnameseTone(spoken);
  const expNoTone = stripVietnameseTones(expected);
  const spkNoTone = stripVietnameseTones(spoken);

  // 1. Exact syllable + exact tone (also matches old/new tone placement like hòa vs hoà)
  if (expected === spoken || (expNoTone === spkNoTone && expectedTone === spokenTone)) {
    return { status: "exact", dpScore: 3.0, expectedTone, spokenTone };
  }

  // 2. Same toneless Vietnamese base syllable, wrong tone (e.g., ma vs má, mới vs mời)
  if (expNoTone === spkNoTone) {
    return { status: "tone-mismatch", dpScore: 2.1, expectedTone, spokenTone };
  }

  // 3. Close match: identical after stripping all diacritics (e.g., cơm vs cảm, ăn vs an),
  //    or high character similarity on stripped forms (e.g., bánh vs bệnh, người vs ngồi)
  const expPlain = stripAllDiacritics(expected);
  const spkPlain = stripAllDiacritics(spoken);

  if (expPlain === spkPlain) {
    return { status: "close", dpScore: 1.5, expectedTone, spokenTone };
  }

  const maxLen = Math.max(expPlain.length, spkPlain.length);
  if (maxLen >= 2) {
    const dist = levenshteinDistance(expPlain, spkPlain);
    const charSim = 1 - dist / maxLen;
    if (charSim >= 0.65 || (maxLen === 2 && dist === 1 && expectedTone === spokenTone)) {
      return { status: "close", dpScore: 1.2, expectedTone, spokenTone };
    }
  }

  return { status: "mismatch", dpScore: -1.6, expectedTone, spokenTone };
}

/**
 * Align expected and spoken word sequences using dynamic programming (Needleman-Wunsch)
 * so extra filler words or skipped words do not cascade-misalign subsequent syllables.
 *
 * @param {string[]} expectedWords
 * @param {string[]} spokenWords
 * @returns {{ wordDiffs: Array<{ expected: string, spoken: string | null, status: "exact" | "tone-mismatch" | "close" | "missed", expectedTone: ToneId, spokenTone: ToneId | null }>, extraCount: number }}
 */
function alignWordSequences(expectedWords, spokenWords) {
  const n = expectedWords.length;
  const m = spokenWords.length;

  const GAP_DELETE_EXPECTED = -0.8; // expected word missed
  const GAP_INSERT_SPOKEN = -0.5;   // extra filler word spoken

  const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const trace = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  // trace codes: 1 = diag (pair), 2 = up (skip expected / missed), 3 = left (extra spoken)

  for (let i = 1; i <= n; i += 1) {
    dp[i][0] = i * GAP_DELETE_EXPECTED;
    trace[i][0] = 2;
  }
  for (let j = 1; j <= m; j += 1) {
    dp[0][j] = j * GAP_INSERT_SPOKEN;
    trace[0][j] = 3;
  }

  const cmpCache = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (__, j) => compareSyllables(expectedWords[i], spokenWords[j]))
  );

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const pairVal = dp[i - 1][j - 1] + cmpCache[i - 1][j - 1].dpScore;
      const upVal = dp[i - 1][j] + GAP_DELETE_EXPECTED;
      const leftVal = dp[i][j - 1] + GAP_INSERT_SPOKEN;

      if (pairVal >= upVal && pairVal >= leftVal) {
        dp[i][j] = pairVal;
        trace[i][j] = 1;
      } else if (upVal >= leftVal) {
        dp[i][j] = upVal;
        trace[i][j] = 2;
      } else {
        dp[i][j] = leftVal;
        trace[i][j] = 3;
      }
    }
  }

  // Backtrack
  const diffsReversed = [];
  let extraCount = 0;
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    const move = trace[i][j];
    if (i > 0 && j > 0 && move === 1) {
      const cmp = cmpCache[i - 1][j - 1];
      if (cmp.status === "mismatch") {
        diffsReversed.push({
          expected: expectedWords[i - 1],
          spoken: spokenWords[j - 1],
          status: "missed",
          expectedTone: cmp.expectedTone,
          spokenTone: cmp.spokenTone,
        });
      } else {
        diffsReversed.push({
          expected: expectedWords[i - 1],
          spoken: spokenWords[j - 1],
          status: cmp.status,
          expectedTone: cmp.expectedTone,
          spokenTone: cmp.spokenTone,
        });
      }
      i -= 1;
      j -= 1;
    } else if (i > 0 && (j === 0 || move === 2)) {
      const expWord = expectedWords[i - 1];
      diffsReversed.push({
        expected: expWord,
        spoken: null,
        status: "missed",
        expectedTone: extractVietnameseTone(expWord),
        spokenTone: null,
      });
      i -= 1;
    } else {
      extraCount += 1;
      j -= 1;
    }
  }

  return {
    wordDiffs: diffsReversed.reverse(),
    extraCount,
  };
}

/**
 * Build concise, actionable Vietnamese pronunciation feedback from word diffs.
 * @param {number} score
 * @param {Array<{ expected: string, spoken: string | null, status: string, expectedTone: ToneId, spokenTone: ToneId | null }>} wordDiffs
 * @returns {string}
 */
function buildFeedbackVi(score, wordDiffs) {
  const toneIssues = wordDiffs.filter((d) => d.status === "tone-mismatch");
  const closeIssues = wordDiffs.filter((d) => d.status === "close");
  const missedIssues = wordDiffs.filter((d) => d.status === "missed");

  if (score >= 90 && toneIssues.length === 0 && missedIssues.length === 0) {
    return "Xuất sắc! Bạn phát âm rất tự nhiên và chuẩn thanh điệu.";
  }

  const notes = [];

  if (toneIssues.length > 0) {
    const sample = toneIssues
      .slice(0, 2)
      .map((d) => {
        const expLabel = VIETNAMESE_TONES[d.expectedTone]?.nameVi.toLowerCase() || d.expectedTone;
        const spkLabel = d.spokenTone
          ? VIETNAMESE_TONES[d.spokenTone]?.nameVi.toLowerCase() || d.spokenTone
          : "";
        return `"${d.expected}" (cần ${expLabel}${spkLabel ? `, bạn đọc ${spkLabel}` : ""})`;
      })
      .join(", ");
    notes.push(`Chú ý thanh điệu ở từ ${sample}.`);
  }

  if (closeIssues.length > 0) {
    const sample = closeIssues
      .slice(0, 2)
      .map((d) => `"${d.expected}"`)
      .join(", ");
    notes.push(`Cần phát âm rõ nguyên âm/phụ âm hơn ở từ ${sample}.`);
  }

  if (missedIssues.length > 0) {
    if (missedIssues.length === wordDiffs.length) {
      return "Chưa khớp với câu mẫu. Hãy nghe lại âm thanh chuẩn và đọc chậm từng từ nhé.";
    }
    const sample = missedIssues
      .slice(0, 2)
      .map((d) => `"${d.expected}"`)
      .join(", ");
    notes.push(`Bạn bỏ sót hoặc đọc chưa rõ từ ${sample}.`);
  }

  if (score >= 72) {
    return `Khá tốt! ${notes.join(" ")}`.trim();
  }
  if (score >= 50) {
    return `Gần đúng rồi! ${notes.join(" ")}`.trim();
  }
  return `Thử lại nhé! ${notes.join(" ")}`.trim();
}

/**
 * Score a learner's spoken Vietnamese transcript against an expected Vietnamese target.
 *
 * @param {string} expectedVi
 * @param {string} spokenVi
 * @returns {{
 *   score: number,
 *   rating: "excellent" | "good" | "fair" | "retry",
 *   toneAccuracy: number,
 *   wordAccuracy: number,
 *   feedbackVi: string,
 *   expectedNormalized: string,
 *   spokenNormalized: string,
 *   wordDiffs: Array<{
 *     expected: string,
 *     spoken: string | null,
 *     status: "exact" | "tone-mismatch" | "close" | "missed",
 *     expectedTone: ToneId,
 *     spokenTone: ToneId | null,
 *   }>,
 * }}
 */
export function scoreVietnamesePronunciation(expectedVi, spokenVi) {
  const expectedNormalized = normalizeVietnameseText(expectedVi);
  const spokenNormalized = normalizeVietnameseText(spokenVi);

  if (!expectedNormalized) {
    return {
      score: 0,
      rating: "retry",
      toneAccuracy: 0,
      wordAccuracy: 0,
      feedbackVi: "Không có văn bản mẫu để chấm điểm.",
      expectedNormalized: "",
      spokenNormalized,
      wordDiffs: [],
    };
  }

  const expectedWords = expectedNormalized.split(" ").filter(Boolean);
  const spokenWords = spokenNormalized ? spokenNormalized.split(" ").filter(Boolean) : [];

  if (spokenWords.length === 0) {
    const wordDiffs = expectedWords.map((word) => ({
      expected: word,
      spoken: null,
      status: /** @type {const} */ ("missed"),
      expectedTone: extractVietnameseTone(word),
      spokenTone: null,
    }));

    return {
      score: 0,
      rating: "retry",
      toneAccuracy: 0,
      wordAccuracy: 0,
      feedbackVi: "Chưa ghi nhận được giọng nói. Hãy bấm micro và đọc rõ câu mẫu nhé.",
      expectedNormalized,
      spokenNormalized: "",
      wordDiffs,
    };
  }

  const { wordDiffs, extraCount } = alignWordSequences(expectedWords, spokenWords);

  let wordPoints = 0;
  let tonePoints = 0;

  for (const diff of wordDiffs) {
    if (diff.status === "exact") {
      wordPoints += 1;
      tonePoints += 1;
    } else if (diff.status === "tone-mismatch") {
      wordPoints += 0.6;
      tonePoints += 0;
    } else if (diff.status === "close") {
      wordPoints += 0.5;
      tonePoints += diff.expectedTone === diff.spokenTone ? 0.85 : 0.2;
    }
  }

  const wordAccuracy = Math.round((wordPoints / expectedWords.length) * 100);
  const toneAccuracy = Math.round((tonePoints / expectedWords.length) * 100);

  // Allow 1-2 natural conversational fillers ("ờ", "dạ", "vâng") without harsh penalty
  const allowedExtras = expectedWords.length >= 3 ? 2 : 1;
  const excessExtras = Math.max(0, extraCount - allowedExtras);
  const extraPenalty = Math.min(15, excessExtras * 4);

  const rawScore = wordAccuracy * 0.65 + toneAccuracy * 0.35 - extraPenalty;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  /** @type {"excellent" | "good" | "fair" | "retry"} */
  let rating = "retry";
  if (score >= 90) rating = "excellent";
  else if (score >= 72) rating = "good";
  else if (score >= 50) rating = "fair";

  return {
    score,
    rating,
    toneAccuracy,
    wordAccuracy,
    feedbackVi: buildFeedbackVi(score, wordDiffs),
    expectedNormalized,
    spokenNormalized,
    wordDiffs,
  };
}

/**
 * Compute keyword match score (0..100) for a spoken Vietnamese utterance.
 * @param {string} spokenNormalized
 * @param {string[]} keywords
 * @returns {number}
 */
function scoreKeywords(spokenNormalized, keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0 || !spokenNormalized) return 0;

  const spokenNoTone = stripVietnameseTones(spokenNormalized);
  const spokenPlain = stripAllDiacritics(spokenNormalized);

  let matchedPoints = 0;
  let validKeywords = 0;

  for (const kw of keywords) {
    const normKw = normalizeVietnameseText(kw);
    if (!normKw) continue;
    validKeywords += 1;

    if (spokenNormalized.includes(normKw)) {
      matchedPoints += 1;
    } else if (spokenNoTone.includes(stripVietnameseTones(normKw))) {
      matchedPoints += 0.8;
    } else if (spokenPlain.includes(stripAllDiacritics(normKw))) {
      matchedPoints += 0.65;
    }
  }

  if (validKeywords === 0) return 0;
  return Math.round((matchedPoints / validKeywords) * 100);
}

/**
 * Match a learner's spoken Vietnamese response against candidate dialogue branches.
 *
 * @param {string} spokenVi
 * @param {Array<{ id: string, textVi: string, keywords?: string[] }>} options
 * @returns {{
 *   bestOptionId: string | null,
 *   bestScore: number,
 *   evaluation: ReturnType<typeof scoreVietnamesePronunciation> | null,
 * }}
 */
export function matchDialogueIntent(spokenVi, options = []) {
  const spokenNormalized = normalizeVietnameseText(spokenVi);
  if (!spokenNormalized || !Array.isArray(options) || options.length === 0) {
    return {
      bestOptionId: null,
      bestScore: 0,
      evaluation: null,
    };
  }

  let bestOptionId = null;
  let bestCombinedScore = -1;
  let bestEval = null;

  for (const option of options) {
    if (!option || !option.id) continue;
    const evaluation = scoreVietnamesePronunciation(option.textVi || "", spokenVi);
    const hasKeywords = Array.isArray(option.keywords) && option.keywords.length > 0;
    const kwScore = hasKeywords ? scoreKeywords(spokenNormalized, option.keywords) : 0;

    // Reward both faithful reading of the suggested sentence AND natural paraphrasing hitting keywords
    const combinedScore = hasKeywords
      ? Math.round(
          Math.max(
            evaluation.score,
            evaluation.score * 0.55 + kwScore * 0.45,
            kwScore >= 60 ? Math.min(95, kwScore * 0.75 + evaluation.score * 0.25) : 0
          )
        )
      : evaluation.score;

    if (
      combinedScore > bestCombinedScore ||
      (combinedScore === bestCombinedScore &&
        bestEval &&
        evaluation.score > bestEval.score)
    ) {
      bestCombinedScore = combinedScore;
      bestOptionId = option.id;
      bestEval = evaluation;
    }
  }

  if (bestCombinedScore <= 0) {
    return {
      bestOptionId: null,
      bestScore: 0,
      evaluation: bestEval,
    };
  }

  return {
    bestOptionId,
    bestScore: Math.min(100, Math.max(0, bestCombinedScore)),
    evaluation: bestEval,
  };
}
