import { useEffect, useState } from 'react';
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

function formatTimestamp(ts: number | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getChapterLabel(chapter: number | undefined): string {
  if (!chapter) return '';
  if (chapter === 1) return '第一章·百家争鸣';
  if (chapter === 2) return '第二章·问道';
  return `第${chapter}章`;
}

export function SaveLoadModal({ mode, open, slots, onSave, onLoad, onClose }: SaveLoadModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<SaveSlotType | null>(null);
  const [confirmSlot, setConfirmSlot] = useState<SaveSlotType | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedSlot(null);
      setConfirmSlot(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { uiAudio.playClick(); onClose(); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

  const slotDisplays: SaveSlotDisplay[] = [
    { slot: 'autosave', label: '自动存档', info: slots.autosave },
    { slot: 'manual_1', label: '手动存档 1', info: slots.manual_1 },
    { slot: 'manual_2', label: '手动存档 2', info: slots.manual_2 },
    { slot: 'manual_3', label: '手动存档 3', info: slots.manual_3 },
  ];

  const handleSlotClick = (slot: SaveSlotType, info: SaveSlotInfo) => {
    uiAudio.playClick();
    setSelectedSlot(slot);

    if (mode === 'save') {
      if (info.exists) {
        setConfirmSlot(slot);
      } else {
        onSave(slot);
        setSelectedSlot(null);
      }
    } else {
      if (info.exists) {
        onLoad(slot);
        setSelectedSlot(null);
      }
    }
  };

  const handleConfirm = () => {
    if (confirmSlot) {
      onSave(confirmSlot);
      setConfirmSlot(null);
      setSelectedSlot(null);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmSlot(null);
  };

  const title = mode === 'save' ? '💾 存档' : '📂 读档';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        animation: 'modal-fade-in 0.15s ease-out',
      }}
      onClick={() => { uiAudio.playClick(); onClose(); }}
    >
      <style>{`
        @keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scroll-drop-in {
          0% { opacity: 0; transform: scaleY(0.2) scaleX(0.9) translateY(-30px); }
          60% { transform: scaleY(1.03) scaleX(0.98); }
          100% { opacity: 1; transform: scaleY(1) scaleX(1) translateY(0); }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '420px',
          background: 'linear-gradient(160deg, #f0e8d5 0%, #e8dcc4 50%, #d6c9a8 100%)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.85), inset 0 0 40px rgba(139,115,85,0.12)',
          borderRadius: '4px',
          overflow: 'hidden',
          animation: 'scroll-drop-in 0.4s cubic-bezier(0.2,0.8,0.2,1) forwards',
        }}
      >
        <div style={{ height: '10px', background: 'linear-gradient(90deg, #3d2616, #6e4a28, #8b6040, #6e4a28, #3d2616)', boxShadow: '0 3px 8px rgba(0,0,0,0.5)' }} />

        <div style={{ position: 'absolute', inset: '10px', background: 'repeating-linear-gradient(90deg, transparent, transparent 36px, rgba(139,115,85,0.1) 37px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '10px 12px 10px 12px', border: '1px solid rgba(139,115,85,0.35)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', padding: '28px 32px 24px', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '24px', letterSpacing: '4px', color: '#2a1e0e', margin: 0 }}>
              {title}
            </p>
            <p style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '12px', letterSpacing: '2px', color: '#7a6347', marginTop: '6px' }}>
              {mode === 'save' ? '— 记录当前进度 —' : '— 选择存档 —'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {slotDisplays.map(({ slot, label, info }) => (
              <button
                key={slot}
                onClick={() => handleSlotClick(slot, info)}
                onMouseEnter={() => uiAudio.playHover()}
                disabled={mode === 'load' && !info.exists}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px 16px',
                  background: selectedSlot === slot
                    ? 'rgba(139,115,85,0.2)'
                    : 'rgba(255,255,255,0.3)',
                  border: `2px solid ${selectedSlot === slot ? 'rgba(139,115,85,0.6)' : 'rgba(139,115,85,0.25)'}`,
                  borderRadius: '4px',
                  cursor: mode === 'load' && !info.exists ? 'not-allowed' : 'pointer',
                  opacity: mode === 'load' && !info.exists ? 0.5 : 1,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '16px', letterSpacing: '2px', color: '#2a1e0e' }}>
                    {label}
                  </span>
                  {info.exists && (
                    <span style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '12px', color: '#7a6347' }}>
                      {getChapterLabel(info.chapter)}
                    </span>
                  )}
                </div>
                {info.exists ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '4px' }}>
                    <span style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '12px', color: '#7a6347' }}>
                      {formatTimestamp(info.timestamp)}
                    </span>
                    <span style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '12px', color: '#7a6347' }}>
                      已访{info.nodeCount}节点
                    </span>
                  </div>
                ) : (
                  <span style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '12px', color: '#9a8a7a', marginTop: '4px' }}>
                    （空）
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => { uiAudio.playClick(); onClose(); }}
              onMouseEnter={() => uiAudio.playHover()}
              style={{
                padding: '10px 32px',
                background: 'linear-gradient(135deg, #3d4a3a 0%, #2a3527 100%)',
                border: '2px solid rgba(80,110,70,0.6)',
                borderRadius: '3px',
                color: '#a7c5ba',
                fontFamily: '"STKaiti", serif',
                fontSize: '14px', letterSpacing: '3px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
              }}
            >
              取消
            </button>
          </div>
        </div>

        <div style={{ height: '10px', background: 'linear-gradient(90deg, #3d2616, #6e4a28, #8b6040, #6e4a28, #3d2616)', boxShadow: '0 -3px 8px rgba(0,0,0,0.5)' }} />

        {confirmSlot && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: 'linear-gradient(160deg, #f0e8d5 0%, #e8dcc4 100%)',
                padding: '24px 32px',
                borderRadius: '4px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <p style={{ fontFamily: '"STKaiti", "楷体", serif', fontSize: '16px', color: '#2a1e0e', marginBottom: '20px' }}>
                存档位已有数据，确认覆盖？
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={handleConfirm}
                  onMouseEnter={() => uiAudio.playHover()}
                  style={{
                    padding: '8px 24px',
                    background: 'linear-gradient(135deg, #8b2a2a 0%, #6b1f1f 100%)',
                    border: '2px solid rgba(180,80,80,0.6)',
                    borderRadius: '3px',
                    color: '#f5e6b8',
                    fontFamily: '"STKaiti", serif',
                    fontSize: '14px', letterSpacing: '2px',
                    cursor: 'pointer',
                  }}
                >
                  确定
                </button>
                <button
                  onClick={handleCancelConfirm}
                  onMouseEnter={() => uiAudio.playHover()}
                  style={{
                    padding: '8px 24px',
                    background: 'linear-gradient(135deg, #4a4a4a 0%, #333 100%)',
                    border: '2px solid rgba(100,100,100,0.6)',
                    borderRadius: '3px',
                    color: '#ccc',
                    fontFamily: '"STKaiti", serif',
                    fontSize: '14px', letterSpacing: '2px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
