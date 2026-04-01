export type AnalyticsEventType =
  | "page_view"
  | "button_click"
  | "feature_use"
  | "game_start"
  | "game_end"
  | "purchase"
  | "error"
  | "performance"
  | "custom";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  name: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties: Record<string, unknown>;
  metadata: {
    url?: string;
    referrer?: string;
    userAgent?: string;
    screenResolution?: string;
    language?: string;
  };
}

export interface AnalyticsSession {
  id: string;
  startTime: number;
  endTime?: number;
  userId?: string;
  deviceInfo: {
    platform: string;
    browser?: string;
    os?: string;
    screenSize: string;
  };
  events: AnalyticsEvent[];
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  sampleRate: number;
  anonymizeIp: boolean;
}

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: number;
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  batchSize: 20,
  flushInterval: 30000,
  sampleRate: 1.0,
  anonymizeIp: true,
};

export class AnalyticsService {
  private static readonly SESSION_KEY = "jixia_analytics_session";
  private static readonly EVENTS_KEY = "jixia_analytics_events";
  private static readonly USER_ID_KEY = "jixia_analytics_user_id";

  private config: AnalyticsConfig = { ...DEFAULT_ANALYTICS_CONFIG };
  private currentSession: AnalyticsSession | null = null;
  private eventBuffer: AnalyticsEvent[] = [];
  private metrics: MetricData[] = [];
  private flushTimer: number | null = null;
  private observers: Set<(event: AnalyticsEvent) => void> = new Set();

  constructor(config?: Partial<AnalyticsConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromStorage();
    if (this.config.enabled) {
      this.startSession();
      this.startFlushTimer();
    }
  }

  private loadFromStorage(): void {
    try {
      const sessionData = localStorage.getItem(AnalyticsService.SESSION_KEY);
      if (sessionData) {
        this.currentSession = JSON.parse(sessionData);
      }

      const eventsData = localStorage.getItem(AnalyticsService.EVENTS_KEY);
      if (eventsData) {
        this.eventBuffer = JSON.parse(eventsData);
      }
    } catch (e) {
      console.warn("Failed to load analytics from storage");
    }
  }

