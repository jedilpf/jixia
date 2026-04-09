/**
 * 游戏配置系统
 *
 * 功能：
 * 1. 可配置的游戏参数
 * 2. 运行时可修改
 * 3. 配置持久化
 * 4. 默认值与验证
 */

// ═══════════════════════════════════════════════════════════════
// 配置类型定义
// ═══════════════════════════════════════════════════════════════

export interface BattleConfig {
  // 战斗时长
  phaseDuration: {
    ming_bian: number;  // 明辩阶段秒数
    an_mou: number;     // 暗谋阶段秒数
    reveal: number;     // 揭示阶段秒数
    resolve: number;    // 结算阶段秒数
  };

  // 手牌上限
  handLimit: number;

  // 弃牌超时
  discardTimeoutSec: number;

  // AI 延迟（毫秒）
  aiDelay: {
    min: number;
    max: number;
  };

  // 大势胜利条件
  winDaShi: number;
}

export interface UIConfig {
  // 动画时长（毫秒）
  animationDuration: {
    fast: number;
    normal: number;
    slow: number;
  };

  // 布局尺寸
  layout: {
    cardWidth: number;
    cardHeight: number;
    handAreaHeight: number;
    statusBarHeight: number;
  };

  // 字体
  fonts: {
    primary: string;
    serif: string;
    mono: string;
  };

  // 颜色主题
  colors: {
    gold: string;
    jade: string;
    crimson: string;
    paper: string;
    ink: string;
  };
}

export interface AudioConfig {
  // 音量
  volumes: {
    master: number;
    bgm: number;
    sfx: number;
    voice: number;
  };

  // 音效开关
  enabled: {
    bgm: boolean;
    sfx: boolean;
    voice: boolean;
  };
}

export interface GameConfig {
  battle: BattleConfig;
  ui: UIConfig;
  audio: AudioConfig;
  debug: {
    showFps: boolean;
    showHitboxes: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

// ═══════════════════════════════════════════════════════════════
// 默认配置
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_CONFIG: GameConfig = {
  battle: {
    phaseDuration: {
      ming_bian: 30,
      an_mou: 25,
      reveal: 10,
      resolve: 15,
    },
    handLimit: 10,
    discardTimeoutSec: 15,
    aiDelay: {
      min: 800,
      max: 2000,
    },
    winDaShi: 8,
  },

  ui: {
    animationDuration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    layout: {
      cardWidth: 88,
      cardHeight: 120,
      handAreaHeight: 168,
      statusBarHeight: 56,
    },
    fonts: {
      primary: "'Noto Sans SC', sans-serif",
      serif: "'Noto Serif SC', serif",
      mono: "'JetBrains Mono', monospace",
    },
    colors: {
      gold: '#d4a520',
      jade: '#3a5f41',
      crimson: '#8d2f2f',
      paper: '#fdfbf7',
      ink: '#1a1a1a',
    },
  },

  audio: {
    volumes: {
      master: 0.8,
      bgm: 0.6,
      sfx: 0.7,
      voice: 0.9,
    },
    enabled: {
      bgm: true,
      sfx: true,
      voice: true,
    },
  },

  debug: {
    showFps: false,
    showHitboxes: false,
    logLevel: 'info',
  },
};

// ═══════════════════════════════════════════════════════════════
// 配置管理器
// ═══════════════════════════════════════════════════════════════

const CONFIG_STORAGE_KEY = 'jixia.game.config';

class ConfigManager {
  private static instance: ConfigManager;

  private config: GameConfig;
  private listeners: Set<(config: GameConfig) => void> = new Set();

  private constructor() {
    // 从 localStorage 加载配置
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // 获取完整配置
  getConfig(): GameConfig {
    return { ...this.config };
  }

  // 获取部分配置
  get<K extends keyof GameConfig>(key: K): GameConfig[K] {
    return { ...this.config[key] } as GameConfig[K];
  }

  // 更新配置
  update<K extends keyof GameConfig>(
    key: K,
    value: Partial<GameConfig[K]>
  ): void {
    this.config[key] = {
      ...this.config[key],
      ...value,
    } as GameConfig[K];

    this.saveConfig();
    this.notifyListeners();
  }

  // 重置为默认值
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
    this.notifyListeners();
  }

  // 监听配置变化
  subscribe(listener: (config: GameConfig) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // 私有方法

  private loadConfig(): GameConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 深度合并，保留新增的默认值
        return this.deepMerge(DEFAULT_CONFIG, parsed);
      }
    } catch (err) {
      console.warn('[ConfigManager] 加载配置失败:', err);
    }
    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (err) {
      console.warn('[ConfigManager] 保存配置失败:', err);
    }
  }

  private notifyListeners(): void {
    const config = this.getConfig();
    this.listeners.forEach(listener => listener(config));
  }

  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof target[key] === 'object' &&
          target[key] !== null
        ) {
          result[key] = this.deepMerge(
            target[key] as object,
            source[key] as object
          ) as T[Extract<keyof T, string>];
        } else {
          result[key] = source[key] as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }
}

export const configManager = ConfigManager.getInstance();

// ═══════════════════════════════════════════════════════════════
// React Hook
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

/**
 * 获取游戏配置 Hook
 */
export function useGameConfig(): GameConfig {
  const [config, setConfig] = useState<GameConfig>(() => configManager.getConfig());

  useEffect(() => {
    return configManager.subscribe(setConfig);
  }, []);

  return config;
}

/**
 * 获取部分配置 Hook
 */
export function useConfig<K extends keyof GameConfig>(key: K): GameConfig[K] {
  const [value, setValue] = useState<GameConfig[K]>(() => configManager.get(key));

  useEffect(() => {
    return configManager.subscribe(config => {
      setValue(config[key]);
    });
  }, [key]);

  return value;
}

/**
 * 更新配置 Hook
 */
export function useUpdateConfig<K extends keyof GameConfig>(
  key: K
): (value: Partial<GameConfig[K]>) => void {
  return useCallback(
    (value: Partial<GameConfig[K]>) => {
      configManager.update(key, value);
    },
    [key]
  );
}

import { useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// 便捷访问器
// ═══════════════════════════════════════════════════════════════

export const battleConfig = {
  get phaseDuration() {
    return configManager.get('battle').phaseDuration;
  },
  get handLimit() {
    return configManager.get('battle').handLimit;
  },
  get discardTimeout() {
    return configManager.get('battle').discardTimeoutSec;
  },
  get aiDelay() {
    return configManager.get('battle').aiDelay;
  },
  get winDaShi() {
    return configManager.get('battle').winDaShi;
  },
};

export const uiConfig = {
  get animationDuration() {
    return configManager.get('ui').animationDuration;
  },
  get layout() {
    return configManager.get('ui').layout;
  },
  get fonts() {
    return configManager.get('ui').fonts;
  },
  get colors() {
    return configManager.get('ui').colors;
  },
};

export const audioConfig = {
  get volumes() {
    return configManager.get('audio').volumes;
  },
  get enabled() {
    return configManager.get('audio').enabled;
  },
};