import React from 'react';
import { useGameStore } from '../../../../stores/gameStore';
import { BattleProvider } from '../../hooks/useBattleContext';
import { BattleContainer } from './BattleContainer';
import { BattleBackground } from './BattleBackground';
import { BattleBoard } from '../BattleBoard';
import { BattleHand } from '../BattleHand';
import { BattleControls } from '../BattleControls';
import { BattleEffects } from '../BattleEffects';
import { BattleUI } from '../BattleUI';
import { TurnBanner } from '../TurnBanner';
import { GameResultOverlay } from '../GameResultOverlay';

/**
 * BattleLayout - 战斗主布局组件
 * 
 * 职责：
 * - 组装所有战斗子组件
 * - 提供 BattleProvider 上下文
 * - 处理游戏结果展示
 * 
 * 优化前：1540行
 * 优化后：<100行
 */
export const BattleLayout: React.FC = () => {
  const winner = useGameStore(state => state.game.winner);
  const phase = useGameStore(state => state.game.phase);
  
  return (
    <BattleProvider>
      <BattleContainer>
        {/* 背景层 */}
        <BattleBackground />
        
        {/* 战场层 */}
        <BattleBoard />
        
        {/* 手牌层 */}
        <BattleHand />
        
        {/* 控制层 */}
        <BattleControls />
        
        {/* 特效层 */}
        <BattleEffects />
        
        {/* UI层 */}
        <BattleUI />
        
        {/* 回合横幅 */}
        <TurnBanner />
        
        {/* 游戏结果 */}
        {winner && <GameResultOverlay winner={winner} />}
      </BattleContainer>
    </BattleProvider>
  );
};

export default BattleLayout;
