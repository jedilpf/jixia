/**
 * 卡牌图鉴面板
 * 稷下卷宗：万卷藏经
 */

import React, { useMemo, useState } from 'react';
import {
  getCardTierLabel,
  getCardUnlockLevel,
  getDeckTierQuotaForLevel,
  isCardUnlockedForLevel,
} from '@/battleV2/tierSystem';
import { DebateCard, CardTypeV2 } from '@/battleV2/types';

interface CardLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: DebateCard[];
  currentPlayerLevel?: number;
}

const CARD_TYPES: { type: CardTypeV2 | 'all'; label: string; color: string; icon: string }[] = [
  { type: 'all', label: '万象', color: '#1A1A1A', icon: '象' },
  { type: '立论', label: '立论', color: '#3A5F41', icon: '立' },
  { type: '策术', label: '策术', color: '#8D2F2F', icon: '策' },
  { type: '反诘', label: '反诘', color: '#D4AF65', icon: '反' },
  { type: '门客', label: '门客', color: '#5C4033', icon: '客' },
  { type: '玄章', label: '玄章', color: '#1A1A1A', icon: '玄' },
];

const TYPE_COLORS: Record<CardTypeV2, string> = {
  立论: '#3A5F41',
  策术: '#8D2F2F',
  反诘: '#D4AF65',
  门客: '#5C4033',
  玄章: '#1A1A1A',
};

