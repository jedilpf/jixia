import React from 'react';
import type { CharacterInstance, Position, PlayerId, RowType } from '../../../../types/domain';
import { MinionCard } from './MinionCard';
import { EmptySlot } from './EmptySlot';

interface BoardRowProps {
  side: PlayerId;
  row: RowType;
  slots: (CharacterInstance | null)[];
  y: number;
  startX: number;
  slotWidth: number;
  slotGap: number;
}

/**
 * BoardRow - 战场行组件
 * 
 * 职责：
 * - 渲染一行战场格子 (3个)
 * - 管理随从和空槽位
 */
export const BoardRow: React.FC<BoardRowProps> = ({
  side,
  row,
  slots,
  y,
  startX,
  slotWidth,
  slotGap,
}) => {
  return (
    <div className="board-row" style={styles.row}>
      {slots.map((minion, col) => {
        const x = startX + col * (slotWidth + slotGap);
        const position: Position = { row, col };

        return (
          <div
            key={`${side}-${row}-${col}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: slotWidth,
              height: 140,
            }}
          >
            {minion ? (
              <MinionCard
                minion={minion}
                position={position}
                side={side}
              />
            ) : (
              <EmptySlot
                position={position}
                side={side}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  row: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
};

export default BoardRow;
