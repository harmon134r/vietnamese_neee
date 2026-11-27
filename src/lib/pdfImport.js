/**
 * Client-side PDF & text extraction for Flashcard Studio.
 * Lazy-loads `pdfjs-dist` and its Web Worker only when a user uploads a PDF,
 * keeping the initial application bundle fast and lean.
 */

export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const SCANNED_PDF_ERROR_VI =
  "File PDF này không có lớp chữ (có thể là ảnh scan). Vui lòng dùng file PDF xuất từ Word / Google Docs / Canva có thể bôi đen chữ.";

let pdfJsLoaderPromise = null;

async function loadPdfJs() {
  if (!pdfJsLoaderPromise) {
    pdfJsLoaderPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ])
      .then(([pdfjs, workerModule]) => {
        const workerUrl = workerModule?.default || workerModule;
        if (pdfjs?.GlobalWorkerOptions && typeof workerUrl === "string" && workerUrl) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        }
        return pdfjs;
      })
      .catch((err) => {
        pdfJsLoaderPromise = null;
        throw err;
      });
  }
  return pdfJsLoaderPromise;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Reconstruct clean line-by-line Vietnamese text from pdf.js textContent items.
 * - Clusters items sharing similar vertical baseline (Y tolerance ~3.5–6pt)
 * - Sorts left-to-right by X and inserts spaces only across real horizontal gaps
 * - Keeps Unicode combining diacritics glued to base characters before NFC normalization
 * - Preserves vertical paragraph breaks as blank lines
 *
 * @param {Array<{ str?: string, transform?: number[], width?: number, height?: number }>} items
 * @returns {string}
 */
export function reconstructPageLines(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";

  const rawItems = [];
  for (const item of items) {
    if (!item || typeof item.str !== "string" || item.str === "") continue;
    const transform = Array.isArray(item.transform) ? item.transform : [1, 0, 0, 12, 0, 0];
    const x = Number(transform[4]) || 0;
    const y = Number(transform[5]) || 0;
    const height = Math.abs(Number(item.height) || Number(transform[3]) || 12) || 12;
    const width = Math.max(0, Number(item.width) || 0);
    rawItems.push({ x, y, width, height, text: item.str });
  }

  if (rawItems.length === 0) return "";

  // Sort top-to-bottom (higher Y first in PDF coordinates), then left-to-right
  rawItems.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 0.5) return b.y - a.y;
    return a.x - b.x;
  });

  // Cluster items into visual lines using adaptive vertical baseline tolerance
  const rows = [];
  for (const entry of rawItems) {
    const current = rows[rows.length - 1];
    const yTolerance = current
      ? Math.max(3.5, Math.min(6, current.height * 0.35))
      : 3.5;

    if (current && Math.abs(entry.y - current.anchorY) <= yTolerance) {
      current.items.push(entry);
      current.height = Math.max(current.height, entry.height);
    } else {
      rows.push({
        anchorY: entry.y,
        height: entry.height,
        items: [entry],
      });
    }
  }

  const reconstructedRows = [];
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    let line = "";
    let lastRight = null;
    const spaceGapThreshold = Math.max(2.2, Math.min(4.5, row.height * 0.16));

    for (const part of row.items) {
      const piece = part.text;
      if (!piece) continue;

      if (lastRight === null) {
        line += piece;
      } else {
        const gap = part.x - lastRight;
        const startsWithCombiningMark = /^\p{M}/u.test(piece);
        if (
          !startsWithCombiningMark &&
          gap >= spaceGapThreshold &&
          !line.endsWith(" ") &&
          !piece.startsWith(" ")
        ) {
          line += " ";
        }
        line += piece;
      }

      const estimatedRight = part.x + part.width;
      lastRight = lastRight === null ? estimatedRight : Math.max(lastRight, estimatedRight);
    }

    const cleanedLine = line
      .normalize("NFC")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    if (cleanedLine) {
      reconstructedRows.push({
        anchorY: row.anchorY,
        height: row.height,
        text: cleanedLine,
      });
    }
  }

  if (reconstructedRows.length === 0) return "";

  // Detect paragraph breaks via vertical spacing between consecutive lines.
  // Compute baseline line-step from normal (non-paragraph) gaps so short pages
  // with 1 normal gap + 1 large paragraph break aren't skewed by the paragraph gap.
  const positiveGaps = [];
  const normalLineGaps = [];
  for (let i = 1; i < reconstructedRows.length; i += 1) {
    const prev = reconstructedRows[i - 1];
    const curr = reconstructedRows[i];
    const dy = prev.anchorY - curr.anchorY;
    if (dy > 1) {
      positiveGaps.push(dy);
      const refHeight = Math.max(prev.height, curr.height, 10);
      if (dy <= refHeight * 2.1) {
        normalLineGaps.push(dy);
      }
    }
  }
  const typicalLineStep =
    normalLineGaps.length > 0
      ? median(normalLineGaps)
      : positiveGaps.length > 0
        ? median(positiveGaps)
        : 0;

  const outputLines = [];
  for (let i = 0; i < reconstructedRows.length; i += 1) {
    const row = reconstructedRows[i];
    if (i > 0) {
      const prev = reconstructedRows[i - 1];
      const dy = prev.anchorY - row.anchorY;
      const refHeight = Math.max(prev.height, row.height, 10);
      const paraThreshold = Math.max(
        typicalLineStep > 0 ? typicalLineStep * 1.45 : refHeight * 1.85,
        refHeight * 1.85
      );
      if (dy > paraThreshold) {
        outputLines.push("");
      }
    }
    outputLines.push(row.text);
  }

  return outputLines.join("\n").normalize("NFC");
}

