import React, { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, Volume2, X } from "lucide-react";
import { MASTERY_LEVELS, TOPIC_IDS, TOPIC_META } from "../../lib/contracts.js";
import { speakVietnamese } from "../../lib/speech.js";
import { VIETNAMESE_POS_OPTIONS, formatIpaDisplay } from "../../lib/flashcardParser.js";

export function FlashcardDeckManager({
  deck,
  cards = [],
  onUpdateDeck,
  onDeleteDeck,
  onUpdateCard,
  onDeleteCard,
  onOpenCreate,
}) {
  const [deckTitle, setDeckTitle] = useState(deck?.title || "");
  const [deckTopicId, setDeckTopicId] = useState(deck?.topicId || "");
  const [isRenamingDeck, setIsRenamingDeck] = useState(false);
  const [confirmDeleteDeck, setConfirmDeleteDeck] = useState(false);

  const [editingCardId, setEditingCardId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setDeckTitle(deck?.title || "");
    setDeckTopicId(deck?.topicId || "");
    setIsRenamingDeck(false);
    setConfirmDeleteDeck(false);
    setEditingCardId(null);
    setEditDraft(null);
  }, [deck?.id, deck?.title, deck?.topicId]);

  if (!deck) {
    return (
      <div className="fc-empty-card">
        <h3>Chưa chọn bộ thẻ nào</h3>
        <p>Hãy chọn một bộ thẻ hoặc tạo bộ thẻ mới để quản lý danh sách từ vựng.</p>
      </div>
    );
  }

  const handleSaveDeckMeta = async (e) => {
    e.preventDefault();
    if (!deckTitle.trim()) return;
    await onUpdateDeck?.(deck.id, {
      title: deckTitle.trim(),
      topicId: deckTopicId || null,
    });
    setIsRenamingDeck(false);
  };

  const handleStartEditCard = (card) => {
    setEditingCardId(card.id);
    setEditDraft({
      frontVi: card.frontVi || "",
      pos: card.pos || "",
      ipa: card.ipa || "",
      definition: card.definition || "",
      exampleVi: card.exampleVi || "",
      exampleEn: card.exampleEn || "",
      notes: card.notes || "",
    });
  };

  const handleSaveCardEdit = async (e, cardId) => {
    e.preventDefault();
    if (!editDraft?.frontVi?.trim() || !editDraft?.definition?.trim()) return;
    setSavingId(cardId);
    try {
      await onUpdateCard?.(cardId, {
        frontVi: editDraft.frontVi.trim(),
        pos: editDraft.pos.trim(),
        ipa: formatIpaDisplay(editDraft.ipa),
        definition: editDraft.definition.trim(),
        exampleVi: editDraft.exampleVi.trim(),
        exampleEn: editDraft.exampleEn.trim(),
        notes: editDraft.notes.trim(),
      });
      setEditingCardId(null);
      setEditDraft(null);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="fc-manager-panel" data-testid="fc-deck-manager">
      <div className="fc-manager-head">
        {isRenamingDeck ? (
          <form className="fc-manager-deck-edit" onSubmit={handleSaveDeckMeta}>
            <input
              className="fc-input"
              style={{ width: 230, padding: "7px 11px", fontSize: "0.86rem" }}
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              aria-label="Tên bộ thẻ"
              required
            />
            <select
              className="fc-select"
              style={{ width: 200, padding: "7px 10px", fontSize: "0.82rem" }}
              value={deckTopicId}
              onChange={(e) => setDeckTopicId(e.target.value)}
              aria-label="Chủ đề bộ thẻ"
            >
              <option value="">Không gắn chủ đề</option>
              {TOPIC_IDS.map((tid) => (
                <option key={tid} value={tid}>
                  {TOPIC_META[tid].titleVi}
                </option>
              ))}
            </select>
            <button type="submit" className="fc-action-btn is-active">
              <Check size={15} /> Lưu
            </button>
            <button
              type="button"
              className="fc-action-btn"
              onClick={() => {
                setDeckTitle(deck.title);
                setDeckTopicId(deck.topicId || "");
                setIsRenamingDeck(false);
              }}
            >
              <X size={15} /> Hủy
            </button>
          </form>
        ) : (
          <div>
            <h3 style={{ margin: 0, fontSize: "1.08rem" }}>
              {deck.title}{" "}
              <span style={{ color: "#9aa5ba", fontSize: "0.84rem", fontWeight: 500 }}>
                ({cards.length} thẻ hiển thị)
              </span>
            </h3>
            {deck.description && (
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#9aa5ba" }}>
                {deck.description}
              </p>
            )}
          </div>
        )}

        <div className="fc-toolbar-actions">
          <button type="button" className="fc-action-btn" onClick={onOpenCreate}>
            <Plus size={15} /> Thêm thẻ
          </button>
          {!isRenamingDeck && (
            <button
              type="button"
              className="fc-action-btn"
              onClick={() => setIsRenamingDeck(true)}
            >
              <Pencil size={14} /> Đổi tên bộ thẻ
            </button>
          )}
          {onDeleteDeck && (
            confirmDeleteDeck ? (
              <>
                <button
                  type="button"
                  className="fc-btn-danger"
                  onClick={() => {
                    onDeleteDeck(deck.id);
                    setConfirmDeleteDeck(false);
                  }}
                >
                  Xác nhận xóa bộ thẻ
                </button>
                <button
                  type="button"
                  className="fc-action-btn"
                  onClick={() => setConfirmDeleteDeck(false)}
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                type="button"
                className="fc-btn-danger"
                onClick={() => setConfirmDeleteDeck(true)}
                title="Xóa bộ thẻ này"
              >
                <Trash2 size={14} /> Xóa bộ thẻ
              </button>
            )
          )}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="fc-empty-card" style={{ minHeight: 220 }}>
          <h3>Không có thẻ nào khớp bộ lọc</h3>
          <p>Thêm thẻ từ vựng mới hoặc đặt lại bộ lọc để xem toàn bộ thẻ trong bộ.</p>
        </div>
      ) : (
        <div className="fc-card-list">
          {cards.map((card) => {
            const isEditing = editingCardId === card.id;
            const isMastered = (card.masteryLevel || 0) >= MASTERY_LEVELS.STRONG;
            const isReview = (card.masteryLevel || 0) >= MASTERY_LEVELS.REVIEW && !isMastered;
            const ipaFormatted = formatIpaDisplay(card.ipa);

            if (isEditing && editDraft) {
              return (
                <form
                  key={card.id}
                  className="fc-list-edit-form"
                  onSubmit={(e) => handleSaveCardEdit(e, card.id)}
                >
                  <div className="fc-form-row">
                    <input
                      className="fc-input"
                      value={editDraft.frontVi}
                      onChange={(e) => setEditDraft((d) => ({ ...d, frontVi: e.target.value }))}
                      placeholder="Từ vựng tiếng Việt *"
                      aria-label="Sửa từ vựng tiếng Việt"
                      required
                    />
                    <div className="fc-form-row" style={{ gap: 8 }}>
                      <select
                        className="fc-select"
                        value={editDraft.pos}
                        onChange={(e) => setEditDraft((d) => ({ ...d, pos: e.target.value }))}
                        aria-label="Sửa loại từ"
                      >
                        <option value="">Loại từ</option>
                        {VIETNAMESE_POS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        className="fc-input"
                        value={editDraft.ipa}
                        onChange={(e) => setEditDraft((d) => ({ ...d, ipa: e.target.value }))}
                        placeholder="Phiên âm"
                        aria-label="Sửa phiên âm"
                      />
                    </div>
                  </div>
                  <input
                    className="fc-input"
                    value={editDraft.definition}
                    onChange={(e) => setEditDraft((d) => ({ ...d, definition: e.target.value }))}
                    placeholder="Định nghĩa *"
                    aria-label="Sửa định nghĩa"
                    required
                  />
                  <div className="fc-form-row">
                    <input
                      className="fc-input"
                      value={editDraft.exampleVi}
                      onChange={(e) => setEditDraft((d) => ({ ...d, exampleVi: e.target.value }))}
                      placeholder="Câu ví dụ tiếng Việt"
                      aria-label="Sửa câu ví dụ"
                    />
                    <input
                      className="fc-input"
                      value={editDraft.exampleEn}
                      onChange={(e) => setEditDraft((d) => ({ ...d, exampleEn: e.target.value }))}
                      placeholder="Dịch ví dụ (tuỳ chọn)"
                      aria-label="Sửa dịch ví dụ"
                    />
                  </div>
                  <div className="fc-btn-row">
                    <button
                      type="submit"
                      className="fc-action-btn is-active"
                      disabled={savingId === card.id}
                    >
                      <Check size={15} /> {savingId === card.id ? "Đang lưu..." : "Lưu thẻ"}
                    </button>
                    <button
                      type="button"
                      className="fc-action-btn"
                      onClick={() => {
                        setEditingCardId(null);
                        setEditDraft(null);
                      }}
                    >
                      <X size={15} /> Hủy
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div key={card.id} className="fc-card-list-item">
                <div className="fc-list-item-main">
                  <div className="fc-list-item-top">
                    <strong>{card.frontVi}</strong>
                    {card.pos && <span className="fc-list-pos">{card.pos}</span>}
                    {ipaFormatted && <span className="fc-list-ipa">{ipaFormatted}</span>}
                    {isMastered && (
                      <span className="fc-status-dot-badge mastered">Đã thuộc</span>
                    )}
                    {isReview && <span className="fc-status-dot-badge review">Cần ôn</span>}
                  </div>
                  <div className="fc-list-def">{card.definition}</div>
                  {card.exampleVi && <div className="fc-list-ex">VD: {card.exampleVi}</div>}
                </div>

                <div className="fc-list-actions">
                  <button
                    type="button"
                    className="fc-icon-ghost"
                    onClick={() => speakVietnamese(card.frontVi)}
                    aria-label={`Nghe phát âm ${card.frontVi}`}
                    title="Nghe phát âm"
                  >
                    <Volume2 size={17} />
                  </button>
                  {onUpdateCard && (
                    <button
                      type="button"
                      className="fc-icon-ghost"
                      onClick={() => handleStartEditCard(card)}
                      aria-label={`Chỉnh sửa thẻ ${card.frontVi}`}
                      title="Chỉnh sửa thẻ"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {onDeleteCard && (
                    <button
                      type="button"
                      className="fc-icon-ghost"
                      onClick={() => onDeleteCard(card.id)}
                      aria-label={`Xóa thẻ ${card.frontVi}`}
                      title="Xóa thẻ"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FlashcardDeckManager;
