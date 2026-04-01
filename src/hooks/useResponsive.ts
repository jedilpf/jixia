import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
};

type Breakpoint = keyof typeof breakpoints;

interface ResponsiveInfo {
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  is3xl: boolean;
  current: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  scale: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowSize();

  const isXs = width < breakpoints.xs;
  const isSm = width >= breakpoints.xs && width < breakpoints.sm;
  const isMd = width >= breakpoints.sm && width < breakpoints.md;
  const isLg = width >= breakpoints.md && width < breakpoints.lg;
  const isXl = width >= breakpoints.lg && width < breakpoints.xl;
  const is2xl = width >= breakpoints.xl && width < breakpoints['2xl'];
  const is3xl = width >= breakpoints['2xl'];

  const getCurrentBreakpoint = (): Breakpoint => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    if (is2xl) return '2xl';
    return '3xl';
  };

  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  const baseWidth = 1920;
  const scale = Math.min(width / baseWidth, 1.2);

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    is3xl,
    current: getCurrentBreakpoint(),
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
    scale,
  };
}

interface UseScaleOptions {
  baseWidth?: number;
  baseHeight?: number;
  minScale?: number;
  maxScale?: number;
}

export function useScale(options: UseScaleOptions = {}): {
  scale: number;
  scaleX: number;
  scaleY: number;
  getScaleStyle: () => React.CSSProperties;
} {
  const {
    baseWidth = 1920,
    baseHeight = 1080,
    minScale = 0.5,
    maxScale = 1.5,
  } = options;

  const { width, height } = useWindowSize();

  const scaleX = Math.max(minScale, Math.min(maxScale, width / baseWidth));
  const scaleY = Math.max(minScale, Math.min(maxScale, height / baseHeight));
  const scale = Math.min(scaleX, scaleY);

  const getScaleStyle = useCallback(() => ({
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: baseWidth,
    height: baseHeight,
  }), [scale, baseWidth, baseHeight]);

  return { scale, scaleX, scaleY, getScaleStyle };
}

export function useOrientation(): 'portrait' | 'landscape' {
  const { width, height } = useWindowSize();
  return height > width ? 'portrait' : 'landscape';
}

export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}
