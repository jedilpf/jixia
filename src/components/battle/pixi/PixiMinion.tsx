import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { BattleUnit } from '../EnhancedCardBattle';

interface PixiMinionProps {
    x: number;
    y: number;
    width: number;
    height: number;
    unit: BattleUnit;
    isEnemy: boolean;
    isSelected?: boolean;
}

export function PixiMinion({ x, y, width, height, unit, isEnemy, isSelected }: PixiMinionProps) {
    // 简化的卡牌背景绘制
    const drawCardBg = (g: any) => {
        g.clear();
        // 外发光层 (选中状态)
        if (isSelected) {
            g.lineStyle(4, 0xffd700, 0.8);
            g.beginFill(isEnemy ? 0x8b0000 : 0x00008b, 0.9);
            g.drawRoundedRect(-6, -6, width + 12, height + 12, 12);
            g.endFill();
        }

        // 默认边框
        g.lineStyle(3, isEnemy ? 0xff4444 : 0x4444ff, 1);
        g.beginFill(isEnemy ? 0x5a0000 : 0x00005a, 1);
        g.drawRoundedRect(0, 0, width, height, 8);
        g.endFill();

        // 如果疲劳，加一层暗色遮罩
        if (unit.isExhausted) {
            g.beginFill(0x000000, 0.5);
            g.drawRoundedRect(0, 0, width, height, 8);
            g.endFill();
        }
    };

    // 名字样式
    const nameStyle = new TextStyle({
        fontFamily: '"STKaiti", "Kaiti", serif',
        fontSize: 16,
        fill: '#ffffff',
        fontWeight: 'bold',
        wordWrap: true,
        wordWrapWidth: width - 8,
        align: 'center'
    });

    // 数值样式
    const statStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#ffffff'
    });

    const hpStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: unit.hp < unit.maxHp ? '#ff4444' : '#44ff44' // 受伤红字，健康绿字
    });

    // 绘制数值背景圈
    const drawStatCircle = (g: any) => {
        g.clear();
        g.beginFill(0xd4a520, 1); // 金黄色背景
        g.drawCircle(0, 0, 16);
        g.endFill();
    };

    const drawHpCircle = (g: any) => {
        g.clear();
        g.beginFill(0x333333, 1); // 暗色背景
        g.drawCircle(0, 0, 16);
        g.endFill();
    };

    return (
        <Container x={x} y={y}>
            <Graphics draw={drawCardBg} />

            {/* 名字 */}
            <Text
                text={unit.name}
                style={nameStyle}
                x={width / 2}
                y={20}
                anchor={[0.5, 0.5]}
            />

            {/* 攻击力 */}
            <Container x={20} y={height - 20}>
                <Graphics draw={drawStatCircle} />
                <Text text={unit.atk.toString()} style={statStyle} anchor={[0.5, 0.5]} />
            </Container>

            {/* 生命值 */}
            <Container x={width - 20} y={height - 20}>
                <Graphics draw={drawHpCircle} />
                <Text text={unit.hp.toString()} style={hpStyle} anchor={[0.5, 0.5]} />
            </Container>

            {/* 已攻击标记 */}
            {unit.hasAttacked && (
                <Text
                    text="已攻击"
                    style={new TextStyle({ fontSize: 12, fill: '#aaaaaa' })}
                    x={width / 2}
                    y={40}
                    anchor={[0.5, 0.5]}
                />
            )}
        </Container>
    );
}
