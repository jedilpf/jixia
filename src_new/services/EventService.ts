export type EventType = "login" | "battle" | "collection" | "social" | "special";

export type EventStatus = "upcoming" | "active" | "ended";

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startTime: number;
  endTime: number;
  bannerImage?: string;
  icon?: string;
  rewards: EventReward[];
  tasks: EventTask[];
  rules: string[];
  isFeatured: boolean;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface EventReward {
  id: string;
  name: string;
  description: string;
  type: "gold" | "gems" | "card_pack" | "card" | "cosmetic" | "title" | "border";
  quantity: number;
  itemId?: string;
  requiredPoints: number;
  isClaimed: boolean;
  icon: string;
}

export interface EventTask {
  id: string;
  name: string;
  description: string;
  type: "daily" | "one_time" | "progressive";
  target: number;
  current: number;
  points: number;
  isCompleted: boolean;
  isClaimed: boolean;
  resetTime?: number;
}

export interface EventProgress {
  eventId: string;
  totalPoints: number;
  currentPoints: number;
  tasksCompleted: number;
  totalTasks: number;
  rewardsClaimed: number;
  totalRewards: number;
}

export interface EventParticipation {
  eventId: string;
  joinedAt: number;
  lastActiveAt: number;
  tasks: Map<string, EventTask>;
  claimedRewards: string[];
}

export const DEFAULT_EVENTS: Omit<GameEvent, "status">[] = [
  {
    id: "event_weekend_bonus",
    name: "周末双倍奖励",
    description: "周末期间，所有对战奖励翻倍！",
    type: "special",
    startTime: 0, // 动态计算
    endTime: 0,
    bannerImage: "/events/weekend_bonus.png",
    icon: "🎉",
    rewards: [
      { id: "reward_1", name: "双倍金币", description: "对战获得双倍金币", type: "gold", quantity: 0, requiredPoints: 0, isClaimed: false, icon: "💰" },
    ],
    tasks: [],
    rules: ["周末期间所有对战金币奖励翻倍", "活动时间为周六00:00至周日23:59"],
    isFeatured: true,
    priority: 1,
  },
  {
    id: "event_login_streak",
    name: "连续登录奖励",
    description: "连续登录7天，领取丰厚奖励！",
    type: "login",
    startTime: Date.now(),
    endTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
    bannerImage: "/events/login_streak.png",
    icon: "📅",
    rewards: [
      { id: "reward_day1", name: "第1天", description: "100金币", type: "gold", quantity: 100, requiredPoints: 1, isClaimed: false, icon: "💰" },
      { id: "reward_day2", name: "第2天", description: "200金币", type: "gold", quantity: 200, requiredPoints: 2, isClaimed: false, icon: "💰" },
      { id: "reward_day3", name: "第3天", description: "1个卡包", type: "card_pack", quantity: 1, requiredPoints: 3, isClaimed: false, icon: "🎁" },
      { id: "reward_day4", name: "第4天", description: "300金币", type: "gold", quantity: 300, requiredPoints: 4, isClaimed: false, icon: "💰" },
      { id: "reward_day5", name: "第5天", description: "50宝石", type: "gems", quantity: 50, requiredPoints: 5, isClaimed: false, icon: "💎" },
      { id: "reward_day6", name: "第6天", description: "2个卡包", type: "card_pack", quantity: 2, requiredPoints: 6, isClaimed: false, icon: "🎁" },
      { id: "reward_day7", name: "第7天", description: "限定头像", type: "cosmetic", quantity: 1, itemId: "avatar_special", requiredPoints: 7, isClaimed: false, icon: "👤" },
    ],
    tasks: [
      { id: "task_login", name: "每日登录", description: "登录游戏", type: "daily", target: 1, current: 0, points: 1, isCompleted: false, isClaimed: false },
    ],
    rules: ["每日登录即可获得1点进度", "连续登录7天可获得全部奖励", "断签后进度重置"],
    isFeatured: true,
    priority: 2,
  },
  {
    id: "event_battle_fever",
    name: "对战狂热",
    description: "完成指定对战任务，赢取奖励！",
    type: "battle",
    startTime: Date.now(),
    endTime: Date.now() + 14 * 24 * 60 * 60 * 1000,
    bannerImage: "/events/battle_fever.png",
    icon: "⚔️",
    rewards: [
      { id: "reward_b1", name: "初级奖励", description: "500金币", type: "gold", quantity: 500, requiredPoints: 10, isClaimed: false, icon: "💰" },
      { id: "reward_b2", name: "中级奖励", description: "3个卡包", type: "card_pack", quantity: 3, requiredPoints: 30, isClaimed: false, icon: "🎁" },
      { id: "reward_b3", name: "高级奖励", description: "200宝石", type: "gems", quantity: 200, requiredPoints: 60, isClaimed: false, icon: "💎" },
      { id: "reward_b4", name: "终极奖励", description: "限定卡背", type: "cosmetic", quantity: 1, itemId: "cardback_special", requiredPoints: 100, isClaimed: false, icon: "🃏" },
    ],
    tasks: [
      { id: "task_win", name: "赢得对战", description: "赢得1场对战", type: "progressive", target: 50, current: 0, points: 2, isCompleted: false, isClaimed: false },
      { id: "task_play", name: "完成对局", description: "完成1场对局", type: "progressive", target: 100, current: 0, points: 1, isCompleted: false, isClaimed: false },
      { id: "task_daily", name: "每日首胜", description: "获得今日首场胜利", type: "daily", target: 1, current: 0, points: 5, isCompleted: false, isClaimed: false, resetTime: 24 * 60 * 60 * 1000 },
    ],
    rules: ["赢得对战获得2点进度", "完成对局获得1点进度", "每日首胜额外获得5点进度"],
    isFeatured: true,
    priority: 3,
  },
  {
    id: "event_collection_rush",
    name: "收集冲刺",
    description: "收集指定卡牌，解锁特殊奖励！",
    type: "collection",
    startTime: Date.now(),
    endTime: Date.now() + 21 * 24 * 60 * 60 * 1000,
    bannerImage: "/events/collection_rush.png",
    icon: "📚",
    rewards: [
      { id: "reward_c1", name: "收集者", description: "收集10张卡牌", type: "gold", quantity: 300, requiredPoints: 10, isClaimed: false, icon: "💰" },
      { id: "reward_c2", name: "收藏家", description: "收集30张卡牌", type: "card_pack", quantity: 5, requiredPoints: 30, isClaimed: false, icon: "🎁" },
      { id: "reward_c3", name: "收藏大师", description: "收集50张卡牌", type: "gems", quantity: 300, requiredPoints: 50, isClaimed: false, icon: "💎" },
    ],
    tasks: [
      { id: "task_collect", name: "收集卡牌", description: "收集1张新卡牌", type: "progressive", target: 50, current: 0, points: 1, isCompleted: false, isClaimed: false },
      { id: "task_open", name: "开启卡包", description: "开启1个卡包", type: "progressive", target: 20, current: 0, points: 2, isCompleted: false, isClaimed: false },
    ],
    rules: ["收集新卡牌获得1点进度", "开启卡包获得2点进度", "重复卡牌不计入进度"],
    isFeatured: false,
    priority: 4,
  },
  {
    id: "event_spring_festival",
    name: "春节活动",
    description: "新春佳节，特别活动开启！",
    type: "special",
    startTime: Date.now(),
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    bannerImage: "/events/spring_festival.png",
    icon: "🧧",
    rewards: [
      { id: "reward_s1", name: "新春红包", description: "888金币", type: "gold", quantity: 888, requiredPoints: 1, isClaimed: false, icon: "🧧" },
      { id: "reward_s2", name: "春节限定", description: "春节头像", type: "cosmetic", quantity: 1, itemId: "avatar_spring", requiredPoints: 10, isClaimed: false, icon: "👤" },
      { id: "reward_s3", name: "春节称号", description: "春节专属称号", type: "title", quantity: 1, itemId: "title_spring", requiredPoints: 20, isClaimed: false, icon: "🏷️" },
    ],
    tasks: [
      { id: "task_login_festival", name: "春节登录", description: "活动期间登录", type: "one_time", target: 1, current: 0, points: 1, isCompleted: false, isClaimed: false },
      { id: "task_battle_festival", name: "春节对战", description: "完成春节对战", type: "progressive", target: 10, current: 0, points: 2, isCompleted: false, isClaimed: false },
    ],
    rules: ["活动期间登录即可获得新春红包", "完成对战获得额外奖励"],
    isFeatured: true,
    priority: 0,
  },
];

