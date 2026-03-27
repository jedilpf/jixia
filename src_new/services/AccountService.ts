export type AccountStatus = "active" | "suspended" | "banned" | "guest";

export type UserRole = "player" | "vip" | "moderator" | "admin";

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: AccountStatus;
  role: UserRole;
  level: number;
  exp: number;
  createdAt: number;
  lastLoginAt: number;
  lastLoginIp?: string;
  loginCount: number;
  playTime: number; // 总游戏时长（分钟）
  settings: UserSettings;
  security: SecuritySettings;
  preferences: UserPreferences;
}

export interface UserSettings {
  language: string;
  region: string;
  timezone: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  autoSaveReplay: boolean;
  showFPS: boolean;
  graphicsQuality: "low" | "medium" | "high" | "ultra";
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: number;
  trustedDevices: string[];
  loginHistory: LoginRecord[];
}

export interface LoginRecord {
  timestamp: number;
  ip: string;
  device: string;
  location?: string;
  success: boolean;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  cardBack: string;
  boardTheme: string;
  emoteSet: string;
  favoriteHero?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  inviteCode?: string;
}

export interface SessionInfo {
  token: string;
  refreshToken: string;
  expiresAt: number;
  deviceId: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  language: "zh-CN",
  region: "CN",
  timezone: "Asia/Shanghai",
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  autoSaveReplay: true,
  showFPS: false,
  graphicsQuality: "high",
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "dark",
  cardBack: "default",
  boardTheme: "classic",
  emoteSet: "default",
};

export class AccountService {
  private static readonly CURRENT_USER_KEY = "jixia_current_user";
  private static readonly SESSION_KEY = "jixia_session";
  private static readonly DEVICE_ID_KEY = "jixia_device_id";

