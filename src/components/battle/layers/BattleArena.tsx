﻿﻿﻿/**
 * 中央主战斗区组件
 * 显示：对手区域、战斗核心轨道、我方区域
 */

import React from 'react';
import { DebateBattleState, DebateCard, SeatId, SeatState } from '@/battleV2/types';

interface BattleArenaProps {
  state: DebateBattleState;
  onSelectSeat: (seat: SeatId) => void;
}

const SEAT_CONFIG: Record<SeatId, { name: string; color: string; icon: string }> = {
  xian_sheng: { name: '先声席', color: '#7ab8c9', icon: '声' },
  zhu_bian: { name: '主辩席', color: '#c9952a', icon: '辩' },
  yu_lun: { name: '余论席', color: '#9C88A8', icon: '论' },
};

const CARD_FRAME_ASSETS: Record<string, string> = {
  '立论': 'assets/frames/frame-lilun.png',
  '策术': 'assets/frames/frame-ceshu.png',
  '反诘': 'assets/frames/frame-fanje.png',
  '门客': 'assets/frames/frame-menke.png',
  '玄章': 'assets/frames/frame-xuanzhang.png',
};

const UnitPip: React.FC<{
  unit: { name: string; power: number; hp: number; maxHp: number } | null;
  isEnemy: boolean;
}> = ({ unit, isEnemy }) => {
  if (!unit) {
    return (
      <div
        className={`w-11 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] backdrop-blur-sm ${
          isEnemy
            ? 'border-[#c69a7d]/30 bg-[#4a2e22]/20'
            : 'border-[#bfa884]/30 bg-[#2b3542]/20'
        } text-[#5c4d3a]`}
      >
        空
      </div>
    );
  }

  const hpPct = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100));
  const isLowHp = hpPct <= 30;

  return (
    <div
      className={`w-11 h-14 rounded-lg border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
        isEnemy
          ? 'border-[#c69a7d]/70 bg-gradient-to-b from-[#4a2e22] to-[#3a1e12]'
          : 'border-[#bfa884]/70 bg-gradient-to-b from-[#2b3542] to-[#1b2532]'
      }`}
      title={`${unit.name} 辩锋${unit.power} 根基${unit.hp}/${unit.maxHp}`}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
          isLowHp ? 'animate-pulse' : ''
        }`}
        style={{
          height: `${hpPct}%`,
          background: isEnemy
            ? 'linear-gradient(to top, rgba(198,140,114,0.4), transparent)'
            : 'linear-gradient(to top, rgba(159,127,85,0.4), transparent)',
        }}
      />
      <span className="relative z-10 text-sm font-bold text-white drop-shadow-lg">{unit.power}</span>
      <span className="relative z-10 text-[9px] text-white/90 truncate w-full text-center px-0.5 font-medium">
        {unit.name.slice(0, 2)}
      </span>
      <div className="absolute bottom-0.5 left-0.5 right-0.5 h-1 rounded-full bg-black/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isLowHp ? 'bg-red-500' : isEnemy ? 'bg-[#c68c72]' : 'bg-[#9f7f55]'
          }`}
          style={{ width: `${hpPct}%` }}
        />
      </div>
    </div>
  );
};

