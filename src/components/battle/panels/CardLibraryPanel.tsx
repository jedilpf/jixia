/**
 * 卡牌图鉴面板
 * 显示全部卡牌、筛选、搜索
 */

import React, { useState, useMemo } from 'react';
import { DebateCard, CardTypeV2 } from '@/battleV2/types';
import {
  getDeckTierQuotaForLevel,
  getCardUnlockLevel,
  isCardUnlockedForLevel,
  resolveCardStarTier,
} from '@/battleV2/tierSystem';

interface CardLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: DebateCard[];
  currentPlayerLevel?: number;
}

const CARD_TYPES: { type: CardTypeV2 | 'all'; label: string; color: string; icon: string; bg: string }[] = [
  { type: 'all', label: '全部', color: '#1A1A1A', icon: '全', bg: '#F5F5F5' },
  { type: '立论', label: '立论', color: '#3A5F41', icon: '立', bg: '#EBF5EE' },
  { type: '策术', label: '策术', color: '#8D2F2F', icon: '策', bg: '#F5E6E6' },
  { type: '反诘', label: '反诘', color: '#D4AF65', icon: '反', bg: '#FDFBF7' },
  { type: '门客', label: '门客', color: '#5C4033', icon: '客', bg: '#F2ECD9' },
  { type: '玄章', label: '玄章', color: '#1A1A1A', icon: '玄', bg: '#F5F5F5' },
];

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
      const matchesSearch =
        !searchQuery ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [allCards, selectedType, searchQuery]);

  const unlockedCount = useMemo(
    () => allCards.filter((card) => isCardUnlockedForLevel(card, currentPlayerLevel)).length,
    [allCards, currentPlayerLevel],
  );

  const currentQuota = useMemo(
    () => getDeckTierQuotaForLevel(currentPlayerLevel),
    [currentPlayerLevel],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-6xl h-[85vh] bg-[#FDFBF7] rounded-[2.5rem] border-4 border-white shadow-[0_50px_100px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative">
        {/* 顶部标题区：名士书斋感 */}
        <div className="h-24 px-10 flex items-center justify-between border-b border-[#1A1A1A]/5 bg-white">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A] uppercase">稷下万卷</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest">
                  LV.{currentPlayerLevel} · UNLOCKED {unlockedCount}/{allCards.length}
                </span>
                <span className="h-4 w-px bg-[#1A1A1A]/10" />
                <span className="text-[10px] font-black text-[#3A5F41]/60 uppercase tracking-widest">
                  QUOTA: 2★≤{currentQuota.maxTwoStar} / 3★≤{currentQuota.maxThreeStar}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-90 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 筛选与搜索：洗练案头 */}
        <div className="px-10 py-6 flex items-center gap-6 border-b border-[#1A1A1A]/5 bg-white/40">
          <div className="flex gap-2">
            {CARD_TYPES.map(({ type, label, color, icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black transition-all ${
                  selectedType === type
                    ? 'text-white shadow-xl'
                    : 'text-[#5C4033]/40 hover:text-[#1A1A1A] hover:bg-white'
                }`}
                style={{
                  backgroundColor: selectedType === type ? color : 'transparent',
                  border: `1.5px solid ${selectedType === type ? color : 'rgba(26,26,26,0.05)'}`,
                }}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black tracking-tighter ${
                    selectedType === type ? 'bg-white/20' : 'bg-black/5'
                  }`}
                >
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 max-w-md ml-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="寻觅名帖或策论..."
              className="w-full px-6 py-3 pl-12 rounded-full bg-white border-2 border-[#1A1A1A]/5 text-sm font-bold text-[#1A1A1A] placeholder-[#5C4033]/30 focus:border-[#3A5F41] focus:outline-none focus:ring-4 focus:ring-[#3A5F41]/5 transition-all shadow-sm"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C4033]/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 长图列表 */}
          <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
            {filteredCards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <div className="text-8xl font-black italic mb-4">空</div>
                <p className="text-sm font-black tracking-widest uppercase">寻之不得，或入他途</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* 详情区：宣纸质感 */}
          {selectedCard && (
            <div className="w-[400px] border-l-2 border-[#1A1A1A]/5 bg-white p-10 overflow-y-auto relative">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              </div>
              <div className="relative z-10">
                <CardDetail card={selectedCard} />
              </div>
            </div>
          )}
        </div>

        {/* 底部脚注 */}
        <div className="h-14 px-10 flex items-center justify-between border-t border-[#1A1A1A]/5 bg-white/40">
          <span className="text-[10px] font-black text-[#5C4033]/30 uppercase tracking-[0.2em]">
            Cataloging {filteredCards.length} Records in the Academy
          </span>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/10" />
               <span className="text-[10px] font-black text-[#5C4033]/30 uppercase tracking-widest">Esc to Depart</span>
             </div>
          </div>
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
  const v9Colors: Record<string, string> = {
    '立论': '#3A5F41',
    '策术': '#8D2F2F',
    '反诘': '#D4AF65',
    '门客': '#5C4033',
    '玄章': '#1A1A1A',
  };
  const color = v9Colors[card.type] || '#1A1A1A';
  const starTier = resolveCardStarTier(card);
  const unlocked = isCardUnlockedForLevel(card, currentPlayerLevel);
  const starText = '★'.repeat(starTier);

  return (
    <div
      onClick={onClick}
      className={`group p-5 rounded-[1.25rem] border-2 transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? 'bg-white shadow-2xl scale-[1.02]'
          : 'bg-white/40 hover:bg-white hover:shadow-lg'
      }`}
      style={{
        borderColor: isSelected ? color : 'rgba(26,26,26,0.05)',
        opacity: unlocked ? 1 : 0.4,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-base font-black text-[#1A1A1A] leading-tight line-clamp-1">{card.name}</span>
          <span className="text-[10px] font-black text-[#5C4033]/30 mt-1 uppercase tracking-tighter">{card.type}</span>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black italic shadow-sm"
          style={{ backgroundColor: isSelected ? color : 'white', color: isSelected ? 'white' : color, border: `1.5px solid ${color}20` }}
        >
          {card.cost}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black text-[#D4AF65] tracking-widest">{starText}</span>
        {card.faction && (
          <span className="text-[9px] font-black text-[#5C4033]/30 uppercase tracking-tighter">[{card.faction}]</span>
        )}
      </div>

      {card.description && (
        <p className="text-[11px] font-medium text-[#5C4033]/60 leading-relaxed mb-4 line-clamp-2 h-8 italic">
          "{card.description}"
        </p>
      )}

      <div className="flex gap-4 pt-4 border-t border-[#1A1A1A]/5">
        {card.power !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#3A5F41]">锋</span>
            <span className="text-sm font-black text-[#1A1A1A] italic tabular-nums">{card.power}</span>
          </div>
        )}
        {card.hp !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#8D2F2F]">基</span>
            <span className="text-sm font-black text-[#1A1A1A] italic tabular-nums">{card.hp}</span>
          </div>
        )}
      </div>

      {!unlocked && (
        <div className="absolute inset-0 bg-[#FDFBF7]/40 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
            UNLOCKED AT LV.{getCardUnlockLevel(card)}
          </div>
        </div>
      )}
    </div>
  );
};

const CardDetail: React.FC<{ card: DebateCard }> = ({ card }) => {
  const v9Colors: Record<string, string> = {
    '立论': '#3A5F41',
    '策术': '#8D2F2F',
    '反诘': '#D4AF65',
    '门客': '#5C4033',
    '玄章': '#1A1A1A',
  };
  const color = v9Colors[card.type] || '#1A1A1A';
  const starTier = resolveCardStarTier(card);
  const starText = '★'.repeat(starTier);

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-5 mb-10">
        <div
          className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl font-black italic shadow-xl"
          style={{ backgroundColor: color, color: 'white' }}
        >
          {card.cost}
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#1A1A1A] leading-tight">{card.name}</h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] font-black text-[#D4AF65] tracking-widest">{starText}</span>
            <span className="text-[10px] font-black text-[#3A5F41] uppercase tracking-widest">{card.type}</span>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {card.prologue && (
          <div className="relative p-6">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-[#3A5F41]/10 rounded-full" />
            <p className="text-sm font-medium text-[#1A1A1A] italic leading-relaxed serif">
              “{card.prologue}”
            </p>
          </div>
        )}

        {card.description && (
          <div>
            <h4 className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-4">策项效果 / Effects</h4>
            <div className="p-6 rounded-[1.5rem] bg-[#FDFBF7] border border-[#1A1A1A]/5 shadow-sm">
               <p className="text-base font-bold text-[#1A1A1A] leading-relaxed">{card.description}</p>
            </div>
          </div>
        )}

        {(card.power !== undefined || card.hp !== undefined) && (
          <div>
            <h4 className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-4">辩锋基石 / Stats</h4>
            <div className="flex gap-4">
              {card.power !== undefined && (
                <div className="flex-1 p-6 rounded-[1.5rem] bg-white border border-[#3A5F41]/10 shadow-sm flex flex-col items-center">
                  <span className="text-[10px] font-black text-[#3A5F41] uppercase tracking-widest mb-1">Power</span>
                  <span className="text-3xl font-black text-[#1A1A1A] italic tabular-nums">{card.power}</span>
                </div>
              )}
              {card.hp !== undefined && (
                <div className="flex-1 p-6 rounded-[1.5rem] bg-white border border-[#8D2F2F]/10 shadow-sm flex flex-col items-center">
                  <span className="text-[10px] font-black text-[#8D2F2F] uppercase tracking-widest mb-1">Health</span>
                  <span className="text-3xl font-black text-[#1A1A1A] italic tabular-nums">{card.hp}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {card.tags && card.tags.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest mb-2 font-medium">标签 / Tags</h4>
            <div className="flex flex-wrap gap-2">
              {card.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-[#1A1A1A]/5 text-[10px] font-black text-[#5C4033]/60 uppercase tracking-tighter">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardLibraryPanel;
