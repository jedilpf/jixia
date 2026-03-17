export type SelectionType = 'none' | 'card' | 'minion' | 'hero' | 'target' | 'hero_power';

import { PlayerId } from './battle';

export interface BoardPosition {
    row: 'front' | 'back';
    col: number;
}

export interface SelectionState {
    type: SelectionType;
    playerId?: PlayerId;
    cardId?: string;
    minionInstanceId?: string;
    handIndex?: number;
    boardPos?: BoardPosition;
}

export interface DragState {
    isDragging: boolean;
    cardId: string | null;
    handIndex: number | null;
    startX: number;
    startY: number;
}

export interface AttackState {
    isAttacking: boolean;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    attackerId?: string;
    attackerType: 'minion' | 'hero';
    attackerPlayerId?: PlayerId;
    attackerPos?: BoardPosition;
}
