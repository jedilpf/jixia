import React from 'react';

/**
 * Jixia 2.0 V9 Yahua Icons
 * Independently drawn SVG components to replace generic emojis/icons.
 * Following the Law of Yahua: Refined Mineral Aesthetic.
 */

interface IconProps {
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

// ─── 过滤器定义（水墨边际/金粉） ─────────────────────────────────────────────
const JixiaFilters = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
            {/* 墨迹边缘：微小毛刺感 */}
            <filter id="ink-bleed">
                <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* 岩彩质感：微粒噪点 */}
            <filter id="mineral-grain">
                <feTurbulence type="turbulence" baseFrequency="0.8" numOctaves="2" result="grain" />
                <feColorMatrix type="saturate" values="0" />
                <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
            </filter>
        </defs>
    </svg>
);

// ─── 百灵鸟 (Vannin Bird - Mail) ───────────────────────────────────────────
// 语义增强：衔着系有红绳的绢帛信函，传达“传书”意象
export const IconVanninBird: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ ...style, filter: 'url(#ink-bleed)' }}>
        {/* 鸟身 */}
        <path 
            d="M20,60 C30,40 50,35 65,45 C75,15 95,45 90,50 C85,65 70,75 50,75 C30,75 20,65 20,60" 
            fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" 
        />
        <path d="M40,48 C45,35 60,30 70,35" fill="none" stroke={color} strokeWidth="2" opacity="0.6" />
        {/* 衔着的信函 (黄绸 + 红纽) */}
        <g transform="translate(12, 58) rotate(-10)">
            <rect x="0" y="0" width="18" height="6" rx="1" fill="#D4AF65" />
            <path d="M9,0 V6" stroke="#8D2F2F" strokeWidth="1.5" />
            <path d="M9,6 L12,12 M9,6 L6,12" stroke="#8D2F2F" strokeWidth="1" strokeLinecap="round" />
        </g>
        <circle cx="22" cy="58" r="1.5" fill={color} />
    </svg>
);

// ─── 束简 (Bamboo Slips - Quests) ──────────────────────────────────────────
// 语义增强：狼毫笔横置于简牍之上，传达“修行课业”意象
export const IconBambooSlips: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        {/* 简牍基底 */}
        <rect x="20" y="25" width="8" height="55" fill="none" stroke={color} strokeWidth="2" />
        <rect x="32" y="30" width="8" height="55" fill="none" stroke={color} strokeWidth="2" />
        <rect x="44" y="25" width="8" height="55" fill="none" stroke={color} strokeWidth="2" />
        <rect x="56" y="30" width="8" height="55" fill="none" stroke={color} strokeWidth="2" />
        {/* 细绳 */}
        <path d="M18,40 H66 M18,65 H66" stroke="#8D2F2F" strokeWidth="1" opacity="0.6" />
        {/* 狼毫笔 (横跨) */}
        <g transform="translate(15, 45) rotate(-25)">
            <rect x="0" y="0" width="60" height="3" fill={color} />
            <path d="M60,0 L75,1.5 L60,3 Z" fill="#1A1A1A" />
            <path d="M58,0 V3" stroke="#8D2F2F" strokeWidth="1" />
        </g>
    </svg>
);

// ─── 翰林 (Brush Forest - Community) ──────────────────────────────────────
export const IconBrushForest: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        {/* 三支毛笔的意象 */}
        <path d="M30,80 L35,30 Q35,20 30,15 Q25,20 25,30 L30,80" fill={color} opacity="0.8" />
        <path d="M50,85 L55,25 Q55,10 50,5 Q45,10 45,25 L50,85" fill={color} />
        <path d="M70,80 L75,35 Q75,25 70,20 Q65,25 65,35 L70,80" fill={color} opacity="0.6" />
        {/* 笔洗/水纹 */}
        <ellipse cx="50" cy="85" rx="30" ry="5" fill="none" stroke="#3A5F41" strokeWidth="1" opacity="0.4" />
    </svg>
);

