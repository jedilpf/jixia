/**
 * 战绩统计服务
 *
 * 记录和分析玩家对战数据
 */

import type { PlayerId } from "../types/domain";

export interface MatchRecord {
  id: string;
  date: number;
  opponent: {
    id: string;
    name: string;
  };
  result: "win" | "loss" | "draw";
  duration: number;
  turns: number;
  playerStats: PlayerMatchStats;
  opponentStats: PlayerMatchStats;
  deckUsed: string;
}

export interface PlayerMatchStats {
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  cardsPlayed: number;
  cardsDrawn: number;
  specialMoves: number;
}

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalPlayTime: number;
  averageMatchDuration: number;
  favoriteDeck: string;
  recentMatches: MatchRecord[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
  icon: string;
}

export class StatsService {
  private readonly STORAGE_KEY = "jixia_player_stats";
  private readonly MATCH_HISTORY_KEY = "jixia_match_history";

  /**
   * 记录比赛结果
   */
  recordMatch(match: Omit<MatchRecord, "id" | "date">): MatchRecord {
    const fullMatch: MatchRecord = {
      ...match,
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: Date.now(),
    };

    // 保存比赛记录
    const history = this.getMatchHistory();
    history.unshift(fullMatch);

    // 只保留最近50场比赛
    if (history.length > 50) {
      history.pop();
    }

    localStorage.setItem(this.MATCH_HISTORY_KEY, JSON.stringify(history));

    // 更新统计数据
    this.updateStats(fullMatch);

    console.log("[Stats] Match recorded:", fullMatch.id);
    return fullMatch;
  }

  /**
   * 获取比赛历史
   */
  getMatchHistory(): MatchRecord[] {
    try {
      const stored = localStorage.getItem(this.MATCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[Stats] Failed to load match history:", error);
      return [];
    }
  }

  /**
   * 获取玩家统计
   */
  getPlayerStats(): PlayerStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("[Stats] Failed to load player stats:", error);
    }

    return this.getDefaultStats();
  }

  /**
   * 更新统计数据
   */
  private updateStats(match: MatchRecord): void {
    const stats = this.getPlayerStats();

    stats.totalMatches++;
    if (match.result === "win") stats.wins++;
    else if (match.result === "loss") stats.losses++;
    else stats.draws++;

    stats.winRate = stats.wins / stats.totalMatches;
    stats.totalPlayTime += match.duration;
    stats.averageMatchDuration =
      stats.totalPlayTime / stats.totalMatches;

    // 更新最近比赛
    stats.recentMatches = this.getMatchHistory().slice(0, 10);

    // 检查成就
    this.checkAchievements(stats);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
  }

  /**
   * 检查成就
   */
  private checkAchievements(stats: PlayerStats): void {
    const achievements: Achievement[] = [];

    // 首胜成就
    if (stats.wins === 1) {
      achievements.push({
        id: "first_win",
        name: "初出茅庐",
        description: "获得首场胜利",
        unlockedAt: Date.now(),
        icon: "🏆",
      });
    }

    // 连胜成就
    const recentWins = stats.recentMatches.filter((m) => m.result === "win").length;
    if (recentWins >= 5) {
      const existing = stats.achievements.find((a) => a.id === "win_streak_5");
      if (!existing) {
        achievements.push({
          id: "win_streak_5",
          name: "连胜将军",
          description: "连续获得5场胜利",
          unlockedAt: Date.now(),
          icon: "🔥",
        });
      }
    }

    // 百场成就
    if (stats.totalMatches === 100) {
      achievements.push({
        id: "veteran",
        name: "百战老兵",
        description: "完成100场比赛",
        unlockedAt: Date.now(),
        icon: "⚔️",
      });
    }

    // 高胜率成就
    if (stats.totalMatches >= 50 && stats.winRate >= 0.7) {
      const existing = stats.achievements.find((a) => a.id === "master");
      if (!existing) {
        achievements.push({
          id: "master",
          name: "论道大师",
          description: "50场以上保持70%胜率",
          unlockedAt: Date.now(),
          icon: "👑",
        });
      }
    }

    if (achievements.length > 0) {
      stats.achievements.push(...achievements);
      console.log("[Stats] Achievements unlocked:", achievements);
    }
  }

  /**
   * 获取默认统计
   */
  private getDefaultStats(): PlayerStats {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      totalPlayTime: 0,
      averageMatchDuration: 0,
      favoriteDeck: "",
      recentMatches: [],
      achievements: [],
    };
  }

  /**
   * 获取胜率趋势
   */
  getWinRateTrend(days: number = 7): { date: string; winRate: number }[] {
    const history = this.getMatchHistory();
    const trend: { date: string; winRate: number }[] = [];

    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];

      const dayMatches = history.filter((m) => {
        const matchDate = new Date(m.date).toISOString().split("T")[0];
        return matchDate === dateStr;
      });

      const dayWins = dayMatches.filter((m) => m.result === "win").length;
      const winRate = dayMatches.length > 0 ? dayWins / dayMatches.length : 0;

      trend.push({ date: dateStr, winRate });
    }

    return trend;
  }

  /**
   * 获取常用卡组统计
   */
  getDeckStats(): { deck: string; matches: number; wins: number; winRate: number }[] {
    const history = this.getMatchHistory();
    const deckMap = new Map<string, { matches: number; wins: number }>();

    history.forEach((match) => {
      const deck = match.deckUsed;
      const current = deckMap.get(deck) || { matches: 0, wins: 0 };
      current.matches++;
      if (match.result === "win") current.wins++;
      deckMap.set(deck, current);
    });

    return Array.from(deckMap.entries()).map(([deck, stats]) => ({
      deck,
      matches: stats.matches,
      wins: stats.wins,
      winRate: stats.matches > 0 ? stats.wins / stats.matches : 0,
    }));
  }

  /**
   * 清空所有数据
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.MATCH_HISTORY_KEY);
    console.log("[Stats] All data cleared");
  }

  /**
   * 导出数据
   */
  exportData(): string {
    const data = {
      stats: this.getPlayerStats(),
      history: this.getMatchHistory(),
      exportDate: Date.now(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入数据
   */
  importData(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.stats) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.stats));
      }
      if (data.history) {
        localStorage.setItem(this.MATCH_HISTORY_KEY, JSON.stringify(data.history));
      }
      console.log("[Stats] Data imported successfully");
      return true;
    } catch (error) {
      console.error("[Stats] Failed to import data:", error);
      return false;
    }
  }
}

// 便捷导出
export const statsService = new StatsService();
export default statsService;
