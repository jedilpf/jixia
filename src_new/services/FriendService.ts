export type FriendStatus = "online" | "offline" | "in_game" | "in_queue";

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: FriendStatus;
  lastOnline: number;
  level: number;
  rank: number;
  tier: string;
  isFavorite: boolean;
  note?: string;
  addedAt: number;
  mutualFriends: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar?: string;
  message?: string;
  sentAt: number;
  expiresAt: number;
}

export interface FriendActivity {
  id: string;
  friendId: string;
  friendName: string;
  type: "game_start" | "game_end" | "rank_up" | "achievement" | "online";
  details: string;
  timestamp: number;
}

export interface FriendStats {
  totalFriends: number;
  onlineFriends: number;
  inGameFriends: number;
  pendingRequests: number;
  favoriteFriends: number;
}

export class FriendService {
  private static readonly FRIENDS_KEY = "jixia_friends";
  private static readonly REQUESTS_KEY = "jixia_friend_requests";
  private static readonly ACTIVITY_KEY = "jixia_friend_activity";
  private static readonly BLOCKED_KEY = "jixia_blocked_users";
  private static readonly MAX_FRIENDS = 200;
  private static readonly MAX_REQUESTS = 50;
  private static readonly REQUEST_EXPIRY = 7 * 24 * 60 * 60 * 1000;

  private friends: Map<string, Friend> = new Map();
  private requests: Map<string, FriendRequest> = new Map();
  private activity: FriendActivity[] = [];
  private blockedUsers: Set<string> = new Set();
  private observers: Set<(event: FriendEvent) => void> = new Set();
  private currentPlayerId: string = "";

  constructor(playerId: string = "") {
    this.currentPlayerId = playerId;
    this.loadFromStorage();
    this.startStatusPolling();
  }

