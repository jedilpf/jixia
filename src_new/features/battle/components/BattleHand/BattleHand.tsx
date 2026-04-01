import React from 'react';
import { useGameStore } from '../../../../stores/gameStore';
import { HandCard } from './HandCard';
import { computeHandFan } from '../../utils/handLayout';

/**
 * BattleHand - 手牌区域组件
 * 
 * 职责：
 * - 渲染手牌扇形布局
 * - 处理手牌交互
 * - 管理卡牌高亮状态
 * 
 * 预估行数：~150行
 */
export const BattleHand: React.FC = () => {
  const hand = useGameStore(state => state.game.player.hand);
  const mana = useGameStore(state => state.game.player.mana);
  const selection = useGameStore(state => state.selection);
  const selectCard = useGameStore(state => state.selectCard);
  const playCard = useGameStore(state => state.playCard);
  const writeBook = useGameStore(state => state.writeBook);
  
  // 手牌布局计算
  const handPoses = computeHandFan({
    count: hand.length,
    centerX: 960,
    baseY: 1000,
    hoveredIndex: null,
  });
  
  const handleCardClick = (index: number) => {
    const card = hand[index];
    if (!card) return;
    
    // 右键或长按可以着书
    // 这里简化处理：直接选择卡牌
    selectCard(index);
  };
  
  const handleCardDoubleClick = (index: number) => {
    // 双击着书
    writeBook(index);
  };
  
  const handleCardDragEnd = (index: number, dropped: boolean) => {
    if (dropped) {
      // 尝试打出卡牌
      playCard(index);
    }
  };
  
  return (
    <div className="battle-hand" style={styles.hand}>
      {hand.map((card, index) => {
        const pose = handPoses[index];
        const isSelected = selection.type === 'card' && selection.handIndex === index;
        const isPlayable = card.cost <= mana;
        
        return (
          <HandCard
            key={`${card.id}_${index}`}
            card={card}
            index={index}
            pose={pose}
            isSelected={isSelected}
            isPlayable={isPlayable}
            onClick={() => handleCardClick(index)}
            onDoubleClick={() => handleCardDoubleClick(index)}
            onDragEnd={(dropped) => handleCardDragEnd(index, dropped)}
          />
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  hand: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 1920,
    height: 200,
    pointerEvents: 'none',
  },
};

export default BattleHand;
