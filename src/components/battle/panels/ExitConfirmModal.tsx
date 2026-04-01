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
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      <div className="relative w-[420px] bg-gradient-to-b from-[#1a1510] via-[#151210] to-[#0d0b08] rounded-2xl border border-[#5c4d3a]/50 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#3d3225]/50 bg-gradient-to-r from-[#1a1510] to-[#151210]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9725a] to-[#8a4a3a] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-[#c9b896] font-medium">退出确认</span>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-[#2a2318] border border-[#3d3225] text-[#8a7a6a] hover:text-[#c9725a] hover:border-[#c9725a]/50 transition-all flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#c9725a]/10 border border-[#c9725a]/30 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#c9725a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#d4c4a8] mb-2">
                确定要退出当前战斗吗？
              </h3>
              <p className="text-sm text-[#8a7a6a] leading-relaxed">
                退出后将返回主菜单，当前战斗进度将不会保存。
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d0b08]/50 border border-[#3d3225]/30 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#c9952a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-[#c9952a] font-medium">温馨提示</span>
            </div>
            <ul className="text-xs text-[#6a5a4a] space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#5c4d3a]" />
                战斗记录将不会被保存
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#5c4d3a]" />
                已获得的奖励将不会计入
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#5c4d3a]" />
                可随时从主菜单重新开始战斗
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-[#2a2318] border border-[#3d3225] text-[#b8a88a] font-medium hover:bg-[#3d3225] hover:border-[#5c4d3a] hover:text-[#d4c4a8] transition-all"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#c9725a] to-[#a85a4a] text-white font-medium hover:from-[#d9826a] hover:to-[#b86a5a] transition-all shadow-lg shadow-[#c9725a]/20"
            >
              确认退出
            </button>
          </div>
        </div>

        <div className="h-10 px-5 flex items-center justify-between border-t border-[#3d3225]/30 bg-[#0d0b08]/50 text-xs text-[#5c4d3a]">
          <span>按 ESC 键取消 / Enter 键确认</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9725a]" />
            警告操作
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmModal;
