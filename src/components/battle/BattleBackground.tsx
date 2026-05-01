// BattleBackground.tsx
// Skill: ui-theme-designer + ui-animation-designer + style-pass-bronze-mechanism
// 应用稷下青铜机关城主题：炉火光晕 + 齿轮装饰 + 铜绿纹理 + 战场分割线

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
                backgroundImage: 'url(assets/bg-battle.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }} />
            {/* 暗红叠加蒙版（保证红金色系的一致性） */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(58,13,10,0.45)', // 深红遮罩
            }} />

            {/* ── 层1：主背景渐变叠加 ── */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse 80% 50% at 50% 110%, rgba(212,165,32,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 50% -10%, rgba(212,165,32,0.1) 0%, transparent 60%)
        `,
            }} />

            {/* ── 层2：金丝织物纹理 ── */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.06,
                backgroundImage: `
          repeating-linear-gradient(45deg, #d4a520 0px, transparent 1px, transparent 20px, #d4a520 21px),
          repeating-linear-gradient(-45deg, #8b2e2e 0px, transparent 1px, transparent 20px, #8b2e2e 21px)
        `,
                animation: 'patina-flow 40s linear infinite',
            }} />

            {/* ── 层3：龙魂/炉火红光（底部上升） ── */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
                background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(139,46,46,0.25) 0%, transparent 70%)',
                animation: 'forge-breathe 3.5s ease-in-out infinite',
            }} />

            {/* ── 层4：顶部金色辉光 ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
                background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,165,32,0.15) 0%, transparent 70%)',
                animation: 'forge-breathe 4s ease-in-out infinite 1.5s',
            }} />

            {/* ── 层5：SVG金质齿轮 ── */}
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
                <BronzeGear x={-60} y={H * 0.05} size={180 * scale} speed={25} opacity={0.15} />
                <BronzeGear x={W - 100 * scale} y={H * 0.0} size={200 * scale} speed={32} opacity={0.12} reverse />
                <BronzeGear x={W * 0.08} y={H * 0.55} size={120 * scale} speed={20} opacity={0.13} reverse />
                <BronzeGear x={W * 0.85} y={H * 0.5} size={100 * scale} speed={18} opacity={0.14} />
            </svg>

            {/* ── 层6：战线分割线（金红流动） ── */}
            <div style={{ position: 'absolute', top: `${midY}px`, left: 0, right: 0 }}>
                {/* 主分割线 */}
                <div style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(212,165,32,0.4) 15%, #d4a520 50%, rgba(212,165,32,0.4) 85%, transparent 100%)',
                    animation: 'divider-pulse 3s ease-in-out infinite',
                    boxShadow: '0 0 15px rgba(212,165,32,0.4)',
                }} />
                {/* 辅助线 */}
                <div style={{
                    position: 'absolute', top: `-${6 * scale}px`, left: 0, right: 0, height: '1px',
                    background: 'linear-gradient(90deg, transparent 10%, rgba(139,46,46,0.4) 40%, rgba(139,46,46,0.4) 60%, transparent 90%)',
                }} />
            </div>

            {/* ── 层7：四角纹案边框 ── */}
            {[
                { corner: 'top-left', x: 0, y: 0 },
                { corner: 'top-right', x: W - 80 * scale, y: 0 },
                { corner: 'bottom-left', x: 0, y: H - 80 * scale },
                { corner: 'bottom-right', x: W - 80 * scale, y: H - 80 * scale },
            ].map(({ corner, x, y }) => (
                <div key={corner} style={{ position: 'absolute', left: x, top: y, width: `${80 * scale}px`, height: `${80 * scale}px` }}>
                    <svg width="100%" height="100%" viewBox="0 0 80 80">
                        <path
                            d={corner.includes('right')
                                ? corner.includes('bottom') ? 'M80,80 L80,50 L70,50 L70,70 L50,70 L50,80 Z' : 'M80,0 L80,30 L70,30 L70,10 L50,10 L50,0 Z'
                                : corner.includes('bottom') ? 'M0,80 L0,50 L10,50 L10,70 L30,70 L30,80 Z' : 'M0,0 L0,30 L10,30 L10,10 L30,10 L30,0 Z'
                            }
                            fill="rgba(212,165,32,0.15)"
                            stroke="#d4a520"
                            strokeWidth="1"
                        />
                    </svg>
                </div>
            ))}

            {/* ── 层8：势力区域红金晕 ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
                background: 'radial-gradient(ellipse 50% 80% at 50% 0%, rgba(139,46,46,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '48%',
                background: 'radial-gradient(ellipse 50% 80% at 50% 100%, rgba(212,165,32,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* ── 层9：火星粒子 ── */}
            <EmberLayer count={16} H={H} />
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
