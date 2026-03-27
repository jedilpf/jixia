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
} from './types';

import { PROLOG_NODES } from './data/prolog';

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
  private chapter: number = 0;
  private scene: number = 0;
  private currentPath: string = 'none';

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
    for (const node of PROLOG_NODES) {
      this.nodeMap.set(node.id, node);
    }
  }

  public init(initialNodeId?: string) {
    if (initialNodeId && this.nodeMap.has(initialNodeId)) {
      this.currentNodeId = initialNodeId;
    } else {
      this.currentNodeId = 'prolog_0_1';
    }
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

    const node = this.getCurrentNode();
    if (node) {
      if (node.id.startsWith('chapter_1')) this.chapter = 1;
      if (node.id.startsWith('chapter_2')) this.chapter = 2;
      if (node.id.startsWith('chapter_3')) this.chapter = 3;
      if (node.id.startsWith('ending')) this.chapter = 99;
    }

    this.emit({ type: 'node_changed', nodeId });
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
        this.player[stat as keyof PlayerStats] += delta as number;
        this.emit({ type: 'stats_changed', changes: { [stat]: delta } });
      }
    }

    if (effects.flags) {
      for (const [flag, value] of Object.entries(effects.flags)) {
        this.flags[flag] = value as boolean | number | string;
        this.emit({ type: 'flag_changed', flagId: flag, value });
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

  public load(saveData: StorySaveData) {
    this.currentNodeId = saveData.currentNodeId;
    this.player = { ...saveData.player.stats };
    this.relationships = JSON.parse(JSON.stringify(saveData.player.relationships));
    this.flags = { ...saveData.player.flags };
    this.chapter = saveData.progress.chapter;
    this.scene = saveData.progress.scene;
    this.completedNodes = new Set(saveData.progress.completedNodes);
    this.history = saveData.history.choices.map(c => ({ nodeId: c.nodeId, choiceId: c.choiceId }));

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
