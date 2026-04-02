/**
 * 底部操作区组件
 * 显示：左侧提示、中间按钮、手牌区
 */

import React from 'react';
import { DebateBattleState, DebateCard } from '@/battleV2/types';

interface BottomControlsProps {
  state: DebateBattleState;
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  onEndTurn: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const CARD_FRAME_COLORS: Record<string, { border: string; bg: string; glow: string }> = {
  '立论': { border: '#3A5F41', bg: '#EBF5EE', glow: 'rgba(58,95,65,0.2)' },
  '策术': { border: '#8D2F2F', bg: '#F5E6E6', glow: 'rgba(141,47,47,0.2)' },
  '反诘': { border: '#D4AF65', bg: '#FDFBF7', glow: 'rgba(212,175,101,0.2)' },
  '门客': { border: '#5C4033', bg: '#F2ECD9', glow: 'rgba(92,64,51,0.2)' },
  '玄章': { border: '#1A1A1A', bg: '#F5F5F5', glow: 'rgba(26,26,26,0.1)' },
};

const HandCard: React.FC<{
  card: DebateCard;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  total: number;
}> = ({ card, isSelected, onClick, index, total }) => {
  const colors = CARD_FRAME_COLORS[card.type] || CARD_FRAME_COLORS['立论'];
  const hasStats = card.power !== undefined && card.hp !== undefined;

  const fanOffset = total > 1 ? (index - (total - 1) / 2) * (total >= 6 ? 6 : 8) : 0;
  const rotation = total > 1 ? (index - (total - 1) / 2) * (total >= 6 ? 1.4 : 2.2) : 0;

  return (
    <button
      onClick={onClick}
      className="relative transition-all duration-500 ease-out origin-bottom group"
      style={{
        transform: isSelected
          ? 'scale(1.15) translateY(-24px)'
          : `rotate(${rotation}deg) translateX(${fanOffset}px)`,
        zIndex: isSelected ? 40 : 10 + index,
      }}
    >
      <div
        className="relative w-[88px] h-[124px] rounded-2xl overflow-hidden transition-all duration-300 md:w-[94px] md:h-[132px] bg-white border-2"
        style={{
          borderColor: isSelected ? colors.border : `${colors.border}40`,
          boxShadow: isSelected
            ? `0 20px 40px ${colors.glow}, 0 0 0 4px ${colors.border}10`
            : `0 8px 20px rgba(92,64,51,0.1)`,
        }}
      >
        {/* 卡牌原画 */}
        <div className="absolute inset-0 bg-[#FDFBF7]">
          {card.art ? (
            <img
              src={card.art}
              alt={card.name}
              className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-[#B8A48D]/10" />
          )}
        </div>

        {/* 覆盖材质：雅致渐变 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent pointer-events-none" />

        {/* 费用：小印感 */}
        <div
          className="absolute top-1.5 left-1.5 z-30 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md"
          style={{
            backgroundColor: 'white',
            color: '#1A1A1A',
            border: `1.5px solid ${colors.border}30`,
          }}
        >
          {card.cost}
        </div>

        {/* 类型标签 */}
        <div
          className="absolute top-1.5 right-1.5 z-30 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter opacity-80"
          style={{
            backgroundColor: colors.bg,
            color: colors.border,
            border: `1px solid ${colors.border}20`,
          }}
        >
          {card.type}
        </div>

        {/* 名称 */}
        <div className="absolute bottom-1 left-0 right-0 z-30 p-2">
          <span className="text-[10px] text-white font-black block truncate text-center uppercase tracking-tighter leading-tight">
            {card.name}
          </span>
        </div>

        {/* 数值 */}
        {hasStats && (
          <div className="absolute bottom-5 right-1 z-30 flex flex-col gap-0.5">
            <div className="w-4 h-4 rounded bg-[#3A5F41] flex items-center justify-center shadow-lg">
              <span className="text-[8px] font-black text-white">{card.power}</span>
            </div>
            <div className="w-4 h-4 rounded bg-[#8D2F2F] flex items-center justify-center shadow-lg">
              <span className="text-[8px] font-black text-white">{card.hp}</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部选中阴影 */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-[#1A1A1A]/10 blur-sm animate-pulse" />
      )}
    </button>
  );
};

export const BottomControls: React.FC<BottomControlsProps> = ({
  state,
  selectedCardId,
  onSelectCard,
  onEndTurn,
  onConfirm,
  onCancel,
}) => {
  const { phase, player } = state;
  const isFinished = phase === 'finished';
  const canAct = phase === 'ming_bian' || phase === 'an_mou';

  const getHintText = (): string => {
    if (isFinished) return '论战已毕';
    if (!canAct) return '司仪结算中...';
    if (!selectedCardId) return '请从书箧择一论策';

    const card = player.hand.find(c => c.id === selectedCardId);
    if (!card) return '请选择论策';

    return `择定: ${card.name}`;
  };

  const getActionHint = (): string => {
    if (!canAct) return '';
    const hints: string[] = [];
    if (!player.plan.lockedPublic) hints.push('可陈明论');
    if (!player.plan.lockedSecret) hints.push('可布暗策');
    return hints.join(' / ');
  };

  return (
    <div className="h-44 md:h-48 bg-[#FDFBF7] border-t-2 border-[#B8A48D]/20 shadow-[0_-10px_30px_rgba(184,164,141,0.1)] flex shrink-0 relative z-20">
      {/* 装饰线：金石质感 */}
      <div className="absolute top-0 left-0 h-0.5 w-[20%] bg-gradient-to-r from-transparent via-[#3A5F41]/20 to-transparent" />
      <div className="absolute top-0 right-0 h-0.5 w-[20%] bg-gradient-to-l from-transparent via-[#8D2F2F]/20 to-transparent" />

      {/* 提示区 */}
      <div className="w-52 xl:w-64 p-6 flex flex-col justify-center gap-3 border-r border-[#B8A48D]/20 bg-white/40">
        <div className="text-base font-black text-[#1A1A1A] leading-tight tracking-tight">{getHintText()}</div>
        {getActionHint() && (
          <div className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest">{getActionHint()}</div>
        )}
        <div className="mt-2 pt-4 border-t border-[#B8A48D]/20 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-[#5C4033]/30 uppercase tracking-widest">Ling Qi</span>
            <span className="text-sm font-black text-[#1A1A1A] tabular-nums mt-0.5">
              {player.resources.lingShi} <span className="text-[10px] text-[#B8A48D]/60">/ {player.resources.maxLingShi}</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-[#5C4033]/30 uppercase tracking-widest">Momentum</span>
            <span className="text-sm font-black text-[#3A5F41] tabular-nums mt-0.5">{player.resources.daShi}</span>
          </div>
        </div>
      </div>

      {/* 按钮区 */}
      <div className="w-48 xl:w-56 p-6 flex flex-col justify-center gap-3 border-r border-[#B8A48D]/20">
        {selectedCardId ? (
          <>
            <button
              onClick={onConfirm}
              disabled={!canAct}
              className="w-full py-3 rounded-xl bg-[#3A5F41] text-white font-black text-sm hover:bg-[#2A4F31] disabled:bg-[#B8A48D]/40 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
            >
              布阵
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 rounded-xl bg-white border-2 border-[#1A1A1A]/10 text-[#1A1A1A]/60 font-black text-xs hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-95"
            >
              取消
            </button>
          </>
        ) : (
          <button
            onClick={onEndTurn}
            disabled={!canAct || isFinished}
            className="w-full py-4 rounded-xl bg-[#D4AF65] text-white font-black text-sm hover:bg-[#B89445] disabled:bg-[#B8A48D]/40 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
          >
            结束
          </button>
        )}
      </div>

      {/* 手牌区 */}
      <div className="flex-1 px-8 py-4 overflow-x-auto overflow-y-visible scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] bg-fixed">
        <div className="flex items-end justify-center h-full min-w-max mx-auto gap-2">
          {player.hand.length === 0 ? (
            <div className="text-[#B8A48D]/40 font-black italic text-sm tracking-widest">手牌已空，策穷技绝</div>
          ) : (
            player.hand.map((card, index) => (
              <HandCard
                key={`${card.id}-${index}`}
                card={card}
                isSelected={selectedCardId === card.id}
                onClick={() => onSelectCard(selectedCardId === card.id ? null : card.id)}
                index={index}
                total={player.hand.length}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