const CardLibraryPanel: React.FC<CardLibraryPanelProps> = ({
  isOpen,
  onClose,
  allCards,
  currentPlayerLevel = 1,
}) => {
  const [selectedType, setSelectedType] = useState<CardTypeV2 | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<DebateCard | null>(null);

  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const matchesType = selectedType === 'all' || card.type === selectedType;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        card.name.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query) ||
        card.prologue?.toLowerCase().includes(query) ||
        card.faction?.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [allCards, searchQuery, selectedType]);

  const unlockedCount = useMemo(
    () => allCards.filter((card) => isCardUnlockedForLevel(card, currentPlayerLevel)).length,
    [allCards, currentPlayerLevel],
  );

  const currentQuota = useMemo(() => getDeckTierQuotaForLevel(currentPlayerLevel), [currentPlayerLevel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/90 backdrop-blur-xl p-6 selection:bg-[#3A5F41] selection:text-white">
      <div className="w-full max-w-7xl h-[90vh] bg-[#FDFBF7] rounded-[3rem] border-[6px] border-white shadow-[0_60px_150px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#1A1A1A]/10 to-transparent" />
        </div>

        <div className="h-32 px-12 flex items-center justify-between border-b-2 border-[#1A1A1A]/5 bg-white/80 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-[#8D2F2F] flex items-center justify-center shadow-xl transform -rotate-3 text-white font-black text-2xl">
              藏
            </div>
            <div className="flex flex-col">
              <h2 className="text-4xl font-black tracking-tighter text-[#1A1A1A] uppercase serif">稷下万卷 · 藏经阁</h2>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3A5F41]" />
                  <span className="text-[11px] font-black text-[#5C4033]/60 uppercase tracking-widest">
                    名士等级 {currentPlayerLevel} · 研习进度 {unlockedCount}/{allCards.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF65]" />
                  <span className="text-[11px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">
                    策论定额: 二等≤{currentQuota.maxTwoStar} / 三等≤{currentQuota.maxThreeStar}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 shadow-inner group"
          >
            <div className="transform group-hover:rotate-90 transition-transform duration-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        </div>

        <div className="px-12 py-8 flex items-center gap-10 border-b border-[#1A1A1A]/5 bg-white/20 backdrop-blur-sm relative z-10">
          <div className="flex gap-4">
            {CARD_TYPES.map(({ type, label, color, icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 relative ${
                  selectedType === type
                    ? 'text-white shadow-[0_15px_30px_rgba(0,0,0,0.15)] scale-105'
                    : 'text-[#5C4033]/40 hover:text-[#1A1A1A] bg-white/50 border-2 border-[#1A1A1A]/5'
                }`}
                style={{
                  backgroundColor: selectedType === type ? color : undefined,
                  borderColor: selectedType === type ? color : undefined,
                }}
              >
                <span className={`text-[10px] ${selectedType === type ? 'opacity-100' : 'opacity-40'}`}>{icon}</span>
                {label}
                {selectedType === type && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 max-w-lg ml-auto relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索名帖、策论或门派..."
              className="w-full px-8 py-4 pl-14 rounded-2xl bg-white border-2 border-[#1A1A1A]/5 text-sm font-bold text-[#1A1A1A] placeholder-[#5C4033]/30 focus:border-[#3A5F41] focus:outline-none shadow-sm group-hover:shadow-md transition-all"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5C4033]/40 group-focus-within:text-[#3A5F41] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative z-10">
          <div className="flex-1 p-10 overflow-y-auto scrollbar-hide bg-gradient-to-r from-transparent to-[#1A1A1A]/5">
            {filteredCards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <div className="text-[12rem] font-black italic mb-4 serif">空</div>
                <p className="text-2xl font-black tracking-[0.5em] uppercase">遍寻无果，或入他阁</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCards.map((card) => (
                  <CardLibraryItem
                    key={card.id}
                    card={card}
                    isSelected={selectedCard?.id === card.id}
                    currentPlayerLevel={currentPlayerLevel}
                    onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedCard && (
            <div className="w-[450px] border-l-4 border-[#1A1A1A]/5 bg-white p-12 overflow-y-auto shadow-[-20px_0_50px_rgba(0,0,0,0.05)] animate-in slide-in-from-right-10 duration-700">
              <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0">
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />
              </div>
              <div className="relative z-10">
                <CardDetail card={selectedCard} />
              </div>
            </div>
          )}
        </div>

        <div className="h-20 px-12 flex items-center justify-between border-t-2 border-[#1A1A1A]/5 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-[#3A5F41]" />
            <span className="text-[11px] font-black text-[#5C4033]/40 uppercase tracking-[0.3em]">
              Academy Archives: {filteredCards.length} Classified Records Found
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.4em] hover:text-[#3A5F41] transition-colors"
          >
            Leave Archives [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};

const CardLibraryItem: React.FC<{
  card: DebateCard;
  isSelected: boolean;
  currentPlayerLevel: number;
  onClick: () => void;
}> = ({ card, isSelected, currentPlayerLevel, onClick }) => {
  const color = TYPE_COLORS[card.type] || '#1A1A1A';
  const tierLabel = getCardTierLabel(card);
  const unlocked = isCardUnlockedForLevel(card, currentPlayerLevel);

  return (
    <div
      onClick={onClick}
      className={`group p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col ${
        isSelected
          ? 'bg-white shadow-[0_25px_50px_rgba(0,0,0,0.15)] -translate-y-2'
          : 'bg-white/40 hover:bg-white hover:shadow-xl hover:-translate-y-1'
      }`}
      style={{
        borderColor: isSelected ? color : 'rgba(26,26,26,0.05)',
        opacity: unlocked ? 1 : 0.6,
      }}
    >
      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-black text-[#1A1A1A] leading-tight serif">{card.name}</span>
          <span className="text-[10px] font-black text-[#D4AF65] tracking-[0.2em]">{tierLabel}</span>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black italic shadow-inner transition-all duration-500 ${
            isSelected ? 'rotate-[360deg]' : ''
          }`}
          style={{
            backgroundColor: isSelected ? color : 'white',
            color: isSelected ? 'white' : color,
            border: `1.5px solid ${color}20`,
          }}
        >
          {card.cost}
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <p className="text-[11px] font-medium text-[#5C4033]/70 leading-relaxed italic line-clamp-3 mb-6">
          {card.prologue
            ? `“${card.prologue}”`
            : card.description
              ? `“${card.description.slice(0, 40)}...”`
              : '圣哲之言，待君披阅。'}
        </p>
      </div>

      <div className="pt-5 border-t border-[#1A1A1A]/5 flex items-center justify-between relative z-10">
        <div className="flex gap-4">
          {card.power !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-3 bg-[#3A5F41]/30 rotate-12" />
              <span className="text-xs font-black italic text-[#1A1A1A]">{card.power}</span>
            </div>
          )}
          {card.hp !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-3 bg-[#8D2F2F]/30 -rotate-12" />
              <span className="text-xs font-black italic text-[#1A1A1A]">{card.hp}</span>
            </div>
          )}
        </div>
        <span className="text-[9px] font-black text-[#5C4033]/30 uppercase tracking-widest">{card.type}</span>
      </div>

      {!unlocked && (
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[2px] flex items-center justify-center transition-all">
          <div className="bg-[#1A1A1A] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl scale-90 group-hover:scale-100 transition-transform">
            待启：名士等级 {getCardUnlockLevel(card)} 解锁{tierLabel}
          </div>
        </div>
      )}
    </div>
  );
};

const CardDetail: React.FC<{ card: DebateCard }> = ({ card }) => {
  const color = TYPE_COLORS[card.type] || '#1A1A1A';
  const tierLabel = getCardTierLabel(card);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-[#1A1A1A] flex items-center justify-center text-4xl font-black italic shadow-2xl relative">
          <div className="absolute inset-1 border border-white/20" />
          <span className="text-white relative z-10">{card.cost}</span>
        </div>
        <div>
          <h3 className="text-3xl font-black text-[#1A1A1A] leading-tight serif">{card.name}</h3>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs font-black text-[#D4AF65] tracking-[0.3em]">{tierLabel}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/10" />
            <span className="text-[10px] font-black text-[#3A5F41] uppercase tracking-[0.2em]">{card.type}</span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {card.prologue && (
          <div className="relative px-10 py-2">
            <div className="absolute left-0 inset-y-0 w-1.5 bg-[#8D2F2F]/20 rounded-full" />
            <p className="text-lg font-black text-[#1A1A1A] italic leading-loose serif opacity-80">“{card.prologue}”</p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#1A1A1A]/5" />
            <h4 className="text-[11px] font-black text-[#5C4033]/40 uppercase tracking-[0.4em] whitespace-nowrap">策项旨要</h4>
            <div className="h-px flex-1 bg-[#1A1A1A]/5" />
          </div>
          <div className="p-8 rounded-[2rem] bg-[#FDFBF7]/50 border-2 border-[#1A1A1A]/5 shadow-inner">
            <div className="flex items-center gap-3 mb-5">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em]"
                style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}35` }}
              >
                {tierLabel}
              </span>
              {card.faction && (
                <span className="text-[10px] font-black text-[#5C4033]/50 uppercase tracking-[0.2em]">{card.faction}</span>
              )}
            </div>
            <p className="text-lg font-bold text-[#1A1A1A] leading-[2] tracking-wide serif">{card.description}</p>
          </div>
        </div>

        {(card.power !== undefined || card.hp !== undefined) && (
          <div className="grid grid-cols-2 gap-6">
            {card.power !== undefined && (
              <div className="p-8 rounded-[2.5rem] bg-white border-2 border-[#3A5F41]/10 shadow-[0_15px_40px_rgba(58,95,65,0.05)] flex flex-col items-center group overflow-hidden relative">
                <div className="absolute inset-0 bg-[#3A5F41]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <span className="text-[11px] font-black text-[#3A5F41] uppercase tracking-[0.3em] mb-2 relative z-10">锋 · 辩才</span>
                <span className="text-5xl font-black text-[#1A1A1A] italic tabular-nums relative z-10">{card.power}</span>
              </div>
            )}
            {card.hp !== undefined && (
              <div className="p-8 rounded-[2.5rem] bg-white border-2 border-[#8D2F2F]/10 shadow-[0_15px_40px_rgba(141,47,47,0.05)] flex flex-col items-center group overflow-hidden relative">
                <div className="absolute inset-0 bg-[#8D2F2F]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <span className="text-[11px] font-black text-[#8D2F2F] uppercase tracking-[0.3em] mb-2 relative z-10">基 · 根基</span>
                <span className="text-5xl font-black text-[#1A1A1A] italic tabular-nums relative z-10">{card.hp}</span>
              </div>
            )}
          </div>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="px-5 py-2 rounded-full border border-[#1A1A1A]/10 text-[10px] font-black text-[#5C4033]/60 uppercase tracking-[0.2em] bg-white/50"
              >
                # {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-10 flex justify-end opacity-20">
        <div className="w-20 h-20 rounded-full border-4 border-[#8D2F2F] flex items-center justify-center text-[#8D2F2F] font-black text-xs rotate-12">
          稷下验讫
        </div>
      </div>
    </div>
  );
};

export default CardLibraryPanel;
