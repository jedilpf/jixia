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
  '立论': { border: '#9EAD8A', bg: 'rgba(158,173,138,0.15)', glow: 'rgba(158,173,138,0.4)' },
  '策术': { border: '#C06F6F', bg: 'rgba(192,111,111,0.15)', glow: 'rgba(192,111,111,0.4)' },
};

const CARD_FRAME_ASSETS: Record<string, string> = {
  '立论': 'assets/frames/frame-lilun.png',
  '策术': 'assets/frames/frame-ceshu.png',
};

const HandCard: React.FC<{
  card: DebateCard;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  total: number;
}> = ({ card, isSelected, onClick, index, total }) => {
  const colors = CARD_FRAME_COLORS[card.type] || CARD_FRAME_COLORS['立论'];
  const frameAsset = CARD_FRAME_ASSETS[card.type] || CARD_FRAME_ASSETS['立论'];
  const hasStats = card.power !== undefined && card.hp !== undefined;

  const fanOffset = total > 1 ? (index - (total - 1) / 2) * (total >= 6 ? 5 : 7) : 0;
  const rotation = total > 1 ? (index - (total - 1) / 2) * (total >= 6 ? 1.6 : 2.4) : 0;

  return (
    <button
      onClick={onClick}
      className="relative transition-all duration-300 ease-out origin-bottom"
      style={{
        transform: isSelected
          ? 'scale(1.1) translateY(-12px)'
          : `rotate(${rotation}deg) translateX(${fanOffset}px)`,
        zIndex: isSelected ? 30 : 10 + index,
      }}
    >
      <div
        className="relative w-[82px] h-[114px] rounded-xl overflow-hidden transition-all duration-200 md:w-[88px] md:h-[120px]"
        style={{
          border: `2px solid ${isSelected ? colors.border : `${colors.border}60`}`,
          boxShadow: isSelected
            ? `0 0 30px ${colors.glow}, 0 15px 40px rgba(0,0,0,0.6), inset 0 0 20px ${colors.glow}`
            : `0 4px 15px rgba(0,0,0,0.4)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#151210] to-[#0d0b08]" />

        {card.art ? (
          <img
            src={card.art}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <img
          src={frameAsset}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 h-full w-full object-fill opacity-95"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        <div
          className="absolute top-1.5 left-1.5 z-30 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm"
          style={{
            backgroundColor: colors.bg,
            color: colors.border,
            border: `1.5px solid ${colors.border}`,
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {card.cost}
        </div>

        <div
          className="absolute top-1.5 right-1.5 z-30 px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm"
          style={{
            backgroundColor: colors.bg,
            color: colors.border,
            border: `1px solid ${colors.border}40`,
          }}
        >
          {card.type}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 p-2">
          <span
            className="text-xs text-white font-medium block truncate text-center drop-shadow-lg"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
          >
            {card.name}
          </span>
        </div>

        {hasStats && (
          <div className="absolute bottom-1 right-1 z-30 flex gap-0.5">
            <div className="w-5 h-5 rounded bg-[#c9952a]/90 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{card.power}</span>
            </div>
            <div className="w-5 h-5 rounded bg-[#5a8a5a]/90 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{card.hp}</span>
            </div>
          </div>
        )}

        {!isSelected && (
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 40%, ${colors.glow} 100%)`,
            }}
          />
        )}
      </div>

      {isSelected && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full animate-pulse"
          style={{ backgroundColor: colors.border }}
        />
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
  const canAct = phase === 'play_1' || phase === 'play_2';

  const getHintText = (): string => {
    if (isFinished) return '战斗已结束';
    if (!canAct) return '等待结算...';
    if (!selectedCardId) return '请选择一张手牌';

    const card = player.hand.find(c => c.id === selectedCardId);
    if (!card) return '请选择一张手牌';

    return `已选择: ${card.name}`;
  };

  const getActionHint = (): string => {
    if (!canAct) return '';
    const hints: string[] = [];
    if (!player.plan.lockedLayer1) hints.push('可出第一手');
    if (!player.plan.lockedLayer2) hints.push('可出第二手');
    return hints.join(' / ');
  };

  const selectedCard = selectedCardId ? player.hand.find(c => c.id === selectedCardId) : null;

  return (
    <div className="h-[168px] md:h-44 bg-gradient-to-t from-[#0a0908] via-[#0d0b08] to-[#1a1510] border-t border-[#3d3225]/50 flex shrink-0">
      <div className="w-44 xl:w-52 p-3 md:p-4 flex flex-col justify-center gap-2 border-r border-[#3d3225]/30">
        <div className="text-sm text-[#c9b896] font-medium leading-relaxed">{getHintText()}</div>
        {getActionHint() && (
          <div className="text-xs text-[#8a7a6a]">{getActionHint()}</div>
        )}
        <div className="mt-2 pt-2 border-t border-[#3d3225]/30 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#7ab8c9]/20 border border-[#7ab8c9]/50 flex items-center justify-center">
              <span className="text-[8px] text-[#7ab8c9] font-bold">费</span>
            </div>
            <span className="text-xs text-[#7ab8c9] font-medium tabular-nums">
              {player.resources.cost}/{player.resources.maxCost}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#c9952a]/20 border border-[#c9952a]/50 flex items-center justify-center">
              <span className="text-[8px] text-[#c9952a] font-bold">势</span>
            </div>
            <span className="text-xs text-[#c9952a] font-medium tabular-nums">{player.resources.dashi}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#5a8a5a]/20 border border-[#5a8a5a]/50 flex items-center justify-center">
              <span className="text-[8px] text-[#5a8a5a] font-bold">筹</span>
            </div>
            <span className="text-xs text-[#5a8a5a] font-medium tabular-nums">{player.resources.chou}</span>
          </div>
        </div>
      </div>

      <div className="w-40 xl:w-44 p-3 md:p-4 flex flex-col justify-center gap-2 border-r border-[#3d3225]/30">
        {selectedCardId ? (
          <>
            <button
              onClick={onConfirm}
              disabled={!canAct}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#5a8a5a] to-[#4a7a4a] text-white font-medium text-sm hover:from-[#6a9a6a] hover:to-[#5a8a5a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#5a8a5a]/20"
            >
              确认出牌
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 rounded-lg bg-[#2a2318] border border-[#5c4d3a] text-[#b8a88a] text-sm hover:bg-[#3d3225] hover:border-[#7a6a5a] transition-all"
            >
              取消选择
            </button>
            {(selectedCard?.ruleText || selectedCard?.description) && (
              <div className="text-xs text-[#8a7a6a] text-center mt-1">
                {selectedCard?.ruleText ?? selectedCard?.description}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={onEndTurn}
              disabled={!canAct || isFinished}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#c9952a] to-[#b88520] text-white font-medium hover:from-[#d9a53a] hover:to-[#c89530] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#c9952a]/20"
            >
              结束回合
            </button>
            {canAct && (
              <div className="text-[10px] text-[#6a5a4a] text-center leading-tight mt-1">
                {phase === 'play_1' ? '选择卡牌 → 点击座位 → 确认出牌' : phase === 'play_2' ? '可出第二手牌' : '等待阶段'}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-1 px-2 py-3 md:px-4 md:py-4 overflow-x-auto overflow-y-visible">
        {/* 手牌标题 */}
        <div className="text-xs text-[#8a7a6a] uppercase tracking-widest mb-1 text-center">
          手牌 {player.hand.length} 张
        </div>
        <div className="flex items-end justify-center h-full min-w-max mx-auto gap-1 sm:gap-1.5">
          {player.hand.length === 0 ? (
            <div className="text-[#5c4d3a] text-sm">手牌已空</div>
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
