import { useState } from 'react';
import { getCardTierLabel, resolveStarTierByRarity } from '@/battleV2/tierSystem';
import { CARDS, rarityColor, typeColor } from '@/data/cardsSource';
import { uiAudio } from '@/utils/audioManager';
import { getAssetUrl, getCardImageUrl } from '@/utils/assets';

// 门派符号映射 - 每个门派一个独特的Unicode符号
const FACTION_SYMBOLS: Record<string, string> = {
  '礼心殿': '禮',
  '衡戒廷': '衡',
  '归真观': '真',
  '玄匠盟': '匠',
  '九阵堂': '阵',
  '名相府': '相',
  '司天台': '司',
  '游策阁': '策',
  '万农坊': '农',
  '兼采楼': '兼',
  '天工坊': '工',
  '两仪署': '仪',
  '杏林馆': '杏',
  '稗言社': '言',
  '养真院': '养',
  '筹天阁': '筹',
  '通用': '通',
};

// 门派颜色映射 — 统一青铜暗金体系
// 以暗金 #D4AF65 为基准，各门派在古卷轴墨色体系中做微妙色相偏移
const FACTION_COLORS: Record<string, string> = {
  '礼心殿': '#b8954a',  // 暖金 — 礼仪之庄重
  '衡戒廷': '#a85c5c',  // 暗赤 — 律法之威严
  '归真观': '#7a9e8e',  // 青灰 — 道家之清虚
  '玄匠盟': '#a88b6a',  // 褐金 — 工匠之质朴
  '九阵堂': '#6a8a7a',  // 墨绿 — 兵家之沉毅
  '名相府': '#8a7a9e',  // 灰紫 — 名家之思辨
  '司天台': '#5a7a8e',  // 石青 — 天文之深邃
  '游策阁': '#a87a5a',  // 赭石 — 纵横之谋略
  '万农坊': '#7a8a5a',  // 苍绿 — 农耕之生机
  '兼采楼': '#9a8a6a',  // 暖灰 — 博采之包容
  '天工坊': '#7a8a7a',  // 青灰 — 机关之精密
  '两仪署': '#8a7a8a',  // 灰紫 — 阴阳之玄妙
  '杏林馆': '#6a9a8a',  // 青碧 — 医术之清净
  '稗言社': '#8a7a6a',  // 褐灰 — 流言之低调
  '养真院': '#7a9a9a',  // 青灰 — 养生之恬淡
  '筹天阁': '#6a7a8a',  // 灰蓝 — 筹算之冷静
  '通用': '#8a8a8a',    // 中性灰
};

interface CardGridProps {
  onBack: () => void;
  onSelectCard: (index: number) => void;
}

