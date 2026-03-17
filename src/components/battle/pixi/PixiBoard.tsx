import { Container, Graphics, Text } from '@pixi/react';
import { BattleUnit } from '../EnhancedCardBattle';
import { PixiMinion } from './PixiMinion';

interface PixiBoardProps {
    x: number;
    y: number;
    boardData: { front: (BattleUnit | null)[], back: (BattleUnit | null)[] };
    isEnemy: boolean;
    selectedUnitId?: string;
    dropTargetPos?: { row: 'front' | 'back', col: number } | null;
    draggedCard?: any | null; // using any to avoid importing Card if it causes circular deps, or import it.
    isHidden?: boolean;
}

export function PixiBoard({ x, y, boardData, isEnemy, selectedUnitId, dropTargetPos, draggedCard, isHidden }: PixiBoardProps) {
    const SLOT_WIDTH = 96;  // w-24
    const SLOT_HEIGHT = 128; // h-32
    const SLOT_GAP = 8;      // gap-2

    // 按照 DOM 布局的顺序 (0: 前排, 1: 后排)
    // 如果是玩家，前排在上面 (y=0)，后排在下面 (y=SLOT_HEIGHT+GAP)
    // 如果是敌方，后排在上面 (y=0)，前排在下面 (y=SLOT_HEIGHT+GAP)

    const drawSlotBackground = (g: any, isDropTarget: boolean) => {
        g.clear();
        if (isDropTarget) {
            g.lineStyle(2, 0x44ff44, 1);
            g.beginFill(0x44ff44, 0.3);
        } else {
            g.lineStyle(2, 0x666666, 0.5); // 虚线效果在 PIXI.Graphics 较难原生实现，此处用半透明实线代替
            g.beginFill(0x000000, 0.2);
        }
        g.drawRoundedRect(0, 0, SLOT_WIDTH, SLOT_HEIGHT, 8);
        g.endFill();
    };

    const drawHiddenCard = (g: any) => {
        g.clear();
        g.lineStyle(2, 0xffaa00, 1);
        g.beginFill(0x222222, 1);
        g.drawRoundedRect(0, 0, SLOT_WIDTH, SLOT_HEIGHT, 8);
        g.endFill();

        // 中间的问号背景图案
        g.lineStyle(2, 0x444444, 1);
        g.beginFill(0x111111, 1);
        g.drawCircle(SLOT_WIDTH / 2, SLOT_HEIGHT / 2, 24);
        g.endFill();
    };

    return (
        <Container x={x} y={y}>
            {/* 渲染两排 */}
            {(['front', 'back'] as const).map((rowName) => {
                // 对于玩家：front(上面), back(下面)
                // 对于敌方：back(上面), front(下面)

                // 计算 Y 坐标偏移
                let yOffset = 0;
                if (isEnemy) {
                    yOffset = rowName === 'back' ? 0 : SLOT_HEIGHT + SLOT_GAP; // 后排在上
                } else {
                    yOffset = rowName === 'front' ? 0 : SLOT_HEIGHT + SLOT_GAP; // 前排在上
                }

                const rowData = boardData[rowName];

                return (
                    <Container key={`row-${rowName}`} y={yOffset}>
                        {/* 渲染每排的3个列 */}
                        {[0, 1, 2].map((colIndex) => {
                            const xOffset = colIndex * (SLOT_WIDTH + SLOT_GAP);
                            const unit = rowData[colIndex];
                            const isDropTarget = dropTargetPos?.row === rowName && dropTargetPos?.col === colIndex;

                            return (
                                <Container key={`slot-${rowName}-${colIndex}`} x={xOffset}>
                                    {/* 空槽位背景 */}
                                    {!unit && (
                                        <Graphics draw={(g) => drawSlotBackground(g, isDropTarget)} />
                                    )}

                                    {/* 拖拽中的幽灵预览 */}
                                    {!unit && isDropTarget && draggedCard?.type === 'character' && (
                                        <Container alpha={0.6}>
                                            <PixiMinion
                                                x={0}
                                                y={0}
                                                width={SLOT_WIDTH}
                                                height={SLOT_HEIGHT}
                                                unit={{
                                                    id: 'ghost',
                                                    cardId: draggedCard.id,
                                                    name: draggedCard.name,
                                                    atk: draggedCard.atk || 0,
                                                    hp: draggedCard.hp || 0,
                                                    maxHp: draggedCard.hp || 0,
                                                    cost: draggedCard.cost,
                                                    hasAttacked: false,
                                                    isExhausted: true, // 刚放下去的幽灵展示为力竭颜色更合适
                                                    buffs: [],
                                                    position: { row: rowName as 'front' | 'back', col: colIndex },
                                                    owner: 'player'
                                                }}
                                                isEnemy={false}
                                            />
                                        </Container>
                                    )}

                                    {/* 随从实体 */}
                                    {unit && !isHidden && (
                                        <PixiMinion
                                            x={0}
                                            y={0}
                                            width={SLOT_WIDTH}
                                            height={SLOT_HEIGHT}
                                            unit={unit}
                                            isEnemy={isEnemy}
                                            isSelected={unit.id === selectedUnitId}
                                        />
                                    )}

                                    {/* 隐藏状态的背面 */}
                                    {unit && isHidden && (
                                        <Container>
                                            <Graphics draw={drawHiddenCard} />
                                            {/* 可以直接原生地放个问号 */}
                                            <Text
                                                text="?"
                                                style={{ fontFamily: 'Arial', fontSize: 32, fill: '#ffaa00', fontWeight: 'bold' } as any}
                                                x={SLOT_WIDTH / 2}
                                                y={SLOT_HEIGHT / 2}
                                                anchor={[0.5, 0.5]}
                                            />
                                        </Container>
                                    )}
                                </Container>
                            );
                        })}
                    </Container>
                );
            })}
        </Container>
    );
}
