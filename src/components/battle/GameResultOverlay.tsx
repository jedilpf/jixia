// GameResultOverlay.tsx - 游戏结束界面（胜利/失败）
// Skill: ui-theme-designer, ui-animation-designer, style-pass §3.5 Modal

import type { PlayerId } from '@/types';

interface GameResultOverlayProps {
    winner: PlayerId | null;
    onPlayAgain: () => void;
    onMenu: () => void;
}

export function GameResultOverlay({ winner, onPlayAgain, onMenu }: GameResultOverlayProps) {
    if (!winner) return null;

    const isVictory = winner === 'player';

    return (
        <div
            style={{
                position: 'absolute', inset: 0, zIndex: 9000,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: isVictory
                    ? 'radial-gradient(ellipse auto, rgba(212,165,32,0.15) 0%, rgba(10,10,12,0.92) 100%)'
                    : 'radial-gradient(ellipse auto, rgba(120,40,40,0.15) 0%, rgba(10,10,12,0.92) 100%)',
                backdropFilter: 'blur(4px)',
            }}
        >
            <style>{`
        @keyframes result-scroll-unroll {
          0% { opacity: 0; transform: scaleY(0.1) scaleX(0.8); }
          50% { opacity: 1; transform: scaleY(1.05) scaleX(0.95); }
          100% { transform: scaleY(1) scaleX(1); }
        }
        @keyframes ink-spread {
          0% { filter: blur(10px); opacity: 0; transform: scale(0.8); }
          100% { filter: blur(0px); opacity: 0.15; transform: scale(1); }
        }
        @keyframes seal-stamp {
          0% { transform: scale(2) rotate(-15deg); opacity: 0; }
          40% { transform: scale(0.9) rotate(5deg); opacity: 1; }
          60% { transform: scale(1.05) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        }
        @keyframes float-dust {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
      `}</style>

            {/* 胜利时的金箔飞舞效果 */}
            {isVictory && Array.from({ length: 30 }, (_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    bottom: `${-10 + Math.random() * 20}%`,
                    left: `${10 + Math.random() * 80}%`,
                    width: `${3 + Math.random() * 5}px`,
                    height: `${3 + Math.random() * 8}px`,
                    background: i % 3 === 0 ? '#f5e6b8' : '#d4a520',
                    boxShadow: '0 0 8px rgba(212,165,32,0.8)',
                    opacity: 0,
                    animation: `float-dust ${3 + Math.random() * 4}s ${Math.random() * 2}s ease-out infinite`,
                    pointerEvents: 'none',
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                }} />
            ))}

            {/* 主画轴面板 (仿古帛书/竹简) */}
            <div style={{
                position: 'relative',
                width: '640px',
                minHeight: '440px',
                background: 'linear-gradient(135deg, #f0e6d2 0%, #eaddc5 40%, #c4b59b 100%)', // 提亮宣纸底色
                boxShadow: isVictory
                    ? '0 30px 60px rgba(0,0,0,0.85), inset 0 0 80px rgba(139,115,85,0.1), 0 0 120px rgba(212,165,32,0.3)'
                    : '0 30px 60px rgba(0,0,0,0.85), inset 0 0 80px rgba(139,115,85,0.3)',
                animation: 'result-scroll-unroll 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                textAlign: 'center',
                overflow: 'hidden',
                borderRadius: '4px',
            }}>
                {/* 顶角和底角的卷轴木条装饰 */}
                <div style={{ position: 'absolute', top: 0, left: '-2%', right: '-2%', height: '12px', background: 'linear-gradient(90deg, #3d2616, #5c3a21, #3d2616)', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: '-2%', right: '-2%', height: '12px', background: 'linear-gradient(90deg, #3d2616, #5c3a21, #3d2616)', borderRadius: '6px', boxShadow: '0 -4px 6px rgba(0,0,0,0.5)' }} />

                {/* 内部水墨晕染背景 */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: isVictory
                        ? 'radial-gradient(circle at 50% 40%, rgba(212,165,32,0.15) 0%, transparent 70%)'
                        : 'radial-gradient(circle at 50% 40%, rgba(139,38,53,0.15) 0%, transparent 70%)',
                    animation: 'ink-spread 1.5s ease-out forwards'
                }} />

                {/* 背景底云纹或竹简线 */}
                <div style={{
                    position: 'absolute', inset: '12px',
                    border: '1px solid rgba(139,115,85,0.3)',
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(139,115,85,0.08) 39px, rgba(139,115,85,0.08) 40px)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 10, padding: '72px 60px' }}>
                    {/* 结果标题：毛笔印章风 */}
                    <div style={{
                        position: 'relative',
                        display: 'inline-block',
                        marginBottom: '48px'
                    }}>
                        <div style={{
                            fontSize: '76px',
                            fontWeight: 900,
                            fontFamily: '"STKaiti", "Kaiti", serif', // 楷体/行书感
                            letterSpacing: '24px',
                            marginLeft: '24px', // 补偿letter-spacing
                            color: '#1a1a1a', // 浓墨
                            textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                        }}>
                            {isVictory ? '论道大胜' : '折戟沉沙'}
                        </div>
                        {/* 红色印泥印章效果 */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-50px',
                            width: '74px',
                            height: '74px',
                            border: '4px solid #b32d2d',
                            color: '#b32d2d',
                            fontFamily: '"STKaiti", serif',
                            fontSize: '28px',
                            lineHeight: '66px',
                            textAlign: 'center',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            opacity: 0,
                            animation: 'seal-stamp 0.6s 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                            transformOrigin: 'center center',
                            boxShadow: 'inset 0 0 8px rgba(179,45,45,0.4), 0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            {isVictory ? '甲上' : '丙下'}
                        </div>
                    </div>

                    {/* 文言文副标题评价 */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        fontSize: '18px',
                        color: '#4a3c31', // 褪色墨水
                        letterSpacing: '4px',
                        fontFamily: '"STKaiti", serif',
                        marginBottom: '48px',
                        position: 'relative'
                    }}>
                        {/* 左右装饰线 */}
                        <div style={{ position: 'absolute', left: '-10px', right: '-10px', top: '50%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,115,85,0.4), transparent)' }} />

                        <span style={{ background: '#eaddc5', padding: '0 16px', alignSelf: 'center', zIndex: 1 }}>
                            {isVictory ? '舌绽莲花，辩绝百家' : '学派争鸣，胜败常事'}
                        </span>
                        <span style={{ fontSize: '14px', color: '#6a5a4a', background: '#eaddc5', padding: '0 16px', alignSelf: 'center', zIndex: 1 }}>
                            {isVictory ? '「其辞如金石，其理如江河」' : '「君子藏器于身，待时而动」'}
                        </span>
                    </div>

                    {/* 操作按钮组 (竹简/令牌风格) */}
                    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                        {/* 左侧：返回菜单（青铜/黑木色） */}
                        <button
                            onClick={() => {
                                import('@/utils/audioManager').then(m => m.uiAudio.playClick());
                                onMenu();
                            }}
                            onMouseEnter={() => import('@/utils/audioManager').then(m => m.uiAudio.playHover())}
                            style={{
                                padding: '12px 36px',
                                background: 'linear-gradient(180deg, #2a2a2a 0%, #111 100%)',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                color: '#a7c5ba',
                                fontSize: '18px',
                                fontFamily: '"STKaiti", serif',
                                letterSpacing: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
                            }}
                            onMouseOver={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 6px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.2)'; }}
                            onMouseOut={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)'; }}
                        >
                            归隐
                        </button>

                        {/* 右侧：再来一局（朱漆色/丹砂） */}
                        <button
                            onClick={() => {
                                import('@/utils/audioManager').then(m => m.uiAudio.playClick());
                                onPlayAgain();
                            }}
                            onMouseEnter={() => import('@/utils/audioManager').then(m => m.uiAudio.playHover())}
                            style={{
                                padding: '12px 36px',
                                background: 'linear-gradient(180deg, #8B2500 0%, #5c1800 100%)',
                                border: '1px solid #a33b15',
                                borderRadius: '4px',
                                color: '#fef3c7',
                                fontSize: '18px',
                                fontFamily: '"STKaiti", serif',
                                letterSpacing: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,160,120,0.2)',
                            }}
                            onMouseOver={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 6px 12px rgba(139,37,0,0.4), inset 0 1px 2px rgba(255,160,120,0.3)'; }}
                            onMouseOut={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,160,120,0.2)'; }}
                        >
                            再战
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
