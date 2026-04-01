import React, { useCallback } from 'react';
import { SyncPhase, PHASE_NAMES, DebateAction, SecretAction } from '@/types/syncBattle';
import { Card } from '@/types';
import './SyncBattleUI.css';

interface SyncBattleUIProps {
  currentPhase: SyncPhase;
  phaseTimeRemaining: number;
  isPlayerLocked: boolean;
  isEnemyLocked: boolean;
  playerHand: Card[];
  playerMana: number;
  revealedPlayerSecret: SecretAction | null;
  revealedEnemySecret: SecretAction | null;
  onDebateAction: (action: DebateAction) => void;
  onSecretAction: (action: SecretAction) => void;
  onLock: () => void;
}

export const SyncBattleUI: React.FC<SyncBattleUIProps> = ({
  currentPhase,
  phaseTimeRemaining,
  isPlayerLocked,
  isEnemyLocked,
  playerHand,
  playerMana,
  revealedPlayerSecret,
  revealedEnemySecret,
  onDebateAction,
  onSecretAction,
  onLock,
}) => {
  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getPhaseColor = (): string => {
    switch (currentPhase) {
      case 'debate': return '#3b82f6';
      case 'secret': return '#8b5cf6';
      case 'reveal': return '#f59e0b';
      case 'settle1':
      case 'settle2':
      case 'settle3':
      case 'settle4':
      case 'settle5': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handlePlayMain = useCallback((cardIndex: number) => {
    onDebateAction({ type: 'play_main', cardIndex });
  }, [onDebateAction]);

  const handlePlayCounter = useCallback((cardIndex: number) => {
    onDebateAction({ type: 'play_counter', cardIndex });
  }, [onDebateAction]);

  const handleWriteBook = useCallback((cardIndex: number) => {
    onDebateAction({ type: 'write_book', cardIndex });
  }, [onDebateAction]);

  const handlePlaySecret = useCallback((cardIndex: number) => {
    onSecretAction({ type: 'play_secret', cardIndex });
  }, [onSecretAction]);

  const handlePass = useCallback(() => {
    if (currentPhase === 'debate') {
      onDebateAction({ type: 'pass' });
    } else if (currentPhase === 'secret') {
      onSecretAction({ type: 'pass' });
    }
  }, [currentPhase, onDebateAction, onSecretAction]);

  const isDebatePhase = currentPhase === 'debate';
  const isSecretPhase = currentPhase === 'secret';
  const isRevealPhase = currentPhase === 'reveal';
  const isSettlementPhase = ['settle1', 'settle2', 'settle3', 'settle4', 'settle5'].includes(currentPhase);

  return (
    <div className="sync-battle-ui">
      <div className="phase-indicator" style={{ backgroundColor: getPhaseColor() }}>
        <div className="phase-name">{PHASE_NAMES[currentPhase]}</div>
        <div className="phase-timer">{formatTime(phaseTimeRemaining)}</div>
      </div>

      <div className="lock-status">
        <div className={`lock-indicator ${isEnemyLocked ? 'locked' : ''}`}>
          敌方: {isEnemyLocked ? '已确认' : '思考中...'}
        </div>
        <div className={`lock-indicator ${isPlayerLocked ? 'locked' : ''}`}>
          我方: {isPlayerLocked ? '已确认' : '待确认'}
        </div>
      </div>

      {isRevealPhase && (
        <div className="reveal-panel">
          <h3>暗策揭示</h3>
          <div className="secret-reveal">
            <div className="secret-item">
              <span>我方暗策:</span>
              <span>{revealedPlayerSecret?.type === 'play_secret' ? '已打出' : '未打出'}</span>
            </div>
            <div className="secret-item">
              <span>敌方暗策:</span>
              <span>{revealedEnemySecret?.type === 'play_secret' ? '已打出' : '未打出'}</span>
            </div>
          </div>
        </div>
      )}

      {isSettlementPhase && (
        <div className="settlement-panel">
          <h3>结算进行中...</h3>
          <div className="settlement-animation">
            <div className="settle-layer">
              第 {currentPhase.replace('settle', '')} 层结算
            </div>
          </div>
        </div>
      )}

      {(isDebatePhase || isSecretPhase) && !isPlayerLocked && (
        <div className="action-panel">
          <div className="mana-display">
            学识: {playerMana}
          </div>

          <div className="hand-cards">
            {playerHand.map((card, index) => (
              <div key={index} className="hand-card">
                <div className="card-info">
                  <span className="card-name">{card.name}</span>
                  <span className="card-cost">{card.cost}</span>
                </div>
                
                {isDebatePhase && (
                  <div className="card-actions">
                    <button 
                      onClick={() => handlePlayMain(index)}
                      disabled={playerMana < card.cost}
                      className="action-btn main-btn"
                    >
                      主论
                    </button>
                    {card.type === 'skill' && (
                      <button 
                        onClick={() => handlePlayCounter(index)}
                        disabled={playerMana < card.cost}
                        className="action-btn counter-btn"
                      >
                        应对
                      </button>
                    )}
                    <button 
                      onClick={() => handleWriteBook(index)}
                      className="action-btn book-btn"
                    >
                      着书
                    </button>
                  </div>
                )}

                {isSecretPhase && (
                  <div className="card-actions">
                    <button 
                      onClick={() => handlePlaySecret(index)}
                      disabled={playerMana < card.cost}
                      className="action-btn secret-btn"
                    >
                      暗策
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="control-actions">
            <button onClick={handlePass} className="pass-btn">
              跳过
            </button>
            <button 
              onClick={onLock} 
              className="lock-btn"
              disabled={isPlayerLocked}
            >
              确认决策
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncBattleUI;
