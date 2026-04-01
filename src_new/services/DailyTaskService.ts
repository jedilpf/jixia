export type TaskType =
  | "win_games"
  | "play_games"
  | "play_cards"
  | "deal_damage"
  | "heal_health"
  | "summon_minions"
  | "use_hero_power"
  | "complete_matches"
  | "login"
  | "open_packs"
  | "spend_gold"
  | "add_friend"
  | "spectate_game"
  | "complete_tutorial"
  | "reach_rank";

export type TaskDifficulty = "easy" | "medium" | "hard" | "expert";

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  target: number;
  current: number;
  rewards: TaskReward;
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt: number;
  createdAt: number;
  category: "daily" | "weekly" | "event";
}

export interface TaskReward {
  gold?: number;
  gems?: number;
  exp?: number;
  cardPacks?: number;
  specificCards?: string[];
}

export interface DailyTaskProgress {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  rewardsClaimed: boolean;
}

export interface WeeklyProgress {
  weekStart: number;
  tasksCompleted: number;
  totalTasks: number;
  streakDays: number;
  lastCompletedDate?: string;
}

export const DAILY_TASK_TEMPLATES: Array<Omit<DailyTask, "id" | "current" | "isCompleted" | "isClaimed" | "expiresAt" | "createdAt">> = [
  // 简单任务
  {
    title: "每日首胜",
    description: "赢得1场比赛",
    type: "win_games",
    difficulty: "easy",
    target: 1,
    rewards: { gold: 50, exp: 100 },
    category: "daily",
  },
  {
    title: "参与对战",
    description: "完成3场比赛",
    type: "play_games",
    difficulty: "easy",
    target: 3,
    rewards: { gold: 30, exp: 60 },
    category: "daily",
  },
  {
    title: "卡牌大师",
    description: "使用20张卡牌",
    type: "play_cards",
    difficulty: "easy",
    target: 20,
    rewards: { gold: 40, exp: 80 },
    category: "daily",
  },
  {
    title: "造成伤害",
    description: "累计造成100点伤害",
    type: "deal_damage",
    difficulty: "easy",
    target: 100,
    rewards: { gold: 35, exp: 70 },
    category: "daily",
  },
  // 中等任务
  {
    title: "连胜挑战",
    description: "取得2连胜",
    type: "win_games",
    difficulty: "medium",
    target: 2,
    rewards: { gold: 100, exp: 150, cardPacks: 1 },
    category: "daily",
  },
  {
    title: "召唤大师",
    description: "召唤10个随从",
    type: "summon_minions",
    difficulty: "medium",
    target: 10,
    rewards: { gold: 60, exp: 120 },
    category: "daily",
  },
  {
    title: "英雄之力",
    description: "使用英雄技能5次",
    type: "use_hero_power",
    difficulty: "medium",
    target: 5,
    rewards: { gold: 50, exp: 100 },
    category: "daily",
  },
  {
    title: "治疗专家",
    description: "累计恢复50点生命值",
    type: "heal_health",
    difficulty: "medium",
    target: 50,
    rewards: { gold: 55, exp: 110 },
    category: "daily",
  },
  // 困难任务
  {
    title: "胜利之路",
    description: "赢得5场比赛",
    type: "win_games",
    difficulty: "hard",
    target: 5,
    rewards: { gold: 200, exp: 300, cardPacks: 2 },
    category: "daily",
  },
  {
    title: "卡牌风暴",
    description: "使用50张卡牌",
    type: "play_cards",
    difficulty: "hard",
    target: 50,
    rewards: { gold: 150, exp: 250 },
    category: "daily",
  },
  {
    title: "伤害之王",
    description: "累计造成300点伤害",
    type: "deal_damage",
    difficulty: "hard",
    target: 300,
    rewards: { gold: 180, exp: 280 },
    category: "daily",
  },
  // 专家任务
  {
    title: "完美胜利",
    description: "满血赢得1场比赛",
    type: "win_games",
    difficulty: "expert",
    target: 1,
    rewards: { gold: 300, exp: 500, gems: 30, cardPacks: 1 },
    category: "daily",
  },
  {
    title: "连胜王者",
    description: "取得5连胜",
    type: "win_games",
    difficulty: "expert",
    target: 5,
    rewards: { gold: 500, exp: 800, gems: 50, cardPacks: 2 },
    category: "daily",
  },
];

