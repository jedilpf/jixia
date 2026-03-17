import { uiAudio } from '@/utils/audioManager';

export function SurrenderButton({
    onClick,
    scale,
}: {
    onClick: () => void;
    scale: number;
}) {
    return (
        <button
            onClick={() => { uiAudio.playClick(); onClick(); }}
            onMouseEnter={() => uiAudio.playHover()}
            className="absolute rounded-md transition-all focus:outline-none flex items-center justify-center gap-2 px-3 py-1.5"
            style={{
                left: `${20 * scale}px`,
                bottom: `${20 * scale}px`,
                minWidth: `${80 * scale}px`,
                height: `${34 * scale}px`,
                background: 'linear-gradient(135deg, rgba(42,27,18,0.7), rgba(23,14,8,0.75))',
                border: `${scale}px solid rgba(139,115,85,0.4)`,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.5)`,
                cursor: 'pointer',
            }}
            onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(61,37,22,0.85), rgba(31,18,10,0.9))';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,115,85,0.7)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(42,27,18,0.7), rgba(23,14,8,0.75))';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,115,85,0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
        >
            <span style={{ color: '#8b5a2b', fontSize: `${14 * scale}px` }}>🏳</span>
            <span style={{
                color: '#c8ab7e',
                fontSize: `${13 * scale}px`,
                fontFamily: 'serif',
                letterSpacing: `${1 * scale}px`,
                fontWeight: 'bold',
            }}>
                认输
            </span>
        </button>
    );
}