const CardSlot: React.FC<{
  card: DebateCard | null;
  isRevealed: boolean;
  label: string;
  isEnemy?: boolean;
}> = ({ card, isRevealed, label, isEnemy }) => {
  const frameAsset = card ? (CARD_FRAME_ASSETS[card.type] || CARD_FRAME_ASSETS['立论']) : null;

  if (!card) {
    return (
      <div className="w-[72px] h-[96px] rounded-xl border-2 border-dashed border-[#5c4d3a]/40 flex flex-col items-center justify-center gap-1 bg-[#1a1510]/30 backdrop-blur-sm">
        <div className="w-6 h-6 rounded-full border border-[#5c4d3a]/40 flex items-center justify-center">
          <span className="text-xs text-[#5c4d3a]">+</span>
        </div>
        <span className="text-[10px] text-[#5c4d3a]">{label}</span>
      </div>
    );
  }

  if (!isRevealed) {
    return (
      <div className="w-[72px] h-[96px] rounded-xl border-2 border-[#5c4d3a]/60 bg-gradient-to-br from-[#2a2318] via-[#1f1a12] to-[#151210] flex flex-col items-center justify-center gap-2 shadow-lg">
        <div className="w-10 h-10 rounded-lg bg-[#3d3225]/50 border border-[#5c4d3a]/40 flex items-center justify-center">
          <span className="text-lg text-[#8a7a6a]">?</span>
        </div>
        <span className="text-[10px] text-[#5c4d3a]">暗策</span>
      </div>
    );
  }

  return (
    <div
      className={`w-[72px] h-[96px] rounded-xl border-2 overflow-hidden relative shadow-lg transition-transform hover:scale-105 ${
        isEnemy ? 'border-[#c69a7d]/80' : 'border-[#bfa884]/80'
      }`}
    >
      {card.art ? (
        <img
          src={card.art}
          alt={card.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className={`w-full h-full ${
          isEnemy
            ? 'bg-gradient-to-br from-[#4a2e22] to-[#3a1e12]'
            : 'bg-gradient-to-br from-[#2b3542] to-[#1b2532]'
        }`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      {frameAsset ? (
        <img
          src={frameAsset}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 h-full w-full object-fill opacity-95"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      <div className="absolute top-1 left-1 z-30 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center border border-white/10">
        <span className="text-xs text-[#f0c97a] font-bold">{card.cost}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-30 p-1.5">
        <span className="text-[10px] text-white font-medium truncate block text-center drop-shadow-lg">
          {card.name}
        </span>
      </div>
      {card.power !== undefined && card.hp !== undefined && (
        <div className="absolute bottom-5 right-1 z-30 flex gap-0.5">
          <div className="w-4 h-4 rounded bg-[#c9952a]/90 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{card.power}</span>
          </div>
          <div className="w-4 h-4 rounded bg-[#5a8a5a]/90 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{card.hp}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const SeatArea: React.FC<{
  seatId: SeatId;
  playerSeat: SeatState;
  enemySeat: SeatState;
  isSelectable: boolean;
  isTarget: boolean;
  onSelect: (seat: SeatId) => void;
}> = ({ seatId, playerSeat, enemySeat, isSelectable, isTarget, onSelect }) => {
  const config = SEAT_CONFIG[seatId];

  return (
    <div
      onClick={() => isSelectable && onSelect(seatId)}
      className={`flex-1 max-w-48 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
        isTarget
          ? 'border-[#c9952a] bg-[#c9952a]/10 shadow-[0_0_20px_rgba(201,149,42,0.3)] scale-105'
          : isSelectable
          ? 'border-[#5c4d3a]/50 bg-[#1f1a12]/30 hover:border-[#7a6a5a]/70 hover:bg-[#2a2318]/50 cursor-pointer hover:scale-[1.02]'
          : 'border-[#3d3225]/30 bg-[#0d0b08]/20'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
          style={{ backgroundColor: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40` }}
        >
          {config.icon}
        </div>
        <span className="text-xs font-medium text-[#c9b896]">{config.name}</span>
      </div>

      <div className="flex gap-1">
        <UnitPip unit={enemySeat.back} isEnemy />
        <UnitPip unit={enemySeat.front} isEnemy />
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#5c4d3a]/50 to-transparent my-0.5" />

      <div className="flex gap-1">
        <UnitPip unit={playerSeat.front} isEnemy={false} />
        <UnitPip unit={playerSeat.back} isEnemy={false} />
      </div>

      {isTarget && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#c9952a] animate-ping" />
      )}
    </div>
  );
};

export const BattleArena: React.FC<BattleArenaProps> = ({
  state,
  onSelectSeat,
}) => {
  const { player, enemy, phase } = state;
  const isRevealed = phase === 'reveal' || phase === 'resolve' || phase === 'finished';

  const getPlannedCard = (side: 'player' | 'enemy', slot: 'main' | 'secret'): DebateCard | null => {
    const p = side === 'player' ? player : enemy;
    const cardId = slot === 'main' ? p.plan.mainCardId : p.plan.secretCardId;
    if (!cardId) return null;
    return p.hand.find(c => c.id === cardId) || null;
  };

  const seats: SeatId[] = ['xian_sheng', 'zhu_bian', 'yu_lun'];

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#c9952a] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-[#7ab8c9] blur-3xl" />
      </div>

      <div className="h-24 flex items-center justify-center gap-6 px-6 relative z-10">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#1f1a12]/60 border border-[#3d3225]/30 backdrop-blur-sm">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c9725a] to-[#8a4f4f] border-2 border-[#c69a7d]/70 flex items-center justify-center shadow-lg">
            <span className="text-lg">🎭</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#c9b896]">{enemy.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8a7a6a]">手牌: {enemy.hand.length}</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#c9952a]/30 border border-[#c9952a]/50 flex items-center justify-center">
                  <span className="text-[6px] text-[#c9952a]">势</span>
                </div>
                <span className="text-xs text-[#c9952a] font-medium">{enemy.resources.daShi}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#8a7a6a]">主议</span>
            <CardSlot card={getPlannedCard('enemy', 'main')} isRevealed={isRevealed} label="主议" isEnemy />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#8a7a6a]">旁议</span>
            <CardSlot card={getPlannedCard('enemy', 'secret')} isRevealed={isRevealed} label="旁议" isEnemy />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 gap-4 relative z-10">
        {seats.map((seatId) => (
          <SeatArea
            key={seatId}
            seatId={seatId}
            playerSeat={player.seats[seatId]}
            enemySeat={enemy.seats[seatId]}
            isSelectable={phase === 'ming_bian' || phase === 'an_mou'}
            isTarget={player.plan.mainTargetSeat === seatId || player.plan.secretTargetSeat === seatId}
            onSelect={onSelectSeat}
          />
        ))}
      </div>

      <div className="h-28 flex items-center justify-center gap-6 px-6 relative z-10">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#8a7a6a]">主议</span>
            <CardSlot card={getPlannedCard('player', 'main')} isRevealed={true} label="主议" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#8a7a6a]">旁议</span>
            <CardSlot card={getPlannedCard('player', 'secret')} isRevealed={phase !== 'an_mou'} label="旁议" />
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#1f1a12]/60 border border-[#3d3225]/30 backdrop-blur-sm">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[#c9b896]">{player.name}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#9C88A8]/30 border border-[#9C88A8]/50 flex items-center justify-center">
                  <span className="text-[6px] text-[#9C88A8]">证</span>
                </div>
                <span className="text-xs text-[#9C88A8] font-medium">{player.resources.xinZheng}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#c9952a]/30 border border-[#c9952a]/50 flex items-center justify-center">
                  <span className="text-[6px] text-[#c9952a]">势</span>
                </div>
                <span className="text-xs text-[#c9952a] font-medium">{player.resources.daShi}</span>
              </div>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5a8a5a] to-[#3d5a3d] border-2 border-[#7ab87a]/70 flex items-center justify-center shadow-lg">
            <span className="text-lg">🎓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
