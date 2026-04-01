// HeroConsole.tsx - 综合控制台（机关仪表盘）
// 将英雄技能、法力水晶、武器、回合信息整合为一个仪表盘面板
// Skill: ui-theme-designer + ui-interaction-designer + style-pass §3.5

import type { PlayerState } from '@/types';

interface HeroConsoleProps {
    player: PlayerState;
    turn: number;
    canUsePower: boolean;
    isPowerSelected: boolean;
    isPlayerTurn: boolean;
    isEnemy?: boolean;
    onPowerClick: () => void;
    scale: number;
    /** 控制台的左上角绝对坐标（基于 1920x1080 画布） */
    x: number;
    y: number;
}

export function HeroConsole({
    player,
    turn,
    canUsePower,
    isPowerSelected,
    isPlayerTurn,
    isEnemy = false,
    onPowerClick,
    scale,
    x,
    y,
}: HeroConsoleProps) {
    const hero = player.hero;
    const mana = player.mana;
    const maxMana = player.maxMana;
    const heroPower = hero.heroPower;

    // 控制台总尺寸（基于 1920x1080 设计尺寸），做成横向条带
    const W = 360;
    const H = 130;

    return (
        <>
            <style>{`
        @keyframes console-border-glow {
          0%,100% { box-shadow: 0 0 8px rgba(139,115,85,0.3), inset 0 0 12px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 14px rgba(232,93,4,0.4), inset 0 0 12px rgba(0,0,0,0.4); }
        }
        @keyframes console-gear-spin { to { transform: rotate(360deg); } }
        @keyframes mana-fill-pulse {
          0%,100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
        @keyframes console-power-ready {
          0%,100% { box-shadow: 0 0 6px rgba(168,85,247,0.4); }
          50% { box-shadow: 0 0 14px rgba(168,85,247,0.8), 0 0 24px rgba(168,85,247,0.3); }
        }
      `}</style>

            <div
                style={{
                    position: 'absolute',
                    left: `${x * scale}px`,
                    top: `${y * scale}px`,
                    width: `${W * scale}px`,
                    height: `${H * scale}px`,
                    zIndex: 20,
                }}
            >
                {/* ── 控制台主体 ── */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(160deg, rgba(26,20,14,0.95) 0%, rgba(18,14,10,0.95) 100%)',
                        border: `${1.5 * scale}px solid rgba(139,115,85,0.5)`,
                        borderRadius: `${10 * scale}px`,
                        animation: isPlayerTurn ? 'console-border-glow 3s ease-in-out infinite' : 'none',
                        display: 'flex',
                        alignItems: 'stretch',
                        padding: `${6 * scale}px`,
                        gap: `${6 * scale}px`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* 背景纹理（斜线） */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
                        backgroundImage: 'repeating-linear-gradient(45deg, #8B7355 0px, transparent 1px, transparent 12px, #8B7355 13px)',
                    }} />

                    {/* ── 区域1：技能按钮 ── */}
                    <div
                        onClick={!isEnemy && canUsePower && isPlayerTurn ? onPowerClick : undefined}
                        style={{
                            width: `${70 * scale}px`,
                            minWidth: `${70 * scale}px`,
                            borderRadius: `${6 * scale}px`,
                            border: `${1.2 * scale}px solid ${isPowerSelected ? 'rgba(250,204,21,0.8)'
                                : canUsePower && isPlayerTurn ? 'rgba(168,85,247,0.6)'
                                    : 'rgba(80,60,40,0.5)'
                                }`,
                            background: heroPower.usedThisTurn
                                ? 'linear-gradient(180deg, #1a1610 0%, #0f0d0a 100%)'
                                : canUsePower && isPlayerTurn
                                    ? 'linear-gradient(180deg, #2d1f4e 0%, #1a1230 100%)'
                                    : 'linear-gradient(180deg, #1a1610 0%, #0f0d0a 100%)',
                            cursor: !isEnemy && canUsePower && isPlayerTurn ? 'pointer' : 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: `${2 * scale}px`,
                            transition: 'all 0.2s',
                            animation: canUsePower && isPlayerTurn && !heroPower.usedThisTurn
                                ? 'console-power-ready 2s ease-in-out infinite' : 'none',
                            opacity: heroPower.usedThisTurn ? 0.45 : 1,
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {/* 技能图标 */}
                        <div style={{
                            fontSize: `${18 * scale}px`,
                            lineHeight: 1,
                            filter: heroPower.usedThisTurn ? 'grayscale(1)' : 'none',
                        }}>
                            ⚡
                        </div>
                        {/* 技能名 */}
                        <div style={{
                            fontSize: `${8 * scale}px`,
                            color: canUsePower ? '#c4b5fd' : 'rgba(139,115,85,0.5)',
                            fontWeight: 700,
                            fontFamily: 'serif',
                            letterSpacing: `${0.5 * scale}px`,
                            lineHeight: 1,
                            textAlign: 'center',
                        }}>
                            {heroPower.name}
                        </div>
                        {/* 费用 */}
                        <div style={{
                            fontSize: `${9 * scale}px`,
                            fontWeight: 800,
                            color: canUsePower ? '#93c5fd' : 'rgba(100,80,60,0.5)',
                            lineHeight: 1,
                        }}>
                            {heroPower.cost}💧
                        </div>
                        {heroPower.usedThisTurn && (
                            <div style={{
                                fontSize: `${7 * scale}px`,
                                color: 'rgba(139,115,85,0.5)',
                                lineHeight: 1,
                            }}>已用</div>
                        )}
                    </div>

                    {/* ── 区域2：法力仪表 ── */}
                    <div style={{
                        flex: 1,
                        borderRadius: `${6 * scale}px`,
                        border: `${1 * scale}px solid rgba(80,60,40,0.4)`,
                        background: 'linear-gradient(180deg, rgba(15,12,8,0.8) 0%, rgba(10,8,5,0.8) 100%)',
                        padding: `${5 * scale}px ${8 * scale}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: `${4 * scale}px`,
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        {/* 标题行 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <div style={{
                                fontSize: `${8 * scale}px`,
                                color: 'rgba(139,115,85,0.6)',
                                fontFamily: 'serif',
                                letterSpacing: `${1 * scale}px`,
                                lineHeight: 1,
                            }}>
                                {isEnemy ? '敌 方 灵 力' : '灵 力 储 备'}
                            </div>
                            <div style={{
                                fontSize: `${12 * scale}px`,
                                fontWeight: 900,
                                color: '#93c5fd',
                                textShadow: '0 0 8px rgba(96,165,250,0.5)',
                                fontFamily: 'monospace',
                                lineHeight: 1,
                            }}>
                                {mana}/{maxMana}
                            </div>
                        </div>

                        {/* 法力槽（条形进度条，非散点） */}
                        <div style={{
                            width: '100%',
                            height: `${14 * scale}px`,
                            background: 'rgba(30,58,138,0.2)',
                            borderRadius: `${4 * scale}px`,
                            border: `${0.8 * scale}px solid rgba(96,165,250,0.15)`,
                            overflow: 'hidden',
                            position: 'relative',
                        }}>
                            {/* 填充条 */}
                            <div style={{
                                width: maxMana > 0 ? `${(mana / maxMana) * 100}%` : '0%',
                                height: '100%',
                                background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 40%, #60a5fa 80%, #93c5fd 100%)',
                                borderRadius: `${3 * scale}px`,
                                transition: 'width 0.4s ease-out',
                                boxShadow: mana > 0 ? '0 0 8px rgba(96,165,250,0.5)' : 'none',
                                animation: mana > 0 ? 'mana-fill-pulse 2s ease-in-out infinite' : 'none',
                            }} />
                            {/* 刻度线 */}
                            {Array.from({ length: Math.max(maxMana - 1, 0) }, (_, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    left: `${((i + 1) / maxMana) * 100}%`,
                                    top: 0, bottom: 0,
                                    width: `${0.8 * scale}px`,
                                    background: 'rgba(0,0,0,0.4)',
                                }} />
                            ))}
                        </div>

                        {/* 水晶点阵（小型，辅助显示） */}
                        <div style={{
                            display: 'flex',
                            gap: `${2 * scale}px`,
                            justifyContent: 'center',
                        }}>
                            {Array.from({ length: maxMana }, (_, i) => (
                                <div key={i} style={{
                                    width: `${5 * scale}px`,
                                    height: `${5 * scale}px`,
                                    borderRadius: '50%',
                                    background: i < mana
                                        ? 'radial-gradient(circle at 35% 30%, #93c5fd, #2563eb)'
                                        : 'rgba(30,30,50,0.5)',
                                    border: `${0.5 * scale}px solid ${i < mana ? 'rgba(147,197,253,0.4)' : 'rgba(60,60,80,0.3)'}`,
                                    boxShadow: i < mana ? `0 0 ${3 * scale}px rgba(96,165,250,0.4)` : 'none',
                                    transition: 'all 0.3s',
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* ── 区域3：武器 + 回合信息 ── */}
                    <div style={{
                        width: `${70 * scale}px`,
                        minWidth: `${70 * scale}px`,
                        borderRadius: `${6 * scale}px`,
                        border: `${1 * scale}px solid rgba(80,60,40,0.4)`,
                        background: 'linear-gradient(180deg, rgba(15,12,8,0.8) 0%, rgba(10,8,5,0.8) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: `${4 * scale}px`,
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        {/* 武器区域 */}
                        {hero.weapon ? (
                            <>
                                <div style={{
                                    fontSize: `${16 * scale}px`,
                                    lineHeight: 1,
                                    filter: `drop-shadow(0 0 ${4 * scale}px rgba(245,158,11,0.6))`,
                                }}>⚔</div>
                                <div style={{
                                    display: 'flex',
                                    gap: `${4 * scale}px`,
                                    alignItems: 'center',
                                }}>
                                    <span style={{
                                        fontSize: `${9 * scale}px`,
                                        fontWeight: 800,
                                        color: '#fbbf24',
                                        lineHeight: 1,
                                    }}>{hero.weapon.atk}⚔</span>
                                    <span style={{
                                        fontSize: `${9 * scale}px`,
                                        fontWeight: 800,
                                        color: '#a3e635',
                                        lineHeight: 1,
                                    }}>{hero.weapon.durability}🛡</span>
                                </div>
                            </>
                        ) : (
                            <div style={{
                                fontSize: `${16 * scale}px`,
                                opacity: 0.2,
                                lineHeight: 1,
                            }}>⚔</div>
                        )}

                        {/* 分割线 */}
                        <div style={{
                            width: '70%',
                            height: `${0.8 * scale}px`,
                            background: 'linear-gradient(90deg, transparent, rgba(139,115,85,0.4), transparent)',
                        }} />

                        {/* 回合数 */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: `${1 * scale}px`,
                        }}>
                            <div style={{
                                fontSize: `${7 * scale}px`,
                                color: 'rgba(139,115,85,0.5)',
                                fontFamily: 'serif',
                                letterSpacing: `${0.5 * scale}px`,
                                lineHeight: 1,
                            }}>回合</div>
                            <div style={{
                                fontSize: 'clamp(20px, 3.5vh, 28px)',
                                fontWeight: 900,
                                color: isPlayerTurn ? '#fef3c7' : 'rgba(139,115,85,0.5)',
                                fontFamily: 'monospace',
                                lineHeight: 1,
                                textShadow: isPlayerTurn ? '0 0 8px rgba(232,93,4,0.5)' : 'none',
                            }}>{turn}</div>
                        </div>
                    </div>

                    {/* ── 顶部标签（机关名牌） ── */}
                    <div style={{
                        position: 'absolute',
                        top: `${-1 * scale}px`,
                        left: `${20 * scale}px`,
                        background: 'linear-gradient(90deg, rgba(26,20,14,0.95), rgba(18,14,10,0.95))',
                        border: `${0.8 * scale}px solid rgba(139,115,85,0.4)`,
                        borderTop: 'none',
                        borderRadius: `0 0 ${4 * scale}px ${4 * scale}px`,
                        padding: `${1 * scale}px ${8 * scale}px`,
                        display: 'flex', alignItems: 'center', gap: `${3 * scale}px`,
                    }}>
                        <div style={{
                            fontSize: `${9 * scale}px`,
                            color: 'rgba(232,93,4,0.7)',
                            animation: 'console-gear-spin 6s linear infinite',
                            lineHeight: 1,
                        }}>⚙</div>
                        <div style={{
                            fontSize: `${7 * scale}px`,
                            color: 'rgba(139,115,85,0.6)',
                            fontFamily: 'serif',
                            letterSpacing: `${1 * scale}px`,
                            lineHeight: 1,
                        }}>{isEnemy ? '敌方控制台' : '控制台'}</div>
                    </div>

                    {/* 四角铆钉 */}
                    {['tl', 'tr', 'bl', 'br'].map(c => (
                        <div key={c} style={{
                            position: 'absolute',
                            top: c.startsWith('t') ? `${3 * scale}px` : undefined,
                            bottom: c.startsWith('b') ? `${3 * scale}px` : undefined,
                            left: c.endsWith('l') ? `${3 * scale}px` : undefined,
                            right: c.endsWith('r') ? `${3 * scale}px` : undefined,
                            width: `${4 * scale}px`, height: `${4 * scale}px`,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(139,115,85,0.6), rgba(100,80,60,0.3))',
                            zIndex: 2,
                        }} />
                    ))}
                </div>
            </div>
        </>
    );
}
