/**
 * 退出确认对话框
 * 用于确认退出战斗界面的操作
 */

import React, { useEffect, useCallback } from 'react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  }, [onConfirm, onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onCancel}
      />
      
      <div className="relative w-full max-w-sm bg-[#FDFBF7] rounded-[2.5rem] border-8 border-white shadow-[0_60px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 fade-in duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
           <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        </div>

        <div className="relative z-10 h-16 px-8 flex items-center justify-between border-b border-[#1A1A1A]/5 bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#8D2F2F]" />
            <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.4em]">辞行学宫 · FAREWELL</span>
          </div>
          <button
            onClick={onCancel}
            className="text-[#1A1A1A]/20 hover:text-[#1A1A1A] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="relative z-10 p-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-[#8D2F2F]/5 border-2 border-[#8D2F2F]/10 flex items-center justify-center mb-6 shadow-inner">
               <span className="text-3xl font-black text-[#8D2F2F] italic serif">?</span>
            </div>
            <h3 className="text-xl font-black text-[#1A1A1A] mb-3 uppercase tracking-tight">
              确定要以此辞行吗？
            </h3>
            <p className="text-[11px] font-bold text-[#1A1A1A]/40 leading-relaxed uppercase tracking-widest italic serif">
              若此刻离去，论战笔录将难以为继，所悟机缘亦将随风消散。
            </p>
          </div>

          <div className="p-6 rounded-[2rem] bg-white border-2 border-[#1A1A1A]/5 mb-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF65]" />
               <span className="text-[9px] font-black text-[#D4AF65] uppercase tracking-widest leading-none">慎思笃行 · CAUTION</span>
            </div>
            <ul className="space-y-2">
              <li className="text-[10px] font-black text-[#1A1A1A]/30 uppercase tracking-widest flex items-center gap-3">
                 <span className="text-[8px] opacity-30">01</span> 战斗记录将彻底作废
              </li>
              <li className="text-[10px] font-black text-[#1A1A1A]/30 uppercase tracking-widest flex items-center gap-3">
                 <span className="text-[8px] opacity-30">02</span> 胜负奖励将无法入库
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-95 shadow-sm"
            >
              再思 (STAY)
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 rounded-2xl bg-[#8D2F2F] text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#A13A3A] transition-all active:scale-95 shadow-xl shadow-[#8D2F2F]/20"
            >
              执意 (LEAVE)
            </button>
          </div>
        </div>

        <div className="relative z-10 h-12 px-8 flex items-center justify-between border-t border-[#1A1A1A]/5 bg-white uppercase overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-[#5C4033]/20 tracking-widest uppercase">ESC to reconsider</span>
          </div>
          <span className="text-[8px] font-black text-[#8D2F2F]/40 tracking-widest italic uppercase">Action Required</span>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmModal;