function isPdfFile(file) {
  if (!file) return false;
  const mime = String(file.type || "").toLowerCase();
  const name = String(file.name || "");
  return mime === "application/pdf" || /\.pdf$/i.test(name);
}

function isTextFile(file) {
  if (!file) return false;
  const mime = String(file.type || "").toLowerCase();
  const name = String(file.name || "");
  return mime.startsWith("text/") || /\.txt$/i.test(name);
}

async function readFileAsBytes(file) {
  if (typeof file.arrayBuffer === "function") {
    return new Uint8Array(await file.arrayBuffer());
  }
  if (typeof Response !== "undefined") {
    return new Uint8Array(await new Response(file).arrayBuffer());
  }
  throw new Error("Trình duyệt không hỗ trợ đọc dữ liệu file này.");
}

async function readFileAsUtf8Text(file) {
  if (typeof file.text === "function") {
    return await file.text();
  }
  if (typeof Response !== "undefined") {
    return await new Response(file).text();
  }
  throw new Error("Trình duyệt không hỗ trợ đọc nội dung file văn bản này.");
}

/**
 * Derive a tidy default deck name from an uploaded PDF/TXT filename.
 * @param {string} filename
 * @returns {string}
 */
export function suggestDeckTitleFromFilename(filename = "") {
  const base = String(filename || "")
    .normalize("NFC")
    .replace(/\.(pdf|txt)$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "";
  return base.length > 80 ? base.slice(0, 80).trim() : base;
}

/**
 * Extract selectable Vietnamese text from a PDF File in the browser.
 *
 * @param {File} file
 * @param {(progressPct: number) => void} [onProgress]
 * @returns {Promise<{ text: string, pageCount: number, isEmpty: boolean, error: string }>}
 */
export async function extractTextFromPdf(file, onProgress) {
  if (!isPdfFile(file)) {
    throw new Error("Vui lòng chọn đúng file PDF (.pdf).");
  }
  if (typeof file.size === "number" && file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("File PDF cần nhỏ hơn 20 MB để xử lý mượt trên trình duyệt.");
  }

  let pdf = null;
  try {
    const bytes = await readFileAsBytes(file);
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({ data: bytes });
    pdf = await loadingTask.promise;

    const totalPages = Math.max(0, Number(pdf.numPages) || 0);
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageLineText = reconstructPageLines(textContent?.items || []);
      if (pageLineText) {
        pageTexts.push(pageLineText);
      }
      if (typeof onProgress === "function" && totalPages > 0) {
        onProgress(Math.round((pageNumber / totalPages) * 100));
      }
    }

    const text = pageTexts.join("\n\n").normalize("NFC").trim();
    const isEmpty = text.length === 0;
    return {
      text,
      pageCount: totalPages,
      isEmpty,
      error: isEmpty ? SCANNED_PDF_ERROR_VI : "",
    };
  } catch (err) {
    const name = String(err?.name || "");
    const message = String(err?.message || "");

    if (name === "PasswordException" || /password/i.test(message)) {
      throw new Error(
        "File PDF này đang được đặt mật khẩu bảo vệ. Vui lòng bỏ mật khẩu rồi tải lại."
      );
    }
    if (name === "InvalidPDFException" || /invalid pdf/i.test(message)) {
      throw new Error(
        "File PDF bị lỗi hoặc không đúng định dạng chuẩn. Vui lòng xuất lại file PDF mới rồi thử lại."
      );
    }
    if (err instanceof Error && /Vui lòng|File PDF|Trình duyệt/i.test(err.message)) {
      throw err;
    }
    throw new Error("Không thể đọc file PDF này. Vui lòng thử lại với file PDF khác.");
  } finally {
    if (pdf && typeof pdf.destroy === "function") {
      try {
        await pdf.destroy();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

/**
 * Extract text from either a `.pdf` or `.txt` upload file for Flashcard Creator.
 *
 * @param {File} file
 * @param {(progressPct: number) => void} [onProgress]
 * @returns {Promise<{ text: string, pageCount: number, isEmpty: boolean, error: string, fileType: "pdf" | "txt" }>}
 */
export async function extractTextFromStudyFile(file, onProgress) {
  if (!file) {
    throw new Error("Vui lòng chọn file PDF (.pdf) hoặc văn bản (.txt).");
  }
  if (isPdfFile(file)) {
    const result = await extractTextFromPdf(file, onProgress);
    return { ...result, fileType: "pdf" };
  }
  if (isTextFile(file)) {
    if (typeof file.size === "number" && file.size > MAX_PDF_SIZE_BYTES) {
      throw new Error("File văn bản cần nhỏ hơn 20 MB.");
    }
    const raw = await readFileAsUtf8Text(file);
    if (typeof onProgress === "function") onProgress(100);
    const text = String(raw || "").normalize("NFC").trim();
    const isEmpty = text.length === 0;
    return {
      text,
      pageCount: 1,
      isEmpty,
      error: isEmpty ? "File văn bản này đang trống. Vui lòng kiểm tra lại nội dung." : "",
      fileType: "txt",
    };
  }
  throw new Error("Chỉ hỗ trợ file PDF (.pdf) hoặc file văn bản (.txt).");
}
