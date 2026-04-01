/**
 * BattleFrameV2 — 双视角切换战斗界面
 *
 * 布局阶段 (ming_bian / an_mou)：手牌主视角，扇形大手牌，战场缩略预览
 * 结算阶段 (reveal / resolve)：战场主视角，双方卡牌完整展示，按路高亮结算
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getPlanAssignError } from '@/battleV2/engine';
import { useDebateBattle } from '@/battleV2/useDebateBattle';
import {
  ArenaId,
  BattlePlayer,
  CardTypeV2,
  DebateCard,
  PlanSlot,
  SeatId,
  SeatState,
  SeatUnit,
} from '@/battleV2/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface BattleFrameV2Props {
  arenaId: ArenaId;
  onMenu?: () => void;
  onReselectArena?: () => void;
}

// ─── Local types ──────────────────────────────────────────────────────────────

type ActionChoice = 'main' | 'response' | 'secret' | 'writing';
type ToastLevel = 'info' | 'success' | 'warning' | 'error';

interface LaneCards {
  playerMain: DebateCard | null;
  playerSecret: DebateCard | null;
  enemyMain: DebateCard | null;
  enemySecret: DebateCard | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEATS: SeatId[] = ['xian_sheng', 'zhu_bian', 'yu_lun'];

const SEAT_ALIAS: Record<SeatId, string> = {
  xian_sheng: '左路',
  zhu_bian: '中路',
  yu_lun: '右路',
};

const ACTION_LABEL: Record<ActionChoice, string> = {
  main: '明论',
  response: '反制',
  secret: '暗策',
  writing: '着书蓄势',
};

const ACTION_NEEDS_TARGET: Record<ActionChoice, boolean> = {
  main: true,
  response: false,
  secret: true,
  writing: false,
};

const ACTION_ORDER: ActionChoice[] = ['main', 'response', 'secret', 'writing'];

const PHASE_STEP_ORDER = ['ming_bian', 'an_mou', 'reveal', 'resolve'] as const;
const PHASE_STEP_LABEL: Record<(typeof PHASE_STEP_ORDER)[number] | 'finished', string> = {
  ming_bian: '明辩',
  an_mou: '暗策',
  reveal: '揭示',
  resolve: '结算',
  finished: '结束',
};

const DEFAULT_ART: Record<CardTypeV2, string> = {
  立论: 'assets/cards/libian.jpg',
  策术: 'assets/cards/qianji.jpg',
  反诘: 'assets/cards/guibian.jpg',
  门客: 'assets/cards/mingshi.jpg',
  玄章: 'assets/cards/wenyan.jpg',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findCard(player: BattlePlayer, cardId: string | null): DebateCard | undefined {
  if (!cardId) return undefined;
  return (
    player.hand.find((c) => c.id === cardId) ??
    player.discard.find((c) => c.id === cardId) ??
    player.writings.find((c) => c.id === cardId) ??
    player.deck.find((c) => c.id === cardId)
  );
}

function artSrc(card: DebateCard): string {
  return card.art ?? DEFAULT_ART[card.type];
}

function effectShort(card: DebateCard): string {
  switch (card.effectKind) {
    case 'damage': return `压力 ${card.effectValue}`;
    case 'shield': return `护印 +${card.effectValue}`;
    case 'draw': return `抽 ${card.effectValue}`;
    case 'zhengli': return `证立 +${card.effectValue}`;
    case 'shixu': return `失序 +${card.effectValue}`;
    case 'summon_front': return `前席 ⚔${card.effectValue}`;
    case 'summon_back': return `后席 ⚔${card.effectValue}`;
    default: return card.effectKind;
  }
}

// ─── 对战卡牌类型→边框配置（从左到右对应5种类型）─────────────────────────────

/**
 * 五种类型边框文件名（放在 public/assets/frames/ 下即生效）：
 * frame-lilun.png / frame-ceshu.png / frame-fanje.png / frame-menke.png / frame-xuanzhang.png
 */
const CARD_FRAME_LIST = [
  { img: 'assets/frames/frame-lilun.png', color: '#9EAD8A', shadow: 'rgba(158,173,138,0.5)' },
  { img: 'assets/frames/frame-ceshu.png', color: '#C06F6F', shadow: 'rgba(192,111,111,0.5)' },
  { img: 'assets/frames/frame-fanje.png', color: '#C9A063', shadow: 'rgba(201,160,99,0.5)' },
  { img: 'assets/frames/frame-menke.png', color: '#9C88A8', shadow: 'rgba(156,136,168,0.5)' },
  { img: 'assets/frames/frame-xuanzhang.png', color: '#909BA6', shadow: 'rgba(144,155,166,0.5)' },
] as const;

function getCardFrame(type: CardTypeV2) {
  const typeOrder = Object.keys(DEFAULT_ART) as CardTypeV2[];
  const index = typeOrder.indexOf(type);
  return CARD_FRAME_LIST[index] ?? CARD_FRAME_LIST[0];
}

const HAND_CARD_WIDTH = 150;
const HAND_CARD_HEIGHT = 225;
const HAND_CARD_FRAME_OUTSET = 18;
const FIELD_CARD_WIDTH = 92;
const FIELD_CARD_HEIGHT = 138;
const FIELD_CARD_FRAME_OUTSET = 9;
const ACTION_SLOT_WIDTH = 78;
const ACTION_SLOT_HEIGHT = 116;

// ─── HandCard (2:3 比例，扇形手牌用) ─────────────────────────────────────────

function HandCard({ card, isSelected }: { card: DebateCard; isSelected: boolean }) {
  const frame = getCardFrame(card.type);
  return (
    <div
      className="relative select-none transition-all duration-150"
      style={{
        width: HAND_CARD_WIDTH,
        height: HAND_CARD_HEIGHT,
        zIndex: isSelected ? 50 : 1,
      }}
    >
      {/* 底部卡牌原画（带圆角截断） */}
      <div 
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          boxShadow: isSelected
            ? `0 0 0 3px ${frame.color}, 0 0 20px ${frame.shadow}, 0 16px 40px rgba(0,0,0,0.4)`
            : `0 0 0 2px ${frame.color}80, 0 6px 16px rgba(0,0,0,0.2)`,
        }}
      >
        <img src={artSrc(card)} alt={card.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100a]/85 via-[#12100a]/15 to-transparent" />
      </div>

      {/* ── 类型边框图片叠加层（允许向外扩出） ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: `-${HAND_CARD_FRAME_OUTSET}px`,
          bottom: `-${HAND_CARD_FRAME_OUTSET}px`,
          left: `-${HAND_CARD_FRAME_OUTSET}px`,
          right: `-${HAND_CARD_FRAME_OUTSET}px`,
          backgroundImage: `url(${frame.img})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 10,
        }}
      />

      {/* 费用圆圈 */}
      <div
        className="absolute left-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full text-[16px] font-bold text-[#f0c97a]"
        style={{ 
          background: 'rgba(18,16,10,0.85)', 
          zIndex: 30, 
          border: `2px solid ${frame.color}`,
          boxShadow: `0 0 8px ${frame.shadow}, 0 2px 4px rgba(0,0,0,0.3)`,
        }}
      >
        {card.cost}
      </div>

      {/* 类型色标已被移除，按用户要求不加点 */}

      {/* 卡名 + 类型 */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6"
        style={{
          zIndex: 30,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(8,7,5,0.72) 42%, rgba(8,7,5,0.92) 100%)',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <div 
          className="truncate font-semibold text-white drop-shadow-lg"
          style={{ 
            fontSize: '15px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.5)',
          }}
        >
          {card.name}
        </div>
        <div 
          className="truncate font-black tracking-widest uppercase"
          style={{ 
            fontSize: '12px',
            color: frame.color,
            textShadow: `0 0 2px #000, 1px 1px 0px #000, -1px -1px 0px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.8)`,
            transform: 'skewX(-10deg)'
          }}
        >
          {card.type}
        </div>
      </div>
    </div>
  );
}


// ─── FanHand ──────────────────────────────────────────────────────────────────

function FanHand({
  cards,
  selectedCardId,
  onSelect,
  onDragStart,
}: {
  cards: DebateCard[];
  selectedCardId: string | null;
  onSelect: (id: string) => void;
  onDragStart?: (cardId: string) => void;
}) {
  const n = cards.length;
  const maxSpreadDeg = 18;
  const overlapPx = 48;

  return (
    <div className="flex items-end justify-center" style={{ paddingBottom: 18 }}>
      {cards.map((card, i) => {
        const t = n <= 1 ? 0 : (i / (n - 1)) * 2 - 1;
        const angle = t * maxSpreadDeg;
        const liftY = (1 - t * t) * 16;
        const isSelected = selectedCardId === card.id;
        return (
          <button
            type="button"
            key={card.id}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', card.id);
              if (onDragStart) onDragStart(card.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelect(card.id);
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              marginLeft: i === 0 ? 0 : -overlapPx,
              transform: `rotate(${angle}deg) translateY(${isSelected ? -65 : liftY}px) scale(${isSelected ? 1.15 : 1})`,
              transformOrigin: 'bottom center',
              zIndex: isSelected ? 100 : 10 + i,
              position: 'relative',
              cursor: 'grab',
              transition: 'transform 0.2s ease, z-index 0.15s ease',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            <HandCard card={card} isSelected={isSelected} />
          </button>
        );
      })}
    </div>
  );
}

// ─── MiniUnitPip (布局阶段战场预览中的单位点) ────────────────────────────────

function MiniUnitPip({ 
  unit, 
  isEnemy, 
  label = '',
  isShaking = false,
  isFlashing = false,
}: { 
  unit: SeatUnit | null; 
  isEnemy: boolean; 
  label?: string;
  isShaking?: boolean;
  isFlashing?: boolean;
}) {
  if (!unit) {
    return (
      <div className={`flex h-12 w-8 items-center justify-center rounded-sm border border-dashed border-[#ccb590]/40 bg-[#f7edde]/30 ${isShaking ? 'animate-shake' : ''}`}>
        <span className="text-[10px] text-[#bfa884]/80">{label}</span>
      </div>
    );
  }
  const hpPct = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100));
  const barColor = isEnemy ? '#c68c72' : '#9f7f55';
  return (
    <div
      title={`${unit.name} ⚔${unit.power} ${unit.hp}/${unit.maxHp}`}
      className={`relative flex h-12 w-8 flex-col items-center justify-center overflow-hidden rounded-sm border ${
        isEnemy
          ? 'border-[#c69a7d]/70 bg-[#4a2e22]'
          : 'border-[#bfa884]/70 bg-[#2b3542]'
      } ${isShaking ? 'animate-shake' : ''} ${isFlashing ? 'animate-flash' : ''}`}
      style={{
        outline: `1px solid ${isEnemy ? '#e8c8b4' : '#d6c2a0'}`,
        outlineOffset: '1px',
        boxShadow: isFlashing ? '0 0 10px 2px rgba(255, 107, 107, 0.6)' : undefined,
      }}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 opacity-40 transition-all duration-300" 
        style={{ height: `${hpPct}%`, backgroundColor: barColor }} 
      />
      <span className="relative z-10 mb-[2px] text-[11px] font-bold text-white" style={{ textShadow: '0 0 2px #000' }}>
        ⚔{unit.power}
      </span>
      <span className="relative z-10 w-full truncate px-[2px] text-center text-[9px] leading-tight text-white/90">
        {unit.name}
      </span>
    </div>
  );
}

