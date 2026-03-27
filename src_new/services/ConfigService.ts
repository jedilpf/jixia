export type ConfigEnvironment = "development" | "staging" | "production";

export interface GameConfig {
  // 游戏平衡配置
  balance: {
    startingHealth: number;
    startingMana: number;
    maxMana: number;
    maxHandSize: number;
    maxFieldSize: number;
    turnTimeLimit: number;
    mulliganCount: number;
  };

  // 经济系统配置
  economy: {
    startingGold: number;
    startingGems: number;
    winRewardGold: number;
    lossRewardGold: number;
    dailyLoginReward: number;
    packCostGold: number;
    packCostGems: number;
    arenaEntryCost: number;
  };

  // 经验系统配置
  experience: {
    baseExpPerWin: number;
    baseExpPerLoss: number;
    expMultiplier: number;
    maxLevel: number;
  };

  // 匹配系统配置
  matchmaking: {
    enabled: boolean;
    maxWaitTime: number;
    rankTolerance: number;
    levelTolerance: number;
    botFillThreshold: number;
  };

  // 功能开关
  features: {
    pvpEnabled: boolean;
    arenaEnabled: boolean;
    tournamentEnabled: boolean;
    spectatorEnabled: boolean;
    replayEnabled: boolean;
    chatEnabled: boolean;
    friendSystemEnabled: boolean;
    guildSystemEnabled: boolean;
  };

  // 网络配置
  network: {
    apiBaseUrl: string;
    websocketUrl: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    heartbeatInterval: number;
  };

  // 客户端配置
  client: {
    version: string;
    minVersion: string;
    forceUpdate: boolean;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
}

export interface RemoteConfig {
  key: string;
  value: unknown;
  updatedAt: number;
  updatedBy: string;
}

export const DEFAULT_CONFIG: GameConfig = {
  balance: {
    startingHealth: 30,
    startingMana: 0,
    maxMana: 10,
    maxHandSize: 10,
    maxFieldSize: 7,
    turnTimeLimit: 90,
    mulliganCount: 1,
  },

  economy: {
    startingGold: 500,
    startingGems: 0,
    winRewardGold: 10,
    lossRewardGold: 5,
    dailyLoginReward: 100,
    packCostGold: 100,
    packCostGems: 100,
    arenaEntryCost: 150,
  },

  experience: {
    baseExpPerWin: 50,
    baseExpPerLoss: 10,
    expMultiplier: 1.0,
    maxLevel: 100,
  },

  matchmaking: {
    enabled: true,
    maxWaitTime: 30000,
    rankTolerance: 500,
    levelTolerance: 10,
    botFillThreshold: 60000,
  },

  features: {
    pvpEnabled: true,
    arenaEnabled: true,
    tournamentEnabled: false,
    spectatorEnabled: true,
    replayEnabled: true,
    chatEnabled: true,
    friendSystemEnabled: true,
    guildSystemEnabled: false,
  },

  network: {
    apiBaseUrl: "https://api.jixia.game",
    websocketUrl: "wss://ws.jixia.game",
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    heartbeatInterval: 30000,
  },

  client: {
    version: "1.0.0",
    minVersion: "1.0.0",
    forceUpdate: false,
    maintenanceMode: false,
  },
};

export class ConfigService {
  private static readonly CONFIG_KEY = "jixia_game_config";
  private static readonly REMOTE_CONFIG_KEY = "jixia_remote_config";
  private static readonly LAST_FETCH_KEY = "jixia_config_last_fetch";

  private config: GameConfig = { ...DEFAULT_CONFIG };
  private remoteConfigs: Map<string, RemoteConfig> = new Map();
  private environment: ConfigEnvironment = "production";
  private observers: Set<(key: string, value: unknown) => void> = new Set();
  private fetchInterval: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.detectEnvironment();
  }

  private loadFromStorage(): void {
    try {
      const configData = localStorage.getItem(ConfigService.CONFIG_KEY);
      if (configData) {
        const stored = JSON.parse(configData);
        this.config = this.mergeDeep({ ...DEFAULT_CONFIG }, stored);
      }

      const remoteData = localStorage.getItem(ConfigService.REMOTE_CONFIG_KEY);
      if (remoteData) {
        const configs = JSON.parse(remoteData);
        this.remoteConfigs = new Map(Object.entries(configs));
      }
    } catch (e) {
      console.warn("Failed to load config from storage");
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(ConfigService.CONFIG_KEY, JSON.stringify(this.config));
      localStorage.setItem(
        ConfigService.REMOTE_CONFIG_KEY,
        JSON.stringify(Object.fromEntries(this.remoteConfigs))
      );
    } catch (e) {
      console.warn("Failed to save config to storage");
    }
  }

  private detectEnvironment(): void {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      this.environment = "development";
    } else if (hostname.includes("staging")) {
      this.environment = "staging";
    } else {
      this.environment = "production";
    }

