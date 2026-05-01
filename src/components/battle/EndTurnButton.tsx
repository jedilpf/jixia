// EndTurnButton.tsx - 结束回合按钮（机关钮）
// Skill: ui-theme-designer, ui-interaction-designer, style-pass §3.5 Button
import { uiAudio } from '@/utils/audioManager';

interface EndTurnButtonProps {
    isPlayerTurn: boolean;
    isAiThinking: boolean;
    scale: number;
    x: number;
    y: number;
    w: number;
    h: number;
    onClick: () => void;
}

export function EndTurnButton({ isPlayerTurn, isAiThinking, scale, x, y, w, h, onClick }: EndTurnButtonProps) {
    const disabled = !isPlayerTurn || isAiThinking;

    return (
        <>
            <style>{`
        @keyframes eth-gear-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes eth-pulse {
          0%,100% { box-shadow: 0 0 12px rgba(212,165,32,0.4); }
          50% { box-shadow: 0 0 24px rgba(212,165,32,0.8), 0 0 40px rgba(212,165,32,0.3); }
        }
        @keyframes eth-ai-blink {
          0%,100% { opacity:0.5; }
          50% { opacity:1; }
        }
      `}</style>
            <button
                onClick={!disabled ? () => { uiAudio.playClick(); onClick(); } : undefined}
                style={{
                    position: 'absolute',
                    left: `${x * scale}px`,
                    top: `${y * scale}px`,
                    width: `${w * scale}px`,
                    height: `${h * scale}px`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    border: 'none',
                    borderRadius: `${4 * scale}px`,
                    padding: 0,
                    overflow: 'hidden',
                    outline: 'none',
                    transition: 'transform 0.15s, opacity 0.2s',
                    opacity: disabled ? 0.65 : 1,
                    transform: 'scale(1)',
                }}
                onMouseEnter={e => { if (!disabled) { uiAudio.playHover(); (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                onMouseDown={e => { if (!disabled) { uiAudio.playClick(); (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; } }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
                {/* 按钮本体 */}
                <div style={{
                    width: '100%', height: '100%',
                    background: disabled
                        ? 'linear-gradient(180deg, #3a0d0a 0%, #1a0604 100%)'
                        : 'linear-gradient(180deg, #8b2e2e 0%, #5c1913 60%, #3a0d0a 100%)',
                    border: `${scale * 2}px solid ${disabled ? '#8b2e2e' : '#d4a520'}`,
                    borderRadius: `${4 * scale}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `${3 * scale}px`,
                    animation: (!disabled && isPlayerTurn) ? 'eth-pulse 2s ease-in-out infinite' : 'none',
                    position: 'relative',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                }}>

                    {/* 装饰图标 */}
                    <div style={{
                        fontSize: `${16 * scale}px`,
                        color: disabled ? 'rgba(212,165,32,0.3)' : '#d4a520',
                        animation: !disabled ? 'eth-gear-spin 6s linear infinite' : 'none',
                        lineHeight: 1,
                    }}>
                        ⚙
                    </div>

                    {/* 主文字 */}
                    <div style={{
                        fontSize: `${14 * scale}px`,
                        fontWeight: 900,
                        fontFamily: '"Noto Serif SC", serif',
                        letterSpacing: `${2 * scale}px`,
                        color: disabled ? 'rgba(245,230,184,0.4)' : '#f5e6b8',
                        textShadow: !disabled ? `0 2px 4px rgba(0,0,0,0.5)` : 'none',
                        lineHeight: 1,
                    }}>
                        {isAiThinking ? '论道' : isPlayerTurn ? '鸣金' : '合纵'}
                    </div>

                    {/* 副文字 */}
                    <div style={{
                        fontSize: `${9 * scale}px`,
                        color: disabled ? 'rgba(212,165,32,0.2)' : '#d4a520',
                        letterSpacing: `${1 * scale}px`,
                        fontFamily: '"Noto Serif SC", serif',
                        lineHeight: 1,
                        animation: isAiThinking ? 'eth-ai-blink 1s ease-in-out infinite' : 'none',
                        opacity: 0.8,
                    }}>
                        {isAiThinking ? '思考中' : isPlayerTurn ? '收兵' : '连横'}
                    </div>

                    {/* AI思考进度条 */}
                    {isAiThinking && (
                        <div style={{
                            position: 'absolute', bottom: `${3 * scale}px`, left: `${8 * scale}px`, right: `${8 * scale}px`,
                            height: `${3 * scale}px`,
                            background: 'rgba(0,0,0,0.4)',
                            borderRadius: `${scale}px`,
                            overflow: 'hidden',
                            border: '0.5px solid rgba(212,165,32,0.3)',
                        }}>
                            <div style={{
                                height: '100%',
                                background: '#d4a520',
                                animation: 'eth-ai-scan 1.5s ease-in-out infinite',
                                width: '40%',
                            }} />
                        </div>
                    )}

                    <style>{`
            @keyframes eth-ai-scan {
              0% { transform: translateX(-200%); }
              100% { transform: translateX(400%); }
            }
          `}</style>
                </div>
            </button>
        </>
    );
}
