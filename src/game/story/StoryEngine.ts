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
    const storyNodes = [...PROLOG_NODES, ...CHAPTER_MORU_001_NODES, ...CHAPTER_MORU_001_PART2_NODES];
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
    const historyNodeIds = this.history.map(h => h.nodeId);
    const historyChoices = this.history
      .filter(h => h.choiceId)
      .map(h => ({ nodeId: h.nodeId, choiceId: h.choiceId as string }));

    return {
      version: '1.0.0',
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
      },
      history: {
        nodeIds: historyNodeIds,
        choices: historyChoices,
      },
    };
  }

  public persist(): void {
    const saveData = this.save();
    const STORAGE_KEY = 'jixia.story.autosave.v1';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch (err) {
      console.error('Failed to persist story save:', err);
    }
  }

  public restore(): boolean {
    const STORAGE_KEY = 'jixia.story.autosave.v1';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saveData = JSON.parse(raw) as StorySaveData;
      this.load(saveData);
      return true;
    } catch (err) {
      console.error('Failed to restore story save:', err);
      return false;
    }
  }

  public hasSaveData(): boolean {
    const STORAGE_KEY = 'jixia.story.autosave.v1';
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  public deleteSaveData(): void {
    const STORAGE_KEY = 'jixia.story.autosave.v1';
    localStorage.removeItem(STORAGE_KEY);
  }

  public load(saveData: StorySaveData) {
    this.currentNodeId = saveData.currentNodeId;
    this.player = { ...saveData.player.stats };
    this.relationships = JSON.parse(JSON.stringify(saveData.player.relationships));
    this.flags = { ...saveData.player.flags };
    this.chapter = saveData.progress.chapter;
    this.scene = saveData.progress.scene;
    this.completedNodes = new Set(saveData.progress.completedNodes);
    this.visitedNodes = new Set(saveData.progress.completedNodes);
    this.markNodeVisited(this.currentNodeId);
    this.history = saveData.history.choices.map(c => ({ nodeId: c.nodeId, choiceId: c.choiceId }));
    this.syncChapterByNodeId(this.currentNodeId);

    this.emit({ type: 'node_changed', nodeId: this.currentNodeId });
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
