import React, { useEffect } from 'react';
import { useSyncBattle } from '@/hooks/useSyncBattle';
import SyncBattleUI from './SyncBattleUI';
import { BattleBoardSync } from './BattleBoardSync';
import './SyncBattlePage.css';

export const SyncBattlePage: React.FC = () => {
  const {
    game,
    currentPhase,
    phaseTimeRemaining,
    isPlayerLocked,
    isEnemyLocked,
    revealedPlayerSecret,
    revealedEnemySecret,
    winner,
    startGame,
    submitDebateAction,
    submitSecretAction,
    lockDecision,
    pause,
    resume,
  } = useSyncBattle();

  useEffect(() => {
    startGame();
  }, [startGame]);

  if (!game) {
    return (
      <div className="sync-battle-loading">
        <div className="loading-spinner"></div>
        <p>论道准备中...</p>
      </div>
    );
  }

  if (winner) {
    return (
      <div className="sync-battle-result">
        <h1>{winner === 'player' ? '论道胜利！' : '论道失败...'}</h1>
        <p>各抒己见，争鸣不息</p>
        <button onClick={startGame} className="restart-btn">
          再战一局
        </button>
      </div>
    );
  }

  return (
    <div className="sync-battle-page">
      <SyncBattleUI
        currentPhase={currentPhase}
        phaseTimeRemaining={phaseTimeRemaining}
        isPlayerLocked={isPlayerLocked}
        isEnemyLocked={isEnemyLocked}
        playerHand={game.player.hand}
        playerMana={game.player.mana}
        revealedPlayerSecret={revealedPlayerSecret}
        revealedEnemySecret={revealedEnemySecret}
        onDebateAction={submitDebateAction}
        onSecretAction={submitSecretAction}
        onLock={lockDecision}
      />

      <div className="battle-content">
        <div className="enemy-hero-panel">
          <div className="hero-info">
            <div className="hero-name">敌方主辩者</div>
            <div className="hero-stats">
              <span className="hp-display">心证: {game.enemy.hero.hp}/{game.enemy.hero.maxHp}</span>
              <span className="mana-display">学识: {game.enemy.mana}/{game.enemy.maxMana}</span>
            </div>
          </div>
        </div>

        <BattleBoardSync
          playerBoard={game.player.board}
          enemyBoard={game.enemy.board}
          isPlayerTurn={game.currentPlayer === 'player'}
          currentPhase={currentPhase}
        />

        <div className="player-hero-panel">
          <div className="hero-info">
            <div className="hero-name">我方主辩者</div>
            <div className="hero-stats">
              <span className="hp-display">心证: {game.player.hero.hp}/{game.player.hero.maxHp}</span>
              <span className="mana-display">学识: {game.player.mana}/{game.player.maxMana}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="phase-debug">
        <span>回合: {game.turnNumber}</span>
        <span>当前玩家: {game.currentPlayer === 'player' ? '我方' : '敌方'}</span>
        <button onClick={pause}>暂停</button>
        <button onClick={resume}>继续</button>
      </div>
    </div>
  );
};

export default SyncBattlePage;