  private saveToStorage(): void {
    try {
      if (this.currentSession) {
        localStorage.setItem(AnalyticsService.SESSION_KEY, JSON.stringify(this.currentSession));
      }
      localStorage.setItem(AnalyticsService.EVENTS_KEY, JSON.stringify(this.eventBuffer));
    } catch (e) {
      console.warn("Failed to save analytics to storage");
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserId(): string {
    let userId = localStorage.getItem(AnalyticsService.USER_ID_KEY);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(AnalyticsService.USER_ID_KEY, userId);
    }
    return userId;
  }

  private getDeviceInfo() {
    return {
      platform: navigator.platform,
      browser: navigator.userAgent,
      os: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
    };
  }

  private startSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      userId: this.generateUserId(),
      deviceInfo: this.getDeviceInfo(),
      events: [],
    };
    this.saveToStorage();
  }

  private endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.saveToStorage();
    }
  }

  private startFlushTimer(): void {
    this.stopFlushTimer();
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

  // 追踪事件
  track(
    type: AnalyticsEventType,
    name: string,
    properties: Record<string, unknown> = {}
  ): void {
    if (!this.config.enabled) return;

    // 采样率检查
    if (Math.random() > this.config.sampleRate) return;

    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name,
      timestamp: Date.now(),
      userId: this.currentSession?.userId,
      sessionId: this.currentSession?.id || "unknown",
      properties,
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
      },
    };

    this.eventBuffer.push(event);

    // 添加到当前会话
    if (this.currentSession) {
      this.currentSession.events.push(event);
    }

    this.saveToStorage();
    this.notifyObservers(event);

    // 如果缓冲区满了，立即刷新
    if (this.eventBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // 页面浏览
  pageView(pageName: string, properties?: Record<string, unknown>): void {
    this.track("page_view", pageName, properties);
  }

  // 按钮点击
  buttonClick(buttonName: string, properties?: Record<string, unknown>): void {
    this.track("button_click", buttonName, properties);
  }

  // 功能使用
  featureUse(featureName: string, properties?: Record<string, unknown>): void {
    this.track("feature_use", featureName, properties);
  }

  // 游戏事件
  gameStart(gameMode: string, properties?: Record<string, unknown>): void {
    this.track("game_start", gameMode, properties);
  }

  gameEnd(result: "win" | "loss" | "draw", properties?: Record<string, unknown>): void {
    this.track("game_end", result, properties);
  }

  // 购买事件
  purchase(
    itemName: string,
    value: number,
    currency: string = "CNY",
    properties?: Record<string, unknown>
  ): void {
    this.track("purchase", itemName, {
      value,
      currency,
      ...properties,
    });
  }

  // 错误追踪
  trackError(error: Error, context?: string): void {
    this.track("error", error.name, {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  // 性能指标
  trackPerformance(metricName: string, value: number, unit?: string): void {
    this.track("performance", metricName, { value, unit });
    this.recordMetric(metricName, value, unit);
  }

  // 记录指标
  recordMetric(name: string, value: number, unit?: string, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      unit,
      tags,
      timestamp: Date.now(),
    });
  }

  // 批量追踪
  trackBatch(events: Array<{ type: AnalyticsEventType; name: string; properties?: Record<string, unknown> }>): void {
    for (const event of events) {
      this.track(event.type, event.name, event.properties);
    }
  }

  // 刷新数据到服务器
  async flush(): Promise<boolean> {
    if (this.eventBuffer.length === 0) return true;

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = [];
    this.saveToStorage();

    try {
      // 模拟发送到分析服务器
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log(`[Analytics] Flushed ${eventsToSend.length} events`);
      return true;
    } catch (e) {
      // 发送失败，恢复缓冲区
      this.eventBuffer.unshift(...eventsToSend);
      this.saveToStorage();
      console.error("[Analytics] Failed to flush events", e);
      return false;
    }
  }

  // 获取当前会话
  getCurrentSession(): AnalyticsSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  // 获取事件统计
  getEventStats(): {
    totalEvents: number;
    byType: Record<AnalyticsEventType, number>;
    byName: Record<string, number>;
  } {
    const allEvents = [...this.eventBuffer, ...(this.currentSession?.events || [])];
    const byType: Record<AnalyticsEventType, number> = {
      page_view: 0,
      button_click: 0,
      feature_use: 0,
      game_start: 0,
      game_end: 0,
      purchase: 0,
      error: 0,
      performance: 0,
      custom: 0,
    };
    const byName: Record<string, number> = {};

    for (const event of allEvents) {
      byType[event.type]++;
      byName[event.name] = (byName[event.name] || 0) + 1;
    }

    return {
      totalEvents: allEvents.length,
      byType,
      byName,
    };
  }

  // 获取会话时长（毫秒）
  getSessionDuration(): number {
    if (!this.currentSession) return 0;
    const endTime = this.currentSession.endTime || Date.now();
    return endTime - this.currentSession.startTime;
  }

  // 获取指标数据
  getMetrics(name?: string, timeRange?: { start: number; end: number }): MetricData[] {
    let filtered = [...this.metrics];

    if (name) {
      filtered = filtered.filter((m) => m.name === name);
    }

    if (timeRange) {
      filtered = filtered.filter((m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
    }

    return filtered;
  }

  // 计算指标统计
  calculateMetricStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    sum: number;
  } | null {
    const metrics = this.metrics.filter((m) => m.name === name);
    if (metrics.length === 0) return null;

    const values = metrics.map((m) => m.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
      sum,
    };
  }

  // 设置用户属性
  setUserProperties(properties: Record<string, unknown>): void {
    if (this.currentSession) {
      this.track("custom", "user_properties", properties);
    }
  }

  // 更新配置
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enabled && !this.flushTimer) {
      this.startFlushTimer();
    } else if (!this.config.enabled && this.flushTimer) {
      this.stopFlushTimer();
    }
  }

  // 获取配置
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  // 启用/禁用
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled) {
      this.startFlushTimer();
    } else {
      this.stopFlushTimer();
    }
  }

  // 导出数据
  exportData(): {
    session: AnalyticsSession | null;
    events: AnalyticsEvent[];
    metrics: MetricData[];
  } {
    return {
      session: this.currentSession,
      events: this.eventBuffer,
      metrics: this.metrics,
    };
  }

  subscribe(callback: (event: AnalyticsEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: AnalyticsEvent): void {
    this.observers.forEach((callback) => callback(event));
  }

  // 销毁
  destroy(): void {
    this.endSession();
    this.flush();
    this.stopFlushTimer();
    this.observers.clear();
  }
}

export const analyticsService = new AnalyticsService();
