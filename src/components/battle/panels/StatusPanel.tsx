﻿﻿﻿﻿﻿﻿﻿/**
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

const PHASE_CONFIG: Record<string, { name: string; color: string; icon: string }> = {
  ming_bian: { name: '明辩阶段', color: '#7ab8c9', icon: '明' },
  an_mou: { name: '暗策阶段', color: '#9C88A8', icon: '暗' },
  reveal: { name: '揭示阶段', color: '#C9A063', icon: '揭' },
  resolve: { name: '结算阶段', color: '#c9952a', icon: '结' },
  finished: { name: '战斗结束', color: '#8a7a6a', icon: '终' },
};

const StatusPanel: React.FC<StatusPanelProps> = ({ isOpen, onClose, state }) => {
  if (!isOpen) return null;

  const { round, phase, secondsLeft, player, enemy, activeTopic } = state;
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG['finished'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[640px] max-h-[85vh] bg-gradient-to-b from-[#1a1510] via-[#151210] to-[#0d0b08] rounded-2xl border border-[#5c4d3a]/50 shadow-2xl flex flex-col overflow-hidden">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#3d3225]/50 bg-gradient-to-r from-[#1a1510] to-[#151210]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A063]/10 border border-[#C9A063]/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#C9A063]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#c9b896]">战斗状态</h2>
              <p className="text-xs text-[#8a7a6a]">查看当前战斗详细信息</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#8a7a6a] hover:text-[#c9b896] hover:bg-[#3d3225] hover:border-[#7a6a5a] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-[#1f1a12] to-[#151210] border border-[#3d3225]/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#c9952a] uppercase tracking-wider">当前战斗</h3>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: `${phaseConfig.color}15`, border: `1px solid ${phaseConfig.color}30` }}
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: `${phaseConfig.color}20`, color: phaseConfig.color }}
                >
                  {phaseConfig.icon}
                </span>
                <span className="text-sm font-medium" style={{ color: phaseConfig.color }}>
                  {phaseConfig.name}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-[#0d0b08]/50">
                <div className="text-2xl font-bold text-[#d4c4a8] tabular-nums">{round}</div>
                <div className="text-xs text-[#8a7a6a] mt-1">回合</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#0d0b08]/50">
                <div className={`text-2xl font-bold tabular-nums ${secondsLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-[#7ab8c9]'}`}>
                  {secondsLeft}s
                </div>
                <div className="text-xs text-[#8a7a6a] mt-1">剩余时间</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#0d0b08]/50 col-span-2">
                <div className="text-lg font-bold text-[#c9b896] truncate">{activeTopic || '待定'}</div>
                <div className="text-xs text-[#8a7a6a] mt-1">当前议题</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <ResourcePanel
              title="我方状态"
              name={player.name}
              resources={player.resources}
              handCount={player.hand.length}
              isPlayer
            />
            <ResourcePanel
              title="敌方状态"
              name={enemy.name}
              resources={enemy.resources}
              handCount={enemy.hand.length}
              isPlayer={false}
            />
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-[#1f1a12] to-[#151210] border border-[#3d3225]/30">
            <h3 className="text-sm font-bold text-[#c9952a] uppercase tracking-wider mb-4">当前效果</h3>
            <div className="grid grid-cols-2 gap-3">
              <EffectItem
                name="文脉"
                value={player.resources.wenMai}
                icon="文"
                color="#7ab8c9"
                desc="每回合获得额外灵势"
              />
              <EffectItem
                name="机变"
                value={player.resources.jiBian}
                icon="机"
                color="#9C88A8"
                desc="增加卡牌效果"
              />
              <EffectItem
                name="证立"
                value={player.resources.zhengLi}
                icon="证"
                color="#5a8a5a"
                desc="已论证成功次数"
              />
              <EffectItem
                name="失序"
                value={player.resources.shiXu}
                icon="失"
                color="#c9725a"
                desc="论点被击破次数"
              />
            </div>
          </div>
        </div>

        <div className="h-12 px-6 flex items-center justify-between border-t border-[#3d3225]/30 bg-[#0d0b08]/50 text-xs text-[#8a7a6a]">
          <span>实时战斗数据</span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-[#2a2318] border border-[#3d3225]">Esc</kbd>
            <span>关闭</span>
          </span>
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
  const accentColor = isPlayer ? '#5a8a5a' : '#c9725a';

  return (
    <div
      className="p-4 rounded-xl border transition-all"
      style={{
        backgroundColor: `${accentColor}05`,
        borderColor: `${accentColor}30`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: accentColor }}>{title}</h3>
        <span className="text-xs text-[#8a7a6a]">{name}</span>
      </div>
      <div className="space-y-3">
        <ResourceBar label="心证" value={resources.xinZheng} max={20} color="#c9725a" icon="心" />
        <ResourceBar label="灵势" value={resources.lingShi} max={resources.maxLingShi} color="#7ab8c9" icon="灵" />
        <ResourceBar label="大势" value={resources.daShi} max={8} color="#c9952a" icon="势" />

        <div className="pt-2 border-t border-[#3d3225]/30 grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-[#0d0b08]/50">
            <div className="text-sm font-bold text-[#c9b896] tabular-nums">{resources.huYin}</div>
            <div className="text-[10px] text-[#8a7a6a]">虎印</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-[#0d0b08]/50">
            <div className="text-sm font-bold text-[#c9b896] tabular-nums">{resources.chou}</div>
            <div className="text-[10px] text-[#8a7a6a]">筹</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-[#0d0b08]/50">
            <div className="text-sm font-bold text-[#c9b896] tabular-nums">{handCount}</div>
            <div className="text-[10px] text-[#8a7a6a]">手牌</div>
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
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {icon}
          </span>
          <span className="text-[#8a7a6a]">{label}</span>
        </div>
        <span className="text-[#c9b896] font-medium tabular-nums">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-[#1a1510] overflow-hidden border border-[#3d3225]/30">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}40`,
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
    className="flex items-center gap-3 p-3 rounded-lg border transition-all"
    style={{
      backgroundColor: value > 0 ? `${color}10` : 'rgba(13,11,8,0.5)',
      borderColor: value > 0 ? `${color}30` : 'rgba(61,50,37,0.3)',
    }}
  >
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#c9b896]">{name}</span>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color: value > 0 ? color : '#5c4d3a' }}
        >
          {value}
        </span>
      </div>
      <p className="text-[10px] text-[#8a7a6a] truncate">{desc}</p>
    </div>
  </div>
);

export default StatusPanel;
