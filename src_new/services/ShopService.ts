export type ShopCategory = "cards" | "packs" | "cosmetics" | "currency" | "bundles" | "special";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  rarity?: ItemRarity;
  icon: string;
  price: {
    gold?: number;
    gems?: number;
    realMoney?: number;
  };
  originalPrice?: {
    gold?: number;
    gems?: number;
    realMoney?: number;
  };
  quantity: number;
  maxPurchase?: number;
  purchasedCount: number;
  isLimited: boolean;
  limitedEndTime?: number;
  isFeatured: boolean;
  isNew: boolean;
  requirements?: {
    minLevel?: number;
    minRank?: number;
    achievement?: string;
  };
  tags: string[];
}

export interface CardPack {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  guaranteedRarity?: ItemRarity;
  theme: string;
  coverImage: string;
}

export interface CosmeticItem {
  id: string;
  type: "avatar" | "border" | "title" | "emote" | "board" | "card_back";
  name: string;
  preview: string;
  rarity: ItemRarity;
}

export interface ShopBundle {
  id: string;
  name: string;
  description: string;
  items: ShopItem[];
  totalValue: number;
  discount: number;
  endTime: number;
}

export interface PurchaseHistory {
  id: string;
  itemId: string;
  itemName: string;
  price: {
    gold?: number;
    gems?: number;
    realMoney?: number;
  };
  purchasedAt: number;
  quantity: number;
}

export interface PlayerCurrency {
  gold: number;
  gems: number;
  freeGold: number;
  freeGems: number;
}

export const CARD_PACKS: CardPack[] = [
  {
    id: "classic_pack",
    name: "经典卡包",
    description: "包含5张卡牌，至少1张稀有",
    cardCount: 5,
    guaranteedRarity: "rare",
    theme: "classic",
    coverImage: "/packs/classic.png",
  },
  {
    id: "premium_pack",
    name: "高级卡包",
    description: "包含8张卡牌，至少1张史诗",
    cardCount: 8,
    guaranteedRarity: "epic",
    theme: "premium",
    coverImage: "/packs/premium.png",
  },
  {
    id: "legendary_pack",
    name: "传说卡包",
    description: "包含10张卡牌，至少1张传说",
    cardCount: 10,
    guaranteedRarity: "legendary",
    theme: "legendary",
    coverImage: "/packs/legendary.png",
  },
  {
    id: "season_pack",
    name: "赛季卡包",
    description: "包含当前赛季专属卡牌",
    cardCount: 5,
    theme: "seasonal",
    coverImage: "/packs/seasonal.png",
  },
];

