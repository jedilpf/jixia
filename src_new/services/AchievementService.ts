export type AchievementCategory =
  | "combat"
  | "collection"
  | "social"
  | "progression"
  | "special"
  | "seasonal";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  points: number;
  requirements: AchievementRequirement[];
  rewards: AchievementReward;
  isSecret: boolean;
  isRepeatable: boolean;
  maxProgress: number;
  unlockedAt?: number;
  currentProgress: number;
  completedCount: number;
}

export interface AchievementRequirement {
  type:
    | "win_games"
    | "play_cards"
    | "deal_damage"
    | "heal_health"
    | "summon_minions"
    | "use_hero_power"
    | "collect_cards"
    | "reach_rank"
    | "complete_tutorial"
    | "add_friends"
    | "spectate_games"
    | "win_streak"
    | "play_specific_card"
    | "win_with_class"
    | "complete_daily_tasks"
    | "login_days"
    | "spend_gold"
    | "open_packs";
  target: number;
  current: number;
  metadata?: Record<string, unknown>;
}

export interface AchievementReward {
  gold?: number;
  gems?: number;
  cardPacks?: number;
  exclusiveCard?: string;
  avatar?: string;
  title?: string;
  border?: string;
  emote?: string;
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  isCompleted: boolean;
  completedAt?: number;
  completedCount: number;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  currentPoints: number;
  completionPercentage: number;
  categoryProgress: Record<AchievementCategory, number>;
  rarityProgress: Record<AchievementRarity, number>;
}

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "currentProgress" | "completedCount" | "unlockedAt">[] = [
  // 战斗类成就
  {
    id: "first_win",
    name: "初出茅庐",
    description: "获得首场胜利",
    category: "combat",
    rarity: "common",
    icon: "🏆",
    points: 10,
    requirements: [{ type: "win_games", target: 1, current: 0 }],
    rewards: { gold: 100 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 1,
  },
  {
    id: "veteran_warrior",
    name: "百战老兵",
    description: "获得100场胜利",
    category: "combat",
    rarity: "rare",
    icon: "⚔️",
    points: 50,
    requirements: [{ type: "win_games", target: 100, current: 0 }],
    rewards: { gold: 500, cardPacks: 2 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 100,
  },
  {
    id: "legendary_champion",
    name: "传奇冠军",
    description: "获得1000场胜利",
    category: "combat",
    rarity: "legendary",
    icon: "👑",
    points: 200,
    requirements: [{ type: "win_games", target: 1000, current: 0 }],
    rewards: { gold: 5000, gems: 500, title: "传奇" },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 1000,
  },
  {
    id: "win_streak_5",
    name: "连胜将军",
    description: "取得5连胜",
    category: "combat",
    rarity: "rare",
    icon: "🔥",
    points: 30,
    requirements: [{ type: "win_streak", target: 5, current: 0 }],
    rewards: { gold: 300, gems: 30 },
    isSecret: false,
    isRepeatable: true,
    maxProgress: 5,
  },
  {
    id: "win_streak_10",
    name: "无敌战神",
    description: "取得10连胜",
    category: "combat",
    rarity: "epic",
    icon: "⚡",
    points: 100,
    requirements: [{ type: "win_streak", target: 10, current: 0 }],
    rewards: { gold: 1000, gems: 100, avatar: "god_of_war" },
    isSecret: false,
    isRepeatable: true,
    maxProgress: 10,
  },
  {
    id: "damage_dealer",
    name: "伤害输出",
    description: "累计造成10000点伤害",
    category: "combat",
    rarity: "common",
    icon: "💥",
    points: 20,
    requirements: [{ type: "deal_damage", target: 10000, current: 0 }],
    rewards: { gold: 200 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 10000,
  },
  {
    id: "card_master",
    name: "卡牌大师",
    description: "累计使用1000张卡牌",
    category: "combat",
    rarity: "rare",
    icon: "🃏",
    points: 40,
    requirements: [{ type: "play_cards", target: 1000, current: 0 }],
    rewards: { gold: 400, cardPacks: 3 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 1000,
  },
  // 收集类成就
  {
    id: "collector",
    name: "收藏家",
    description: "收集50张不同的卡牌",
    category: "collection",
    rarity: "common",
    icon: "📚",
    points: 25,
    requirements: [{ type: "collect_cards", target: 50, current: 0 }],
    rewards: { gold: 250, cardPacks: 2 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 50,
  },
  {
    id: "master_collector",
    name: "大师收藏家",
    description: "收集200张不同的卡牌",
    category: "collection",
    rarity: "epic",
    icon: "📖",
    points: 100,
    requirements: [{ type: "collect_cards", target: 200, current: 0 }],
    rewards: { gold: 1000, gems: 100, border: "collector" },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 200,
  },
  {
    id: "pack_opener",
    name: "开包达人",
    description: "开启50个卡包",
    category: "collection",
    rarity: "common",
    icon: "🎁",
    points: 20,
    requirements: [{ type: "open_packs", target: 50, current: 0 }],
    rewards: { gold: 200 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 50,
  },
  // 社交类成就
  {
    id: "social_butterfly",
    name: "社交达人",
    description: "添加10个好友",
    category: "social",
    rarity: "common",
    icon: "🦋",
    points: 15,
    requirements: [{ type: "add_friends", target: 10, current: 0 }],
    rewards: { gold: 150 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 10,
  },
  {
    id: "spectator",
    name: "观战者",
    description: "观战10场比赛",
    category: "social",
    rarity: "common",
    icon: "👁️",
    points: 15,
    requirements: [{ type: "spectate_games", target: 10, current: 0 }],
    rewards: { gold: 150 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 10,
  },
  // 进度类成就
  {
    id: "bronze_rank",
    name: "初入江湖",
    description: "达到青铜段位",
    category: "progression",
    rarity: "common",
    icon: "🥉",
    points: 10,
    requirements: [{ type: "reach_rank", target: 1000, current: 0 }],
    rewards: { gold: 100 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 1,
  },
  {
    id: "gold_rank",
    name: "黄金战士",
    description: "达到黄金段位",
    category: "progression",
    rarity: "rare",
    icon: "🥇",
    points: 50,
    requirements: [{ type: "reach_rank", target: 2000, current: 0 }],
    rewards: { gold: 500, gems: 50, cardPacks: 3 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 1,
  },
  {
    id: "king_rank",
    name: "王者之路",
    description: "达到王者段位",
    category: "progression",
    rarity: "legendary",
    icon: "👑",
    points: 200,
    requirements: [{ type: "reach_rank", target: 6000, current: 0 }],
    rewards: { gold: 2000, gems: 200, title: "王者", avatar: "king" },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 1,
  },
  {
    id: "tutorial_complete",
    name: "学有所成",
    description: "完成新手教程",
    category: "progression",
    rarity: "common",
    icon: "🎓",
    points: 10,
    requirements: [{ type: "complete_tutorial", target: 1, current: 0 }],
    rewards: { gold: 100, cardPacks: 1 },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 1,
  },
  {
    id: "login_7_days",
    name: "忠实玩家",
    description: "连续登录7天",
    category: "progression",
    rarity: "rare",
    icon: "📅",
    points: 30,
    requirements: [{ type: "login_days", target: 7, current: 0 }],
    rewards: { gold: 300, gems: 30 },
    isSecret: false,
    isRepeatable: true,
    maxProgress: 7,
  },
  {
    id: "login_30_days",
    name: "月度达人",
    description: "连续登录30天",
    category: "progression",
    rarity: "epic",
    icon: "📆",
    points: 100,
    requirements: [{ type: "login_days", target: 30, current: 0 }],
    rewards: { gold: 1000, gems: 100, exclusiveCard: "monthly_reward" },
    isSecret: false,
    isRepeatable: true,
    maxProgress: 30,
  },
  // 特殊成就
  {
    id: "lucky_draw",
    name: "幸运儿",
    description: "从卡包中开出传说卡牌",
    category: "special",
    rarity: "epic",
    icon: "🍀",
    points: 50,
    requirements: [{ type: "open_packs", target: 1, current: 0, metadata: { rarity: "legendary" } }],
    rewards: { gold: 500, gems: 50 },
    isSecret: true,
    isRepeatable: false,
    maxProgress: 1,
  },
  {
    id: "big_spender",
    name: "挥金如土",
    description: "累计消费10000金币",
    category: "special",
    rarity: "rare",
    icon: "💰",
    points: 40,
    requirements: [{ type: "spend_gold", target: 10000, current: 0 }],
    rewards: { gold: 500, title: "土豪" },
    isSecret: false,
    isRepeatable: false,
    maxProgress: 10000,
  },
  {
    id: "perfect_game",
    name: "完美对局",
    description: "满血赢得一场比赛",
    category: "special",
    rarity: "epic",
    icon: "💎",
    points: 80,
    requirements: [{ type: "win_games", target: 1, current: 0, metadata: { fullHealth: true } }],
    rewards: { gold: 800, gems: 80 },
    isSecret: true,
    isRepeatable: true,
    maxProgress: 1,
  },
];

export class AchievementService {
  private static readonly ACHIEVEMENTS_KEY = "jixia_achievements";
  private static readonly PROGRESS_KEY = "jixia_achievement_progress";

  private achievements: Map<string, Achievement> = new Map();
  private observers: Set<(achievement: Achievement) => void> = new Set();

  constructor() {
    this.initializeAchievements();
    this.loadProgress();
  }

  private initializeAchievements(): void {
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      this.achievements.set(def.id, {
        ...def,
        currentProgress: 0,
        completedCount: 0,
      });
    }
  }

  private loadProgress(): void {
    try {
      const progressData = localStorage.getItem(AchievementService.PROGRESS_KEY);
      if (progressData) {
        const progress: Record<string, AchievementProgress> = JSON.parse(progressData);
        for (const [id, data] of Object.entries(progress)) {
          const achievement = this.achievements.get(id);
          if (achievement) {
            achievement.currentProgress = data.currentProgress;
            achievement.completedCount = data.completedCount;
            achievement.unlockedAt = data.completedAt;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load achievement progress");
    }
  }

  private saveProgress(): void {
    try {
      const progress: Record<string, AchievementProgress> = {};
      for (const [id, achievement] of this.achievements) {
        progress[id] = {
          achievementId: id,
          currentProgress: achievement.currentProgress,
          isCompleted: achievement.completedCount > 0,
          completedAt: achievement.unlockedAt,
          completedCount: achievement.completedCount,
        };
      }
      localStorage.setItem(AchievementService.PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn("Failed to save achievement progress");
    }
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).sort((a, b) => {
      // 已完成的排后面
      if ((a.completedCount > 0) !== (b.completedCount > 0)) {
        return a.completedCount > 0 ? 1 : -1;
      }
      // 按稀有度排序
      const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }

  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.getAllAchievements().filter((a) => a.category === category);
  }

  getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
    return this.getAllAchievements().filter((a) => a.rarity === rarity);
  }

  getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => a.completedCount > 0);
  }

  getLockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => a.completedCount === 0);
  }

  getInProgressAchievements(): Achievement[] {
    return this.getAllAchievements().filter(
      (a) => a.completedCount === 0 && a.currentProgress > 0
    );
  }

  updateProgress(
    type: AchievementRequirement["type"],
    amount: number = 1,
    metadata?: Record<string, unknown>
  ): Achievement[] {
    const unlocked: Achievement[] = [];

    for (const achievement of this.achievements.values()) {
      if (achievement.completedCount > 0 && !achievement.isRepeatable) {
        continue;
      }

      for (const req of achievement.requirements) {
        if (req.type === type) {
          // 检查metadata条件
          if (req.metadata && metadata) {
            const matches = Object.entries(req.metadata).every(
              ([key, value]) => metadata[key] === value
            );
            if (!matches) continue;
          }

          const oldProgress = achievement.currentProgress;
          achievement.currentProgress = Math.min(
            achievement.maxProgress,
            achievement.currentProgress + amount
          );

          // 检查是否完成
          const wasCompleted = oldProgress < achievement.maxProgress;
          const isNowCompleted = achievement.currentProgress >= achievement.maxProgress;

          if (wasCompleted && isNowCompleted) {
            this.unlockAchievement(achievement);
            unlocked.push(achievement);
          }
        }
      }
    }

    this.saveProgress();
    return unlocked;
  }

  private unlockAchievement(achievement: Achievement): void {
    achievement.completedCount++;
    achievement.unlockedAt = Date.now();

    // 重置可重复成就
    if (achievement.isRepeatable) {
      achievement.currentProgress = 0;
    }

    this.notifyObservers(achievement);
  }

  claimRewards(achievementId: string): AchievementReward | null {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.completedCount === 0) {
      return null;
    }

    return achievement.rewards;
  }

  getStats(): AchievementStats {
    const all = this.getAllAchievements();
    const unlocked = this.getUnlockedAchievements();

    const categoryProgress: Record<AchievementCategory, number> = {
      combat: 0,
      collection: 0,
      social: 0,
      progression: 0,
      special: 0,
      seasonal: 0,
    };

    const rarityProgress: Record<AchievementRarity, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };

    for (const a of all) {
      if (a.completedCount > 0) {
        categoryProgress[a.category]++;
        rarityProgress[a.rarity]++;
      }
    }

    const totalPoints = all.reduce((sum, a) => sum + a.points, 0);
    const currentPoints = unlocked.reduce((sum, a) => sum + a.points, 0);

    return {
      totalAchievements: all.length,
      unlockedAchievements: unlocked.length,
      totalPoints,
      currentPoints,
      completionPercentage: Math.round((unlocked.length / all.length) * 100),
      categoryProgress,
      rarityProgress,
    };
  }

  getRecentAchievements(limit: number = 5): Achievement[] {
    return this.getUnlockedAchievements()
      .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
      .slice(0, limit);
  }

  subscribe(callback: (achievement: Achievement) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(achievement: Achievement): void {
    this.observers.forEach((callback) => callback(achievement));
  }

  resetProgress(): void {
    for (const achievement of this.achievements.values()) {
      achievement.currentProgress = 0;
      achievement.completedCount = 0;
      achievement.unlockedAt = undefined;
    }
    this.saveProgress();
  }

  exportProgress(): string {
    const data = {
      achievements: this.getAllAchievements(),
      stats: this.getStats(),
      exportDate: Date.now(),
    };
    return JSON.stringify(data, null, 2);
  }

  importProgress(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.achievements) {
        for (const ach of data.achievements) {
          const existing = this.achievements.get(ach.id);
          if (existing) {
            existing.currentProgress = ach.currentProgress;
            existing.completedCount = ach.completedCount;
            existing.unlockedAt = ach.unlockedAt;
          }
        }
        this.saveProgress();
        return true;
      }
    } catch (e) {
      console.error("Failed to import achievement progress", e);
    }
    return false;
  }
}

export const achievementService = new AchievementService();
