import { Stage, Container } from '@pixi/react';
import { BattleState } from '../EnhancedCardBattle';
import { PixiBoard } from './PixiBoard';
import { PixiVFX, triggerDamageVfx } from './PixiVFX';
import { battleEvents } from '../EnhancedCardBattle';
import { useEffect } from 'react';

interface PixiBattleStageProps {
    width: number;
    height: number;
    battle: BattleState;
    dropTargetPos: { row: 'front' | 'back', col: number } | null;
    // 添加一些动画相关的属性
}

export function PixiBattleStage({ width, height, battle, dropTargetPos }: PixiBattleStageProps) {
    const centerX = width / 2;
    // 3列战场：每一列宽96，间距8。共 96*3 + 16 = 304
    const boardStartX = centerX - 152;
    // 敌方版图的起始Top（DOM 中为 height/2 - 280）
    const enemyStartY = height / 2 - 280;
    // 玩家版图的起始Top（DOM 中为 height/2 + 16）
    const playerStartY = height / 2 + 16;

    useEffect(() => {
        const handleBattleDamage = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const { targetType, row, col, amount } = detail;
            let targetX = 0;
            let targetY = 0;

            if (targetType === 'enemy-hero') {
                targetX = 160;
                targetY = 120;
            } else if (targetType === 'player-hero') {
                targetX = 160;
                targetY = height - 160;
            } else if (targetType === 'enemy-unit') {
                const rowY = row === 'back' ? 0 : 136;
                targetX = boardStartX + (col * 104) + 96 / 2;
                targetY = enemyStartY + rowY + 128 / 2;
            } else if (targetType === 'player-unit') {
                const rowY = row === 'front' ? 0 : 136;
                targetX = boardStartX + (col * 104) + 96 / 2;
                targetY = playerStartY + rowY + 128 / 2;
            }

            triggerDamageVfx(targetX, targetY, amount);
        };

        battleEvents.addEventListener('battle-damage', handleBattleDamage);
        return () => battleEvents.removeEventListener('battle-damage', handleBattleDamage);
    }, [boardStartX, enemyStartY, playerStartY, height]);

    return (
        <Stage
            width={width}
            height={height}
            options={{ backgroundAlpha: 0, antialias: true, resolution: window.devicePixelRatio || 1 }}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }} // Canvas 不阻挡事件
        >
            <Container x={boardStartX} y={enemyStartY}>
                <PixiBoard
                    x={0}
                    y={0}
                    boardData={battle.enemy.board}
                    isEnemy={true}
                    isHidden={battle.turnStage === 'hidden'}
                />
            </Container>

            <Container x={boardStartX} y={playerStartY}>
                <PixiBoard
                    x={0}
                    y={0}
                    boardData={battle.player.board}
                    isEnemy={false}
                    selectedUnitId={battle.selectedUnit?.id}
                    dropTargetPos={dropTargetPos}
                    draggedCard={battle.draggedCard}
                />
            </Container>

            {/* 视觉特效层 (VFX) 分离在最上层 */}
            <PixiVFX />
        </Stage>
    );
}
