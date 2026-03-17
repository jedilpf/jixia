﻿/**
 * 操作提示区组件
 * 显示在右侧中部的操作引导
 */

import React from 'react';
import { DebateBattleState } from '@/battleV2/types';

interface OperationHintsProps {
  state: DebateBattleState;
  selectedCardId: string | null;
}

const PHASE_INFO: Record<string, { title: string; desc: string; color: string; icon: string }> = {
  ming_bian: {
    title: '明辩阶段',
    desc: '公开出牌，正面交锋',
    color: '#7ab8c9',
    icon: '明',
  },
  an_mou: {
    title: '暗策阶段',
    desc: '秘密布局，暗中筹谋',
    color: '#9C88A8',
    icon: '暗',
  },
  reveal: {
    title: '揭示阶段',
    desc: '展示暗策，真相大白',
    color: '#C9A063',
    icon: '揭',
  },
  resolve: {
    title: '结算阶段',
    desc: '计算结果，决定胜负',
    color: '#c9952a',
    icon: '结',
  },
  finished: {
    title: '战斗结束',
    desc: '胜负已分',
    color: '#8a7a6a',
    icon: '终',
  },
};

const OperationHints: React.FC<OperationHintsProps> = ({
  state,
  selectedCardId,
}) => {
  const { phase, player } = state;
  const isFinished = phase === 'finished';
  const canAct = phase === 'ming_bian' || phase === 'an_mou';
  const phaseInfo = PHASE_INFO[phase] || PHASE_INFO['finished'];

  const getStepHints = (): { text: string; active: boolean; done: boolean }[] => {
    if (isFinished) return [{ text: '查看战斗结果', active: true, done: false }];
    if (!canAct) return [{ text: '等待结算完成...', active: true, done: false }];

    const steps: { text: string; active: boolean; done: boolean }[] = [];

    if (!selectedCardId) {
      steps.push({ text: '选择手牌', active: true, done: false });
      steps.push({ text: '选择目标位置', active: false, done: false });
      steps.push({ text: '确认出牌', active: false, done: false });
    } else {
      const card = player.hand.find(c => c.id === selectedCardId);
      steps.push({ text: '选择手牌', active: false, done: true });
      steps.push({
        text: card ? `已选: ${card.name}` : '已选择卡牌',
        active: true,
        done: false,
      });
      steps.push({ text: '点击席位放置', active: false, done: false });
    }

    return steps;
  };

  const getStatusHints = (): { text: string; type: 'info' | 'warning' | 'success' }[] => {
    if (isFinished) return [];

    const hints: { text: string; type: 'info' | 'warning' | 'success' }[] = [];

    if (phase === 'ming_bian' && !player.plan.lockedPublic) {
      hints.push({ text: '可出明论卡', type: 'success' });
    }
    if (phase === 'an_mou' && !player.plan.lockedSecret) {
      hints.push({ text: '可出暗策卡', type: 'success' });
    }

    if (player.resources.lingShi <= 1) {
      hints.push({ text: '费用紧张', type: 'warning' });
    }

    if (player.hand.length <= 2) {
      hints.push({ text: '手牌较少', type: 'warning' });
    }

    return hints;
  };

  const steps = getStepHints();
  const statusHints = getStatusHints();

  return (
    <div className="w-40 2xl:w-44 shrink-0 bg-gradient-to-b from-[#1a1510]/95 via-[#151210]/95 to-[#0d0b08]/95 border-l border-[#3d3225]/50 p-4 flex flex-col gap-4 backdrop-blur-sm">
      <div className="pb-3 border-b border-[#3d3225]/30">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: `${phaseInfo.color}20`,
              color: phaseInfo.color,
              border: `1px solid ${phaseInfo.color}40`,
            }}
          >
            {phaseInfo.icon}
          </div>
          <span className="text-sm font-medium" style={{ color: phaseInfo.color }}>
            {phaseInfo.title}
          </span>
        </div>
        <p className="text-xs text-[#8a7a6a] leading-relaxed">{phaseInfo.desc}</p>
      </div>

      <div className="pb-3 border-b border-[#3d3225]/30">
        <div className="text-[10px] text-[#5c4d3a] uppercase tracking-wider mb-2 font-medium">
          操作步骤
        </div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                  step.done
                    ? 'bg-[#5a8a5a] text-white'
                    : step.active
                    ? 'bg-[#c9952a]/20 border border-[#c9952a] text-[#c9952a]'
                    : 'bg-[#3d3225]/50 text-[#5c4d3a]'
                }`}
              >
                {step.done ? '✓' : index + 1}
              </div>
              <span
                className={`text-xs transition-all ${
                  step.done
                    ? 'text-[#5a8a5a] line-through'
                    : step.active
                    ? 'text-[#c9b896] font-medium'
                    : 'text-[#6a5a4a]'
                }`}
              >
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {statusHints.length > 0 && (
        <div>
          <div className="text-[10px] text-[#5c4d3a] uppercase tracking-wider mb-2 font-medium">
            状态提示
          </div>
          <div className="space-y-1.5">
            {statusHints.map((hint, index) => (
              <div
                key={index}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                  hint.type === 'warning'
                    ? 'bg-[#c9952a]/10 text-[#c9952a]'
                    : hint.type === 'success'
                    ? 'bg-[#5a8a5a]/10 text-[#5a8a5a]'
                    : 'bg-[#3d3225]/30 text-[#8a7a6a]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hint.type === 'warning'
                      ? 'bg-[#c9952a]'
                      : hint.type === 'success'
                      ? 'bg-[#5a8a5a]'
                      : 'bg-[#8a7a6a]'
                  }`}
                />
                {hint.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-[#3d3225]/30">
        <div className="text-[10px] text-[#5c4d3a] uppercase tracking-wider mb-2 font-medium">
          快捷键
        </div>
        <div className="space-y-1 text-[10px] text-[#6a5a4a]">
          <div className="flex justify-between">
            <span>结束回合</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2318] border border-[#3d3225] text-[#8a7a6a]">
              Space
            </kbd>
          </div>
          <div className="flex justify-between">
            <span>取消选择</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2318] border border-[#3d3225] text-[#8a7a6a]">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationHints;
