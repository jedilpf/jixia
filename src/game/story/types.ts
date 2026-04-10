export type StoryNodeType = 'narration' | 'dialogue' | 'choice' | 'scene' | 'transition' | 'ending' | 'qte';

export type CharacterEmotion = 'normal' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking' | 'determined' | 'scared' | 'serious' | 'worried' | 'interested' | 'peaceful';

export type ChoiceImpact = {
  stats?: Partial<Record<'fame' | 'wisdom' | 'charm' | 'courage' | 'insight', number>>;
  flags?: Record<string, boolean | number | string>;
  relationships?: Partial<Record<string, { affection?: number; trust?: number }>>;
  path?: string;
  hint?: string;
};

export interface RelationshipChange {
  affection: number;
  trust: number;
}

export type PlayerStats = {
  fame: number;
  wisdom: number;
  charm: number;
  courage: number;
  insight: number;
};

export type StoryFlags = Record<string, boolean | number | string>;

export type Relationships = Record<string, RelationshipChange>;

export interface StoryBattleBridgeState {
  unlockedFactions: string[];
  unlockedCards: string[];
  chapterFlags: string[];
  lastStoryEndingId?: string;
}

export interface StoryCondition {
  type: 'stat' | 'flag' | 'relationship' | 'chapter' | 'path';
  target: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'includes' | 'exists' | 'not_exists';
  value: unknown;
}

export interface StoryChoice {
  id: string;
  text: string;
  icon?: string;
  effects: ChoiceImpact;
  nextNode: string;
  conditions?: StoryCondition[];
  disabled?: boolean;
  disabledReason?: string;
}

export interface StoryNode {
  id: string;
  type: StoryNodeType;
  speaker?: string;
  emotion?: CharacterEmotion;
  content: string;
  background?: string;
  image?: string;
  speakerImage?: string;
  music?: string;
  choices?: StoryChoice[];
  effects?: ChoiceImpact;
  nextNode?: string;
  conditions?: StoryCondition[];
}

export interface StorySaveData {
  version: string;
  timestamp: number;
  currentNodeId: string;
  player: {
    name?: string;
    stats: PlayerStats;
    relationships: Relationships;
    flags: StoryFlags;
  };
  progress: {
    chapter: number;
    scene: number;
    completedNodes: string[];
    visitedNodes?: string[];
  };
  history: {
    nodeIds: string[];
    choices: Array<{ nodeId: string; choiceId: string }>;
    entries?: Array<{ nodeId: string; choiceId?: string }>;
  };
  runtime?: {
    currentPath?: string;
    currentChapterId?: string;
    completedChapters?: string[];
  };
  bridgeState?: StoryBattleBridgeState;
}

export interface StorySettings {
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  autoPlaySpeed: number;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  showRelationshipChanges: boolean;
  showEffectPreview: boolean;
  skipAlreadyRead: boolean;
  qteDifficulty: 'easy' | 'normal' | 'hard';
}

export type StoryScreen = 'dialogue' | 'choice' | 'narration' | 'scene' | 'qte' | 'transition' | 'menu' | 'ending';

export interface StoryEventMap {
  node_changed: { nodeId: string };
  choice_made: { choiceId: string; effects: ChoiceImpact };
  stats_changed: { changes: Partial<PlayerStats> };
  relationship_changed: { characterId: string; changes: RelationshipChange };
  flag_changed: { flagId: string; value: boolean | number | string };
  qte_started: { qteId: string };
  qte_completed: { success: boolean };
  chapter_completed: { chapterId: string; endingId?: string };
  bridge_state_changed: { state: StoryBattleBridgeState };
  story_completed: { endingId: string };
  screen_changed: { screen: StoryScreen };
}

export type StoryEvent = {
  [K in keyof StoryEventMap]: { type: K } & StoryEventMap[K];
}[keyof StoryEventMap];
