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
  if (!ts) return '';
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatChapter(chapter?: number): string {
  if (chapter === undefined) return '';
  if (chapter === 0) return '序章';
  return `第 ${chapter} 章`;
}

function getSlotDisplays(mode: 'save' | 'load', slots: Record<SaveSlotType, SaveSlotInfo>): SaveSlotDisplay[] {
  const manual: SaveSlotDisplay[] = [
    { slot: 'manual_1', label: '手动存档 1', info: slots.manual_1 },
    { slot: 'manual_2', label: '手动存档 2', info: slots.manual_2 },
    { slot: 'manual_3', label: '手动存档 3', info: slots.manual_3 },
  ];
  if (mode === 'save') return manual;
  return [{ slot: 'autosave', label: '自动存档', info: slots.autosave }, ...manual];
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
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        uiAudio.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

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

    if (!info.exists) return;
    setConfirmSlot(slot);
    setConfirmAction('load');
  };

  const closeConfirm = () => {
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
    closeConfirm();
  };

  const title = mode === 'save' ? '存档' : '读档';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => {
        uiAudio.playClick();
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 440,
          maxWidth: '92vw',
          borderRadius: 8,
          border: '1px solid rgba(139,115,85,0.55)',
          background: 'linear-gradient(160deg, #f0e8d5 0%, #e8dcc4 55%, #d6c9a8 100%)',
          boxShadow: '0 18px 52px rgba(0,0,0,0.55)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(139,115,85,0.35)' }}>
          <div style={{ fontSize: 22, letterSpacing: 2, color: '#2a1e0e', fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#6f5a3f', marginTop: 4 }}>
            {mode === 'save' ? '选择一个手动槽位保存当前进度' : '选择一个存档槽位继续'}
          </div>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {slotDisplays.map(({ slot, label, info }) => (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot, info)}
              onMouseEnter={() => uiAudio.playHover()}
              disabled={mode === 'load' && !info.exists}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 6,
                width: '100%',
                padding: '12px 14px',
                borderRadius: 6,
                border: selectedSlot === slot ? '2px solid rgba(139,115,85,0.65)' : '1px solid rgba(139,115,85,0.35)',
                background: selectedSlot === slot ? 'rgba(139,115,85,0.16)' : 'rgba(255,255,255,0.35)',
                color: '#2a1e0e',
                textAlign: 'left',
                cursor: mode === 'load' && !info.exists ? 'not-allowed' : 'pointer',
                opacity: mode === 'load' && !info.exists ? 0.45 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{label}</span>
                {info.exists && <span style={{ fontSize: 12, color: '#6f5a3f' }}>{formatChapter(info.chapter)}</span>}
              </div>
              {info.exists ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, color: '#6f5a3f' }}>
                  <span>{formatTimestamp(info.timestamp)}</span>
                  <span>已访问 {info.nodeCount ?? 0} 节点</span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#8f826d' }}>（空）</div>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: '12px 16px 16px', display: 'flex', justifyContent: 'flex-end' }}>
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
        </div>

        {confirmSlot && confirmAction && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 320,
                maxWidth: '86vw',
                background: '#f6eddc',
                borderRadius: 8,
                border: '1px solid rgba(139,115,85,0.45)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
                padding: 18,
              }}
            >
              <div style={{ fontSize: 15, color: '#2a1e0e', lineHeight: 1.6 }}>
                {confirmAction === 'overwrite'
                  ? '该槽位已有数据，确认覆盖吗？'
                  : '读取后会覆盖当前进度，确认继续吗？'}
              </div>
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
      </div>
    </div>
  );
}