    // 根据环境调整配置
    if (this.environment === "development") {
      this.config.network.apiBaseUrl = "http://localhost:3000";
      this.config.network.websocketUrl = "ws://localhost:3001";
    }
  }

  private mergeDeep(target: any, source: any): any {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;

    function isObject(item: any): boolean {
      return item && typeof item === "object" && !Array.isArray(item);
    }
  }

  // 获取完整配置
  getConfig(): GameConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  // 获取特定路径的配置值
  get<T>(path: string): T | undefined {
    const keys = path.split(".");
    let value: any = this.config;

    for (const key of keys) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[key];
    }

    return value as T;
  }

  // 更新本地配置
  set<T>(path: string, value: T): void {
    const keys = path.split(".");
    let target: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (target[keys[i]] === undefined) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = target[lastKey];
    target[lastKey] = value;

    this.saveToStorage();
    this.notifyObservers(path, value);

    // 如果值发生变化，触发事件
    if (oldValue !== value) {
      console.log(`[Config] ${path} changed:`, oldValue, "->", value);
    }
  }

  // 批量更新配置
  updateConfig(updates: Partial<GameConfig>): void {
    this.config = this.mergeDeep(this.config, updates);
    this.saveToStorage();
  }

  // 重置为默认配置
  resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveToStorage();
  }

  // 获取远程配置
  getRemoteConfig<T>(key: string): T | undefined {
    const config = this.remoteConfigs.get(key);
    return config?.value as T;
  }

  // 设置远程配置
  setRemoteConfig<T>(key: string, value: T, updatedBy: string = "system"): void {
    const config: RemoteConfig = {
      key,
      value,
      updatedAt: Date.now(),
      updatedBy,
    };
    this.remoteConfigs.set(key, config);
    this.saveToStorage();
    this.notifyObservers(`remote.${key}`, value);
  }

  // 从服务器获取远程配置
  async fetchRemoteConfig(): Promise<boolean> {
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 模拟返回的远程配置
      const mockRemoteConfigs = {
        "feature.new_card_pack": {
          key: "feature.new_card_pack",
          value: true,
          updatedAt: Date.now(),
          updatedBy: "admin",
        },
        "economy.weekend_bonus": {
          key: "economy.weekend_bonus",
          value: 2.0,
          updatedAt: Date.now(),
          updatedBy: "system",
        },
      };

      for (const [key, config] of Object.entries(mockRemoteConfigs)) {
        this.remoteConfigs.set(key, config as RemoteConfig);
      }

      localStorage.setItem(ConfigService.LAST_FETCH_KEY, Date.now().toString());
      this.saveToStorage();

      return true;
    } catch (e) {
      console.error("Failed to fetch remote config", e);
      return false;
    }
  }

  // 启动自动获取
  startAutoFetch(intervalMs: number = 5 * 60 * 1000): void {
    this.stopAutoFetch();
    this.fetchInterval = window.setInterval(() => {
      this.fetchRemoteConfig();
    }, intervalMs);
  }

  // 停止自动获取
  stopAutoFetch(): void {
    if (this.fetchInterval !== null) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = null;
    }
  }

  // 检查功能是否启用
  isFeatureEnabled(featureName: keyof GameConfig["features"]): boolean {
    return this.config.features[featureName];
  }

  // 检查是否在维护模式
  isMaintenanceMode(): boolean {
    return this.config.client.maintenanceMode;
  }

  // 检查版本是否需要更新
  checkVersion(currentVersion: string): {
    needsUpdate: boolean;
    forceUpdate: boolean;
    message?: string;
  } {
    const minVersion = this.config.client.minVersion;
    const latestVersion = this.config.client.version;

    // 简单版本比较
    const needsUpdate = this.compareVersions(currentVersion, latestVersion) < 0;
    const forceUpdate =
      this.config.client.forceUpdate &&
      this.compareVersions(currentVersion, minVersion) < 0;

    return {
      needsUpdate,
      forceUpdate,
      message: needsUpdate ? `新版本 ${latestVersion} 可用，请更新` : undefined,
    };
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  }

  // 获取当前环境
  getEnvironment(): ConfigEnvironment {
    return this.environment;
  }

  // 判断是否为开发环境
  isDevelopment(): boolean {
    return this.environment === "development";
  }

  // 判断是否为生产环境
  isProduction(): boolean {
    return this.environment === "production";
  }

  // 导出配置
  exportConfig(): string {
    return JSON.stringify(
      {
        config: this.config,
        remoteConfigs: Object.fromEntries(this.remoteConfigs),
        environment: this.environment,
        exportTime: Date.now(),
      },
      null,
      2
    );
  }

  // 导入配置
  importConfig(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.config) {
        this.config = this.mergeDeep(this.config, data.config);
      }
      if (data.remoteConfigs) {
        this.remoteConfigs = new Map(Object.entries(data.remoteConfigs));
      }
      this.saveToStorage();
      return true;
    } catch (e) {
      console.error("Failed to import config", e);
      return false;
    }
  }

  subscribe(callback: (key: string, value: unknown) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(key: string, value: unknown): void {
    this.observers.forEach((callback) => callback(key, value));
  }

  // 获取配置变更历史
  getLastFetchTime(): number | null {
    const time = localStorage.getItem(ConfigService.LAST_FETCH_KEY);
    return time ? parseInt(time, 10) : null;
  }

  // 清理配置
  clearConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.remoteConfigs.clear();
    localStorage.removeItem(ConfigService.CONFIG_KEY);
    localStorage.removeItem(ConfigService.REMOTE_CONFIG_KEY);
    localStorage.removeItem(ConfigService.LAST_FETCH_KEY);
  }
}

export const configService = new ConfigService();
