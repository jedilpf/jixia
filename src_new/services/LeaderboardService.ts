export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatar?: string;
  score: number;
  wins: number;
  losses: number;
  winRate: number;
  playTime: number;
  lastActive: number;
  trend: "up" | "down" | "stable";
  rankChange: number;
}

export interface LeaderboardData {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: number;
  playerRank?: LeaderboardEntry;
}

export type LeaderboardType =
  | "ranked"
  | "win_rate"
  | "wins"
  | "play_time"
  | "achievements"
  | "weekly"
  | "monthly";

export interface RankTier {
  name: string;
  minScore: number;
  maxScore: number;
  icon: string;
  color: string;
  rewards: {
    gold: number;
    gems: number;
    cardPacks: number;
  };
}

export const RANK_TIERS: RankTier[] = [
  {
    name: "青铜",
    minScore: 0,
    maxScore: 999,
    icon: "🥉",
    color: "#CD7F32",
    rewards: { gold: 50, gems: 0, cardPacks: 0 },
  },
  {
    name: "白银",
    minScore: 1000,
    maxScore: 1999,
    icon: "🥈",
    color: "#C0C0C0",
    rewards: { gold: 100, gems: 10, cardPacks: 1 },
  },
  {
    name: "黄金",
    minScore: 2000,
    maxScore: 2999,
    icon: "🥇",
    color: "#FFD700",
    rewards: { gold: 200, gems: 20, cardPacks: 2 },
  },
  {
    name: "铂金",
    minScore: 3000,
    maxScore: 3999,
    icon: "💎",
    color: "#3EB489",
    rewards: { gold: 300, gems: 30, cardPacks: 3 },
  },
  {
    name: "钻石",
    minScore: 4000,
    maxScore: 4999,
    icon: "💠",
    color: "#B9F2FF",
    rewards: { gold: 500, gems: 50, cardPacks: 5 },
  },
  {
    name: "星耀",
    minScore: 5000,
    maxScore: 5999,
    icon: "⭐",
    color: "#E6E6FA",
    rewards: { gold: 800, gems: 80, cardPacks: 8 },
  },
  {
    name: "王者",
    minScore: 6000,
    maxScore: Infinity,
    icon: "👑",
    color: "#FFD700",
    rewards: { gold: 1000, gems: 100, cardPacks: 10 },
  },
];

export class LeaderboardService {
  private static readonly LEADERBOARD_KEY = "jixia_leaderboard";
  private static readonly PLAYER_RANK_KEY = "jixia_player_rank";
  private static readonly UPDATE_INTERVAL = 5 * 60 * 1000;

