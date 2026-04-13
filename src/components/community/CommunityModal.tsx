import { useEffect } from 'react';
import { uiAudio } from '@/utils/audioManager';
import { useCommunityState } from '../../hooks/useCommunityState';
import { CommunityHome } from './CommunityHome';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommunityModal({ isOpen, onClose }: CommunityModalProps) {
  const {
    actions: { openHome, closeCommunity },
  } = useCommunityState();

  useEffect(() => {
    if (isOpen) {
      openHome();
    }
  }, [isOpen, openHome]);

  if (!isOpen) return null;

  const handleClose = () => {
    uiAudio.playClick();
    closeCommunity();
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{
        background:
          'radial-gradient(circle at top, rgba(214, 151, 73, 0.16) 0%, rgba(76, 22, 18, 0.84) 40%, rgba(16, 6, 8, 0.92) 100%)',
        backdropFilter: 'blur(10px)',
        animation: 'modal-fade-in 0.2s ease-out',
      }}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(43, 16, 14, 0.98) 0%, rgba(20, 8, 10, 0.98) 100%)',
          border: '1px solid rgba(214, 151, 73, 0.34)',
          boxShadow:
            '0 22px 60px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255,244,230,0.04), 0 0 0 1px rgba(214,151,73,0.12)',
          animation: 'modal-scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(214,151,73,0.16) 0%, transparent 28%), radial-gradient(circle at bottom right, rgba(158,61,43,0.16) 0%, transparent 30%)',
          }}
        />

        <div
          className="relative flex h-16 shrink-0 items-center justify-between px-6 md:px-7"
          style={{
            background:
              'linear-gradient(90deg, rgba(78, 25, 18, 0.98) 0%, rgba(122, 42, 28, 0.98) 50%, rgba(78, 25, 18, 0.98) 100%)',
            borderBottom: '1px solid rgba(214, 151, 73, 0.24)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{
                background: 'linear-gradient(180deg, rgba(214, 151, 73, 0.34), rgba(158, 61, 43, 0.14))',
                border: '1px solid rgba(214, 151, 73, 0.32)',
                boxShadow: '0 0 24px rgba(214,151,73,0.2)',
              }}
            >
              🏛️
            </div>
            <div className="h-6 w-0.5 rounded-full bg-[#d4a520]" />
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-[0.28em] text-[#f5e6b8]">稷下学宫·社区</span>
              <span className="text-[11px] uppercase tracking-[0.24em]" style={{ color: 'rgba(214, 177, 140, 0.72)' }}>
                discourse / archive / q&amp;a
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors"
            style={{
              background: 'rgba(35, 10, 11, 0.34)',
              border: '1px solid rgba(214, 151, 73, 0.18)',
              color: '#d9c3a0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(176, 83, 39, 0.28)';
              e.currentTarget.style.color = '#f5e6b8';
              uiAudio.playHover();
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(35, 10, 11, 0.34)';
              e.currentTarget.style.color = '#d9c3a0';
            }}
          >
            ×
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden p-4 md:p-6">
          <CommunityHome />
        </div>

        <style>{`
          @keyframes modal-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modal-scale-up {
            from { transform: scale(0.95) translateY(-10px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
