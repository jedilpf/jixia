import React from 'react';
import type { Hero, PlayerId } from '../../../../types/domain';
import { useGameStore } from '../../../../stores/gameStore';

interface HeroCardProps {
  hero: Hero;
  side: PlayerId;
  x: number;
  y: number;
}

/**
 * HeroCard - 英雄卡牌组件
 * 
 * 职责：
 * - 渲染英雄头像和状态
 * - 显示生命值、护甲
 * - 处理英雄技能交互
 */
export const HeroCard: React.FC<HeroCardProps> = ({
  hero,
  side,
  x,
  y,
}) => {
  const isPlayerTurn = useGameStore(state => state.isPlayerTurn);
  const useHeroPower = useGameStore(state => state.useHeroPower);
  
  const isEnemy = side === 'enemy';
  const canUsePower = !isEnemy && 
    isPlayerTurn && 
    !hero.heroPower.usedThisTurn;

  // 计算生命值百分比
  const hpPercent = (hero.hp / hero.maxHp) * 100;
  const hpColor = hpPercent > 50 ? '#228B22' : hpPercent > 25 ? '#d4af37' : '#c41e3a';

  return (
    <div
      className="hero-card"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 180,
        height: 220,
        pointerEvents: 'auto',
      }}
    >
      {/* 英雄头像框 */}
      <div
        style={{
          width: '100%',
          height: 160,
          backgroundColor: '#2a2a3e',
          border: '3px solid #d4af37',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* 英雄头像 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            backgroundColor: '#1a1a2e',
          }}
        >
          {isEnemy ? '👹' : '👤'}
        </div>

        {/* 生命值显示 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: '#333',
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: '100%',
              backgroundColor: hpColor,
              transition: 'all 0.3s ease',
            }}
          />
        </div>

        {/* 护盾显示 */}
        {hero.buffs.huchi > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#4a90d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 14,
              color: '#fff',
              border: '2px solid #fff',
            }}
          >
            {hero.buffs.huchi}
          </div>
        )}
      </div>

      {/* 英雄名称 */}
      <div
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#d4af37',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
        }}
      >
        {hero.name}
      </div>

      {/* 生命值数字 */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: hpColor,
          marginTop: 4,
        }}
      >
        {hero.hp} / {hero.maxHp}
      </div>

      {/* 英雄技能按钮 (仅我方显示) */}
      {!isEnemy && (
        <button
          onClick={() => canUsePower && useHeroPower()}
          style={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: `3px solid ${canUsePower ? '#d4af37' : '#666'}`,
            backgroundColor: canUsePower ? '#2a2a3e' : '#1a1a2e',
            color: canUsePower ? '#d4af37' : '#666',
            fontSize: 20,
            cursor: canUsePower ? 'pointer' : 'not-allowed',
            opacity: canUsePower ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.2s ease',
          }}
          disabled={!canUsePower}
          title={hero.heroPower.description}
        >
          ⚡
        </button>
      )}

      {/* 武器显示 */}
      {hero.weapon && (
        <div
          style={{
            position: 'absolute',
            left: -30,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 60,
            backgroundColor: '#4a3728',
            border: '2px solid #d4af37',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#d4af37',
          }}
        >
          <span>⚔️</span>
          <span>{hero.weapon.atk}</span>
        </div>
      )}
    </div>
  );
};

export default HeroCard;
