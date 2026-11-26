import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  FileText,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { TOPIC_IDS, TOPIC_META } from "../../lib/contracts.js";
import { speakVietnamese } from "../../lib/speech.js";
import {
  SAMPLE_BULK_TEMPLATE,
  VIETNAMESE_POS_OPTIONS,
  formatIpaDisplay,
  parseBulkFlashcards,
} from "../../lib/flashcardParser.js";

const NEW_DECK_VALUE = "__new__";

const EMPTY_SINGLE_FORM = {
  frontVi: "",
  pos: "danh từ",
  ipa: "",
  definition: "",
  exampleVi: "",
  exampleEn: "",
  notes: "",
};

export function FlashcardCreator({
  decks = [],
  activeDeckId = "",
  defaultNewDeck = false,
  onCreateDeck,
  onAddCard,
  onAddCardsBulk,
  onCreatedAndStudy,
}) {
  const [subTab, setSubTab] = useState("single"); // "single" | "bulk"
  const [targetDeckId, setTargetDeckId] = useState(() =>
    defaultNewDeck || decks.length === 0 ? NEW_DECK_VALUE : activeDeckId || decks[0]?.id || NEW_DECK_VALUE
  );
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckTopicId, setNewDeckTopicId] = useState("");

  // Single card form state
  const [form, setForm] = useState(EMPTY_SINGLE_FORM);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk import state
  const [bulkText, setBulkText] = useState("");
  const [editableBulkCards, setEditableBulkCards] = useState([]);
  const [bulkWarnings, setBulkWarnings] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");

  useEffect(() => {
    if (defaultNewDeck) {
      setTargetDeckId(NEW_DECK_VALUE);
    } else if (targetDeckId !== NEW_DECK_VALUE && activeDeckId) {
      const exists = decks.some((d) => d.id === targetDeckId);
      if (!exists) setTargetDeckId(activeDeckId);
    }
  }, [defaultNewDeck, activeDeckId, decks, targetDeckId]);

  // Parse bulk text whenever user types/pastes
  const parsedBulk = useMemo(() => {
    if (!bulkText.trim()) return { cards: [], warnings: [] };
    const selectedDeck = decks.find((d) => d.id === targetDeckId);
    const topicId =
      targetDeckId === NEW_DECK_VALUE
        ? newDeckTopicId || null
        : selectedDeck?.topicId || null;
    return parseBulkFlashcards(bulkText, {
      deckId: targetDeckId === NEW_DECK_VALUE ? "" : targetDeckId,
      topicId,
    });
  }, [bulkText, decks, targetDeckId, newDeckTopicId]);

  useEffect(() => {
    setEditableBulkCards(parsedBulk.cards);
    setBulkWarnings(parsedBulk.warnings);
  }, [parsedBulk]);

  const isCreatingNewDeck = targetDeckId === NEW_DECK_VALUE || decks.length === 0;

  const resolveDeckAndSaveCards = async (cardsToSave, { openStudyAfter = false } = {}) => {
    if (isCreatingNewDeck) {
      const cleanTitle = newDeckTitle.trim();
      if (!cleanTitle) {
        throw new Error("Vui lòng nhập tên bộ thẻ mới.");
      }
      const topicId = newDeckTopicId || null;
      const color = topicId && TOPIC_META[topicId] ? TOPIC_META[topicId].accent : "#38bdf8";
      const createdDeck = await onCreateDeck?.({
        title: cleanTitle,
        description: `Bộ thẻ tự tạo (${cardsToSave.length} thẻ)`,
        topicId,
        color,
        cards: cardsToSave.map((c) => ({ ...c, topicId: c.topicId || topicId })),
      });
      const resolvedDeckId = createdDeck?.id || "";
      if (resolvedDeckId) {
        setTargetDeckId(resolvedDeckId);
        setNewDeckTitle("");
      }
      if (openStudyAfter) {
        onCreatedAndStudy?.(resolvedDeckId, 0);
      }
      return { deckId: resolvedDeckId, count: cardsToSave.length };
    }

    const deck = decks.find((d) => d.id === targetDeckId) || decks[0];
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
        ipa: formatIpaDisplay(form.ipa),
        definition,
        exampleVi: form.exampleVi.trim(),
        exampleEn: form.exampleEn.trim(),
        notes: form.notes.trim(),
      };
      await resolveDeckAndSaveCards([cardPayload], { openStudyAfter });
      setForm(EMPTY_SINGLE_FORM);
      if (!openStudyAfter) {
        setFormSuccess(`Đã tạo flashcard "${frontVi}" thành công! Bạn có thể nhập tiếp từ mới.`);
      }
    } catch (err) {
      setFormError(err?.message || "Không thể lưu flashcard. Vui lòng thử lại.");
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
        ipa: formatIpaDisplay(c.ipa || ""),
        definition: String(c.definition || "").trim(),
        exampleVi: String(c.exampleVi || "").trim(),
        exampleEn: String(c.exampleEn || "").trim(),
        notes: String(c.notes || "").trim(),
      }))
      .filter((c) => c.frontVi && c.definition);

    if (validCards.length === 0) {
      setBulkError("Chưa có flashcard hợp lệ nào. Hãy dán danh sách từ vựng kèm định nghĩa vào ô trên.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resolveDeckAndSaveCards(validCards, { openStudyAfter });
      setBulkText("");
      setEditableBulkCards([]);
      setBulkWarnings([]);
      if (!openStudyAfter) {
        setBulkSuccess(`Đã tạo thành công ${res.count} flashcard!`);
      }
    } catch (err) {
      setBulkError(err?.message || "Không thể tạo hàng loạt flashcard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewIpa = formatIpaDisplay(form.ipa);

  return (
    <div className="fc-creator-panel" data-testid="fc-creator-panel">
      <div className="fc-creator-tabs">
        <div className="fc-subtabs" role="tablist" aria-label="Chế độ tạo flashcard">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === "single"}
            className={`fc-subtab-btn ${subTab === "single" ? "is-active" : ""}`}
            onClick={() => setSubTab("single")}
          >
            <Plus size={16} />
            <span>Tạo từng thẻ</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === "bulk"}
            className={`fc-subtab-btn ${subTab === "bulk" ? "is-active" : ""}`}
            onClick={() => setSubTab("bulk")}
          >
            <FileText size={16} />
            <span>Nhập nhanh hàng loạt</span>
          </button>
        </div>

        <div className="fc-toolbar-actions">
          <label htmlFor="fc-target-deck" style={{ fontSize: "0.78rem", color: "#9aa5ba" }}>
            Lưu vào bộ thẻ:
          </label>
          <select
            id="fc-target-deck"
            className="fc-select"
            style={{ width: "auto", minWidth: 210, padding: "7px 11px", fontSize: "0.82rem" }}
            value={isCreatingNewDeck ? NEW_DECK_VALUE : targetDeckId}
            onChange={(e) => setTargetDeckId(e.target.value)}
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.cards?.length || 0} thẻ)
              </option>
            ))}
            <option value={NEW_DECK_VALUE}>+ Tạo bộ thẻ mới...</option>
          </select>
        </div>
      </div>

      {isCreatingNewDeck && (
        <div className="fc-form-row" style={{ padding: "12px 14px", borderRadius: 14, background: "#0f1523", border: "1px solid rgba(129, 140, 248, 0.25)" }}>
          <div className="fc-field">
            <label htmlFor="fc-new-deck-title">
              <span>Tên bộ thẻ mới <span className="fc-req">*</span></span>
            </label>
            <input
              id="fc-new-deck-title"
              className="fc-input"
              value={newDeckTitle}
              onChange={(e) => setNewDeckTitle(e.target.value)}
              placeholder="VD: Từ vựng Ẩm thực tuần 1"
            />
          </div>
          <div className="fc-field">
            <label htmlFor="fc-new-deck-topic">Chủ đề liên quan (tuỳ chọn)</label>
            <select
              id="fc-new-deck-topic"
              className="fc-select"
              value={newDeckTopicId}
              onChange={(e) => setNewDeckTopicId(e.target.value)}
            >
              <option value="">Tự do / Không gắn chủ đề</option>
              {TOPIC_IDS.map((tid) => (
                <option key={tid} value={tid}>
                  {TOPIC_META[tid].titleVi}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: SINGLE CARD QUICK FORM */}
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
                  onClick={() => speakVietnamese(form.frontVi.trim())}
                >
                  <Volume2 size={13} /> Nghe thử
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

            <div className="fc-form-row">
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
                <label htmlFor="fc-ipa">Phiên âm (tuỳ chọn)</label>
                <input
                  id="fc-ipa"
                  className="fc-input"
                  value={form.ipa}
                  onChange={(e) => setForm((f) => ({ ...f, ipa: e.target.value }))}
                  placeholder="VD: /haːj˨˩ lɔŋ˨˩/"
                />
              </div>
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
                placeholder="Giải thích ngắn gọn nghĩa của từ (tiếng Việt hoặc song ngữ)..."
              />
            </div>

            <div className="fc-field">
              <div className="fc-label-row">
                <label htmlFor="fc-example-vi">Câu ví dụ tiếng Việt</label>
                <button
                  type="button"
                  className="fc-field-inline-action"
                  disabled={!form.exampleVi.trim()}
                  onClick={() => speakVietnamese(form.exampleVi.trim())}
                >
                  <Volume2 size={13} /> Nghe ví dụ
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
                <label htmlFor="fc-notes">Ghi chú ngữ pháp / sắc thái (tuỳ chọn)</label>
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
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="fc-alert success" role="status">
                <Check size={16} />
                <span>{formSuccess}</span>
              </div>
            )}

            <div className="fc-btn-row">
              <button type="submit" className="fc-btn-primary" disabled={isSubmitting}>
                <Sparkles size={16} />
                <span>{isSubmitting ? "Đang lưu..." : "Tạo flashcard & học ngay"}</span>
              </button>
              <button
                type="button"
                className="fc-btn-secondary"
                disabled={isSubmitting}
                onClick={(e) => handleSingleSubmit(e, false)}
              >
                <Plus size={16} />
                <span>Lưu &amp; tạo thẻ tiếp</span>
              </button>
            </div>
          </form>

          {/* Live Dark Card Preview */}
          <div className="fc-live-preview" aria-label="Xem trước flashcard">
            <div className="fc-preview-card">
              <span className="fc-preview-tag">Xem trước · Mặt trước</span>
              <div className="fc-preview-word">
                {form.frontVi.trim() || "từ vựng tiếng Việt"}
              </div>
              {(form.pos || previewIpa) && (
                <div className="fc-preview-sub">
                  {form.pos}
                  {form.pos && previewIpa ? " - " : ""}
                  {previewIpa && <i>{previewIpa}</i>}
                </div>
              )}
            </div>

            <div className="fc-preview-card back">
              <span className="fc-preview-tag">Xem trước · Mặt sau</span>
              <div className="fc-preview-def">
                {form.definition.trim() || "Định nghĩa sẽ hiển thị tại đây"}
              </div>
              {form.exampleVi.trim() && (
                <div className="fc-preview-ex">
                  “{form.exampleVi.trim()}”
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART BULK IMPORT */}
      {subTab === "bulk" && (
        <div className="fc-form">
          <div className="fc-format-hints">
            <div className="fc-format-card">
              <strong>Cách 1 · Dấu gạch đứng (|)</strong>
              <code>{"từ | định nghĩa | ví dụ\ntừ | loại từ | định nghĩa | ví dụ"}</code>
            </div>
            <div className="fc-format-card">
              <strong>Cách 2 · Nhãn từng dòng</strong>
              <code>{"Từ: ấm áp\nĐịnh nghĩa: không lạnh, dễ chịu\nVí dụ: Hôm nay trời ấm áp."}</code>
            </div>
            <div className="fc-format-card">
              <strong>Cách 3 · Dấu hai chấm / Excel</strong>
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
                onClick={() => setBulkText(SAMPLE_BULK_TEMPLATE)}
              >
                <Sparkles size={13} /> Chèn dữ liệu mẫu
              </button>
            </div>
            <textarea
              id="fc-bulk-input"
              className="fc-textarea fc-bulk-textarea"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"VD:\nhài lòng | tính từ | cảm thấy vừa ý | Tôi rất hài lòng với món ăn này.\n\nHoặc:\nTừ: thư giãn\nĐịnh nghĩa: nghỉ ngơi cho thoải mái tinh thần\nVí dụ: Cuối tuần tôi thích nghe nhạc để thư giãn."}
            />
          </div>

          {bulkWarnings.length > 0 && (
            <div className="fc-alert warn" role="status">
              <AlertTriangle size={16} />
              <div>
                <strong>Lưu ý ({bulkWarnings.length}):</strong> {bulkWarnings.slice(0, 3).join(" · ")}
                {bulkWarnings.length > 3 ? ` (+${bulkWarnings.length - 3} mục khác)` : ""}
              </div>
            </div>
          )}

          {editableBulkCards.length > 0 && (
            <div className="fc-field">
              <label>
                <span>
                  Xem trước &amp; chỉnh nhanh ({editableBulkCards.length} flashcard sẵn sàng)
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
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkError && (
            <div className="fc-alert error" role="alert">
              <AlertTriangle size={16} />
              <span>{bulkError}</span>
            </div>
          )}
          {bulkSuccess && (
            <div className="fc-alert success" role="status">
              <Check size={16} />
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
              <Layers size={16} />
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
              <Check size={16} />
              <span>Chỉ lưu vào bộ thẻ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardCreator;