export class EventService {
  private static readonly EVENTS_KEY = "jixia_events";
  private static readonly PARTICIPATION_KEY = "jixia_event_participation";

  private events: Map<string, GameEvent> = new Map();
  private participation: Map<string, EventParticipation> = new Map();
  private observers: Set<(event: EventServiceEvent) => void> = new Set();

  constructor() {
    this.initializeEvents();
    this.loadFromStorage();
  }

  private initializeEvents(): void {
    for (const eventData of DEFAULT_EVENTS) {
      const event: GameEvent = {
        ...eventData,
        status: this.calculateEventStatus(eventData.startTime, eventData.endTime),
      };
      this.events.set(event.id, event);
    }
  }

  private calculateEventStatus(startTime: number, endTime: number): EventStatus {
    const now = Date.now();
    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    return "active";
  }

  private loadFromStorage(): void {
    try {
      const participationData = localStorage.getItem(EventService.PARTICIPATION_KEY);
      if (participationData) {
        const data = JSON.parse(participationData);
        for (const [id, participation] of Object.entries(data)) {
          this.participation.set(id, participation as EventParticipation);
        }
      }
    } catch (e) {
      console.warn("Failed to load event participation from storage");
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.participation);
      localStorage.setItem(EventService.PARTICIPATION_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save event participation to storage");
    }
  }

