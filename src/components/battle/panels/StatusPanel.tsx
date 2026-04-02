/**
 * 状态面板
 * 显示当前回合、阶段、Buff/Debuff、详细数值
 */

import React from 'react';
import { DebateBattleState, Resources } from '@/battleV2/types';

interface StatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: DebateBattleState;
}

const PHASE_CONFIG: Record<string, { name: string; color: string; icon: string; bg: string }> = {
  ming_bian: { name: '明辩阶段', color: '#3A5F41', icon: '明', bg: '#EBF5EE' },
  an_mou: { name: '暗策阶段', color: '#1A1A1A', icon: '暗', bg: '#F5F5F5' },
  reveal: { name: '揭示阶段', color: '#8D2F2F', icon: '揭', bg: '#F5E6E6' },
  resolve: { name: '结算阶段', color: '#D4AF65', icon: '结', bg: '#FDFBF7' },
  finished: { name: '论战已毕', color: '#5C4033', icon: '终', bg: '#F2ECD9' },
};

const StatusPanel: React.FC<StatusPanelProps> = ({ isOpen, onClose, state }) => {
  if (!isOpen) return null;

  const { round, phase, secondsLeft, player, enemy, activeTopic } = state;
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG['finished'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl h-auto max-h-[90vh] bg-[#FDFBF7] rounded-[2.5rem] border-4 border-white shadow-[0_50px_100px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
        {/* 顶部标题区 */}
        <div className="h-20 px-8 flex items-center justify-between border-b border-[#1A1A1A]/5 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A]">
               <span className="text-xs font-black">察</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] uppercase tracking-tight">论战气数</h2>
              <p className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest">Global Battle Metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide space-y-8">
          {/* 阶段摘要卡 */}
          <div className="p-8 rounded-[1.5rem] bg-white border-2 border-[#1A1A1A]/5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <div className="text-[8px] font-black text-[#1A1A1A]/20 uppercase tracking-[0.3em]">Status Log</div>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-1">Session Timing</span>
                <h3 className="text-2xl font-black text-[#1A1A1A] tabular-nums">第 {round} 回合</h3>
              </div>
              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full shadow-lg"
                style={{ backgroundColor: phaseConfig.color, color: 'white' }}
              >
                <span className="text-xs font-black uppercase tracking-widest">{phaseConfig.name}</span>
                <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#1A1A1A]/5">
                <div className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-2">Wait Time</div>
                <div className={`text-2xl font-black tabular-nums ${secondsLeft <= 5 ? 'text-[#8D2F2F] animate-pulse' : 'text-[#3A5F41]'}`}>
                  {secondsLeft}s
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#1A1A1A]/5">
                <div className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-2">Subject</div>
                <div className="text-base font-black text-[#1A1A1A] truncate">{activeTopic || '待定课题'}</div>
              </div>
            </div>
          </div>

          {/* 资源面板组 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResourcePanel
              title="我方策论"
              name={player.name}
              resources={player.resources}
              handCount={player.hand.length}
              isPlayer
            />
            <ResourcePanel
              title="对手辩辞"
              name={enemy.name}
              resources={enemy.resources}
              handCount={enemy.hand.length}
              isPlayer={false}
            />
          </div>

          {/* 战场加成 */}
          <div className="p-8 rounded-[1.5rem] bg-white border-2 border-[#1A1A1A]/5 shadow-sm">
            <h3 className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-6 text-center">当前百家共鸣 / Active Resonances</h3>
            <div className="grid grid-cols-2 gap-4">
              <EffectItem name="文脉" value={player.resources.wenMai} icon="文" color="#3A5F41" desc="灵脉通连，额外汲取" />
              <EffectItem name="机变" value={player.resources.jiBian} icon="机" color="#1A1A1A" desc="权变无常，策力增广" />
              <EffectItem name="证立" value={player.resources.zhengLi} icon="证" color="#D4AF65" desc="立论得正，威望渐增" />
              <EffectItem name="失序" value={player.resources.shiXu} icon="失" color="#8D2F2F" desc="论理崩塌，破绽已呈" />
            </div>
          </div>
        </div>

        {/* 底部脚注 */}
        <div className="h-14 px-8 flex items-center justify-center border-t border-[#1A1A1A]/5 bg-white/40 text-[10px] font-black text-[#5C4033]/30 uppercase tracking-[0.2em]">
          End of Status Log · Jixia Academy
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
    <div className="p-6 rounded-[1.5rem] bg-white border-2 border-[#1A1A1A]/5 shadow-sm flex flex-col relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1.5 h-full`} style={{ backgroundColor: accentColor }} />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>{title}</h3>
        <span className="text-xs font-black text-[#1A1A1A]/40">{name}</span>
      </div>
      <div className="space-y-5">
        <ResourceBar label="心证" value={resources.xinZheng} max={20} color="#8D2F2F" icon="心" />
        <ResourceBar label="灵势" value={resources.lingShi} max={resources.maxLingShi} color="#3A5F41" icon="灵" />
        <ResourceBar label="大势" value={resources.daShi} max={8} color="#D4AF65" icon="势" />

        <div className="pt-6 border-t border-[#1A1A1A]/5 grid grid-cols-3 gap-2">
          <div className="text-center p-3 rounded-lg bg-[#FDFBF7]">
            <div className="text-sm font-black text-[#1A1A1A] tabular-nums italic">{resources.huYin}</div>
            <div className="text-[8px] font-black text-[#5C4033]/40 uppercase tracking-tighter">Seal</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#FDFBF7]">
            <div className="text-sm font-black text-[#1A1A1A] tabular-nums italic">{resources.chou}</div>
            <div className="text-[8px] font-black text-[#5C4033]/40 uppercase tracking-tighter">Chip</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#FDFBF7]">
            <div className="text-sm font-black text-[#1A1A1A] tabular-nums italic">{handCount}</div>
            <div className="text-[8px] font-black text-[#5C4033]/40 uppercase tracking-tighter">Hand</div>
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
    <div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase mb-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]" style={{ backgroundColor: `${color}10`, color }}>
            {icon}
          </span>
          <span className="text-[#5C4033]/40 tracking-widest">{label}</span>
        </div>
        <span className="text-[#1A1A1A] italic tabular-nums">{value} / {max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1A1A1A]/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}20`,
          }}
        />
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
    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
      value > 0 ? 'bg-white border-[#1A1A1A]/5 shadow-sm' : 'bg-[#FDFBF7] border-transparent opacity-30'
    }`}
  >
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm shrink-0"
      style={{
        backgroundColor: value > 0 ? color : 'transparent',
        color: value > 0 ? 'white' : '#5C4033',
        border: value > 0 ? 'none' : '1.5px solid rgba(26,26,26,0.1)'
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest truncate">{name}</span>
        <span className="text-lg font-black italic tabular-nums" style={{ color: value > 0 ? color : '#1A1A1A/20' }}>
          {value}
        </span>
      </div>
      <p className="text-[9px] font-medium text-[#5C4033]/40 truncate">{desc}</p>
    </div>
  </div>
);

export default StatusPanel;
