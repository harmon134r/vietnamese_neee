import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Copy,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { TOPIC_IDS, TOPIC_META } from "../../lib/contracts.js";
import { APP_ART } from "../../data/illustrations.js";
import * as speechApi from "../../lib/speech.js";
import {
  PDF_FORMAT_EXAMPLES,
  VIETNAMESE_POS_OPTIONS,
  parseBulkFlashcards,
} from "../../lib/flashcardParser.js";
import {
  SCANNED_PDF_ERROR_VI,
  extractTextFromStudyFile,
  suggestDeckTitleFromFilename,
} from "../../lib/pdfImport.js";

const NEW_DECK_VALUE = "__new__";

const CREATOR_SAMPLE_BULK_TEMPLATE = `hài lòng | tính từ | cảm thấy vừa ý, thỏa mãn với điều gì đó | Tôi rất hài lòng với món phở ở quán này.
ẩm thực | danh từ | nghệ thuật nấu nướng và văn hóa ăn uống | Ẩm thực Việt Nam có sự cân bằng tuyệt vời giữa các vị.
thói quen | danh từ | hành động lặp đi lặp lại hằng ngày | Anh ấy có thói quen uống cà phê sữa đá mỗi sáng.
Từ: dễ chịu
Loại từ: tính từ
Định nghĩa: mang lại cảm giác thoải mái, êm dịu
Ví dụ: Thời tiết Đà Lạt buổi tối rất mát mẻ và dễ chịu.`;

const EMPTY_SINGLE_FORM = {
  frontVi: "",
  pos: "danh từ",
  definition: "",
  exampleVi: "",
  exampleEn: "",
  notes: "",
};

async function copyTextToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  if (typeof document !== "undefined") {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      return true;
    } finally {
      document.body.removeChild(area);
    }
  }
  return false;
}

