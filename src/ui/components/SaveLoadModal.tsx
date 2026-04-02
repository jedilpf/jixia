import { useEffect, useMemo, useState } from 'react';
import { uiAudio } from '@/utils/audioManager';
import type { SaveSlotInfo, SaveSlotType } from '@/game/story/StoryEngine';

interface SaveSlotDisplay {
  slot: SaveSlotType;
  label: string;
  info: SaveSlotInfo;
}

interface SaveLoadModalProps {
  mode: 'save' | 'load';
  open: boolean;
  slots: Record<SaveSlotType, SaveSlotInfo>;
  onSave: (slot: SaveSlotType) => void;
  onLoad: (slot: SaveSlotType) => void;
  onClose: () => void;
}

function formatTimestamp(ts?: number): string {
  if (!ts) return '未知时间';
  const date = new Date(ts);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatChapter(chapter?: number): string {
  if (chapter === undefined) return '未知章节';
  if (chapter === 0) return '序章';
  return `第 ${chapter} 章`;
}

function formatNodeId(nodeId?: string): string {
  if (!nodeId) return '未知节点';
  return nodeId.length > 36 ? `${nodeId.slice(0, 33)}...` : nodeId;
}

function formatSlotLabel(slot: SaveSlotType): string {
  if (slot === 'autosave') return '自动存档';
  if (slot === 'manual_1') return '手动存档 1';
  if (slot === 'manual_2') return '手动存档 2';
  return '手动存档 3';
}

function getSlotDisplays(mode: 'save' | 'load', slots: Record<SaveSlotType, SaveSlotInfo>): SaveSlotDisplay[] {
  const manualSlots: SaveSlotType[] = ['manual_1', 'manual_2', 'manual_3'];
  const manualDisplays = manualSlots.map((slot) => ({
    slot,
    label: formatSlotLabel(slot),
    info: slots[slot],
  }));

  if (mode === 'save') {
    return manualDisplays;
  }

  return [
    {
      slot: 'autosave',
      label: formatSlotLabel('autosave'),
      info: slots.autosave,
    },
    ...manualDisplays,
  ];
}

export function SaveLoadModal({ mode, open, slots, onSave, onLoad, onClose }: SaveLoadModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<SaveSlotType | null>(null);
  const [confirmSlot, setConfirmSlot] = useState<SaveSlotType | null>(null);
  const [confirmAction, setConfirmAction] = useState<'overwrite' | 'load' | null>(null);

  const slotDisplays = useMemo(() => getSlotDisplays(mode, slots), [mode, slots]);

  useEffect(() => {
    if (!open) {
      setSelectedSlot(null);
      setConfirmSlot(null);
      setConfirmAction(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      uiAudio.playClick();
      if (confirmSlot) {
        setConfirmSlot(null);
        setConfirmAction(null);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, confirmSlot]);

  if (!open) return null;

  const runSave = (slot: SaveSlotType) => {
    onSave(slot);
    setSelectedSlot(null);
  };

  const runLoad = (slot: SaveSlotType) => {
    onLoad(slot);
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot: SaveSlotType, info: SaveSlotInfo) => {
    const loadDisabled = mode === 'load' && !info.exists;
    if (loadDisabled) {
      uiAudio.playHover();
      return;
    }

    uiAudio.playClick();
    setSelectedSlot(slot);

    if (mode === 'save') {
      if (info.exists) {
        setConfirmSlot(slot);
        setConfirmAction('overwrite');
      } else {
        runSave(slot);
      }
      return;
    }

    setConfirmSlot(slot);
    setConfirmAction('load');
  };

  const closeConfirm = () => {
    uiAudio.playClick();
    setConfirmSlot(null);
    setConfirmAction(null);
  };

  const handleConfirm = () => {
    if (!confirmSlot || !confirmAction) return;
    if (confirmAction === 'overwrite') {
      runSave(confirmSlot);
    } else {
      runLoad(confirmSlot);
    }
    setConfirmSlot(null);
    setConfirmAction(null);
  };

  const title = mode === 'save' ? '存档' : '读档';
  const subtitle =
    mode === 'save'
      ? '选择一个手动槽位保存当前进度。已有数据的槽位会二次确认。'
      : '选择存档恢复进度。读取后会覆盖当前游戏状态。';

  const confirmSlotLabel = confirmSlot ? formatSlotLabel(confirmSlot) : '';
  const confirmMessage =
    confirmAction === 'overwrite'
      ? `确认覆盖 ${confirmSlotLabel} 吗？此操作不可撤销。`
      : `确认读取 ${confirmSlotLabel} 吗？当前进度将被替换。`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => {
        uiAudio.playClick();
        onClose();
      }}
    >
      <section
        aria-label={`${title}面板`}
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'relative',
          width: 520,
          maxWidth: '94vw',
          borderRadius: 10,
          border: '1px solid rgba(139,115,85,0.55)',
          background: 'linear-gradient(160deg, #f0e8d5 0%, #e8dcc4 55%, #d6c9a8 100%)',
          boxShadow: '0 24px 56px rgba(0,0,0,0.55)',
          overflow: 'hidden',
        }}
      >
        <header style={{ padding: '18px 20px', borderBottom: '1px solid rgba(139,115,85,0.35)' }}>
          <div style={{ fontSize: 22, letterSpacing: 1.5, color: '#2a1e0e', fontWeight: 700 }}>{title}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#6f5a3f', lineHeight: 1.5 }}>{subtitle}</div>
        </header>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '64vh', overflowY: 'auto' }}>
          {slotDisplays.map(({ slot, label, info }) => {
            const disabled = mode === 'load' && !info.exists;
            const active = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => handleSlotClick(slot, info)}
                onMouseEnter={() => uiAudio.playHover()}
                disabled={disabled}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '13px 14px',
                  borderRadius: 8,
                  border: active ? '2px solid rgba(139,115,85,0.7)' : '1px solid rgba(139,115,85,0.35)',
                  background: active ? 'rgba(139,115,85,0.16)' : 'rgba(255,255,255,0.38)',
                  color: '#2a1e0e',
                  textAlign: 'left',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.45 : 1,
                  transition: 'all 0.16s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      borderRadius: 999,
                      padding: '2px 8px',
                      border: '1px solid rgba(139,115,85,0.4)',
                      color: info.exists ? '#4f3d25' : '#8a7a63',
                      background: info.exists ? 'rgba(139,115,85,0.12)' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {info.exists ? '已存档' : '空槽位'}
                  </span>
                </div>

                {info.exists ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12, color: '#6f5a3f' }}>
                    <span>章节：{formatChapter(info.chapter)}</span>
                    <span>探索：{info.nodeCount ?? 0} 节点</span>
                    <span style={{ gridColumn: '1 / span 2' }}>节点：{formatNodeId(info.currentNodeId)}</span>
                    <span style={{ gridColumn: '1 / span 2' }}>时间：{formatTimestamp(info.timestamp)}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#8f826d' }}>
                    {mode === 'save' ? '可用于新的手动存档。' : '当前没有可读取的存档数据。'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <footer style={{ padding: '12px 16px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6f5a3f' }}>提示：按 Esc 可快速关闭。</span>
          <button
            onClick={() => {
              uiAudio.playClick();
              onClose();
            }}
            onMouseEnter={() => uiAudio.playHover()}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid rgba(139,115,85,0.45)',
              background: '#f8f3e8',
              color: '#3b2c17',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            关闭
          </button>
        </footer>

        {confirmSlot && confirmAction && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.38)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                width: 340,
                maxWidth: '88vw',
                background: '#f6eddc',
                borderRadius: 8,
                border: '1px solid rgba(139,115,85,0.45)',
                boxShadow: '0 12px 26px rgba(0,0,0,0.35)',
                padding: 18,
              }}
            >
              <div style={{ fontSize: 15, color: '#2a1e0e', lineHeight: 1.6 }}>{confirmMessage}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  onClick={closeConfirm}
                  onMouseEnter={() => uiAudio.playHover()}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    border: '1px solid rgba(120,120,120,0.45)',
                    background: '#f3f3f3',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  onMouseEnter={() => uiAudio.playHover()}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    border: '1px solid rgba(139,115,85,0.55)',
                    background: '#5e4a2f',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
