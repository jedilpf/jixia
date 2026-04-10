/**
 * 顶部状态栏组件
 * 稷下受业：司议云端 (V9 雅化版)
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

const PHASE_CONFIG: Record<string, { label: string; color: string; bgColor: string; accent: string }> = {
  ming_bian: { label: '明辩', color: '#f8e6be', bgColor: '#7d3d23', accent: '#f0c36e' },
  an_mou: { label: '暗策', color: '#f8e6be', bgColor: '#7d3d23', accent: '#2a0e0a' },
  reveal: { label: '揭示', color: '#2a0e0a', bgColor: '#f3d3a2', accent: '#d29648' },
  resolve: { label: '结算', color: '#FFF7EB', bgColor: '#2a0e0a', accent: '#D29648' },
  finished: { label: '结束', color: '#2a0e0a', bgColor: '#d1b18522', accent: '#d1b185' },
};

const JadeButton: React.FC<{ icon: string; title: string; onClick: () => void }> = ({ icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="group relative w-12 h-14 flex flex-col items-center justify-center transition-all hover:-translate-y-1 active:scale-90"
    title={title}
  >
    {/* 玉佩形状 */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#f6e6c3] to-[#d29648] rounded-t-lg rounded-b-2xl border-2 border-[#f8e6be]/25 shadow-[0_5px_15px_rgba(125,61,35,0.2)] group-hover:shadow-[0_8px_25px_rgba(210,150,72,0.35)]" />
    {/* 挂绳点缀 */}
    <div className="absolute -top-1 w-1.5 h-3 bg-[#7d3d23] rounded-full shadow-sm" />
    <svg className="relative w-5 h-5 text-[#f0c36e] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <span className="relative text-[7px] font-black text-[#f0c36e]/60 uppercase tracking-tighter mt-1">{title}</span>
  </button>
);

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
    <div className="h-20 bg-[#1b0c0a] border-b-4 border-[#d29648] shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center px-10 justify-between shrink-0 relative z-30 overflow-hidden">
      {/* 装饰层：流云背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f0c36e]/10 to-transparent" />
         <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#7d3d23]/10 to-transparent" />
      </div>

      <div className="flex items-center gap-6 relative z-10">
        {onMenu && (
          <button
            onClick={onMenu}
            className="w-12 h-12 rounded-2xl bg-[#f8e6be] border-2 border-[#d29648] flex items-center justify-center text-[#7d3d23] hover:bg-[#7d3d23] hover:text-[#f8e6be] hover:rounded-full transition-all shadow-xl active:scale-90"
          >
            <span className="text-xl font-bold">⠿</span>
          </button>
        )}
        <div className="flex flex-col">
           <span className="text-[10px] font-black text-[#f0c36e] uppercase tracking-[0.4em] leading-none">Jixia Academy</span>
           <h1 className="text-sm font-black text-[#f8e6be] mt-1 tracking-tighter serif italic">稷下大争鸣</h1>
        </div>
      </div>

      <div className="flex items-center gap-12 relative z-10">
        {/* 左侧资源组：大势与计时 */}
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#d1b185]/55">Momentum</span>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-xl font-black text-[#f0c36e] italic tabular-nums">{player.resources.daShi}</span>
                 <div className="w-1 h-1 rounded-full bg-[#d29648]/40" />
                 <span className="text-xl font-black text-[#7d3d23] italic tabular-nums">{enemy.resources.daShi}</span>
              </div>
           </div>

           {/* 计时器：日晷意向 */}
           {!isFinished && (
             <div className={`relative w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${isTimerWarning ? 'bg-[#7d3d23] border-[#7d3d23] scale-110 shadow-lg' : 'bg-[#f8e6be] border-[#d29648]/10 shadow-inner'}`}>
                <div className={`text-lg font-black tabular-nums font-mono ${isTimerWarning ? 'text-[#f8e6be]' : 'text-[#f8e6be]'}`}>
                   {secondsLeft}s
                </div>
                {isTimerWarning && (
                   <div className="absolute inset-0 rounded-full border-2 border-[#f8e6be] animate-ping opacity-20" />
                )}
             </div>
           )}
        </div>

        {/* 核心枢纽：回合与阶段 (Bagua Mirror / Scroll) */}
        <div className="flex items-center gap-2">
           <div className="relative h-12 flex items-center group">
              <div 
                className="h-full px-10 flex items-center rounded-l-full rounded-r-3xl border-2 border-[#d29648]/14 shadow-2xl transition-all duration-700 overflow-hidden"
                style={{ backgroundColor: phaseConfig.bgColor }}
              >
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/silk.png')]" />
                 <span className="relative text-[9px] font-black uppercase tracking-[0.5em] mr-4 mix-blend-multiply opacity-40">Phase</span>
                 <span className="relative text-xl font-black tracking-[0.5em] pl-[0.5em] serif" style={{ color: phaseConfig.color }}>
                   {phaseConfig.label}
                 </span>
              </div>

              {/* 回合数：视觉圆点 */}
              <div className="absolute -left-6 w-16 h-16 rounded-full bg-[#7d3d23] border-4 border-[#f0c36e] shadow-2xl flex flex-col items-center justify-center transform group-hover:rotate-12 transition-transform">
                 <span className="text-[7px] font-black text-[#d1b185]/60 uppercase tracking-widest leading-none">Rnd</span>
                 <span className="text-2xl font-black text-[#f8e6be] italic leading-none mt-1">{round}</span>
              </div>
           </div>
        </div>

        {/* 议题显示：浮动标签 */}
        <div className="flex flex-col items-start min-w-32 border-l-2 border-[#d29648]/18 pl-6">
           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#d1b185]/55">Current Doctrine</span>
           <div className="flex items-center gap-2 mt-1 py-1 px-3 rounded-md bg-[#2a0e0a]/55 border border-[#d1b185]/20">
              <span className="text-xs font-bold text-[#f8e6be] italic">{activeTopic || '明辨待定'}</span>
           </div>
        </div>
      </div>

      {/* 功能入口组：玉牌按钮 */}
      <div className="flex items-center gap-3 relative z-10">
        <JadeButton 
          title="图鉴" 
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          onClick={onOpenCardLibrary} 
        />
        <JadeButton 
          title="状态" 
          icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          onClick={onOpenStatus} 
        />
        <JadeButton 
          title="座次" 
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          onClick={onOpenPlayerInfo} 
        />
        <JadeButton 
          title="信笺" 
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          onClick={onOpenChat} 
        />
      </div>
    </div>
  );
};
