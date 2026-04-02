/**
 * 底部操作区组件
 * 稷下受业：名士案头 (V9 雅化版)
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

const UI_ASSET_PATH = '/assets/v9/battle_ui_controls.png';

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

  const fanOffset = total > 1 ? (index - (total - 1) / 2) * (total >= 6 ? 6 : 10) : 0;
  const rotation = total > 1 ? (index - (total - 1) / 2) * (total >= 6 ? 1.2 : 2) : 0;

  return (
    <button
      onClick={onClick}
      className="relative transition-all duration-500 ease-out origin-bottom group"
      style={{
        transform: isSelected
          ? 'scale(1.2) translateY(-40px)'
          : `rotate(${rotation}deg) translateX(${fanOffset}px)`,
        zIndex: isSelected ? 100 : 10 + index,
      }}
    >
      <div
        className="relative w-[100px] h-[140px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 bg-white border-2"
        style={{
          borderColor: isSelected ? colors.border : `${colors.border}20`,
          boxShadow: isSelected
            ? `0 20px 60px ${colors.glow}, 0 0 0 6px ${colors.border}10`
            : `0 10px 30px rgba(0,0,0,0.2)`,
        }}
      >
        <div className="absolute inset-0 bg-[#FDFBF7]">
          {card.art ? (
            <img
              src={card.art}
              alt={card.name}
              className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-opacity duration-700"
            />
          ) : (
            <div className="w-full h-full bg-[#B8A48D]/10" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-transparent to-transparent pointer-events-none" />

        {/* 费用印章 */}
        <div
          className="absolute top-2 left-2 z-30 w-8 h-8 rounded-lg flex items-center justify-center text-[15px] font-black shadow-xl rotate-[-5deg]"
          style={{
            backgroundColor: 'white',
            color: '#1A1A1A',
            border: `2px solid ${colors.border}`,
          }}
        >
          {card.cost}
        </div>

        {/* 类型标签 */}
        <div
          className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter opacity-90 shadow-sm"
          style={{
            backgroundColor: isSelected ? colors.border : colors.bg,
            color: isSelected ? 'white' : colors.border,
          }}
        >
          {card.type}
        </div>

        {/* 卡牌名称 */}
        <div className="absolute bottom-2 left-0 right-0 z-30 p-2">
          <span className="text-[11px] text-white font-black block truncate text-center uppercase tracking-tight">
            {card.name}
          </span>
        </div>

        {/* 指标数值：砚台质感 */}
        {hasStats && (
          <div className="absolute bottom-6 right-1.5 z-30 flex flex-col gap-1">
            <div className="w-5 h-5 rounded-md bg-[#3A5F41] border border-white/20 flex items-center justify-center shadow-lg transform rotate-2">
              <span className="text-[10px] font-black text-white">{card.power}</span>
            </div>
            <div className="w-5 h-5 rounded-md bg-[#8D2F2F] border border-white/20 flex items-center justify-center shadow-lg transform -rotate-2">
              <span className="text-[10px] font-black text-white">{card.hp}</span>
            </div>
          </div>
        )}
      </div>
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

  return (
    <div className="h-52 bg-[#1A1A1A] border-t-8 border-[#3D2B1F] shadow-[0_-30px_60px_rgba(0,0,0,0.5)] flex shrink-0 relative z-20 overflow-hidden">
      {/* 装饰层：乌金木案纹理 */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
         <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]" />
      </div>

      {/* 资源显示区：玉瓶与虎符 */}
      <div className="w-56 xl:w-72 px-8 flex flex-col justify-center gap-6 border-r-2 border-white/5 relative z-10 bg-black/20">
        <div className="flex items-center gap-6 transition-all">
           {/* 灵气玉瓶 */}
           <div className="relative w-16 h-16 group">
              <div 
                className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all opacity-80"
                style={{ 
                  backgroundImage: `url('${UI_ASSET_PATH}')`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: '0% 0%'
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Qi</span>
                 <span className="text-xl font-black text-white tracking-widest mt-1 italic">{player.resources.lingShi}</span>
              </div>
           </div>
           
           {/* 大势虎符 */}
           <div className="relative w-16 h-16 group">
              <div 
                className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all opacity-80"
                style={{ 
                  backgroundImage: `url('${UI_ASSET_PATH}')`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: '100% 0%'
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Dyn</span>
                 <span className="text-xl font-black text-[#D4AF65] tracking-widest mt-1 italic">{player.resources.daShi}</span>
              </div>
           </div>
        </div>

        <div className="h-px w-full bg-white/10" />
        
        <div className="flex flex-col gap-1">
           <span className="text-[10px] font-black text-[#8D2F2F] uppercase tracking-[0.3em]">Current Doctrine</span>
           <span className="text-sm font-black text-white/90 truncate serif italic">
             {selectedCardId ? player.hand.find(c => c.id === selectedCardId)?.name : '择策而动...'}
           </span>
        </div>
      </div>

      {/* 操作按钮区：朱印与日晷 */}
      <div className="w-48 xl:w-60 px-8 flex flex-col justify-center items-center gap-4 relative z-10">
        {selectedCardId ? (
          <div className="w-full space-y-4">
             <button
                onClick={onConfirm}
                disabled={!canAct}
                className="group relative w-full h-24 flex items-center justify-center overflow-hidden rounded-2xl transition-all active:scale-95 disabled:grayscale"
             >
                <div 
                  className="absolute inset-0"
                  style={{ 
                    backgroundImage: `url('${UI_ASSET_PATH}')`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: '0% 100%'
                  }}
                />
                <span className="relative text-2xl font-black text-white tracking-[1em] pl-[1em] hover:scale-110 transition-transform">布阵</span>
             </button>
             <button
                onClick={onCancel}
                className="w-full py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.5em] hover:text-white transition-all underline underline-offset-8 decoration-white/10 decoration-2"
             >
               撤回策论
             </button>
          </div>
        ) : (
          <button
            onClick={onEndTurn}
            disabled={!canAct || isFinished}
            className="group relative w-32 h-32 flex items-center justify-center rounded-full transition-all hover:rotate-90 active:scale-90 disabled:opacity-20"
          >
             <div 
               className="absolute inset-0 grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100 transition-all duration-700"
               style={{ 
                 backgroundImage: `url('${UI_ASSET_PATH}')`,
                 backgroundSize: '200% 200%',
                 backgroundPosition: '100% 100%'
               }}
             />
             <div className="relative flex flex-col items-center">
                <span className="text-lg font-black text-[#D4AF65] tracking-[0.3em] uppercase">结</span>
                <span className="text-[8px] font-black text-white/40 tracking-widest mt-1">THE END</span>
             </div>
          </button>
        )}
      </div>

      {/* 手牌区：乌金木衬托下的华彩 */}
      <div className="flex-1 px-12 py-6 overflow-x-auto overflow-y-visible scrollbar-hide relative z-10">
        <div className="flex items-end justify-center h-full min-w-max mx-auto gap-3">
          {player.hand.length === 0 ? (
            <div className="flex flex-col items-center gap-2 opacity-20">
               <span className="text-4xl font-black italic serif text-white">竭</span>
               <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Inventory Depleted</span>
            </div>
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
