import { ErrorTrackingService } from "./ErrorTrackingService";

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  longTasks: number;
  layoutShifts: number;
  paintTime: number;
}

export interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetrics;
  slowFrames: number;
  averageFPS: number;
  memoryTrend: number[];
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxLongTasks: number;
  maxLayoutShifts: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFPS: 30,
  maxFrameTime: 33.33,
  maxLongTasks: 5,
  maxLayoutShifts: 0.1,
};

export class PerformanceService {
  private isMonitoring: boolean = false;
  private rafId: number | null = null;
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    longTasks: 0,
    layoutShifts: 0,
    paintTime: 0,
  };
  private frameCount: number = 0;
  private lastTime: number = 0;
  private slowFrames: number = 0;
  private fpsHistory: number[] = [];
  private memoryTrend: number[] = [];
  private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private longTaskObserver: PerformanceObserver | null = null;
  private layoutShiftObserver: PerformanceObserver | null = null;
  private errorTracking: ErrorTrackingService | null = null;

  constructor(errorTracking?: ErrorTrackingService) {
    this.errorTracking = errorTracking || null;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.monitorLoop();
    this.setupObservers();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.disconnectObservers();
  }

  private monitorLoop(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.frameCount++;
    this.metrics.frameTime = deltaTime;

    if (deltaTime > this.thresholds.maxFrameTime) {
      this.slowFrames++;
    }

    if (this.frameCount % 60 === 0) {
      this.calculateFPS();
    }

    this.updateMemoryUsage();
    this.notifyObservers();

    this.rafId = requestAnimationFrame(() => this.monitorLoop());
  }

  private calculateFPS(): void {
    const fps = Math.round(1000 / this.metrics.frameTime);
    this.metrics.fps = fps;
    this.fpsHistory.push(fps);

    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    if (fps < this.thresholds.minFPS) {
      this.errorTracking?.trackError({
        type: "warning",
        message: `Low FPS detected: ${fps}`,
        action: "performance_monitoring",
      });
    }
  }

  private updateMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      this.metrics.memoryUsage = usedMB;

      this.memoryTrend.push(usedMB);
      if (this.memoryTrend.length > 30) {
        this.memoryTrend.shift();
      }
    }
  }

  private setupObservers(): void {
    if ("PerformanceObserver" in window) {
      this.setupLongTaskObserver();
      this.setupLayoutShiftObserver();
    }
  }

  private setupLongTaskObserver(): void {
    try {
      this.longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.metrics.longTasks++;
            this.errorTracking?.trackError({
              type: "warning",
              message: `Long task detected: ${entry.duration}ms`,
              action: "long_task_monitoring",
            });
          }
        }
      });
      this.longTaskObserver.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      console.warn("Long task observer not supported");
    }
  }

  private setupLayoutShiftObserver(): void {
    try {
      this.layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            const value = (entry as any).value;
            this.metrics.layoutShifts += value;

            if (this.metrics.layoutShifts > this.thresholds.maxLayoutShifts) {
              this.errorTracking?.trackError({
                type: "warning",
                message: `High layout shift detected: ${this.metrics.layoutShifts}`,
                action: "layout_shift_monitoring",
              });
            }
          }
        }
      });
      this.layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("Layout shift observer not supported");
    }
  }

  private disconnectObservers(): void {
    this.longTaskObserver?.disconnect();
    this.layoutShiftObserver?.disconnect();
    this.longTaskObserver = null;
    this.layoutShiftObserver = null;
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach((callback) => callback({ ...this.metrics }));
  }

  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  getPerformanceReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      slowFrames: this.slowFrames,
      averageFPS: this.getAverageFPS(),
      memoryTrend: [...this.memoryTrend],
    };
  }

  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  reset(): void {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      longTasks: 0,
      layoutShifts: 0,
      paintTime: 0,
    };
    this.frameCount = 0;
    this.slowFrames = 0;
    this.fpsHistory = [];
    this.memoryTrend = [];
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      if (duration > 100) {
        this.errorTracking?.trackError({
          type: "warning",
          message: `Slow async operation "${name}": ${duration.toFixed(2)}ms`,
          action: "performance_measurement",
        });
      }
    });
  }

  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      if (duration > 16) {
        this.errorTracking?.trackError({
          type: "warning",
          message: `Slow sync operation "${name}": ${duration.toFixed(2)}ms`,
          action: "performance_measurement",
        });
      }
    }
  }

  mark(name: string): void {
    performance.mark(name);
  }

  measure(startMark: string, endMark: string, measureName?: string): void {
    performance.measure(measureName || `${startMark}_to_${endMark}`, startMark, endMark);
  }

  getWebVitals(): Promise<{
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  }> {
    return new Promise((resolve) => {
      const vitals = { fcp: 0, lcp: 0, fid: 0, cls: 0 };
      let resolved = false;

      const checkResolve = () => {
        if (resolved) return;
        if (vitals.fcp && vitals.lcp && vitals.fid && vitals.cls !== undefined) {
          resolved = true;
          resolve(vitals);
        }
      };

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            vitals.fcp = entry.startTime;
            checkResolve();
          }
        }
      }).observe({ entryTypes: ["paint"] });

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
        checkResolve();
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;
          vitals.fid = fid;
          checkResolve();
        }
      }).observe({ entryTypes: ["first-input"] });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            vitals.cls += (entry as any).value;
          }
        }
        checkResolve();
      }).observe({ entryTypes: ["layout-shift"] });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(vitals);
        }
      }, 10000);
    });
  }
}

export const performanceService = new PerformanceService();