export const SHOP_ITEMS: Omit<ShopItem, "purchasedCount">[] = [
  // 卡包
  {
    id: "pack_classic",
    name: "经典卡包",
    description: "包含5张卡牌",
    category: "packs",
    icon: "/packs/classic.png",
    price: { gold: 100 },
    quantity: 1,
    isLimited: false,
    isFeatured: false,
    isNew: false,
    tags: ["card_pack", "classic"],
  },
  {
    id: "pack_classic_x10",
    name: "经典卡包 x10",
    description: "包含10个经典卡包",
    category: "packs",
    icon: "/packs/classic_bundle.png",
    price: { gold: 900 },
    originalPrice: { gold: 1000 },
    quantity: 10,
    isLimited: false,
    isFeatured: true,
    isNew: false,
    tags: ["card_pack", "bundle", "discount"],
  },
  {
    id: "pack_premium",
    name: "高级卡包",
    description: "包含8张卡牌，至少1张史诗",
    category: "packs",
    rarity: "epic",
    icon: "/packs/premium.png",
    price: { gems: 100 },
    quantity: 1,
    isLimited: false,
    isFeatured: false,
    isNew: false,
    tags: ["card_pack", "premium"],
  },
  {
    id: "pack_legendary",
    name: "传说卡包",
    description: "包含10张卡牌，至少1张传说",
    category: "packs",
    rarity: "legendary",
    icon: "/packs/legendary.png",
    price: { gems: 300 },
    quantity: 1,
    maxPurchase: 3,
    isLimited: true,
    isFeatured: true,
    isNew: false,
    tags: ["card_pack", "legendary", "limited"],
  },
  // 货币
  {
    id: "currency_gold_small",
    name: "小额金币",
    description: "获得500金币",
    category: "currency",
    icon: "/currency/gold_small.png",
    price: { gems: 50 },
    quantity: 500,
    isLimited: false,
    isFeatured: false,
    isNew: false,
    tags: ["currency", "gold"],
  },
  {
    id: "currency_gold_large",
    name: "大额金币",
    description: "获得5000金币",
    category: "currency",
    icon: "/currency/gold_large.png",
    price: { gems: 450 },
    originalPrice: { gems: 500 },
    quantity: 5000,
    isLimited: false,
    isFeatured: true,
    isNew: false,
    tags: ["currency", "gold", "discount"],
  },
  {
    id: "currency_gems_small",
    name: "少量宝石",
    description: "获得60宝石",
    category: "currency",
    icon: "/currency/gems_small.png",
    price: { realMoney: 6 },
    quantity: 60,
    isLimited: false,
    isFeatured: false,
    isNew: false,
    tags: ["currency", "gems", "iap"],
  },
  {
    id: "currency_gems_large",
    name: "大量宝石",
    description: "获得680宝石（ bonus 80）",
    category: "currency",
    icon: "/currency/gems_large.png",
    price: { realMoney: 68 },
    quantity: 680,
    isLimited: false,
    isFeatured: true,
    isNew: false,
    tags: ["currency", "gems", "iap", "bonus"],
  },
  // 外观
  {
    id: "avatar_warrior",
    name: "战士头像",
    description: "解锁战士主题头像",
    category: "cosmetics",
    rarity: "rare",
    icon: "/avatars/warrior.png",
    price: { gems: 200 },
    quantity: 1,
    isLimited: false,
    isFeatured: false,
    isNew: true,
    tags: ["cosmetic", "avatar"],
  },
  {
    id: "border_gold",
    name: "黄金边框",
    description: "解锁黄金头像边框",
    category: "cosmetics",
    rarity: "epic",
    icon: "/borders/gold.png",
    price: { gems: 300 },
    quantity: 1,
    isLimited: true,
    limitedEndTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    isFeatured: true,
    isNew: true,
    tags: ["cosmetic", "border", "limited"],
  },
  {
    id: "title_master",
    name: "大师称号",
    description: "解锁大师称号",
    category: "cosmetics",
    rarity: "legendary",
    icon: "/titles/master.png",
    price: { gems: 500 },
    quantity: 1,
    requirements: { minRank: 3000 },
    isLimited: false,
    isFeatured: false,
    isNew: false,
    tags: ["cosmetic", "title"],
  },
  {
    id: "board_forest",
    name: "森林棋盘",
    description: "解锁森林主题棋盘",
    category: "cosmetics",
    rarity: "epic",
    icon: "/boards/forest.png",
    price: { gems: 400 },
    quantity: 1,
    isLimited: false,
    isFeatured: false,
    isNew: true,
    tags: ["cosmetic", "board"],
  },
  // 捆绑包
  {
    id: "bundle_starter",
    name: "新手礼包",
    description: "包含10个经典卡包和1000金币",
    category: "bundles",
    icon: "/bundles/starter.png",
    price: { realMoney: 30 },
    originalPrice: { realMoney: 60 },
    quantity: 1,
    maxPurchase: 1,
    isLimited: false,
    isFeatured: true,
    isNew: false,
    tags: ["bundle", "starter", "discount", "iap"],
  },
  {
    id: "bundle_monthly",
    name: "月卡",
    description: "每日领取100金币，持续30天",
    category: "bundles",
    icon: "/bundles/monthly.png",
    price: { realMoney: 25 },
    quantity: 1,
    maxPurchase: 1,
    isLimited: false,
    isFeatured: true,
    isNew: false,
    tags: ["bundle", "monthly", "subscription", "iap"],
  },
];

export class ShopService {
  private static readonly SHOP_ITEMS_KEY = "jixia_shop_items";
  private static readonly PURCHASE_HISTORY_KEY = "jixia_purchase_history";
  private static readonly CURRENCY_KEY = "jixia_currency";
  private static readonly DAILY_DEALS_KEY = "jixia_daily_deals";

  private items: Map<string, ShopItem> = new Map();
  private purchaseHistory: PurchaseHistory[] = [];
  private currency: PlayerCurrency = { gold: 0, gems: 0, freeGold: 0, freeGems: 0 };
  private dailyDeals: ShopItem[] = [];
  private observers: Set<(event: ShopEvent) => void> = new Set();