// ─── MiniLanePreview (布局阶段三路缩略) ──────────────────────────────────────

function MiniLanePreview({
  seat,
  enemyLane,
  playerLane,
  isSelectable,
  isTarget,
  plannedPlayerCard,
  onSelect,
  onDropCard,
}: {
  seat: SeatId;
  enemyLane: SeatState;
  playerLane: SeatState;
  isSelectable: boolean;
  isTarget: boolean;
  plannedPlayerCard?: DebateCard | null;
  onSelect: (s: SeatId) => void;
  onDropCard?: (seat: SeatId, cardId: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(seat)}
      onDragOver={(e) => {
        if (onDropCard) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={(e) => {
        if (onDropCard) {
          e.preventDefault();
          const cardId = e.dataTransfer.getData('text/plain');
          if (cardId) {
            onDropCard(seat, cardId);
          }
        }
      }}
      className={`relative flex flex-1 flex-col items-center rounded-xl border px-1 py-2 transition-all duration-200 ${
        isTarget
          ? 'border-[#b4823f] bg-[#f2dfbf] shadow-[0_0_0_2px_rgba(180,130,63,0.35)]'
          : isSelectable
          ? 'border-[#bda97e] bg-[#f7edde]/80 hover:border-[#b4823f]'
          : 'border-[#d0b98a]/50 bg-[#f7edde]/50'
      } ${isSelectable || onDropCard ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className="mb-2 text-xs font-bold text-[#5c4631]">
        {SEAT_ALIAS[seat]}
        {isTarget && <span className="ml-1 text-[#b4823f]">✓</span>}
      </span>
      {/* Enemy units */}
      <div className="flex flex-col gap-1 items-center">
        <MiniUnitPip unit={enemyLane.back} isEnemy label="敌后" />
        <MiniUnitPip unit={enemyLane.front} isEnemy label="敌前" />
      </div>
      <div className="my-2 flex w-full items-center justify-center border-t border-[#cfb896]/50">
        <span className="bg-[#f7edde] px-1 text-[9px] font-bold text-[#b4823f] -mt-2">VS</span>
      </div>
      {/* Player Area with possible Planned Card overlap */}
      <div className="relative flex w-full flex-col items-center min-h-[104px] gap-1">
        {plannedPlayerCard && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="h-[76px] w-[50px] overflow-hidden rounded border border-[#c9952a] bg-[#12100a] shadow-lg">
              <img src={artSrc(plannedPlayerCard)} alt={plannedPlayerCard.name} className="h-full w-full object-cover opacity-90" />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent px-0.5 pb-0.5 pt-3 text-center text-[9px] text-white">
                {plannedPlayerCard.name}
              </div>
            </div>
          </div>
        )}
        <div className={`flex flex-col items-center gap-1 transition-opacity ${plannedPlayerCard ? 'opacity-25' : 'opacity-100'}`}>
          <MiniUnitPip unit={playerLane.front} isEnemy={false} label="我前" />
          <MiniUnitPip unit={playerLane.back} isEnemy={false} label="我后" />
        </div>
      </div>
    </div>
  );
}

// ─── FieldCard (结算阶段完整卡牌，2:3) ───────────────────────────────────────

function FieldCard({
  card,
  slot,
  side,
  isRevealed,
  isNew,
  isActiveLane,
  isAttacking,
  isShaking,
}: {
  card: DebateCard | null;
  slot: 'main' | 'secret' | 'response';
  side: 'player' | 'enemy';
  isRevealed?: boolean;
  isNew?: boolean;
  isActiveLane?: boolean;
  isAttacking?: boolean;
  isShaking?: boolean | null;
}) {
  const frame = card ? getCardFrame(card.type) : CARD_FRAME_LIST[0];
  const showBack = slot === 'secret' && !isRevealed;

  if (!card) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-[#c5ad88]/30 bg-transparent"
        style={{ width: FIELD_CARD_WIDTH, height: FIELD_CARD_HEIGHT }}
      />
    );
  }

  if (showBack) {
    return (
      <div
        className={`flex flex-col items-center justify-center overflow-hidden rounded-xl border shadow-md ${
          side === 'enemy' ? 'border-[#c68c72]/60 bg-[#2d1a14]' : 'border-[#9f7f55]/60 bg-[#1a2014]'
        }`}
        style={{ width: FIELD_CARD_WIDTH, height: FIELD_CARD_HEIGHT }}
      >
        <div className="text-[18px] opacity-40">🀫</div>
        <div className="mt-1 text-[9px] text-white/40">暗策</div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-visible transition-all duration-300 ${
        isNew ? 'animate-[fadeSlideIn_0.4s_ease]' : ''
      } ${
        isActiveLane
          ? 'shadow-[0_0_0_3px_#c9952a,0_0_25px_rgba(201,149,42,0.9)] scale-[1.05] z-30'
          : 'shadow-lg'
      } ${
        isAttacking ? 'animate-card-attack scale-110 z-40 shadow-[0_0_0_4px_#ffeb3b,0_0_30px_rgba(255,235,59,0.9)]' : ''
      } ${
        isShaking ? 'animate-shake' : ''
      }`}
      style={{ 
        width: FIELD_CARD_WIDTH, 
        height: FIELD_CARD_HEIGHT,
        zIndex: isAttacking ? 40 : isActiveLane ? 30 : 20,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <img src={artSrc(card)} alt={card.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100a]/80 via-transparent to-transparent" />
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate font-black tracking-widest uppercase"
          style={{ 
            fontSize: '10px',
            color: frame.color,
            textShadow: `1px 1px 0px #000, 0 2px 4px rgba(0,0,0,0.9)`,
            transform: 'skewX(-5deg)'
          }}
        >
          {card.type}
        </div>
      </div>
      <div
        className="pointer-events-none absolute"
        style={{
          top: `-${FIELD_CARD_FRAME_OUTSET}px`,
          bottom: `-${FIELD_CARD_FRAME_OUTSET}px`,
          left: `-${FIELD_CARD_FRAME_OUTSET}px`,
          right: `-${FIELD_CARD_FRAME_OUTSET}px`,
          backgroundImage: `url(${frame.img})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 10,
          filter: side === 'enemy' ? 'saturate(0.92) brightness(0.95)' : 'none',
        }}
      />
      {/* Cost */}
      <div
        className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#12100a]/75 text-[11px] font-bold text-[#f0c97a]"
        style={{ 
          zIndex: 30,
          border: `2px solid ${frame.color}`,
          boxShadow: `0 0 6px ${frame.shadow}, 0 1px 3px rgba(0,0,0,0.4)`,
        }}
      >
        {card.cost}
      </div>
      {slot === 'secret' && (
        <div className="absolute right-1.5 top-1.5 rounded bg-[#7a5c2e]/90 px-1.5 text-[9px] font-bold text-[#f0c97a]" style={{ zIndex: 30, border: '1px solid rgba(255,255,255,0.2)' }}>
          暗
        </div>
      )}
      {/* Name */}
      <div className="absolute bottom-0 left-0 right-0 px-2 pb-2" style={{ zIndex: 30 }}>
        <div 
          className="truncate font-semibold text-white/95"
          style={{ 
            fontSize: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.5)',
          }}
        >
          {card.name}
        </div>
        <div 
          className="truncate font-medium"
          style={{ 
            fontSize: '11px',
            color: 'rgba(255,255,255,0.75)',
            textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.5)',
          }}
        >
          {effectShort(card)}
        </div>
      </div>
    </div>
  );
}

// ─── SettlementLane (结算阶段完整路) ─────────────────────────────────────────

interface DamageNumber {
  id: string;
  value: number;
  type: 'huyin' | 'xinzheng' | 'dingli';
  position: { x: number; y: number };
}

interface SettlementAnimation {
  laneIdx: number;
  attackerCardId: string | null;
  targetSlot: 'front' | 'back' | 'hero' | null;
  isAttacking: boolean;
  damageNumbers: DamageNumber[];
  showPenetrate: boolean;
  penetrateTarget: 'back' | 'hero' | null;
}

function SettlementLane({
  seat,
  enemyLane,
  playerLane,
  laneCards,
  isActive,
  isDimmed,
  isRevealed,
  animation,
  side,
}: {
  seat: SeatId;
  enemyLane: SeatState;
  playerLane: SeatState;
  laneCards: LaneCards;
  isActive: boolean;
  isDimmed: boolean;
  isRevealed: boolean;
  animation?: SettlementAnimation;
  side?: 'player' | 'enemy' | null;
}) {
  const hasEnemyPlay = laneCards.enemyMain || laneCards.enemySecret;
  const hasPlayerPlay = laneCards.playerMain || laneCards.playerSecret;
  const isAttacking = animation?.isAttacking && isActive;
  
  // 判断哪张卡牌是攻击者
  const isPlayerAttacker = side === 'player';
  const playerCardId = laneCards.playerMain?.id || laneCards.playerSecret?.id;
  const enemyCardId = laneCards.enemyMain?.id || laneCards.enemySecret?.id;
  const isPlayerCardAttacking = isAttacking && isPlayerAttacker && animation?.attackerCardId === playerCardId;
  const isEnemyCardAttacking = isAttacking && !isPlayerAttacker && animation?.attackerCardId === enemyCardId;

  return (
    <div
      className={`flex flex-1 flex-col overflow-hidden rounded-2xl border transition-all duration-500 ${
        isActive
          ? 'z-10 scale-[1.08] border-[#d4a520] bg-[#f5e6c8] shadow-[0_0_0_4px_rgba(212,165,32,0.5),0_16px_40px_rgba(0,0,0,0.3)]'
          : isDimmed
          ? 'scale-[0.92] border-[#c5ad88]/30 bg-[#f7edde]/40 opacity-40'
          : 'border-[#c5ad88]/80 bg-[#f7edde]'
      }`}
    >
      {/* Lane header */}
      <div
        className={`flex items-center justify-center gap-2 border-b py-2 ${
          isActive ? 'border-[#d4a520]/50 bg-[#f2dfbf]/80' : 'border-[#d0b98a]/40'
        }`}
      >
        <span className={`text-sm font-semibold ${isActive ? 'text-[#8b4513] scale-110' : 'text-[#5c4631]'}`}>
          {SEAT_ALIAS[seat]}
        </span>
        {isActive && (
          <span className="animate-pulse rounded-full bg-[#d4a520] px-3 py-1 text-[11px] font-bold text-white shadow-lg">
            结算中
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-2 p-2">
        {/* 伤害数字浮动层 */}
        {animation?.damageNumbers.map((dmg) => (
          <DamageFloat
            key={dmg.id}
            value={dmg.value}
            type={dmg.type}
            position={dmg.position}
          />
        ))}
        
        {/* 穿透提示 */}
        {isActive && animation?.showPenetrate && (
          <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-bounce rounded-lg border-2 border-[#ff6b6b] bg-[#ff6b6b]/20 px-4 py-2 text-lg font-bold text-[#ff6b6b] shadow-lg">
              ⚔️ 穿透！
            </div>
          </div>
        )}

        {/* Enemy cards + units */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Enemy played cards */}
          {hasEnemyPlay ? (
            <div className="flex gap-1.5 justify-center">
              {laneCards.enemyMain && (
                <FieldCard 
                  card={laneCards.enemyMain} 
                  slot="main" 
                  side="enemy" 
                  isRevealed 
                  isNew={isRevealed}
                  isActiveLane={isActive}
                  isAttacking={isEnemyCardAttacking && laneCards.enemyMain.id === animation?.attackerCardId}
                  isShaking={isActive && animation?.targetSlot && !isPlayerAttacker}
                />
              )}
              {laneCards.enemySecret && (
                <FieldCard 
                  card={laneCards.enemySecret} 
                  slot="secret" 
                  side="enemy" 
                  isRevealed={isRevealed} 
                  isNew={isRevealed}
                  isActiveLane={isActive}
                  isAttacking={isEnemyCardAttacking && laneCards.enemySecret.id === animation?.attackerCardId}
                  isShaking={isActive && animation?.targetSlot && !isPlayerAttacker}
                />
              )}
            </div>
          ) : (
            <div className="flex h-[120px] items-center justify-center text-[10px] text-[#b3a080]">无出牌</div>
          )}
          {/* Enemy units row */}
          <div className="flex gap-1 justify-center">
            <MiniUnitPip 
              unit={enemyLane.back} 
              isEnemy 
              label="敌后"
              isShaking={isActive && animation?.targetSlot === 'back' && !isPlayerAttacker}
              isFlashing={isActive && animation?.targetSlot === 'back' && !isPlayerAttacker}
            />
            <MiniUnitPip 
              unit={enemyLane.front} 
              isEnemy 
              label="敌前"
              isShaking={isActive && animation?.targetSlot === 'front' && !isPlayerAttacker}
              isFlashing={isActive && animation?.targetSlot === 'front' && !isPlayerAttacker}
            />
          </div>
        </div>

        {/* Center divider */}
        <div className={`h-px ${isActive ? 'bg-[#d4a520]/60' : 'bg-[#cfb896]'}`} />

        {/* Player units + cards */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Player units row */}
          <div className="flex gap-1 justify-center">
            <MiniUnitPip 
              unit={playerLane.front} 
              isEnemy={false} 
              label="我前"
              isShaking={isActive && animation?.targetSlot === 'front' && isPlayerAttacker}
              isFlashing={isActive && animation?.targetSlot === 'front' && isPlayerAttacker}
            />
            <MiniUnitPip 
              unit={playerLane.back} 
              isEnemy={false} 
              label="我后"
              isShaking={isActive && animation?.targetSlot === 'back' && isPlayerAttacker}
              isFlashing={isActive && animation?.targetSlot === 'back' && isPlayerAttacker}
            />
          </div>
          {/* Player played cards */}
          {hasPlayerPlay ? (
            <div className="flex gap-1.5 justify-center">
              {laneCards.playerMain && (
                <FieldCard 
                  card={laneCards.playerMain} 
                  slot="main" 
                  side="player" 
                  isRevealed 
                  isNew={isRevealed}
                  isActiveLane={isActive}
                  isAttacking={isPlayerCardAttacking && laneCards.playerMain.id === animation?.attackerCardId}
                  isShaking={isActive && animation?.targetSlot && isPlayerAttacker}
                />
              )}
              {laneCards.playerSecret && (
                <FieldCard 
                  card={laneCards.playerSecret} 
                  slot="secret" 
                  side="player" 
                  isRevealed={isRevealed} 
                  isNew={isRevealed}
                  isActiveLane={isActive}
                  isAttacking={isPlayerCardAttacking && laneCards.playerSecret.id === animation?.attackerCardId}
                  isShaking={isActive && animation?.targetSlot && isPlayerAttacker}
                />
              )}
            </div>
          ) : (
            <div className="flex h-[120px] items-center justify-center text-[10px] text-[#b3a080]">无出牌</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DamageFloat (伤害数字浮动) ──────────────────────────────────────────────

function DamageFloat({
  value,
  type,
  position,
}: {
  value: number;
  type: 'huyin' | 'xinzheng' | 'dingli';
  position: { x: number; y: number };
}) {
  const typeConfig = {
    huyin: { label: '护印', color: '#4a90d9', bg: 'rgba(74,144,217,0.2)' },
    xinzheng: { label: '心证', color: '#ff6b6b', bg: 'rgba(255,107,107,0.2)' },
    dingli: { label: '定力', color: '#9b59b6', bg: 'rgba(155,89,182,0.2)' },
  };
  const config = typeConfig[type];

  return (
    <div
      className="pointer-events-none absolute z-40 animate-damage-float"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div
        className="flex flex-col items-center rounded-lg border px-3 py-1.5 shadow-lg"
        style={{
          background: config.bg,
          borderColor: config.color,
          color: config.color,
        }}
      >
        <span className="text-[10px] font-medium">{config.label}</span>
        <span className="text-lg font-bold">-{value}</span>
      </div>
    </div>
  );
}


// ─── ActionChip ── 状态件：既是状态展示，也是出牌动作入口 ──────────────────────

/**
 * 视觉状态：
// ─── ActionDropZone (原 ActionChip 的卡槽化) ──────────────────────────────────
/**
 * 状态逻辑与 ActionChip 相同，但渲染为实际的卡牌槽 (比例 2:3，比如 64x96)
 * 支持 Drag & Drop
 */
function ActionDropZone({
  action,
  filledCard,
  locked,
  canAct,
  isActive,
  onAct,
  onClear,
  onDrop,
}: {
  action: ActionChoice;
  filledCard: DebateCard | null;
  locked: boolean;
  canAct: boolean;
  isActive: boolean;
  onAct: () => void;
  onClear?: () => void;
  onDrop: (cardId: string) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAct) onAct();
    else if (filledCard && !locked && onClear) onClear();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (canAct && !locked) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId && canAct && !locked) {
      onDrop(cardId);
    }
  };

  // 样式设定
  let borderCls = '';
  let bgCls = '';
  
  if (isActive) {
    borderCls = 'border-2 border-[#c9952a] shadow-[0_0_12px_rgba(201,149,42,0.4)]';
    bgCls = 'bg-[#f5e890]/20';
  } else if (locked && filledCard) {
    borderCls = 'border border-[#9f7d52]/50 cursor-default';
    bgCls = 'bg-[#d4b97a]/15';
  } else if (locked && !filledCard) {
    borderCls = 'border border-dashed border-[#c5ad88]/20 cursor-default';
    bgCls = 'bg-transparent';
  } else if (canAct && !filledCard) {
    borderCls = 'border border-dashed border-[#c9952a]/70 hover:border-solid hover:bg-[#f5e890]/10 cursor-pointer';
    bgCls = 'bg-[#f5e890]/5';
  } else if (canAct && filledCard) {
    borderCls = 'border-2 border-[#9f7d52] hover:border-[#c9952a] cursor-pointer';
    bgCls = 'bg-transparent';
  } else if (filledCard) {
    borderCls = 'border border-[#9f7d52]/80 cursor-default';
    bgCls = 'bg-transparent';
  } else {
    borderCls = 'border border-dashed border-[#c5ad88]/40 cursor-default';
    bgCls = 'bg-transparent';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] text-[#7a6450] font-medium">{ACTION_LABEL[action]}</div>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative overflow-hidden flex flex-col items-center justify-center rounded-lg transition-all duration-200 ${borderCls} ${bgCls}`}
        style={{ width: ACTION_SLOT_WIDTH, height: ACTION_SLOT_HEIGHT }}
      >
        {filledCard ? (
          <>
            <img src={artSrc(filledCard)} alt={filledCard.name} className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12100a]/90 via-[#12100a]/20 to-transparent" />
            <div className="absolute bottom-1 w-full text-center px-1">
              <div className="truncate text-[10px] font-bold text-white/95">{filledCard.name}</div>
            </div>
            {(!locked && onClear) && (
              <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-[10px] text-white/80 hover:bg-red-500/80">
                ×
              </div>
            )}
            {locked && (
              <div className="absolute top-1 right-1 text-[10px] opacity-70">🔒</div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-40">
            <span className="text-xl text-[#c5ad88]">+</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BattleFrameV2({ arenaId, onMenu, onReselectArena }: BattleFrameV2Props) {
  const { state, planCard, planWriting, setTargetSeat, lockPublic, lockSecret } = useDebateBattle({ arenaId });

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionChoice | null>(null);
  const [, setHotSeats] = useState<SeatId[]>([]);
  const [activeLaneIdx, setActiveLaneIdx] = useState<number | null>(null);
  const [isConfirmPending, setIsConfirmPending] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; level: ToastLevel } | null>(null);
  
  // 结算动画状态
  const [settlementAnimation, setSettlementAnimation] = useState<SettlementAnimation | null>(null);
  const [settlementAnimationSide, setSettlementAnimationSide] = useState<'player' | 'enemy' | null>(null);

  const hotSeatTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const confirmCooldownRef = useRef<number | null>(null);
  const prevSeatSnapshotRef = useRef<Record<SeatId, string> | null>(null);
  const settlementSequenceTokenRef = useRef(0);

  const { phase, round } = state;

  const showToast = useCallback((message: string, level: ToastLevel = 'info') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message, level });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1900);
  }, []);

  const CARD_TYPE_ORDER: Record<string, number> = {
    '立论': 1,
    '策术': 2,
    '反诘': 3,
    '玄章': 4,
    '门客': 5,
  };
  const handCardMap = useMemo(() => {
    const map = new Map<string, DebateCard>();
    for (const card of state.player.hand) {
      map.set(card.id, card);
    }
    return map;
  }, [state.player.hand]);

  const sortedHand = useMemo(() => {
    return [...state.player.hand].sort((a, b) => {
      const typeDiff = (CARD_TYPE_ORDER[a.type] ?? 99) - (CARD_TYPE_ORDER[b.type] ?? 99);
      if (typeDiff !== 0) return typeDiff;
      return a.cost - b.cost;
    });
  }, [state.player.hand]);
  const selectedCard = selectedCardId ? handCardMap.get(selectedCardId) ?? null : null;
  const plannedMainCard = state.player.plan.mainCardId ? handCardMap.get(state.player.plan.mainCardId) ?? null : null;
  const plannedResponseCard = state.player.plan.responseCardId ? handCardMap.get(state.player.plan.responseCardId) ?? null : null;
  const plannedSecretCard = state.player.plan.secretCardId ? handCardMap.get(state.player.plan.secretCardId) ?? null : null;
  const plannedWritingCard = state.player.plan.writingCardId ? handCardMap.get(state.player.plan.writingCardId) ?? null : null;

  const isAnMou = phase === 'an_mou';
  const isLayoutPhase = phase === 'ming_bian' || phase === 'an_mou';
  const isSettlementPhase = phase === 'reveal' || phase === 'resolve';
  const isFinished = phase === 'finished';
  const isRevealed = phase === 'resolve' || phase === 'finished';

  const canPlanPublic = phase === 'ming_bian' && !state.player.plan.lockedPublic;
  const canPlanSecret = phase === 'an_mou' && !state.player.plan.lockedSecret;

  const timeWarningActive =
    !isFinished && (phase === 'ming_bian' || phase === 'an_mou') && state.secondsLeft <= 5;
  const timerText = isFinished ? '—' : `${state.secondsLeft}s`;

  const phaseLabel = PHASE_STEP_LABEL[phase];
  const xinMaxForBars = Math.max(
    30,
    state.player.resources.xinZheng,
    state.enemy.resources.xinZheng,
    1,
  );
  const enemyXinPct = Math.max(0, Math.min(100, Math.round((state.enemy.resources.xinZheng / xinMaxForBars) * 100)));


  // ── Hot seat animation ───────────────────────────────────────────────────
  const seatSnapshot = useMemo(() => {
    const snap = {} as Record<SeatId, string>;
    for (const seat of SEATS) {
      const p = state.player.seats[seat];
      const e = state.enemy.seats[seat];
      snap[seat] = [p.front?.hp, p.back?.hp, e.front?.hp, e.back?.hp].join('|');
    }
    return snap;
  }, [state.player.seats, state.enemy.seats]);

  useEffect(() => {
    const prev = prevSeatSnapshotRef.current;
    if (!prev) { prevSeatSnapshotRef.current = seatSnapshot; return; }
    const changed = SEATS.filter((s) => prev[s] !== seatSnapshot[s]);
    prevSeatSnapshotRef.current = seatSnapshot;
    if (!changed.length) return;
    setHotSeats(changed);
    if (hotSeatTimerRef.current) window.clearTimeout(hotSeatTimerRef.current);
    hotSeatTimerRef.current = window.setTimeout(() => { setHotSeats([]); }, 900);
  }, [seatSnapshot]);

  useEffect(() => () => {
    if (hotSeatTimerRef.current) window.clearTimeout(hotSeatTimerRef.current);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    if (confirmCooldownRef.current) window.clearTimeout(confirmCooldownRef.current);
  }, []);

  // ── Deselect card when it leaves hand ───────────────────────────────────
  useEffect(() => {
    if (selectedCardId && !state.player.hand.some((c) => c.id === selectedCardId)) {
      setSelectedCardId(null); setSelectedAction(null);
    }
  }, [selectedCardId, state.player.hand]);

  // ── Reset selection on phase/round change ────────────────────────────────
  useEffect(() => { setSelectedAction(null); setSelectedCardId(null); }, [phase, round]);

  // ── Slot validation ──────────────────────────────────────────────────────
  const getSlotError = (slot: PlanSlot): string | null => {
    if (!selectedCardId) return '请先选择手牌';
    if (slot === 'secret' && !canPlanSecret) return '当前不是暗策阶段';
    if (slot !== 'secret' && !canPlanPublic) return '当前不是公开阶段';
    return getPlanAssignError(state.player, slot, selectedCardId);
  };

  const getWritingError = (): string | null => {
    if (!selectedCardId) return '请先选择手牌';
    if (!canPlanPublic) return '当前不是公开阶段';
    const used = [state.player.plan.mainCardId, state.player.plan.responseCardId, state.player.plan.secretCardId].filter(Boolean);
    if (used.includes(selectedCardId)) return '已放入其他位置';
    return null;
  };

  const canMain = !getSlotError('main');
  const canResponse = !getSlotError('response');
  const canSecret = !getSlotError('secret');
  const canWriting = !getWritingError();

  const actionOptions = useMemo<ActionChoice[]>(() => {
    if (!selectedCardId) return [];
    return ACTION_ORDER.filter((a) => {
      if (a === 'main') return canMain;
      if (a === 'response') return canResponse;
      if (a === 'secret') return canSecret;
      return canWriting;
    });
  }, [selectedCardId, canMain, canResponse, canSecret, canWriting]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCardSelect = useCallback((id: string) => {
    setSelectedCardId((prev) => (prev === id ? null : id));
    setSelectedAction(null);
  }, []);

  const reportRuntimeError = useCallback((context: string, error: unknown) => {
    const detail = error instanceof Error ? error.message : '未知异常';
    setRuntimeError(`${context}：${detail}`);
    showToast(`${context}失败`, 'error');
  }, [showToast]);

  const runSafeAction = useCallback((context: string, action: () => void, successMessage?: string) => {
    try {
      action();
      setRuntimeError(null);
      if (successMessage) {
        showToast(successMessage, 'success');
      }
    } catch (error) {
      reportRuntimeError(context, error);
    }
  }, [reportRuntimeError, showToast]);

  const planCardSafe = useCallback((slot: PlanSlot, cardId: string | null, successMessage?: string) => {
    runSafeAction('布置卡牌', () => planCard(slot, cardId), successMessage);
  }, [planCard, runSafeAction]);

  const planWritingSafe = useCallback((cardId: string | null, successMessage?: string) => {
    runSafeAction('着书蓄势', () => planWriting(cardId), successMessage);
  }, [planWriting, runSafeAction]);

  const setTargetSeatSafe = useCallback((slot: 'main' | 'secret', seat: SeatId) => {
    runSafeAction('设置目标路位', () => setTargetSeat(slot, seat));
  }, [runSafeAction, setTargetSeat]);

  const applyCardToAction = useCallback((action: ActionChoice, cardId: string) => {
    if (!handCardMap.has(cardId)) {
      showToast('该卡牌状态已变化，请重新选择', 'warning');
      return;
    }

    if (ACTION_NEEDS_TARGET[action]) {
      setSelectedCardId(cardId);
      setSelectedAction(action);
      showToast(action === 'main' ? '请选择主动作目标路位' : '请选择暗策目标路位', 'info');
      return;
    }

    if (action === 'response') {
      planCardSafe('response', cardId, '已分配至反制槽');
    } else {
      planWritingSafe(cardId, '已放入着书蓄势');
    }
    setSelectedCardId(null);
    setSelectedAction(null);
  }, [handCardMap, planCardSafe, planWritingSafe, showToast]);

  const handleActionPick = useCallback((action: ActionChoice) => {
    if (!selectedCardId || !selectedCard) {
      showToast('请先选择手牌', 'warning');
      return;
    }
    if (ACTION_NEEDS_TARGET[action]) {
      setSelectedAction(action);
      showToast(action === 'main' ? '请选择主动作目标路位' : '请选择暗策目标路位', 'info');
    } else if (action === 'response') {
      planCardSafe('response', selectedCardId, '已分配至反制槽');
      setSelectedCardId(null);
      setSelectedAction(null);
    } else {
      planWritingSafe(selectedCardId, '已放入着书蓄势');
      setSelectedCardId(null);
      setSelectedAction(null);
    }
  }, [planCardSafe, planWritingSafe, selectedCard, selectedCardId, showToast]);

  const handleSeatSelect = useCallback((seat: SeatId) => {
    const seatAction = selectedAction === 'main' || selectedAction === 'secret' ? selectedAction : null;
    if (!seatAction || !selectedCardId || !selectedCard) {
      showToast('请先选择需要落位的卡牌与动作', 'warning');
      return;
    }
    setTargetSeatSafe(seatAction, seat);
    planCardSafe(
      seatAction,
      selectedCardId,
      seatAction === 'main' ? `主动作已布置到${SEAT_ALIAS[seat]}` : `暗策已布置到${SEAT_ALIAS[seat]}`,
    );
    setSelectedCardId(null);
    setSelectedAction(null);
  }, [planCardSafe, selectedAction, selectedCard, selectedCardId, setTargetSeatSafe, showToast]);

  // ── Confirm button ────────────────────────────────────────────────────────
  const runConfirm = useCallback((kind: 'public' | 'secret') => {
    if (isConfirmPending) return;
    try {
      setIsConfirmPending(true);
      if (kind === 'public') {
        lockPublic();
        showToast('明辩布局已确认', 'success');
      } else {
        lockSecret();
        showToast('暗策布局已确认', 'success');
      }
      setRuntimeError(null);
    } catch (error) {
      reportRuntimeError('确认阶段', error);
    } finally {
      if (confirmCooldownRef.current) {
        window.clearTimeout(confirmCooldownRef.current);
      }
      confirmCooldownRef.current = window.setTimeout(() => setIsConfirmPending(false), 350);
    }
  }, [isConfirmPending, lockPublic, lockSecret, reportRuntimeError, showToast]);

  const confirmBtn = useMemo(() => {
    if (phase === 'ming_bian') {
      return {
        label: state.player.plan.lockedPublic ? '已确认' : isConfirmPending ? '确认中…' : '确认',
        onClick: () => runConfirm('public'),
        disabled: !canPlanPublic || isConfirmPending,
      };
    }
    if (phase === 'an_mou') {
      return {
        label: state.player.plan.lockedSecret ? '已确认' : isConfirmPending ? '确认中…' : '确认暗策',
        onClick: () => runConfirm('secret'),
        disabled: !canPlanSecret || isConfirmPending,
      };
    }
    return { label: '等待', onClick: () => undefined, disabled: true };
  }, [canPlanPublic, canPlanSecret, isConfirmPending, phase, runConfirm, state.player.plan.lockedPublic, state.player.plan.lockedSecret]);

  // ── Seat picking ──────────────────────────────────────────────────────────
  const seatPickingAction = selectedAction === 'main' || selectedAction === 'secret' ? selectedAction : null;
  const activeTargetSeat =
    seatPickingAction === 'main' ? state.player.plan.mainTargetSeat :
    seatPickingAction === 'secret' ? state.player.plan.secretTargetSeat : null;

  // ── Lane cards for settlement ─────────────────────────────────────────────
  const laneCardsMap = useMemo((): Record<SeatId, LaneCards> => {
    const result = {} as Record<SeatId, LaneCards>;
    for (const seat of SEATS) {
      result[seat] = { playerMain: null, playerSecret: null, enemyMain: null, enemySecret: null };
    }
    const { plan: pp } = state.player;
    const { plan: ep } = state.enemy;

    if (pp.mainCardId) result[pp.mainTargetSeat].playerMain = findCard(state.player, pp.mainCardId) ?? null;
    if (pp.secretCardId) result[pp.secretTargetSeat].playerSecret = findCard(state.player, pp.secretCardId) ?? null;
    if (ep.mainCardId) result[ep.mainTargetSeat].enemyMain = findCard(state.enemy, ep.mainCardId) ?? null;
    if (ep.secretCardId) result[ep.secretTargetSeat].enemySecret = findCard(state.enemy, ep.secretCardId) ?? null;

    return result;
  }, [state.player, state.enemy]);

  // 播放攻击动画
  const playAttackAnimation = async (
    laneIdx: number,
    attackerCardId: string,
    side: 'player' | 'enemy',
    seat: SeatId,
    sequenceToken: number,
  ) => {
    if (settlementSequenceTokenRef.current !== sequenceToken) return;
    const enemyLane = state.enemy.seats[seat];
    const playerLane = state.player.seats[seat];
    
    // 确定攻击目标优先级：前排 > 后排 > 主辩者
    let targetSlot: 'front' | 'back' | 'hero' = 'hero';
    if (side === 'player') {
      if (enemyLane.front) targetSlot = 'front';
      else if (enemyLane.back) targetSlot = 'back';
    } else {
      if (playerLane.front) targetSlot = 'front';
      else if (playerLane.back) targetSlot = 'back';
    }
    
    // 阶段1：攻击者卡牌高亮并前冲
    setSettlementAnimationSide(side);
    setSettlementAnimation({
      laneIdx,
      attackerCardId,
      targetSlot,
      isAttacking: true,
      damageNumbers: [],
      showPenetrate: false,
      penetrateTarget: null,
    });
    if (settlementSequenceTokenRef.current !== sequenceToken) return;
    
    // 等待攻击动作
    await new Promise(resolve => setTimeout(resolve, 400));
    if (settlementSequenceTokenRef.current !== sequenceToken) return;
    
    // 阶段2：目标震动 + 显示伤害数字
    const damageNumbers: DamageNumber[] = [];
    
    // 根据目标类型生成伤害数字
    if (targetSlot === 'front' || targetSlot === 'back') {
      // 攻击单位：显示护印伤害
      damageNumbers.push({
        id: `huyin-${laneIdx}-${Date.now()}`,
        value: Math.floor(Math.random() * 3) + 2, // 模拟伤害值
        type: 'huyin',
        position: { x: 50 + Math.random() * 40, y: side === 'player' ? 30 : 70 },
      });
    } else {
      // 穿透到主辩者：显示心证伤害
      damageNumbers.push({
        id: `xinzheng-${laneIdx}-${Date.now()}`,
        value: Math.floor(Math.random() * 2) + 1,
        type: 'xinzheng',
        position: { x: 50, y: 50 },
      });
    }
    
    setSettlementAnimation(prev => prev ? {
      ...prev,
      isAttacking: false,
      damageNumbers,
    } : null);
    if (settlementSequenceTokenRef.current !== sequenceToken) return;
    
    // 等待伤害显示
    await new Promise(resolve => setTimeout(resolve, 600));
    if (settlementSequenceTokenRef.current !== sequenceToken) return;
    
    // 阶段3：检查穿透
    const shouldPenetrate = targetSlot !== 'hero' && Math.random() > 0.5; // 模拟穿透判定
    
    if (shouldPenetrate && targetSlot === 'front') {
      // 显示穿透提示
      setSettlementAnimation(prev => prev ? {
        ...prev,
        showPenetrate: true,
        penetrateTarget: 'back',
      } : null);
      if (settlementSequenceTokenRef.current !== sequenceToken) return;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      if (settlementSequenceTokenRef.current !== sequenceToken) return;
      
      // 继续攻击后排
      setSettlementAnimation(prev => prev ? {
        ...prev,
        targetSlot: 'back',
        showPenetrate: false,
        damageNumbers: [{
          id: `dingli-${laneIdx}-${Date.now()}`,
          value: Math.floor(Math.random() * 2) + 1,
          type: 'dingli',
          position: { x: 60, y: side === 'player' ? 40 : 60 },
        }],
      } : null);
      if (settlementSequenceTokenRef.current !== sequenceToken) return;
      
      await new Promise(resolve => setTimeout(resolve, 600));
      if (settlementSequenceTokenRef.current !== sequenceToken) return;
      
      // 检查是否继续穿透到主辩者
      const shouldPenetrateToHero = Math.random() > 0.5;
      if (shouldPenetrateToHero) {
        setSettlementAnimation(prev => prev ? {
          ...prev,
          showPenetrate: true,
          penetrateTarget: 'hero',
        } : null);
        if (settlementSequenceTokenRef.current !== sequenceToken) return;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        if (settlementSequenceTokenRef.current !== sequenceToken) return;
        
        setSettlementAnimation(prev => prev ? {
          ...prev,
          targetSlot: 'hero',
          showPenetrate: false,
          damageNumbers: [{
            id: `xinzheng2-${laneIdx}-${Date.now()}`,
            value: 1,
            type: 'xinzheng',
            position: { x: 50, y: 50 },
          }],
        } : null);
        if (settlementSequenceTokenRef.current !== sequenceToken) return;
        
        await new Promise(resolve => setTimeout(resolve, 600));
        if (settlementSequenceTokenRef.current !== sequenceToken) return;
      }
    }
    
    // 清除动画
    if (settlementSequenceTokenRef.current === sequenceToken) {
      setSettlementAnimation(null);
    }
  };

  // ── Active lane during resolve ───────────────────────────────────────────
  useEffect(() => {
    // 增加一个额外的 check，如果是因为状态更新（比如扣血）触发的 re-run，
    // 但 token 没变，我们就不要重置。这里的 logic 需要精确控制。
    // 但是 React 的 useEffect 会在每次依赖变化时执行。
    // 为了防止“从路位 0 重头开始”，我们需要在 runSettlementSequence 内部
    // 也能感知到是否这是一个“新”的 resolve 阶段。
    
    if (phase !== 'resolve') {
      setActiveLaneIdx(null);
      setSettlementAnimation(null);
      settlementSequenceTokenRef.current += 1; // 仅在退出或转换阶段时更新 token
      return;
    }

    const currentToken = settlementSequenceTokenRef.current;

    const runSettlementSequence = async () => {
      try {
        for (let laneIdx = 0; laneIdx < 3; laneIdx++) {
          if (settlementSequenceTokenRef.current !== currentToken) return;
          setActiveLaneIdx(laneIdx);
          const seat = SEATS[laneIdx];
          const laneCard = laneCardsMap[seat];

          const hasPlayerAttack = Boolean(laneCard.playerMain || laneCard.playerSecret);
          const hasEnemyAttack = Boolean(laneCard.enemyMain || laneCard.enemySecret);

          if (hasPlayerAttack) {
            const attackerCard = laneCard.playerMain || laneCard.playerSecret;
            if (attackerCard) {
              await playAttackAnimation(laneIdx, attackerCard.id, 'player', seat, currentToken);
            }
          }

          if (hasEnemyAttack) {
            const attackerCard = laneCard.enemyMain || laneCard.enemySecret;
            if (attackerCard) {
              await playAttackAnimation(laneIdx, attackerCard.id, 'enemy', seat, currentToken);
            }
          }

          if (settlementSequenceTokenRef.current !== currentToken) return;
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } catch (error) {
        reportRuntimeError('结算动画', error);
      }
    };

    void runSettlementSequence();

    return () => {
      settlementSequenceTokenRef.current += 1;
      setSettlementAnimation(null);
    };
  }, [phase, round, laneCardsMap, reportRuntimeError]);

  const finalPlayerXin = state.player.resources.xinZheng;
  const finalEnemyXin = state.enemy.resources.xinZheng;
  const finalWinner: 'player' | 'enemy' | 'draw' =
    finalPlayerXin === finalEnemyXin ? 'draw' : finalPlayerXin > finalEnemyXin ? 'player' : 'enemy';
  const finalTitle =
    finalWinner === 'player' ? '✦ 辩局胜利 ✦' : finalWinner === 'enemy' ? '本局失利' : '势均力敌';
  const finalSubtitle =
    finalWinner === 'player' ? '你在本局中占据上风' : finalWinner === 'enemy' ? '再调整策略继续挑战' : '双方心证持平，难分高下';
  const finalTitleClass =
    finalWinner === 'player'
      ? 'text-[#ffe3af]'
      : finalWinner === 'enemy'
      ? 'text-[#ffc0c0]'
      : 'text-[#f3dcb1]';
  const finalProgressMax = Math.max(30, finalPlayerXin, finalEnemyXin, 1);
  const finalPlayerPct = Math.max(0, Math.min(100, Math.round((finalPlayerXin / finalProgressMax) * 100)));
  const finalEnemyPct = Math.max(0, Math.min(100, Math.round((finalEnemyXin / finalProgressMax) * 100)));
  const toastStyleMap: Record<ToastLevel, { bg: string; border: string; text: string; icon: string }> = {
    info: { bg: 'rgba(74,46,34,0.9)', border: '#b89560', text: '#f0d3a2', icon: 'i' },
    success: { bg: 'rgba(26,71,54,0.92)', border: '#3fa36b', text: '#c8f2dc', icon: '+' },
    warning: { bg: 'rgba(92,64,24,0.92)', border: '#d4a520', text: '#ffe8a9', icon: '!' },
    error: { bg: 'rgba(90,32,32,0.92)', border: '#dc6b6b', text: '#ffd1d1', icon: 'x' },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#ede1cc]">
      {/* ── 背景氛围层 ────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,135,67,0.1),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(74,122,132,0.08),transparent_45%)]" />

      {/* ── Toast 通知层 ────────────────────────────────────────────── */}
      {toast?.message && (
        <div 
          className="absolute left-1/2 top-10 z-[100] -translate-x-1/2 rounded border px-6 py-2 text-sm font-bold shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4"
          style={{ 
            backgroundColor: toastStyleMap[toast.level].bg,
            borderColor: toastStyleMap[toast.level].border,
            color: toastStyleMap[toast.level].text
          }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
            {toastStyleMap[toast.level].icon}
          </span>
          {toast.message}
        </div>
      )}

      {/* ── 顶部信息挂画：回合 & 阶段 ─────────────────────────────────── */}
      <div className="absolute left-[clamp(14rem,36vw,46rem)] top-4 z-50 flex max-w-[460px] flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-sm border border-[#c9b189]/50 bg-[#f7edde]/90 px-3 py-1 font-serif text-base font-bold text-[#5b4530] shadow-sm backdrop-blur-sm">
            第 {round} 回合
          </div>
          <div className={`rounded-sm border px-3 py-1 shadow-sm backdrop-blur-sm font-serif text-base font-bold ${timeWarningActive ? 'border-[#b94f3c]/50 bg-[#b94f3c]/10 text-[#b94f3c]' : 'border-[#c9b189]/50 bg-[#f7edde]/90 text-[#6b553d]'}`}>
            {phaseLabel} · {timerText}
          </div>
        </div>
        {state.activeTopic && (
          <div className="rounded-sm border border-[#c9b189]/45 bg-[#f7edde]/90 px-3 py-1.5 text-[13px] leading-relaxed text-[#5f4a35] shadow-sm backdrop-blur-sm font-serif">
            <span className="mr-2 text-[11px] uppercase tracking-[0.2em] text-[#7a6450]/80">议题</span>
            <span className="font-semibold">{state.activeTopic}</span>
          </div>
        )}
      </div>

      {/* ── 敌方状态球 (Top Right) ──────────────────────────────────── */}
      <div className="absolute right-12 top-10 z-50 flex flex-col items-center">
        <div className="relative h-36 w-36 rounded-full border-4 border-[#8f5454]/60 bg-[#1e1912]/95 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center backdrop-blur-xl group overflow-hidden">
          {/* 装饰性光晕 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
          
          <div className="relative z-10 -mt-2 rounded-full bg-[#8f5454] px-4 py-1 text-[11px] font-black text-white tracking-[0.3em] uppercase shadow-lg">
            对手
          </div>
          <div className="relative z-10 mt-1 text-5xl font-black text-[#ffc0c0] drop-shadow-[0_0_15px_rgba(255,192,192,0.6)] font-serif">
            {state.enemy.resources.xinZheng}
          </div>
          <div className="relative z-10 text-[12px] text-[#8f5454] font-black tracking-[0.4em] uppercase opacity-60">心证</div>
          
          {/* 敌方辅助量条 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-black/40 overflow-hidden">
             <div className="h-full bg-[#b57878] shadow-[0_0_8px_rgba(181,120,120,0.8)]" style={{ width: `${enemyXinPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── 我方状态球 (Bottom Right Focal Point) ───────────────────── */}
          <div className="absolute right-12 bottom-12 z-50">
        <div className="relative h-48 w-48 rounded-full border-[6px] border-[#cfa666]/70 bg-[#120f0a]/98 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_rgba(207,166,102,0.2)] flex flex-col items-center justify-center backdrop-blur-2xl">
           <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,178,82,0.08)_0%,transparent_60%)]" />
           
           <div className="relative z-10 -mt-2 rounded-full bg-[#cfa666] px-6 py-1.5 text-sm font-black text-[#1e1912] tracking-[0.4em] uppercase shadow-2xl">
             我方
           </div>
           
           {/* 核心心证 */}
           <div className="relative z-10 mt-1 text-6xl font-black text-[#ffe3af] drop-shadow-[0_0_20px_rgba(207,166,102,0.8)] font-serif">
             {state.player.resources.xinZheng}
           </div>
           <div className="relative z-10 text-[14px] text-[#cfa666] font-black tracking-[0.5em] uppercase opacity-80">心证之印</div>

           {/* 灵势与护印 - 环绕分布 */}
           <div className="absolute -left-10 bottom-12 flex flex-col items-end gap-2.5 pr-3">
              <div className="flex items-center gap-2.5 rounded-2xl bg-black/60 border border-[#3d7a84]/50 px-4 py-2 backdrop-blur-xl shadow-xl transition-transform hover:scale-110">
                <span className="text-xs text-[#3d7a84] font-black tracking-widest uppercase">灵势</span>
                <span className="text-lg font-black text-white">{state.player.resources.lingShi}/{state.player.resources.maxLingShi}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-black/60 border border-[#b88743]/50 px-4 py-2 backdrop-blur-xl shadow-xl transition-transform hover:scale-110">
                <span className="text-xs text-[#b88743] font-black tracking-widest uppercase">护印</span>
                <span className="text-lg font-black text-white">{state.player.resources.huYin}</span>
              </div>
           </div>
           
           {/* 装饰性外环 */}
           <div className="absolute inset-[-15px] rounded-full border border-[#cfa666]/10 animate-[spin_20s_linear_infinite]" />
           <div className="absolute inset-[-15px] rounded-full border-t-2 border-[#cfa666]/30 animate-[spin_12s_linear_infinite]" />
        </div>
      </div>

      {/* ── 运行时错误通知 ────────────────────────────────────────── */}
      {runtimeError && (
        <div className="absolute left-1/2 bottom-32 z-50 -translate-x-1/2 flex items-center justify-between rounded-lg border border-[#d87373]/50 bg-[#fce8e8]/90 p-3 text-xs text-[#8e2f2f] shadow-lg backdrop-blur-sm">
          <span className="truncate">{runtimeError}</span>
          <button type="button" className="ml-4 text-xs underline" onClick={() => setRuntimeError(null)}>关闭轴</button>
        </div>
      )}
      {/* ── 核心内容区 ────────────────────────────────────────────────── */}
      <main className="relative z-10 h-full w-full">
        {/* ══════════════════════════════════════════════════════════════════
            布局阶段 (布置卡牌)
            ══════════════════════════════════════════════════════════════════ */}
        {isLayoutPhase && (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            
            {/* 中间/右侧：战场 (明牌区) */}
            <div className="absolute right-0 top-1/2 -translate-y-[62%] w-[68%] h-[48%] px-12">
              <div className="mb-8 pr-40">
                <div className="font-serif text-2xl font-black tracking-[0.8em] text-[#5b4530]/40 uppercase select-none">
                  明牌布局 · 辩经演武
                </div>
                {isAnMou && (
                  <div className="mt-3 inline-flex rounded-full border border-[#f0c97a]/40 bg-[#1e1810]/90 px-5 py-2 text-[13px] text-[#f0c97a] backdrop-blur-md">
                    暗策阶段：明牌区已锁定，仅可布置暗策
                  </div>
                )}
              </div>
              
              <div className="relative flex h-full gap-8">
                {seatPickingAction && (
                  <div className="absolute inset-x-0 -top-16 z-20 text-center animate-bounce">
                    <span className="rounded-full bg-[#8b4513] px-6 py-2 text-base font-bold text-[#fef3c7] shadow-xl font-serif">
                      「 请于此处选取路位入势 」
                    </span>
                  </div>
                )}
                {SEATS.map((seat) => (
                  <MiniLanePreview
                    key={seat}
                    seat={seat}
                    enemyLane={state.enemy.seats[seat]}
                    playerLane={state.player.seats[seat]}
                    isSelectable={Boolean(seatPickingAction)}
                    isTarget={activeTargetSeat === seat}
                    plannedPlayerCard={seatPickingAction === 'main' && state.player.plan.mainTargetSeat === seat ? plannedMainCard : seatPickingAction === 'secret' && state.player.plan.secretTargetSeat === seat ? plannedSecretCard : null}
                    onSelect={handleSeatSelect}
                    onDropCard={(droppedSeat, cardId) => {
                      if (!handCardMap.has(cardId)) {
                        showToast('拖拽无效：卡牌已不在其位', 'warning');
                        return;
                      }
                      if (phase === 'ming_bian' && !state.player.plan.lockedPublic) {
                        setTargetSeatSafe('main', droppedSeat);
                        planCardSafe('main', cardId, `主论拟定于${SEAT_ALIAS[droppedSeat]}`);
                        return;
                      }
                      if (phase === 'an_mou' && !state.player.plan.lockedSecret) {
                        setTargetSeatSafe('secret', droppedSeat);
                        planCardSafe('secret', cardId, `暗策伏兵于${SEAT_ALIAS[droppedSeat]}`);
                        return;
                      }
                      showToast('步序限制：当前阶段不可变动路位', 'warning');
                    }}
                  />
                ))}
              </div>
            </div>


          {/* ── 动作状态条 (Action Slots) ── */}
          <div className="absolute right-[clamp(10rem,18vw,22rem)] bottom-16 z-[65] flex flex-row-reverse items-center gap-6 group">
             <div className="flex items-center gap-4 rounded-3xl bg-black/30 border border-white/10 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <ActionDropZone
                  action="main"
                  filledCard={plannedMainCard}
                  locked={!canPlanPublic}
                  canAct={actionOptions.includes('main')}
                  isActive={selectedAction === 'main'}
                  onAct={() => handleActionPick('main')}
                  onClear={canPlanPublic ? () => planCardSafe('main', null) : undefined}
                  onDrop={(cardId) => applyCardToAction('main', cardId)}
                />
                <ActionDropZone
                  action="response"
                  filledCard={plannedResponseCard}
                  locked={!canPlanPublic}
                  canAct={actionOptions.includes('response')}
                  isActive={selectedAction === 'response'}
                  onAct={() => handleActionPick('response')}
                  onClear={canPlanPublic ? () => planCardSafe('response', null) : undefined}
                  onDrop={(cardId) => applyCardToAction('response', cardId)}
                />
                <ActionDropZone
                  action="secret"
                  filledCard={plannedSecretCard}
                  locked={!canPlanSecret}
                  canAct={actionOptions.includes('secret')}
                  isActive={selectedAction === 'secret'}
                  onAct={() => handleActionPick('secret')}
                  onClear={canPlanSecret ? () => planCardSafe('secret', null) : undefined}
                  onDrop={(cardId) => applyCardToAction('secret', cardId)}
                />
                <ActionDropZone
                  action="writing"
                  filledCard={plannedWritingCard}
                  locked={!canPlanPublic}
                  canAct={actionOptions.includes('writing')}
                  isActive={false}
                  onAct={() => handleActionPick('writing')}
                  onClear={canPlanPublic ? () => planWritingSafe(null) : undefined}
                  onDrop={(cardId) => applyCardToAction('writing', cardId)}
                />
             </div>
             
             {/* 核心确认按钮 */}
             <button
                type="button"
                disabled={confirmBtn.disabled}
                onClick={confirmBtn.onClick}
                className="relative overflow-hidden rounded-3xl px-10 py-6 text-xl font-serif font-black tracking-[0.35em] transition-all duration-700 active:scale-95 group/btn"
                style={{
                  background: confirmBtn.disabled
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                    : 'linear-gradient(135deg, #5a2d0a 0%, #8b4513 50%, #5a2d0a 100%)',
                  border: `3px solid ${confirmBtn.disabled ? 'rgba(255,255,255,0.05)' : '#d4a520'}`,
                  color: confirmBtn.disabled ? 'rgba(255,255,255,0.2)' : '#fef3c7',
                  boxShadow: confirmBtn.disabled ? 'none' : '0 15px 45px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.2)',
                }}
              >
                {!confirmBtn.disabled && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.15)_0%,transparent_100%)] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                )}
                <span className="relative z-10">{confirmBtn.label}</span>
             </button>
          </div>

            {/* 左侧：卡牌介绍面板 (The Jade Slip / Scroll) */}
            <div className="absolute left-8 top-[12%] bottom-[26%] z-30 w-[350px] max-w-[30vw]">
              {selectedCard ? (
                <div 
                  className="relative flex h-full flex-col overflow-hidden rounded-2xl border-x-4 border-[#c5ad88] bg-[#fdfaf5] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-md animate-in fade-in slide-in-from-left-8 duration-500"
                  style={{ 
                    backgroundImage: 'linear-gradient(90deg, #e8dbc5 0%, #fdfaf5 15%, #fdfaf5 85%, #e8dbc5 100%)',
                    transform: 'perspective(1000px) rotateY(2deg)'
                  }}
                >
                  {/* 书卷卷轴效果 */}
                  <div className="absolute -left-1 top-0 bottom-0 w-2 bg-gradient-to-r from-[#9a7b4f] to-transparent opacity-40" />
                  <div className="absolute -right-1 top-0 bottom-0 w-2 bg-gradient-to-l from-[#9a7b4f] to-transparent opacity-40" />

                  <div className="relative mb-5 h-44 flex-shrink-0 overflow-hidden rounded-xl border-2 border-[#c5ad88]/40 shadow-2xl">
                    <img src={artSrc(selectedCard)} alt={selectedCard.name} className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f0c97a] bg-[#1e1912]/90 text-sm font-black text-[#f0c97a] shadow-lg">
                      {selectedCard.cost}
                    </div>
                  </div>
                  
                  <div className="mb-2 text-2xl font-black tracking-[0.2em] text-[#3d2b1f] font-serif border-b-2 border-[#3d2b1f]/10 pb-2">{selectedCard.name}</div>
                  
                  <div className="mb-3 inline-flex self-start rounded bg-[#8b4513]/10 px-3 py-1 text-[11px] font-bold text-[#8b4513] tracking-wider uppercase">
                    {selectedCard.type}
                  </div>

                  <div className="mb-6 flex-1 text-[14px] leading-[1.8] text-[#5b4530] font-medium italic opacity-95">
                    「 {selectedCard.description ?? effectShort(selectedCard)} 」
                  </div>

                  {actionOptions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                       <div className="text-[10px] text-[#8b775f] font-bold tracking-[0.3em] uppercase opacity-60">选择落位策略</div>
                       <div className="grid grid-cols-2 gap-3">
                          {actionOptions.map((action) => {
                            const isSelected = selectedAction === action;
                            return (
                              <button
                                key={action}
                                onClick={() => handleActionPick(action)}
                                className={`group relative overflow-hidden rounded-xl py-3 text-center text-sm font-black transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-[#3d2b1f] text-[#fef3c7] shadow-xl scale-[1.05] z-10' 
                                    : 'bg-[#ede1cc] text-[#5b4530] hover:bg-[#dcd0b8] hover:shadow-md'
                                }`}
                                style={{ border: isSelected ? '2px solid #d4a520' : '1px solid #c9b189' }}
                              >
                                {isSelected && (
                                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[#d4a520] animate-pulse" />
                                )}
                                {ACTION_LABEL[action]}
                              </button>
                            );
                          })}
                       </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-[#c5ad88]/30 bg-[#f7edde]/50 py-4 text-center text-sm text-[#9a886a] font-serif">
                      此处局势暂无可乘之机
                    </div>
                  )}
                </div>
              ) : (
                 <div className="group flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c5ad88]/20 bg-[#f7edde]/20 p-10 text-center backdrop-blur-[4px] transition-all duration-500 hover:bg-[#f7edde]/30 hover:border-[#c5ad88]/40">
                   <div className="mb-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🎴</div>
                   <div className="text-base text-[#9a886a] font-serif tracking-[0.2em] italic">
                     请拣选一张案中策，<br/>以定乾坤。
                   </div>
                 </div>
              )}
            </div>

            {/* 左下角：扇形手牌 (Fan Hand) - 它是玩家互动的核心，位置需极度舒适 */}
            <div className="absolute bottom-[22px] left-[64px] z-50 flex h-[36%] w-[60%] items-end justify-start pointer-events-none">
               <div className="pointer-events-auto transform scale-[1.02] origin-bottom-left transition-transform duration-500">
                  <FanHand
                    cards={sortedHand}
                    selectedCardId={selectedCardId}
                    onSelect={handleCardSelect}
                  />
               </div>
            </div>
          </div>
        )}

      {/* ══════════════════════════════════════════════════════════════════
          结算阶段视图
          ══════════════════════════════════════════════════════════════════ */}
      {isSettlementPhase && (
        <div className="flex flex-1 flex-col overflow-hidden" style={{ background: '#1e1912' }}>

          {/* 三路完整战场 — 绝对主角 */}
          <div className="flex flex-1 gap-3 overflow-hidden px-3 py-3">
            {SEATS.map((seat, idx) => (
              <SettlementLane
                key={seat}
                seat={seat}
                enemyLane={state.enemy.seats[seat]}
                playerLane={state.player.seats[seat]}
                laneCards={laneCardsMap[seat]}
                isActive={activeLaneIdx === idx && phase === 'resolve'}
                isDimmed={activeLaneIdx !== null && activeLaneIdx !== idx && phase === 'resolve'}
                isRevealed={isRevealed}
                animation={settlementAnimation?.laneIdx === idx ? settlementAnimation : undefined}
                side={settlementAnimation?.laneIdx === idx ? settlementAnimationSide : undefined}
              />
            ))}
          </div>

          {/* 结算播报栏 */}
          <div className="flex flex-shrink-0 items-center gap-3 border-t border-white/10 px-4 py-2.5">
            <span className="flex-shrink-0 rounded bg-[#b4823f]/30 px-2 py-0.5 text-xs text-[#f0c97a]">
              {phase === 'reveal' ? '揭示' : '结算'}
            </span>
            {phase === 'resolve' && activeLaneIdx !== null && (
              <div className="flex gap-1.5">
                {SEATS.map((s, i) => (
                  <span
                    key={s}
                    className={`rounded px-2 py-0.5 text-xs transition-all duration-300 ${
                      i === activeLaneIdx ? 'bg-[#b4823f] text-white' : 'text-[#f0c97a]/30'
                    }`}
                  >
                    {SEAT_ALIAS[s]}
                  </span>
                ))}
              </div>
            )}
            <span className="flex-1 truncate text-sm text-[#e8d5b0]">
              {state.resolveFeed[0] ?? (phase === 'reveal' ? '双方出牌正在翻开…' : '等待结算…')}
            </span>
          </div>

          {/* 手牌最小化条 */}
          <div className="flex flex-shrink-0 items-center gap-2 border-t border-white/10 px-4 py-2">
            <span className="text-xs text-white/40">手牌 {state.player.hand.length} 张</span>
            <div className="flex gap-1">
              {state.player.hand.map((c) => (
                <div
                  key={c.id}
                  className="rounded"
                  style={{ width: 18, height: 27, background: 'rgba(197,173,136,0.25)', border: '1px solid rgba(197,173,136,0.3)' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* finished 状态：背景占位（结束弹窗由下方 isFinished overlay 覆盖） */}
      {isFinished && (
        <div className="flex flex-1 items-center justify-center" style={{ background: '#1e1912' }} />
      )}

      {/* CardActionPopup removed: actions are now in the inline left panel */}

      {/* ── 对局结束 ─────────────────────────────────────────────────── */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(18,16,10,0.76)' }}>
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#8f7752] shadow-[0_22px_70px_rgba(0,0,0,0.55)]" style={{ background: 'linear-gradient(180deg,#1b2430,#151b24)' }}>
            <div className="border-b border-[#8f7752]/45 px-6 py-5">
              <div className="text-center text-xs tracking-[0.2em] text-[#b9cad8]/80">第 {state.round} / {state.maxRounds} 回合结束</div>
              <div className={`mt-2 text-center text-2xl font-semibold ${finalTitleClass}`}>{finalTitle}</div>
              <div className="mt-1 text-center text-sm text-[#b9cad8]">{finalSubtitle}</div>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#7f8b97]/35 bg-[#111821]/65 p-3">
                  <div className="text-xs text-[#9fb2c6]">我方</div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-sm text-[#dce8f4]">心证</span>
                    <span className="text-xl font-semibold text-[#ffe3af]">{finalPlayerXin}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#2f3947]">
                    <div className="h-2 rounded-full bg-[#d4b97a]" style={{ width: `${finalPlayerPct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-[#a8bbc9]">
                    <span>护印 {state.player.resources.huYin}</span>
                    <span>文脉 {state.player.resources.wenMai}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#7f8b97]/35 bg-[#111821]/65 p-3">
                  <div className="text-xs text-[#9fb2c6]">对手</div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-sm text-[#dce8f4]">心证</span>
                    <span className="text-xl font-semibold text-[#ffd3d3]">{finalEnemyXin}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#2f3947]">
                    <div className="h-2 rounded-full bg-[#b57878]" style={{ width: `${finalEnemyPct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-[#a8bbc9]">
                    <span>护印 {state.enemy.resources.huYin}</span>
                    <span>文脉 {state.enemy.resources.wenMai}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#8f7752]/35 bg-[#111821]/55 px-3 py-2 text-xs text-[#a8bbc9]">
                对局结论：我方 {finalPlayerXin} vs 对手 {finalEnemyXin}
              </div>
            </div>

            <div className="flex gap-3 border-t border-[#8f7752]/45 px-4 py-4">
              {onReselectArena && (
                <button
                  type="button"
                  className="flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #5a2d0a 0%, #8b4513 25%, #a0522d 50%, #8b4513 75%, #5a2d0a 100%)',
                    border: '2px solid rgba(212, 165, 32, 0.8)',
                    color: '#fef3c7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                    backgroundImage: 'radial-gradient(ellipse 8px 4px at 10% 50%, rgba(212, 165, 32, 0.15) 0%, transparent 100%), radial-gradient(ellipse 8px 4px at 90% 50%, rgba(212, 165, 32, 0.15) 0%, transparent 100%)',
                  }}
                  onClick={onReselectArena}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6b380c 0%, #a0522d 25%, #b8652e 50%, #a0522d 75%, #6b380c 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 165, 32, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #5a2d0a 0%, #8b4513 25%, #a0522d 50%, #8b4513 75%, #5a2d0a 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
                  }}
                >
                  再来一局
                </button>
              )}
              {onMenu && (
                <button
                  type="button"
                  className="flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #4a1a1a 0%, #6b2a2a 25%, #7a3535 50%, #6b2a2a 75%, #4a1a1a 100%)',
                    border: '2px solid rgba(180, 80, 80, 0.7)',
                    color: '#f5c5c5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                    backgroundImage: 'radial-gradient(ellipse 8px 4px at 10% 50%, rgba(180, 80, 80, 0.12) 0%, transparent 100%), radial-gradient(ellipse 8px 4px at 90% 50%, rgba(180, 80, 80, 0.12) 0%, transparent 100%)',
                  }}
                  onClick={onMenu}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #5a2a2a 0%, #7b3a3a 25%, #8a4545 50%, #7b3a3a 75%, #5a2a2a 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(180, 80, 80, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #4a1a1a 0%, #6b2a2a 25%, #7a3535 50%, #6b2a2a 75%, #4a1a1a 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)';
                  }}
                >
                  返回菜单
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
