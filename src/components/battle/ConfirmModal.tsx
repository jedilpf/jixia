// ConfirmModal.tsx
// 春秋战国风格确认弹框，替代浏览器原生 confirm()

import { useEffect } from 'react';
import { uiAudio } from '@/utils/audioManager';

interface ConfirmModalProps {
    open: boolean;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    open,
    message,
    confirmText = '确定',
    cancelText = '取消',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    // ESC 键关闭
    useEffect(() => {
        if (!open) return;
        const handle = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { uiAudio.playClick(); onCancel(); }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                animation: 'modal-fade-in 0.15s ease-out',
            }}
            onClick={() => { uiAudio.playClick(); onCancel(); }}
        >
            <style>{`
        @keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scroll-drop-in {
          0% { opacity: 0; transform: scaleY(0.2) scaleX(0.9) translateY(-30px); }
          60% { transform: scaleY(1.03) scaleX(0.98); }
          100% { opacity: 1; transform: scaleY(1) scaleX(1) translateY(0); }
        }
        @keyframes seal-appear {
          0% { opacity:0; transform: scale(2.2) rotate(-20deg); }
          60% { transform: scale(0.92) rotate(5deg); opacity:1; }
          100% { transform: scale(1) rotate(0deg); opacity:0.9; }
        }
      `}</style>

            {/* 主弹框容器 — 仿宣纸竹简 */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '420px',
                    background: 'linear-gradient(160deg, #f0e8d5 0%, #e8dcc4 50%, #d6c9a8 100%)',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.85), inset 0 0 40px rgba(139,115,85,0.12), 0 0 60px rgba(180,140,70,0.15)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    animation: 'scroll-drop-in 0.4s cubic-bezier(0.2,0.8,0.2,1) forwards',
                }}
            >
                {/* 顶轴 */}
                <div style={{ height: '10px', background: 'linear-gradient(90deg, #3d2616, #6e4a28, #8b6040, #6e4a28, #3d2616)', boxShadow: '0 3px 8px rgba(0,0,0,0.5)' }} />

                {/* 竹简纵线纹 */}
                <div style={{
                    position: 'absolute', inset: '10px',
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 36px, rgba(139,115,85,0.1) 37px)',
                    pointerEvents: 'none',
                }} />
                {/* 内边框线 */}
                <div style={{
                    position: 'absolute', inset: '10px 12px 10px 12px',
                    border: '1px solid rgba(139,115,85,0.35)',
                    pointerEvents: 'none',
                }} />

                {/* 内容区 */}
                <div style={{ position: 'relative', padding: '36px 40px 32px', textAlign: 'center', zIndex: 2 }}>

                    {/* 红色印章 */}
                    <div style={{
                        position: 'absolute', top: '14px', right: '18px',
                        width: '52px', height: '52px',
                        border: '3px solid rgba(160,40,40,0.85)',
                        borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: '"STKaiti", "楷体", serif',
                        fontSize: '20px', fontWeight: 'bold',
                        color: 'rgba(160,40,40,0.85)',
                        letterSpacing: '2px',
                        animation: 'seal-appear 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
                        boxShadow: 'inset 0 0 8px rgba(160,40,40,0.25)',
                    }}>告示</div>

                    {/* 标题 */}
                    <p style={{
                        fontFamily: '"STKaiti", "楷体", serif',
                        fontSize: '13px', letterSpacing: '4px',
                        color: '#7a6347', marginBottom: '20px',
                    }}>— 禀告主公 —</p>

                    {/* 消息正文 */}
                    <p style={{
                        fontFamily: '"STKaiti", "楷体", serif',
                        fontSize: '20px', letterSpacing: '3px',
                        color: '#2a1e0e', lineHeight: '1.8',
                        marginBottom: '32px',
                    }}>{message}</p>

                    {/* 分界横线 */}
                    <div style={{
                        width: '80%', margin: '0 auto 28px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(139,115,85,0.5), transparent)',
                    }} />

                    {/* 按钮组 */}
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        {/* 确认按钮 — 深红毛笔风 */}
                        <button
                            onMouseEnter={() => uiAudio.playHover()}
                            onClick={() => { uiAudio.playClick(); onConfirm(); }}
                            style={{
                                padding: '10px 36px',
                                background: 'linear-gradient(135deg, #8b2a2a 0%, #6b1f1f 100%)',
                                border: '2px solid rgba(180,80,80,0.6)',
                                borderRadius: '3px',
                                color: '#f5e6b8',
                                fontFamily: '"STKaiti", serif',
                                fontSize: '16px', letterSpacing: '4px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.35), inset 0 1px rgba(255,255,255,0.08)',
                                transition: 'all 0.15s',
                            }}
                            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >{confirmText}</button>

                        {/* 取消按钮 — 青铜色 */}
                        <button
                            onMouseEnter={() => uiAudio.playHover()}
                            onClick={() => { uiAudio.playClick(); onCancel(); }}
                            style={{
                                padding: '10px 36px',
                                background: 'linear-gradient(135deg, #3d4a3a 0%, #2a3527 100%)',
                                border: '2px solid rgba(80,110,70,0.6)',
                                borderRadius: '3px',
                                color: '#a7c5ba',
                                fontFamily: '"STKaiti", serif',
                                fontSize: '16px', letterSpacing: '4px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.35), inset 0 1px rgba(255,255,255,0.05)',
                                transition: 'all 0.15s',
                            }}
                            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >{cancelText}</button>
                    </div>
                </div>

                {/* 底轴 */}
                <div style={{ height: '10px', background: 'linear-gradient(90deg, #3d2616, #6e4a28, #8b6040, #6e4a28, #3d2616)', boxShadow: '0 -3px 8px rgba(0,0,0,0.5)' }} />
            </div>
        </div>
    );
}
