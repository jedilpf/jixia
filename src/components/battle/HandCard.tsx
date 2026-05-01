import { useState, useEffect } from 'react';
import type { Card, CharacterCard } from '@/types';
import { rarityColor, typeColor } from '@/data/showcaseCards';

interface HandCardProps {
  card: Card;
  index: number;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  isPlayable: boolean;
  isEnemy?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  isGhost?: boolean;
  scale: number;
  onPointerDown?: (e: React.PointerEvent, index: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function HandCard({
  card,
  index,
  x,
  y,
  rotation,
  zIndex,
  isPlayable,
  isEnemy = false,
  isSelected = false,
  isDragging = false,
  isGhost = false,
  scale,
  onPointerDown,
  onMouseEnter,
  onMouseLeave,
}: HandCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // 播放编钟音效
  const playBellSound = () => {
    try {
      const audio = new Audio('assets/bell-sound.mp3');
      audio.volume = 0.6;
      audio.play();
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowText(!showText);
    setIsShaking(true);
    playBellSound();
    setTimeout(() => setIsShaking(false), 1500);
  };

  // Use rarity and type colors from showcase definitions
  const rarityBadgeColor = rarityColor[card.rarity] || rarityColor['常见'];
  const cardTypeLabel = card.type === 'character' || card.type === 'skill' ? '\u7acb\u8bba' : '\u7b56\u672f';
  const typeBadgeColor = typeColor[cardTypeLabel] || typeColor['\u7acb\u8bba'];
  const isCharacter = card.type === 'character';

  // Card dimensions (scaled up by ~40%: 140 -> 200, 196 -> 280)
  const W = 200 * scale;
  const H = 280 * scale;
  const fx = (200 / 238) * scale;

  // 完全移除所有光晕/边框阴影——只用抬升动画表达状态
  const glowShadow = 'none';

  // Hover animation logic
  const hoverActive = isHovered && !isDragging && !isEnemy;
  const isPinned = isSelected && !isDragging && !isEnemy;
  const isDetailVisible = showText;

  // Auto-close detail panel when card is no longer hovered
  useEffect(() => {
    if (!hoverActive && !isPinned) {
      setShowText(false);
    }
  }, [hoverActive, isPinned]);

  const computedTransform = isDragging && !isGhost
    ? 'rotate(0deg)'
    : isPinned
      ? `rotate(0deg) scale(1.15) translateY(-${40 * fx}px)` // 缩小幅度，不遮挡其他牌
      : hoverActive
        ? `rotate(0deg) scale(1.2) translateY(-${30 * fx}px)`
        : `rotate(${rotation}deg)`;
  const computedZ = isDragging && !isGhost ? 9999 : isPinned ? 8000 : hoverActive ? 5000 : zIndex;

  if (isEnemy) {
    // Enemy card back with hover feedback
    const enemyHoverActive = isHovered;
    const enemyTransform = enemyHoverActive
      ? `rotate(${rotation}deg) scale(1.1) translateY(-10px)`
      : `rotate(${rotation}deg)`;

    return (
      <div
        onMouseEnter={() => {
          setIsHovered(true);
          onMouseEnter?.();
          import('@/utils/audioManager').then(m => m.uiAudio.playCustomSound('card-hover', 0.6));
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onMouseLeave?.();
        }}
        style={{
          position: 'absolute',
          left: `${x * scale - W / 2}px`,
          top: `${y * scale - H / 2}px`,
          width: `${W}px`,
          height: `${H}px`,
          zIndex: enemyHoverActive ? 5000 : zIndex,
          transform: enemyTransform,
          transformOrigin: 'center bottom',
          borderRadius: `${6 * scale}px`,
          backgroundImage: `url(assets/card-back.png)`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          boxShadow: 'none', // 移除所有阴影/边框感
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s ease-out, z-index 0s',
          cursor: 'default'
        }}
      />
    );
  }

  // Render the robust showcase UI
  return (
    <div
      onPointerDown={e => onPointerDown?.(e, index)}
      onMouseEnter={() => { setIsHovered(true); onMouseEnter?.(); import('@/utils/audioManager').then(m => m.uiAudio.playCustomSound('card-hover', 0.8)); }}
      onMouseLeave={() => { setIsHovered(false); onMouseLeave?.(); }}
      style={{
        position: 'absolute',
        left: `${x * scale - W / 2}px`,
        top: `${y * scale - H}px`,
        width: `${W}px`,
        height: `${H}px`,
        zIndex: computedZ,
        transform: computedTransform,
        transformOrigin: 'center bottom',
        borderRadius: `${6 * fx}px`,
        boxShadow: glowShadow,
        cursor: isPlayable ? 'grab' : 'default',
        transition: isDragging ? 'none' : 'box-shadow 0.2s, border-color 0.2s, transform 0.2s ease-out, z-index 0s',
        display: 'flex', flexDirection: 'column',
        userSelect: 'none',
        opacity: isDragging && !isGhost ? 0 : 1,
      }}
    >
      {/* 背景原画 */}
      <div
        className="absolute z-0 bg-transparent flex items-center justify-center bg-[#1a1107]"
        style={{
          inset: `${8 * fx}px`,
          borderRadius: `${6 * fx}px`,
          overflow: 'hidden'
        }}
      >
        <div
          className="w-[90%] h-[90%]"
          style={{
            backgroundImage: `url(assets/cards/${card.id.split('_').pop()}.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
      </div>

      {/* 边框贴图叠加层 */}
      <div
        className="absolute inset-0 bg-no-repeat z-10 pointer-events-none"
        style={{
          backgroundImage: `url(assets/card-frame.png)`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center'
        }}
      />

      {/* 顶部中央卡牌名称 (画卷标题位置) */}
      <div
        className="absolute z-20 flex justify-center text-[#1a1107] font-serif font-black tracking-[0.2em] pointer-events-none"
        style={{
          top: `${18 * fx}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: `${18 * fx}px`,
          textShadow: '0 1px 1px rgba(255, 255, 255, 0.4)',
          width: '50%',
          textAlign: 'center'
        }}
      >
        {card.name}
      </div>

      {/* 顶部高光和可打出过效遮罩层已移除，保持画卷纯净 */}

      {/* 费用徽章 */}
      <div className="absolute z-30 flex flex-col items-center justify-center rounded-full"
        style={{
          top: `${14 * fx}px`,
          left: `${12 * fx}px`,
          width: `${34 * fx}px`,
          height: `${34 * fx}px`
        }}
      >
        <img src="assets/cost.png" alt="cost" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        <span className="relative z-10 font-bold text-[#f5e6b8] leading-none"
          style={{ fontSize: `${15 * fx}px`, textShadow: '0 1px 3px rgba(0,0,0,0.9)', marginBottom: `${1 * fx}px` }}>
          {card.cost}
        </span>
      </div>

      {/* 角色牌：生命/攻击 */}
      {isCharacter && (
        <div className="absolute z-30 flex flex-col items-center gap-0.5"
          style={{ top: `${14 * fx}px`, right: `${12 * fx}px`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
          {/* 生命 */}
          <div className="flex flex-col items-center justify-center relative"
            style={{ width: `${36 * fx}px`, height: `${36 * fx}px` }}>
            <img src="assets/hp.png" alt="hp" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            <span className="relative z-10 font-bold text-white leading-none mt-1"
              style={{ fontSize: `${15 * fx}px`, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              {(card as CharacterCard).hp ?? 0}
            </span>
          </div>
          {/* 攻击 */}
          <div className="flex flex-col items-center justify-center relative"
            style={{ width: `${46 * fx}px`, height: `${46 * fx}px` }}>
            <img src="assets/attack.png" alt="attack" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            <span className="relative z-10 font-bold text-white leading-none mt-1"
              style={{ fontSize: `${20 * fx}px`, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              {(card as CharacterCard).atk ?? 0}
            </span>
          </div>
        </div>
      )}

      {/* 1:1 卡牌描述遮罩层 (悬停时展示) */}
      <div
        className="absolute z-30 flex flex-col transition-all duration-300 ease-out overflow-hidden"
        style={{
          bottom: `${18 * fx}px`, // 压缩底部间距，为大高度腾出空间
          left: `${16 * fx}px`,
          right: `${16 * fx}px`,
          height: isDetailVisible ? '84%' : '0%', // 增加到约 1.2 倍 (70% * 1.2 = 84%)
          opacity: isDetailVisible ? 1 : 0,
          pointerEvents: isDetailVisible ? 'auto' : 'none',
        }}
      >
        <div className="absolute inset-0 drop-shadow-2xl" style={{ backgroundImage: `url(assets/text-bg.png)`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />

        <div className="relative z-10 flex flex-col custom-scrollbar font-serif h-full overflow-y-auto"
          style={{
            padding: `${20 * fx}px ${24 * fx}px ${20 * fx}px ${24 * fx}px`, // 缩小垂直内边距以适应更小的视口
            gap: `${8 * fx}px`
          }}>

          <div className="flex items-start justify-between border-stone-800/30 relative"
            style={{ borderBottomWidth: '1px', paddingBottom: `${10 * fx}px`, flexShrink: 0 }}>
            <div className="flex flex-col" style={{ gap: `${4 * fx}px` }}>
              <h3 className="font-bold text-stone-900 tracking-widest leading-none" style={{ fontSize: `${18 * fx}px` }}>{card.name}</h3>
              <span className="font-bold tracking-wider drop-shadow-sm leading-none" style={{ color: rarityBadgeColor, textShadow: '0 1px 2px rgba(0,0,0,0.4)', fontSize: `${11 * fx}px` }}>
                稀有度：{card.rarity}
              </span>
            </div>
            <span className="font-bold rounded-sm transform rotate-[-2deg] shadow-sm text-white border leading-none"
              style={{
                backgroundColor: typeBadgeColor,
                borderColor: typeBadgeColor,
                fontSize: `${11 * fx}px`,
                padding: `${4 * fx}px ${8 * fx}px`,
                marginTop: `${4 * fx}px`
              }}>
              {cardTypeLabel}
            </span>
            <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-stone-800/30 to-transparent" />
          </div>

          {isCharacter && (
            <div className="flex font-bold" style={{ gap: `${16 * fx}px`, fontSize: `${11 * fx}px`, flexShrink: 0 }}>
              <span className="text-red-900">⚔ 攻击 {(card as CharacterCard).atk ?? 0}</span>
              <span className="text-green-900">♥ 生命 {(card as CharacterCard).hp ?? 0}</span>
              <span className="text-stone-800">◆ 费用 {card.cost}</span>
            </div>
          )}

          <p className="text-stone-800 italic border-stone-800/40"
            style={{
              fontSize: `${12 * fx}px`,
              lineHeight: 1.6,
              paddingLeft: `${12 * fx}px`,
              borderLeftWidth: `${2 * fx}px`,
              flexShrink: 0
            }}>
            "{card.background}"
          </p>

          <div className="text-stone-900 font-medium"
            style={{ fontSize: `${13 * fx}px`, lineHeight: `${24 * fx}px`, flexShrink: 0 }}>
            <span className="font-bold text-white bg-[#8a3324]/90 rounded shadow-sm border border-[#8a3324]"
              style={{
                padding: `${2 * fx}px ${4 * fx}px`,
                marginRight: `${4 * fx}px`,
                fontSize: `${11 * fx}px`
              }}>
              {cardTypeLabel}效果：
            </span>
            {card.skillDesc}
          </div>

          <div className="flex justify-start text-stone-700 border-stone-800/20"
            style={{
              marginTop: 'auto',
              paddingTop: `${8 * fx}px`,
              borderTopWidth: '1px',
              fontSize: `${11 * fx}px`,
              flexShrink: 0
            }}>
            <span>门派：<span className="font-bold text-stone-900">{card.faction}</span></span>
          </div>
        </div>
      </div>

      {/* 编钟按钮 */}
      <button
        onClick={handleToggle}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute cursor-pointer transition-transform duration-300 hover:scale-110 flex items-center justify-center p-1"
        style={{
          width: `${44 * fx}px`,
          height: `${44 * fx}px`,
          bottom: `${16 * fx}px`,
          right: `${16 * fx}px`,
          zIndex: 40
        }}
      >
        <img
          src="assets/bell.png"
          alt="查看详情"
          className={`w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isShaking ? 'animate-ring' : ''}`}
        />
      </button>

      <style>{`
        @keyframes hand-card-playable {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-8deg); }
          40% { transform: rotate(6deg); }
          60% { transform: rotate(-4deg); }
          80% { transform: rotate(2deg); }
        }
        .animate-ring { animation: ring 1.5s ease-in-out; transform-origin: top center; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 2px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.2) transparent; }
      `}</style>
    </div>
  );
}
