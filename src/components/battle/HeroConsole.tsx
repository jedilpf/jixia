// HeroConsole.tsx - 综合控制台（机关仪表盘）
// 将英雄技能、法力水晶、武器、回合信息整合为一个仪表盘面板
// Skill: ui-theme-designer + ui-interaction-designer + style-pass §3.5

import type { PlayerState } from '@/types';
import { IconCrossSwords, IconShield } from '@/components/common/JixiaIcons';

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
          0%,100% { box-shadow: 0 0 12px rgba(212,165,32,0.3), inset 0 0 12px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 20px rgba(212,165,32,0.6), inset 0 0 12px rgba(0,0,0,0.4); }
        }
        @keyframes console-gear-spin { to { transform: rotate(360deg); } }
        @keyframes mana-fill-pulse {
          0%,100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
        @keyframes console-power-ready {
          0%,100% { box-shadow: 0 0 6px rgba(212,165,32,0.4); }
          50% { box-shadow: 0 0 20px rgba(212,165,32,0.8), 0 0 30px rgba(212,165,32,0.3); }
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
                        background: 'linear-gradient(160deg, #5c1913 0%, #2a0e0a 100%)', // 深红背景
                        border: `${2 * scale}px solid #d4a520`, // 金色粗边
                        borderRadius: `${4 * scale}px`, // 更方正的古风线条
                        animation: isPlayerTurn ? 'console-border-glow 3s ease-in-out infinite' : 'none',
                        display: 'flex',
                        alignItems: 'stretch',
                        padding: `${8 * scale}px`,
                        gap: `${8 * scale}px`,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* 背景纹理（云纹/织物） */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
                        backgroundImage: 'repeating-linear-gradient(45deg, #d4a520 0px, transparent 1px, transparent 15px, #d4a520 16px)',
                    }} />

                    {/* ── 区域1：技能按钮 ── */}
                    <div
                        onClick={!isEnemy && canUsePower && isPlayerTurn ? onPowerClick : undefined}
                        style={{
                            width: `${75 * scale}px`,
                            minWidth: `${75 * scale}px`,
                            borderRadius: `${2 * scale}px`,
                            border: `${1.5 * scale}px solid ${isPowerSelected ? '#f5e6b8'
                                : canUsePower && isPlayerTurn ? '#d4a520'
                                    : '#8b2e2e'
                                }`,
                            background: heroPower.usedThisTurn
                                ? 'rgba(0,0,0,0.3)'
                                : canUsePower && isPlayerTurn
                                    ? 'linear-gradient(180deg, #d4a520 0%, #8b5a2b 100%)' // 可用时变为金底
                                    : 'rgba(139,46,46,0.2)',
                            cursor: !isEnemy && canUsePower && isPlayerTurn ? 'pointer' : 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: `${2 * scale}px`,
                            transition: 'all 0.3s',
                            animation: canUsePower && isPlayerTurn && !heroPower.usedThisTurn
                                ? 'console-power-ready 2s ease-in-out infinite' : 'none',
                            opacity: heroPower.usedThisTurn ? 0.35 : 1,
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {/* 技能图标 */}
                        <div style={{
                            fontSize: `${20 * scale}px`,
                            lineHeight: 1,
                            color: isPlayerTurn && !heroPower.usedThisTurn ? (canUsePower ? '#3a0d0a' : '#f5e6b8') : '#8b2e2e',
                            filter: heroPower.usedThisTurn ? 'grayscale(1)' : 'none',
                        }}>
                            🏮
                        </div>
                        {/* 技能名 */}
                        <div style={{
                            fontSize: `${9 * scale}px`,
                            color: canUsePower && isPlayerTurn ? '#3a0d0a' : '#f5e6b8',
                            fontWeight: 900,
                            fontFamily: '"Noto Serif SC", serif',
                            letterSpacing: `${0.5 * scale}px`,
                            lineHeight: 1.1,
                            textAlign: 'center',
                        }}>
                            {heroPower.name}
                        </div>
                        {/* 费用 */}
                        <div style={{
                            fontSize: `${10 * scale}px`,
                            fontWeight: 'bold',
                            color: canUsePower && isPlayerTurn ? '#d4a520' : '#8b8b8b',
                            textAlign: 'center',
                        }}>
                            {heroPower.cost || 0}
                        </div>
                    </div>

                    {/* ── 区域2：法力仪表 ── */}
                    <div style={{
                        flex: 1,
                        borderRadius: `${2 * scale}px`,
                        border: `${1 * scale}px solid rgba(212,165,32,0.3)`,
                        background: 'rgba(0,0,0,0.2)',
                        padding: `${5 * scale}px ${12 * scale}px`,
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
                                fontSize: `${9 * scale}px`,
                                color: '#f5e6b8',
                                fontFamily: '"Noto Serif SC", serif',
                                letterSpacing: `${1 * scale}px`,
                                fontWeight: 'bold',
                                lineHeight: 1,
                            }}>
                                {isEnemy ? '敌 方 灵 力' : '灵 力 储 备'}
                            </div>
                            <div style={{
                                fontSize: `${14 * scale}px`,
                                fontWeight: 900,
                                color: '#d4a520',
                                textShadow: '0 0 8px rgba(212,165,32,0.5)',
                                lineHeight: 1,
                            }}>
                                {mana}/{maxMana}
                            </div>
                        </div>

                        {/* 法力槽 */}
                        <div style={{
                            width: '100%',
                            height: `${16 * scale}px`,
                            background: 'rgba(0,0,0,0.4)',
                            borderRadius: `${2 * scale}px`,
                            border: `${1 * scale}px solid rgba(212,165,32,0.2)`,
                            overflow: 'hidden',
                            position: 'relative',
                        }}>
                            <div style={{
                                width: maxMana > 0 ? `${(mana / maxMana) * 100}%` : '0%',
                                height: '100%',
                                background: 'linear-gradient(90deg, #5c1913 0%, #8b2e2e 50%, #d4a520 100%)', // 灵力条也改为金红
                                transition: 'width 0.4s ease-out',
                                boxShadow: mana > 0 ? '0 0 10px rgba(212,165,32,0.4)' : 'none',
                                animation: mana > 0 ? 'mana-fill-pulse 2s ease-in-out infinite' : 'none',
                            }} />
                        </div>
                    </div>

                    {/* ── 区域3：武器 + 回合信息 ── */}
                    <div style={{
                        width: `${75 * scale}px`,
                        minWidth: `${75 * scale}px`,
                        borderRadius: `${2 * scale}px`,
                        border: `${1 * scale}px solid rgba(212,165,32,0.4)`,
                        background: 'rgba(139,46,46,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: `${4 * scale}px`,
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        {hero.weapon ? (
                            <div style={{
                                display: 'flex',
                                gap: `${4 * scale}px`,
                                alignItems: 'center',
                            }}>
                                <IconCrossSwords size={12 * scale} color="#d4a520" />
                                <span style={{ fontSize: `${12 * scale}px`, color: '#d4a520' }}>{hero.weapon.atk}</span>
                                <IconShield size={12 * scale} color="#f5e6b8" />
                                <span style={{ fontSize: `${12 * scale}px`, color: '#f5e6b8' }}>{hero.weapon.durability}</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                <IconCrossSwords size={16 * scale} color="#d4a520" />
                            </div>
                        )}

                        <div style={{
                            width: '60%',
                            height: '1px',
                            background: 'rgba(212,165,32,0.3)',
                        }} />

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <div style={{ fontSize: `${8 * scale}px`, color: '#f5e6b8', opacity: 0.7 }}>回合</div>
                            <div style={{
                                fontSize: `${24 * scale}px`,
                                fontWeight: 900,
                                color: isPlayerTurn ? '#d4a520' : '#8b2e2e',
                                textShadow: isPlayerTurn ? '0 0 10px rgba(212,165,32,0.5)' : 'none',
                            }}>{turn}</div>
                        </div>
                    </div>

                    {/* 顶部标签 */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: `${24 * scale}px`,
                        background: '#d4a520',
                        padding: `${1 * scale}px ${12 * scale}px`,
                        borderRadius: `0 0 ${4 * scale}px ${4 * scale}px`,
                        display: 'flex', alignItems: 'center', gap: `${4 * scale}px`,
                    }}>
                        <div style={{ fontSize: `${10 * scale}px`, color: '#3a0d0a' }}>⚙</div>
                        <div style={{
                            fontSize: `${8 * scale}px`,
                            color: '#3a0d0a',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                        }}>{isEnemy ? '敌方鸣放' : '稷下阵位'}</div>
                    </div>
                </div>
            </div>
        </>
    );
}
