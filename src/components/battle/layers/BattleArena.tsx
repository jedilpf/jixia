/**
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
  xian_sheng: { name: '先声席', color: '#3A5F41', icon: '声' },
  zhu_bian: { name: '主辩席', color: '#D4AF65', icon: '辩' },
  yu_lun: { name: '余论席', color: '#8D2F2F', icon: '论' },
};

const UnitPip: React.FC<{
  unit: { name: string; power: number; hp: number; maxHp: number } | null;
  isEnemy: boolean;
}> = ({ unit, isEnemy }) => {
  if (!unit) {
    return (
      <div
        className="w-12 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] bg-white/40 border-[#B8A48D]/20 text-[#5C4033]/30"
      >
        待论
      </div>
    );
  }

  const hpPct = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100));
  const isLowHp = hpPct <= 30;

  return (
    <div
      className={`w-12 h-16 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 shadow-sm ${
        isEnemy
          ? 'border-[#8D2F2F]/50 bg-white'
          : 'border-[#3A5F41]/50 bg-white'
      } ${isLowHp ? 'animate-pulse' : ''}`}
      title={`${unit.name} 辩锋${unit.power} 根基${unit.hp}/${unit.maxHp}`}
    >
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-700"
        style={{
          height: `${hpPct}%`,
          background: isLowHp 
            ? (isEnemy ? '#8D2F2F' : '#D4AF65') 
            : (isEnemy ? '#F5E6E6' : '#EBF5EE'),
          opacity: isLowHp ? 0.3 : 1
        }}
      />
      
      <div className={`relative z-10 text-lg font-black italic ${isEnemy ? 'text-[#8D2F2F]' : 'text-[#3A5F41]'}`}>
        {unit.power}
      </div>
      <div className="relative z-10 text-[9px] font-bold text-[#1A1A1A]/60 -mt-1 uppercase tracking-tighter">
        {unit.name.slice(0, 2)}
      </div>

      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/10" />
    </div>
  );
};

const CardSlot: React.FC<{
  card: DebateCard | null;
  isRevealed: boolean;
  label: string;
  isEnemy?: boolean;
}> = ({ card, isRevealed, label, isEnemy }) => {
  if (!card) {
    return (
      <div className="w-[80px] h-[110px] rounded-2xl border-2 border-dashed border-[#B8A48D]/30 flex flex-col items-center justify-center gap-2 bg-white/20">
        <div className="w-6 h-6 rounded-full bg-[#B8A48D]/10 flex items-center justify-center text-[#B8A48D]">
          <span className="text-xs">+</span>
        </div>
        <span className="text-[9px] font-black text-[#B8A48D] uppercase tracking-widest">{label}</span>
      </div>
    );
  }

  if (!isRevealed) {
    return (
      <div className="w-[80px] h-[110px] rounded-2xl border-2 border-[#1A1A1A]/60 bg-[#1A1A1A] flex flex-col items-center justify-center gap-3 shadow-2xl transform hover:scale-105 transition-transform">
        <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
          <span className="text-white font-black italic">?</span>
        </div>
        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Secret</span>
      </div>
    );
  }

  return (
    <div
      className={`w-[80px] h-[110px] rounded-2xl border-2 overflow-hidden relative shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        isEnemy ? 'border-[#8D2F2F]/60' : 'border-[#3A5F41]/60'
      } bg-white group`}
    >
      <img
        src={card.art || ''}
        alt={card.name}
        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent" />
      
      <div className="absolute top-1.5 left-1.5 z-30 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-[#1A1A1A]/10">
        <span className="text-[10px] font-black text-[#1A1A1A]">{card.cost}</span>
      </div>
      
      <div className="absolute bottom-1.5 left-0 right-0 z-30 px-2">
        <span className="text-[9px] font-black text-white truncate block text-center uppercase tracking-tighter">
          {card.name}
        </span>
      </div>
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
      className={`flex-1 max-w-56 h-[340px] flex flex-col items-center justify-between p-4 rounded-[2rem] border-2 transition-all duration-500 relative ${
        isTarget
          ? 'border-[#3A5F41] bg-[#EBF5EE]/80 shadow-[0_35px_50px_rgba(58,95,65,0.15)] scale-[1.04]'
          : isSelectable
          ? 'border-[#B8A48D]/20 bg-white/40 hover:border-[#D4AF65]/60 hover:bg-white hover:shadow-xl cursor-pointer hover:-translate-y-1'
          : 'border-transparent bg-transparent opacity-60'
      }`}
    >
      {/* 席位铭牌 */}
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner"
          style={{ backgroundColor: config.color, color: 'white' }}
        >
          {config.icon}
        </div>
        <span className="mt-2 text-[10px] font-black text-[#5C4033]/60 uppercase tracking-[0.2em]">{config.name}</span>
      </div>

      <div className="flex flex-col gap-6 w-full items-center">
        {/* 对手侧才思珠 */}
        <div className="flex gap-2">
          <UnitPip unit={enemySeat.back} isEnemy />
          <UnitPip unit={enemySeat.front} isEnemy />
        </div>

        {/* 楚河汉界 */}
        <div className="w-full flex items-center gap-2">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-[#B8A48D]/20" />
          <div className="w-2 h-2 rotate-45 border border-[#B8A48D]/40" />
          <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-[#B8A48D]/20" />
        </div>

        {/* 我方侧才思珠 */}
        <div className="flex gap-2">
          <UnitPip unit={playerSeat.front} isEnemy={false} />
          <UnitPip unit={playerSeat.back} isEnemy={false} />
        </div>
      </div>

      {isTarget && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-white bg-[#3A5F41] shadow-lg animate-bounce" />
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
    <div className="flex-1 flex flex-col min-h-0 relative bg-[#FDFBF7]">
      {/* 矿物辉光背景 */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full bg-[#3A5F41]/10 blur-[100px] -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-[#8D2F2F]/10 blur-[100px] translate-x-1/2" />
      </div>

      {/* 敌方名士区：悬浮丝帛感 */}
      <div className="h-32 flex items-center justify-center gap-12 px-8 relative z-10 mt-4">
        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white border-2 border-[#8D2F2F]/20 shadow-lg">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[#F5E6E6] border-2 border-[#8D2F2F]/30 flex items-center justify-center overflow-hidden">
               <span className="text-2xl">👺</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-[#1A1A1A] leading-tight">{enemy.name}</span>
            <span className="text-[9px] font-black text-[#8D2F2F] uppercase tracking-widest mt-1 opacity-60">Adversary</span>
          </div>
        </div>

        <div className="flex gap-4">
          <CardSlot card={getPlannedCard('enemy', 'main')} isRevealed={isRevealed} label="主议" isEnemy />
          <CardSlot card={getPlannedCard('enemy', 'secret')} isRevealed={isRevealed} label="旁议" isEnemy />
        </div>
      </div>

      {/* 中央对讲坛 */}
      <div className="flex-1 flex items-center justify-center px-10 gap-6 relative z-10">
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

      {/* 我方名士区：清冷金石感 */}
      <div className="h-32 flex items-center justify-center gap-12 px-8 relative z-10 mb-8">
        <div className="flex gap-4">
          <CardSlot card={getPlannedCard('player', 'main')} isRevealed={true} label="主议" />
          <CardSlot card={getPlannedCard('player', 'secret')} isRevealed={phase !== 'an_mou'} label="旁议" />
        </div>

        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-[#1A1A1A] border-2 border-white shadow-2xl">
          <div className="flex flex-col items-end">
            <span className="text-lg font-black text-white leading-tight">{player.name}</span>
            <span className="text-[9px] font-black text-[#3A5F41] uppercase tracking-widest mt-1">Learner</span>
          </div>
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#3A5F41] flex items-center justify-center overflow-hidden">
               <span className="text-2xl">🎒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
