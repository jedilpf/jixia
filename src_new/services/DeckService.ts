import { Card } from "../types/card";

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: DeckCard[];
  heroId: string;
  heroName: string;
  isDefault: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  playCount: number;
  winCount: number;
  tags: string[];
}

export interface DeckCard {
  cardId: string;
  card: Card;
  count: number;
}

export interface DeckStats {
  totalCards: number;
  minionCount: number;
  spellCount: number;
  averageCost: number;
  curve: Record<number, number>;
  rarityDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  heroId: string;
  heroName: string;
  cardIds: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

export const DECK_RULES = {
  MIN_CARDS: 30,
  MAX_CARDS: 30,
  MAX_SAME_CARD: 2,
  MAX_LEGENDARY: 1,
  MAX_DECKS: 20,
};

export const DECK_TEMPLATES: DeckTemplate[] = [
  {
    id: "template_aggro",
    name: "快攻卡组",
    description: "快速出击，迅速击败对手",
    heroId: "warrior",
    heroName: "战士",
    cardIds: ["card_001", "card_002", "card_003"],
    difficulty: "beginner",
    tags: ["aggro", "fast", "beginner"],
  },
  {
    id: "template_control",
    name: "控制卡组",
    description: "控制场面，后期发力",
    heroId: "mage",
    heroName: "法师",
    cardIds: ["card_004", "card_005", "card_006"],
    difficulty: "advanced",
    tags: ["control", "late_game", "advanced"],
  },
  {
    id: "template_midrange",
    name: "中速卡组",
    description: "平衡攻守，稳扎稳打",
    heroId: "hunter",
    heroName: "猎人",
    cardIds: ["card_007", "card_008", "card_009"],
    difficulty: "intermediate",
    tags: ["midrange", "balanced", "intermediate"],
  },
  {
    id: "template_combo",
    name: "连击卡组",
    description: "组合技爆发，一击必杀",
    heroId: "rogue",
    heroName: "刺客",
    cardIds: ["card_010", "card_011", "card_012"],
    difficulty: "advanced",
    tags: ["combo", "burst", "advanced"],
  },
];

export class DeckService {
  private static readonly DECKS_KEY = "jixia_decks";
  private static readonly CURRENT_DECK_KEY = "jixia_current_deck";

  private decks: Map<string, Deck> = new Map();
  private currentDeckId: string | null = null;
  private observers: Set<(event: DeckEvent) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const decksData = localStorage.getItem(DeckService.DECKS_KEY);
      if (decksData) {
        const decks = JSON.parse(decksData);
        this.decks = new Map(Object.entries(decks));
      }