export function FlashcardCreator({
  decks = [],
  activeDeckId = "",
  defaultNewDeck = false,
  initialSubTab = "single",
  isTeacher = false,
  teacherName = "",
  onCreateDeck,
  onUpdateDeck,
  onAddCard,
  onAddCardsBulk,
  onCreatedAndStudy,
}) {
  const editableDecks = useMemo(
    () => decks.filter((d) => d.canEdit !== false),
    [decks]
  );

  const [subTab, setSubTab] = useState(initialSubTab || "single"); // "single" | "bulk" | "pdf"
  const [targetDeckId, setTargetDeckId] = useState(() => {
    if (defaultNewDeck || editableDecks.length === 0) return NEW_DECK_VALUE;
    const activeEditable = editableDecks.find((d) => d.id === activeDeckId);
    return activeEditable ? activeEditable.id : editableDecks[0]?.id || NEW_DECK_VALUE;
  });
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckTopicId, setNewDeckTopicId] = useState("");
  const [assignToStudents, setAssignToStudents] = useState(Boolean(isTeacher));

  // Single card form state
  const [form, setForm] = useState(EMPTY_SINGLE_FORM);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk paste state
  const [bulkText, setBulkText] = useState("");
  const [editableBulkCards, setEditableBulkCards] = useState([]);
  const [bulkWarnings, setBulkWarnings] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");

  // PDF upload state
  const pdfInputRef = useRef(null);
  const copyTimerRef = useRef(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfFileMeta, setPdfFileMeta] = useState(null); // { name, pageCount, fileType } | null
  const [pdfRawText, setPdfRawText] = useState("");
  const [showPdfRawText, setShowPdfRawText] = useState(false);
  const [editablePdfCards, setEditablePdfCards] = useState([]);
  const [pdfWarnings, setPdfWarnings] = useState([]);
  const [pdfError, setPdfError] = useState("");
  const [pdfSuccess, setPdfSuccess] = useState("");
  const [pdfSuggestedDeckHint, setPdfSuggestedDeckHint] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState(PDF_FORMAT_EXAMPLES[0]?.id || "labeled");
  const [showPdfGuide, setShowPdfGuide] = useState(true);
  const [copiedGuideId, setCopiedGuideId] = useState("");

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (isTeacher) {
      setAssignToStudents(true);
    }
  }, [isTeacher]);

  useEffect(() => {
    if (defaultNewDeck) {
      setTargetDeckId(NEW_DECK_VALUE);
    } else if (targetDeckId !== NEW_DECK_VALUE) {
      const exists = editableDecks.some((d) => d.id === targetDeckId);
      if (!exists) {
        const activeEditable = editableDecks.find((d) => d.id === activeDeckId);
        setTargetDeckId(activeEditable?.id || editableDecks[0]?.id || NEW_DECK_VALUE);
      }
    }
  }, [defaultNewDeck, activeDeckId, editableDecks, targetDeckId]);

  const resolvedTopicId = useMemo(() => {
    const selectedDeck = editableDecks.find((d) => d.id === targetDeckId);
    return targetDeckId === NEW_DECK_VALUE
      ? newDeckTopicId || null
      : selectedDeck?.topicId || null;
  }, [editableDecks, targetDeckId, newDeckTopicId]);

  const parsedBulk = useMemo(() => {
    if (!bulkText.trim()) return { cards: [], warnings: [] };
    return parseBulkFlashcards(bulkText, {
      deckId: targetDeckId === NEW_DECK_VALUE ? "" : targetDeckId,
      topicId: resolvedTopicId,
    });
  }, [bulkText, targetDeckId, resolvedTopicId]);

  useEffect(() => {
    setEditableBulkCards(parsedBulk.cards);
    setBulkWarnings(parsedBulk.warnings);
  }, [parsedBulk]);

  const parsedPdf = useMemo(() => {
    if (!pdfRawText.trim()) return { cards: [], warnings: [] };
    return parseBulkFlashcards(pdfRawText, {
      deckId: targetDeckId === NEW_DECK_VALUE ? "" : targetDeckId,
      topicId: resolvedTopicId,
    });
  }, [pdfRawText, targetDeckId, resolvedTopicId]);

  useEffect(() => {
    setEditablePdfCards(parsedPdf.cards);
    setPdfWarnings(parsedPdf.warnings);
  }, [parsedPdf]);

  const isCreatingNewDeck = targetDeckId === NEW_DECK_VALUE || editableDecks.length === 0;
  const activeGuide = useMemo(
    () => PDF_FORMAT_EXAMPLES.find((ex) => ex.id === activeGuideId) || PDF_FORMAT_EXAMPLES[0],
    [activeGuideId]
  );

  const prefetchCreatedCards = (savedCards) => {
    if (typeof speechApi.prefetchVietnamese !== "function") return;
    const texts = (Array.isArray(savedCards) ? savedCards : [])
      .slice(0, 4)
      .map((c) => c?.frontVi)
      .filter(Boolean);
    if (texts.length > 0) {
      speechApi.prefetchVietnamese(texts);
    }
  };

  const resolveDeckAndSaveCards = async (cardsToSave, { openStudyAfter = false } = {}) => {
    if (isCreatingNewDeck) {
      const cleanTitle = newDeckTitle.trim();
      if (!cleanTitle) {
        throw new Error("Vui lòng nhập tên bộ thẻ mới.");
      }
      const topicId = newDeckTopicId || null;
      const color = topicId && TOPIC_META[topicId] ? TOPIC_META[topicId].accent : "#d97757";
      const teacherPayload = isTeacher
        ? {
            isAssigned: Boolean(assignToStudents),
            teacherName: assignToStudents ? teacherName || "Giáo viên" : "",
          }
        : {};
      const createdDeck = await onCreateDeck?.({
        title: cleanTitle,
        description: `Bộ thẻ tự tạo (${cardsToSave.length} thẻ)`,
        topicId,
        color,
        ...teacherPayload,
        cards: cardsToSave.map((c) => ({ ...c, topicId: c.topicId || topicId })),
      });
      const resolvedDeckId = createdDeck?.id || "";
      if (resolvedDeckId) {
        setTargetDeckId(resolvedDeckId);
        setNewDeckTitle("");
      }
      prefetchCreatedCards(cardsToSave);
      if (openStudyAfter) {
        onCreatedAndStudy?.(resolvedDeckId, 0);
      }
      return { deckId: resolvedDeckId, count: cardsToSave.length };
    }

    const deck = editableDecks.find((d) => d.id === targetDeckId) || editableDecks[0];
    if (!deck) {
      throw new Error("Vui lòng chọn hoặc tạo một bộ thẻ trước.");
    }

    const prevCount = deck.cards?.length || 0;
    const enriched = cardsToSave.map((c) => ({
      ...c,
      topicId: c.topicId || deck.topicId || null,
    }));

    if (enriched.length === 1 && onAddCard) {
      await onAddCard(deck.id, enriched[0]);
    } else if (onAddCardsBulk) {
      await onAddCardsBulk(deck.id, enriched);
    } else if (onAddCard) {
      for (const item of enriched) {
        await onAddCard(deck.id, item);
      }
    }

    if (isTeacher && assignToStudents && !deck.isAssigned && onUpdateDeck) {
      await onUpdateDeck(deck.id, {
        isAssigned: true,
        teacherName: teacherName || deck.teacherName || "Giáo viên",
      });
    }

    prefetchCreatedCards(enriched);
    if (openStudyAfter) {
      onCreatedAndStudy?.(deck.id, prevCount);
    }
    return { deckId: deck.id, count: enriched.length };
  };

  const handleSingleSubmit = async (e, openStudyAfter = false) => {
    e?.preventDefault?.();
    setFormError("");
    setFormSuccess("");

    const frontVi = form.frontVi.trim();
    const definition = form.definition.trim();
    if (!frontVi) {
      setFormError("Vui lòng nhập từ vựng hoặc cụm từ tiếng Việt.");
      return;
    }
    if (!definition) {
      setFormError("Vui lòng nhập định nghĩa cho từ vựng này.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cardPayload = {
        frontVi,
        pos: form.pos.trim(),
        ipa: "",
        definition,
        exampleVi: form.exampleVi.trim(),
        exampleEn: form.exampleEn.trim(),
        notes: form.notes.trim(),
      };
      await resolveDeckAndSaveCards([cardPayload], { openStudyAfter });
      setForm(EMPTY_SINGLE_FORM);
      if (!openStudyAfter) {
        setFormSuccess(`Đã lưu thẻ "${frontVi}". Bạn có thể nhập tiếp từ mới.`);
      }
    } catch (err) {
      setFormError(err?.message || "Không thể lưu thẻ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkRowChange = (index, field, value) => {
    setEditableBulkCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    );
  };

  const handleBulkRowRemove = (index) => {
    setEditableBulkCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async (openStudyAfter = true) => {
    setBulkError("");
    setBulkSuccess("");

    const validCards = editableBulkCards
      .map((c) => ({
        frontVi: String(c.frontVi || "").trim(),
        pos: String(c.pos || "").trim(),
        ipa: "",
        definition: String(c.definition || "").trim(),
        exampleVi: String(c.exampleVi || "").trim(),
        exampleEn: String(c.exampleEn || "").trim(),
        notes: String(c.notes || "").trim(),
      }))
      .filter((c) => c.frontVi && c.definition);

    if (validCards.length === 0) {
      setBulkError("Chưa có thẻ hợp lệ. Hãy dán danh sách từ vựng kèm định nghĩa vào ô phía trên.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resolveDeckAndSaveCards(validCards, { openStudyAfter });
      setBulkText("");
      setEditableBulkCards([]);
      setBulkWarnings([]);
      if (!openStudyAfter) {
        setBulkSuccess(`Đã lưu ${res.count} thẻ vào bộ thẻ.`);
      }
    } catch (err) {
      setBulkError(err?.message || "Không thể tạo hàng loạt thẻ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PDF Upload Handlers ---
  const handlePdfFile = async (file) => {
    if (!file) return;
    setPdfError("");
    setPdfSuccess("");
    setPdfLoading(true);
    setPdfProgress(0);
    setPdfSuggestedDeckHint(false);

    try {
      const result = await extractTextFromStudyFile(file, (pct) => setPdfProgress(pct));
      setPdfFileMeta({
        name: file.name,
        pageCount: result.pageCount || 1,
        fileType: result.fileType || "pdf",
      });

      if (result.isEmpty) {
        setPdfRawText("");
        setShowPdfRawText(false);
        setPdfError(result.error || SCANNED_PDF_ERROR_VI);
        return;
      }

      setPdfRawText(result.text);

      // Suggest a clean new deck named after the uploaded file
      const suggestedTitle = suggestDeckTitleFromFilename(file.name);
      if (suggestedTitle) {
        setTargetDeckId(NEW_DECK_VALUE);
        setNewDeckTitle(suggestedTitle);
        setPdfSuggestedDeckHint(true);
      }

      const immediateParsed = parseBulkFlashcards(result.text);
      if (immediateParsed.cards.length === 0) {
        setShowPdfRawText(true);
        setPdfError(
          "Đã đọc được chữ từ file nhưng chưa nhận diện được flashcard nào. Hãy kiểm tra phần 'Xem chữ đọc từ PDF' hoặc đối chiếu với mẫu cấu trúc bên dưới."
        );
      } else {
        setShowPdfRawText(false);
        setShowPdfGuide(false);
      }
    } catch (err) {
      setPdfFileMeta(null);
      setPdfRawText("");
      setShowPdfRawText(false);
      setPdfError(err?.message || "Không thể đọc file PDF. Vui lòng thử lại.");
    } finally {
      setPdfLoading(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  const handlePdfInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePdfFile(file);
    }
  };

  const handlePdfDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingPdf) setIsDraggingPdf(true);
  };

  const handlePdfDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPdf(false);
  };

  const handlePdfDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPdf(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handlePdfFile(file);
    }
  };

  const handleClearPdf = () => {
    setPdfFileMeta(null);
    setPdfRawText("");
    setEditablePdfCards([]);
    setPdfWarnings([]);
    setPdfError("");
    setPdfSuccess("");
    setShowPdfRawText(false);
    setPdfSuggestedDeckHint(false);
    setShowPdfGuide(true);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handlePdfRowChange = (index, field, value) => {
    setEditablePdfCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    );
  };

  const handlePdfRowRemove = (index) => {
    setEditablePdfCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyGuideTemplate = async (example) => {
    if (!example?.template) return;
    try {
      await copyTextToClipboard(example.template);
      setCopiedGuideId(example.id);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedGuideId("");
      }, 2200);
    } catch {
      // ignore clipboard errors gracefully
    }
  };

  const handleTryGuideExample = (example) => {
    if (!example?.template) return;
    setPdfError("");
    setPdfSuccess("");
    setPdfFileMeta({
      name: `Mau_${example.id}.pdf (mô phỏng)`,
      pageCount: 1,
      fileType: "pdf",
    });
    setPdfRawText(example.template);
    setShowPdfRawText(true);
    setPdfSuggestedDeckHint(false);
  };

  const handlePdfSubmit = async (openStudyAfter = true) => {
    setPdfError("");
    setPdfSuccess("");

    const validCards = editablePdfCards
      .map((c) => ({
        frontVi: String(c.frontVi || "").trim(),
        pos: String(c.pos || "").trim(),
        ipa: "",
        definition: String(c.definition || "").trim(),
        exampleVi: String(c.exampleVi || "").trim(),
        exampleEn: String(c.exampleEn || "").trim(),
        notes: String(c.notes || "").trim(),
      }))
      .filter((c) => c.frontVi && c.definition);

    if (validCards.length === 0) {
      setPdfError("Chưa có flashcard hợp lệ để lưu. Vui lòng tải file PDF hoặc chỉnh lại nội dung.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resolveDeckAndSaveCards(validCards, { openStudyAfter });
      setPdfFileMeta(null);
      setPdfRawText("");
      setEditablePdfCards([]);
      setPdfWarnings([]);
      setShowPdfRawText(false);
      setPdfSuggestedDeckHint(false);
      setShowPdfGuide(true);
      if (!openStudyAfter) {
        setPdfSuccess(`Đã tạo và lưu ${res.count} flashcard từ file vào bộ thẻ.`);
      }
    } catch (err) {
      setPdfError(err?.message || "Không thể lưu flashcard từ file PDF.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fc-creator-panel" data-testid="fc-creator-panel">
      <div className="fc-creator-topbar">
        <div className="fc-subtabs" role="tablist" aria-label="Chế độ tạo flashcard">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === "single"}
            className={`fc-subtab-btn ${subTab === "single" ? "is-active" : ""}`}
            onClick={() => setSubTab("single")}
          >
            <Plus size={15} />
            <span>Tạo từng thẻ</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === "bulk"}
            className={`fc-subtab-btn ${subTab === "bulk" ? "is-active" : ""}`}
            onClick={() => setSubTab("bulk")}
          >
            <FileText size={15} />
            <span>Dán danh sách</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === "pdf"}
            className={`fc-subtab-btn ${subTab === "pdf" ? "is-active" : ""}`}
            onClick={() => setSubTab("pdf")}
          >
            <FileUp size={15} />
            <span>Tải file PDF</span>
          </button>
        </div>

        <div className="fc-deck-picker">
          <label htmlFor="fc-target-deck">Lưu vào bộ thẻ:</label>
          <select
            id="fc-target-deck"
            className="fc-select"
            value={isCreatingNewDeck ? NEW_DECK_VALUE : targetDeckId}
            onChange={(e) => {
              setTargetDeckId(e.target.value);
              if (e.target.value !== NEW_DECK_VALUE) {
                setPdfSuggestedDeckHint(false);
              }
            }}
          >
            {editableDecks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.cards?.length || 0} thẻ)
              </option>
            ))}
            <option value={NEW_DECK_VALUE}>+ Tạo bộ thẻ mới...</option>
          </select>
        </div>
      </div>

      {isCreatingNewDeck && (
        <div className="fc-form-row fc-new-deck-fields">
          <div className="fc-field">
            <label htmlFor="fc-new-deck-title">
              <span>
                Tên bộ thẻ mới <span className="fc-req">*</span>
              </span>
            </label>
            <input
              id="fc-new-deck-title"
              className="fc-input"
              value={newDeckTitle}
              onChange={(e) => setNewDeckTitle(e.target.value)}
              placeholder="VD: Từ vựng ẩm thực tuần 1"
            />
          </div>
          <div className="fc-field">
            <label htmlFor="fc-new-deck-topic">Chủ đề (tuỳ chọn)</label>
            <select
              id="fc-new-deck-topic"
              className="fc-select"
              value={newDeckTopicId}
              onChange={(e) => setNewDeckTopicId(e.target.value)}
            >
              <option value="">Không gắn chủ đề</option>
              {TOPIC_IDS.map((tid) => (
                <option key={tid} value={tid}>
                  {TOPIC_META[tid].titleVi}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isTeacher && (
        <label
          className={`fc-teacher-assign-box ${assignToStudents ? "is-checked" : ""}`}
          htmlFor="fc-assign-to-students"
          data-testid="fc-teacher-assign-toggle"
        >
          <input
            id="fc-assign-to-students"
            type="checkbox"
            checked={assignToStudents}
            onChange={(e) => setAssignToStudents(e.target.checked)}
          />
          <span className="fc-teacher-assign-copy">
            <span className="fc-teacher-assign-title">
              <GraduationCap size={15} aria-hidden="true" />
              <span>Giao bộ thẻ này cho học sinh</span>
            </span>
            <span className="fc-teacher-assign-note">
              Học sinh vào web sẽ thấy ngay bộ thẻ này để học và luyện phát âm.
            </span>
          </span>
        </label>
      )}

      {/* TAB 1: Single Card Form */}
      {subTab === "single" && (
        <div className="fc-creator-grid">
          <form className="fc-form" onSubmit={(e) => handleSingleSubmit(e, true)}>
            <div className="fc-field">
              <div className="fc-label-row">
                <label htmlFor="fc-front-vi">
                  Từ vựng / cụm từ tiếng Việt <span className="fc-req">*</span>
                </label>
                <button
                  type="button"
                  className="fc-field-inline-action"
                  disabled={!form.frontVi.trim()}
                  onClick={() => speechApi.speakVietnamese?.(form.frontVi.trim())}
                >
                  <Volume2 size={13} />
                  <span>Nghe thử</span>
                </button>
              </div>
              <input
                id="fc-front-vi"
                className="fc-input"
                value={form.frontVi}
                onChange={(e) => setForm((f) => ({ ...f, frontVi: e.target.value }))}
                placeholder="VD: hài lòng, món ăn đặc sản, cảm thấy thoải mái..."
              />
            </div>

            <div className="fc-field">
              <label htmlFor="fc-pos">Loại từ</label>
              <select
                id="fc-pos"
                className="fc-select"
                value={form.pos}
                onChange={(e) => setForm((f) => ({ ...f, pos: e.target.value }))}
              >
                {VIETNAMESE_POS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="fc-field">
              <label htmlFor="fc-definition">
                <span>
                  Định nghĩa <span className="fc-req">*</span>
                </span>
              </label>
              <textarea
                id="fc-definition"
                className="fc-textarea"
                rows={2}
                value={form.definition}
                onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))}
                placeholder="Giải thích ngắn gọn nghĩa của từ..."
              />
            </div>

            <div className="fc-field">
              <div className="fc-label-row">
                <label htmlFor="fc-example-vi">Câu ví dụ tiếng Việt</label>
                <button
                  type="button"
                  className="fc-field-inline-action"
                  disabled={!form.exampleVi.trim()}
                  onClick={() => speechApi.speakVietnamese?.(form.exampleVi.trim())}
                >
                  <Volume2 size={13} />
                  <span>Nghe ví dụ</span>
                </button>
              </div>
              <textarea
                id="fc-example-vi"
                className="fc-textarea"
                rows={2}
                value={form.exampleVi}
                onChange={(e) => setForm((f) => ({ ...f, exampleVi: e.target.value }))}
                placeholder="VD: Tôi rất hài lòng với món phở bò ở quán này."
              />
            </div>

            <div className="fc-form-row">
              <div className="fc-field">
                <label htmlFor="fc-example-en">Dịch ví dụ (tuỳ chọn)</label>
                <input
                  id="fc-example-en"
                  className="fc-input"
                  value={form.exampleEn}
                  onChange={(e) => setForm((f) => ({ ...f, exampleEn: e.target.value }))}
                  placeholder="VD: I am very satisfied with the beef pho here."
                />
              </div>
              <div className="fc-field">
                <label htmlFor="fc-notes">Ghi chú cách dùng (tuỳ chọn)</label>
                <input
                  id="fc-notes"
                  className="fc-input"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="VD: Thường đi kèm 'với...'"
                />
              </div>
            </div>

            {formError && (
              <div className="fc-alert error" role="alert">
                <AlertTriangle size={15} />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="fc-alert success" role="status">
                <Check size={15} />
                <span>{formSuccess}</span>
              </div>
            )}

            <div className="fc-btn-row">
              <button type="submit" className="fc-btn-primary" disabled={isSubmitting}>
                <span>{isSubmitting ? "Đang lưu..." : "Tạo flashcard & học ngay"}</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                className="fc-btn-secondary"
                disabled={isSubmitting}
                onClick={(e) => handleSingleSubmit(e, false)}
              >
                <Plus size={15} />
                <span>Lưu &amp; tạo thẻ tiếp</span>
              </button>
            </div>
          </form>

          {/* Live Dark Card Preview */}
          <div className="fc-live-preview" aria-label="Xem trước flashcard">
            <div className="fc-preview-card">
              <span className="fc-preview-tag">Mặt trước</span>
              <div className="fc-preview-word">
                {form.frontVi.trim() || "từ vựng tiếng Việt"}
              </div>
              {form.pos && <div className="fc-preview-sub">{form.pos}</div>}
            </div>

            <div className="fc-preview-card back">
              <span className="fc-preview-tag">Mặt sau</span>
              <div className="fc-preview-def">
                {form.definition.trim() || "Định nghĩa sẽ hiển thị tại đây"}
              </div>
              {form.exampleVi.trim() && (
                <div className="fc-preview-ex">“{form.exampleVi.trim()}”</div>
              )}
            </div>

            <div className="fc-creator-tip">
              <div className="vf-art-frame fc-guide-art">
                <img
                  src={APP_ART.mascot.src}
                  alt={APP_ART.mascot.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="fc-creator-tip-copy">
                <strong>Mẹo tạo thẻ dễ nhớ</strong>
                <p>Thêm một câu ví dụ gần gũi và bấm Nghe thử để quen thanh điệu trước khi lưu.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk Paste Form */}
      {subTab === "bulk" && (
        <div className="fc-form">
          <div className="fc-format-hints">
            <div className="fc-format-card">
              <strong>Dấu gạch đứng (|)</strong>
              <code>{"từ | định nghĩa | ví dụ\ntừ | loại từ | định nghĩa | ví dụ"}</code>
            </div>
            <div className="fc-format-card">
              <strong>Nhãn từng dòng</strong>
              <code>{"Từ: ấm áp\nĐịnh nghĩa: không lạnh, dễ chịu\nVí dụ: Hôm nay trời ấm áp."}</code>
            </div>
            <div className="fc-format-card">
              <strong>Dấu hai chấm / Excel</strong>
              <code>{"hào hứng (tính từ): rất vui - VD: Tôi rất hào hứng."}</code>
            </div>
          </div>

          <div className="fc-field">
            <div className="fc-label-row">
              <label htmlFor="fc-bulk-input">
                Dán danh sách từ vựng tiếng Việt + định nghĩa + ví dụ
              </label>
              <button
                type="button"
                className="fc-field-inline-action"
                onClick={() => setBulkText(CREATOR_SAMPLE_BULK_TEMPLATE)}
              >
                <ClipboardList size={13} />
                <span>Chèn ví dụ mẫu</span>
              </button>
            </div>
            <textarea
              id="fc-bulk-input"
              className="fc-textarea fc-bulk-textarea"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={
                "VD:\nhài lòng | tính từ | cảm thấy vừa ý | Tôi rất hài lòng với món ăn này.\n\nHoặc:\nTừ: thư giãn\nĐịnh nghĩa: nghỉ ngơi cho thoải mái tinh thần\nVí dụ: Cuối tuần tôi thích nghe nhạc để thư giãn."
              }
            />
          </div>

          {bulkWarnings.length > 0 && (
            <div className="fc-alert warn" role="status">
              <AlertTriangle size={15} />
              <div>
                <strong>Lưu ý ({bulkWarnings.length}):</strong>{" "}
                {bulkWarnings.slice(0, 3).join(" · ")}
                {bulkWarnings.length > 3 ? ` (+${bulkWarnings.length - 3} mục khác)` : ""}
              </div>
            </div>
          )}

          {editableBulkCards.length > 0 && (
            <div className="fc-field">
              <label>
                <span>
                  Xem trước &amp; chỉnh nhanh ({editableBulkCards.length} thẻ sẵn sàng)
                </span>
              </label>
              <div className="fc-bulk-preview-list" data-testid="fc-bulk-preview-list">
                {editableBulkCards.map((card, index) => (
                  <div key={card.id || index} className="fc-bulk-row">
                    <input
                      aria-label={`Từ vựng dòng ${index + 1}`}
                      value={card.frontVi}
                      onChange={(e) => handleBulkRowChange(index, "frontVi", e.target.value)}
                      placeholder="Từ vựng *"
                    />
                    <input
                      aria-label={`Loại từ dòng ${index + 1}`}
                      value={card.pos}
                      onChange={(e) => handleBulkRowChange(index, "pos", e.target.value)}
                      placeholder="Loại từ"
                    />
                    <input
                      aria-label={`Định nghĩa dòng ${index + 1}`}
                      value={card.definition}
                      onChange={(e) => handleBulkRowChange(index, "definition", e.target.value)}
                      placeholder="Định nghĩa *"
                    />
                    <input
                      aria-label={`Ví dụ dòng ${index + 1}`}
                      value={card.exampleVi}
                      onChange={(e) => handleBulkRowChange(index, "exampleVi", e.target.value)}
                      placeholder="Câu ví dụ"
                    />
                    <button
                      type="button"
                      className="fc-pron-dismiss"
                      onClick={() => handleBulkRowRemove(index)}
                      aria-label={`Bỏ thẻ ${card.frontVi || index + 1}`}
                      title="Xóa dòng này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkError && (
            <div className="fc-alert error" role="alert">
              <AlertTriangle size={15} />
              <span>{bulkError}</span>
            </div>
          )}
          {bulkSuccess && (
            <div className="fc-alert success" role="status">
              <Check size={15} />
              <span>{bulkSuccess}</span>
            </div>
          )}

          <div className="fc-btn-row">
            <button
              type="button"
              className="fc-btn-primary"
              disabled={isSubmitting || editableBulkCards.length === 0}
              onClick={() => handleBulkSubmit(true)}
            >
              <Layers size={15} />
              <span>
                {isSubmitting
                  ? "Đang tạo..."
                  : `Tạo ${editableBulkCards.length} flashcard & học ngay`}
              </span>
            </button>
            <button
              type="button"
              className="fc-btn-secondary"
              disabled={isSubmitting || editableBulkCards.length === 0}
              onClick={() => handleBulkSubmit(false)}
            >
              <Check size={15} />
              <span>Chỉ lưu vào bộ thẻ</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PDF File Upload + Format Guide */}
      {subTab === "pdf" && (
        <div className="fc-pdf-section" data-testid="fc-pdf-panel">
          <input
            ref={pdfInputRef}
            id="fc-pdf-file-input"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="fc-sr-file-input"
            aria-label="Chọn file PDF hoặc TXT để tạo flashcard"
            onChange={handlePdfInputChange}
          />

          {/* Dropzone */}
          <div
            className={`fc-pdf-dropzone ${isDraggingPdf ? "is-dragging" : ""} ${
              pdfFileMeta ? "has-file" : ""
            }`}
            onDragOver={handlePdfDragOver}
            onDragLeave={handlePdfDragLeave}
            onDrop={handlePdfDrop}
            onClick={() => {
              if (!pdfLoading && !pdfFileMeta) {
                pdfInputRef.current?.click();
              }
            }}
            role={!pdfFileMeta ? "button" : undefined}
            tabIndex={!pdfFileMeta ? 0 : undefined}
            onKeyDown={(e) => {
              if (!pdfFileMeta && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                pdfInputRef.current?.click();
              }
            }}
            aria-label="Vùng kéo thả hoặc chọn file PDF"
          >
            {pdfLoading ? (
              <div className="fc-pdf-loading" role="status" aria-live="polite">
                <Loader2 size={24} className="fc-spin" />
                <div>
                  <strong>Đang đọc nội dung file...</strong>
                  <p>
                    {pdfProgress > 0
                      ? `Đã xử lý ${pdfProgress}% trang tài liệu`
                      : "Đang tải bộ đọc PDF trên trình duyệt"}
                  </p>
                </div>
              </div>
            ) : pdfFileMeta ? (
              <div className="fc-pdf-file-summary">
                <div className="fc-pdf-file-info">
                  <div className="fc-pdf-file-icon">
                    <FileText size={20} />
                  </div>
                  <div className="fc-pdf-file-meta">
                    <strong>{pdfFileMeta.name}</strong>
                    <div className="fc-pdf-file-pills">
                      <span className="fc-pdf-pill">
                        {pdfFileMeta.pageCount} trang
                      </span>
                      <span
                        className={`fc-pdf-pill ${
                          editablePdfCards.length > 0 ? "is-good" : "is-warn"
                        }`}
                      >
                        {editablePdfCards.length} flashcard nhận diện
                      </span>
                    </div>
                  </div>
                </div>

                <div className="fc-pdf-file-actions">
                  <button
                    type="button"
                    className="fc-btn-secondary fc-btn-compact"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    <FileUp size={14} />
                    <span>Chọn file khác</span>
                  </button>
                  <button
                    type="button"
                    className="fc-pron-dismiss"
                    onClick={handleClearPdf}
                    aria-label="Xóa file PDF đã tải"
                    title="Xóa file"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="fc-pdf-empty-prompt">
                <div className="fc-pdf-upload-icon">
                  <FileUp size={24} strokeWidth={1.7} />
                </div>
                <div className="fc-pdf-prompt-copy">
                  <strong>Kéo thả file PDF vào đây hoặc bấm để chọn file</strong>
                  <p>
                    Hỗ trợ <code>.pdf</code> có lớp chữ (xuất từ Word, Google Docs, Canva) hoặc{" "}
                    <code>.txt</code> · Tối đa 20 MB · Xử lý trực tiếp trên trình duyệt
                  </p>
                </div>
                <button
                  type="button"
                  className="fc-btn-secondary fc-btn-compact"
                  onClick={(e) => {
                    e.stopPropagation();
                    pdfInputRef.current?.click();
                  }}
                >
                  <FileUp size={14} />
                  <span>Chọn file PDF / TXT</span>
                </button>
              </div>
            )}
          </div>

          {pdfSuggestedDeckHint && isCreatingNewDeck && (
            <div className="fc-pdf-deck-hint" role="status">
              <Sparkles size={14} />
              <span>
                Đã tự động gợi ý tên bộ thẻ mới từ tên file phía trên — bạn có thể sửa tên hoặc đổi
                sang bộ thẻ có sẵn ở mục <strong>Lưu vào bộ thẻ</strong>.
              </span>
            </div>
          )}

          {pdfError && (
            <div className="fc-alert error" role="alert">
              <AlertTriangle size={15} />
              <span>{pdfError}</span>
            </div>
          )}

          {pdfSuccess && (
            <div className="fc-alert success" role="status">
              <Check size={15} />
              <span>{pdfSuccess}</span>
            </div>
          )}

          {pdfWarnings.length > 0 && (
            <div className="fc-alert warn" role="status">
              <AlertTriangle size={15} />
              <div>
                <strong>Lưu ý ({pdfWarnings.length}):</strong>{" "}
                {pdfWarnings.slice(0, 3).join(" · ")}
                {pdfWarnings.length > 3 ? ` (+${pdfWarnings.length - 3} mục khác)` : ""}
              </div>
            </div>
          )}

          {/* Toggleable Raw Text Editor extracted from PDF */}
          {pdfRawText && (
            <div className="fc-pdf-raw-box">
              <div className="fc-label-row">
                <button
                  type="button"
                  className="fc-pdf-raw-toggle"
                  onClick={() => setShowPdfRawText((prev) => !prev)}
                  aria-expanded={showPdfRawText}
                >
                  {showPdfRawText ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPdfRawText ? "Ẩn chữ đọc từ PDF" : "Xem chữ đọc từ PDF"}</span>
                </button>
                <span className="fc-pdf-raw-caption">
                  {pdfRawText.split("\n").length} dòng · Chỉnh sửa trực tiếp nếu PDF bị ngắt dòng
                </span>
              </div>

              {showPdfRawText && (
                <textarea
                  id="fc-pdf-raw-text"
                  aria-label="Nội dung chữ đọc từ PDF"
                  className="fc-textarea fc-bulk-textarea"
                  value={pdfRawText}
                  onChange={(e) => setPdfRawText(e.target.value)}
                />
              )}
            </div>
          )}

          {/* Editable Parsed Flashcards Preview */}
          {editablePdfCards.length > 0 && (
            <div className="fc-field">
              <label>
                <span>
                  Xem trước &amp; chỉnh nhanh ({editablePdfCards.length} flashcard sẵn sàng)
                </span>
              </label>
              <div className="fc-bulk-cols-head" aria-hidden="true">
                <span>Mặt trước · Từ vựng</span>
                <span>Loại từ</span>
                <span>Mặt sau · Định nghĩa</span>
                <span>Mặt sau · Câu ví dụ</span>
                <span />
              </div>
              <div className="fc-bulk-preview-list" data-testid="fc-pdf-preview-list">
                {editablePdfCards.map((card, index) => (
                  <div key={card.id || index} className="fc-bulk-row">
                    <input
                      aria-label={`Từ vựng PDF dòng ${index + 1}`}
                      value={card.frontVi}
                      onChange={(e) => handlePdfRowChange(index, "frontVi", e.target.value)}
                      placeholder="Từ vựng *"
                    />
                    <input
                      aria-label={`Loại từ PDF dòng ${index + 1}`}
                      value={card.pos}
                      onChange={(e) => handlePdfRowChange(index, "pos", e.target.value)}
                      placeholder="Loại từ"
                    />
                    <input
                      aria-label={`Định nghĩa PDF dòng ${index + 1}`}
                      value={card.definition}
                      onChange={(e) => handlePdfRowChange(index, "definition", e.target.value)}
                      placeholder="Định nghĩa *"
                    />
                    <input
                      aria-label={`Ví dụ PDF dòng ${index + 1}`}
                      value={card.exampleVi}
                      onChange={(e) => handlePdfRowChange(index, "exampleVi", e.target.value)}
                      placeholder="Câu ví dụ"
                    />
                    <button
                      type="button"
                      className="fc-pron-dismiss"
                      onClick={() => handlePdfRowRemove(index)}
                      aria-label={`Bỏ thẻ PDF ${card.frontVi || index + 1}`}
                      title="Xóa dòng này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="fc-btn-row">
                <button
                  type="button"
                  className="fc-btn-primary"
                  disabled={isSubmitting || editablePdfCards.length === 0}
                  onClick={() => handlePdfSubmit(true)}
                >
                  <Layers size={15} />
                  <span>
                    {isSubmitting
                      ? "Đang tạo..."
                      : `Tạo ${editablePdfCards.length} flashcard & học ngay`}
                  </span>
                </button>
                <button
                  type="button"
                  className="fc-btn-secondary"
                  disabled={isSubmitting || editablePdfCards.length === 0}
                  onClick={() => handlePdfSubmit(false)}
                >
                  <Check size={15} />
                  <span>Chỉ lưu vào bộ thẻ</span>
                </button>
              </div>
            </div>
          )}

          {/* Built-in PDF Format Guide Panel */}
          <div className="fc-pdf-guide" data-testid="fc-pdf-format-guide">
            <div className="fc-pdf-guide-head">
              <div className="fc-pdf-guide-intro">
                <div className="vf-art-frame fc-guide-art">
                  <img
                    src={APP_ART.comHanoi.src}
                    alt={APP_ART.comHanoi.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h3 className="fc-pdf-guide-title">Cấu trúc file PDF gợi ý</h3>
                  <p className="fc-pdf-guide-sub">
                    Soạn trong Word, Google Docs hoặc Canva theo 1 trong 3 mẫu bên dưới rồi xuất{" "}
                    <strong>PDF (có lớp chữ)</strong> để tải lên.
                  </p>
                </div>
              </div>
              {pdfFileMeta && (
                <button
                  type="button"
                  className="fc-field-inline-action"
                  onClick={() => setShowPdfGuide((v) => !v)}
                  aria-expanded={showPdfGuide}
                >
                  <span>{showPdfGuide ? "Thu gọn mẫu" : "Xem mẫu cấu trúc"}</span>
                  {showPdfGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            {showPdfGuide && activeGuide && (
              <div className="fc-pdf-guide-body">
                <div
                  className="fc-pdf-guide-tabs"
                  role="tablist"
                  aria-label="Các mẫu cấu trúc file PDF"
                >
                  {PDF_FORMAT_EXAMPLES.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      role="tab"
                      aria-selected={activeGuide.id === ex.id}
                      className={`fc-pdf-guide-tab ${activeGuide.id === ex.id ? "is-active" : ""}`}
                      onClick={() => setActiveGuideId(ex.id)}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>

                <div className="fc-pdf-guide-card">
                  <div className="fc-pdf-guide-card-top">
                    <div>
                      <strong>{activeGuide.title}</strong>
                      <span className="fc-pdf-guide-badge">{activeGuide.badge}</span>
                    </div>
                    <div className="fc-pdf-guide-actions">
                      <button
                        type="button"
                        className="fc-field-inline-action"
                        onClick={() => handleTryGuideExample(activeGuide)}
                      >
                        <ClipboardList size={13} />
                        <span>Dùng thử mẫu</span>
                      </button>
                      <button
                        type="button"
                        className="fc-pdf-copy-btn"
                        onClick={() => handleCopyGuideTemplate(activeGuide)}
                      >
                        {copiedGuideId === activeGuide.id ? (
                          <>
                            <Check size={13} />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Sao chép mẫu</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="fc-pdf-guide-desc">{activeGuide.description}</p>

                  <pre className="fc-pdf-guide-pre">
                    <code>{activeGuide.template}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardCreator;