// ─── 华盖 (Imperial Banner - Events) ──────────────────────────────────────
export const IconImperialBanner: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        {/* 旗杆 */}
        <line x1="25" y1="10" x2="25" y2="90" stroke={color} strokeWidth="3" />
        {/* 旗面 (三角旗) */}
        <path d="M25,15 L85,40 L25,65 Z" fill="#8D2F2F" stroke={color} strokeWidth="1" />
        {/* 旗面纹理 (火纹) */}
        <path d="M35,30 Q50,40 35,50" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
        {/* 顶端尖刺 */}
        <path d="M20,10 L30,10 L25,2 Z" fill={color} />
    </svg>
);

// ─── 璇玑 (Mechanism Gear - Settings) ────────────────────────────────────
// 语义增强：结合浑天仪与星罗图，传达“系统机枢”意象
export const IconXuanjiGear: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        {/* 外环齿轮感 */}
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 8" />
        {/* 内环星图 */}
        <circle cx="50" cy="50" r="28" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        <path d="M30,50 A20,20 0 0,1 70,50" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
        {/* 核心机枢 */}
        <rect x="44" y="44" width="12" height="12" fill="none" stroke={color} strokeWidth="2" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="4" fill="#8D2F2F" />
        {/* 刻度点 */}
        <circle cx="50" cy="15" r="2" fill={color} />
        <circle cx="85" cy="50" r="2" fill={color} />
        <circle cx="50" cy="85" r="2" fill={color} />
        <circle cx="15" cy="50" r="2" fill={color} />
    </svg>
);

// ─── 齐刀 (Knife Money - Coin) ───────────────────────────────────────────
export const IconKnifeMoney: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M40,10 L40,60 Q40,70 50,75 L90,85 L85,95 L40,85 Q20,80 20,40 L20,15 Z" fill="none" stroke={color} strokeWidth="3" />
        <circle cx="30" cy="25" r="3" fill={color} />
    </svg>
);

// ─── 论道 (Discussion - Bubble) ───────────────────────────────────────────
export const IconTalk: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M20,25 Q20,15 35,15 L75,15 Q90,15 90,25 L90,65 Q90,75 75,75 L45,75 L20,90 Z" fill="none" stroke={color} strokeWidth="3" />
        <line x1="35" y1="35" x2="75" y2="35" stroke={color} strokeWidth="2" opacity="0.6" />
        <line x1="35" y1="55" x2="60" y2="55" stroke={color} strokeWidth="2" opacity="0.6" />
    </svg>
);

// ─── 锋芒 (Battle Report - Swords) ─────────────────────────────────────────
export const IconCrossSwords: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M20,80 L80,20 M70,15 L85,30" fill="none" stroke={color} strokeWidth="4" />
        <path d="M20,20 L80,80 M15,30 L30,15" fill="none" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="8" fill="#8D2F2F" />
    </svg>
);

// ─── 寻章 (QA - Question) ───────────────────────────────────────────────
export const IconSeek: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <circle cx="50" cy="45" r="25" fill="none" stroke={color} strokeWidth="3" strokeDasharray="60 20" />
        <path d="M50,75 L50,85" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50,45 Q60,45 60,35 Q60,25 50,25 Q40,25 40,35" fill="none" stroke={color} strokeWidth="3" />
    </svg>
);

// ─── 典籍 (Culture - Book) ───────────────────────────────────────────────
export const IconChronicle: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M25,20 L75,20 L75,80 L25,80 Z" fill="none" stroke={color} strokeWidth="3" />
        <path d="M75,25 L85,25 L85,85 L35,85 L35,80" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
        <line x1="35" y1="35" x2="65" y2="35" stroke={color} strokeWidth="1.5" />
        <line x1="35" y1="50" x2="65" y2="50" stroke={color} strokeWidth="1.5" />
        <line x1="35" y1="65" x2="55" y2="65" stroke={color} strokeWidth="1.5" />
    </svg>
);

