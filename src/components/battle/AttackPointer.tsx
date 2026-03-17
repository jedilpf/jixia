import { useEffect, useRef } from 'react';
import { dragManager } from './DragManager';

interface AttackPointerProps {
    /** 攻击起点 — 屏幕坐标 (clientX/Y) */
    fromScreenX: number;
    fromScreenY: number;
}

/**
 * 攻击连线瞄准器
 *
 * 性能设计：
 * - 通过 DragManager 订阅 RAF 回调
 * - 使用 transform: rotate() 实现方向旋转
 * - width 动态设置长度
 * - 全程屏幕坐标
 */
export function AttackPointer({ fromScreenX, fromScreenY }: AttackPointerProps) {
    const pointerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 订阅全局 DragManager — x/y 均为屏幕坐标
        const unsubscribe = dragManager.subscribe((x, y, _, isDragging) => {
            if (!pointerRef.current) return;

            if (isDragging) {
                const dx = x - fromScreenX;
                const dy = y - fromScreenY;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                pointerRef.current.style.width = `${length}px`;
                pointerRef.current.style.transform = `rotate(${angle.toFixed(1)}deg)`;
                pointerRef.current.style.opacity = '1';
            } else {
                pointerRef.current.style.opacity = '0';
            }
        });

        return () => unsubscribe();
    }, [fromScreenX, fromScreenY]);

    return (
        <div
            ref={pointerRef}
            className="fixed pointer-events-none z-40"
            style={{
                left: `${fromScreenX}px`,
                top: `${fromScreenY}px`,
                height: '4px',
                width: 0,
                opacity: 0,
                transformOrigin: '0 50%',
                willChange: 'width, transform',
            }}
        >
            <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <div
                className="absolute right-0 top-1/2 transform -translate-y-1/2"
                style={{
                    width: 0,
                    height: 0,
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderLeft: '12px solid #ef4444',
                }}
            />
        </div>
    );
}

export default AttackPointer;
