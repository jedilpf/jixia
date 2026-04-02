import type {
  StoryNode,
  StoryChoice,
  StoryCondition,
  PlayerStats,
  StoryFlags,
  Relationships,
  StorySaveData,
  StorySettings,
  StoryEvent,
  StoryBattleBridgeState,
} from './types';

import { PROLOG_NODES } from './data/prolog';
import { CHAPTER_MORU_001_NODES } from './data/chapterMoru001';
import { CHAPTER_MORU_001_PART2_NODES } from './data/chapterMoru001_part2';
import { CHAPTER_MORU_002_NODES } from './data/chapterMoru002';
import { CHAPTER_MORU_003_NODES } from './data/chapterMoru003';
import { CHAPTER_MORU_004_NODES } from './data/chapterMoru004';
import { CHAPTER_MORU_005_NODES } from './data/chapterMoru005';
import { CHAPTER_MORU_006_NODES } from './data/chapterMoru006';
import { CHAPTER_MORU_007_NODES } from './data/chapterMoru007';
import { CHAPTER_MORU_008_NODES } from './data/chapterMoru008';

export type SaveSlotType = 'autosave' | 'manual_1' | 'manual_2' | 'manual_3';

export const STORAGE_KEYS: Record<SaveSlotType, string> = {
  autosave: 'jixia.story.autosave.v2',
  manual_1: 'jixia.story.manual.1.v2',
  manual_2: 'jixia.story.manual.2.v2',
  manual_3: 'jixia.story.manual.3.v2',
};

const STORY_SAVE_VERSION = '1.1.0';

export interface SaveSlotInfo {
  exists: boolean;
  timestamp?: number;
  chapter?: number;
  currentNodeId?: string;
  nodeCount?: number;
}

export class StoryEngine {
  private currentNodeId: string = 'prolog_0_1';
  private player: PlayerStats = {
    fame: 0,
    wisdom: 5,
    charm: 5,
    courage: 5,
    insight: 5,
  };
  private relationships: Relationships = {};
  private flags: StoryFlags = {};
  private history: Array<{ nodeId: string; choiceId?: string }> = [];
  private completedNodes: Set<string> = new Set();
  private visitedNodes: Set<string> = new Set();
  private completedChapters: Set<string> = new Set();
  private chapter: number = 0;
  private scene: number = 0;
  private currentChapterId: string = 'prolog_0';
  private currentPath: string = 'none';
  private bridgeState: StoryBattleBridgeState = {
    unlockedFactions: [],
    unlockedCards: [],
    chapterFlags: [],
  };

  private listeners: Set<(event: StoryEvent) => void> = new Set();
  private nodeMap: Map<string, StoryNode> = new Map();

  private settings: StorySettings = {
    textSpeed: 'normal',
    autoPlaySpeed: 50,
    masterVolume: 0.8,
    bgmVolume: 0.6,
    sfxVolume: 0.7,
    showRelationshipChanges: true,
    showEffectPreview: true,
    skipAlreadyRead: false,
    qteDifficulty: 'normal',
  };

  constructor() {
    this.loadNodes();
  }

  private loadNodes() {
    const storyNodes = [...PROLOG_NODES, ...CHAPTER_MORU_001_NODES, ...CHAPTER_MORU_001_PART2_NODES, ...CHAPTER_MORU_002_NODES, ...CHAPTER_MORU_003_NODES, ...CHAPTER_MORU_004_NODES, ...CHAPTER_MORU_005_NODES, ...CHAPTER_MORU_006_NODES, ...CHAPTER_MORU_007_NODES, ...CHAPTER_MORU_008_NODES];
    for (const node of storyNodes) {
      if (this.nodeMap.has(node.id)) {
        console.warn(`StoryEngine: duplicated node id ${node.id} ignored.`);
        continue;
      }
      this.nodeMap.set(node.id, node);
    }
  }

  public init(initialNodeId?: string) {
    if (initialNodeId && this.nodeMap.has(initialNodeId)) {
      this.currentNodeId = initialNodeId;
    } else {
      this.currentNodeId = 'prolog_0_1';
    }
    this.markNodeVisited(this.currentNodeId);
    this.syncChapterByNodeId(this.currentNodeId);
    this.emit({ type: 'node_changed', nodeId: this.currentNodeId });
  }

