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
          0%,100% { box-shadow: 0 0 8px rgba(232,93,4,0.3); }
          50% { box-shadow: 0 0 16px rgba(232,93,4,0.6), 0 0 30px rgba(232,93,4,0.2); }
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
                    borderRadius: `${6 * scale}px`,
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
                        ? 'linear-gradient(180deg, #2a2018 0%, #1a1410 100%)'
                        : 'linear-gradient(180deg, #7c3a00 0%, #4a1a00 60%, #2e1000 100%)',
                    border: `${scale * 1.5}px solid ${disabled ? 'rgba(100,80,60,0.4)' : 'rgba(232,93,4,0.7)'}`,
                    borderRadius: `${6 * scale}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `${3 * scale}px`,
                    animation: (!disabled && isPlayerTurn) ? 'eth-pulse 2s ease-in-out infinite' : 'none',
                    position: 'relative',
                }}>

                    {/* 齿轮装饰（顶部） */}
                    <div style={{
                        fontSize: `${14 * scale}px`,
                        color: disabled ? 'rgba(139,115,85,0.3)' : 'rgba(232,93,4,0.8)',
                        animation: !disabled ? 'eth-gear-spin 4s linear infinite' : 'none',
                        lineHeight: 1,
                    }}>
                        ⚙
                    </div>

                    {/* 主文字 */}
                    <div style={{
                        fontSize: `${11 * scale}px`,
                        fontWeight: 800,
                        fontFamily: 'serif',
                        letterSpacing: `${1.5 * scale}px`,
                        color: disabled ? 'rgba(180,160,130,0.5)' : '#fef3c7',
                        textShadow: !disabled ? `0 0 ${6 * scale}px rgba(232,93,4,0.8)` : 'none',
                        lineHeight: 1,
                    }}>
                        {isAiThinking ? '论道中' : isPlayerTurn ? '鸣金' : '等待'}
                    </div>

                    {/* 副文字 */}
                    <div style={{
                        fontSize: `${8 * scale}px`,
                        color: disabled ? 'rgba(139,115,85,0.3)' : 'rgba(244,162,97,0.7)',
                        letterSpacing: `${1 * scale}px`,
                        fontFamily: 'serif',
                        lineHeight: 1,
                        animation: isAiThinking ? 'eth-ai-blink 1s ease-in-out infinite' : 'none',
                    }}>
                        {isAiThinking ? '···' : isPlayerTurn ? '收兵' : '···'}
                    </div>

                    {/* AI思考进度条 */}
                    {isAiThinking && (
                        <div style={{
                            position: 'absolute', bottom: `${3 * scale}px`, left: `${6 * scale}px`, right: `${6 * scale}px`,
                            height: `${2 * scale}px`,
                            background: 'rgba(74,124,111,0.2)',
                            borderRadius: `${scale}px`,
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                background: 'rgba(74,124,111,0.8)',
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
