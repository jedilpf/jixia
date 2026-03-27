import { Card, CardRarity, CardType } from "../types/card";

export interface CollectionCard {
  cardId: string;
  card: Card;
  count: number;
  isNew: boolean;
  obtainedAt: number;
  isFavorite: boolean;
}

export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  completionPercentage: number;
  rarityStats: Record<CardRarity, { owned: number; total: number; percentage: number }>;
  typeStats: Record<CardType, number>;
  costDistribution: Record<number, number>;
  recentObtained: CollectionCard[];
}

export interface CardFilter {
  rarities?: CardRarity[];
  types?: CardType[];
  costRange?: { min: number; max: number };
  searchQuery?: string;
  showOnlyNew?: boolean;
  showOnlyFavorites?: boolean;
  sortBy?: "name" | "cost" | "rarity" | "obtained" | "count";
  sortOrder?: "asc" | "desc";
}

export interface DustInfo {
  currentDust: number;
  disenchantValues: Record<CardRarity, number>;
  craftCosts: Record<CardRarity, number>;
}

export const DUST_VALUES: DustInfo = {
  currentDust: 0,
  disenchantValues: {
    common: 5,
    rare: 20,
    epic: 100,
    legendary: 400,
  },
  craftCosts: {
    common: 40,
    rare: 100,
    epic: 400,
    legendary: 1600,
  },
};

export class CollectionService {
  private static readonly COLLECTION_KEY = "jixia_collection";
  private static readonly DUST_KEY = "jixia_dust";
  private static readonly MAX_CARD_COUNT = 2;
  private static readonly MAX_LEGENDARY_COUNT = 1;

  private collection: Map<string, CollectionCard> = new Map();
  private dust: number = 0;
  private observers: Set<(event: CollectionEvent) => void> = new Set();
  private allCards: Card[] = []; // 所有可用卡牌

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const collectionData = localStorage.getItem(CollectionService.COLLECTION_KEY);
      if (collectionData) {
        const cards = JSON.parse(collectionData);
        this.collection = new Map(Object.entries(cards));
      }