  public getCurrentNode(): StoryNode | undefined {
    return this.nodeMap.get(this.currentNodeId);
  }

  public getCurrentNodeId(): string {
    return this.currentNodeId;
  }

  public goToNode(nodeId: string) {
    if (!this.nodeMap.has(nodeId)) {
      console.warn(`StoryEngine: Node ${nodeId} not found`);
      return;
    }

    this.history.push({ nodeId: this.currentNodeId });
    this.currentNodeId = nodeId;
    this.markNodeVisited(nodeId);
    this.syncChapterByNodeId(nodeId);

    const node = this.getCurrentNode();
    if (node) {
      if (node.type === 'ending') {
        this.handleChapterEnding(node.id);
      }
    }

    this.emit({ type: 'node_changed', nodeId });
    this.persist();
  }

  public goToNext() {
    const node = this.getCurrentNode();
    if (!node) return;

    if (node.nextNode) {
      this.goToNode(node.nextNode);
    }
  }

  public goBack(): boolean {
    if (this.history.length === 0) return false;

    const lastEntry = this.history.pop();
    if (lastEntry) {
      this.currentNodeId = lastEntry.nodeId;
      this.markNodeVisited(this.currentNodeId);
      this.syncChapterByNodeId(this.currentNodeId);
      this.emit({ type: 'node_changed', nodeId: this.currentNodeId });
      return true;
    }
    return false;
  }

  public makeChoice(choiceId: string): boolean {
    const node = this.getCurrentNode();
    if (!node || !node.choices) return false;

    const choice = node.choices.find(c => c.id === choiceId);
    if (!choice) return false;

    if (!this.checkChoiceConditions(choice)) return false;

    this.applyChoiceEffects(choice);
    this.history.push({ nodeId: this.currentNodeId, choiceId });
    this.completedNodes.add(this.currentNodeId);

    if (choice.nextNode) {
      this.goToNode(choice.nextNode);
    }

    this.emit({ type: 'choice_made', choiceId, effects: choice.effects });

    return true;
  }

  private checkChoiceConditions(choice: StoryChoice): boolean {
    if (!choice.conditions || choice.conditions.length === 0) return true;

    return choice.conditions.every(cond => this.evaluateCondition(cond));
  }

  private evaluateCondition(cond: StoryCondition): boolean {
    switch (cond.type) {
      case 'stat': {
        const value = this.player[cond.target as keyof PlayerStats];
        return this.compareValues(value, cond.operator, cond.value);
      }

      case 'flag': {
        const flagValue = this.flags[cond.target];
        if (cond.operator === 'exists') return flagValue !== undefined;
        if (cond.operator === 'not_exists') return flagValue === undefined;
        return this.compareValues(flagValue, cond.operator, cond.value);
      }

      case 'relationship': {
        const rel = this.relationships[cond.target];
        if (!rel) return this.compareValues(0, cond.operator, cond.value);
        const value = rel.affection + rel.trust;
        return this.compareValues(value, cond.operator, cond.value);
      }

      case 'chapter':
        return this.compareValues(this.chapter, cond.operator, cond.value);

      case 'path':
        return this.compareValues(this.currentPath, cond.operator, cond.value);

      default:
        return true;
    }
  }

