/**
 * @deprecated 第一代引擎类型定义。请使用 src/battleV2/types.ts。
 */
export type ScreenId =
  | 'home'
  | 'match'
  | 'topic_preview'
  | 'faction_pick'
  | 'loading'
  | 'battle'
  | 'result'
  | 'story';

export type PlayerId = 'player' | 'enemy';
export type IssueDirectionId = 'ritual' | 'economy' | 'strategy';
export type IssueStage = 'seed' | 'contested' | 'locked';

export type BattlePhase =
  | 'round_start'
  | 'hidden_submit'
  | 'submission_lock'
  | 'reveal'
  | 'public_effect'
  | 'zone_resolve'
  | 'issue_burst_check';

export type CardZone = 'deck' | 'hand' | 'main' | 'side' | 'discard';

export type IssueId = string;

export interface CardDefinition {
  id: string;
  name: string;
  factionId: string;
  type: 'argument' | 'scheme' | 'support' | 'counter';
  publicPower: number;
  cost: number;
  baseAttack: number;
  baseHealth: number;
  issueTags: IssueDirectionId[];
  comboTags: string[];
  // legacy field kept for compatibility with existing data tooling.
  issueTag?: IssueDirectionId | 'neutral';
  description: string;
  category: 'argument' | 'strategy' | 'counter' | 'support';
  artKey?: string;
}

export interface FactionDefinition {
  id: string;
  name: string;
  style: string;
  color: string;
}

export interface IssueDefinition {
  id: IssueId;
  name: string;
  description: string;
  seedPrompt: string;
  directionLabels: Record<IssueDirectionId, string>;
  effectText?: string;
}

export interface CardInstance {
  uid: string;
  cardId: string;
  ownerId: PlayerId;
  zone: CardZone;
  factionId: string;
  type: CardDefinition['type'];
  publicPower: number;
  name: string;
  cost: number;
  attack: number;
  health: number;
  maxHealth: number;
  issueTag: IssueDirectionId | 'neutral';
  issueTags: IssueDirectionId[];
  comboTags: string[];
}

export interface PlayerBoard {
  mainQueue: CardInstance[];
  sideQueue: CardInstance[];
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  factionId: string | null;
  momentum: number;
  gold: number;
  mana: number;
  maxMana: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  board: PlayerBoard;
  hasUsedStrategyCard: boolean;
  cardsPlayedThisTurn: number;
}

export interface IssueState {
  id: IssueId;
  name: string;
  stage: IssueStage;
  heat: number;
  directionScore: Record<IssueDirectionId, number>;
  triggerThreshold: number;
  burstCheckEvery: number;
  lockedDirection: IssueDirectionId | null;
  lastBurstRound: number | null;
}

export interface BattleState {
  phase: BattlePhase;
  maxCardsPerTurn: number;
  maxCardsPerZone: number;
  maxStrategyPerTurn: number;
  recentIssuePushTotal: number;
  lastBurstTriggeredRound: number | null;
  logs: string[];
}

export interface GameConfig {
  maxRounds: number;
  victoryMomentum: number;
  initialGold: number;
  initialHandSize: number;
  issueThreshold: number;
  issueTriggerThreshold: number;
  manaByRound: number[];
  deckSize: number;
  factionDeckCount: number;
  neutralDeckCount: number;
  maxCardsPerTurn: number;
  maxCardsPerZone: number;
  burstCheckEvery: number;
  burstDirectThreshold: number;
  burstProbThreshold: number;
  factionChoiceCount: number;
  issueCandidateCount: number;
}

export interface GameState {
  screen: ScreenId;
  round: number;
  activePlayerId: PlayerId;
  winnerId: PlayerId | 'draw' | null;
  issueState: IssueState | null;
  battle: BattleState;
  players: Record<PlayerId, PlayerState>;
  supportScore: Record<PlayerId, number>;
  factionResonance: Record<PlayerId, number>;
  offeredFactionIds: Record<PlayerId, string[]>;
  availableIssueIds: IssueId[];
  selectedIssuePreviewIds: IssueId[];
  config: GameConfig;
  seededAt: number;
}