      const currentDeck = localStorage.getItem(DeckService.CURRENT_DECK_KEY);
      if (currentDeck) {
        this.currentDeckId = currentDeck;
      }
    } catch (e) {
      console.warn("Failed to load decks from storage");
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.decks);
      localStorage.setItem(DeckService.DECKS_KEY, JSON.stringify(data));
      if (this.currentDeckId) {
        localStorage.setItem(DeckService.CURRENT_DECK_KEY, this.currentDeckId);
      }
    } catch (e) {
      console.warn("Failed to save decks to storage");
    }
  }

  createDeck(
    name: string,
    heroId: string,
    heroName: string,
    description?: string
  ): Deck {
    if (this.decks.size >= DECK_RULES.MAX_DECKS) {
      throw new Error(`最多只能创建${DECK_RULES.MAX_DECKS}个卡组`);
    }

    const deck: Deck = {
      id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      cards: [],
      heroId,
      heroName,
      isDefault: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      playCount: 0,
      winCount: 0,
      tags: [],
    };

    this.decks.set(deck.id, deck);
    this.saveToStorage();
    this.notifyObservers({ type: "deck_created", data: deck });

    return deck;
  }

  createDeckFromTemplate(templateId: string): Deck {
    const template = DECK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error("模板不存在");
    }

    const deck = this.createDeck(
      `${template.name} (模板)`,
      template.heroId,
      template.heroName,
      template.description
    );

    // 这里需要根据cardIds加载实际卡牌数据
    // 暂时留空，等待接入卡牌数据

    return deck;
  }

  getDeck(deckId: string): Deck | undefined {
    return this.decks.get(deckId);
  }

  getAllDecks(): Deck[] {
    return Array.from(this.decks.values()).sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }

  getDecksByHero(heroId: string): Deck[] {
    return this.getAllDecks().filter((d) => d.heroId === heroId);
  }

  getFavoriteDecks(): Deck[] {
    return this.getAllDecks().filter((d) => d.isFavorite);
  }

  updateDeck(deckId: string, updates: Partial<Deck>): Deck | null {
    const deck = this.decks.get(deckId);
    if (!deck) return null;

    Object.assign(deck, updates, { updatedAt: Date.now() });
    this.saveToStorage();
    this.notifyObservers({ type: "deck_updated", data: deck });

    return deck;
  }

  deleteDeck(deckId: string): boolean {
    const deleted = this.decks.delete(deckId);
    if (deleted) {
      if (this.currentDeckId === deckId) {
        this.currentDeckId = null;
      }
      this.saveToStorage();
      this.notifyObservers({ type: "deck_deleted", data: { deckId } });
    }
    return deleted;
  }

  duplicateDeck(deckId: string, newName?: string): Deck | null {
    const deck = this.decks.get(deckId);
    if (!deck) return null;

    if (this.decks.size >= DECK_RULES.MAX_DECKS) {
      throw new Error(`最多只能创建${DECK_RULES.MAX_DECKS}个卡组`);
    }

    const duplicated: Deck = {
      ...deck,
      id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${deck.name} (复制)`,
      isDefault: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      playCount: 0,
      winCount: 0,
    };

    this.decks.set(duplicated.id, duplicated);
    this.saveToStorage();
    this.notifyObservers({ type: "deck_created", data: duplicated });

    return duplicated;
  }

  addCard(deckId: string, card: Card, count: number = 1): DeckValidationResult {
    const deck = this.decks.get(deckId);
    if (!deck) {
      return { isValid: false, errors: ["卡组不存在"], warnings: [] };
    }

    const existingCard = deck.cards.find((c) => c.cardId === card.id);
    const currentCount = existingCard?.count || 0;

    // 检查是否超过单卡上限
    const maxCount = card.rarity === "legendary" ? DECK_RULES.MAX_LEGENDARY : DECK_RULES.MAX_SAME_CARD;
    if (currentCount + count > maxCount) {
      return {
        isValid: false,
        errors: [`${card.name} 最多只能携带${maxCount}张`],
        warnings: [],
      };
    }

    // 检查卡组总数量
    const totalCards = deck.cards.reduce((sum, c) => sum + c.count, 0);
    if (totalCards + count > DECK_RULES.MAX_CARDS) {
      return {
        isValid: false,
        errors: [`卡组已满，最多${DECK_RULES.MAX_CARDS}张卡牌`],
        warnings: [],
      };
    }

    // 添加卡牌
    if (existingCard) {
      existingCard.count += count;
    } else {
      deck.cards.push({ cardId: card.id, card, count });
    }

    deck.updatedAt = Date.now();
    this.saveToStorage();
    this.notifyObservers({ type: "deck_updated", data: deck });

    return this.validateDeck(deckId);
  }

  removeCard(deckId: string, cardId: string, count: number = 1): DeckValidationResult {
    const deck = this.decks.get(deckId);
    if (!deck) {
      return { isValid: false, errors: ["卡组不存在"], warnings: [] };
    }

    const cardIndex = deck.cards.findIndex((c) => c.cardId === cardId);
    if (cardIndex === -1) {
      return { isValid: false, errors: ["卡牌不在卡组中"], warnings: [] };
    }

    const deckCard = deck.cards[cardIndex];
    deckCard.count -= count;

    if (deckCard.count <= 0) {
      deck.cards.splice(cardIndex, 1);
    }

    deck.updatedAt = Date.now();
    this.saveToStorage();
    this.notifyObservers({ type: "deck_updated", data: deck });

    return this.validateDeck(deckId);
  }

  validateDeck(deckId: string): DeckValidationResult {
    const deck = this.decks.get(deckId);
    if (!deck) {
      return { isValid: false, errors: ["卡组不存在"], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const totalCards = deck.cards.reduce((sum, c) => sum + c.count, 0);

    // 检查卡牌数量
    if (totalCards < DECK_RULES.MIN_CARDS) {
      errors.push(`卡组需要至少${DECK_RULES.MIN_CARDS}张卡牌`);
    }
    if (totalCards > DECK_RULES.MAX_CARDS) {
      errors.push(`卡组不能超过${DECK_RULES.MAX_CARDS}张卡牌`);
    }

    // 检查单卡数量
    for (const deckCard of deck.cards) {
      const maxCount = deckCard.card.rarity === "legendary" ? DECK_RULES.MAX_LEGENDARY : DECK_RULES.MAX_SAME_CARD;
      if (deckCard.count > maxCount) {
        errors.push(`${deckCard.card.name} 超过了数量限制`);
      }
    }

    // 警告：高费用卡牌过多
    const highCostCards = deck.cards.filter((c) => c.card.cost >= 6);
    if (highCostCards.length > 5) {
      warnings.push("高费用卡牌较多，可能导致前期乏力");
    }

    // 警告：低费用卡牌过少
    const lowCostCards = deck.cards.filter((c) => c.card.cost <= 3);
    if (lowCostCards.length < 10) {
      warnings.push("低费用卡牌较少，可能影响前期节奏");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getDeckStats(deckId: string): DeckStats | null {
    const deck = this.decks.get(deckId);
    if (!deck) return null;

    const curve: Record<number, number> = {};
    const rarityDistribution: Record<string, number> = {};
    const typeDistribution: Record<string, number> = {};

    let totalCost = 0;
    let minionCount = 0;
    let spellCount = 0;

    for (const deckCard of deck.cards) {
      const card = deckCard.card;
      const count = deckCard.count;

      // 费用曲线
      const cost = Math.min(card.cost, 7);
      curve[cost] = (curve[cost] || 0) + count;

      // 稀有度分布
      rarityDistribution[card.rarity] = (rarityDistribution[card.rarity] || 0) + count;

      // 类型分布
      typeDistribution[card.type] = (typeDistribution[card.type] || 0) + count;

      // 统计
      totalCost += card.cost * count;
      if (card.type === "minion") minionCount += count;
      if (card.type === "spell") spellCount += count;
    }

    const totalCards = deck.cards.reduce((sum, c) => sum + c.count, 0);

    return {
      totalCards,
      minionCount,
      spellCount,
      averageCost: totalCards > 0 ? Math.round((totalCost / totalCards) * 10) / 10 : 0,
      curve,
      rarityDistribution,
      typeDistribution,
    };
  }

  setCurrentDeck(deckId: string | null): boolean {
    if (deckId && !this.decks.has(deckId)) {
      return false;
    }

    this.currentDeckId = deckId;
    this.saveToStorage();
    this.notifyObservers({ type: "current_deck_changed", data: { deckId } });
    return true;
  }

  getCurrentDeck(): Deck | null {
    if (!this.currentDeckId) return null;
    return this.decks.get(this.currentDeckId) || null;
  }

  setFavorite(deckId: string, isFavorite: boolean): boolean {
    const deck = this.decks.get(deckId);
    if (!deck) return false;

    deck.isFavorite = isFavorite;
    deck.updatedAt = Date.now();
    this.saveToStorage();
    this.notifyObservers({ type: "deck_updated", data: deck });
    return true;
  }

  setDefault(deckId: string): boolean {
    // 取消其他默认卡组
    for (const deck of this.decks.values()) {
      deck.isDefault = false;
    }

    const deck = this.decks.get(deckId);
    if (!deck) return false;

    deck.isDefault = true;
    deck.updatedAt = Date.now();
    this.saveToStorage();
    this.notifyObservers({ type: "deck_updated", data: deck });
    return true;
  }

  recordGameResult(deckId: string, isWin: boolean): void {
    const deck = this.decks.get(deckId);
    if (!deck) return;

    deck.playCount++;
    if (isWin) deck.winCount++;
    deck.updatedAt = Date.now();
    this.saveToStorage();
  }

  getDeckWinRate(deckId: string): number {
    const deck = this.decks.get(deckId);
    if (!deck || deck.playCount === 0) return 0;
    return Math.round((deck.winCount / deck.playCount) * 100);
  }

  importDeck(deckCode: string): Deck | null {
    try {
      // 解析卡组代码
      const data = JSON.parse(atob(deckCode));
      if (!data.name || !data.heroId || !data.cards) {
        throw new Error("Invalid deck code");
      }

      const deck = this.createDeck(data.name, data.heroId, data.heroName, data.description);

      // 导入卡牌
      for (const cardData of data.cards) {
        // 这里需要根据cardId加载实际卡牌数据
        // deck.cards.push({...})
      }

      this.saveToStorage();
      return deck;
    } catch (e) {
      console.error("Failed to import deck", e);
      return null;
    }
  }

  exportDeck(deckId: string): string | null {
    const deck = this.decks.get(deckId);
    if (!deck) return null;

    const data = {
      name: deck.name,
      description: deck.description,
      heroId: deck.heroId,
      heroName: deck.heroName,
      cards: deck.cards.map((c) => ({ id: c.cardId, count: c.count })),
      exportDate: Date.now(),
    };

    return btoa(JSON.stringify(data));
  }

  searchDecks(query: string): Deck[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllDecks().filter(
      (d) =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.description?.toLowerCase().includes(lowerQuery) ||
        d.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }

  getTemplates(): DeckTemplate[] {
    return DECK_TEMPLATES;
  }

  subscribe(callback: (event: DeckEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: DeckEvent): void {
    this.observers.forEach((callback) => callback(event));
  }

  clearAllDecks(): void {
    this.decks.clear();
    this.currentDeckId = null;
    this.saveToStorage();
  }
}

export interface DeckEvent {
  type: "deck_created" | "deck_updated" | "deck_deleted" | "current_deck_changed";
  data: unknown;
}

export const deckService = new DeckService();