  private loadFromStorage(): void {
    try {
      const friendsData = localStorage.getItem(FriendService.FRIENDS_KEY);
      if (friendsData) {
        const friends = JSON.parse(friendsData);
        this.friends = new Map(Object.entries(friends));
      }

      const requestsData = localStorage.getItem(FriendService.REQUESTS_KEY);
      if (requestsData) {
        const requests = JSON.parse(requestsData);
        this.requests = new Map(Object.entries(requests));
        this.cleanExpiredRequests();
      }

      const activityData = localStorage.getItem(FriendService.ACTIVITY_KEY);
      if (activityData) {
        this.activity = JSON.parse(activityData);
      }

      const blockedData = localStorage.getItem(FriendService.BLOCKED_KEY);
      if (blockedData) {
        this.blockedUsers = new Set(JSON.parse(blockedData));
      }
    } catch (e) {
      console.warn("Failed to load friend data from storage");
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        FriendService.FRIENDS_KEY,
        JSON.stringify(Object.fromEntries(this.friends))
      );
      localStorage.setItem(
        FriendService.REQUESTS_KEY,
        JSON.stringify(Object.fromEntries(this.requests))
      );
      localStorage.setItem(FriendService.ACTIVITY_KEY, JSON.stringify(this.activity));
      localStorage.setItem(
        FriendService.BLOCKED_KEY,
        JSON.stringify(Array.from(this.blockedUsers))
      );
    } catch (e) {
      console.warn("Failed to save friend data to storage");
    }
  }

  private cleanExpiredRequests(): void {
    const now = Date.now();
    for (const [id, request] of this.requests) {
      if (request.expiresAt < now) {
        this.requests.delete(id);
      }
    }
    this.saveToStorage();
  }

  private startStatusPolling(): void {
    setInterval(() => {
      this.updateFriendStatuses();
    }, 30000);
  }

  private updateFriendStatuses(): void {
    for (const [id, friend] of this.friends) {
      if (friend.status !== "offline" && Date.now() - friend.lastOnline > 300000) {
        friend.status = "offline";
        this.friends.set(id, friend);
      }
    }
    this.saveToStorage();
  }

  async sendFriendRequest(targetId: string, message?: string): Promise<boolean> {
    if (this.friends.has(targetId)) {
      throw new Error("已经是好友");
    }

    if (this.blockedUsers.has(targetId)) {
      throw new Error("无法向已屏蔽用户发送请求");
    }

    if (this.friends.size >= FriendService.MAX_FRIENDS) {
      throw new Error("好友数量已达上限");
    }

    if (this.requests.size >= FriendService.MAX_REQUESTS) {
      throw new Error("待处理请求过多");
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const request: FriendRequest = {
      id: `req_${Date.now()}_${targetId}`,
      fromId: this.currentPlayerId,
      fromName: "当前玩家",
      message,
      sentAt: Date.now(),
      expiresAt: Date.now() + FriendService.REQUEST_EXPIRY,
    };

    this.requests.set(request.id, request);
    this.saveToStorage();

    this.notifyObservers({
      type: "request_sent",
      data: request,
    });

    return true;
  }

  async acceptFriendRequest(requestId: string): Promise<Friend | null> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error("请求不存在或已过期");
    }

    if (this.friends.size >= FriendService.MAX_FRIENDS) {
      throw new Error("好友数量已达上限");
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const friend: Friend = {
      id: request.fromId,
      name: request.fromName,
      avatar: request.fromAvatar,
      status: "offline",
      lastOnline: Date.now(),
      level: 1,
      rank: 1000,
      tier: "青铜",
      isFavorite: false,
      addedAt: Date.now(),
      mutualFriends: 0,
    };

    this.friends.set(friend.id, friend);
    this.requests.delete(requestId);
    this.saveToStorage();

    this.addActivity({
      id: `act_${Date.now()}`,
      friendId: friend.id,
      friendName: friend.name,
      type: "online",
      details: "已成为好友",
      timestamp: Date.now(),
    });

    this.notifyObservers({
      type: "friend_added",
      data: friend,
    });

    return friend;
  }

  rejectFriendRequest(requestId: string): boolean {
    const deleted = this.requests.delete(requestId);
    if (deleted) {
      this.saveToStorage();
      this.notifyObservers({
        type: "request_rejected",
        data: { requestId },
      });
    }
    return deleted;
  }

  removeFriend(friendId: string): boolean {
    const deleted = this.friends.delete(friendId);
    if (deleted) {
      this.saveToStorage();
      this.notifyObservers({
        type: "friend_removed",
        data: { friendId },
      });
    }
    return deleted;
  }

  blockUser(userId: string): boolean {
    if (this.blockedUsers.has(userId)) {
      return false;
    }

    this.blockedUsers.add(userId);
    this.friends.delete(userId);

    for (const [id, request] of this.requests) {
      if (request.fromId === userId) {
        this.requests.delete(id);
      }
    }

    this.saveToStorage();
    return true;
  }

  unblockUser(userId: string): boolean {
    const deleted = this.blockedUsers.delete(userId);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  isBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId);
  }

  getFriends(): Friend[] {
    return Array.from(this.friends.values()).sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      const statusOrder = { online: 0, in_game: 1, in_queue: 2, offline: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return b.lastOnline - a.lastOnline;
    });
  }

  getOnlineFriends(): Friend[] {
    return this.getFriends().filter((f) => f.status !== "offline");
  }

  getFriendById(friendId: string): Friend | undefined {
    return this.friends.get(friendId);
  }

  getPendingRequests(): FriendRequest[] {
    return Array.from(this.requests.values()).sort((a, b) => b.sentAt - a.sentAt);
  }

  getFriendStats(): FriendStats {
    const friends = this.getFriends();
    return {
      totalFriends: friends.length,
      onlineFriends: friends.filter((f) => f.status === "online").length,
      inGameFriends: friends.filter((f) => f.status === "in_game").length,
      pendingRequests: this.requests.size,
      favoriteFriends: friends.filter((f) => f.isFavorite).length,
    };
  }

  updateFriendStatus(friendId: string, status: FriendStatus): void {
    const friend = this.friends.get(friendId);
    if (friend) {
      const oldStatus = friend.status;
      friend.status = status;
      friend.lastOnline = Date.now();
      this.friends.set(friendId, friend);
      this.saveToStorage();

      if (oldStatus === "offline" && status !== "offline") {
        this.addActivity({
          id: `act_${Date.now()}`,
          friendId: friend.id,
          friendName: friend.name,
          type: "online",
          details: "上线了",
          timestamp: Date.now(),
        });
      }

      this.notifyObservers({
        type: "status_changed",
        data: { friendId, status },
      });
    }
  }

  setFavorite(friendId: string, isFavorite: boolean): boolean {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.isFavorite = isFavorite;
      this.friends.set(friendId, friend);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  setFriendNote(friendId: string, note: string): boolean {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.note = note;
      this.friends.set(friendId, friend);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  async inviteToGame(friendId: string): Promise<boolean> {
    const friend = this.friends.get(friendId);
    if (!friend) {
      throw new Error("好友不存在");
    }

    if (friend.status !== "online") {
      throw new Error("好友不在线");
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    this.notifyObservers({
      type: "game_invited",
      data: { friendId, friendName: friend.name },
    });

    return true;
  }

  async spectateGame(friendId: string): Promise<boolean> {
    const friend = this.friends.get(friendId);
    if (!friend) {
      throw new Error("好友不存在");
    }

    if (friend.status !== "in_game") {
      throw new Error("好友不在游戏中");
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    this.notifyObservers({
      type: "spectate_started",
      data: { friendId, friendName: friend.name },
    });

    return true;
  }

  sendMessage(friendId: string, message: string): void {
    this.notifyObservers({
      type: "message_sent",
      data: { friendId, message, timestamp: Date.now() },
    });
  }

  private addActivity(activity: FriendActivity): void {
    this.activity.unshift(activity);
    if (this.activity.length > 100) {
      this.activity = this.activity.slice(0, 100);
    }
    this.saveToStorage();
  }

  getRecentActivity(limit: number = 20): FriendActivity[] {
    return this.activity.slice(0, limit);
  }

  getFriendActivity(friendId: string): FriendActivity[] {
    return this.activity.filter((a) => a.friendId === friendId);
  }

  searchFriends(query: string): Friend[] {
    const lowerQuery = query.toLowerCase();
    return this.getFriends().filter(
      (f) =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.note?.toLowerCase().includes(lowerQuery)
    );
  }

  subscribe(callback: (event: FriendEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: FriendEvent): void {
    this.observers.forEach((callback) => callback(event));
  }

  async suggestFriends(): Promise<Array<{ id: string; name: string; reason: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      { id: "suggested_1", name: "推荐玩家1", reason: "共同好友" },
      { id: "suggested_2", name: "推荐玩家2", reason: "最近对战" },
      { id: "suggested_3", name: "推荐玩家3", reason: "段位相近" },
    ];
  }

  exportFriendsData(): string {
    const data = {
      friends: Array.from(this.friends.values()),
      exportDate: Date.now(),
    };
    return JSON.stringify(data, null, 2);
  }

  importFriendsData(jsonData: string): number {
    try {
      const data = JSON.parse(jsonData);
      if (data.friends && Array.isArray(data.friends)) {
        let imported = 0;
        for (const friend of data.friends) {
          if (!this.friends.has(friend.id) && this.friends.size < FriendService.MAX_FRIENDS) {
            this.friends.set(friend.id, { ...friend, status: "offline" });
            imported++;
          }
        }
        this.saveToStorage();
        return imported;
      }
    } catch (e) {
      throw new Error("Invalid friend data format");
    }
    return 0;
  }

  clearAllData(): void {
    this.friends.clear();
    this.requests.clear();
    this.activity = [];
    this.blockedUsers.clear();
    this.saveToStorage();
  }
}

export interface FriendEvent {
  type:
    | "friend_added"
    | "friend_removed"
    | "status_changed"
    | "request_sent"
    | "request_rejected"
    | "game_invited"
    | "spectate_started"
    | "message_sent"
    | "message_received";
  data: unknown;
}

export const createFriendService = (playerId: string) => {
  return new FriendService(playerId);
};
