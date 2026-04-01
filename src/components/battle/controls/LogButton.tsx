/**
 * 日志按钮组件
 * 左侧入口，点击展开战斗日志抽屉
 */

import React from 'react';

interface LogButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

const LogButton: React.FC<LogButtonProps> = ({ onClick, unreadCount = 0 }) => {
  return (
    <div className="w-12 flex flex-col items-center justify-center border-r border-[#3d3225]/30 bg-gradient-to-r from-[#0d0b08] to-[#1a1510]/50">
      <button
        onClick={onClick}
        className="relative w-10 h-10 rounded-lg bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex flex-col items-center justify-center gap-0.5 hover:bg-[#3d3225] hover:border-[#7a6a5a] transition-all group"
        title="战斗日志"
      >
        <svg
          className="w-4 h-4 text-[#8a7a6a] group-hover:text-[#c9b896] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        <span className="text-[8px] text-[#8a7a6a] group-hover:text-[#c9b896] transition-colors font-medium">
          日志
        </span>

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-[#c9725a] to-[#a85a4a] text-white text-[9px] flex items-center justify-center font-bold shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c9725a] animate-ping opacity-50" />
        )}
      </button>

      <div className="mt-3 w-8 h-px bg-gradient-to-b from-transparent via-[#3d3225] to-transparent" />

      <div className="mt-3 flex flex-col items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#1f1a12]/50 border border-[#3d3225]/30 flex items-center justify-center">
          <span className="text-[8px] text-[#5c4d3a]">?</span>
        </div>
      </div>
    </div>
  );
};

export default LogButton;