export const WEEKLY_TASK_TEMPLATES: Array<Omit<DailyTask, "id" | "current" | "isCompleted" | "isClaimed" | "expiresAt" | "createdAt">> = [
  {
    title: "周常胜利",
    description: "本周赢得20场比赛",
    type: "win_games",
    difficulty: "hard",
    target: 20,
    rewards: { gold: 1000, exp: 1000, gems: 100, cardPacks: 5 },
    category: "weekly",
  },
  {
    title: "周常对战",
    description: "本周完成50场比赛",
    type: "play_games",
    difficulty: "medium",
    target: 50,
    rewards: { gold: 500, exp: 500, cardPacks: 3 },
    category: "weekly",
  },
  {
    title: "周常卡牌",
    description: "本周使用200张卡牌",
    type: "play_cards",
    difficulty: "hard",
    target: 200,
    rewards: { gold: 800, exp: 800, gems: 50, cardPacks: 4 },
    category: "weekly",
  },
  {
    title: "社交达人",
    description: "本周添加3个好友",
    type: "add_friend",
    difficulty: "easy",
    target: 3,
    rewards: { gold: 300, exp: 300, gems: 20 },
    category: "weekly",
  },
  {
    title: "观战学习",
    description: "本周观战10场比赛",
    type: "spectate_game",
    difficulty: "medium",
    target: 10,
    rewards: { gold: 400, exp: 400, cardPacks: 2 },
    category: "weekly",
  },
];

export class DailyTaskService {
  private static readonly DAILY_TASKS_KEY = "jixia_daily_tasks";
  private static readonly WEEKLY_TASKS_KEY = "jixia_weekly_tasks";
  private static readonly PROGRESS_KEY = "jixia_task_progress";
  private static readonly LAST_REFRESH_KEY = "jixia_task_last_refresh";

