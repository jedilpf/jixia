import React, { useEffect, useRef, useState } from 'react';
import { SyncBattleEngine } from '../../../../engine/SyncBattleEngine';
import { SyncBattleTimer } from '../SyncBattleTimer/SyncBattleTimer';
import type { SyncTurnState, SyncPhase, FeedbackEvent } from '../../../../types/syncBattle';
import type { Card } from '../../../../types/domain';

/**
 * SyncBattleLayout - 同步对战布局组件
 * 
 * 职责：
 * - 整合同步对战的所有功能
 * - 管理同步回合状态
 * - 处理玩家操作
 */
export const SyncBattleLayout: React.FC = () => {
  const engineRef = useRef<SyncBattleEngine | null>(null);
  const [gameState, setGameState] = useState<SyncTurnState | null>(null);
  const [feedback, setFeedback] = useState<FeedbackEvent | null>(null);

  // 初始化引擎
  useEffect(() => {
    const engine = new SyncBattleEngine({
      turnDuration: 20,
      revealPhaseDuration: 10,
      hiddenPhaseDuration: 10,
      maxCardsPerTurn: 3,
    });

    engine.onPhaseChange((phase) => {
      console.log('Phase changed:', phase);
    });

    engine.onTimeUpdate((time) => {
      // 时间更新时刷新状态
      setGameState(engine.getState());
    });

    engine.onFeedback((event) => {
      setFeedback(event);
      // 3秒后清除反馈
      setTimeout(() => setFeedback(null), 3000);
    });

    engineRef.current = engine;
    setGameState(engine.getState());

    // 开始准备阶段
    engine.startPreparation();

    return () => {
      engine.dispose();
    };
  }, []);

  // 处理卡牌选择
  const handleCardSelect = (card: Card, handIndex: number) => {
    if (!engineRef.current) return;
    
    const success = engineRef.current.selectCard('player', card, handIndex);
    if (success) {
      setGameState(engineRef.current.getState());
    }
  };

  // 处理卡牌取消选择
  const handleCardDeselect = (handIndex: number) => {
    if (!engineRef.current) return;
    
    const success = engineRef.current.deselectCard('player', handIndex);
    if (success) {
      setGameState(engineRef.current.getState());
    }
  };

  if (!gameState) {
    return <div style={styles.loading}>加载中...</div>;
  }

  const canModify = engineRef.current?.canModifyActions() ?? false;
  const canSeeOpponent = engineRef.current?.canSeeOpponentActions() ?? false;

  return (
    <div style={styles.container}>
      {/* 顶部计时器 */}
      <div style={styles.timerContainer}>
        <SyncBattleTimer
          phase={gameState.currentPhase}
          timeRemaining={gameState.timeRemaining}
          totalTimeRemaining={gameState.totalTimeRemaining}
          isVisible={canSeeOpponent}
        />
      </div>

      {/* 反馈提示 */}
      {feedback && (
        <div style={{
          ...styles.feedback,
          backgroundColor: feedback.type === 'error' ? '#c41e3a' : '#4a90d9',
        }}>
          {feedback.message}
        </div>
      )}

      {/* 对手操作区域 */}
      <div style={styles.opponentArea}>
        <h3 style={styles.areaTitle}>
          对方操作
          {!canSeeOpponent && gameState.currentPhase === 'hidden' && (
            <span style={styles.hiddenIndicator}> (隐藏中)</span>
          )}
        </h3>
        <div style={styles.cardSlots}>
          {canSeeOpponent ? (
            gameState.enemyActions.selectedCards.map((selected, index) => (
              <div key={index} style={styles.opponentCard}>
                {selected.card.name}
              </div>
            ))
          ) : (
            <div style={styles.hiddenCards}>
              {gameState.currentPhase === 'reveal' 
                ? '等待对方出牌...' 
                : '对方操作已隐藏'}
            </div>
          )}
        </div>
      </div>

      {/* 玩家操作区域 */}
      <div style={styles.playerArea}>
        <h3 style={styles.areaTitle}>
          我的操作
          {canModify && (
            <span style={styles.modifyHint}> (可调整)</span>
          )}
        </h3>
        <div style={styles.cardSlots}>
          {gameState.playerActions.selectedCards.map((selected, index) => (
            <div 
              key={index} 
              style={{
                ...styles.playerCard,
                cursor: canModify ? 'pointer' : 'default',
              }}
              onClick={() => canModify && handleCardDeselect(selected.handIndex)}
            >
              <span>{selected.card.name}</span>
              {canModify && (
                <span style={styles.removeHint}>点击移除</span>
              )}
            </div>
          ))}
          {gameState.playerActions.selectedCards.length === 0 && (
            <div style={styles.emptyHint}>请选择卡牌</div>
          )}
        </div>
      </div>

      {/* 手牌区域 - 示例 */}
      <div style={styles.handArea}>
        <h3 style={styles.areaTitle}>手牌 (点击选择)</h3>
        <div style={styles.handCards}>
          {/* 这里应该映射真实的手牌数据 */}
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              style={{
                ...styles.handCard,
                opacity: canModify ? 1 : 0.5,
                cursor: canModify ? 'pointer' : 'not-allowed',
              }}
              onClick={() => {
                if (canModify) {
                  handleCardSelect(
                    { id: `card_${i}`, name: `卡牌 ${i}`, cost: i, type: 'skill', faction: '儒家', rarity: '常见' } as Card,
                    i - 1
                  );
                }
              }}
              disabled={!canModify}
            >
              卡牌 {i}
            </button>
          ))}
        </div>
      </div>

      {/* 阶段说明 */}
      <div style={styles.phaseInfo}>
        <div style={styles.phaseRule}>
          <strong>揭示阶段 (前10秒):</strong> 双方可见对方已打出的卡牌
        </div>
        <div style={styles.phaseRule}>
          <strong>隐藏阶段 (后10秒):</strong> 新打出的卡牌不再实时展示
        </div>
        <div style={styles.phaseRule}>
          <strong>结算阶段:</strong> 同时展示双方所有卡牌并执行效果
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    gap: 20,
    overflow: 'auto',
  },
  loading: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
    color: '#d4af37',
    fontSize: 24,
  },
  timerContainer: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
  },
  feedback: {
    position: 'fixed',
    top: 200,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 101,
    animation: 'fadeInOut 3s ease',
  },
  opponentArea: {
    width: '100%',
    maxWidth: 800,
    padding: 20,
    backgroundColor: 'rgba(196, 30, 58, 0.1)',
    borderRadius: 12,
    border: '2px solid rgba(196, 30, 58, 0.3)',
    marginTop: 200,
  },
  playerArea: {
    width: '100%',
    maxWidth: 800,
    padding: 20,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    borderRadius: 12,
    border: '2px solid rgba(74, 144, 217, 0.3)',
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#d4af37',
  },
  hiddenIndicator: {
    color: '#c41e3a',
    fontSize: 14,
  },
  modifyHint: {
    color: '#4a90d9',
    fontSize: 14,
  },
  cardSlots: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    minHeight: 80,
    alignItems: 'center',
  },
  opponentCard: {
    padding: '12px 20px',
    backgroundColor: 'rgba(196, 30, 58, 0.3)',
    borderRadius: 8,
    border: '1px solid rgba(196, 30, 58, 0.5)',
  },
  playerCard: {
    padding: '12px 20px',
    backgroundColor: 'rgba(74, 144, 217, 0.3)',
    borderRadius: 8,
    border: '1px solid rgba(74, 144, 217, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  removeHint: {
    fontSize: 10,
    color: '#888',
  },
  hiddenCards: {
    padding: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyHint: {
    padding: 20,
    color: '#666',
  },
  handArea: {
    width: '100%',
    maxWidth: 800,
    padding: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    border: '2px solid rgba(212, 175, 55, 0.3)',
  },
  handCards: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  handCard: {
    padding: '16px 24px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    border: '2px solid rgba(212, 175, 55, 0.5)',
    borderRadius: 8,
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  phaseInfo: {
    width: '100%',
    maxWidth: 800,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  phaseRule: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 1.6,
  },
};

export default SyncBattleLayout;
