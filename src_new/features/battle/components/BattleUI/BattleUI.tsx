import React from 'react';
import { useGameStore } from '../../../../stores/gameStore';

/**
 * BattleUI - 战斗UI层组件
 * 
 * 职责：
 * - 显示游戏日志
 * - 显示回合信息
 * - 显示简牍区
 */
export const BattleUI: React.FC = () => {
  const game = useGameStore(state => state.game);
  const player = game.player;
  const enemy = game.enemy;
  
  // 只显示最近5条日志
  const recentLogs = game.log.slice(-5);

  return (
    <div className="battle-ui" style={styles.container}>
      {/* 游戏日志 */}
      <div style={styles.logPanel}>
        <div style={styles.logTitle}>论道记录</div>
        <div style={styles.logContent}>
          {recentLogs.map((log) => (
            <div
              key={log.id}
              style={{
                ...styles.logEntry,
                color: log.player === 'player' ? '#4a90d9' : '#c41e3a',
              }}
            >
              <span style={styles.logTurn}>[{log.turn}]</span>
              <span style={styles.logAction}>{log.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 简牍区显示 */}
      <div style={styles.bookArea}>
        <div style={styles.bookTitle}>简牍区</div>
        <div style={styles.bookCount}>{player.bookArea.length}</div>
        <div style={styles.bookCards}>
          {player.bookArea.slice(-3).map((card, index) => (
            <div
              key={`${card.id}_${index}`}
              style={{
                ...styles.bookCard,
                right: index * 15,
                zIndex: index,
              }}
            >
              {card.name}
            </div>
          ))}
        </div>
      </div>

      {/* 牌库信息 */}
      <div style={styles.deckInfo}>
        <div style={styles.deckItem}>
          <span style={styles.deckLabel}>牌库</span>
          <span style={styles.deckValue}>{player.deck.length}</span>
        </div>
        <div style={styles.deckItem}>
          <span style={styles.deckLabel}>手牌</span>
          <span style={styles.deckValue}>{player.hand.length}</span>
        </div>
      </div>

      {/* 敌方信息 */}
      <div style={styles.enemyInfo}>
        <div style={styles.enemyDeck}>
          <span style={styles.deckLabel}>敌方牌库</span>
          <span style={styles.deckValue}>{enemy.deck.length}</span>
        </div>
        <div style={styles.enemyHand}>
          <span style={styles.deckLabel}>敌方手牌</span>
          <span style={styles.deckValue}>{enemy.hand.length}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    pointerEvents: 'none',
    zIndex: 50,
  },
  logPanel: {
    position: 'absolute',
    left: 40,
    top: 40,
    width: 320,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 12,
    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
    paddingBottom: 8,
  },
  logContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  logEntry: {
    fontSize: 13,
    lineHeight: 1.5,
  },
  logTurn: {
    marginRight: 8,
    opacity: 0.7,
  },
  logAction: {
    color: '#ccc',
  },
  bookArea: {
    position: 'absolute',
    left: 40,
    bottom: 280,
    width: 120,
    height: 160,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    borderRadius: 8,
    border: '2px solid #8B4513',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 14,
    color: '#d4af37',
    marginBottom: 8,
  },
  bookCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  bookCards: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 80,
    height: 100,
  },
  bookCard: {
    position: 'absolute',
    width: 60,
    height: 80,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    fontSize: 8,
    color: '#d4af37',
    padding: 4,
    overflow: 'hidden',
    border: '1px solid #d4af37',
  },
  deckInfo: {
    position: 'absolute',
    left: 180,
    bottom: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  deckItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8px 16px',
    borderRadius: 8,
  },
  deckLabel: {
    fontSize: 14,
    color: '#888',
  },
  deckValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  enemyInfo: {
    position: 'absolute',
    right: 40,
    top: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  enemyDeck: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8px 16px',
    borderRadius: 8,
  },
  enemyHand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8px 16px',
    borderRadius: 8,
  },
};

export default BattleUI;