  private dailyTasks: DailyTask[] = [];
  private weeklyTasks: DailyTask[] = [];
  private observers: Set<(task: DailyTask) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.checkAndRefreshTasks();
  }

  private loadFromStorage(): void {
    try {
      const dailyData = localStorage.getItem(DailyTaskService.DAILY_TASKS_KEY);
      if (dailyData) {
        this.dailyTasks = JSON.parse(dailyData);
      }

      const weeklyData = localStorage.getItem(DailyTaskService.WEEKLY_TASKS_KEY);
      if (weeklyData) {
        this.weeklyTasks = JSON.parse(weeklyData);
      }
    } catch (e) {
      console.warn("Failed to load tasks from storage");
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(DailyTaskService.DAILY_TASKS_KEY, JSON.stringify(this.dailyTasks));
      localStorage.setItem(DailyTaskService.WEEKLY_TASKS_KEY, JSON.stringify(this.weeklyTasks));
    } catch (e) {
      console.warn("Failed to save tasks to storage");
    }
  }

  private checkAndRefreshTasks(): void {
    const now = Date.now();
    const lastRefresh = parseInt(localStorage.getItem(DailyTaskService.LAST_REFRESH_KEY) || "0");
    
    // 检查是否需要刷新每日任务（每天凌晨5点）
    const lastRefreshDate = new Date(lastRefresh);
    const nowDate = new Date(now);
    const shouldRefreshDaily = this.shouldRefreshDaily(lastRefreshDate, nowDate);
    
    // 检查是否需要刷新每周任务（每周一凌晨5点）
    const shouldRefreshWeekly = this.shouldRefreshWeekly(lastRefreshDate, nowDate);

    if (shouldRefreshDaily || this.dailyTasks.length === 0) {
      this.generateDailyTasks();
    }

    if (shouldRefreshWeekly || this.weeklyTasks.length === 0) {
      this.generateWeeklyTasks();
    }

    if (shouldRefreshDaily || shouldRefreshWeekly) {
      localStorage.setItem(DailyTaskService.LAST_REFRESH_KEY, now.toString());
    }
  }

  private shouldRefreshDaily(lastRefresh: Date, now: Date): boolean {
    // 每天凌晨5点刷新
    const refreshHour = 5;
    
    if (lastRefresh.getDate() !== now.getDate() ||
        lastRefresh.getMonth() !== now.getMonth() ||
        lastRefresh.getFullYear() !== now.getFullYear()) {
      return now.getHours() >= refreshHour;
    }
    
    return lastRefresh.getHours() < refreshHour && now.getHours() >= refreshHour;
  }

  private shouldRefreshWeekly(lastRefresh: Date, now: Date): boolean {
    // 每周一凌晨5点刷新
    const refreshHour = 5;
    const refreshDay = 1; // 周一
    
    const daysDiff = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 7) return true;
    
    if (now.getDay() === refreshDay && now.getHours() >= refreshHour) {
      return lastRefresh.getDay() !== refreshDay || 
             (lastRefresh.getDay() === refreshDay && lastRefresh.getHours() < refreshHour);
    }
    
    return false;
  }

  private generateDailyTasks(): void {
    const now = Date.now();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(5, 0, 0, 0);

    // 随机选择3个简单任务、2个中等任务、1个困难/专家任务
    const easyTasks = DAILY_TASK_TEMPLATES.filter(t => t.difficulty === "easy");
    const mediumTasks = DAILY_TASK_TEMPLATES.filter(t => t.difficulty === "medium");
    const hardTasks = DAILY_TASK_TEMPLATES.filter(t => t.difficulty === "hard" || t.difficulty === "expert");

    const selectedTemplates = [
      ...this.randomSelect(easyTasks, 3),
      ...this.randomSelect(mediumTasks, 2),
      ...this.randomSelect(hardTasks, 1),
    ];

    this.dailyTasks = selectedTemplates.map(template => ({
      ...template,
      id: `daily_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      current: 0,
      isCompleted: false,
      isClaimed: false,
      expiresAt: tomorrow.getTime(),
      createdAt: now,
    }));

    this.saveToStorage();
  }

  private generateWeeklyTasks(): void {
    const now = Date.now();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay() + 1) % 7);
    nextWeek.setHours(5, 0, 0, 0);

    this.weeklyTasks = WEEKLY_TASK_TEMPLATES.map(template => ({
      ...template,
      id: `weekly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      current: 0,
      isCompleted: false,
      isClaimed: false,
      expiresAt: nextWeek.getTime(),
      createdAt: now,
    }));

    this.saveToStorage();
  }

  private randomSelect<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getDailyTasks(): DailyTask[] {
    this.checkAndRefreshTasks();
    return this.dailyTasks;
  }

  getWeeklyTasks(): DailyTask[] {
    this.checkAndRefreshTasks();
    return this.weeklyTasks;
  }

  getAllTasks(): DailyTask[] {
    return [...this.getDailyTasks(), ...this.getWeeklyTasks()];
  }

  getCompletedTasks(): DailyTask[] {
    return this.getAllTasks().filter(t => t.isCompleted);
  }

  getPendingTasks(): DailyTask[] {
    return this.getAllTasks().filter(t => !t.isCompleted);
  }

  getClaimableTasks(): DailyTask[] {
    return this.getAllTasks().filter(t => t.isCompleted && !t.isClaimed);
  }

  updateProgress(type: TaskType, amount: number = 1): DailyTask[] {
    const completed: DailyTask[] = [];

    for (const task of [...this.dailyTasks, ...this.weeklyTasks]) {
      if (task.isCompleted) continue;

      if (task.type === type) {
        task.current = Math.min(task.target, task.current + amount);

        if (task.current >= task.target) {
          task.isCompleted = true;
          completed.push(task);
          this.notifyObservers(task);
        }
      }
    }

    this.saveToStorage();
    return completed;
  }

  claimReward(taskId: string): TaskReward | null {
    const allTasks = [...this.dailyTasks, ...this.weeklyTasks];
    const task = allTasks.find(t => t.id === taskId);

    if (!task || !task.isCompleted || task.isClaimed) {
      return null;
    }

    task.isClaimed = true;
    this.saveToStorage();

    return task.rewards;
  }

  claimAllRewards(): { rewards: TaskReward; taskCount: number } {
    const claimable = this.getClaimableTasks();
    let totalGold = 0;
    let totalGems = 0;
    let totalExp = 0;
    let totalPacks = 0;

    for (const task of claimable) {
      task.isClaimed = true;
      if (task.rewards.gold) totalGold += task.rewards.gold;
      if (task.rewards.gems) totalGems += task.rewards.gems;
      if (task.rewards.exp) totalExp += task.rewards.exp;
      if (task.rewards.cardPacks) totalPacks += task.rewards.cardPacks;
    }

    this.saveToStorage();

    return {
      rewards: {
        gold: totalGold,
        gems: totalGems,
        exp: totalExp,
        cardPacks: totalPacks,
      },
      taskCount: claimable.length,
    };
  }

  getProgress(): {
    dailyCompleted: number;
    dailyTotal: number;
    weeklyCompleted: number;
    weeklyTotal: number;
    completionPercentage: number;
  } {
    const daily = this.getDailyTasks();
    const weekly = this.getWeeklyTasks();

    const dailyCompleted = daily.filter(t => t.isCompleted).length;
    const weeklyCompleted = weekly.filter(t => t.isCompleted).length;
    const totalCompleted = dailyCompleted + weeklyCompleted;
    const totalTasks = daily.length + weekly.length;

    return {
      dailyCompleted,
      dailyTotal: daily.length,
      weeklyCompleted,
      weeklyTotal: weekly.length,
      completionPercentage: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    };
  }

  getTimeUntilRefresh(): { hours: number; minutes: number } {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(5, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  }

  subscribe(callback: (task: DailyTask) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(task: DailyTask): void {
    this.observers.forEach(callback => callback(task));
  }

  forceRefresh(): void {
    this.generateDailyTasks();
    this.generateWeeklyTasks();
    localStorage.setItem(DailyTaskService.LAST_REFRESH_KEY, Date.now().toString());
  }

  resetProgress(): void {
    for (const task of [...this.dailyTasks, ...this.weeklyTasks]) {
      task.current = 0;
      task.isCompleted = false;
      task.isClaimed = false;
    }
    this.saveToStorage();
  }

  getTaskStats(): {
    totalTasksCompleted: number;
    totalRewardsClaimed: {
      gold: number;
      gems: number;
      exp: number;
      cardPacks: number;
    };
  } {
    const allTasks = [...this.dailyTasks, ...this.weeklyTasks];
    const completed = allTasks.filter(t => t.isCompleted);

    let totalGold = 0;
    let totalGems = 0;
    let totalExp = 0;
    let totalPacks = 0;

    for (const task of completed) {
      if (task.rewards.gold) totalGold += task.rewards.gold;
      if (task.rewards.gems) totalGems += task.rewards.gems;
      if (task.rewards.exp) totalExp += task.rewards.exp;
      if (task.rewards.cardPacks) totalPacks += task.rewards.cardPacks;
    }

    return {
      totalTasksCompleted: completed.length,
      totalRewardsClaimed: {
        gold: totalGold,
        gems: totalGems,
        exp: totalExp,
        cardPacks: totalPacks,
      },
    };
  }
}

export const dailyTaskService = new DailyTaskService();
