/**
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
  ming_bian: { label: '明辩', color: '#3A5F41', bgColor: '#EBF5EE' },
  an_mou: { label: '暗策', color: '#8D2F2F', bgColor: '#F5E6E6' },
  reveal: { label: '揭示', color: '#D4AF65', bgColor: '#FDFBF7' },
  resolve: { label: '结算', color: '#1A1A1A', bgColor: '#F2ECD9' },
  finished: { label: '结束', color: '#5C4033', bgColor: '#B8A48D22' },
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
    <div className="h-16 bg-[#FDFBF7] border-b-2 border-[#B8A48D]/20 shadow-md flex items-center px-6 justify-between shrink-0 relative z-30">
      {/* 装饰线：金石质感 */}
      <div className="absolute bottom-0 left-0 h-0.5 w-[30%] bg-gradient-to-r from-transparent via-[#3A5F41]/30 to-transparent" />
      <div className="absolute bottom-0 right-0 h-0.5 w-[30%] bg-gradient-to-l from-transparent via-[#8D2F2F]/30 to-transparent" />

      <div className="flex items-center gap-4">
        {onMenu && (
          <button
            onClick={onMenu}
            className="w-10 h-10 rounded-xl bg-white border-2 border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm active:scale-90"
            title="菜单"
          >
            <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#EBF5EE] border border-[#3A5F41]/20">
          <div className="w-2 h-2 rounded-full bg-[#3A5F41]" />
          <span className="text-xs font-black tracking-widest text-[#3A5F41]">稷下论战</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* 回合数：视觉重心 */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#5C4033]/40">Round</span>
          <span className="text-2xl font-black text-[#1A1A1A] tabular-nums leading-none mt-1">{round}</span>
        </div>

        <div className="h-8 w-px bg-[#B8A48D]/30" />

        {/* 议题 */}
        <div className="flex flex-col items-start">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#5C4033]/40">Topic</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rotate-45 border border-[#1A1A1A]/40" />
            <span className="text-sm font-bold text-[#1A1A1A] max-w-32 truncate">{activeTopic || '明辨待定'}</span>
          </div>
        </div>

        {/* 阶段 */}
        <div
          className="flex items-center gap-3 px-5 py-2 rounded-xl border-2 transition-all duration-500 shadow-sm"
          style={{
            backgroundColor: phaseConfig.bgColor,
            borderColor: `${phaseConfig.color}20`,
          }}
        >
          <span className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest">Phase</span>
          <span
            className="text-base font-black tracking-widest"
            style={{ color: phaseConfig.color }}
          >
            {phaseConfig.label}
          </span>
        </div>

        {/* 计时器 */}
        {!isFinished && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
              isTimerWarning
                ? 'bg-[#F5E6E6] border-[#8D2F2F]/40 animate-pulse'
                : 'bg-white border-[#B8A48D]/20 shadow-inner'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isTimerWarning ? 'bg-[#8D2F2F]' : 'bg-[#1A1A1A]/20'}`} />
            <span
              className={`text-base font-black font-mono tabular-nums ${
                isTimerWarning ? 'text-[#8D2F2F]' : 'text-[#1A1A1A]'
              }`}
            >
              {secondsLeft}s
            </span>
          </div>
        )}

        <div className="h-8 w-px bg-[#B8A48D]/30" />

        {/* 大势灵气组 */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#5C4033]/40">Momentum</span>
            <div className="flex items-center gap-3 mt-1 font-black italic">
              <span className="text-lg text-[#3A5F41] tabular-nums">{player.resources.daShi}</span>
              <span className="text-xs text-[#B8A48D]/60 mr-1">:</span>
              <span className="text-lg text-[#8D2F2F] tabular-nums">{enemy.resources.daShi}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#5C4033]/40">Ling Qi</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-black text-[#1A1A1A] tabular-nums">
                {player.resources.lingShi} <span className="text-[10px] text-[#B8A48D]">/ {player.resources.maxLingShi}</span>
              </span>
              <div className="w-3 h-3 rounded-full bg-[#1A1A1A] shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* 功能入口组：白瓷按钮 */}
      <div className="flex items-center gap-2">
        {[
          { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', onClick: onOpenCardLibrary, title: '图鉴' },
          { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', onClick: onOpenStatus, title: '状态' },
          { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', onClick: onOpenPlayerInfo, title: '玩家' },
          { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', onClick: onOpenChat, title: '消息' }
        ].map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.onClick}
            className="group w-10 h-10 rounded-xl bg-white border-2 border-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A]/60 hover:bg-[#FDFBF7] hover:border-[#1A1A1A]/20 hover:text-[#1A1A1A] transition-all hover:shadow-md hover:-translate-y-0.5"
            title={btn.title}
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.icon} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};
