import { Container, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { useEffect, useState } from 'react';

interface DamageNumber {
    id: string;
    x: number;
    y: number;
    amount: number;
    createdAt: number;
}


// 模拟事件总线来接收来自外层的伤害特效请求
export const vfxEvents = new EventTarget();

export function triggerDamageVfx(x: number, y: number, amount: number) {
    const event = new CustomEvent('pixi-damage', { detail: { x, y, amount } });
    vfxEvents.dispatchEvent(event);
}

export function PixiVFX() {
    const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);

    useEffect(() => {
        const handleDamage = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const newDmg: DamageNumber = {
                id: Math.random().toString(36).substring(7),
                x: detail.x,
                y: detail.y,
                amount: detail.amount,
                createdAt: Date.now()
            };
            setDamageNumbers(prev => [...prev, newDmg]);

            // 自动清理
            setTimeout(() => {
                setDamageNumbers(prev => prev.filter(d => d.id !== newDmg.id));
            }, 1000);
        };

        vfxEvents.addEventListener('pixi-damage', handleDamage);
        return () => vfxEvents.removeEventListener('pixi-damage', handleDamage);
    }, []);

    const dmgStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: '#ff0000'
    });

    return (
        <Container>
            {damageNumbers.map(dmg => {
                const age = Date.now() - dmg.createdAt;
                const progress = age / 1000;
                // 简单的弹跳漂浮动画
                const currentY = dmg.y - (progress * 50) - Math.abs(Math.sin(progress * Math.PI * 2) * 20);
                const currentAlpha = 1 - Math.pow(progress, 3);

                return (
                    <Text
                        key={dmg.id}
                        text={`-${dmg.amount}`}
                        style={dmgStyle}
                        x={dmg.x}
                        y={currentY}
                        alpha={currentAlpha}
                        anchor={[0.5, 0.5]}
                    />
                );
            })}
        </Container>
    );
}
