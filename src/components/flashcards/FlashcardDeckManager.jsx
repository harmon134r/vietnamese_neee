import React, { useEffect, useState } from "react";
import {
  Check,
  GraduationCap,
  Pencil,
  Plus,
  Send,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { MASTERY_LEVELS, TOPIC_IDS, TOPIC_META } from "../../lib/contracts.js";
import { speakVietnamese } from "../../lib/speech.js";
import { VIETNAMESE_POS_OPTIONS } from "../../lib/flashcardParser.js";

export function FlashcardDeckManager({
  deck,
  cards = [],
  isTeacher = false,
  teacherName = "",
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
  const [togglingAssign, setTogglingAssign] = useState(false);

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
      <div className="fc-empty-card is-compact">
        <h3>Chưa chọn bộ thẻ nào</h3>
        <p>Chọn một bộ thẻ hoặc tạo bộ thẻ mới để quản lý danh sách từ vựng.</p>
      </div>
    );
  }

  const isReadOnlyAssigned = Boolean(deck.isAssigned && deck.canEdit === false);
  const canEditDeck = !isReadOnlyAssigned;
  const canToggleAssign = Boolean(isTeacher && canEditDeck && onUpdateDeck);

  const handleSaveDeckMeta = async (e) => {
    e.preventDefault();
    if (!deckTitle.trim() || !canEditDeck) return;
    await onUpdateDeck?.(deck.id, {
      title: deckTitle.trim(),
      topicId: deckTopicId || null,
    });
    setIsRenamingDeck(false);
  };

  const handleToggleAssignDeck = async () => {
    if (!canToggleAssign || togglingAssign) return;
    setTogglingAssign(true);
    try {
      await onUpdateDeck(deck.id, {
        isAssigned: !deck.isAssigned,
        teacherName: teacherName || deck.teacherName || "",
      });
    } finally {
      setTogglingAssign(false);
    }
  };

  const handleStartEditCard = (card) => {
    if (!canEditDeck) return;
    setEditingCardId(card.id);
    setEditDraft({
      frontVi: card.frontVi || "",
      pos: card.pos || "",
      definition: card.definition || "",
      exampleVi: card.exampleVi || "",
      exampleEn: card.exampleEn || "",
      notes: card.notes || "",
    });
  };

  const handleSaveCardEdit = async (e, cardId) => {
    e.preventDefault();
    if (!canEditDeck || !editDraft?.frontVi?.trim() || !editDraft?.definition?.trim()) return;
    setSavingId(cardId);
    try {
      await onUpdateCard?.(cardId, {
        frontVi: editDraft.frontVi.trim(),
        pos: editDraft.pos.trim(),
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
        {isRenamingDeck && canEditDeck ? (
          <form className="fc-manager-deck-edit" onSubmit={handleSaveDeckMeta}>
            <input
              className="fc-input"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              aria-label="Tên bộ thẻ"
              required
            />
            <select
              className="fc-select"
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
              <Check size={14} />
              <span>Lưu</span>
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
              <X size={14} />
              <span>Hủy</span>
            </button>
          </form>
        ) : (
          <div className="fc-manager-title-wrap">
            <h3 className="fc-manager-title">
              <span>{deck.title}</span>
              {deck.isAssigned && (
                <span className="fc-deck-assigned-tag">GV giao</span>
              )}
              <span className="fc-manager-count">{cards.length} thẻ</span>
            </h3>
            {deck.description && <p className="fc-manager-desc">{deck.description}</p>}
          </div>
        )}

        {canEditDeck && (
          <div className="fc-toolbar-actions">
            {canToggleAssign && (
              <button
                type="button"
                className={`fc-assign-toggle-btn ${deck.isAssigned ? "is-assigned" : ""}`}
                onClick={handleToggleAssignDeck}
                disabled={togglingAssign}
                aria-pressed={Boolean(deck.isAssigned)}
                data-testid="fc-manager-assign-btn"
              >
                {deck.isAssigned ? (
                  <>
                    <Check size={14} aria-hidden="true" />
                    <span>Đang giao cho HS</span>
                  </>
                ) : (
                  <>
                    <Send size={13} aria-hidden="true" />
                    <span>Giao cho học sinh</span>
                  </>
                )}
              </button>
            )}

            <button type="button" className="fc-action-btn" onClick={onOpenCreate}>
              <Plus size={14} />
              <span>Thêm thẻ</span>
            </button>

            {!isRenamingDeck && (
              <button
                type="button"
                className="fc-action-btn"
                onClick={() => setIsRenamingDeck(true)}
              >
                <Pencil size={13} />
                <span>Đổi tên</span>
              </button>
            )}

            {onDeleteDeck &&
              (confirmDeleteDeck ? (
                <>
                  <button
                    type="button"
                    className="fc-btn-danger"
                    onClick={() => {
                      onDeleteDeck(deck.id);
                      setConfirmDeleteDeck(false);
                    }}
                  >
                    Xác nhận xóa
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
                  <Trash2 size={13} />
                  <span>Xóa bộ thẻ</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {isReadOnlyAssigned && (
        <div
          className="fc-assigned-readonly-bar"
          role="status"
          data-testid="fc-assigned-readonly-bar"
        >
          <GraduationCap size={16} aria-hidden="true" />
          <span>
            Bộ thẻ giáo viên giao ({deck.teacherName || "Giáo viên"}) · Bạn có thể học, nghe phát âm
            và lưu tiến độ thuộc thẻ của riêng mình.
          </span>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="fc-empty-card is-compact">
          <h3>Không có thẻ nào khớp bộ lọc</h3>
          <p>
            {canEditDeck
              ? "Thêm thẻ từ vựng mới hoặc đặt lại bộ lọc để xem toàn bộ danh sách thẻ."
              : "Đặt lại bộ lọc để xem toàn bộ danh sách thẻ giáo viên giao."}
          </p>
        </div>
      ) : (
        <div className="fc-table-shell">
          <div className="fc-table-head" aria-hidden="true">
            <span>Từ vựng</span>
            <span>Định nghĩa &amp; ví dụ</span>
            <span>Trạng thái</span>
            <span className="fc-table-head-actions">Thao tác</span>
          </div>

          <div className="fc-card-list">
            {cards.map((card) => {
              const isEditing = canEditDeck && editingCardId === card.id;
              const isMastered = (card.masteryLevel || 0) >= MASTERY_LEVELS.STRONG;
              const isReview =
                (card.masteryLevel || 0) >= MASTERY_LEVELS.REVIEW && !isMastered;

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
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, frontVi: e.target.value }))
                        }
                        placeholder="Từ vựng tiếng Việt *"
                        aria-label="Sửa từ vựng tiếng Việt"
                        required
                      />
                      <select
                        className="fc-select"
                        value={editDraft.pos}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, pos: e.target.value }))
                        }
                        aria-label="Sửa loại từ"
                      >
                        <option value="">Loại từ</option>
                        {VIETNAMESE_POS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      className="fc-input"
                      value={editDraft.definition}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, definition: e.target.value }))
                      }
                      placeholder="Định nghĩa *"
                      aria-label="Sửa định nghĩa"
                      required
                    />
                    <div className="fc-form-row">
                      <input
                        className="fc-input"
                        value={editDraft.exampleVi}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, exampleVi: e.target.value }))
                        }
                        placeholder="Câu ví dụ tiếng Việt"
                        aria-label="Sửa câu ví dụ"
                      />
                      <input
                        className="fc-input"
                        value={editDraft.exampleEn}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, exampleEn: e.target.value }))
                        }
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
                        <Check size={14} />
                        <span>{savingId === card.id ? "Đang lưu..." : "Lưu thẻ"}</span>
                      </button>
                      <button
                        type="button"
                        className="fc-action-btn"
                        onClick={() => {
                          setEditingCardId(null);
                          setEditDraft(null);
                        }}
                      >
                        <X size={14} />
                        <span>Hủy</span>
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div key={card.id} className="fc-card-list-item">
                  <div className="fc-table-term">
                    <strong>{card.frontVi}</strong>
                    {card.pos && (
                      <div className="fc-table-meta">
                        <span className="fc-list-pos">{card.pos}</span>
                      </div>
                    )}
                  </div>

                  <div className="fc-table-meaning">
                    <div className="fc-list-def">{card.definition}</div>
                    {card.exampleVi && <div className="fc-list-ex">VD: {card.exampleVi}</div>}
                  </div>

                  <div className="fc-table-status">
                    {isMastered ? (
                      <span className="fc-status-dot-badge mastered">Đã thuộc</span>
                    ) : isReview ? (
                      <span className="fc-status-dot-badge review">Cần ôn</span>
                    ) : (
                      <span className="fc-status-dot-badge fresh">Chưa học</span>
                    )}
                  </div>

                  <div className="fc-list-actions">
                    <button
                      type="button"
                      className="fc-icon-ghost"
                      onClick={() => speakVietnamese(card.frontVi)}
                      aria-label={`Nghe phát âm ${card.frontVi}`}
                      title="Nghe phát âm"
                    >
                      <Volume2 size={16} />
                    </button>
                    {canEditDeck && onUpdateCard && (
                      <button
                        type="button"
                        className="fc-icon-ghost"
                        onClick={() => handleStartEditCard(card)}
                        aria-label={`Chỉnh sửa thẻ ${card.frontVi}`}
                        title="Chỉnh sửa thẻ"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {canEditDeck && onDeleteCard && (
                      <button
                        type="button"
                        className="fc-icon-ghost is-danger"
                        onClick={() => onDeleteCard(card.id)}
                        aria-label={`Xóa thẻ ${card.frontVi}`}
                        title="Xóa thẻ"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardDeckManager;
