interface ManaBarProps {
  current: number;
  max: number;
  scale: number;
  x: number;
  y: number;
  isEnemy?: boolean;
}

export function ManaBar({ current, max, scale, x, y, isEnemy = false }: ManaBarProps) {
  const crystals = Array.from({ length: Math.max(max, 1) }, (_, i) => i);
  const crystalSize = Math.max(10, Math.min(18, (120 * scale) / Math.max(max, 1) - 2));

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        display: 'flex',
        flexDirection: isEnemy ? 'row-reverse' : 'row',
        gap: `${2 * scale}px`,
        alignItems: 'center',
      }}
    >
      {crystals.map(i => {
        const filled = i < current;
        return (
          <div
            key={i}
            style={{
              width: `${crystalSize}px`,
              height: `${crystalSize}px`,
              borderRadius: '50%',
              background: filled
                ? 'radial-gradient(circle at 35% 30%, #93c5fd 0%, #2563eb 55%, #1e3a8a 100%)'
                : 'radial-gradient(circle at 35% 30%, #374151 0%, #1f2937 100%)',
              border: `${1.2 * scale}px solid ${filled ? 'rgba(147,197,253,0.5)' : 'rgba(75,85,99,0.5)'}`,
              boxShadow: filled
                ? `0 0 ${6 * scale}px rgba(96,165,250,0.6), inset 0 1px 1px rgba(255,255,255,0.3)`
                : 'inset 0 1px 1px rgba(0,0,0,0.3)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          />
        );
      })}

      {/* 当前/最大 数字 */}
      <div style={{
        marginLeft: `${3 * scale}px`,
        color: 'rgba(147,197,253,0.85)',
        fontSize: `${10 * scale}px`,
        fontWeight: 700,
        textShadow: '0 0 6px rgba(96,165,250,0.5)',
        whiteSpace: 'nowrap',
      }}>
        {current}/{max}
      </div>
    </div>
  );
}
