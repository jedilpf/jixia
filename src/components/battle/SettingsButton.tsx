import { useState } from 'react';
import { uiAudio } from '@/utils/audioManager';

export function SettingsButton({
    onClick,
}: {
    onClick: () => void;
}) {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={() => { uiAudio.playClick(); onClick(); }}
            onMouseEnter={() => { uiAudio.playHover(); setHover(true); }}
            onMouseLeave={() => setHover(false)}
            className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200"
            style={{
                background: hover
                    ? 'linear-gradient(135deg, rgba(26,14,4,0.85), rgba(40,24,8,0.9))'
                    : 'linear-gradient(135deg, rgba(16,10,4,0.7), rgba(26,18,8,0.75))',
                border: '1px solid ' + (hover ? 'rgba(139,115,85,0.7)' : 'rgba(139,115,85,0.4)'),
                color: hover ? '#f5e6b8' : '#c8ab7e',
                backdropFilter: 'blur(8px)',
                letterSpacing: '1px',
                fontFamily: 'serif',
                boxShadow: hover
                    ? '0 0 12px rgba(139,115,85,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.5)',
                transform: hover ? 'scale(1.05)' : 'scale(1)',
            }}
        >
            <span className="text-sm">⚙</span>
            <span className="text-sm leading-none">设置</span>
        </button>
    );
}