  getAllEvents(): GameEvent[] {
    return Array.from(this.events.values()).sort((a, b) => {
      // 活跃的活动排在前面
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      // 按优先级排序
      return a.priority - b.priority;
    });
  }

  getActiveEvents(): GameEvent[] {
    return this.getAllEvents().filter(e => e.status === "active");
  }

  getFeaturedEvents(): GameEvent[] {
    return this.getActiveEvents().filter(e => e.isFeatured);
  }

  getEvent(eventId: string): GameEvent | undefined {
    return this.events.get(eventId);
  }

  getEventProgress(eventId: string): EventProgress | null {
    const event = this.events.get(eventId);
    const participation = this.participation.get(eventId);
    
    if (!event) return null;

    const tasks = participation ? Array.from(participation.tasks.values()) : event.tasks;
    const tasksCompleted = tasks.filter(t => t.isCompleted).length;
    const currentPoints = tasks.reduce((sum, t) => sum + (t.isCompleted ? t.points : 0), 0);
    const claimedRewards = participation?.claimedRewards.length || 0;

    return {
      eventId,
      totalPoints: event.rewards[event.rewards.length - 1]?.requiredPoints || 0,
      currentPoints,
      tasksCompleted,
      totalTasks: event.tasks.length,
      rewardsClaimed: claimedRewards,
      totalRewards: event.rewards.length,
    };
  }

  joinEvent(eventId: string): boolean {
    const event = this.events.get(eventId);
    if (!event || event.status !== "active") return false;

    if (!this.participation.has(eventId)) {
      const participation: EventParticipation = {
        eventId,
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        tasks: new Map(event.tasks.map(t => [t.id, { ...t }])),
        claimedRewards: [],
      };
      this.participation.set(eventId, participation);
      this.saveToStorage();
      this.notifyObservers({ type: "event_joined", data: { eventId } });
    }

    return true;
  }

  updateTaskProgress(eventId: string, taskId: string, progress: number): boolean {
    const participation = this.participation.get(eventId);
    if (!participation) return false;

    const task = participation.tasks.get(taskId);
    if (!task || task.isCompleted) return false;

    task.current = Math.min(task.target, task.current + progress);
    
    if (task.current >= task.target && !task.isCompleted) {
      task.isCompleted = true;
      this.notifyObservers({ type: "task_completed", data: { eventId, taskId, task } });
    }

    participation.lastActiveAt = Date.now();
    this.saveToStorage();

    return true;
  }

  claimReward(eventId: string, rewardId: string): { success: boolean; reward?: EventReward; error?: string } {
    const event = this.events.get(eventId);
    const participation = this.participation.get(eventId);
    
    if (!event || !participation) {
      return { success: false, error: "活动不存在或未参加" };
    }

    const reward = event.rewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, error: "奖励不存在" };
    }

    if (participation.claimedRewards.includes(rewardId)) {
      return { success: false, error: "奖励已领取" };
    }

    // 计算当前进度
    const currentPoints = Array.from(participation.tasks.values())
      .reduce((sum, t) => sum + (t.isCompleted ? t.points : 0), 0);

    if (currentPoints < reward.requiredPoints) {
      return { success: false, error: "进度不足" };
    }

    participation.claimedRewards.push(rewardId);
    reward.isClaimed = true;
    
    this.saveToStorage();
    this.notifyObservers({ type: "reward_claimed", data: { eventId, rewardId, reward } });

    return { success: true, reward };
  }

  getTimeRemaining(eventId: string): { days: number; hours: number; minutes: number } | null {
    const event = this.events.get(eventId);
    if (!event || event.status !== "active") return null;

    const remaining = event.endTime - Date.now();
    if (remaining <= 0) return { days: 0, hours: 0, minutes: 0 };

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return { days, hours, minutes };
  }

  refreshEventStatus(): void {
    for (const event of this.events.values()) {
      const newStatus = this.calculateEventStatus(event.startTime, event.endTime);
      if (event.status !== newStatus) {
        event.status = newStatus;
        this.notifyObservers({ type: "event_status_changed", data: { eventId: event.id, status: newStatus } });
      }
    }
  }

  subscribe(callback: (event: EventServiceEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: EventServiceEvent): void {
    this.observers.forEach(callback => callback(event));
  }

  // 快速创建活动
  createEvent(eventData: Omit<GameEvent, "id" | "status">): GameEvent {
    const event: GameEvent = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: this.calculateEventStatus(eventData.startTime, eventData.endTime),
    };

    this.events.set(event.id, event);
    this.notifyObservers({ type: "event_created", data: event });

    return event;
  }

  deleteEvent(eventId: string): boolean {
    const deleted = this.events.delete(eventId);
    if (deleted) {
      this.participation.delete(eventId);
      this.saveToStorage();
      this.notifyObservers({ type: "event_deleted", data: { eventId } });
    }
    return deleted;
  }
}

export interface EventServiceEvent {
  type:
    | "event_joined"
    | "task_completed"
    | "reward_claimed"
    | "event_status_changed"
    | "event_created"
    | "event_deleted";
  data: unknown;
}

export const eventService = new EventService();
