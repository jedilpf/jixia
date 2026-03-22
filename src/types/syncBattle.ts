﻿﻿﻿﻿﻿﻿﻿﻿﻿import { CharacterInstance } from './instances';
import { Card } from './cards';
import { PlayerId } from './battle';

export type SyncPhase = 
  | 'waiting'
  | 'debate'      
  | 'secret'      
  | 'reveal'      
  | 'settle1'     
  | 'settle2'     
  | 'settle3'     
  | 'settle4'     
  | 'settle5'     
  | 'turn_end';

export type DebateActionType = 
  | 'play_main'     
  | 'play_counter'  
  | 'write_book'    
  | 'pass';         

export type SecretActionType = 
  | 'play_secret'   
  | 'pass';         

export interface DebateAction {
  type: DebateActionType;
  cardIndex?: number;
  targetPos?: { row: 'front' | 'back'; col: number };
}

export interface SecretAction {
  type: SecretActionType;
  cardIndex?: number;
  targetPos?: { row: 'front' | 'back'; col: number };
}

export interface PlayerSyncState {
  debateAction: DebateAction | null;
  secretAction: SecretAction | null;
  isLocked: boolean;       
  lockedAt: number | null; 
}

export interface SyncGameState {
  currentPhase: SyncPhase;
  phaseStartTime: number;
  phaseDuration: number;   
  
  playerSync: PlayerSyncState;
  enemySync: PlayerSyncState;
  
  revealedSecrets: {
    player: SecretAction | null;
    enemy: SecretAction | null;
  };
  
  settlementQueue: SettlementItem[];
  currentSettlementLayer: number;
}

export interface SettlementItem {
  id: string;
  layer: 1 | 2 | 3 | 4 | 5;
  sourcePlayerId: PlayerId;
  sourceInstance?: CharacterInstance;
  card?: Card;
  effectType: string;
  targetPlayerId?: PlayerId;
  targetPos?: { row: 'front' | 'back'; col: number } | 'hero';
  value?: number;
  description: string;
}

export interface GameCommand {
  id: string;
  type: CommandType;
  playerId: PlayerId;
  timestamp: number;
  data: CommandData;
}

export type CommandType = 
  | 'debate_action'
  | 'secret_action'
  | 'lock_decision'
  | 'auto_pass';

export interface CommandData {
  debateAction?: DebateAction;
  secretAction?: SecretAction;
}

export interface PhaseTransition {
  from: SyncPhase;
  to: SyncPhase;
  reason: string;
  timestamp: number;
}

export const PHASE_DURATIONS: Record<SyncPhase, number> = {
  waiting: 0,
  debate: 10000,   
  secret: 10000,   
  reveal: 2000,    
  settle1: 3000,
  settle2: 3000,
  settle3: 3000,
  settle4: 3000,
  settle5: 3000,
  turn_end: 1000,  
};

export const PHASE_NAMES: Record<SyncPhase, string> = {
  waiting: '等待开始',
  debate: '明辩阶段',
  secret: '暗谋阶段',
  reveal: '揭示阶段',
  settle1: '应对结算',
  settle2: '主论结算',
  settle3: '三席争鸣',
  settle4: '暗策结算',
  settle5: '回合结束',
  turn_end: '回合结束',
};
