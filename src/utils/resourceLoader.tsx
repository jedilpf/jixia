/**
 * 资源加载优化工具
 *
 * 功能：
 * 1. 图片加载错误处理与重试
 * 2. 资源预加载
 * 3. 懒加载指示器
 * 4. 加载状态管理
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// 图片加载
// ═══════════════════════════════════════════════════════════════

interface ImageLoadOptions {
  retryCount?: number;
  retryDelay?: number;
  fallbackUrl?: string;
}

/**
 * 可靠的图片加载 Hook
 */
export function useReliableImage(
  src: string | undefined,
  options: ImageLoadOptions = {}
): {
  imageUrl: string | undefined;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
} {
  const { retryCount = 3, retryDelay = 500, fallbackUrl } = options;

  const [imageUrl, setImageUrl] = useState<string | undefined>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const attemptRef = useRef(0);

  const loadImage = useCallback(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();

    img.onload = () => {
      setImageUrl(src);
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      attemptRef.current += 1;

      if (attemptRef.current < retryCount) {
        // 重试
        setTimeout(() => {
          loadImage();
        }, retryDelay * attemptRef.current);
      } else {
        // 使用备用图片
        if (fallbackUrl) {
          setImageUrl(fallbackUrl);
          setIsLoading(false);
          setHasError(false);
        } else {
          setIsLoading(false);
          setHasError(true);
        }
      }
    };

    img.src = src;
  }, [src, retryCount, retryDelay, fallbackUrl]);

  useEffect(() => {
    attemptRef.current = 0;
    loadImage();
  }, [src]);

  const retry = useCallback(() => {
    attemptRef.current = 0;
    loadImage();
  }, [loadImage]);

  return { imageUrl, isLoading, hasError, retry };
}

/**
 * 图片预加载 Hook
 */
export function useImagePreloader(
  urls: string[],
  concurrency: number = 4
): {
  loadedCount: number;
  totalCount: number;
  progress: number;
  isComplete: boolean;
} {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setIsComplete(true);
      return;
    }

    let loaded = 0;
    let index = 0;

    const loadNext = () => {
      if (index >= urls.length) {
        if (loaded === urls.length) {
          setIsComplete(true);
        }
        return;
      }

      const currentUrl = urls[index];
      index++;

      const img = new Image();
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        loadNext();
      };
      img.onerror = () => {
        // 即使失败也继续加载下一个
        loadNext();
      };
      img.src = currentUrl;
    };

    // 启动并发加载
    for (let i = 0; i < Math.min(concurrency, urls.length); i++) {
      loadNext();
    }
  }, [urls, concurrency]);

  return {
    loadedCount,
    totalCount: urls.length,
    progress: urls.length > 0 ? loadedCount / urls.length : 1,
    isComplete,
  };
}

// ═══════════════════════════════════════════════════════════════
// 组件
// ═══════════════════════════════════════════════════════════════

interface ReliableImageProps {
  src: string | undefined;
  alt: string;
  fallbackSrc?: string;
  retryCount?: number;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 可靠图片组件
 */
export function ReliableImage({
  src,
  alt,
  fallbackSrc = '/assets/placeholder.png',
  retryCount = 3,
  className,
  style,
  onLoad,
  onError,
}: ReliableImageProps) {
  const { imageUrl, isLoading, hasError, retry } = useReliableImage(src, {
    retryCount,
    fallbackUrl: fallbackSrc,
  });

  useEffect(() => {
    if (!isLoading && !hasError && imageUrl) {
      onLoad?.();
    }
    if (hasError) {
      onError?.();
    }
  }, [isLoading, hasError, imageUrl, onLoad, onError]);

  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: 'linear-gradient(135deg, #1a1510, #0d0b08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (hasError && !imageUrl) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: 'linear-gradient(135deg, #2a1a1a, #1a0d0d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={retry}
        title="点击重试加载"
      >
        <span style={{ color: '#ff6666', fontSize: '12px' }}>加载失败</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallbackSrc;
      }}
    />
  );
}

/**
 * 加载中指示器
 */
export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(201,149,42,0.3)',
        borderTopColor: '#d4a520',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}

/**
 * 章节加载指示器
 */
export function ChapterLoadingIndicator({
  chapterName,
  progress,
}: {
  chapterName?: string;
  progress?: number;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <LoadingSpinner size={48} />
      {chapterName && (
        <div
          style={{
            marginTop: 16,
            color: '#d4a520',
            fontSize: 18,
            fontFamily: 'serif',
          }}
        >
          正在加载 {chapterName}...
        </div>
      )}
      {progress !== undefined && (
        <div
          style={{
            marginTop: 12,
            width: 200,
            height: 4,
            background: 'rgba(201,149,42,0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: '#d4a520',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 音频加载
// ═══════════════════════════════════════════════════════════════

/**
 * 音频预加载 Hook
 */
export function useAudioPreloader(
  urls: string[]
): {
  loadedCount: number;
  isComplete: boolean;
} {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setIsComplete(true);
      return;
    }

    let loaded = 0;

    const checkComplete = () => {
      if (loaded === urls.length) {
        setIsComplete(true);
      }
    };

    urls.forEach(url => {
      const audio = new Audio();

      audio.oncanplaythrough = () => {
        loaded++;
        setLoadedCount(loaded);
        checkComplete();
      };

      audio.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
        checkComplete();
      };

      audio.src = url;
      audio.load();
    });
  }, [urls]);

  return { loadedCount, isComplete };
}

// ═══════════════════════════════════════════════════════════════
// 资源管理器
// ═══════════════════════════════════════════════════════════════

class ResourceManager {
  private static instance: ResourceManager;

  private imageCache: Map<string, HTMLImageElement> = new Map();
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  // 预加载图片
  async preloadImages(urls: string[]): Promise<void> {
    await Promise.all(
      urls.map(url => this.loadImage(url))
    );
  }

  // 加载单张图片
  async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // 获取已缓存的图片
  getCachedImage(url: string): HTMLImageElement | undefined {
    return this.imageCache.get(url);
  }

  // 清除缓存
  clearCache(): void {
    this.imageCache.clear();
    this.audioCache.clear();
  }

  // 获取缓存状态
  getCacheStats(): { imageCount: number; audioCount: number } {
    return {
      imageCount: this.imageCache.size,
      audioCount: this.audioCache.size,
    };
  }
}

export const resourceManager = ResourceManager.getInstance();

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);