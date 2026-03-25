// BattleBackground.tsx
// Skill: ui-theme-designer + ui-animation-designer + style-pass-bronze-mechanism
// 应用稷下青铜机关城主题：炉火光晕 + 齿轮装饰 + 铜绿纹理 + 战场分割线

import { getAssetUrl } from '@/utils/assets';

interface BattleBackgroundProps {
    scale: number;
    containerWidth: number;
    containerHeight: number;
}

// 旋转齿轮（purely CSS/SVG，无外部资源）
function BronzeGear({
    x, y, size, speed, opacity, reverse = false
}: {
    x: number; y: number; size: number; speed: number; opacity: number; reverse?: boolean;
}) {
    const teeth = 14;
    const outerR = size / 2;
    const innerR = outerR * 0.7;
    const toothH = outerR * 0.2;
    const holeR = outerR * 0.25;

    const points: string[] = [];
    for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2;
        const a1 = ((i + 0.35) / teeth) * Math.PI * 2;
        const a2 = ((i + 0.65) / teeth) * Math.PI * 2;
        const a3 = ((i + 1) / teeth) * Math.PI * 2;
        points.push(
            `${(Math.cos(a0) * innerR + outerR).toFixed(1)},${(Math.sin(a0) * innerR + outerR).toFixed(1)}`,
            `${(Math.cos(a1) * (outerR + toothH) + outerR).toFixed(1)},${(Math.sin(a1) * (outerR + toothH) + outerR).toFixed(1)}`,
            `${(Math.cos(a2) * (outerR + toothH) + outerR).toFixed(1)},${(Math.sin(a2) * (outerR + toothH) + outerR).toFixed(1)}`,
            `${(Math.cos(a3) * innerR + outerR).toFixed(1)},${(Math.sin(a3) * innerR + outerR).toFixed(1)}`,
        );
    }

    return (
        <g>
            <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${x + outerR} ${y + outerR}`}
                to={`${reverse ? -360 : 360} ${x + outerR} ${y + outerR}`}
                dur={`${speed}s`}
                repeatCount="indefinite"
            />
            <polygon
                points={points.map(p => {
                    const [px, py] = p.split(',');
                    return `${parseFloat(px) + x},${parseFloat(py) + y}`;
                }).join(' ')}
                fill="none"
                stroke={`rgba(139,115,85,${opacity})`}
                strokeWidth="1.2"
            />
            <circle cx={x + outerR} cy={y + outerR} r={holeR} fill="none" stroke={`rgba(139,115,85,${opacity * 0.7})`} strokeWidth="1" />
            {/* 辐条 */}
            {[0, 60, 120, 180, 240, 300].map(deg => {
                const rad = (deg / 180) * Math.PI;
                return (
                    <line
                        key={deg}
                        x1={x + outerR + Math.cos(rad) * holeR}
                        y1={y + outerR + Math.sin(rad) * holeR}
                        x2={x + outerR + Math.cos(rad) * innerR * 0.85}
                        y2={y + outerR + Math.sin(rad) * innerR * 0.85}
                        stroke={`rgba(139,115,85,${opacity * 0.5})`}
                        strokeWidth="0.8"
                    />
                );
            })}
        </g>
    );
}

export function BattleBackground({ scale, containerWidth, containerHeight }: BattleBackgroundProps) {
    const W = containerWidth;
    const H = containerHeight;
    const midY = H / 2;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <style>{`
        @keyframes forge-breathe {
          0%,100% { opacity:0.12; }
          50% { opacity:0.28; }
        }
        @keyframes patina-flow {
          0% { background-position: 0 0; }
          100% { background-position: 200px 200px; }
        }
        @keyframes divider-pulse {
          0%,100% { opacity:0.35; }
          50% { opacity:0.65; }
        }
        @keyframes ember-float {
          0% { transform: translateY(0) scale(1); opacity:0.8; }
          100% { transform: translateY(-${H * 0.4}px) scale(0.2); opacity:0; }
        }
        @keyframes corner-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

            {/* ── 层0：战场背景图 ── */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${getAssetUrl('assets/bg-battle.png')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }} />
            {/* 暗色叠加蒙版（保证卡牌等元素对比度） */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.28)',
            }} />

            {/* ── 层1：主背景渐变叠加 ── */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse 80% 50% at 50% 110%, rgba(232,93,4,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 50% -10%, rgba(74,124,111,0.08) 0%, transparent 60%)
        `,
            }} />

            {/* ── 层2：青铜织物纹理（重复小图样） ── */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: `
          repeating-linear-gradient(45deg, #8B7355 0px, transparent 1px, transparent 20px, #8B7355 21px),
          repeating-linear-gradient(-45deg, #4A7C6F 0px, transparent 1px, transparent 20px, #4A7C6F 21px)
        `,
                animation: 'patina-flow 40s linear infinite',
            }} />

            {/* ── 层3：炉火光晕（底部上升） ── */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
                background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(232,93,4,0.18) 0%, transparent 70%)',
                animation: 'forge-breathe 3.5s ease-in-out infinite',
            }} />

            {/* ── 层4：顶部铜绿光 ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
                background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(74,124,111,0.12) 0%, transparent 70%)',
                animation: 'forge-breathe 4s ease-in-out infinite 1.5s',
            }} />

            {/* ── 层5：SVG齿轮装饰 ── */}
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
                <BronzeGear x={-60} y={H * 0.05} size={180 * scale} speed={25} opacity={0.12} />
                <BronzeGear x={W - 100 * scale} y={H * 0.0} size={200 * scale} speed={32} opacity={0.09} reverse />
                <BronzeGear x={W * 0.08} y={H * 0.55} size={120 * scale} speed={20} opacity={0.1} reverse />
                <BronzeGear x={W * 0.85} y={H * 0.5} size={100 * scale} speed={18} opacity={0.11} />
                <BronzeGear x={W * 0.5 - 30 * scale} y={H * 0.42} size={60 * scale} speed={12} opacity={0.08} reverse />
            </svg>

            {/* ── 层6：战场分割线系统 ── */}
            <div style={{ position: 'absolute', top: `${midY}px`, left: 0, right: 0 }}>
                {/* 主分割线 */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139,115,85,0.4) 15%, rgba(232,93,4,0.7) 50%, rgba(139,115,85,0.4) 85%, transparent 100%)',
                    animation: 'divider-pulse 3s ease-in-out infinite',
                }} />
                {/* 上辅助线 */}
                <div style={{
                    position: 'absolute', top: `-${6 * scale}px`, left: 0, right: 0, height: '1px',
                    background: 'linear-gradient(90deg, transparent 10%, rgba(74,124,111,0.25) 40%, rgba(74,124,111,0.25) 60%, transparent 90%)',
                }} />
                {/* 下辅助线 */}
                <div style={{
                    position: 'absolute', top: `${6 * scale}px`, left: 0, right: 0, height: '1px',
                    background: 'linear-gradient(90deg, transparent 10%, rgba(74,124,111,0.25) 40%, rgba(74,124,111,0.25) 60%, transparent 90%)',
                }} />

                {/* 分割线中央装饰 */}
                <div style={{
                    position: 'absolute', left: '50%', top: '-12px',
                    transform: 'translateX(-50%)',
                    width: `${30 * scale}px`, height: `${24 * scale}px`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: `${14 * scale}px`, color: 'rgba(232,93,4,0.8)',
                    textShadow: '0 0 8px rgba(232,93,4,0.6)',
                    animation: 'divider-pulse 3s ease-in-out infinite',
                }}>
                    ⚙
                </div>
            </div>

            {/* ── 层7：四角青铜边框装饰 ── */}
            {[
                { corner: 'top-left', x: 0, y: 0, rx: '0', ry: '0', rotX: '0', rotY: '0' },
                { corner: 'top-right', x: W - 80 * scale, y: 0, rx: '0', ry: '0', rotX: '0', rotY: '0' },
                { corner: 'bottom-left', x: 0, y: H - 80 * scale, rx: '0', ry: '0', rotX: '0', rotY: '0' },
                { corner: 'bottom-right', x: W - 80 * scale, y: H - 80 * scale, rx: '0', ry: '0', rotX: '0', rotY: '0' },
            ].map(({ corner, x, y }) => (
                <div key={corner} style={{ position: 'absolute', left: x, top: y, width: `${80 * scale}px`, height: `${80 * scale}px` }}>
                    <svg width="100%" height="100%" viewBox="0 0 80 80">
                        <path
                            d={corner.includes('right')
                                ? corner.includes('bottom') ? 'M80,80 L80,50 L70,50 L70,70 L50,70 L50,80 Z' : 'M80,0 L80,30 L70,30 L70,10 L50,10 L50,0 Z'
                                : corner.includes('bottom') ? 'M0,80 L0,50 L10,50 L10,70 L30,70 L30,80 Z' : 'M0,0 L0,30 L10,30 L10,10 L30,10 L30,0 Z'
                            }
                            fill="rgba(139,115,85,0.2)"
                            stroke="rgba(139,115,85,0.4)"
                            strokeWidth="0.5"
                        />
                    </svg>
                </div>
            ))}

            {/* ── 层8：敌方区域红晕 & 我方区域铜绿晕 ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
                background: 'radial-gradient(ellipse 50% 80% at 50% 0%, rgba(139,38,53,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '48%',
                background: 'radial-gradient(ellipse 50% 80% at 50% 100%, rgba(74,124,111,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* ── 层9：火星粒子（底部上扬） ── */}
            <EmberLayer count={12} H={H} />
        </div>
    );
}

// 火星粒子层
function EmberLayer({ count, H }: { count: number; H: number }) {
    const floatDist = H * 0.4;
    const embers = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${3 + Math.random() * 4}s`,
        size: `${1.5 + Math.random() * 2.5}px`,
        color: Math.random() > 0.5 ? '#f97316' : '#fbbf24',
    }));

    return (
        <>
            <style>{`@keyframes ember-float-bg { 0% { transform:translateY(0) scale(1); opacity:0.8; } 100% { transform:translateY(-${floatDist}px) scale(0.2); opacity:0; } }`}</style>
            {embers.map(({ id, left, delay, duration, size, color }) => (
                <div
                    key={id}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left,
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 4px ${color}`,
                        animation: `ember-float-bg ${duration} ${delay} linear infinite`,
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </>
    );
}