      const dustData = localStorage.getItem(CollectionService.DUST_KEY);
      if (dustData) {
        this.dust = parseInt(dustData, 10);
      }
    } catch (e) {
      console.warn("Failed to load collection from storage");
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.collection);
      localStorage.setItem(CollectionService.COLLECTION_KEY, JSON.stringify(data));
      localStorage.setItem(CollectionService.DUST_KEY, this.dust.toString());
    } catch (e) {
      console.warn("Failed to save collection to storage");
    }
  }

  // 设置所有可用卡牌
  setAllCards(cards: Card[]): void {
    this.allCards = cards;
  }

  // 添加卡牌到收藏
  addCard(card: Card, count: number = 1, source: string = "unknown"): CollectionCard {
    const existing = this.collection.get(card.id);
    const maxCount = card.rarity === "legendary" 
      ? CollectionService.MAX_LEGENDARY_COUNT 
      : CollectionService.MAX_CARD_COUNT;

    if (existing) {
      existing.count = Math.min(maxCount, existing.count + count);
      existing.isNew = true;
      existing.obtainedAt = Date.now();
    } else {
      const collectionCard: CollectionCard = {
        cardId: card.id,
        card,
        count: Math.min(count, maxCount),
        isNew: true,
        obtainedAt: Date.now(),
        isFavorite: false,
      };
      this.collection.set(card.id, collectionCard);
    }

    this.saveToStorage();
    this.notifyObservers({ 
      type: "card_added", 
      data: { card, count, source, collectionCard: this.collection.get(card.id) } 
    });

    return this.collection.get(card.id)!;
  }

  // 从卡包添加卡牌
  addCardsFromPack(cardIds: string[]): CollectionCard[] {
    const added: CollectionCard[] = [];
    
    for (const cardId of cardIds) {
      const card = this.allCards.find(c => c.id === cardId);
      if (card) {
        const collectionCard = this.addCard(card, 1, "pack");
        added.push(collectionCard);
      }
    }

    return added;
  }

  // 移除卡牌
  removeCard(cardId: string, count: number = 1): boolean {
    const existing = this.collection.get(cardId);
    if (!existing) return false;

    existing.count -= count;
    
    if (existing.count <= 0) {
      this.collection.delete(cardId);
    }

    this.saveToStorage();
    this.notifyObservers({ type: "card_removed", data: { cardId, count } });
    return true;
  }

  // 分解卡牌获得粉尘
  disenchantCard(cardId: string, count: number = 1): { success: boolean; dustGained: number } {
    const existing = this.collection.get(cardId);
    if (!existing || existing.count <= 0) {
      return { success: false, dustGained: 0 };
    }

    // 保留至少一张
    const maxDisenchant = existing.count - 1;
    const actualCount = Math.min(count, maxDisenchant);

    if (actualCount <= 0) {
      return { success: false, dustGained: 0 };
    }

    const dustPerCard = DUST_VALUES.disenchantValues[existing.card.rarity];
    const totalDust = dustPerCard * actualCount;

    existing.count -= actualCount;
    if (existing.count <= 0) {
      this.collection.delete(cardId);
    }

    this.dust += totalDust;
    this.saveToStorage();

    this.notifyObservers({ 
      type: "card_disenchanted", 
      data: { cardId, count: actualCount, dustGained: totalDust } 
    });

    return { success: true, dustGained: totalDust };
  }

  // 使用粉尘合成卡牌
  craftCard(card: Card): { success: boolean; error?: string } {
    const cost = DUST_VALUES.craftCosts[card.rarity];
    
    if (this.dust < cost) {
      return { success: false, error: "粉尘不足" };
    }

    const existing = this.collection.get(card.id);
    const maxCount = card.rarity === "legendary" 
      ? CollectionService.MAX_LEGENDARY_COUNT 
      : CollectionService.MAX_CARD_COUNT;

    if (existing && existing.count >= maxCount) {
      return { success: false, error: "已达到最大数量" };
    }

    this.dust -= cost;
    this.addCard(card, 1, "craft");

    this.notifyObservers({ 
      type: "card_crafted", 
      data: { card, cost } 
    });

    return { success: true };
  }

  // 获取收藏卡牌
  getCard(cardId: string): CollectionCard | undefined {
    return this.collection.get(cardId);
  }

  // 获取所有收藏
  getAllCards(): CollectionCard[] {
    return Array.from(this.collection.values()).sort((a, b) => {
      // 新获得的排在前面
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      // 按稀有度排序
      const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
      if (rarityOrder[a.card.rarity] !== rarityOrder[b.card.rarity]) {
        return rarityOrder[b.card.rarity] - rarityOrder[a.card.rarity];
      }
      // 按费用排序
      return a.card.cost - b.card.cost;
    });
  }

  // 筛选卡牌
  getFilteredCards(filter: CardFilter): CollectionCard[] {
    let cards = this.getAllCards();

    // 稀有度筛选
    if (filter.rarities && filter.rarities.length > 0) {
      cards = cards.filter(c => filter.rarities!.includes(c.card.rarity));
    }

    // 类型筛选
    if (filter.types && filter.types.length > 0) {
      cards = cards.filter(c => filter.types!.includes(c.card.type));
    }

    // 费用范围筛选
    if (filter.costRange) {
      cards = cards.filter(c => 
        c.card.cost >= filter.costRange!.min && 
        c.card.cost <= filter.costRange!.max
      );
    }

    // 搜索筛选
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      cards = cards.filter(c => 
        c.card.name.toLowerCase().includes(query) ||
        c.card.description?.toLowerCase().includes(query)
      );
    }

    // 仅显示新卡牌
    if (filter.showOnlyNew) {
      cards = cards.filter(c => c.isNew);
    }

    // 仅显示收藏
    if (filter.showOnlyFavorites) {
      cards = cards.filter(c => c.isFavorite);
    }

    // 排序
    if (filter.sortBy) {
      cards.sort((a, b) => {
        let comparison = 0;
        switch (filter.sortBy) {
          case "name":
            comparison = a.card.name.localeCompare(b.card.name);
            break;
          case "cost":
            comparison = a.card.cost - b.card.cost;
            break;
          case "rarity":
            const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
            comparison = rarityOrder[a.card.rarity] - rarityOrder[b.card.rarity];
            break;
          case "obtained":
            comparison = a.obtainedAt - b.obtainedAt;
            break;
          case "count":
            comparison = a.count - b.count;
            break;
        }
        return filter.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return cards;
  }

  // 获取缺失的卡牌
  getMissingCards(): Card[] {
    const ownedIds = new Set(this.collection.keys());
    return this.allCards.filter(card => !ownedIds.has(card.id));
  }

  // 获取可分解的重复卡牌
  getDisenchantableCards(): CollectionCard[] {
    return this.getAllCards().filter(c => {
      const maxCount = c.card.rarity === "legendary" 
        ? CollectionService.MAX_LEGENDARY_COUNT 
        : CollectionService.MAX_CARD_COUNT;
      return c.count > maxCount;
    });
  }

  // 标记卡牌为已查看
  markCardAsSeen(cardId: string): void {
    const card = this.collection.get(cardId);
    if (card) {
      card.isNew = false;
      this.saveToStorage();
    }
  }

  // 标记所有卡牌为已查看
  markAllAsSeen(): void {
    for (const card of this.collection.values()) {
      card.isNew = false;
    }
    this.saveToStorage();
  }

  // 设置收藏
  setFavorite(cardId: string, isFavorite: boolean): boolean {
    const card = this.collection.get(cardId);
    if (!card) return false;

    card.isFavorite = isFavorite;
    this.saveToStorage();
    this.notifyObservers({ type: "card_favorited", data: { cardId, isFavorite } });
    return true;
  }

  // 获取收藏统计
  getStats(): CollectionStats {
    const cards = this.getAllCards();
    const uniqueCards = cards.length;
    const totalCards = cards.reduce((sum, c) => sum + c.count, 0);

    // 稀有度统计
    const rarityStats: Record<CardRarity, { owned: number; total: number; percentage: number }> = {
      common: { owned: 0, total: 0, percentage: 0 },
      rare: { owned: 0, total: 0, percentage: 0 },
      epic: { owned: 0, total: 0, percentage: 0 },
      legendary: { owned: 0, total: 0, percentage: 0 },
    };

    // 类型统计
    const typeStats: Record<CardType, number> = {
      minion: 0,
      spell: 0,
      weapon: 0,
      hero: 0,
    };

    // 费用分布
    const costDistribution: Record<number, number> = {};

    for (const collectionCard of cards) {
      const card = collectionCard.card;
      const count = collectionCard.count;

      rarityStats[card.rarity].owned += count;
      typeStats[card.type] += count;

      const cost = Math.min(card.cost, 7);
      costDistribution[cost] = (costDistribution[cost] || 0) + count;
    }

    // 计算总卡牌数和完成度
    const totalPossibleCards = this.allCards.length * 2; // 假设每张卡牌最多2张
    const completionPercentage = totalPossibleCards > 0 
      ? Math.round((totalCards / totalPossibleCards) * 100) 
      : 0;

    // 计算各稀有度的总数
    for (const card of this.allCards) {
      const maxCount = card.rarity === "legendary" ? 1 : 2;
      rarityStats[card.rarity].total += maxCount;
    }

    // 计算各稀有度的完成度
    for (const rarity of Object.keys(rarityStats) as CardRarity[]) {
      const stat = rarityStats[rarity];
      stat.percentage = stat.total > 0 ? Math.round((stat.owned / stat.total) * 100) : 0;
    }

    // 最近获得的卡牌
    const recentObtained = [...cards]
      .sort((a, b) => b.obtainedAt - a.obtainedAt)
      .slice(0, 10);

    return {
      totalCards,
      uniqueCards,
      completionPercentage,
      rarityStats,
      typeStats,
      costDistribution,
      recentObtained,
    };
  }

  // 获取粉尘信息
  getDustInfo(): DustInfo {
    return {
      ...DUST_VALUES,
      currentDust: this.dust,
    };
  }

  // 添加粉尘
  addDust(amount: number): void {
    this.dust += amount;
    this.saveToStorage();
    this.notifyObservers({ type: "dust_changed", data: { current: this.dust, change: amount } });
  }

  // 获取新卡牌数量
  getNewCardCount(): number {
    return this.getAllCards().filter(c => c.isNew).length;
  }

  // 批量分解
  disenchantAllExtras(): { totalDust: number; cardCount: number } {
    let totalDust = 0;
    let cardCount = 0;

    const cardsToDisenchant = this.getDisenchantableCards();
    
    for (const collectionCard of cardsToDisenchant) {
      const maxCount = collectionCard.card.rarity === "legendary" 
        ? CollectionService.MAX_LEGENDARY_COUNT 
        : CollectionService.MAX_CARD_COUNT;
      const excessCount = collectionCard.count - maxCount;
      
      if (excessCount > 0) {
        const result = this.disenchantCard(collectionCard.cardId, excessCount);
        if (result.success) {
          totalDust += result.dustGained;
          cardCount += excessCount;
        }
      }
    }

    return { totalDust, cardCount };
  }

  // 导出收藏
  exportCollection(): string {
    const data = {
      collection: this.getAllCards(),
      dust: this.dust,
      exportDate: Date.now(),
    };
    return JSON.stringify(data, null, 2);
  }

  // 导入收藏
  importCollection(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.collection && Array.isArray(data.collection)) {
        for (const cardData of data.collection) {
          this.collection.set(cardData.cardId, cardData);
        }
        if (data.dust) {
          this.dust = data.dust;
        }
        this.saveToStorage();
        return true;
      }
    } catch (e) {
      console.error("Failed to import collection", e);
    }
    return false;
  }

  subscribe(callback: (event: CollectionEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: CollectionEvent): void {
    this.observers.forEach(callback => callback(event));
  }

  // 清空收藏
  clearCollection(): void {
    this.collection.clear();
    this.dust = 0;
    this.saveToStorage();
  }
}

export interface CollectionEvent {
  type: 
    | "card_added" 
    | "card_removed" 
    | "card_disenchanted" 
    | "card_crafted" 
    | "card_favorited"
    | "dust_changed";
  data: unknown;
}

export const collectionService = new CollectionService();
