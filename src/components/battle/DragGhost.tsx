import { useEffect, useRef, useState } from 'react';
import { dragManager } from './DragManager';
import { HandCard } from './HandCard';
import type { Card } from '@/types';

interface DragGhostProps {
  scale: number;
}

/**
 * 拖拽幽灵 — 跟随鼠标的卡牌占位
 *
 * 性能设计：
 * - 通过 DragManager 订阅 RAF 回调，绕过 React 渲染
 * - 使用 translate3d 触发 GPU 复合层
 * - 偏移量基于 ref 动态计算，不使用魔法数字
 */
export function DragGhost({ scale }: DragGhostProps) {
  const ghostRef = useRef<HTMLDivElement>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const lastPayloadId = useRef<string | null>(null);
  // 缓存半宽/半高，避免每帧读 getBoundingClientRect
  const halfSize = useRef({ w: 40, h: 48 });

  useEffect(() => {
    // 首次挂载后测量实际尺寸
    if (ghostRef.current) {
      const rect = ghostRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        halfSize.current = { w: rect.width / 2, h: rect.height / 2 };
      }
    }

    // 订阅 DragManager — 获取每一帧的高速更新
    // x, y 全程为屏幕坐标 (clientX/Y)
    const unsubscribe = dragManager.subscribe((x, y, rotation, isDragging, payload) => {
      if (!ghostRef.current) return;

      if (isDragging) {
        if (payload?.id && payload.id !== lastPayloadId.current) {
          lastPayloadId.current = payload.id;
          setDraggedCard(payload);
        }

        // 当渲染实体卡牌时，卡牌自身按 W/2 H 偏移了，我们只需要让容器对齐鼠标点
        // 这里容器不居中了，而是绝对放在鼠标点，让内部卡牌去决定锚点 (bottom center)
        ghostRef.current.style.transform =
          `translate3d(${x}px, ${y}px, 0) rotate(${rotation.toFixed(2)}deg)`;
        ghostRef.current.style.opacity = '1';
      } else {
        if (lastPayloadId.current !== null) {
          lastPayloadId.current = null;
          setDraggedCard(null);
        }
        ghostRef.current.style.opacity = '0';
      }
    });

    return () => unsubscribe();
  }, [scale]);

  return (
    <div
      ref={ghostRef}
      className="fixed pointer-events-none z-[9999] flex items-center justify-center"
      style={{
        left: 0,
        top: 0,
        opacity: 0,
        willChange: 'transform',
      }}
    >
      {draggedCard && (
        <HandCard
          card={draggedCard}
          index={0}
          x={0}
          y={0}
          rotation={0}
          zIndex={0}
          isPlayable={true}
          isDragging={true}
          isGhost={true}
          scale={scale}
        />
      )}
    </div>
  );
}

export default DragGhost;
