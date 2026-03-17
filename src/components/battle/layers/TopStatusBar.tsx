﻿﻿﻿/**
 * 顶部状态栏组件
 * 显示：回合、议题、进度、大势、费用、功能按钮入口
 */

import React from 'react';
import { DebateBattleState } from '@/battleV2/types';

interface TopStatusBarProps {
  state: DebateBattleState;
  onOpenCardLibrary: () => void;
  onOpenStatus: () => void;
  onOpenPlayerInfo: () => void;
  onOpenChat: () => void;
  onMenu?: () => void;
}

const PHASE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  ming_bian: { label: '明辩', color: '#7ab8c9', bgColor: 'rgba(122,184,201,0.15)' },
  an_mou: { label: '暗策', color: '#9C88A8', bgColor: 'rgba(156,136,168,0.15)' },
  reveal: { label: '揭示', color: '#C9A063', bgColor: 'rgba(201,160,99,0.15)' },
  resolve: { label: '结算', color: '#c9952a', bgColor: 'rgba(201,149,42,0.15)' },
  finished: { label: '结束', color: '#8a7a6a', bgColor: 'rgba(138,122,106,0.15)' },
};

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  state,
  onOpenCardLibrary,
  onOpenStatus,
  onOpenPlayerInfo,
  onOpenChat,
  onMenu,
}) => {
  const { round, phase, secondsLeft, player, enemy, activeTopic } = state;
  const isFinished = phase === 'finished';
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG['finished'];
  const isTimerWarning = secondsLeft <= 5 && !isFinished;

  return (
    <div className="h-14 bg-gradient-to-b from-[#1a1510] via-[#151210] to-[#0d0b08] border-b border-[#3d3225]/50 flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-3">
        {onMenu && (
          <button
            onClick={onMenu}
            className="w-9 h-9 rounded-lg bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#b8a88a] hover:bg-[#3d3225] hover:border-[#7a6a5a] hover:text-[#d4c4a8] transition-all"
            title="菜单"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1f1a12]/50 border border-[#3d3225]/30">
          <div className="w-2 h-2 rounded-full bg-[#c9952a] animate-pulse" />
          <span className="text-xs text-[#c9b896] font-medium">百家争鸣</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f1a12]/50 border border-[#3d3225]/30">
          <span className="text-[10px] text-[#8a7a6a] uppercase tracking-wider">回合</span>
          <span className="text-xl font-bold text-[#d4c4a8] tabular-nums">{round}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f1a12]/50 border border-[#3d3225]/30">
          <span className="text-[10px] text-[#8a7a6a] uppercase tracking-wider">议题</span>
          <span className="text-sm font-medium text-[#c9b896] max-w-24 truncate">{activeTopic || '待定'}</span>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300"
          style={{
            backgroundColor: phaseConfig.bgColor,
            borderColor: `${phaseConfig.color}40`,
          }}
        >
          <span className="text-[10px] text-[#8a7a6a] uppercase tracking-wider">阶段</span>
          <span
            className="text-sm font-bold"
            style={{ color: phaseConfig.color }}
          >
            {phaseConfig.label}
          </span>
        </div>

        {!isFinished && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              isTimerWarning
                ? 'bg-red-500/10 border-red-500/30 animate-pulse'
                : 'bg-[#1f1a12]/50 border-[#3d3225]/30'
            }`}
          >
            <svg
              className={`w-4 h-4 ${isTimerWarning ? 'text-red-400' : 'text-[#8a7a6a]'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              className={`text-sm font-mono font-bold tabular-nums ${
                isTimerWarning ? 'text-red-400' : 'text-[#b8a88a]'
              }`}
            >
              {secondsLeft}s
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-[#1f1a12]/50 border border-[#3d3225]/30">
          <span className="text-[10px] text-[#8a7a6a] uppercase tracking-wider">大势</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#5a8a5a] tabular-nums">{player.resources.daShi}</span>
            <div className="w-px h-4 bg-[#3d3225]" />
            <span className="text-base font-bold text-[#c9725a] tabular-nums">{enemy.resources.daShi}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f1a12]/50 border border-[#3d3225]/30">
          <div className="w-4 h-4 rounded-full bg-[#7ab8c9]/20 border border-[#7ab8c9]/50 flex items-center justify-center">
            <span className="text-[8px] text-[#7ab8c9] font-bold">灵</span>
          </div>
          <span className="text-sm font-medium text-[#7ab8c9] tabular-nums">
            {player.resources.lingShi}/{player.resources.maxLingShi}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenCardLibrary}
          className="group w-9 h-9 rounded-lg bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#b8a88a] hover:bg-[#3d3225] hover:border-[#9EAD8A]/50 hover:text-[#9EAD8A] transition-all"
          title="图鉴"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>

        <button
          onClick={onOpenStatus}
          className="group w-9 h-9 rounded-lg bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#b8a88a] hover:bg-[#3d3225] hover:border-[#C9A063]/50 hover:text-[#C9A063] transition-all"
          title="状态"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          onClick={onOpenPlayerInfo}
          className="group w-9 h-9 rounded-lg bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#b8a88a] hover:bg-[#3d3225] hover:border-[#9C88A8]/50 hover:text-[#9C88A8] transition-all"
          title="玩家"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        <button
          onClick={onOpenChat}
          className="group w-9 h-9 rounded-lg bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#b8a88a] hover:bg-[#3d3225] hover:border-[#7ab8c9]/50 hover:text-[#7ab8c9] transition-all"
          title="消息"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
