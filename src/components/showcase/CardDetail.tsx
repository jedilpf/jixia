import React, { useState } from 'react';
import { getCardTierLabel } from '@/battleV2/tierSystem';
import { CARDS, rarityColor, typeColor } from '@/data/cardsSource';
import { uiAudio } from '@/utils/audioManager';
import { getAssetUrl, getCardImageUrl } from '@/utils/assets';

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

      <div
        className="relative w-[360px] h-[540px] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-visible group"
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

        <div className="absolute top-6 left-5 z-30 w-[54px] h-[54px] flex flex-col items-center justify-center rounded-full cursor-pointer transition-transform duration-300 hover:scale-125 hover:drop-shadow-[0_0_12px_rgba(212,165,32,0.8)]">
          <img
            src={getAssetUrl('assets/cost.png')}
            alt="tier"
            className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
          />
          <span
            className="relative z-10 text-[12px] font-bold text-[#f5e6b8] leading-tight tracking-[0.08em] text-center"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(212,165,32,0.6)' }}
          >
            {tierLabel}
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

        {!isCharacter && card.shield !== undefined && (
          <div
            className="absolute top-6 right-5 z-30 flex flex-col items-center gap-1"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
          >
            <div className="w-[60px] h-[60px] flex flex-col items-center justify-center relative">
              <img
                src={getAssetUrl('assets/shield.png')}
                alt="shield"
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
              <span
                className="relative z-10 text-[24px] font-bold text-white leading-none mt-1"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
              >
                {card.shield}
              </span>
            </div>
          </div>
        )}

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
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a520]/15 border border-[#d4a520]/40 text-[#8a5a00]">
                    {tierLabel}
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
              <div className="text-[13px] text-stone-900 leading-7 font-medium">
                <span className="font-bold text-white bg-[#8a3324]/90 px-1 py-0.5 rounded shadow-sm mr-1 border border-[#8a3324] text-[11px]">
                  规则：
                </span>
                {ruleText}
              </div>
            )}

            {flavorText && (
              <p className="text-[12px] text-stone-800 leading-relaxed italic pl-3 border-l-2 border-stone-800/40">
                "{flavorText}"
              </p>
            )}

            <div className="mt-auto pt-2 flex justify-start text-[11px] text-stone-700 border-t border-stone-800/20">
              <span>
                门派：<span className="font-bold text-stone-900">{card.faction}</span>
              </span>
            </div>
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
