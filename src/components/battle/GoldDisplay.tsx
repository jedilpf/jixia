// GoldDisplay.tsx - 金币显示组件

interface GoldDisplayProps {
  gold: number;
  scale: number;
  x: number;
  y: number;
}

export function GoldDisplay({ gold, scale, x, y }: GoldDisplayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.3))',
        border: '2px solid rgba(255, 215, 0, 0.6)',
        borderRadius: '20px',
        padding: '8px 16px',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)',
        zIndex: 1000,
      }}
    >
      <span style={{ fontSize: `${24 * scale}px` }}>💰</span>
      <span
        style={{
          fontSize: `${20 * scale}px`,
          fontWeight: 'bold',
          color: '#FFD700',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
        }}
      >
        {gold}
      </span>
    </div>
  );
}

export default GoldDisplay;
