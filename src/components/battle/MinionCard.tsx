import type { CharacterInstance } from '@/types';
import { rarityColor as showcaseRarityColor } from '@/data/showcaseCards';

interface MinionCardProps {
  minion: CharacterInstance;
  isEnemy?: boolean;
  canAttack?: boolean;
  isSelected?: boolean;
  isAttacking?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  style?: React.CSSProperties;
}

export function MinionCard({
  minion,
  isEnemy = false,
  canAttack = false,
  isSelected = false,
  isAttacking = false,
  onClick,
  onPointerDown,
  style,
}: MinionCardProps) {
  const rarity = minion.rarity ?? '常见';
  const rarityColor = showcaseRarityColor[rarity] || showcaseRarityColor['常见'];
  const isLow = minion.hp <= minion.maxHp * 0.35;

  // 边框颜色：保持通透感，仅用微弱的阴影或轻微抬升表达状态
  const borderColor = isSelected
    ? 'rgba(255,255,255,0.4)'
    : canAttack
      ? 'rgba(232, 93, 4, 0.3)'
      : minion.isExhausted
        ? 'rgba(0,0,0,0.2)'
        : 'rgba(255,255,255,0.1)';

  const boxShadow = isSelected
    ? '0 8px 24px rgba(0,0,0,0.4)'
    : canAttack
      ? '0 4px 12px rgba(232, 93, 4, 0.2)'
      : '0 4px 12px rgba(0,0,0,0.3)';

  // 提取原始卡牌的图片 ID
  const imageId = minion.cardId.startsWith('deck_') ? minion.cardId.split('_').pop() : minion.cardId;

  return (
    <div
      onClick={onClick}
      onPointerDown={onPointerDown}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: canAttack && !isEnemy ? 'grab' : 'default',
        userSelect: 'none',
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        boxShadow,
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
        transform: isAttacking ? 'scale(1.08)' : 'scale(1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* 底部全画幅原图 */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(assets/cards/${imageId}.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        opacity: 0.85,
        zIndex: 0
      }} />

      {/* 渐变遮罩，使底部文字和血条清晰可见 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 100%)',
        zIndex: 1
      }} />

      {/* 金属光泽顶部高光 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* 稀有度色条（顶部） */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)`,
        zIndex: 2
      }} />

      {/* 嘲讽标记 */}
      {minion.hasTaunt && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          background: 'rgba(180,130,0,0.9)', borderRadius: '3px',
          fontSize: '8px', color: '#fff', padding: '1px 4px', fontWeight: 700,
          letterSpacing: '0.5px',
          zIndex: 2
        }}>
          嘲讽
        </div>
      )}

      {/* 疲劳蒙层 */}
      {minion.isExhausted && !isEnemy && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>
          ⏳
        </div>
      )}

      {/* 可攻击指示已弱化为边框和阴影，移除多余脉冲环 */}

      {/* 占位，把文字内容挤到底部 */}
      <div style={{ flex: 1, minHeight: 0 }} />

      {/* 名称 */}
      <div style={{
        color: '#f4e8cc',
        fontSize: 'clamp(9px, 1.8vh, 13px)',
        fontWeight: 700,
        fontFamily: 'serif',
        textAlign: 'center',
        letterSpacing: '0.5px',
        padding: '0 4px',
        lineHeight: 1.2,
        textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)',
        zIndex: 2,
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {minion.name}
      </div>

      {/* 攻击力 / 血量数字 */}
      <div style={{
        display: 'flex', gap: '8px',
        alignItems: 'center', zIndex: 2, marginTop: '2px', marginBottom: '2px'
      }}>
        {/* 攻击力 */}
        <div className="relative flex flex-col items-center justify-center w-[1.8vw] min-w-[20px] max-w-[28px] aspect-square">
          <img src="assets/attack.png" alt="attack" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          <span className="relative z-10 font-bold text-white leading-none mt-[10%]"
            style={{ fontSize: 'clamp(10px, 1.5vw, 16px)', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            {minion.atk}
          </span>
        </div>
        {/* 血量 */}
        <div className="relative flex flex-col items-center justify-center w-[1.4vw] min-w-[16px] max-w-[22px] aspect-square mt-[2px]">
          <img src="assets/hp.png" alt="hp" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          <span className="relative z-10 font-bold text-white leading-none mt-[10%]"
            style={{ fontSize: 'clamp(10px, 1.2vw, 14px)', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            {minion.hp}
          </span>
        </div>
      </div>

      {/* HP 条 */}
      <div style={{
        width: '90%', height: '4px',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: '2px',
        overflow: 'hidden', zIndex: 2,
        marginBottom: '6px'
      }}>
        <div style={{
          width: `${Math.max(0, (minion.hp / minion.maxHp) * 100)}%`,
          height: '100%',
          background: isLow
            ? 'linear-gradient(90deg, #ef4444, #f97316)'
            : 'linear-gradient(90deg, #10b981, #6ee7b7)',
          transition: 'width 0.3s',
          borderRadius: '1px',
        }} />
      </div>

      {/* 底部铜纹装饰 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${rarityColor}55, transparent)`,
        zIndex: 2
      }} />

      <style>{`
        @keyframes minion-glow {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
