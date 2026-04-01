import React from 'react';
import { useGameStore } from '../../../../stores/gameStore';

/**
 * BattleControls - 战斗控制面板组件
 * 
 * 职责：
 * - 显示法力值
 * - 显示结束回合按钮
 * - 显示英雄技能按钮
 * 
 * 预估行数：~100行
 */
export const BattleControls: React.FC = () => {
  const player = useGameStore(state => state.game.player);
  const isPlayerTurn = useGameStore(state => state.isPlayerTurn);
  const canEndTurn = useGameStore(state => state.canEndTurn);
  const endTurn = useGameStore(state => state.endTurn);
  const useHeroPower = useGameStore(state => state.useHeroPower);
  
  const { mana, maxMana, hero } = player;
  const canUsePower = isPlayerTurn && 
    mana >= hero.heroPower.cost && 
    !hero.heroPower.usedThisTurn;
  
  return (
    <div className="battle-controls" style={styles.container}>
      {/* 法力显示 */}
      <div style={styles.manaDisplay}>
        <div style={styles.manaIcon}>⚡</div>
        <div style={styles.manaText}>
          {mana} / {maxMana}
        </div>
      </div>
      
      {/* 英雄技能 */}
      <button
        style={{
          ...styles.heroPower,
          opacity: canUsePower ? 1 : 0.5,
          cursor: canUsePower ? 'pointer' : 'not-allowed',
        }}
        onClick={() => canUsePower && useHeroPower()}
        disabled={!canUsePower}
      >
        <div style={styles.heroPowerName}>{hero.heroPower.name}</div>
        <div style={styles.heroPowerCost}>{hero.heroPower.cost}</div>
      </button>
      
      {/* 结束回合按钮 */}
      <button
        style={{
          ...styles.endTurn,
          opacity: canEndTurn ? 1 : 0.5,
          cursor: canEndTurn ? 'pointer' : 'not-allowed',
        }}
        onClick={() => canEndTurn && endTurn()}
        disabled={!canEndTurn}
      >
        {isPlayerTurn ? '结束论述' : '敌方论述中...'}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    right: 40,
    bottom: 200,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  manaDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    border: '2px solid #4a90d9',
  },
  manaIcon: {
    fontSize: 24,
    color: '#4a90d9',
  },
  manaText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroPower: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    border: '3px solid #d4af37',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    transition: 'all 0.2s',
  },
  heroPowerName: {
    fontSize: 12,
    textAlign: 'center',
  },
  heroPowerCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90d9',
  },
  endTurn: {
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#d4af37',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: 140,
  },
};

export default BattleControls;
