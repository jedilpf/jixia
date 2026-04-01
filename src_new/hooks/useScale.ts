import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScaleOptions {
  designWidth: number;
  designHeight: number;
}

interface UseScaleReturn {
  scale: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * useScale - 响应式缩放 Hook
 * 
 * 根据容器大小自动计算缩放比例，保持设计稿比例
 * 
 * @param options - 配置选项
 * @returns 缩放比例和容器引用
 * 
 * @example
 * const { scale, containerRef } = useScale({ designWidth: 1920, designHeight: 1080 });
 */
export function useScale(options: UseScaleOptions): UseScaleReturn {
  const { designWidth, designHeight } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const calculateScale = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 计算宽度和高度的缩放比例
    const scaleX = containerWidth / designWidth;
    const scaleY = containerHeight / designHeight;

    // 使用较小的比例，确保内容完全显示
    const newScale = Math.min(scaleX, scaleY);

    setScale(newScale);
  }, [designWidth, designHeight]);

  useEffect(() => {
    // 初始计算
    calculateScale();

    // 监听窗口大小变化
    const handleResize = () => {
      calculateScale();
    };

    window.addEventListener('resize', handleResize);

    // 使用 ResizeObserver 更精确地监听容器变化
    let resizeObserver: ResizeObserver | null = null;
    
    if (containerRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        calculateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [calculateScale]);

  return { scale, containerRef };
}

export default useScale;
