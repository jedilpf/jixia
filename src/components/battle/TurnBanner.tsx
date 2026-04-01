// TurnBanner.tsx - 回合开始横幅动画
// 显示"你的回合"/"敌方回合"的大型横幅，带有入场+退场动画

import { useState, useEffect } from 'react';

interface TurnBannerProps {
    currentPlayer: 'player' | 'enemy';
    turnNumber: number;
}

export function TurnBanner({ currentPlayer, turnNumber }: TurnBannerProps) {
    const [visible, setVisible] = useState(false);
    const [animPhase, setAnimPhase] = useState<'enter' | 'hold' | 'exit' | 'hidden'>('hidden');

    // 检测回合切换
    useEffect(() => {
        if (turnNumber <= 0) return;

        // 触发入场
        setVisible(true);
        setAnimPhase('enter');

        const holdTimer = setTimeout(() => setAnimPhase('hold'), 400);
        const exitTimer = setTimeout(() => setAnimPhase('exit'), 1600);
        const hideTimer = setTimeout(() => {
            setAnimPhase('hidden');
            setVisible(false);
        }, 2200);

        return () => {
            clearTimeout(holdTimer);
            clearTimeout(exitTimer);
            clearTimeout(hideTimer);
        };
    }, [turnNumber, currentPlayer]);

    if (!visible) return null;

    const isPlayer = currentPlayer === 'player';

    const opacity = animPhase === 'enter' ? 1 : animPhase === 'hold' ? 1 : animPhase === 'exit' ? 0 : 0;
    const translateY = animPhase === 'enter' ? '0px' : animPhase === 'hold' ? '0px' : animPhase === 'exit' ? '-30px' : '30px';
    const scaleVal = animPhase === 'enter' ? 1 : animPhase === 'hold' ? 1 : animPhase === 'exit' ? 0.9 : 1.1;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
        >
            {/* 背景遮罩 */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(180deg, transparent 30%, ${isPlayer ? 'rgba(232,93,4,0.08)' : 'rgba(139,38,53,0.08)'
                    } 50%, transparent 70%)`,
                opacity: animPhase === 'hidden' ? 0 : 1,
                transition: 'opacity 0.4s',
            }} />

            {/* 横条背景 */}
            <div style={{
                position: 'relative',
                width: '100%',
                padding: '20px 0',
                background: `linear-gradient(90deg, 
          transparent 0%, 
          ${isPlayer ? 'rgba(26,20,14,0.92)' : 'rgba(20,14,18,0.92)'} 15%,
          ${isPlayer ? 'rgba(26,20,14,0.95)' : 'rgba(20,14,18,0.95)'} 50%,
          ${isPlayer ? 'rgba(26,20,14,0.92)' : 'rgba(20,14,18,0.92)'} 85%,
          transparent 100%
        )`,
                borderTop: `1px solid ${isPlayer ? 'rgba(232,93,4,0.5)' : 'rgba(139,38,53,0.5)'}`,
                borderBottom: `1px solid ${isPlayer ? 'rgba(232,93,4,0.5)' : 'rgba(139,38,53,0.5)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                opacity,
                transform: `translateY(${translateY}) scale(${scaleVal})`,
                transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            }}>
                {/* 齿轮装饰 */}
                <div style={{
                    fontSize: '16px',
                    color: isPlayer ? 'rgba(232,93,4,0.7)' : 'rgba(139,38,53,0.7)',
                    marginBottom: '2px',
                }}>
                    ⚙
                </div>

                {/* 主文字 */}
                <div style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    fontFamily: 'serif',
                    letterSpacing: '12px',
                    background: isPlayer
                        ? 'linear-gradient(180deg, #fef3c7 0%, #d4a017 50%, #92600a 100%)'
                        : 'linear-gradient(180deg, #fca5a5 0%, #dc2626 50%, #7f1d1d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                }}>
                    {isPlayer ? '汝之回合' : '敌方回合'}
                </div>

                {/* 副标题 */}
                <div style={{
                    fontSize: '12px',
                    color: isPlayer ? 'rgba(212,160,23,0.6)' : 'rgba(139,38,53,0.6)',
                    letterSpacing: '4px',
                    fontFamily: 'serif',
                }}>
                    {isPlayer ? '请出牌或结束回合' : '对方正在思考···'}
                </div>

                {/* 左右装饰线 */}
                <div style={{
                    position: 'absolute', left: '10%', right: '10%', top: '50%',
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${isPlayer ? 'rgba(232,93,4,0.3)' : 'rgba(139,38,53,0.3)'
                        }, transparent)`,
                    zIndex: -1,
                }} />
            </div>
        </div>
    );
}
