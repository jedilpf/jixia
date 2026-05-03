/**
 * DragGhostLayer.tsx
 * 拖拽幽灵层 — 复用 DragManager RAF 引擎，在 react-dnd 拖拽过程中渲染卡牌预览
 *
 * 设计：
 * - 不直接依赖 react-dnd，只在 DragManager 激活时渲染
 * - 通过 DragManager.subscribe 订阅 RAF 回调（每帧更新）
 * - 渲染 DragGhost（卡牌预览），跟随鼠标，带旋转和 Lerp 平滑
 * - 全屏 fixed 覆盖，pointer-events: none，不阻挡交互
 */

import { useEffect, useRef, useState } from 'react';
import { dragManager } from './DragManager';
import { HandCard } from './HandCard';
import type { Card } from '@/types';

interface DragGhostLayerProps {
  scale?: number;
}

export function DragGhostLayer({ scale = 1 }: DragGhostLayerProps) {
  const ghostRef = useRef<HTMLDivElement>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const lastPayloadId = useRef<string | null>(null);
  const halfSize = useRef({ w: 40, h: 48 });

  useEffect(() => {
    // 首次挂载后测量实际尺寸
    if (ghostRef.current) {
      const rect = ghostRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        halfSize.current = { w: rect.width / 2, h: rect.height / 2 };
      }
    }

    // 订阅 DragManager — 每帧获取平滑更新
    const unsubscribe = dragManager.subscribe((x, y, rotation, isDragging, payload) => {
      if (!ghostRef.current) return;

      if (isDragging) {
        if (payload?.id && payload.id !== lastPayloadId.current) {
          lastPayloadId.current = payload.id;
          setDraggedCard(payload);
        }
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

export default DragGhostLayer;
