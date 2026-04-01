import { LeaderboardService, RANK_TIERS, RankTier } from "./LeaderboardService";

export interface Season {
  id: string;
  name: string;
  theme: string;
  startDate: number;
  endDate: number;
  description: string;
  rewards: SeasonReward[];
  specialCards: string[];
  isActive: boolean;
}

export interface SeasonReward {
  rank: number;
  minScore: number;
  maxScore: number;
  rewards: {
    gold: number;
    gems: number;
    cardPacks: number;
    exclusiveCards: string[];
    avatar?: string;
    title?: string;
    border?: string;
  };
}

export interface PlayerSeasonData {
  seasonId: string;
  playerId: string;
  currentScore: number;
  highestScore: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  tier: RankTier;
  rewardsClaimed: string[];
  seasonRank: number;
}

export interface SeasonProgress {
  currentScore: number;
  nextTier: RankTier | null;
  progress: number;
  gamesToNextTier: number;
  estimatedRank: number;
}

export class SeasonService {
  private static readonly CURRENT_SEASON_KEY = "jixia_current_season";
  private static readonly PLAYER_SEASON_KEY = "jixia_player_season";
  private static readonly SEASON_HISTORY_KEY = "jixia_season_history";

  private currentSeason: Season | null = null;
  private playerData: Map<string, PlayerSeasonData> = new Map();
  private leaderboardService: LeaderboardService;
  private observers: Set<(season: Season) => void> = new Set();

  constructor(leaderboardService: LeaderboardService) {
    this.leaderboardService = leaderboardService;
    this.loadFromStorage();
    this.checkSeasonStatus();
  }

  private loadFromStorage(): void {
    try {
      const seasonData = localStorage.getItem(SeasonService.CURRENT_SEASON_KEY);
      if (seasonData) {
        this.currentSeason = JSON.parse(seasonData);
      }

      const playerData = localStorage.getItem(SeasonService.PLAYER_SEASON_KEY);
      if (playerData) {
        const data = JSON.parse(playerData);
        this.playerData = new Map(Object.entries(data));
      }
    } catch (e) {
      console.warn("Failed to load season data from storage");
    }
  }