  constructor() {
    this.initializeItems();
    this.loadFromStorage();
    this.generateDailyDeals();
  }

  private initializeItems(): void {
    for (const item of SHOP_ITEMS) {
      this.items.set(item.id, { ...item, purchasedCount: 0 });
    }
  }

  private loadFromStorage(): void {
    try {
      const itemsData = localStorage.getItem(ShopService.SHOP_ITEMS_KEY);
      if (itemsData) {
        const items = JSON.parse(itemsData);
        for (const [id, count] of Object.entries(items)) {
          const item = this.items.get(id);
          if (item) {
            item.purchasedCount = count as number;
          }
        }
      }

      const historyData = localStorage.getItem(ShopService.PURCHASE_HISTORY_KEY);
      if (historyData) {
        this.purchaseHistory = JSON.parse(historyData);
      }

      const currencyData = localStorage.getItem(ShopService.CURRENCY_KEY);
      if (currencyData) {
        this.currency = JSON.parse(currencyData);
      }
    } catch (e) {
      console.warn("Failed to load shop data from storage");
    }
  }

  private saveToStorage(): void {
    try {
      const items: Record<string, number> = {};
      for (const [id, item] of this.items) {
        items[id] = item.purchasedCount;
      }
      localStorage.setItem(ShopService.SHOP_ITEMS_KEY, JSON.stringify(items));
      localStorage.setItem(ShopService.PURCHASE_HISTORY_KEY, JSON.stringify(this.purchaseHistory));
      localStorage.setItem(ShopService.CURRENCY_KEY, JSON.stringify(this.currency));
    } catch (e) {
      console.warn("Failed to save shop data to storage");
    }
  }

  private generateDailyDeals(): void {
    const now = new Date();
    const deals: ShopItem[] = [];
    
    // 随机选择3个商品作为每日特惠
    const allItems = Array.from(this.items.values()).filter(i => !i.isLimited);
    const selected = this.randomSelect(allItems, 3);
    
    for (const item of selected) {
      const discount = [0.7, 0.8, 0.9][Math.floor(Math.random() * 3)];
      const deal: ShopItem = {
        ...item,
        id: `deal_${item.id}_${now.getTime()}`,
        originalPrice: { ...item.price },
        price: {
          gold: item.price.gold ? Math.floor(item.price.gold * discount) : undefined,
          gems: item.price.gems ? Math.floor(item.price.gems * discount) : undefined,
          realMoney: item.price.realMoney ? Math.floor(item.price.realMoney * discount * 100) / 100 : undefined,
        },
        isFeatured: true,
        tags: [...item.tags, "daily_deal", `discount_${Math.round((1 - discount) * 100)}%`],
      };
      deals.push(deal);
    }
    
    this.dailyDeals = deals;
  }