  private currentUser: UserAccount | null = null;
  private session: SessionInfo | null = null;
  private observers: Set<(event: AccountEvent) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const userData = localStorage.getItem(AccountService.CURRENT_USER_KEY);
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }

      const sessionData = localStorage.getItem(AccountService.SESSION_KEY);
      if (sessionData) {
        this.session = JSON.parse(sessionData);
      }
    } catch (e) {
      console.warn("Failed to load account from storage");
    }
  }

  private saveToStorage(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(AccountService.CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      }
      if (this.session) {
        localStorage.setItem(AccountService.SESSION_KEY, JSON.stringify(this.session));
      }
    } catch (e) {
      console.warn("Failed to save account to storage");
    }
  }

  private generateDeviceId(): string {
    let deviceId = localStorage.getItem(AccountService.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(AccountService.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    // 模拟登录验证
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 这里应该调用后端API进行验证
    // 暂时使用模拟数据
    if (credentials.username && credentials.password) {
      const user: UserAccount = {
        id: `user_${Date.now()}`,
        username: credentials.username,
        status: "active",
        role: "player",
        level: 1,
        exp: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        loginCount: 1,
        playTime: 0,
        settings: { ...DEFAULT_USER_SETTINGS },
        security: {
          twoFactorEnabled: false,
          trustedDevices: [this.generateDeviceId()],
          loginHistory: [],
        },
        preferences: { ...DEFAULT_USER_PREFERENCES },
      };

      const session: SessionInfo = {
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refreshToken: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天
        deviceId: this.generateDeviceId(),
      };

      this.currentUser = user;
      this.session = session;
      this.saveToStorage();

      this.notifyObservers({ type: "login", data: { user, session } });

      return { success: true, user };
    }

    return { success: false, error: "用户名或密码错误" };
  }

  async register(data: RegisterData): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 验证用户名
    if (!data.username || data.username.length < 3) {
      return { success: false, error: "用户名至少需要3个字符" };
    }

    // 验证密码
    if (!data.password || data.password.length < 6) {
      return { success: false, error: "密码至少需要6个字符" };
    }

    // 创建新用户
    const user: UserAccount = {
      id: `user_${Date.now()}`,
      username: data.username,
      email: data.email,
      phone: data.phone,
      status: "active",
      role: "player",
      level: 1,
      exp: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      loginCount: 1,
      playTime: 0,
      settings: { ...DEFAULT_USER_SETTINGS },
      security: {
        twoFactorEnabled: false,
        trustedDevices: [this.generateDeviceId()],
        loginHistory: [],
      },
      preferences: { ...DEFAULT_USER_PREFERENCES },
    };

    const session: SessionInfo = {
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      refreshToken: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      deviceId: this.generateDeviceId(),
    };

    this.currentUser = user;
    this.session = session;
    this.saveToStorage();

    this.notifyObservers({ type: "register", data: { user, session } });

    return { success: true, user };
  }

  async guestLogin(): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user: UserAccount = {
      id: `guest_${Date.now()}`,
      username: `游客${Math.floor(Math.random() * 10000)}`,
      status: "guest",
      role: "player",
      level: 1,
      exp: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      loginCount: 1,
      playTime: 0,
      settings: { ...DEFAULT_USER_SETTINGS },
      security: {
        twoFactorEnabled: false,
        trustedDevices: [],
        loginHistory: [],
      },
      preferences: { ...DEFAULT_USER_PREFERENCES },
    };

    this.currentUser = user;
    this.saveToStorage();

    this.notifyObservers({ type: "guest_login", data: { user } });

    return { success: true, user };
  }

  logout(): void {
    this.currentUser = null;
    this.session = null;
    localStorage.removeItem(AccountService.CURRENT_USER_KEY);
    localStorage.removeItem(AccountService.SESSION_KEY);
    this.notifyObservers({ type: "logout", data: null });
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null && this.currentUser.status !== "guest";
  }

  isGuest(): boolean {
    return this.currentUser?.status === "guest";
  }

  getCurrentUser(): UserAccount | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  getSession(): SessionInfo | null {
    return this.session ? { ...this.session } : null;
  }

  async upgradeGuest(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    if (!this.isGuest()) {
      return { success: false, error: "当前不是游客账号" };
    }

    const result = await this.register(data);
    if (result.success) {
      // 迁移游客数据到新账号
      this.notifyObservers({ type: "guest_upgraded", data: { oldUser: this.currentUser, newUser: result.user } });
    }

    return { success: result.success, error: result.error };
  }

  updateProfile(updates: Partial<Pick<UserAccount, "username" | "avatar" | "email" | "phone">>): boolean {
    if (!this.currentUser) return false;

    Object.assign(this.currentUser, updates);
    this.saveToStorage();
    this.notifyObservers({ type: "profile_updated", data: this.currentUser });
    return true;
  }

  updateSettings(settings: Partial<UserSettings>): boolean {
    if (!this.currentUser) return false;

    this.currentUser.settings = { ...this.currentUser.settings, ...settings };
    this.saveToStorage();
    this.notifyObservers({ type: "settings_updated", data: this.currentUser.settings });
    return true;
  }

  updatePreferences(preferences: Partial<UserPreferences>): boolean {
    if (!this.currentUser) return false;

    this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
    this.saveToStorage();
    this.notifyObservers({ type: "preferences_updated", data: this.currentUser.preferences });
    return true;
  }

  addExp(amount: number): { leveledUp: boolean; newLevel?: number; rewards?: unknown[] } {
    if (!this.currentUser) return { leveledUp: false };

    this.currentUser.exp += amount;
    const oldLevel = this.currentUser.level;

    // 计算新等级（每级需要等级*100经验）
    let newLevel = oldLevel;
    let requiredExp = newLevel * 100;
    while (this.currentUser.exp >= requiredExp) {
      this.currentUser.exp -= requiredExp;
      newLevel++;
      requiredExp = newLevel * 100;
    }

    const leveledUp = newLevel > oldLevel;
    this.currentUser.level = newLevel;
    this.saveToStorage();

    if (leveledUp) {
      this.notifyObservers({ type: "level_up", data: { oldLevel, newLevel, exp: this.currentUser.exp } });
    }

    return {
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      rewards: leveledUp ? this.getLevelUpRewards(newLevel) : undefined,
    };
  }

  private getLevelUpRewards(level: number): unknown[] {
    const rewards = [];
    if (level % 5 === 0) {
      rewards.push({ type: "card_pack", quantity: 1 });
    }
    if (level % 10 === 0) {
      rewards.push({ type: "gems", quantity: 100 });
    }
    return rewards;
  }

  recordPlayTime(minutes: number): void {
    if (!this.currentUser) return;

    this.currentUser.playTime += minutes;
    this.saveToStorage();
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 这里应该调用后端API
    if (!this.currentUser) {
      return { success: false, error: "未登录" };
    }

    // 验证旧密码
    // ...

    if (newPassword.length < 6) {
      return { success: false, error: "新密码至少需要6个字符" };
    }

    this.currentUser.security.lastPasswordChange = Date.now();
    this.saveToStorage();

    return { success: true };
  }

  async bindEmail(email: string, verificationCode: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!this.currentUser) {
      return { success: false, error: "未登录" };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "邮箱格式不正确" };
    }

    this.currentUser.email = email;
    this.saveToStorage();

    return { success: true };
  }

  async bindPhone(phone: string, verificationCode: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!this.currentUser) {
      return { success: false, error: "未登录" };
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return { success: false, error: "手机号格式不正确" };
    }

    this.currentUser.phone = phone;
    this.saveToStorage();

    return { success: true };
  }

  getLevelProgress(): { current: number; required: number; percentage: number } {
    if (!this.currentUser) {
      return { current: 0, required: 100, percentage: 0 };
    }

    const required = this.currentUser.level * 100;
    const percentage = Math.round((this.currentUser.exp / required) * 100);

    return {
      current: this.currentUser.exp,
      required,
      percentage,
    };
  }

  subscribe(callback: (event: AccountEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: AccountEvent): void {
    this.observers.forEach((callback) => callback(event));
  }

  clearAccountData(): void {
    this.currentUser = null;
    this.session = null;
    localStorage.removeItem(AccountService.CURRENT_USER_KEY);
    localStorage.removeItem(AccountService.SESSION_KEY);
    localStorage.removeItem(AccountService.DEVICE_ID_KEY);
  }
}

export interface AccountEvent {
  type:
    | "login"
    | "register"
    | "guest_login"
    | "logout"
    | "guest_upgraded"
    | "profile_updated"
    | "settings_updated"
    | "preferences_updated"
    | "level_up";
  data: unknown;
}

export const accountService = new AccountService();
