/**
 * 中央主战斗区组件
 * 稷下受业：杏坛对垒 (V9 雅化版)
 */

import React from 'react';
import { DebateBattleState, DebateCard, SeatId, SeatState } from '@/battleV2/types';

interface BattleArenaProps {
  state: DebateBattleState;
  onSelectSeat: (seat: SeatId) => void;
}

const SEAT_CONFIG: Record<SeatId, { name: string; color: string; icon: string; title: string }> = {
  zhu_yi: { name: '主议', color: '#D4AF65', icon: '议', title: 'Grand Debate' },
  pang_yi: { name: '旁议', color: '#831843', icon: '旁', title: 'Side Debate' }, // 使用朱砂色
};

const UnitPip: React.FC<{
  unit: { name: string; power: number; hp: number; maxHp: number } | null;
  isEnemy: boolean;
}> = ({ unit, isEnemy }) => {
  if (!unit) {
    return (
      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#f6e4c3]/20 flex items-center justify-center opacity-30">
        <div className="w-1 h-1 rounded-full bg-[#f6e4c3]" />
      </div>
    );
  }

  const hpPct = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100));
  const isLowHp = hpPct <= 30;

  return (
    <div className="relative group">
       {/* 才思珠：棋子意向 */}
       <div 
         className={`w-14 h-14 rounded-full border-[3px] shadow-2xl flex flex-col items-center justify-center transition-all duration-700 relative overflow-hidden ${
           isEnemy 
             ? 'bg-gradient-to-br from-[#1a0e14] to-[#0a0503] border-[#831843]' // 朱砂色边框
             : 'bg-gradient-to-br from-[#f6e4c3] to-[#e7e1f0] border-[#064e3b]' // 石绿色边框
         } ${isLowHp ? 'animate-pulse scale-90' : 'hover:scale-110'}`}
       >
         {/* 气血盈亏层 */}
         <div 
           className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000"
           style={{ 
             background: isEnemy ? '#831843' : '#064e3b',
             transform: `translateY(${100 - hpPct}%)` 
           }}
         />
         
         <span className={`text-xl font-black italic relative z-10 ${isEnemy ? 'text-[#f6e4c3]' : 'text-[#064e3b]'}`}>
           {unit.power}
         </span>
         <span className={`text-[7px] font-black uppercase tracking-tighter relative z-10 opacity-60 ${isEnemy ? 'text-[#f6e4c3]/60' : 'text-[#0a0503]'}`}>
           {unit.name.slice(0, 2)}
         </span>

         {/* 破甲碎裂：低血量视觉提示 */}
         {isLowHp && (
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/criss-cross-lines.png')] opacity-40 mix-blend-overlay" />
         )}
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
  if (!card) {
    return (
      <div className="w-[100px] h-[140px] rounded-2xl border-2 border-dashed border-[#D4AF65]/30 flex flex-col items-center justify-center gap-3 bg-white/5 backdrop-blur-sm grayscale">
         <div className="text-[10px] font-black text-[#D4AF65]/40 uppercase tracking-[0.4em] rotate-90">{label}</div>
      </div>
    );
  }

  if (!isRevealed) {
    return (
      <div className="w-[100px] h-[140px] rounded-2xl border-4 border-[#0a0503] bg-[#0a0503] shadow-2xl flex flex-col items-center justify-center gap-4 group hover:scale-105 transition-all duration-700">
         <div className="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center transform rotate-45">
            <span className="text-white font-black text-xl -rotate-45 italic">?</span>
         </div>
         <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em]">Pending</span>
      </div>
    );
  }

  return (
    <div className={`w-[100px] h-[140px] rounded-2xl border-4 shadow-2xl overflow-hidden relative group transition-all duration-500 ${isEnemy ? 'border-[#831843]' : 'border-[#064e3b]'}`}>
      <img src={card.art || ''} alt={card.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0503] via-transparent to-transparent opacity-80" />
      <div className="absolute top-2 left-2 w-7 h-7 bg-[#f6e4c3] rounded-md flex items-center justify-center shadow-lg border border-[#0a0503]/10 transform -rotate-12">
        <span className="text-xs font-black text-[#0a0503]">{card.cost}</span>
      </div>
      <div className="absolute bottom-2 inset-x-0 text-center">
        <span className="text-[10px] font-black text-[#f6e4c3] uppercase tracking-tighter truncate px-2 block">{card.name}</span>
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
      className={`flex-1 flex flex-col items-center justify-between h-[420px] transition-all duration-700 relative group cursor-pointer ${
        isTarget ? 'z-20 scale-105' : 'z-10'
      }`}
    >
      {/* 敌方侧落位：墨玉台 */}
      <div className={`w-full flex justify-center py-4 bg-gradient-to-b from-transparent to-[#0a0503]/5 rounded-t-3xl border-t-2 border-[#831843]/30 transition-all ${isTarget ? 'opacity-100' : 'opacity-40'}`}>
         <div className="flex gap-4">
            {enemySeat.units.slice(0, 3).map((unit, i) => (
              <UnitPip key={unit.id || i} unit={unit} isEnemy />
            ))}
         </div>
      </div>

      {/* 席位枢纽：青石铭牌 */}
      <div className="relative w-full flex items-center justify-center p-6">
         <div className={`absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF65]/40 to-transparent ${isTarget ? 'scale-x-110' : 'scale-x-50' } transition-transform duration-1000`} />
         <div 
           className={`relative z-10 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all duration-500 transform ${
             isTarget ? 'bg-[#1e3a5f] text-[#f6e4c3] scale-125 rotate-0' : 'bg-[#f6e4c3] text-[#0a0503] rotate-45 group-hover:rotate-0'
           } border-2 border-[#D4AF65]/20`}
         >
            <span className={`text-2xl font-black ${isTarget ? '' : '-rotate-45 group-hover:rotate-0 transition-transform'}`}>{config.icon}</span>
            <span className={`absolute -bottom-10 text-[8px] font-black uppercase tracking-[0.5em] whitespace-nowrap transition-all ${isTarget ? 'text-[#064e3b] opacity-100' : 'text-transparent opacity-0'}`}>{config.title}</span>
         </div>
      </div>

      {/* 我方侧落位：汉玉台 */}
      <div className={`w-full flex justify-center py-4 bg-gradient-to-t from-transparent to-[#064e3b]/10 rounded-b-3xl border-b-2 border-[#064e3b]/30 transition-all ${isTarget ? 'opacity-100' : 'opacity-40'}`}>
         <div className="flex gap-4">
            {playerSeat.units.slice(0, 3).map((unit, i) => (
              <UnitPip key={unit.id || i} unit={unit} isEnemy={false} />
            ))}
         </div>
      </div>
    </div>
  );
};

