// EmptySlot.tsx - 论道席（空位状态）
// Skill: ui-theme-designer, style-pass §3.2 UnitSlot

import { useState } from 'react';

interface EmptySlotProps {
  isHighlighted?: boolean;
  showBorder?: boolean;
  scale: number;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick?: () => void;
}

export function EmptySlot({ isHighlighted = false, showBorder = false, scale, x, y, w, h, onClick }: EmptySlotProps) {
  const [hovered, setHovered] = useState(false);

  const visible = isHighlighted || showBorder || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        width: `${w * scale}px`,
        height: `${h * scale}px`,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: `${6 * scale}px`,
        border: `${scale * 1.5}px ${isHighlighted ? 'solid' : 'dashed'} ${isHighlighted
            ? 'rgba(74,124,111,0.8)'
            : visible
              ? 'rgba(139,115,85,0.35)'
              : 'rgba(139,115,85,0.12)'
          }`,
        background: isHighlighted
          ? 'rgba(74,124,111,0.08)'
          : 'transparent',
        transition: 'all 0.2s',
        boxShadow: isHighlighted
          ? `0 0 ${10 * scale}px rgba(74,124,111,0.3), inset 0 0 ${8 * scale}px rgba(74,124,111,0.1)`
          : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 竹简卷收状态 - 仅在高亮时显示中心图标 */}
      {isHighlighted && (
        <div style={{
          fontSize: `${16 * scale}px`,
          opacity: 0.6,
          animation: 'slot-pulse 1.2s ease-in-out infinite',
          color: 'rgba(74,124,111,0.9)',
        }}>
          ☯
        </div>
      )}

      {/* 四角钉 */}
      {visible && (
        <>
          <div style={{
            position: 'absolute', top: `${2 * scale}px`, left: `${2 * scale}px`,
            width: `${5 * scale}px`, height: `${5 * scale}px`,
            border: `${scale}px solid rgba(139,115,85,0.4)`,
            borderRight: 'none', borderBottom: 'none',
            borderRadius: `${scale}px 0 0 0`,
          }} />
          <div style={{
            position: 'absolute', top: `${2 * scale}px`, right: `${2 * scale}px`,
            width: `${5 * scale}px`, height: `${5 * scale}px`,
            border: `${scale}px solid rgba(139,115,85,0.4)`,
            borderLeft: 'none', borderBottom: 'none',
            borderRadius: `0 ${scale}px 0 0`,
          }} />
          <div style={{
            position: 'absolute', bottom: `${2 * scale}px`, left: `${2 * scale}px`,
            width: `${5 * scale}px`, height: `${5 * scale}px`,
            border: `${scale}px solid rgba(139,115,85,0.4)`,
            borderRight: 'none', borderTop: 'none',
            borderRadius: `0 0 0 ${scale}px`,
          }} />
          <div style={{
            position: 'absolute', bottom: `${2 * scale}px`, right: `${2 * scale}px`,
            width: `${5 * scale}px`, height: `${5 * scale}px`,
            border: `${scale}px solid rgba(139,115,85,0.4)`,
            borderLeft: 'none', borderTop: 'none',
            borderRadius: `0 0 ${scale}px 0`,
          }} />
        </>
      )}

      <style>{`
        @keyframes slot-pulse {
          0%,100% { opacity:0.4; transform:scale(1); }
          50% { opacity:0.8; transform:scale(1.1); }
        }
      `}</style>
    </div>
  );
}
