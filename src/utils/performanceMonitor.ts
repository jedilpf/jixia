/**
 * 性能监控与内存泄漏防护工具
 *
 * 功能：
 * 1. requestAnimationFrame追踪与清理
 * 2. setInterval追踪与清理
 * 3. 事件监听器追踪与清理
 * 4. 内存使用监控
 * 5. 性能指标收集
 */

// ═══════════════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════════════

interface TrackedTimer {
  id: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;
  type: 'timeout' | 'interval';
  label: string;
  createdAt: number;
}

interface TrackedRAF {
  id: number;
  label: string;
  createdAt: number;
}

interface TrackedListener {
  target: EventTarget;
  event: string;
  handler: EventListener;
  label: string;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage?: number;
  timerCount: number;
  rafCount: number;
  listenerCount: number;
}

// ═══════════════════════════════════════════════════════════════
// 全局追踪器
// ═══════════════════════════════════════════════════════════════

class ResourceTracker {
  private static instance: ResourceTracker;

  private timers: Map<string, TrackedTimer> = new Map();
  private rafs: Map<string, TrackedRAF> = new Map();
  private listeners: Map<string, TrackedListener> = new Map();

  private idCounter: number = 0;

  static getInstance(): ResourceTracker {
    if (!ResourceTracker.instance) {
      ResourceTracker.instance = new ResourceTracker();
    }
    return ResourceTracker.instance;
  }

  // === Timer 追踪 ===

  trackTimeout(
    callback: () => void,
    delay: number,
    label: string = 'anonymous'
  ): { id: ReturnType<typeof setTimeout>; trackingId: string } {
    const trackingId = `timeout_${++this.idCounter}`;

    const id = setTimeout(() => {
      this.timers.delete(trackingId);
      callback();
    }, delay);

    this.timers.set(trackingId, {
      id,
      type: 'timeout',
      label,
      createdAt: Date.now(),
    });

    return { id, trackingId };
  }

  trackInterval(
    callback: () => void,
    delay: number,
    label: string = 'anonymous'
  ): { id: ReturnType<typeof setInterval>; trackingId: string } {
    const trackingId = `interval_${++this.idCounter}`;

    const id = setInterval(callback, delay);

    this.intervals.set(trackingId, {
      id,
      type: 'interval',
      label,
      createdAt: Date.now(),
    });

    return { id, trackingId };
  }

  private intervals: Map<string, TrackedTimer> = new Map();

  clearTimeout(trackingId: string): boolean {
    const timer = this.timers.get(trackingId);
    if (timer) {
      clearTimeout(timer.id);
      this.timers.delete(trackingId);
      return true;
    }
    return false;
  }

  clearInterval(trackingId: string): boolean {
    const timer = this.intervals.get(trackingId);
    if (timer) {
      clearInterval(timer.id);
      this.intervals.delete(trackingId);
      return true;
    }
    return false;
  }

  // === RAF 追踪 ===

  trackRAF(
    callback: FrameRequestCallback,
    label: string = 'anonymous'
  ): { id: number; trackingId: string } {
    const trackingId = `raf_${++this.idCounter}`;

    const id = requestAnimationFrame((timestamp) => {
      this.rafs.delete(trackingId);
      callback(timestamp);
    });

    this.rafs.set(trackingId, {
      id,
      label,
      createdAt: Date.now(),
    });

    return { id, trackingId };
  }

  trackRepeatingRAF(
    callback: FrameRequestCallback,
    label: string = 'anonymous'
  ): { cancel: () => void; trackingId: string } {
    const trackingId = `raf_repeating_${++this.idCounter}`;
    let id: number;
    let cancelled = false;

    const loop = (timestamp: number) => {
      if (cancelled) return;
      callback(timestamp);
      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);

    this.rafs.set(trackingId, {
      id,
      label,
      createdAt: Date.now(),
    });

    return {
      cancel: () => {
        cancelled = true;
        cancelAnimationFrame(id);
        this.rafs.delete(trackingId);
      },
      trackingId,
    };
  }

  cancelRAF(trackingId: string): boolean {
    const raf = this.rafs.get(trackingId);
    if (raf) {
      cancelAnimationFrame(raf.id);
      this.rafs.delete(trackingId);
      return true;
    }
    return false;
  }

  // === 事件监听器追踪 ===

  trackEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
    label: string = 'anonymous'
  ): string {
    const trackingId = `listener_${++this.idCounter}`;

    target.addEventListener(event, handler, options);

    this.listeners.set(trackingId, {
      target,
      event,
      handler,
      label,
    });

    return trackingId;
  }

  removeEventListener(trackingId: string): boolean {
    const listener = this.listeners.get(trackingId);
    if (listener) {
      listener.target.removeEventListener(listener.event, listener.handler);
      this.listeners.delete(trackingId);
      return true;
    }
    return false;
  }

  // === 批量清理 ===

  clearAll(): void {
    // 清理所有定时器
    for (const timer of this.timers.values()) {
      clearTimeout(timer.id);
    }
    this.timers.clear();

    for (const timer of this.intervals.values()) {
      clearInterval(timer.id);
    }
    this.intervals.clear();

    // 清理所有RAF
    for (const raf of this.rafs.values()) {
      cancelAnimationFrame(raf.id);
    }
    this.rafs.clear();

    // 清理所有事件监听器
    for (const listener of this.listeners.values()) {
      listener.target.removeEventListener(listener.event, listener.handler);
    }
    this.listeners.clear();

    console.log('[ResourceTracker] 已清理所有资源');
  }

  clearByLabel(label: string): number {
    let count = 0;

    // 清理匹配标签的定时器
    for (const timer of this.timers.values()) {
      if (timer.label === label) {
        clearTimeout(timer.id);
        this.timers.delete(timer.label);
        count++;
      }
    }

    for (const timer of this.intervals.values()) {
      if (timer.label === label) {
        clearInterval(timer.id);
        this.intervals.delete(timer.label);
        count++;
      }
    }

    // 清理匹配标签的RAF
    for (const raf of this.rafs.values()) {
      if (raf.label === label) {
        cancelAnimationFrame(raf.id);
        this.rafs.delete(raf.label);
        count++;
      }
    }

    // 清理匹配标签的监听器
    for (const listener of this.listeners.values()) {
      if (listener.label === label) {
        listener.target.removeEventListener(listener.event, listener.handler);
        this.listeners.delete(listener.label);
        count++;
      }
    }

    return count;
  }

  // === 状态查询 ===

  getStats(): {
    timerCount: number;
    intervalCount: number;
    rafCount: number;
    listenerCount: number;
  } {
    return {
      timerCount: this.timers.size,
      intervalCount: this.intervals.size,
      rafCount: this.rafs.size,
      listenerCount: this.listeners.size,
    };
  }

  getDetailedStats(): {
    timers: TrackedTimer[];
    rafs: TrackedRAF[];
    listeners: { trackingId: string; event: string; label: string }[];
  } {
    return {
      timers: Array.from(this.timers.values()),
      rafs: Array.from(this.rafs.values()),
      listeners: Array.from(this.listeners.entries()).map(([id, listener]) => ({
        trackingId: id,
        event: listener.event,
        label: listener.label,
      })),
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 性能监控
// ═══════════════════════════════════════════════════════════════

class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private rafId: number | null = null;

  private memorySamples: number[] = [];
  private maxSamples: number = 100;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  start(): void {
    if (this.rafId !== null) return;

    const measureFPS = () => {
      this.frameCount++;
      const now = performance.now();
      const delta = now - this.lastTime;

      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastTime = now;

        // 采样内存
        this.sampleMemory();
      }

      this.rafId = requestAnimationFrame(measureFPS);
    };

    this.rafId = requestAnimationFrame(measureFPS);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private sampleMemory(): void {
    // @ts-expect-error - memory API 非标准
    if (performance.memory) {
      // @ts-expect-error - memory API 非标准
      const used = performance.memory.usedJSHeapSize / (1024 * 1024);
      this.memorySamples.push(used);
      if (this.memorySamples.length > this.maxSamples) {
        this.memorySamples.shift();
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    const tracker = ResourceTracker.getInstance();
    const stats = tracker.getStats();

    return {
      fps: this.fps,
      memoryUsage: this.memorySamples.length > 0
        ? this.memorySamples[this.memorySamples.length - 1]
        : undefined,
      timerCount: stats.timerCount + stats.intervalCount,
      rafCount: stats.rafCount,
      listenerCount: stats.listenerCount,
    };
  }

  getMemoryTrend(): 'increasing' | 'stable' | 'decreasing' {
    if (this.memorySamples.length < 10) return 'stable';

    const recent = this.memorySamples.slice(-10);
    const older = this.memorySamples.slice(-20, -10);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0
      ? older.reduce((a, b) => a + b, 0) / older.length
      : recentAvg;

    const diff = recentAvg - olderAvg;

    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }
}

// ═══════════════════════════════════════════════════════════════
// React Hook 封装
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';

/**
 * 自动清理的 setTimeout Hook
 */
export function useTrackedTimeout(
  callback: () => void,
  delay: number | null,
  label: string = 'useTrackedTimeout'
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tracker = ResourceTracker.getInstance();
    const { trackingId } = tracker.trackTimeout(
      () => savedCallback.current(),
      delay,
      label
    );

    return () => {
      tracker.clearTimeout(trackingId);
    };
  }, [delay, label]);
}

/**
 * 自动清理的 setInterval Hook
 */
export function useTrackedInterval(
  callback: () => void,
  delay: number | null,
  label: string = 'useTrackedInterval'
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tracker = ResourceTracker.getInstance();
    const { trackingId } = tracker.trackInterval(
      () => savedCallback.current(),
      delay,
      label
    );

    return () => {
      tracker.clearInterval(trackingId);
    };
  }, [delay, label]);
}

/**
 * 自动清理的 RAF Hook
 */
export function useTrackedRAF(
  callback: FrameRequestCallback,
  active: boolean = true,
  label: string = 'useTrackedRAF'
): void {
  const savedCallback = useRef(callback);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      return;
    }

    const tracker = ResourceTracker.getInstance();
    const { cancel } = tracker.trackRepeatingRAF(
      (timestamp) => savedCallback.current(timestamp),
      label
    );

    cancelRef.current = cancel;

    return () => {
      cancel();
      cancelRef.current = null;
    };
  }, [active, label]);
}

/**
 * 自动清理的事件监听器 Hook
 */
export function useTrackedEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener,
  deps: React.DependencyList = [],
  label: string = 'useTrackedEventListener'
): void {
  useEffect(() => {
    const tracker = ResourceTracker.getInstance();
    const trackingId = tracker.trackEventListener(
      target,
      event,
      handler,
      undefined,
      label
    );

    return () => {
      tracker.removeEventListener(trackingId);
    };
  }, [target, event, handler, label, ...deps]);
}

/**
 * 组件卸载时清理所有资源的 Hook
 */
export function useCleanupOnUnmount(label: string): void {
  useEffect(() => {
    return () => {
      const tracker = ResourceTracker.getInstance();
      const count = tracker.clearByLabel(label);
      if (count > 0) {
        console.log(`[CleanupOnUnmount] 已清理 ${count} 个资源: ${label}`);
      }
    };
  }, [label]);
}

// ═══════════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════════

export const resourceTracker = ResourceTracker.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();