// ─── 玉珏 (Jade Jue - Jade) ──────────────────────────────────────────────
export const IconJadeJue: React.FC<IconProps> = ({ size = 24, color = "#3A5F41", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        {/* 缺口圆环 */}
        <path d="M50,15 A35,35 0 1,1 40,17" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <circle cx="50" cy="50" r="10" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
    </svg>
);

// ─── 梅花印 (Award - Plum) ───────────────────────────────────────────────
export const IconAward: React.FC<IconProps> = ({ size = 24, color = "#8D2F2F", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        {/* 五瓣梅花效果 */}
        <circle cx="50" cy="35" r="12" fill={color} />
        <circle cx="65" cy="45" r="12" fill={color} />
        <circle cx="60" cy="65" r="12" fill={color} />
        <circle cx="40" cy="65" r="12" fill={color} />
        <circle cx="35" cy="45" r="12" fill={color} />
        <circle cx="50" cy="50" r="8" fill="#D4AF65" />
    </svg>
);

// ─── 离火 (Fire - Event) ───────────────────────────────────────────────
export const IconFire: React.FC<IconProps> = ({ size = 24, color = "#8D2F2F", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M50,95 Q70,95 75,75 Q85,50 50,5 Q15,50 25,75 Q30,95 50,95" fill={color} />
        <path d="M50,85 Q60,85 65,70 Q70,55 50,25 Q30,55 35,70 Q40,85 50,85" fill="#D4AF65" opacity="0.6" />
    </svg>
);

// ─── 宫灯 (Lantern - Time) ───────────────────────────────────────────────
export const IconLantern: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <rect x="35" y="20" width="30" height="50" rx="5" fill="none" stroke={color} strokeWidth="3" />
        <line x1="50" y1="5" x2="50" y2="20" stroke={color} strokeWidth="2" />
        <line x1="35" y1="35" x2="65" y2="35" stroke={color} strokeWidth="1.5" opacity="0.4" />
        <line x1="35" y1="55" x2="65" y2="55" stroke={color} strokeWidth="1.5" opacity="0.4" />
        {/* 流苏 */}
        <path d="M45,70 L45,90 M50,70 L50,95 M55,70 L55,90" stroke="#8D2F2F" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// ─── 历书 (Calendar - Daily) ─────────────────────────────────────────────
export const IconCalendar: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <rect x="20" y="25" width="60" height="55" rx="2" fill="none" stroke={color} strokeWidth="3" />
        <line x1="20" y1="40" x2="80" y2="40" stroke={color} strokeWidth="2" />
        <line x1="35" y1="15" x2="35" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="65" y1="15" x2="65" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="60" r="5" fill="#8D2F2F" />
    </svg>
);

// ─── 锦盒 (Gift - Reward) ────────────────────────────────────────────────
export const IconGift: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <rect x="25" y="35" width="50" height="45" fill="none" stroke={color} strokeWidth="3" />
        <rect x="20" y="35" width="60" height="10" fill={color} />
        <path d="M50,35 L50,80 M25,57 H75" stroke={color} strokeWidth="2" />
        {/* 丝带结 */}
        <path d="M50,35 C50,20 30,20 35,35 C40,20 65,20 50,35" fill="none" stroke="#8D2F2F" strokeWidth="2" />
    </svg>
);

// ─── 契印 (Check - Success) ──────────────────────────────────────────────
export const IconCheck: React.FC<IconProps> = ({ size = 24, color = "#3A5F41", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M25,55 L45,75 L80,30" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── 戈矛 (Martial - Victory) ─────────────────────────────────────────────
export const IconMartial: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <line x1="50" y1="10" x2="50" y2="90" stroke={color} strokeWidth="3" />
        <path d="M40,25 L50,10 L60,25 Z" fill={color} />
        <path d="M35,35 H65 L50,45 Z" fill={color} opacity="0.7" />
        <path d="M30,80 H70" stroke="#8D2F2F" strokeWidth="4" />
    </svg>
);

// ─── 刻漏 (Wait - Hourglass) ──────────────────────────────────────────────
export const IconWait: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M30,20 H70 L50,50 L30,20 Z" fill="none" stroke={color} strokeWidth="3" />
        <path d="M30,80 H70 L50,50 L30,80 Z" fill="none" stroke={color} strokeWidth="3" />
        <rect x="25" y="15" width="50" height="5" fill={color} />
        <rect x="25" y="80" width="50" height="5" fill={color} />
        <circle cx="50" cy="70" r="4" fill="#8D2F2F" />
    </svg>
);

// ─── 毛笔 (Brush - Action) ───────────────────────────────────────────────
export const IconBrush: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M50,85 L55,25 Q55,10 50,5 Q45,10 45,25 L50,85" fill={color} />
        <path d="M45,25 L55,25" stroke={color} strokeWidth="2" />
        <path d="M48,85 L52,85" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

// ─── 挂甲 (Shield - Defense) ─────────────────────────────────────────────
export const IconShield: React.FC<IconProps> = ({ size = 24, color = "#D4AF65", className, style }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
        <path d="M50,15 C30,15 20,25 20,50 C20,70 35,85 50,90 C65,85 80,70 80,50 C80,25 70,15 50,15 Z" fill="none" stroke={color} strokeWidth="3" />
        <path d="M50,25 V80" stroke={color} strokeWidth="2" opacity="0.4" />
        <path d="M30,45 H70" stroke={color} strokeWidth="2" opacity="0.4" />
    </svg>
);

/**
 * ─── 矿物基座包裹器 (Mineral Icon Wrapper) ──────────────────────────────
 * 为图标提供统一的“艺术品/仪轨”基座感
 */
export const MineralIconWrapper: React.FC<{ 
    children: React.ReactNode; 
    type?: 'bronze' | 'jade' | 'seal'; 
    size?: number 
}> = ({ children, type = 'bronze', size = 48 }) => {
    const baseColors = {
        bronze: { border: 'rgba(212,165,32,0.3)', bg: 'rgba(20,15,10,0.4)', inner: 'rgba(212,165,32,0.05)' },
        jade: { border: 'rgba(58,95,65,0.3)', bg: 'rgba(15,25,20,0.4)', inner: 'rgba(58,95,65,0.05)' },
        seal: { border: 'rgba(141,47,47,0.3)', bg: 'rgba(25,15,15,0.4)', inner: 'rgba(141,47,47,0.05)' }
    };
    
    const colors = baseColors[type];

    return (
        <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
            {/* 装饰边框 */}
            <div className="absolute inset-0 rounded-lg transform rotate-45 border transition-all duration-300 group-hover:scale-110 group-hover:rotate-[50deg]" style={{ borderColor: colors.border, background: colors.bg }} />
            <div className="absolute inset-2 border opacity-20" style={{ borderColor: colors.border }} />
            {/* 核心内容 */}
            <div className="relative z-10 flex items-center justify-center w-full h-full transition-transform duration-300 group-hover:scale-110">
                {children}
            </div>
        </div>
    );
};

/**
 * ─── 舒卷题签 (Unfolding Calligraphy Label) ─────────────────────────────
 * 模拟卷轴展开的提示文字效果
 */
export const JixiaTooltip: React.FC<{ 
    text: string; 
    visible: boolean; 
    position?: 'top' | 'bottom' | 'left' | 'right' 
}> = ({ text, visible, position = 'bottom' }) => {
    const posStyles = {
        top: 'bottom-full mb-4 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-4 left-1/2 -translate-x-1/2',
        left: 'right-full mr-4 top-1/2 -translate-y-1/2',
        right: 'left-full ml-4 top-1/2 -translate-y-1/2'
    };

    return (
        <div className={`absolute z-30 pointer-events-none transition-all duration-500 overflow-hidden ${posStyles[position]} ${visible ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
            <div className="bg-[#f5e6b8] text-[#1A1A1A] px-4 py-1.5 whitespace-nowrap font-serif tracking-[0.2em] shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-y border-[#d4a520] relative">
                {/* 卷轴边缘（木轴效果） */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B5e00]" />
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#8B5e00]" />
                {/* 水墨晕染底纹 */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.8),transparent)]" />
                <span className="relative z-10 text-xs font-bold">{text}</span>
            </div>
        </div>
    );
};

export const JixiaIconsManager = JixiaFilters;
