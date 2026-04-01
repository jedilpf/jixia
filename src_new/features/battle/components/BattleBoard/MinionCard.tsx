import React from 'react';
import type { CharacterInstance, Position, PlayerId } from '../../../../types/domain';
import { useGameStore } from '../../../../stores/gameStore';

interface MinionCardProps {
  minion: CharacterInstance;
  position: Position;
  side: PlayerId;
}

/**
 * MinionCard - 随从卡牌组件
 * 
 * 职责：
 * - 渲染战场上的随从
 * - 显示攻击力、生命值
 * - 处理点击选择
 */
export const MinionCard: React.FC<MinionCardProps> = ({
  minion,
  position,
  side,
}) => {
  const selectMinion = useGameStore(state => state.selectMinion);
  const selection = useGameStore(state => state.selection);
  const isPlayerTurn = useGameStore(state => state.isPlayerTurn);

  const isSelected = 
    selection.type === 'minion' && 
    selection.minionPos?.row === position.row &&
    selection.minionPos?.col === position.col;

  const canAttack = minion.canAttack && !minion.hasAttacked && !minion.isExhausted;
  const isEnemy = side === 'enemy';

  const handleClick = () => {
    if (side === 'player' && isPlayerTurn && canAttack) {
      selectMinion(position);
    }
  };

  // 根据稀有度获取边框颜色
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      '常见': '#888',
      '稀有': '#4169E1',
      '史诗': '#9932CC',
      '传说': '#FFD700',
    };
    return colors[rarity] || '#888';
  };

  return (
    <div
      className={`minion-card ${isSelected ? 'selected' : ''} ${canAttack ? 'can-attack' : ''}`}
      style={{
        width: 140,
        height: 180,
        position: 'relative',
        cursor: side === 'player' && canAttack ? 'pointer' : 'default',
        pointerEvents: 'auto',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
      onClick={handleClick}
    >
      {/* 卡牌背景 */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#2a2a3e',
          border: `3px solid ${isSelected ? '#4a90d9' : getRarityColor(minion.rarity)}`,
          borderRadius: 12,
          boxShadow: isSelected
            ? '0 0 20px rgba(74, 144, 217, 0.8)'
            : '0 4px 12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 名称 */}
        <div
          style={{
            padding: '6px 8px',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {minion.name}
        </div>

        {/* 图片区域 */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
          }}
        >
          {getMinionIcon(minion.name)}
        </div>

        {/* 状态图标 */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            right: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {minion.hasTaunt && (
            <span style={styles.badge} title="嘲讽">🛡️</span>
          )}
          {minion.hasCharge && (
            <span style={styles.badge} title="冲锋">⚡</span>
          )}
          {minion.isExhausted && (
            <span style={styles.badge} title="疲惫">😴</span>
          )}
        </div>

        {/* 攻击力和生命值 */}
        <div style={styles.stats}>
          {/* 攻击力 */}
          <div
            style={{
              ...styles.stat,
              backgroundColor: canAttack ? '#d4af37' : '#666',
            }}
          >
            {minion.atk}
          </div>

          {/* 生命值 */}
          <div
            style={{
              ...styles.stat,
              backgroundColor: minion.hp < minion.maxHp ? '#c41e3a' : '#228B22',
            }}
          >
            {minion.hp}
          </div>
        </div>

        {/* Buff/Debuff 显示 */}
        {(minion.buffs.huchi > 0 || minion.debuffs.huaiyi > 0) && (
          <div style={styles.buffs}>
            {minion.buffs.huchi > 0 && (
              <span style={{ ...styles.buff, color: '#4a90d9' }}>
                护+{minion.buffs.huchi}
              </span>
            )}
            {minion.debuffs.huaiyi > 0 && (
              <span style={{ ...styles.buff, color: '#c41e3a' }}>
                疑+{minion.debuffs.huaiyi}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  badge: {
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    padding: '2px 4px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  stat: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    border: '2px solid #fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
  },
  buffs: {
    position: 'absolute',
    top: 30,
    left: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontSize: 10,
    fontWeight: 'bold',
  },
  buff: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    padding: '2px 4px',
  },
};

function getMinionIcon(name: string): string {
  // 简单的图标映射
  const iconMap: Record<string, string> = {
    '墨家弟子': '⚙️',
    '儒家学者': '📚',
    '道家修士': '☯️',
    '法家刑官': '⚖️',
    '兵家战将': '⚔️',
    '农家农夫': '🌾',
    '医家医师': '💊',
    '阴阳家': '🔮',
    '纵横家': '🗣️',
    '名家辩士': '🎯',
  };
  
  // 返回匹配的图标或默认图标
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon;
  }
  return '👤';
}

export default MinionCard;
