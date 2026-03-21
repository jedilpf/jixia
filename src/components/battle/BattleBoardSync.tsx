﻿﻿﻿﻿﻿﻿﻿import React from 'react';
import { CharacterInstance } from '@/types/instances';
import { SyncPhase } from '@/types/syncBattle';
import { MinionCard } from './MinionCard';
import './BattleBoardSync.css';

interface BoardLayout {
  front: (CharacterInstance | null)[];
  back: (CharacterInstance | null)[];
}

interface BattleBoardSyncProps {
  playerBoard: BoardLayout;
  enemyBoard: BoardLayout;
  onAttack?: (attackerPos: { row: 'front' | 'back'; col: number }, targetPos: { row: 'front' | 'back'; col: number } | 'hero') => void;
  isPlayerTurn: boolean;
  currentPhase: SyncPhase;
  scale?: number;
}

export const BattleBoardSync: React.FC<BattleBoardSyncProps> = ({
  playerBoard,
  enemyBoard,
  onAttack,
  isPlayerTurn,
  currentPhase,
  scale = 1,
}) => {
  const isInteractionAllowed = currentPhase === 'settle3';

  const renderRow = (
    row: (CharacterInstance | null)[],
    rowType: 'front' | 'back',
    side: 'player' | 'enemy'
  ) => {
    return (
      <div className={`board-row ${rowType}-row ${side}-row`}>
        {row.map((minion, col) => (
          <div key={col} className="board-slot">
            {minion ? (
              <MinionCard
                minion={minion}
                isEnemy={side === 'enemy'}
                canAttack={isPlayerTurn && side === 'player' && !minion.hasAttacked && isInteractionAllowed}
                onClick={() => {
                  if (onAttack && isInteractionAllowed) {
                    onAttack({ row: rowType, col }, 'hero');
                  }
                }}
              />
            ) : (
              <div className="empty-slot-simple">
                <span className="slot-label">{rowType === 'front' ? '入世' : '出世'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getPhaseLabel = (): string => {
    switch (currentPhase) {
      case 'debate': return '明辩阶段';
      case 'secret': return '暗谋阶段';
      case 'reveal': return '揭示阶段';
      case 'settle1': return '应对结算';
      case 'settle2': return '主论结算';
      case 'settle3': return '三席争鸣';
      case 'settle4': return '暗策结算';
      case 'settle5': return '回合结束';
      default: return '';
    }
  };

  return (
    <div className="battle-board-sync" style={{ transform: `scale(${scale})` }}>
      <div className="board-section enemy-section">
        <div className="section-label">敌方出世席</div>
        {renderRow(enemyBoard.back, 'back', 'enemy')}
        <div className="section-label">敌方入世席</div>
        {renderRow(enemyBoard.front, 'front', 'enemy')}
      </div>

      <div className="board-divider">
        <div className="divider-line"></div>
        <div className="phase-indicator-small">{getPhaseLabel()}</div>
        <div className="divider-line"></div>
      </div>

      <div className="board-section player-section">
        <div className="section-label">我方入世席</div>
        {renderRow(playerBoard.front, 'front', 'player')}
        <div className="section-label">我方出世席</div>
        {renderRow(playerBoard.back, 'back', 'player')}
      </div>
    </div>
  );
};

export default BattleBoardSync;