export function CardGrid({ onBack, onSelectCard }: CardGridProps) {
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  const factions = Array.from(new Set(CARDS.map((card) => card.faction)));

  const filteredCards = selectedFaction
    ? CARDS.filter((card) => card.faction === selectedFaction)
    : CARDS;

  const groupedCards = filteredCards.reduce((acc, card) => {
    if (!acc[card.faction]) acc[card.faction] = [];
    acc[card.faction].push(card);
    return acc;
  }, {} as Record<string, typeof CARDS>);

  // 对每个门派的卡牌按星级排序
  Object.keys(groupedCards).forEach((faction) => {
    groupedCards[faction].sort((a, b) => {
      const tierA = resolveStarTierByRarity(a.rarity);
      const tierB = resolveStarTierByRarity(b.rarity);
      return tierA - tierB;
    });
  });

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center relative overflow-hidden select-none pb-8">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${getAssetUrl('assets/bookshelf-bg.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 z-0 bg-black/60" />
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d4a520]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[rgba(160,60,220,0.1)] rounded-full blur-[120px]" />
      </div>

      {/* 顶部导航栏 */}
      <div className="w-full flex items-center justify-between p-6 z-50">
        <button
          onClick={() => {
            uiAudio.playClick();
            onBack();
          }}
          onMouseEnter={() => uiAudio.playHover()}
          className="px-6 py-2 bg-black/40 border border-[#d4a520]/40 text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 rounded-full transition-all tracking-widest flex items-center gap-2"
        >
          <span>❮</span>
          返回主界面
        </button>
        <div className="text-2xl font-bold font-serif text-[#d4a520] tracking-widest drop-shadow-[0_0_8px_rgba(212,165,32,0.6)]">
          问道百家 · 卡牌图鉴
        </div>
        <div className="w-36 text-right text-[#d4a520]/60 font-serif">共 {CARDS.length} 卷</div>
      </div>

      {/* 门派筛选栏 - 符号化 */}
      <div className="w-full px-6 z-50 mb-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* 全部按钮 */}
          <button
            onClick={() => {
              uiAudio.playClick();
              setSelectedFaction(null);
            }}
            onMouseEnter={() => uiAudio.playHover()}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-serif font-bold transition-all duration-300 ${
              selectedFaction === null
                ? 'border-[#d4a520] bg-[#d4a520]/20 text-[#f5e6b8] shadow-[0_0_12px_rgba(212,165,32,0.4)]'
                : 'border-[#d4a520]/40 text-[#d4a520]/60 hover:border-[#d4a520]/70 hover:text-[#d4a520]'
            }`}
            title="全部门派"
          >
            全
          </button>

          {/* 分隔线 */}
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-[#d4a520]/30 to-transparent mx-1" />

          {/* 门派符号 */}
          {factions.map((faction) => {
            const symbol = FACTION_SYMBOLS[faction] || faction[0];
            const color = FACTION_COLORS[faction] || '#d4a520';
            const isSelected = selectedFaction === faction;

            return (
              <button
                key={faction}
                onClick={() => {
                  uiAudio.playClick();
                  setSelectedFaction(isSelected ? null : faction);
                }}
                onMouseEnter={() => uiAudio.playHover()}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-serif font-bold transition-all duration-300 ${
                  isSelected
                    ? 'shadow-[0_0_12px_rgba(212,165,32,0.4)] scale-110'
                    : 'hover:scale-105'
                }`}
                style={{
                  borderColor: isSelected ? color : color + '60',
                  backgroundColor: isSelected ? color + '30' : 'transparent',
                  color: isSelected ? '#f5e6b8' : color + 'cc',
                  textShadow: isSelected ? `0 0 8px ${color}` : 'none',
                }}
                title={faction}
              >
                {symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前选中门派名称显示 */}
      {selectedFaction && (
        <div className="w-full text-center z-50 mb-4">
          <span
            className="text-lg font-serif font-bold tracking-[0.3em]"
            style={{ color: FACTION_COLORS[selectedFaction] || '#d4a520' }}
          >
            {selectedFaction}
          </span>
          <span className="text-[#d4a520]/40 text-sm ml-2">
            ({groupedCards[selectedFaction]?.length || 0} 张)
          </span>
        </div>
      )}

      <div className="w-[96%] mx-auto flex-1 custom-scrollbar px-[6%] z-10 pb-12" style={{ overflowY: 'auto' }}>
        {Object.entries(groupedCards).map(([faction, factionCards]) => {
          return (
            <div key={faction} className="mb-10 w-full">
              {/* 门派标题 - 仅在显示全部时显示 */}
              {!selectedFaction && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d4a520]/30" />
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-sm font-serif font-bold"
                      style={{ color: FACTION_COLORS[faction] || '#d4a520' }}
                    >
                      {FACTION_SYMBOLS[faction] || faction[0]}
                    </span>
                    <h3
                      className="text-xl font-serif font-bold tracking-[0.2em]"
                      style={{ color: FACTION_COLORS[faction] || '#d4a520' }}
                    >
                      {faction}
                    </h3>
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d4a520]/30" />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {factionCards.map((card) => {
                  const globalIndex = CARDS.findIndex((entry) => entry.id === card.id);
                  const tierLabel = getCardTierLabel(card);

                  return (
                    <div
                      key={card.id}
                      className="rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-[1.03] transition-transform duration-300"
                    >
                      <div
                        onClick={() => {
                          uiAudio.playClick();
                          onSelectCard(globalIndex);
                        }}
                        onMouseEnter={() => uiAudio.playHover()}
                        className="relative aspect-[2/3] rounded-md overflow-hidden group flex flex-col bg-transparent border-0"
                      >
                        <div
                          className="absolute inset-[4%] bg-cover bg-center opacity-90 group-hover:opacity-100 z-0"
                          style={{ backgroundImage: `url(${getCardImageUrl(card.id, card.name)})` }}
                        />

                        <div
                          className="absolute inset-0 bg-no-repeat z-10 pointer-events-none drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                          style={{
                            backgroundImage: `url(${getAssetUrl('assets/card-frame.png')})`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                          }}
                        />

                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-20" />

                        <div className="absolute top-2.5 left-2.5 w-10 h-10 flex items-center justify-center shadow-md rounded-full z-30">
                          <img
                            src={getAssetUrl('assets/cost.png')}
                            alt="tier"
                            className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          />
                          <span
                            className="relative z-10 text-[9px] font-bold text-[#f5e6b8] leading-tight tracking-[0.08em] text-center"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                          >
                            {tierLabel}
                          </span>
                        </div>

                        <div className="absolute bottom-[8px] left-[8px] right-[8px] p-2 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center pointer-events-none z-20">
                          <h4 className="text-[#f4e8cc] font-serif font-bold text-sm text-center drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] truncate w-full tracking-wider">
                            {card.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] scale-90 px-1 border border-[#d4a520]/60 text-[#f5e6b8] rounded-sm opacity-90">
                              {card.cost}费
                            </span>
                            <span
                              className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90"
                              style={{ color: rarityColor[card.rarity] || '#aaa' }}
                            >
                              {card.rarity}
                            </span>
                            <span
                              className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90"
                              style={{ color: typeColor[card.type] || '#aaa' }}
                            >
                              {card.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 22px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 10px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-image: url('assets/scrollbar-thumb.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          border-radius: 11px;
          box-shadow: none;
          min-height: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          filter: brightness(1.4) contrast(1.2) drop-shadow(0 0 5px rgba(212,165,32,0.5));
          cursor: pointer;
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
