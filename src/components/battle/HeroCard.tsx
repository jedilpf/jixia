import type { Hero, WeaponInstance } from '@/types';

interface HeroCardProps {
  hero: Hero;
  isEnemy?: boolean;
  isSelected?: boolean;
  canBeAttacked?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function HeroCard({
  hero,
  isEnemy = false,
  isSelected = false,
  canBeAttacked = false,
  onClick,
  style,
}: HeroCardProps) {
  const isLow = hero.hp <= 10;
  const isCritical = hero.hp <= 5;

  const borderColor = isSelected
    ? 'rgba(255,255,255,0.4)'
    : canBeAttacked
      ? 'rgba(239,68,68,0.3)'
      : isEnemy
        ? 'rgba(180,60,60,0.3)'
        : 'rgba(139,115,85,0.4)';

  const boxShadow = isSelected
    ? '0 8px 32px rgba(255,255,255,0.2)'
    : canBeAttacked
      ? '0 4px 16px rgba(239,68,68,0.2)'
      : isCritical
        ? '0 0 16px rgba(239,68,68,0.3)'
        : '0 4px 16px rgba(0,0,0,0.4)';

  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: canBeAttacked ? 'crosshair' : onClick ? 'pointer' : 'default',
        borderRadius: '10px',
        border: `2px solid ${borderColor}`,
        background: isEnemy
          ? 'linear-gradient(160deg, #1e0808 0%, #120505 100%)'
          : 'linear-gradient(160deg, #1a1408 0%, #0f0c05 100%)',
        boxShadow,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        ...style,
      }}
    >
      {/* 顶部高光 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* 英雄头像 */}
      <div style={{
        fontSize: 'clamp(28px, 5vh, 48px)',
        lineHeight: 1,
        filter: isCritical ? 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' : 'none',
        animation: isCritical ? 'hero-critical 0.8s ease-in-out infinite' : 'none',
      }}>
        {isEnemy ? '👿' : '🎓'}
      </div>

      {/* HP 显示 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '8px', padding: '4px 12px',
        marginTop: '4px',
      }}>
        <span style={{ color: '#6ee7b7', fontSize: '14px' }}>❤</span>
        <span style={{
          color: isCritical ? '#ef4444' : isLow ? '#f97316' : '#6ee7b7',
          fontWeight: 900,
          fontSize: 'clamp(20px, 3.5vh, 28px)',
          textShadow: isCritical ? '0 0 12px rgba(239,68,68,0.9)' : '0 0 10px rgba(110,231,183,0.5)',
          animation: isCritical ? 'hero-critical 0.8s ease-in-out infinite' : 'none',
        }}>
          {hero.hp}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/{hero.maxHp}</span>
      </div>

      {/* 护甲 */}
      {hero.armor > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          background: 'rgba(100,140,200,0.2)',
          borderRadius: '4px', padding: '1px 6px',
        }}>
          <span style={{ color: '#93c5fd', fontSize: '9px' }}>🛡</span>
          <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: 'clamp(11px, 2vh, 15px)' }}>
            {hero.armor}
          </span>
        </div>
      )}

      {/* 武器显示 */}
      {hero.weapon && (
        <WeaponBadge weapon={hero.weapon} />
      )}

      {/* HP 条 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: 'rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: `${Math.max(0, (hero.hp / hero.maxHp) * 100)}%`,
          height: '100%',
          background: isCritical
            ? 'linear-gradient(90deg, #dc2626, #ef4444)'
            : isLow
              ? 'linear-gradient(90deg, #ea580c, #f97316)'
              : 'linear-gradient(90deg, #059669, #10b981)',
          transition: 'width 0.4s, background 0.3s',
        }} />
      </div>

      {/* 可被攻击指示已通过边框和阴影表达 */}

      <style>{`
        @keyframes hero-critical {
          0%,100% { opacity:1; }
          50% { opacity:0.6; }
        }
        @keyframes target-pulse {
          0%,100% { opacity:0.5; transform: scale(1); }
          50% { opacity:1; transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

function WeaponBadge({ weapon }: { weapon: WeaponInstance }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '3px',
      background: 'rgba(180, 100, 0, 0.3)',
      borderRadius: '4px', padding: '1px 6px',
      border: '1px solid rgba(220,120,0,0.4)',
    }}>
      <span style={{ fontSize: '9px' }}>⚔</span>
      <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 'clamp(10px,1.8vh,13px)' }}>
        {weapon.atk}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>|</span>
      <span style={{ color: '#fb923c', fontWeight: 700, fontSize: 'clamp(10px,1.8vh,13px)' }}>
        {weapon.durability}
      </span>
    </div>
  );
}
