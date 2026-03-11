/**
 * 错误追踪服务
 *
 * 捕获和报告应用错误，帮助开发者快速定位问题
 */

export interface ErrorReport {
  id: string;
  timestamp: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  userAgent: string;
  url: string;
  gameState?: unknown;
}

export class ErrorTrackingService {
  private errors: ErrorReport[] = [];
  private isEnabled: boolean = true;
  private maxErrors: number = 100;
  private onErrorCallback: ((error: ErrorReport) => void) | null = null;
  private readonly STORAGE_KEY = 'jixia_errors';

  constructor() {
    this.setupGlobalHandlers();
    this.loadStoredErrors();
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalHandlers(): void {
    // 捕获未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      });
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
      });
    });
  }

  /**
   * 追踪错误
   */
  trackError(params: Omit<ErrorReport, 'id' | 'timestamp' | 'userAgent' | 'url'>): void {
    if (!this.isEnabled) return;

    const error: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...params,
    };

    this.errors.push(error);

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 保存到本地存储
    this.saveErrors();

    // 通知回调
    this.onErrorCallback?.(error);

    // 控制台输出
    console.error('[ErrorTracking]', error);
  }

  /**
   * 追踪警告
   */
  trackWarning(message: string, context?: Record<string, unknown>): void {
    this.trackError({
      type: 'warning',
      message,
      ...context,
    });
  }

  /**
   * 追踪信息
   */
  trackInfo(message: string, context?: Record<string, unknown>): void {
    this.trackError({
      type: 'info',
      message,
      ...context,
    });
  }

  /**
   * 包装函数以自动捕获错误
   */
  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: string
  ): T {
    return ((...args: unknown[]) => {
      try {
        return fn(...args);
      } catch (error) {
        this.trackError({
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          action: context,
        });
        throw error;
      }
    }) as T;
  }

  /**
   * 包装异步函数
   */
  wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: string
  ): T {
    return (async (...args: unknown[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.trackError({
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          action: context,
        });
        throw error;
      }
    }) as T;
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(count: number = 10): ErrorReport[] {
    return this.errors.slice(-count);
  }

  /**
   * 按类型获取错误
   */
  getErrorsByType(type: ErrorReport['type']): ErrorReport[] {
    return this.errors.filter((e) => e.type === type);
  }

  /**
   * 清除所有错误
   */
  clearErrors(): void {
    this.errors = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 导出错误报告
   */
  exportErrors(): string {
    return JSON.stringify(
      {
        errors: this.errors,
        exportDate: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      null,
      2
    );
  }

  /**
   * 启用/禁用错误追踪
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 保存错误到本地存储
   */
  private saveErrors(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errors));
    } catch (error) {
      console.error('[ErrorTracking] Failed to save errors:', error);
    }
  }

  /**
   * 从本地存储加载错误
   */
  private loadStoredErrors(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[ErrorTracking] Failed to load errors:', error);
    }
  }

  /**
   * 设置错误回调
   */
  onError(callback: (error: ErrorReport) => void): void {
    this.onErrorCallback = callback;
  }
}

// 便捷导出
export const errorTrackingService = new ErrorTrackingService();
export default errorTrackingService;
