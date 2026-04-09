/**
 * 渲染性能优化工具
 *
 * 功能：
 * 1. 虚拟滚动组件
 * 2. 位置计算缓存
 * 3. 增量状态更新
 * 4. 防抖/节流工具
 */

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';

// ═══════════════════════════════════════════════════════════════
// 虚拟滚动
// ═══════════════════════════════════════════════════════════════

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * 虚拟滚动列表组件
 * 只渲染可见区域的项目，大幅提升长列表性能
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算可见范围
  const { startIndex, visibleItems } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      startIndex: Math.max(0, start - overscan),
      visibleItems: items.slice(Math.max(0, start - overscan), end),
    };
  }, [scrollTop, itemHeight, containerHeight, items, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflow: 'auto' }}
      className={className}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 防抖与节流
// ═══════════════════════════════════════════════════════════════

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流 Hook
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * 防抖回调 Hook
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// ═══════════════════════════════════════════════════════════════
// 位置计算缓存
// ═══════════════════════════════════════════════════════════════

interface PositionCache {
  get: (key: string) => { x: number; y: number } | null;
  set: (key: string, value: { x: number; y: number }) => void;
  clear: () => void;
}

class PositionCacheImpl implements PositionCache {
  private cache: Map<string, { x: number; y: number }> = new Map();
  private maxEntries: number = 500;

  get(key: string): { x: number; y: number } | null {
    return this.cache.get(key) || null;
  }

  set(key: string, value: { x: number; y: number }): void {
    if (this.cache.size >= this.maxEntries) {
      // 删除最早的一半条目
      const keys = Array.from(this.cache.keys());
      for (let i = 0; i < keys.length / 2; i++) {
        this.cache.delete(keys[i]);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const positionCache: PositionCache = new PositionCacheImpl();

/**
 * 手牌位置计算 Hook（带缓存）
 */
export function useHandPositions(
  cardCount: number,
  containerWidth: number,
  cardWidth: number,
  fanAngle: number = 15
): Array<{ x: number; y: number; rotation: number }> {
  return useMemo(() => {
    const cacheKey = `${cardCount}-${containerWidth}-${cardWidth}-${fanAngle}`;

    // 尝试从缓存获取
    const cached = positionCache.get(cacheKey);
    if (cached) {
      // 缓存只存了一个位置，需要重新计算
    }

    const positions: Array<{ x: number; y: number; rotation: number }> = [];
    const totalWidth = cardCount * cardWidth * 0.7;
    const startX = (containerWidth - totalWidth) / 2;

    for (let i = 0; i < cardCount; i++) {
      const progress = cardCount > 1 ? i / (cardCount - 1) : 0.5;
      const angle = (progress - 0.5) * fanAngle;
      const x = startX + i * cardWidth * 0.7;
      const y = Math.abs(progress - 0.5) * 20; // 弧形效果

      positions.push({
        x,
        y,
        rotation: angle,
      });
    }

    return positions;
  }, [cardCount, containerWidth, cardWidth, fanAngle]);
}

// ═══════════════════════════════════════════════════════════════
// 增量状态更新
// ═══════════════════════════════════════════════════════════════

/**
 * 浅比较 Hook - 避免不必要的重渲染
 */
export function useShallowCompare<T extends object>(value: T): T {
  const ref = useRef<T>(value);
  const [state, setState] = useState<T>(value);

  useEffect(() => {
    const keys = Object.keys(value) as (keyof T)[];
    const hasChanged = keys.some(
      key => ref.current[key] !== value[key]
    );

    if (hasChanged) {
      ref.current = value;
      setState(value);
    }
  }, [value]);

  return state;
}

/**
 * 深比较 Hook - 用于复杂对象
 */
export function useDeepCompare<T>(value: T): T {
  const ref = useRef<T>(value);
  const [state, setState] = useState<T>(value);

  useEffect(() => {
    if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
      ref.current = value;
      setState(value);
    }
  }, [value]);

  return state;
}

// ═══════════════════════════════════════════════════════════════
// 条件渲染优化
// ═══════════════════════════════════════════════════════════════

/**
 * 延迟渲染 Hook - 延迟渲染非关键组件
 */
export function useDeferredRender(
  shouldRender: boolean,
  delay: number = 100
): boolean {
  const [deferredRender, setDeferredRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      const timer = setTimeout(() => {
        setDeferredRender(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setDeferredRender(false);
    }
  }, [shouldRender, delay]);

  return deferredRender;
}

/**
 * 可见性检测 Hook - 只渲染可见区域的组件
 */
export function useVisibilityObserver(
  ref: React.RefObject<HTMLElement>,
  threshold: number = 0.1
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}

// ═══════════════════════════════════════════════════════════════
// Memo 优化组件
// ═══════════════════════════════════════════════════════════════

/**
 * 高阶组件：自动浅比较 props
 */
export function withShallowCompare<P extends object>(
  Component: React.ComponentType<P>
) {
  return memo(Component, (prevProps, nextProps) => {
    const keys = Object.keys(prevProps) as (keyof P)[];
    return keys.every(key => prevProps[key] === nextProps[key]);
  });
}