import { Card } from './cards';
import { Hero, CharacterInstance, FieldInstance } from './instances';

export type PlayerId = 'player' | 'enemy';
export type GamePhase = 'start' | 'player_turn' | 'enemy_turn' | 'combat' | 'end';

export interface PlayerState {
    hero: Hero;
    deck: Card[];
    hand: Card[];

    // 战场 2x3 布局
    board: {
        front: (CharacterInstance | null)[]; // 长度为3，入世席
        back: (CharacterInstance | null)[];  // 长度为3，出世席
    };

    // 场地
    field: FieldInstance | null;

    // 简牍区 (着书)
    bookArea: Card[];

    mana: number;
    maxMana: number;
    fatigue: number;
    
    // 金币系统
    gold: number;
}

export interface GameState {
    phase: GamePhase;
    currentPlayer: PlayerId;
    turnNumber: number;
    player: PlayerState;
    enemy: PlayerState;
    winner: PlayerId | null;
    log: GameLogEntry[];
}

export interface GameLogEntry {
    id: string;
    turn: number;
    player: PlayerId;
    action: string;
    timestamp: number;
}
