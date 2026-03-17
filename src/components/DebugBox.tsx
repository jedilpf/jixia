import { RenderNode } from '@/config/layoutSpec';

interface DebugBoxProps {
  item: RenderNode;
  scale: number;
}

export function DebugBox({ item, scale }: DebugBoxProps) {
  return (
    <div
      className="absolute border-2 border-dashed flex items-center justify-center text-xs font-bold select-none transition-all duration-200 hover:opacity-80"
      style={{
        left: `${item.x * scale}px`,
        top: `${item.y * scale}px`,
        width: `${item.w * scale}px`,
        height: `${item.h * scale}px`,
        borderColor: item.color || '#e94560',
        backgroundColor: `${item.color || '#e94560'}20`,
        color: item.color || '#e94560',
      }}
    >
      <div className="text-center px-1">
        <div className="truncate">{item.label || item.id}</div>
        <div className="text-[10px] opacity-70">
          {Math.round(item.w)}×{Math.round(item.h)}
        </div>
      </div>
    </div>
  );
}
