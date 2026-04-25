/**
 * 卡牌图鉴面板
 * 显示全部卡牌、筛选、搜索
 */

import React, { useState, useMemo } from 'react';
import { CardData, ShowcaseCardType, typeColor, rarityColor } from '@/data/showcaseCards';

interface CardLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: CardData[];
}

// Only keep two visible card categories.
const CARD_TYPES: { type: ShowcaseCardType | 'all'; label: string; icon: string }[] = [
  { type: 'all', label: '\u5168\u90e8', icon: '\u5168' },
  { type: '\u7acb\u8bba', label: '\u7acb\u8bba', icon: '\u7acb' },
  { type: '\u7b56\u672f', label: '\u7b56\u672f', icon: '\u7b56' },
];

function getRuleText(card: CardData): string {
  return (card as any).ruleText ?? card.skill ?? (card as any).description ?? '';
}

function getFlavorText(card: CardData): string {
  return card.background ?? (card as any).flavorText ?? '';
}

const CardLibraryPanel: React.FC<CardLibraryPanelProps> = ({
  isOpen,
  onClose,
  allCards,
}) => {
  const [selectedType, setSelectedType] = useState<ShowcaseCardType | 'all'>('all');
  const [selectedFaction, setSelectedFaction] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // 获取所有门派列表
  const factions = useMemo(() => {
    const uniqueFactions = new Set(allCards.map(card => card.faction));
    return Array.from(uniqueFactions).sort();
  }, [allCards]);

  // 获取所有稀有度列表
  const rarities = useMemo(() => {
    const uniqueRarities = new Set(allCards.map(card => card.rarity));
    return Array.from(uniqueRarities);
  }, [allCards]);

  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const matchesType = selectedType === 'all' || card.type === selectedType;
      const matchesFaction = selectedFaction === 'all' || card.faction === selectedFaction;
      const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
      const matchesSearch =
        !searchQuery ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getFlavorText(card).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getRuleText(card).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesFaction && matchesRarity && matchesSearch;
    });
  }, [allCards, selectedType, selectedFaction, selectedRarity, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-[900px] h-[680px] bg-gradient-to-b from-[#1a1510] via-[#151210] to-[#0d0b08] rounded-2xl border border-[#5c4d3a]/50 shadow-2xl flex flex-col overflow-hidden">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#3d3225]/50 bg-gradient-to-r from-[#1a1510] to-[#151210]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9952a]/10 border border-[#c9952a]/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#c9952a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#c9b896]">卡牌图鉴</h2>
              <p className="text-xs text-[#8a7a6a]">共 {allCards.length} 张卡牌</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#8a7a6a] hover:text-[#c9b896] hover:bg-[#3d3225] hover:border-[#7a6a5a] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 flex flex-wrap items-center gap-4 border-b border-[#3d3225]/30 bg-[#0d0b08]/30">
          <div className="flex flex-wrap gap-1.5">
            {CARD_TYPES.map(({ type, label, icon }) => {
              const color = type === 'all' ? '#b8a88a' : typeColor[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'text-white shadow-lg'
                      : 'text-[#8a7a6a] hover:text-[#b8a88a] hover:bg-[#2a2318]'
                  }`}
                  style={{
                    backgroundColor: selectedType === type ? color : 'transparent',
                    border: `1px solid ${selectedType === type ? color : '#3d3225'}`,
                    boxShadow: selectedType === type ? `0 4px 12px ${color}40` : 'none',
                  }}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                      selectedType === type ? 'bg-white/20' : ''
                    }`}
                    style={{ border: `1px solid ${selectedType === type ? 'rgba(255,255,255,0.3)' : color}` }}
                  >
                    {icon}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1.5">
            <select
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#0d0b08] border border-[#3d3225]/50 text-sm text-[#c9b896] focus:border-[#c9952a]/50 focus:outline-none"
            >
              <option value="all">全部门派</option>
              {factions.map(faction => (
                <option key={faction} value={faction}>{faction}</option>
              ))}
            </select>

            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#0d0b08] border border-[#3d3225]/50 text-sm text-[#c9b896] focus:border-[#c9952a]/50 focus:outline-none"
            >
              <option value="all">全部稀有度</option>
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-sm ml-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索卡牌名称或效果..."
                className="w-full px-4 py-2.5 pl-11 rounded-xl bg-[#0d0b08] border border-[#3d3225]/50 text-sm text-[#c9b896] placeholder-[#5c4d3a] focus:border-[#c9952a]/50 focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20 transition-all"
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c4d3a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#3d3225] flex items-center justify-center text-[#8a7a6a] hover:bg-[#5c4d3a] transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto">
            {filteredCards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#5c4d3a]">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">未找到匹配的卡牌</p>
                <p className="text-sm mt-1">尝试调整筛选条件</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredCards.map((card) => (
                  <CardLibraryItem
                    key={card.id}
                    card={card}
                    isSelected={selectedCard?.id === card.id}
                    onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedCard && (
            <div className="w-80 border-l border-[#3d3225]/30 bg-[#0d0b08]/50 p-4 overflow-y-auto">
              <CardDetail card={selectedCard} />
            </div>
          )}
        </div>

        <div className="h-12 px-6 flex items-center justify-between border-t border-[#3d3225]/30 bg-[#0d0b08]/50 text-xs text-[#8a7a6a]">
          <span>显示 {filteredCards.length} 张卡牌</span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-[#2a2318] border border-[#3d3225] text-[#8a7a6a]">Esc</kbd>
            <span>关闭</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const CardLibraryItem: React.FC<{
  card: CardData;
  isSelected: boolean;
  onClick: () => void;
}> = ({ card, isSelected, onClick }) => {
  const color = typeColor[card.type] || '#b8a88a';
  const rarity = rarityColor[card.rarity] || '#8a7a6a';

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border-2 transition-all cursor-pointer group ${
        isSelected
          ? 'bg-[#1a1510] shadow-lg'
          : 'bg-[#0d0b08]/50 hover:bg-[#1a1510]/80'
      }`}
      style={{
        borderColor: isSelected ? color : `${color}30`,
        boxShadow: isSelected ? `0 0 20px ${color}30, inset 0 0 20px ${color}10` : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-medium text-[#c9b896] truncate flex-1">{card.name}</span>
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ml-2 shrink-0"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}50` }}
        >
          {card.cost}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {card.type}
        </span>
        <span
          className="px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ backgroundColor: `${rarity}20`, color: rarity }}
        >
          {card.rarity}
        </span>
        <span className="text-xs text-[#8a7a6a] px-2 py-0.5 rounded bg-[#3d3225]/30 truncate">{card.faction}</span>
      </div>

      {getRuleText(card) && (
        <p className="text-xs text-[#b8a88a] line-clamp-2 leading-relaxed">{getRuleText(card)}</p>
      )}

      <div className="mt-2 pt-2 border-t border-[#3d3225]/30 flex gap-4 text-xs">
        {card.attack !== undefined && (
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-[#c9952a]/20 flex items-center justify-center text-[#c9952a] text-[10px]">锋</span>
            <span className="text-[#c9952a] font-medium">{card.attack}</span>
          </div>
        )}
        {card.hp !== undefined && (
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-[#5a8a5a]/20 flex items-center justify-center text-[#5a8a5a] text-[10px]">基</span>
            <span className="text-[#5a8a5a] font-medium">{card.hp}</span>
          </div>
        )}
        {card.shield !== undefined && (
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-[#60a5fa]/20 flex items-center justify-center text-[#60a5fa] text-[10px]">护</span>
            <span className="text-[#60a5fa] font-medium">{card.shield}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CardDetail: React.FC<{ card: CardData }> = ({ card }) => {
  const color = typeColor[card.type] || '#b8a88a';
  const rarity = rarityColor[card.rarity] || '#8a7a6a';

  return (
    <div className="space-y-4">
      {/* 头部：费用 + 名称 + 类型 */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
          style={{ backgroundColor: `${color}20`, color, border: `2px solid ${color}` }}
        >
          {card.cost}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#c9b896]">{card.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {card.type}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: `${rarity}20`, color: rarity }}
            >
              {card.rarity}
            </span>
            <span className="text-xs text-[#8a7a6a]">{card.faction}</span>
          </div>
        </div>
      </div>

      {/* 属性：辩锋 / 根基 / 护持 */}
      {(card.attack !== undefined || card.hp !== undefined || card.shield !== undefined) && (
        <div>
          <h4 className="text-xs text-[#5c4d3a] uppercase tracking-wider mb-2 font-medium">属性</h4>
          <div className="flex gap-3 flex-wrap">
            {card.attack !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#c9952a]/10 border border-[#c9952a]/30">
                <span className="text-xs text-[#c9952a]">辩锋</span>
                <span className="text-lg font-bold text-[#c9952a]">{card.attack}</span>
              </div>
            )}
            {card.hp !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#5a8a5a]/10 border border-[#5a8a5a]/30">
                <span className="text-xs text-[#5a8a5a]">根基</span>
                <span className="text-lg font-bold text-[#5a8a5a]">{card.hp}</span>
              </div>
            )}
            {card.shield !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#60a5fa]/10 border border-[#60a5fa]/30">
                <span className="text-xs text-[#60a5fa]">护持</span>
                <span className="text-lg font-bold text-[#60a5fa]">{card.shield}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 规则 */}
      {getRuleText(card) && (
        <div>
          <h4 className="text-xs text-[#5c4d3a] uppercase tracking-wider mb-2 font-medium">规则</h4>
          <p className="text-sm text-[#c9b896] leading-relaxed bg-[#1a1510]/50 p-3 rounded-lg border border-[#3d3225]/30">
            {getRuleText(card)}
          </p>
        </div>
      )}

      {/* 风味 */}
      {getFlavorText(card) && (
        <div>
          <h4 className="text-xs text-[#5c4d3a] uppercase tracking-wider mb-2 font-medium">风味</h4>
          <p className="text-sm text-[#b8a88a] leading-relaxed italic">{getFlavorText(card)}</p>
        </div>
      )}
    </div>
  );
};

export default CardLibraryPanel;
