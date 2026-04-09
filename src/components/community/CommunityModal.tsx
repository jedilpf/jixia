import { useEffect } from 'react';
import { CommunityHome } from './CommunityHome';
import { useCommunityState } from '../../hooks/useCommunityState';
import { uiAudio } from '@/utils/audioManager';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommunityModal({ isOpen, onClose }: CommunityModalProps) {
  const { actions } = useCommunityState();

  useEffect(() => {
    if (isOpen) {
      actions.openHome();
    }
  }, [isOpen, actions]);

  if (!isOpen) return null;

  const handleClose = () => {
    uiAudio.playClick();
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        animation: 'modal-fade-in 0.2s ease-out',
      }}
    >
      <div
        className="w-full max-w-4xl h-[90vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #10192e 0%, #0a1020 100%)',
          border: '2px solid rgba(212, 165, 32, 0.5)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 165, 32, 0.1)',
          animation: 'modal-scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div
          className="h-14 flex items-center justify-between px-6 shrink-0"
          style={{
            background: 'linear-gradient(90deg, #1a2840 0%, #2a3c66 50%, #1a2840 100%)',
            borderBottom: '1px solid rgba(212, 165, 32, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212, 165, 32, 0.2)' }}
            >
              🏛️
            </div>
            <div className="w-0.5 h-5 bg-[#d4a520] rounded-full" />
            <span className="text-[#f5e6b8] font-serif text-lg tracking-widest">稷下学宫·社区</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                uiAudio.playClick();
              }}
              className="px-3 py-1 rounded-lg text-sm transition-colors"
              style={{
                background: 'rgba(212, 165, 32, 0.1)',
                border: '1px solid rgba(212, 165, 32, 0.3)',
                color: '#a7c5ba',
              }}
              onMouseEnter={() => uiAudio.playHover()}
            >
              📝 发布
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xl transition-colors"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 32, 0.2)',
                color: '#a7c5ba',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(212, 165, 32, 0.2)';
                e.currentTarget.style.color = '#f5e6b8';
                uiAudio.playHover();
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.color = '#a7c5ba';
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4 md:p-6">
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
