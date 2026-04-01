import React from 'react';
import type { Position, PlayerId } from '../../../../types/domain';
import { useGameStore } from '../../../../stores/gameStore';

interface EmptySlotProps {
  position: Position;
  side: PlayerId;
}

/**
 * EmptySlot - 空槽位组件
 * 
 * 职责：
 * - 渲染空的战场格子
 * - 显示可放置提示
 */
export const EmptySlot: React.FC<EmptySlotProps> = ({
  position,
  side,
}) => {
  const selection = useGameStore(state => state.selection);
  const isPlayerTurn = useGameStore(state => state.isPlayerTurn);
  
  // 检查是否是可放置的目标
  const isDropTarget = 
    side === 'player' && 
    isPlayerTurn && 
    selection.type === 'card';

  return (
    <div
      className={`empty-slot ${isDropTarget ? 'drop-target' : ''}`}
      style={{
        width: 140,
        height: 180,
        border: `2px dashed ${isDropTarget ? '#4a90d9' : 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: 12,
        backgroundColor: isDropTarget ? 'rgba(74, 144, 217, 0.1)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        pointerEvents: 'auto',
      }}
    >
      {isDropTarget && (
        <span style={{ fontSize: 24, opacity: 0.5 }}>+</span>
      )}
    </div>
  );
};

export default EmptySlot;