  private randomSelect<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getItemsByCategory(category: ShopCategory): ShopItem[] {
    return Array.from(this.items.values())
      .filter(item => item.category === category)
      .sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        return 0;
      });
  }

  getFeaturedItems(): ShopItem[] {
    return Array.from(this.items.values()).filter(item => item.isFeatured);
  }

  getNewItems(): ShopItem[] {
    return Array.from(this.items.values()).filter(item => item.isNew);
  }

  getDailyDeals(): ShopItem[] {
    return this.dailyDeals;
  }

  getLimitedItems(): ShopItem[] {
    return Array.from(this.items.values()).filter(
      item => item.isLimited && item.limitedEndTime && item.limitedEndTime > Date.now()
    );
  }

  getItem(id: string): ShopItem | undefined {
    return this.items.get(id) || this.dailyDeals.find(d => d.id === id);
  }

  getCurrency(): PlayerCurrency {
    return { ...this.currency };
  }

  addCurrency(type: "gold" | "gems", amount: number, isFree: boolean = false): void {
    if (type === "gold") {
      if (isFree) {
        this.currency.freeGold += amount;
      }
      this.currency.gold += amount;
    } else {
      if (isFree) {
        this.currency.freeGems += amount;
      }
      this.currency.gems += amount;
    }
    this.saveToStorage();
    this.notifyObservers({ type: "currency_changed", data: this.currency });
  }

  spendCurrency(type: "gold" | "gems", amount: number): boolean {
    if (type === "gold") {
      if (this.currency.gold < amount) return false;
      this.currency.gold -= amount;
    } else {
      if (this.currency.gems < amount) return false;
      this.currency.gems -= amount;
    }
    this.saveToStorage();
    this.notifyObservers({ type: "currency_changed", data: this.currency });
    return true;
  }

  canPurchase(itemId: string): { canBuy: boolean; reason?: string } {
    const item = this.getItem(itemId);
    if (!item) return { canBuy: false, reason: "商品不存在" };

    if (item.maxPurchase && item.purchasedCount >= item.maxPurchase) {
      return { canBuy: false, reason: "已达到购买上限" };
    }

    if (item.isLimited && item.limitedEndTime && item.limitedEndTime < Date.now()) {
      return { canBuy: false, reason: "限时商品已过期" };
    }

    if (item.requirements) {
      // 检查等级要求
      if (item.requirements.minLevel) {
        // 这里需要接入玩家等级系统
      }
      // 检查段位要求
      if (item.requirements.minRank) {
        // 这里需要接入排位系统
      }
    }

    // 检查货币
    if (item.price.gold && this.currency.gold < item.price.gold) {
      return { canBuy: false, reason: "金币不足" };
    }
    if (item.price.gems && this.currency.gems < item.price.gems) {
      return { canBuy: false, reason: "宝石不足" };
    }

    return { canBuy: true };
  }

  purchase(itemId: string, quantity: number = 1): { success: boolean; item?: ShopItem; error?: string } {
    const item = this.getItem(itemId);
    if (!item) return { success: false, error: "商品不存在" };

    const check = this.canPurchase(itemId);
    if (!check.canBuy) return { success: false, error: check.reason };

    // 扣除货币
    if (item.price.gold) {
      if (!this.spendCurrency("gold", item.price.gold * quantity)) {
        return { success: false, error: "金币不足" };
      }
    }
    if (item.price.gems) {
      if (!this.spendCurrency("gems", item.price.gems * quantity)) {
        return { success: false, error: "宝石不足" };
      }
    }

    // 更新购买次数
    item.purchasedCount += quantity;

    // 记录购买历史
    const history: PurchaseHistory = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      purchasedAt: Date.now(),
      quantity,
    };
    this.purchaseHistory.unshift(history);
    if (this.purchaseHistory.length > 100) {
      this.purchaseHistory = this.purchaseHistory.slice(0, 100);
    }

    this.saveToStorage();
    this.notifyObservers({ type: "item_purchased", data: { item, quantity } });

    return { success: true, item };
  }

  getPurchaseHistory(limit: number = 20): PurchaseHistory[] {
    return this.purchaseHistory.slice(0, limit);
  }

  getPurchaseCount(itemId: string): number {
    const item = this.items.get(itemId);
    return item?.purchasedCount || 0;
  }

  subscribe(callback: (event: ShopEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: ShopEvent): void {
    this.observers.forEach(callback => callback(event));
  }

  refreshDailyDeals(): void {
    this.generateDailyDeals();
    this.notifyObservers({ type: "deals_refreshed", data: this.dailyDeals });
  }

  searchItems(query: string): ShopItem[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.items.values()).filter(
      item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getRecommendedItems(): ShopItem[] {
    // 基于购买历史推荐商品
    const purchasedCategories = new Set(
      this.purchaseHistory.slice(0, 10).map(h => {
        const item = this.items.get(h.itemId);
        return item?.category;
      })
    );

    return Array.from(this.items.values())
      .filter(item => !purchasedCategories.has(item.category) && item.isFeatured)
      .slice(0, 5);
  }

  getTotalSpent(): { gold: number; gems: number; realMoney: number } {
    let gold = 0;
    let gems = 0;
    let realMoney = 0;

    for (const purchase of this.purchaseHistory) {
      if (purchase.price.gold) gold += purchase.price.gold * purchase.quantity;
      if (purchase.price.gems) gems += purchase.price.gems * purchase.quantity;
      if (purchase.price.realMoney) realMoney += purchase.price.realMoney * purchase.quantity;
    }

    return { gold, gems, realMoney };
  }
}

export interface ShopEvent {
  type: "currency_changed" | "item_purchased" | "deals_refreshed";
  data: unknown;
}

export const shopService = new ShopService();