  private saveToStorage(): void {
    try {
      if (this.currentSeason) {
        localStorage.setItem(
          SeasonService.CURRENT_SEASON_KEY,
          JSON.stringify(this.currentSeason)
        );
      }

      const data = Object.fromEntries(this.playerData);
      localStorage.setItem(SeasonService.PLAYER_SEASON_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save season data to storage");
    }
  }

  private checkSeasonStatus(): void {
    if (!this.currentSeason) {
      this.createNewSeason();
      return;
    }

    const now = Date.now();
    if (now > this.currentSeason.endDate) {
      this.endCurrentSeason();
      this.createNewSeason();
    } else {
      this.currentSeason.isActive = true;
    }
  }

  private createNewSeason(): void {
    const now = Date.now();
    const seasonNumber = this.getNextSeasonNumber();

    this.currentSeason = {
      id: `season_${seasonNumber}`,
      name: `第${seasonNumber}赛季`,
      theme: this.getSeasonTheme(seasonNumber),
      startDate: now,
      endDate: now + 30 * 24 * 60 * 60 * 1000,
      description: this.getSeasonDescription(seasonNumber),
      rewards: this.generateSeasonRewards(),
      specialCards: this.getSpecialCards(seasonNumber),
      isActive: true,
    };

    this.saveToStorage();
    this.notifyObservers();
  }

  private getNextSeasonNumber(): number {
    const history = this.getSeasonHistory();
    return history.length + 1;
  }

  private getSeasonTheme(seasonNumber: number): string {
    const themes = [
      "诸子百家",
      "战国争霸",
      "春秋战国",
      "百家争鸣",
      "天下一统",
      "乱世英雄",
      "智者对决",
      "谋略天下",
    ];
    return themes[(seasonNumber - 1) % themes.length];
  }

  private getSeasonDescription(seasonNumber: number): string {
    const descriptions: Record<string, string> = {
      诸子百家: "百家争鸣，各显神通",
      战国争霸: "群雄逐鹿，问鼎中原",
      春秋战国: "礼崩乐坏，乱世英雄",
      百家争鸣: "思想碰撞，智慧交锋",
      天下一统: "合纵连横，一统天下",
      乱世英雄: "乱世出英雄，智者胜",
      智者对决: "运筹帷幄，决胜千里",
      谋略天下: "谋略为先，智取天下",
    };
    return descriptions[this.getSeasonTheme(seasonNumber)] || "新赛季开始";
  }

  private getSpecialCards(seasonNumber: number): string[] {
    const specialCardsPool = [
      "season_hero_confucius",
      "season_hero_laozi",
      "season_hero_mozi",
      "season_hero_hanfei",
      "season_hero_sunzi",
      "season_tactic_united_front",
      "season_tactic_divide_and_conquer",
      "season_tactic_surprise_attack",
    ];

    const startIndex = ((seasonNumber - 1) * 2) % specialCardsPool.length;
    return [
      specialCardsPool[startIndex],
      specialCardsPool[(startIndex + 1) % specialCardsPool.length],
    ];
  }

  private generateSeasonRewards(): SeasonReward[] {
    return [
      {
        rank: 1,
        minScore: 6000,
        maxScore: Infinity,
        rewards: {
          gold: 5000,
          gems: 500,
          cardPacks: 20,
          exclusiveCards: ["season_champion_1", "season_champion_2"],
          avatar: "champion_avatar",
          title: "赛季冠军",
          border: "champion_border",
        },
      },
      {
        rank: 2,
        minScore: 5500,
        maxScore: 5999,
        rewards: {
          gold: 3000,
          gems: 300,
          cardPacks: 15,
          exclusiveCards: ["season_elite_1"],
          title: "赛季精英",
          border: "elite_border",
        },
      },
      {
        rank: 3,
        minScore: 5000,
        maxScore: 5499,
        rewards: {
          gold: 2000,
          gems: 200,
          cardPacks: 10,
          exclusiveCards: ["season_master_1"],
          title: "赛季大师",
          border: "master_border",
        },
      },
      {
        rank: 4,
        minScore: 4000,
        maxScore: 4999,
        rewards: {
          gold: 1000,
          gems: 100,
          cardPacks: 5,
          title: "钻石玩家",
        },
      },
      {
        rank: 5,
        minScore: 3000,
        maxScore: 3999,
        rewards: {
          gold: 500,
          gems: 50,
          cardPacks: 3,
          title: "铂金玩家",
        },
      },
      {
        rank: 6,
        minScore: 2000,
        maxScore: 2999,
        rewards: {
          gold: 300,
          gems: 30,
          cardPacks: 2,
          title: "黄金玩家",
        },
      },
      {
        rank: 7,
        minScore: 1000,
        maxScore: 1999,
        rewards: {
          gold: 200,
          gems: 20,
          cardPacks: 1,
          title: "白银玩家",
        },
      },
      {
        rank: 8,
        minScore: 0,
        maxScore: 999,
        rewards: {
          gold: 100,
          gems: 10,
          cardPacks: 1,
        },
      },
    ];
  }

  getCurrentSeason(): Season | null {
    this.checkSeasonStatus();
    return this.currentSeason;
  }

  getPlayerSeasonData(playerId: string): PlayerSeasonData {
    if (!this.currentSeason) {
      throw new Error("No active season");
    }

    const key = `${this.currentSeason.id}_${playerId}`;
    if (!this.playerData.has(key)) {
      this.playerData.set(key, {
        seasonId: this.currentSeason.id,
        playerId,
        currentScore: 0,
        highestScore: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winStreak: 0,
        bestWinStreak: 0,
        tier: RANK_TIERS[0],
        rewardsClaimed: [],
        seasonRank: 0,
      });
    }

    return this.playerData.get(key)!;
  }

  updatePlayerScore(playerId: string, scoreChange: number, isWin: boolean): void {
    if (!this.currentSeason) return;

    const data = this.getPlayerSeasonData(playerId);
    data.currentScore = Math.max(0, data.currentScore + scoreChange);
    data.highestScore = Math.max(data.highestScore, data.currentScore);
    data.gamesPlayed++;

    if (isWin) {
      data.wins++;
      data.winStreak++;
      data.bestWinStreak = Math.max(data.bestWinStreak, data.winStreak);
    } else {
      data.losses++;
      data.winStreak = 0;
    }

    data.tier = this.leaderboardService.getRankTier(data.currentScore);

    this.saveToStorage();
  }

  getSeasonProgress(playerId: string): SeasonProgress {
    const data = this.getPlayerSeasonData(playerId);
    const currentTier = data.tier;
    const nextTier = this.leaderboardService.getNextRankTier(data.currentScore);
    const progress = this.leaderboardService.getProgressToNextTier(data.currentScore);

    const winRate = data.gamesPlayed > 0 ? data.wins / data.gamesPlayed : 0;
    const avgScorePerGame = 20;
    const gamesToNextTier = nextTier
      ? Math.ceil((nextTier.minScore - data.currentScore) / avgScorePerGame)
      : 0;

    return {
      currentScore: data.currentScore,
      nextTier,
      progress: progress.percentage,
      gamesToNextTier,
      estimatedRank: this.estimateRank(data.currentScore),
    };
  }

  private estimateRank(score: number): number {
    if (score >= 6000) return 1;
    if (score >= 5500) return Math.floor((6000 - score) / 10) + 1;
    if (score >= 5000) return Math.floor((5500 - score) / 5) + 50;
    return Math.floor((5000 - score) / 2) + 150;
  }

  getAvailableRewards(playerId: string): SeasonReward[] {
    if (!this.currentSeason) return [];

    const data = this.getPlayerSeasonData(playerId);
    return this.currentSeason.rewards.filter(
      (reward) =>
        data.currentScore >= reward.minScore &&
        !data.rewardsClaimed.includes(`${reward.rank}`)
    );
  }

  claimReward(playerId: string, rewardRank: number): SeasonReward | null {
    if (!this.currentSeason) return null;

    const data = this.getPlayerSeasonData(playerId);
    const reward = this.currentSeason.rewards.find((r) => r.rank === rewardRank);

    if (!reward || data.rewardsClaimed.includes(`${rewardRank}`)) {
      return null;
    }

    if (data.currentScore < reward.minScore) {
      return null;
    }

    data.rewardsClaimed.push(`${rewardRank}`);
    this.saveToStorage();

    return reward;
  }

  getSeasonTimeRemaining(): { days: number; hours: number; minutes: number } {
    if (!this.currentSeason) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const now = Date.now();
    const remaining = this.currentSeason.endDate - now;

    if (remaining <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return { days, hours, minutes };
  }

  private endCurrentSeason(): void {
    if (!this.currentSeason) return;

    this.currentSeason.isActive = false;

    const history = this.getSeasonHistory();
    history.push({
      season: this.currentSeason,
      endDate: Date.now(),
      topPlayers: this.getTopPlayers(10),
    });

    localStorage.setItem(
      SeasonService.SEASON_HISTORY_KEY,
      JSON.stringify(history.slice(-10))
    );

    this.distributeEndOfSeasonRewards();
  }

  private distributeEndOfSeasonRewards(): void {
    // 赛季结束时的奖励分发逻辑
    console.log("Distributing end of season rewards...");
  }

  private getTopPlayers(count: number): PlayerSeasonData[] {
    return Array.from(this.playerData.values())
      .sort((a, b) => b.currentScore - a.currentScore)
      .slice(0, count);
  }

  getSeasonHistory(): Array<{
    season: Season;
    endDate: number;
    topPlayers: PlayerSeasonData[];
  }> {
    try {
      const history = localStorage.getItem(SeasonService.SEASON_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (e) {
      return [];
    }
  }

  subscribe(callback: (season: Season) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    if (this.currentSeason) {
      this.observers.forEach((callback) => callback(this.currentSeason!));
    }
  }

  getSeasonLeaderboard(playerId: string): {
    rank: number;
    nearbyPlayers: PlayerSeasonData[];
  } {
    const data = this.getPlayerSeasonData(playerId);
    const allPlayers = Array.from(this.playerData.values()).sort(
      (a, b) => b.currentScore - a.currentScore
    );

    const rank = allPlayers.findIndex((p) => p.playerId === playerId) + 1;
    const start = Math.max(0, rank - 3);
    const end = Math.min(allPlayers.length, rank + 2);

    return {
      rank: rank || allPlayers.length + 1,
      nearbyPlayers: allPlayers.slice(start, end),
    };
  }

  resetPlayerSeasonData(playerId: string): void {
    if (!this.currentSeason) return;

    const key = `${this.currentSeason.id}_${playerId}`;
    this.playerData.delete(key);
    this.saveToStorage();
  }
}

export const createSeasonService = (leaderboardService: LeaderboardService) => {
  return new SeasonService(leaderboardService);
};