  private leaderboardCache: Map<LeaderboardType, LeaderboardData> = new Map();
  private lastUpdateTime: Map<LeaderboardType, number> = new Map();
  private observers: Set<(type: LeaderboardType, data: LeaderboardData) => void> =
    new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const cached = localStorage.getItem(LeaderboardService.LEADERBOARD_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        this.leaderboardCache = new Map(Object.entries(data));
      }
    } catch (e) {
      console.warn("Failed to load leaderboard from storage");
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.leaderboardCache);
      localStorage.setItem(
        LeaderboardService.LEADERBOARD_KEY,
        JSON.stringify(data)
      );
    } catch (e) {
      console.warn("Failed to save leaderboard to storage");
    }
  }

  async getLeaderboard(
    type: LeaderboardType,
    page: number = 1,
    pageSize: number = 50,
    forceRefresh: boolean = false
  ): Promise<LeaderboardData> {
    const lastUpdate = this.lastUpdateTime.get(type) || 0;
    const needsUpdate =
      forceRefresh || Date.now() - lastUpdate > LeaderboardService.UPDATE_INTERVAL;

    if (!needsUpdate && this.leaderboardCache.has(type)) {
      return this.leaderboardCache.get(type)!;
    }

    const data = await this.fetchLeaderboard(type, page, pageSize);
    this.leaderboardCache.set(type, data);
    this.lastUpdateTime.set(type, Date.now());
    this.saveToStorage();
    this.notifyObservers(type, data);

    return data;
  }

  private async fetchLeaderboard(
    type: LeaderboardType,
    page: number,
    pageSize: number
  ): Promise<LeaderboardData> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockEntries = this.generateMockEntries(type, page, pageSize);
    const playerRank = this.getPlayerRank(type);

    return {
      type,
      entries: mockEntries,
      totalPlayers: 10000,
      lastUpdated: Date.now(),
      playerRank,
    };
  }

  private generateMockEntries(
    type: LeaderboardType,
    page: number,
    pageSize: number
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    const startRank = (page - 1) * pageSize + 1;

    for (let i = 0; i < pageSize; i++) {
      const rank = startRank + i;
      const baseScore = this.getBaseScoreForType(type, rank);

      entries.push({
        rank,
        playerId: `player_${rank}`,
        playerName: `玩家${rank}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rank}`,
        score: baseScore + Math.floor(Math.random() * 100),
        wins: Math.floor(Math.random() * 500) + 50,
        losses: Math.floor(Math.random() * 300) + 20,
        winRate: Math.floor(Math.random() * 30) + 50,
        playTime: Math.floor(Math.random() * 1000) + 100,
        lastActive: Date.now() - Math.floor(Math.random() * 86400000),
        trend: Math.random() > 0.6 ? "up" : Math.random() > 0.3 ? "stable" : "down",
        rankChange: Math.floor(Math.random() * 20) - 10,
      });
    }

    return entries;
  }

  private getBaseScoreForType(type: LeaderboardType, rank: number): number {
    switch (type) {
      case "ranked":
        return Math.max(6000 - (rank - 1) * 10, 0);
      case "win_rate":
        return Math.max(80 - (rank - 1) * 0.5, 30);
      case "wins":
        return Math.max(1000 - (rank - 1) * 5, 0);
      case "play_time":
        return Math.max(5000 - (rank - 1) * 20, 0);
      case "achievements":
        return Math.max(100 - (rank - 1), 0);
      case "weekly":
      case "monthly":
        return Math.max(2000 - (rank - 1) * 5, 0);
      default:
        return 0;
    }
  }

  private getPlayerRank(type: LeaderboardType): LeaderboardEntry | undefined {
    const stored = localStorage.getItem(LeaderboardService.PLAYER_RANK_KEY);
    if (stored) {
      const ranks = JSON.parse(stored);
      return ranks[type];
    }
    return undefined;
  }

  updatePlayerScore(
    type: LeaderboardType,
    playerData: Partial<LeaderboardEntry>
  ): void {
    const currentRank = this.getPlayerRank(type) || {
      rank: 1000,
      playerId: "current_player",
      playerName: "我",
      score: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      playTime: 0,
      lastActive: Date.now(),
      trend: "stable",
      rankChange: 0,
    };

    const updatedRank = { ...currentRank, ...playerData, lastActive: Date.now() };

    const stored = localStorage.getItem(LeaderboardService.PLAYER_RANK_KEY);
    const ranks = stored ? JSON.parse(stored) : {};
    ranks[type] = updatedRank;
    localStorage.setItem(LeaderboardService.PLAYER_RANK_KEY, JSON.stringify(ranks));
  }

  getRankTier(score: number): RankTier {
    return (
      RANK_TIERS.find((tier) => score >= tier.minScore && score <= tier.maxScore) ||
      RANK_TIERS[0]
    );
  }

  getNextRankTier(score: number): RankTier | null {
    const currentTier = this.getRankTier(score);
    const currentIndex = RANK_TIERS.indexOf(currentTier);
    return RANK_TIERS[currentIndex + 1] || null;
  }

  getProgressToNextTier(score: number): { current: number; target: number; percentage: number } {
    const currentTier = this.getRankTier(score);
    const nextTier = this.getNextRankTier(score);

    if (!nextTier) {
      return { current: score, target: score, percentage: 100 };
    }

    const range = nextTier.minScore - currentTier.minScore;
    const progress = score - currentTier.minScore;
    const percentage = Math.min(100, Math.round((progress / range) * 100));

    return {
      current: score,
      target: nextTier.minScore,
      percentage,
    };
  }

  calculateRankChange(
    type: LeaderboardType,
    oldScore: number,
    newScore: number
  ): { newRank: number; rankChange: number } {
    const currentData = this.leaderboardCache.get(type);
    if (!currentData) {
      return { newRank: 1000, rankChange: 0 };
    }

    const entries = currentData.entries;
    let newRank = entries.length + 1;

    for (let i = 0; i < entries.length; i++) {
      if (newScore > entries[i].score) {
        newRank = i + 1;
        break;
      }
    }

    const oldRank =
      entries.findIndex((e) => e.score <= oldScore) + 1 || entries.length + 1;
    const rankChange = oldRank - newRank;

    return { newRank, rankChange };
  }

  subscribe(
    callback: (type: LeaderboardType, data: LeaderboardData) => void
  ): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(type: LeaderboardType, data: LeaderboardData): void {
    this.observers.forEach((callback) => callback(type, data));
  }

  getTopPlayers(type: LeaderboardType, count: number = 3): LeaderboardEntry[] {
    const data = this.leaderboardCache.get(type);
    return data ? data.entries.slice(0, count) : [];
  }

  getNearbyPlayers(
    type: LeaderboardType,
    playerRank: number,
    range: number = 5
  ): LeaderboardEntry[] {
    const data = this.leaderboardCache.get(type);
    if (!data) return [];

    const start = Math.max(0, playerRank - range - 1);
    const end = Math.min(data.entries.length, playerRank + range);

    return data.entries.slice(start, end);
  }

  clearCache(): void {
    this.leaderboardCache.clear();
    this.lastUpdateTime.clear();
    localStorage.removeItem(LeaderboardService.LEADERBOARD_KEY);
  }

  getLeaderboardTitle(type: LeaderboardType): string {
    const titles: Record<LeaderboardType, string> = {
      ranked: "排位排行榜",
      win_rate: "胜率排行榜",
      wins: "胜场排行榜",
      play_time: "游戏时长榜",
      achievements: "成就排行榜",
      weekly: "本周排行榜",
      monthly: "本月排行榜",
    };
    return titles[type];
  }

  getLeaderboardDescription(type: LeaderboardType): string {
    const descriptions: Record<LeaderboardType, string> = {
      ranked: "根据排位积分排序",
      win_rate: "根据胜率排序（至少50场）",
      wins: "根据总胜场排序",
      play_time: "根据游戏时长排序",
      achievements: "根据成就点数排序",
      weekly: "本周获得的积分",
      monthly: "本月获得的积分",
    };
    return descriptions[type];
  }
}

export const leaderboardService = new LeaderboardService();
