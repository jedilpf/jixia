export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type LogCategory =
  | "system"
  | "game"
  | "network"
  | "ui"
  | "ai"
  | "performance"
  | "security"
  | "analytics";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: unknown;
  source?: string;
  userId?: string;
  sessionId?: string;
  stackTrace?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  maxEntries: number;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
}

export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  minLevel: "info",
  maxEntries: 1000,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
  batchSize: 50,
  flushInterval: 30000,
};

export class LoggerService {
  private static readonly LOGS_KEY = "jixia_logs";
  private static readonly LOG_INDEX_KEY = "jixia_log_index";

  private logs: LogEntry[] = [];
  private config: LoggerConfig = { ...DEFAULT_LOGGER_CONFIG };
  private buffer: LogEntry[] = [];
  private flushTimer: number | null = null;
  private observers: Set<(entry: LogEntry) => void> = new Set();

  constructor(config?: Partial<LoggerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromStorage();
    this.startFlushTimer();
  }

  private loadFromStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      const logsData = localStorage.getItem(LoggerService.LOGS_KEY);
      if (logsData) {
        this.logs = JSON.parse(logsData);
      }
    } catch (e) {
      console.warn("Failed to load logs from storage");
    }
  }

  private saveToStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      // 只保留最新的日志
      const logsToSave = this.logs.slice(-this.config.maxEntries);
      localStorage.setItem(LoggerService.LOGS_KEY, JSON.stringify(logsToSave));
    } catch (e) {
      console.warn("Failed to save logs to storage");
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: unknown,
    source?: string
  ): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      source: source || this.getCallerInfo(),
    };

    // 如果是错误，捕获堆栈
    if (level === "error" || level === "fatal") {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  private getCallerInfo(): string {
    try {
      const stack = new Error().stack;
      if (!stack) return "unknown";

      const lines = stack.split("\n");
      // 跳过前3行（Error、getCallerInfo、log方法）
      const callerLine = lines[4] || lines[3];
      if (callerLine) {
        const match = callerLine.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/);
        if (match) {
          return `${match[1]} (${match[2]}:${match[3]})`;
        }
      }
    } catch (e) {
      // 忽略错误
    }
    return "unknown";
  }

  private processLogEntry(entry: LogEntry): void {
    // 添加到内存
    this.logs.push(entry);

    // 限制数量
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    // 控制台输出
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // 添加到缓冲区（用于远程发送）
    if (this.config.enableRemote) {
      this.buffer.push(entry);
    }

    // 保存到本地
    this.saveToStorage();

    // 通知观察者
    this.notifyObservers(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;

    const styles: Record<LogLevel, string> = {
      debug: "color: #6c757d",
      info: "color: #0d6efd",
      warn: "color: #ffc107",
      error: "color: #dc3545; font-weight: bold",
      fatal: "color: #dc3545; font-weight: bold; background: #f8d7da",
    };

    switch (entry.level) {
      case "debug":
        console.debug(`%c${prefix}`, styles[entry.level], entry.message, entry.data || "");
        break;
      case "info":
        console.info(`%c${prefix}`, styles[entry.level], entry.message, entry.data || "");
        break;
      case "warn":
        console.warn(`%c${prefix}`, styles[entry.level], entry.message, entry.data || "");
        break;
      case "error":
      case "fatal":
        console.error(`%c${prefix}`, styles[entry.level], entry.message, entry.data || "");
        if (entry.stackTrace) {
          console.error(entry.stackTrace);
        }
        break;
    }
  }

  private startFlushTimer(): void {
    if (!this.config.enableRemote) return;

    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private async flush(): Promise<void> {
    if (!this.config.enableRemote || this.buffer.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const batch = this.buffer.splice(0, this.config.batchSize);

    try {
      // 模拟发送日志到远程服务器
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log(`[Logger] Flushed ${batch.length} logs to remote`);
    } catch (e) {
      // 发送失败，放回缓冲区
      this.buffer.unshift(...batch);
      console.error("[Logger] Failed to flush logs", e);
    }
  }

  // 公共日志方法
  debug(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog("debug")) return;
    const entry = this.createLogEntry("debug", category, message, data);
    this.processLogEntry(entry);
  }

  info(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog("info")) return;
    const entry = this.createLogEntry("info", category, message, data);
    this.processLogEntry(entry);
  }

  warn(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog("warn")) return;
    const entry = this.createLogEntry("warn", category, message, data);
    this.processLogEntry(entry);
  }

  error(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog("error")) return;
    const entry = this.createLogEntry("error", category, message, data);
    this.processLogEntry(entry);
  }

  fatal(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog("fatal")) return;
    const entry = this.createLogEntry("fatal", category, message, data);
    this.processLogEntry(entry);
    // 致命错误立即刷新
    this.flush();
  }

  // 获取日志
  getLogs(
    filter?: {
      level?: LogLevel;
      category?: LogCategory;
      startTime?: number;
      endTime?: number;
      search?: string;
    },
    limit: number = 100
  ): LogEntry[] {
    let filtered = [...this.logs];

    if (filter) {
      if (filter.level) {
        filtered = filtered.filter((l) => LOG_LEVEL_PRIORITY[l.level] >= LOG_LEVEL_PRIORITY[filter.level!]);
      }
      if (filter.category) {
        filtered = filtered.filter((l) => l.category === filter.category);
      }
      if (filter.startTime) {
        filtered = filtered.filter((l) => l.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        filtered = filtered.filter((l) => l.timestamp <= filter.endTime!);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.message.toLowerCase().includes(search) ||
            JSON.stringify(l.data).toLowerCase().includes(search)
        );
      }
    }

    return filtered.slice(-limit).sort((a, b) => b.timestamp - a.timestamp);
  }

  // 获取最新日志
  getLatestLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count).sort((a, b) => b.timestamp - a.timestamp);
  }

  // 按类别获取日志
  getLogsByCategory(category: LogCategory, limit: number = 50): LogEntry[] {
    return this.logs
      .filter((l) => l.category === category)
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // 按级别获取日志
  getLogsByLevel(level: LogLevel, limit: number = 50): LogEntry[] {
    return this.logs
      .filter((l) => l.level === level)
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // 清空日志
  clearLogs(): void {
    this.logs = [];
    this.buffer = [];
    this.saveToStorage();
  }

  // 导出日志
  exportLogs(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = ["timestamp", "level", "category", "message", "source"].join(",");
      const rows = this.logs.map((l) =>
        [new Date(l.timestamp).toISOString(), l.level, l.category, `"${l.message}"`, l.source || ""].join(",")
      );
      return [headers, ...rows].join("\n");
    }

    return JSON.stringify(this.logs, null, 2);
  }

  // 更新配置
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // 如果禁用远程，停止定时器
    if (!this.config.enableRemote) {
      this.stopFlushTimer();
    } else if (!this.flushTimer) {
      this.startFlushTimer();
    }
  }

  // 获取配置
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // 设置最小日志级别
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  // 获取统计信息
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
  } {
    const byLevel: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 };
    const byCategory: Record<LogCategory, number> = {
      system: 0,
      game: 0,
      network: 0,
      ui: 0,
      ai: 0,
      performance: 0,
      security: 0,
      analytics: 0,
    };

    for (const log of this.logs) {
      byLevel[log.level]++;
      byCategory[log.category]++;
    }

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
    };
  }

  subscribe(callback: (entry: LogEntry) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(entry: LogEntry): void {
    this.observers.forEach((callback) => callback(entry));
  }

  // 销毁
  destroy(): void {
    this.stopFlushTimer();
    this.flush();
    this.observers.clear();
  }
}

// 创建默认实例
export const logger = new LoggerService();

// 便捷的导出方法
export const logDebug = (category: LogCategory, message: string, data?: unknown) =>
  logger.debug(category, message, data);
export const logInfo = (category: LogCategory, message: string, data?: unknown) =>
  logger.info(category, message, data);
export const logWarn = (category: LogCategory, message: string, data?: unknown) =>
  logger.warn(category, message, data);
export const logError = (category: LogCategory, message: string, data?: unknown) =>
  logger.error(category, message, data);
export const logFatal = (category: LogCategory, message: string, data?: unknown) =>
  logger.fatal(category, message, data);
