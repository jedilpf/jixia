import React from 'react';

interface RedDotProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  visible?: boolean;
  pulse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * RedDot - 稷下 2.0 雅化红点组件
 * 视觉风格：朱砂墨染、动态呼吸、轻量级通知
 */
export function RedDot({ 
  count, 
  size = 'md', 
  visible = true, 
  pulse = true,
  className = '',
  style 
}: RedDotProps) {
  if (!visible) return null;

  const sizeClasses = {
    sm: 'h-2 w-2 min-w-[8px]',
    md: 'h-3.5 w-3.5 min-w-[14px]',
    lg: 'h-5 w-5 min-w-[20px]'
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full bg-[#831843] text-white shadow-[0_0_8px_rgba(131,24,67,0.6)] ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: 'serif',
        fontSize: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
        ...style
      }}
    >
      {count ? (
        <span className="relative z-10 px-1 font-bold leading-none">{count > 99 ? '99+' : count}</span>
      ) : null}

      {/* 墨迹呼吸晕染层 */}
      {pulse && (
        <div className="absolute inset-0 animate-ping rounded-full bg-[#831843] opacity-40 duration-1000" />
      )}
      
      {/* 绢纸纹理微弱投影 */}
      <div className="absolute -inset-1 rounded-full border border-[#83184333]" />
    </div>
  );
}
