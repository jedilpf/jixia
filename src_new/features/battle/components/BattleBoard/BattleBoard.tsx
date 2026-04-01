import React from 'react';
import { useGameStore } from '../../../../stores/gameStore';
import { BoardRow } from './BoardRow';
import { HeroCard } from './HeroCard';
import type { Position } from '../../../../types/domain';

/**
 * BattleBoard - 战场棋盘组件
 * 
 * 职责：
 * - 渲染双方战场
 * - 管理随从位置
 * - 处理战场交互
 * 
 * 预估行数：~200行
 */
export const BattleBoard: React.FC = () => {
  const playerBoard = useGameStore(state => state.game.player.board);
  const enemyBoard = useGameStore(state => state.game.enemy.board);
  const playerHero = useGameStore(state => state.game.player.hero);
  const enemyHero = useGameStore(state => state.game.enemy.hero);
  
  // 战场布局配置
  const BOARD_CONFIG = {
    enemyBackY: 120,
    enemyFrontY: 280,
    playerFrontY: 700,
    playerBackY: 860,
    slotWidth: 160,
    slotGap: 20,
    startX: 720,
  };

  return (
    <div className="battle-board" style={styles.board}>
      {/* 敌方后排 */}
      <BoardRow
        side="enemy"
        row="back"
        slots={enemyBoard.back}
        y={BOARD_CONFIG.enemyBackY}
        startX={BOARD_CONFIG.startX}
        slotWidth={BOARD_CONFIG.slotWidth}
        slotGap={BOARD_CONFIG.slotGap}
      />
      
      {/* 敌方前排 */}
      <BoardRow
        side="enemy"
        row="front"
        slots={enemyBoard.front}
        y={BOARD_CONFIG.enemyFrontY}
        startX={BOARD_CONFIG.startX}
        slotWidth={BOARD_CONFIG.slotWidth}
        slotGap={BOARD_CONFIG.slotGap}
      />
      
      {/* 敌方英雄 */}
      <HeroCard
        hero={enemyHero}
        side="enemy"
        x={100}
        y={200}
      />
      
      {/* 我方前排 */}
      <BoardRow
        side="player"
        row="front"
        slots={playerBoard.front}
        y={BOARD_CONFIG.playerFrontY}
        startX={BOARD_CONFIG.startX}
        slotWidth={BOARD_CONFIG.slotWidth}
        slotGap={BOARD_CONFIG.slotGap}
      />
      
      {/* 我方后排 */}
      <BoardRow
        side="player"
        row="back"
        slots={playerBoard.back}
        y={BOARD_CONFIG.playerBackY}
        startX={BOARD_CONFIG.startX}
        slotWidth={BOARD_CONFIG.slotWidth}
        slotGap={BOARD_CONFIG.slotGap}
      />
      
      {/* 我方英雄 */}
      <HeroCard
        hero={playerHero}
        side="player"
        x={100}
        y={780}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  board: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    pointerEvents: 'none',
  },
};

export default BattleBoard;
