import React from 'react';
import { useResponsive, useScale, useOrientation } from '@/hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, className = '' }) => {
  const { scale } = useResponsive();

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        fontSize: `${Math.max(12, 14 * scale)}px`,
      }}
    >
      {children}
    </div>
  );
};

interface ScaledContainerProps {
  children: React.ReactNode;
  baseWidth?: number;
  baseHeight?: number;
  className?: string;
}

export const ScaledContainer: React.FC<ScaledContainerProps> = ({
  children,
  baseWidth = 1920,
  baseHeight = 1080,
  className = '',
}) => {
  const { getScaleStyle } = useScale({ baseWidth, baseHeight });

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <div style={getScaleStyle()} className="relative">
        {children}
      </div>
    </div>
  );
};

interface AdaptiveGridProps {
  children: React.ReactNode;
  mobileCols?: number;
  tabletCols?: number;
  desktopCols?: number;
  gap?: number;
  className?: string;
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 16,
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const cols = isMobile ? mobileCols : isTablet ? tabletCols : desktopCols;

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

interface HideOnProps {
  children: React.ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export const HideOn: React.FC<HideOnProps> = ({ children, mobile, tablet, desktop }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (mobile && isMobile) return null;
  if (tablet && isTablet) return null;
  if (desktop && isDesktop) return null;

  return <>{children}</>;
};

interface ShowOnProps {
  children: React.ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export const ShowOn: React.FC<ShowOnProps> = ({ children, mobile, tablet, desktop }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (mobile && isMobile) return <>{children}</>;
  if (tablet && isTablet) return <>{children}</>;
  if (desktop && isDesktop) return <>{children}</>;

  return null;
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  mobileSize = 'text-sm',
  tabletSize = 'text-base',
  desktopSize = 'text-lg',
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const sizeClass = isMobile ? mobileSize : isTablet ? tabletSize : desktopSize;

  return (
    <span className={`${sizeClass} ${className}`}>
      {children}
    </span>
  );
};

interface ResponsivePaddingProps {
  children: React.ReactNode;
  mobile?: string;
  tablet?: string;
  desktop?: string;
  className?: string;
}

export const ResponsivePadding: React.FC<ResponsivePaddingProps> = ({
  children,
  mobile = 'p-2',
  tablet = 'p-4',
  desktop = 'p-6',
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const paddingClass = isMobile ? mobile : isTablet ? tablet : desktop;

  return (
    <div className={`${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

interface OrientationLockProps {
  children: React.ReactNode;
  lockTo?: 'portrait' | 'landscape';
  fallback?: React.ReactNode;
}

export const OrientationLock: React.FC<OrientationLockProps> = ({
  children,
  lockTo,
  fallback = null,
}) => {
  const orientation = useOrientation();

  if (lockTo && orientation !== lockTo) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface MobileWarningProps {
  message?: string;
}

export const MobileWarning: React.FC<MobileWarningProps> = ({
  message = '建议使用桌面设备以获得最佳体验',
}) => {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-900/80 text-yellow-100 text-center py-2 text-sm z-50">
      {message}
    </div>
  );
};
