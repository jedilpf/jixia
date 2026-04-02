/**
 * 状态面板
 * 稷下受业：名士实录 (V9 雅化版)
 */

import React from 'react';
import { DebateBattleState, Resources } from '@/battleV2/types';

interface StatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: DebateBattleState;
}

const PHASE_CONFIG: Record<string, { name: string; color: string; icon: string; bg: string; subtitle: string }> = {
  ming_bian: { name: '众目·明辩', color: '#3A5F41', icon: '明', bg: '#EBF5EE', subtitle: 'Public Discourse' },
  an_mou: { name: '幽径·暗策', color: '#1A1A1A', icon: '暗', bg: '#F5F5F5', subtitle: 'Secret Strategy' },
  reveal: { name: '风起·揭示', color: '#8D2F2F', icon: '揭', bg: '#F5E6E6', subtitle: 'Moment of Truth' },
  resolve: { name: '尘定·结算', color: '#D4AF65', icon: '结', bg: '#FDFBF7', subtitle: 'Logic Resolution' },
  finished: { name: '曲终·论罢', color: '#5C4033', icon: '终', bg: '#F2ECD9', subtitle: 'Battle Concluded' },
};

const StatusPanel: React.FC<StatusPanelProps> = ({ isOpen, onClose, state }) => {
  if (!isOpen) return null;

  const { round, phase, secondsLeft, player, enemy, activeTopic } = state;
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG['finished'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/90 backdrop-blur-xl p-6 selection:bg-[#3A5F41] selection:text-white">
      <div className="w-full max-w-3xl h-auto max-h-[90vh] bg-[#FDFBF7] rounded-[3rem] border-[6px] border-white shadow-[0_60px_150px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
        
        {/* 背景纹理层 */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0">
           <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        </div>

        {/* 顶部：名士实录匾额 */}
        <div className="h-28 px-10 flex items-center justify-between border-b-2 border-[#1A1A1A]/5 bg-white/80 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#1A1A1A] flex items-center justify-center text-white font-black text-xl shadow-2xl transform rotate-45 group">
               <span className="-rotate-45">实</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter serif">稷下论证 · 实录</h2>
              <p className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-[0.4em] mt-1">Registry of Perpetual Debate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 shadow-inner group"
          >
            <div className="transform group-hover:scale-125 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </div>
          </button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto scrollbar-hide space-y-10 relative z-10">
          
          {/* 阶段大纲：流云碑 */}
          <div className="p-10 rounded-[2.5rem] bg-white border-2 border-[#1A1A1A]/5 shadow-[0_20px_50px_rgba(0,0,0,0.02)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <div className="text-6xl font-black italic serif tabular-nums text-[#1A1A1A]">{round}</div>
            </div>
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-[#5C4033]/40 uppercase tracking-[0.3em] mb-2">Round Progress</span>
                <h3 className="text-4xl font-black text-[#1A1A1A] serif">第 {round} 回合</h3>
              </div>
              <div
                className="flex flex-col items-center justify-center px-10 py-4 rounded-[1.5rem] shadow-2xl transform hover:scale-105 transition-transform"
                style={{ backgroundColor: phaseConfig.color, color: 'white' }}
              >
                <span className="text-lg font-black italic tracking-widest">{phaseConfig.name}</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-60 mt-1">{phaseConfig.subtitle}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-[1.5rem] bg-[#FDFBF7] border-2 border-[#1A1A1A]/5 group-hover:border-[#3A5F41]/30 transition-colors">
                <div className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#3A5F41]" />
                   仪轨倒时
                </div>
                <div className={`text-3xl font-black tabular-nums italic ${secondsLeft <= 5 ? 'text-[#8D2F2F] animate-pulse' : 'text-[#1A1A1A]'}`}>
                  {secondsLeft}s
                </div>
              </div>
              <div className="p-6 rounded-[1.5rem] bg-[#FDFBF7] border-2 border-[#1A1A1A]/5 group-hover:border-[#D4AF65]/30 transition-colors">
                <div className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF65]" />
                   论辩主旨
                </div>
                <div className="text-xl font-black text-[#1A1A1A] truncate serif">{activeTopic || '太虚待定'}</div>
              </div>
            </div>
          </div>

          {/* 气数对弈图 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResourcePanel
              title="我方 · 清论"
              name={player.name}
              resources={player.resources}
              handCount={player.hand.length}
              isPlayer
            />
            <ResourcePanel
              title="阵方 · 逆见"
              name={enemy.name}
              resources={enemy.resources}
              handCount={enemy.hand.length}
              isPlayer={false}
            />
          </div>

          {/* 百家共鸣：文画印章 */}
          <div className="p-10 rounded-[2.5rem] bg-white border-2 border-[#1A1A1A]/5 shadow-sm relative">
            <div className="flex items-center gap-4 mb-10">
               <div className="h-px flex-1 bg-[#1A1A1A]/5" />
               <h3 className="text-[11px] font-black text-[#5C4033]/40 uppercase tracking-[0.4em] whitespace-nowrap">场域共鸣 · Resonances</h3>
               <div className="h-px flex-1 bg-[#1A1A1A]/5" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <EffectItem name="文脉" value={player.resources.wenMai} icon="文" color="#3A5F41" desc="灵感涌现，生生不息" />
              <EffectItem name="机变" value={player.resources.jiBian} icon="机" color="#1A1A1A" desc="瞬息万变，谋定后动" />
              <EffectItem name="证立" value={player.resources.zhengLi} icon="证" color="#D4AF65" desc="立言得体，威望渐厚" />
              <EffectItem name="失序" value={player.resources.shiXu} icon="失" color="#8D2F2F" desc="论证纰漏，气数大减" />
            </div>
          </div>
        </div>

        {/* 底部备注：学者史记 */}
        <div className="h-16 px-10 flex items-center justify-between border-t-2 border-[#1A1A1A]/5 bg-white/80">
          <span className="text-[11px] font-black text-[#5C4033]/30 uppercase tracking-[0.3em]">
             Transcript logged by Jixia Grand Historiographer
          </span>
          <div className="flex items-center gap-4 opacity-30">
             <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
             <div className="w-8 h-[2px] bg-[#1A1A1A]" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourcePanel: React.FC<{
  title: string;
  name: string;
  resources: Resources;
  handCount: number;
  isPlayer: boolean;
}> = ({ title, name, resources, handCount, isPlayer }) => {
  const accentColor = isPlayer ? '#3A5F41' : '#8D2F2F';

  return (
    <div className="p-8 rounded-[2.5rem] bg-white border-4 border-[#1A1A1A]/5 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] transform translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-1000`}>
         <div className="w-full h-full rounded-full border-[10px]" style={{ borderColor: accentColor }} />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: accentColor }}>{title}</h3>
        <span className="text-xs font-black text-[#1A1A1A] serif">{name}</span>
      </div>
      
      <div className="space-y-8 relative z-10">
        <ResourceBar label="心证" value={resources.xinZheng} max={20} color="#8D2F2F" icon="心" />
        <ResourceBar label="灵势" value={resources.lingShi} max={resources.maxLingShi} color="#3A5F41" icon="灵" />
        <ResourceBar label="大势" value={resources.daShi} max={8} color="#D4AF65" icon="势" />

        <div className="pt-8 border-t-2 border-[#1A1A1A]/5 grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-2xl bg-[#FDFBF7] shadow-inner group/stat">
            <div className="text-lg font-black text-[#1A1A1A] tabular-nums italic group-hover/stat:scale-110 transition-transform">{resources.huYin}</div>
            <div className="text-[9px] font-black text-[#5C4033]/40 uppercase tracking-tighter">符印</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[#FDFBF7] shadow-inner group/stat">
            <div className="text-lg font-black text-[#1A1A1A] tabular-nums italic group-hover/stat:scale-110 transition-transform">{resources.chou}</div>
            <div className="text-[9px] font-black text-[#5C4033]/40 uppercase tracking-tighter">算筹</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[#FDFBF7] shadow-inner group/stat">
            <div className="text-lg font-black text-[#1A1A1A] tabular-nums italic group-hover/stat:scale-110 transition-transform">{handCount}</div>
            <div className="text-[9px] font-black text-[#5C4033]/40 uppercase tracking-tighter">卷帙</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceBar: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}> = ({ label, value, max, color, icon }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="group/bar">
      <div className="flex items-center justify-between text-[11px] font-black uppercase mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] transform group-hover/bar:rotate-12 transition-transform shadow-sm" style={{ backgroundColor: `${color}15`, color }}>
            {icon}
          </span>
          <span className="text-[#5C4033]/60 tracking-[0.2em]">{label}</span>
        </div>
        <span className="text-[#1A1A1A] italic tabular-nums">{value} <span className="opacity-20 text-[9px]">/ {max}</span></span>
      </div>
      <div className="h-2.5 rounded-full bg-[#1A1A1A]/5 overflow-hidden p-[2px] border border-[#1A1A1A]/5 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 15px ${color}40`,
          }}
        >
           {/* 光芒流转效果 */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />
        </div>
      </div>
    </div>
  );
};

const EffectItem: React.FC<{
  name: string;
  value: number;
  icon: string;
  color: string;
  desc: string;
}> = ({ name, value, icon, color, desc }) => (
  <div
    className={`flex items-center gap-6 p-6 rounded-[1.5rem] border-2 transition-all duration-500 overflow-hidden relative group/eff ${
      value > 0 ? 'bg-white border-[#1A1A1A]/5 shadow-xl hover:-translate-y-1' : 'bg-[#FDFBF7]/50 border-transparent opacity-30 grayscale'
    }`}
  >
    {value > 0 && (
       <div className="absolute top-0 right-0 p-2 opacity-5">
          <div className="text-4xl font-black">{icon}</div>
       </div>
    )}
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-2xl shrink-0 transition-transform duration-700 group-hover/eff:scale-110"
      style={{
        backgroundColor: value > 0 ? color : 'transparent',
        color: value > 0 ? 'white' : '#5C4033',
        border: value > 0 ? 'none' : '2px solid rgba(26,26,26,0.1)'
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0 relative z-10">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-[0.2em] truncate">{name}</span>
        <span className="text-2xl font-black italic tabular-nums serif" style={{ color: value > 0 ? color : '#1A1A1A' }}>
          {value}
        </span>
      </div>
      <p className="text-[10px] font-medium text-[#5C4033]/50 truncate italic">“ {desc} ”</p>
    </div>
  </div>
);

export default StatusPanel;
