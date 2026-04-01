import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { BattleHero } from '../EnhancedCardBattle';

interface PixiHeroProps {
    x: number;
    y: number;
    hero: BattleHero;
    isPlayer: boolean;
    canAttack?: boolean;
    isTargetable?: boolean;
}

export function PixiHero({ x, y, hero, isPlayer, canAttack, isTargetable }: PixiHeroProps) {
    const HERO_WIDTH = 128;
    const HERO_HEIGHT = 160;

    const drawHeroBg = (g: any) => {
        g.clear();

        // 目标高亮
        if (isTargetable) {
            g.lineStyle(4, 0xff4444, 0.8);
            g.beginFill(isPlayer ? 0x00008b : 0x8b0000, 0.9);
            g.drawRoundedRect(-6, -6, HERO_WIDTH + 12, HERO_HEIGHT + 12, 16);
            g.endFill();
        } else if (canAttack) {
            g.lineStyle(4, 0xffd700, 0.8);
            g.beginFill(isPlayer ? 0x00008b : 0x8b0000, 0.9);
            g.drawRoundedRect(-6, -6, HERO_WIDTH + 12, HERO_HEIGHT + 12, 16);
            g.endFill();
        }

        g.lineStyle(4, isPlayer ? 0x4444ff : 0xff4444, 1);
        g.beginFill(isPlayer ? 0x00005a : 0x5a0000, 1);
        g.drawRoundedRect(0, 0, HERO_WIDTH, HERO_HEIGHT, 12);
        g.endFill();
    };

    const drawStatCircle = (g: any, color: number) => {
        g.clear();
        g.beginFill(color, 1);
        g.drawCircle(0, 0, 18);
        g.endFill();
    };

    const statStyle = new TextStyle({
        fontFamily: 'Arial', fontSize: 18, fontWeight: 'bold', fill: '#ffffff'
    });

    return (
        <Container x={x} y={y}>
            <Graphics draw={drawHeroBg} />

            {/* 简单的文字代替头像 */}
            <Text
                text={isPlayer ? '🧙‍♂️' : '👹'}
                style={new TextStyle({ fontSize: 60 })}
                x={HERO_WIDTH / 2}
                y={HERO_HEIGHT / 2 - 10}
                anchor={[0.5, 0.5]}
            />

            {/* 血量 */}
            <Container x={HERO_WIDTH / 2} y={HERO_HEIGHT - 20}>
                <Graphics draw={(g) => drawStatCircle(g, 0x333333)} />
                <Text
                    text={`${hero.hp}`}
                    style={new TextStyle({ ...statStyle, fill: hero.hp <= 15 ? '#ff4444' : '#44ff44' })}
                    anchor={[0.5, 0.5]}
                />
            </Container>

            {/* 法力 */}
            {isPlayer && (
                <Container x={HERO_WIDTH - 20} y={20}>
                    <Graphics draw={(g) => drawStatCircle(g, 0x0000ff)} />
                    <Text text={`${hero.mana}`} style={statStyle} anchor={[0.5, 0.5]} />
                </Container>
            )}

            {/* 护甲 */}
            {hero.armor > 0 && (
                <Container x={20} y={20}>
                    <Graphics draw={(g) => drawStatCircle(g, 0x888888)} />
                    <Text text={`${hero.armor}`} style={statStyle} anchor={[0.5, 0.5]} />
                </Container>
            )}

            {/* 武器 */}
            {hero.weapon && (
                <Container x={HERO_WIDTH / 2} y={HERO_HEIGHT + 10}>
                    <Graphics draw={(g) => { g.clear(); g.beginFill(0xd4a520, 1); g.drawRoundedRect(-30, -10, 60, 20, 10); g.endFill(); }} />
                    <Text text={`⚔️ ${hero.weapon.atk}`} style={new TextStyle({ fontSize: 14, fill: '#ffffff', fontWeight: 'bold' })} anchor={[0.5, 0.5]} />
                </Container>
            )}
        </Container>
    );
}