  private compareValues(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'neq': return actual !== expected;
      case 'gt': return Number(actual) > Number(expected);
      case 'lt': return Number(actual) < Number(expected);
      case 'gte': return Number(actual) >= Number(expected);
      case 'lte': return Number(actual) <= Number(expected);
      case 'includes': return Array.isArray(actual) && actual.includes(expected);
      case 'exists': return actual !== undefined;
      case 'not_exists': return actual === undefined;
      default: return true;
    }
  }

  private applyChoiceEffects(choice: StoryChoice) {
    const effects = choice.effects;
    if (!effects) return;

    if (effects.stats) {
      for (const [stat, delta] of Object.entries(effects.stats)) {
        if (typeof delta !== 'number') continue;
        this.player[stat as keyof PlayerStats] += delta;
        this.emit({ type: 'stats_changed', changes: { [stat]: delta } });
      }
    }

    let bridgeChanged = false;

    if (effects.flags) {
      for (const [flag, value] of Object.entries(effects.flags)) {
        this.flags[flag] = value as boolean | number | string;
        this.emit({ type: 'flag_changed', flagId: flag, value });
        bridgeChanged = this.syncBridgeStateByFlag(flag, value) || bridgeChanged;
      }
    }

    if (effects.relationships) {
      for (const [charId, change] of Object.entries(effects.relationships)) {
        if (!this.relationships[charId]) {
          this.relationships[charId] = { affection: 0, trust: 0 };
        }
        const rel = this.relationships[charId];
        if (typeof change === 'object' && change !== null) {
          if ((change as { affection?: number }).affection) rel.affection += (change as { affection: number }).affection;
          if ((change as { trust?: number }).trust) rel.trust += (change as { trust: number }).trust;
        }
        this.emit({ type: 'relationship_changed', characterId: charId, changes: rel });
      }
    }

    if (effects.path) {
      this.currentPath = effects.path;
    }

    if (bridgeChanged) {
      this.emit({ type: 'bridge_state_changed', state: this.getBridgeState() });
    }
  }

  public getAvailableChoices(): StoryChoice[] {
    const node = this.getCurrentNode();
    if (!node || !node.choices) return [];

    return node.choices
      .filter(choice => this.checkChoiceConditions(choice))
      .map(choice => ({
        ...choice,
        disabled: false,
      }));
  }

  public getPlayerStats(): PlayerStats {
    return { ...this.player };
  }

  public getRelationships(): Relationships {
    return JSON.parse(JSON.stringify(this.relationships));
  }

  public getFlags(): StoryFlags {
    return { ...this.flags };
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }

  public getChapter(): number {
    return this.chapter;
  }

  public getScene(): number {
    return this.scene;
  }

  public getChapterProgress(): {
    chapterId: string;
    visited: number;
    total: number;
    ratio: number;
  } {
    const chapterId = this.currentChapterId;
    const chapterNodeIds = Array.from(this.nodeMap.keys()).filter((nodeId) =>
      this.isNodeInChapter(nodeId, chapterId)
    );
    const visited = chapterNodeIds.filter((nodeId) => this.visitedNodes.has(nodeId)).length;
    const total = Math.max(1, chapterNodeIds.length);
    return {
      chapterId,
      visited,
      total,
      ratio: Math.min(1, visited / total),
    };
  }

  public getBridgeState(): StoryBattleBridgeState {
    return {
      unlockedFactions: [...this.bridgeState.unlockedFactions],
      unlockedCards: [...this.bridgeState.unlockedCards],
      chapterFlags: [...this.bridgeState.chapterFlags],
      lastStoryEndingId: this.bridgeState.lastStoryEndingId,
    };
  }

  public save(): StorySaveData {
    const historyEntries = this.history
      .filter((entry) => this.nodeMap.has(entry.nodeId))
      .map((entry) => (entry.choiceId ? { nodeId: entry.nodeId, choiceId: entry.choiceId } : { nodeId: entry.nodeId }));
    const historyNodeIds = historyEntries.map((entry) => entry.nodeId);
    const historyChoices = historyEntries
      .filter((entry): entry is { nodeId: string; choiceId: string } => typeof entry.choiceId === 'string')
      .map((entry) => ({ nodeId: entry.nodeId, choiceId: entry.choiceId }));

    return {
      version: STORY_SAVE_VERSION,
      timestamp: Date.now(),
      currentNodeId: this.currentNodeId,
      player: {
        stats: { ...this.player },
        relationships: JSON.parse(JSON.stringify(this.relationships)),
        flags: { ...this.flags },
      },
      progress: {
        chapter: this.chapter,
        scene: this.scene,
        completedNodes: Array.from(this.completedNodes),
        visitedNodes: Array.from(this.visitedNodes),
      },
      history: {
        nodeIds: historyNodeIds,
        choices: historyChoices,
        entries: historyEntries,
      },
      runtime: {
        currentPath: this.currentPath,
        currentChapterId: this.currentChapterId,
        completedChapters: Array.from(this.completedChapters),
      },
      bridgeState: this.getBridgeState(),
    };
  }

  public persist(slot: SaveSlotType = 'autosave'): void {
    const saveData = this.save();
    const STORAGE_KEY = STORAGE_KEYS[slot];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch (err) {
      console.error('Failed to persist story save:', err);
    }
  }

  public restore(slot: SaveSlotType = 'autosave'): boolean {
    const STORAGE_KEY = STORAGE_KEYS[slot];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saveData = this.parseSavePayload(raw);
      if (!saveData) return false;
      this.load(saveData);
      return true;
    } catch (err) {
      console.error('Failed to restore story save:', err);
      return false;
    }
  }

  public hasSaveData(slot: SaveSlotType = 'autosave'): boolean {
    const STORAGE_KEY = STORAGE_KEYS[slot];
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  public deleteSaveData(slot: SaveSlotType = 'autosave'): void {
    const STORAGE_KEY = STORAGE_KEYS[slot];
    localStorage.removeItem(STORAGE_KEY);
  }

  public getSaveSlots(): Record<SaveSlotType, SaveSlotInfo> {
    const slots: SaveSlotType[] = ['autosave', 'manual_1', 'manual_2', 'manual_3'];
    const result: Record<SaveSlotType, SaveSlotInfo> = {
      autosave: { exists: false },
      manual_1: { exists: false },
      manual_2: { exists: false },
      manual_3: { exists: false },
    };

    for (const slot of slots) {
      const STORAGE_KEY = STORAGE_KEYS[slot];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saveData = this.parseSavePayload(raw);
        if (!saveData) {
          result[slot] = { exists: false };
          continue;
        }
        const progress = saveData.progress ?? { chapter: this.extractChapterFromNodeId(saveData.currentNodeId), scene: 0, completedNodes: [] };
        const completedNodes = Array.isArray(progress.completedNodes) ? progress.completedNodes : [];
        const visitedNodes = Array.isArray(progress.visitedNodes) ? progress.visitedNodes : [];
        result[slot] = {
          exists: true,
          timestamp: saveData.timestamp,
          chapter: typeof progress.chapter === 'number' ? progress.chapter : this.extractChapterFromNodeId(saveData.currentNodeId),
          currentNodeId: saveData.currentNodeId,
          nodeCount: visitedNodes.length > 0 ? visitedNodes.length : completedNodes.length,
        };
      }
    }

    return result;
  }

  public saveManual(slot: SaveSlotType): boolean {
    if (!slot.startsWith('manual_') || slot === 'autosave') return false;
    this.persist(slot);
    return true;
  }

  public loadSlot(slot: SaveSlotType): boolean {
    return this.restore(slot);
  }

  public load(saveData: StorySaveData) {
    const safeNodeId = this.nodeMap.has(saveData.currentNodeId) ? saveData.currentNodeId : 'prolog_0_1';
    this.currentNodeId = safeNodeId;

    const savedStats = saveData.player?.stats;
    this.player = {
      fame: typeof savedStats?.fame === 'number' ? savedStats.fame : 0,
      wisdom: typeof savedStats?.wisdom === 'number' ? savedStats.wisdom : 5,
      charm: typeof savedStats?.charm === 'number' ? savedStats.charm : 5,
      courage: typeof savedStats?.courage === 'number' ? savedStats.courage : 5,
      insight: typeof savedStats?.insight === 'number' ? savedStats.insight : 5,
    };

    this.relationships = JSON.parse(JSON.stringify(saveData.player?.relationships ?? {}));
    this.flags = { ...(saveData.player?.flags ?? {}) };

    const savedProgress = saveData.progress ?? { chapter: 0, scene: 0, completedNodes: [] };
    this.chapter = typeof savedProgress.chapter === 'number' ? savedProgress.chapter : 0;
    this.scene = typeof savedProgress.scene === 'number' ? savedProgress.scene : 0;

    const completedNodes = Array.isArray(savedProgress.completedNodes)
      ? savedProgress.completedNodes.filter((nodeId) => typeof nodeId === 'string' && this.nodeMap.has(nodeId))
      : [];
    const visitedNodesRaw = Array.isArray(savedProgress.visitedNodes) && savedProgress.visitedNodes.length > 0
      ? savedProgress.visitedNodes
      : completedNodes;
    const visitedNodes = visitedNodesRaw
      .filter((nodeId) => typeof nodeId === 'string' && this.nodeMap.has(nodeId));

    this.completedNodes = new Set(completedNodes);
    this.visitedNodes = new Set(visitedNodes);
    this.markNodeVisited(this.currentNodeId);

    this.history = this.restoreHistoryFromSave(saveData);
    this.currentPath = saveData.runtime?.currentPath ?? 'none';

    const completedChapters = Array.isArray(saveData.runtime?.completedChapters)
      ? saveData.runtime?.completedChapters.filter((chapterId) => typeof chapterId === 'string')
      : [];
    this.completedChapters = new Set(completedChapters);

    const bridgeState = saveData.bridgeState;
    this.bridgeState = {
      unlockedFactions: Array.isArray(bridgeState?.unlockedFactions)
        ? [...new Set(bridgeState.unlockedFactions.filter((item) => typeof item === 'string'))]
        : [],
      unlockedCards: Array.isArray(bridgeState?.unlockedCards)
        ? [...new Set(bridgeState.unlockedCards.filter((item) => typeof item === 'string'))]
        : [],
      chapterFlags: Array.isArray(bridgeState?.chapterFlags)
        ? [...new Set(bridgeState.chapterFlags.filter((item) => typeof item === 'string'))]
        : [],
      lastStoryEndingId: typeof bridgeState?.lastStoryEndingId === 'string'
        ? bridgeState.lastStoryEndingId
        : undefined,
    };

    this.syncChapterByNodeId(this.currentNodeId);

    this.emit({ type: 'node_changed', nodeId: this.currentNodeId });
    this.emit({ type: 'bridge_state_changed', state: this.getBridgeState() });
  }

  private parseSavePayload(raw: string): StorySaveData | null {
    try {
      const parsed = JSON.parse(raw) as Partial<StorySaveData>;
      if (!parsed || typeof parsed !== 'object') return null;
      if (typeof parsed.currentNodeId !== 'string') return null;
      return parsed as StorySaveData;
    } catch {
      return null;
    }
  }

  private restoreHistoryFromSave(saveData: StorySaveData): Array<{ nodeId: string; choiceId?: string }> {
    const result: Array<{ nodeId: string; choiceId?: string }> = [];

    if (Array.isArray(saveData.history?.entries) && saveData.history.entries.length > 0) {
      for (const entry of saveData.history.entries) {
        if (!entry || typeof entry.nodeId !== 'string' || !this.nodeMap.has(entry.nodeId)) continue;
        if (typeof entry.choiceId === 'string') {
          result.push({ nodeId: entry.nodeId, choiceId: entry.choiceId });
        } else {
          result.push({ nodeId: entry.nodeId });
        }
      }
      return result;
    }

    const choiceByNode = new Map<string, string>();
    if (Array.isArray(saveData.history?.choices)) {
      for (const item of saveData.history.choices) {
        if (!item || typeof item.nodeId !== 'string' || typeof item.choiceId !== 'string') continue;
        if (!choiceByNode.has(item.nodeId)) {
          choiceByNode.set(item.nodeId, item.choiceId);
        }
      }
    }

    const nodeIds = Array.isArray(saveData.history?.nodeIds) ? saveData.history.nodeIds : [];
    for (const nodeId of nodeIds) {
      if (typeof nodeId !== 'string' || !this.nodeMap.has(nodeId)) continue;
      const choiceId = choiceByNode.get(nodeId);
      if (choiceId) {
        result.push({ nodeId, choiceId });
      } else {
        result.push({ nodeId });
      }
    }

    return result;
  }

  private extractChapterFromNodeId(nodeId: string): number {
    const chapterMatch = /^(?:ch_[a-z]+_(\d{3}))_/i.exec(nodeId);
    if (chapterMatch) return Number(chapterMatch[1]);
    if (nodeId.startsWith('prolog_0')) return 0;
    return 0;
  }

  public updateSettings(settings: Partial<StorySettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  public getSettings(): StorySettings {
    return { ...this.settings };
  }

  public subscribe(callback: (event: StoryEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(event: StoryEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public getHistory(): Array<{ nodeId: string; choiceId?: string }> {
    return [...this.history];
  }

  public isNodeCompleted(nodeId: string): boolean {
    return this.completedNodes.has(nodeId);
  }

  public setPath(path: string) {
    this.currentPath = path;
  }

  private markNodeVisited(nodeId: string) {
    this.visitedNodes.add(nodeId);
  }

  private syncChapterByNodeId(nodeId: string) {
    const chapterMatch = /^(ch_[a-z]+_(\d{3}))_n(\d{3})$/i.exec(nodeId);
    if (chapterMatch) {
      this.currentChapterId = chapterMatch[1];
      this.chapter = Number(chapterMatch[2]);
      this.scene = Number(chapterMatch[3]);
      return;
    }

    const endingMatch = /^ending_(ch_[a-z]+_(\d{3}))_/i.exec(nodeId);
    if (endingMatch) {
      this.currentChapterId = endingMatch[1];
      this.chapter = Number(endingMatch[2]);
      this.scene = 999;
      return;
    }

    if (nodeId.startsWith('prolog_0')) {
      this.currentChapterId = 'prolog_0';
      this.chapter = 0;
      const sceneMatch = /^prolog_0_(\d+)/i.exec(nodeId);
      this.scene = sceneMatch ? Number(sceneMatch[1]) : 0;
    }
  }

  private isNodeInChapter(nodeId: string, chapterId: string): boolean {
    if (chapterId === 'prolog_0') {
      return nodeId.startsWith('prolog_0');
    }
    return nodeId.startsWith(`${chapterId}_`) || nodeId.startsWith(`ending_${chapterId}_`);
  }

  private syncBridgeStateByFlag(flag: string, value: unknown): boolean {
    let changed = false;

    if (flag === 'chosen_faction' && typeof value === 'string' && value !== 'none') {
      if (!this.bridgeState.unlockedFactions.includes(value)) {
        this.bridgeState.unlockedFactions.push(value);
        changed = true;
      }
    }

    if (flag.startsWith('unlock_card_') && typeof value === 'string') {
      if (!this.bridgeState.unlockedCards.includes(value)) {
        this.bridgeState.unlockedCards.push(value);
        changed = true;
      }
    }

    if (flag.endsWith('_completed') && value === true) {
      if (!this.bridgeState.chapterFlags.includes(flag)) {
        this.bridgeState.chapterFlags.push(flag);
        changed = true;
      }
    }

    return changed;
  }

  private handleChapterEnding(endingId: string) {
    const match = /^ending_(ch_[a-z]+_\d{3})_/i.exec(endingId);
    if (!match) return;

    const chapterId = match[1];
    if (this.completedChapters.has(chapterId)) {
      return;
    }
    this.completedChapters.add(chapterId);

    const chapterFlag = `${chapterId}_done`;
    if (!this.bridgeState.chapterFlags.includes(chapterFlag)) {
      this.bridgeState.chapterFlags.push(chapterFlag);
    }

    this.bridgeState.lastStoryEndingId = endingId;

    const chosenFaction = this.flags['chosen_faction'];
    if (typeof chosenFaction === 'string' && chosenFaction !== 'none') {
      if (!this.bridgeState.unlockedFactions.includes(chosenFaction)) {
        this.bridgeState.unlockedFactions.push(chosenFaction);
      }
    }

    this.emit({ type: 'chapter_completed', chapterId, endingId });
    this.emit({ type: 'bridge_state_changed', state: this.getBridgeState() });
  }
}

let storyEngineInstance: StoryEngine | null = null;

export function getStoryEngine(): StoryEngine {
  if (!storyEngineInstance) {
    storyEngineInstance = new StoryEngine();
    storyEngineInstance.init();
  }
  return storyEngineInstance;
}

export function resetStoryEngine(): StoryEngine {
  storyEngineInstance = new StoryEngine();
  storyEngineInstance.init();
  return storyEngineInstance;
}
