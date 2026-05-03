import React, { useState } from 'react';
import { getCardTierLabel, getCardTierBars } from '@/battleV2/tierSystem';
import { CARDS, rarityColor, typeColor } from '@/data/cardsSource';
import { uiAudio } from '@/utils/audioManager';
import { getAssetUrl, getCardImageUrl } from '@/utils/assets';
import { ArtisticWillText } from './ArtisticWillText';

// 门派符号映射
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
// 饱和度控制在 25%-40%，保持低饱和高级感，通过色相冷暖区分门派气质
const FACTION_COLORS: Record<string, string> = {
  '礼心殿': '#b8954a',  // 暖金 — 礼仪之庄重
  '衡戒廷': '#a85c5c',  // 暗赤 — 律法之威严（低饱和红）
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

interface CardDetailProps {
  currentIndex: number;
  onBack: () => void;
  onNavigate: (dir: 'prev' | 'next' | 'index', index?: number) => void;
  slideDir: 'left' | 'right' | null;
}

export function CardDetail({ currentIndex, onBack, onNavigate, slideDir }: CardDetailProps) {
  const [showText, setShowText] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const activeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (activeRef.current && scrollContainerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentIndex]);

  const card = CARDS[currentIndex];
  const rarityBadgeColor = rarityColor[card.rarity] || '#9ca3af';
  const typeBadgeColor = typeColor[card.type] || '#374151';
  const isCharacter = card.attack !== undefined || card.hp !== undefined;
  const cardImageUrl = getCardImageUrl(card.id, card.name);
  const tierLabel = getCardTierLabel(card);
  const tierBars = getCardTierBars(card.rarity);
  const ruleText = (card as any).ruleText ?? card.skill ?? '';
  const flavorText = card.background ?? (card as any).flavorText ?? '';

  const playBellSound = () => {
    try {
      const audio = new Audio(getAssetUrl('assets/bell-sound.mp3'));
      audio.volume = 0.6;
      void audio.play();
    } catch (error) {
      console.warn('音效播放失败:', error);
    }
  };

  const handleToggle = () => {
    setShowText(!showText);
    setIsShaking(true);
    playBellSound();
    setTimeout(() => setIsShaking(false), 1500);
  };

  const handleNav = (dir: 'prev' | 'next') => {
    uiAudio.playClick();
    setShowText(false);
    onNavigate(dir);
  };

  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center bg-[#0a0f18] relative overflow-hidden select-none">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d4a520]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[rgba(160,60,220,0.1)] rounded-full blur-[120px]" />
      </div>

      {/* 返回按钮 - 左上角 */}
      <button
        onClick={() => {
          uiAudio.playClick();
          onBack();
        }}
        onMouseEnter={() => uiAudio.playHover()}
        className="absolute top-6 left-6 z-50 px-6 py-2 bg-black/40 border border-[#d4a520]/40 text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 rounded-full transition-all tracking-widest flex items-center gap-2"
      >
        <span>❮</span>
        返回列表
      </button>

      {/* 门派名称 - 绝对居中 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-serif font-bold"
          style={{
            borderColor: FACTION_COLORS[card.faction] || '#d4a520',
            color: FACTION_COLORS[card.faction] || '#d4a520',
            textShadow: `0 0 10px ${FACTION_COLORS[card.faction] || '#d4a520'}40`,
          }}
        >
          {FACTION_SYMBOLS[card.faction] || card.faction[0]}
        </div>
        <span
          className="text-2xl font-serif font-bold tracking-[0.3em]"
          style={{
            color: FACTION_COLORS[card.faction] || '#d4a520',
            textShadow: `0 0 20px ${FACTION_COLORS[card.faction] || '#d4a520'}60`,
          }}
        >
          {card.faction}
        </span>
      </div>

      {/* 页码 - 右上角 */}
      <div className="absolute top-6 right-6 z-50 text-[#d4a520]/60 text-sm font-serif tracking-widest">
        {currentIndex + 1} / {CARDS.length}
      </div>

      <button
        onClick={() => handleNav('prev')}
        onMouseEnter={() => uiAudio.playHover()}
        className="absolute left-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 border border-[#d4a520]/30 text-[#d4a520] hover:bg-black/60 hover:border-[#d4a520]/70 transition-all text-2xl font-light"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        ‹
      </button>

      <button
        onClick={() => handleNav('next')}
        onMouseEnter={() => uiAudio.playHover()}
        className="absolute right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 border border-[#d4a520]/30 text-[#d4a520] hover:bg-black/60 hover:border-[#d4a520]/70 transition-all text-2xl font-light"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        ›
      </button>

      <div className="flex items-center gap-16">
        {/* 左侧：卡牌 */}
        <div
          className="relative w-[360px] h-[540px] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-visible group flex-shrink-0"
          style={{
            transition: 'opacity 0.2s, transform 0.2s',
            opacity: slideDir ? 0 : 1,
            transform:
              slideDir === 'left'
                ? 'translateX(-30px)'
                : slideDir === 'right'
                  ? 'translateX(30px)'
                  : 'translateX(0)',
          }}
        >
        <div className="absolute inset-[16px] rounded-lg overflow-hidden z-0 box-border bg-[#1a1107] flex items-center justify-center bg-transparent">
          <div
            className="w-[90%] h-[90%]"
            style={{
              backgroundImage: `url(${cardImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        <div
          className="absolute inset-0 bg-no-repeat z-10 pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          style={{
            backgroundImage: `url(${getAssetUrl('assets/card-frame.png')})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
        />

        <div
          className="absolute top-[18px] left-1/2 -translate-x-1/2 z-20 flex justify-center text-[#1a1107] font-serif font-black tracking-[0.2em] pointer-events-none"
          style={{
            fontSize: '18px',
            textShadow: '0 1px 1px rgba(255, 255, 255, 0.4)',
            width: '50%',
            textAlign: 'center',
          }}
        >
          {card.name}
        </div>

        {/* 费用显示（底蕴）- 左上角 */}
        <div className="absolute top-6 left-5 z-30 w-[54px] h-[54px] flex flex-col items-center justify-center rounded-full cursor-pointer transition-transform duration-300 hover:scale-125 hover:drop-shadow-[0_0_12px_rgba(212,165,32,0.8)]">
          <img
            src={getAssetUrl('assets/cost.png')}
            alt="cost"
            className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
          />
          <span
            className="relative z-10 text-[20px] font-bold text-[#f5e6b8] leading-tight tracking-[0.08em] text-center"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(212,165,32,0.6)' }}
          >
            {card.cost}
          </span>
        </div>

        {isCharacter && (
          <div
            className="absolute top-6 right-5 z-30 flex flex-col items-center gap-1"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
          >
            <div className="w-[60px] h-[60px] flex flex-col items-center justify-center relative cursor-pointer transition-transform duration-300 hover:scale-125 hover:drop-shadow-[0_0_12px_rgba(0,255,0,0.6)]">
              <img
                src={getAssetUrl('assets/hp.png')}
                alt="hp"
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
              <span
                className="relative z-10 text-[24px] font-bold text-white leading-none mt-1"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
              >
                {card.hp ?? 0}
              </span>
            </div>
            <div className="w-[78px] h-[78px] flex flex-col items-center justify-center relative cursor-pointer transition-transform duration-300 hover:scale-125 hover:drop-shadow-[0_0_12px_rgba(255,50,50,0.6)]">
              <img
                src={getAssetUrl('assets/attack.png')}
                alt="attack"
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
              <span
                className="relative z-10 text-[32px] font-bold text-white leading-none mt-1"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
              >
                {card.attack ?? 0}
              </span>
            </div>
          </div>
        )}

        {/* 策术卡牌不在右上角显示属性徽章 */}

        <div
          className="absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none rounded-lg"
          style={{ boxShadow: showText ? '0 0 80px rgba(196,113,237,0.4)' : '0 0 0px transparent' }}
        />

        <div
          className="absolute bottom-[12px] left-[12px] right-[12px] z-30 flex flex-col justify-end transition-all duration-500 ease-out overflow-hidden"
          style={{ height: showText ? '72%' : '0%', opacity: showText ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 pointer-events-none drop-shadow-2xl"
            style={{
              backgroundImage: `url(${getAssetUrl('assets/text-bg.png')})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="relative z-10 px-16 pt-14 pb-20 flex flex-col gap-2.5 h-full overflow-y-auto custom-scrollbar font-serif">
            <div className="flex items-start justify-between border-b pb-2.5 border-stone-800/30 relative">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-stone-900 tracking-widest">{card.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[11px] font-bold tracking-wider drop-shadow-sm"
                    style={{ color: rarityBadgeColor, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                  >
                    稀有度：{card.rarity}
                  </span>
                  {/* 等级用杠数显示 */}
                  <span 
                    className="text-[14px] font-bold tracking-wider"
                    style={{ color: rarityBadgeColor, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                    title={tierLabel}
                  >
                    {tierBars}
                  </span>
                </div>
              </div>
              <span
                className="text-[11px] font-bold px-2 py-1 rounded-sm transform rotate-[-2deg] shadow-sm mt-1 text-white border"
                style={{ backgroundColor: typeBadgeColor, borderColor: typeBadgeColor }}
              >
                {card.type}
              </span>
              <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-stone-800/30 to-transparent" />
            </div>

            {isCharacter && (
              <div className="flex gap-4 text-[11px] font-bold">
                <span className="text-red-900">⚔ 辩才 {card.attack ?? 0}</span>
                <span className="text-green-900">♥ 底蕴 {card.hp ?? 0}</span>
                <span className="text-stone-800">◆ 学识 {card.cost}</span>
              </div>
            )}

            {ruleText && (
              <div className="text-[16px] text-stone-900 leading-8 font-medium">
                {ruleText}
              </div>
            )}

            {/* 门派信息已移至顶部导航栏 */}
          </div>
        </div>

        <button
          onClick={handleToggle}
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110 flex items-center justify-center p-1"
          style={{ width: '88px', height: '88px', bottom: '32px', right: '32px', zIndex: 40 }}
        >
          <img
            src={getAssetUrl('assets/bell.png')}
            alt="查看详情"
            className={`w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isShaking ? 'animate-ring' : ''}`}
          />
        </button>
        </div>

        {/* 右侧：意志描述 */}
        {flavorText && (
          <div className="w-[380px] flex flex-col items-center">
            {/* 顶部细线 */}
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4a520]/50 to-transparent mb-10" />

            {/* 意志文字 - 艺术化 */}
            <div
              className="text-[#e8d5a3] text-2xl leading-[2.2] tracking-[0.1em] text-center px-4"
              style={{
                textShadow: '0 0 20px rgba(212, 165, 32, 0.15)',
              }}
            >
              <ArtisticWillText text={flavorText} cardId={card.id} />
            </div>

            {/* 底部细线 */}
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4a520]/50 to-transparent mt-10" />
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-5xl overflow-x-auto flex items-center gap-3 z-50 px-4 py-2 custom-scrollbar"
        style={{ whiteSpace: 'nowrap' }}
      >
        {CARDS.map((entry, index) => {
          const isSelected = index === currentIndex;
          return (
            <button
              key={entry.id}
              ref={isSelected ? activeRef : null}
              onClick={() => {
                uiAudio.playClick();
                onNavigate('index', index);
              }}
              onMouseEnter={() => uiAudio.playHover()}
              className={`flex flex-shrink-0 items-center justify-center transition-all duration-300 rounded ${
                isSelected
                  ? 'w-auto px-4 py-1.5 bg-[#d4a520] border-2 border-[#f5e6b8] shadow-[0_0_15px_rgba(212,165,32,0.8)]'
                  : 'w-10 h-10 bg-black/50 border border-[#d4a520]/30 hover:border-[#d4a520]/80 hover:scale-110 opacity-60 hover:opacity-100 overflow-hidden'
              }`}
            >
              {isSelected ? (
                <span className="text-[#1a1107] font-serif font-bold tracking-widest text-sm whitespace-nowrap">
                  {entry.name}
                </span>
              ) : (
                <img
                  src={getCardImageUrl(entry.id, entry.name)}
                  alt={entry.name}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes ring {
          0%,
          100% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          40% {
            transform: rotate(6deg);
          }
          60% {
            transform: rotate(-4deg);
          }
          80% {
            transform: rotate(2deg);
          }
        }
        .animate-ring {
          animation: ring 1.5s ease-in-out;
          transform-origin: top center;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 165, 32, 0.4);
          border-radius: 2px;
          border: none;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 165, 32, 0.7);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 165, 32, 0.4) rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