export const BattleArena: React.FC<BattleArenaProps> = ({
  state,
  onSelectSeat,
}) => {
  const { player, enemy, phase } = state;
  const isRevealed = true;

  const getPlannedCard = (side: 'player' | 'enemy', slot: 'layer1' | 'layer2'): DebateCard | null => {
    const p = side === 'player' ? player : enemy;
    const cardId = slot === 'layer1' ? p.plan.layer1CardId : p.plan.layer2CardId;
    if (!cardId) return null;
    return (
      p.hand.find(c => c.id === cardId)
      || p.discard.find(c => c.id === cardId)
      || p.writings.find(c => c.id === cardId)
      || null
    );
  };

  const seats: SeatId[] = ['zhu_yi', 'pang_yi'];

  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-[#f6e4c3] overflow-hidden">
      {/* 场景层：杏坛八卦阵背景 */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         <div className="w-[800px] h-[800px] opacity-[0.05] animate-[spin_120s_linear_infinite]">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] rounded-full border-[40px] border-[#0a0503]" />
         </div>
         <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF65]/20 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#831843]/5 via-transparent to-[#064e3b]/5" />
      </div>

      {/* 对手侧：势压 */}
      <div className="h-40 flex items-center justify-center gap-16 px-12 relative z-10">
        <div className="flex flex-col items-center">
           <div className="w-20 h-20 rounded-full bg-[#0a0503] border-4 border-[#831843] shadow-2xl flex items-center justify-center overflow-hidden transform hover:scale-110 transition-transform">
              <span className="text-4xl filter grayscale">👺</span>
           </div>
           <span className="mt-2 text-xs font-black text-[#0a0503] tracking-widest">{enemy.name}</span>
           <div className="mt-1 flex gap-1">
              {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-3 bg-[#831843]/40 skew-x-12" />)}
           </div>
        </div>

        <div className="flex gap-6 items-end">
          <CardSlot card={getPlannedCard('enemy', 'layer1')} isRevealed={isRevealed} label="第一手" isEnemy />
          <CardSlot card={getPlannedCard('enemy', 'layer2')} isRevealed={isRevealed} label="第二手" isEnemy />
        </div>
      </div>

      {/* 核心枢纽：论道坛场 */}
      <div className="flex-1 flex items-center justify-center px-16 gap-8 relative z-10 py-4">
        {seats.map((seatId) => (
          <SeatArea
            key={seatId}
            seatId={seatId}
            playerSeat={player.seats[seatId]}
            enemySeat={enemy.seats[seatId]}
            isSelectable={phase === 'play_1' || phase === 'play_2'}
            isTarget={player.plan.layer1TargetSeat === seatId || player.plan.layer2TargetSeat === seatId}
            onSelect={onSelectSeat}
          />
        ))}
      </div>

      {/* 我方侧：论根 */}
      <div className="h-40 flex items-center justify-center gap-16 px-12 relative z-10 mb-6">
        <div className="flex gap-6 items-start">
          <CardSlot card={getPlannedCard('player', 'layer1')} isRevealed={true} label="第一手" />
          <CardSlot card={getPlannedCard('player', 'layer2')} isRevealed={true} label="第二手" />
        </div>

        <div className="flex flex-col items-center">
           <div className="w-20 h-20 rounded-full bg-[#f6e4c3] border-4 border-[#064e3b] shadow-2xl flex items-center justify-center overflow-hidden transform hover:scale-110 transition-transform">
              <span className="text-4xl">🎒</span>
           </div>
           <span className="mt-2 text-xs font-black text-[#0a0503] tracking-widest">{player.name}</span>
           <div className="mt-1 flex gap-1">
              {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-3 bg-[#064e3b]/40 -skew-x-12" />)}
           </div>
        </div>
      </div>
    </div>
  );
};
