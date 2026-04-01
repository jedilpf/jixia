import { GameState } from '@/types';
import {
    canUseHeroPower,
    activateHeroPower,
    canPlayCard,
    playCard,
    canHeroAttack,
    heroAttack,
    canAttack,
    performAttack,
    getEmptySlotCenterOut,
    checkWinner,
} from './gameLogic';

type BoardPos = { row: 'front' | 'back'; col: number };

// AI 返回完整行动序列
export function getEnemyActions(game: GameState): { type: string; data?: Record<string, unknown> }[] {
    const actions: { type: string; data?: Record<string, unknown> }[] = [];
    let simGame = JSON.parse(JSON.stringify(game)) as GameState;
    const enemy = simGame.enemy;
    const MAX_ACTIONS = 20;

    for (let step = 0; step < MAX_ACTIONS; step++) {
        // 使用英雄技能
        if (canUseHeroPower(enemy)) {
            actions.push({ type: 'hero_power' });
            const result = activateHeroPower(simGame, 'enemy');
            if (result) simGame = result;
            continue;
        }

        // 召唤随从（最便宜的先出）
        let playedCard = false;
        const sortedHand = enemy.hand
            .map((c, i) => ({ card: c, index: i }))
            .filter(({ card }) => card.type === 'character' && canPlayCard(enemy, card))
            .sort((a, b) => a.card.cost - b.card.cost);

        for (const { index } of sortedHand) {
            const emptySlot = getEmptySlotCenterOut(enemy.board);
            if (emptySlot !== null) {
                actions.push({ type: 'play_card', data: { handIndex: index, boardPos: emptySlot } });
                const result = playCard(simGame, 'enemy', index, emptySlot);
                if (result) { simGame = result; playedCard = true; break; }
            }
        }
        if (playedCard) continue;

        // 英雄攻击
        if (canHeroAttack(simGame.enemy.hero)) {
            actions.push({ type: 'hero_attack', data: { targetPos: 'hero' } });
            const result = heroAttack(simGame, 'enemy', 'player', 'hero');
            if (result) simGame = result;
            if (checkWinner(simGame)) break;
            continue;
        }

        // 随从攻击（攻击力高的先攻击）
        let attacked = false;
        const attackers: { minion: NonNullable<(typeof simGame.enemy.board.front)[0]>, pos: BoardPos }[] = [];
        for (const row of ['front', 'back'] as const) {
            const rowArray = row === 'front' ? simGame.enemy.board.front : simGame.enemy.board.back;
            for (let col = 0; col < 3; col++) {
                const m = rowArray[col];
                if (m && canAttack(m)) {
                    attackers.push({ minion: m, pos: { row, col } });
                }
            }
        }
        attackers.sort((a, b) => (b.minion?.atk || 0) - (a.minion?.atk || 0));

        for (const { pos } of attackers) {
            // 若玩家有前排随从，必须先攻击前排（不能绕过直打英雄）
            const playerFront = simGame.player.board.front;
            const hasFrontMinions = playerFront.some(m => m !== null);

            let targetPos: { row: 'front' | 'back'; col: number } | 'hero';
            if (hasFrontMinions) {
                // 优先攻击攻击力最高的前排随从
                let bestCol = -1;
                let bestAtk = -1;
                for (let c = 0; c < 3; c++) {
                    const m = playerFront[c];
                    if (m && m.atk > bestAtk) { bestAtk = m.atk; bestCol = c; }
                }
                if (bestCol === -1) continue;
                targetPos = { row: 'front', col: bestCol };
            } else {
                targetPos = 'hero';
            }

            actions.push({ type: 'attack', data: { attackerPos: pos, targetPos } });
            const result = performAttack(simGame, 'enemy', pos, 'player', targetPos);
            if (result) { simGame = result; attacked = true; }
            if (checkWinner(simGame)) break;
        }
        if (attacked) continue;

        // 没有更多行动了
        break;
    }

    actions.push({ type: 'end_turn' });
    return actions;
}

// 保留旧接口兼容
export function getEnemyAction(game: GameState): { type: string; data?: Record<string, unknown> } | null {
    const enemy = game.enemy;

    if (canUseHeroPower(enemy)) {
        return { type: 'hero_power' };
    }

    for (let i = 0; i < enemy.hand.length; i++) {
        const card = enemy.hand[i];
        if (card.type === 'character' && canPlayCard(enemy, card)) {
            const emptySlot = getEmptySlotCenterOut(enemy.board);
            if (emptySlot !== null) {
                return { type: 'play_card', data: { handIndex: i, boardPos: emptySlot } };
            }
        }
    }

    if (canHeroAttack(enemy.hero)) {
        return { type: 'hero_attack', data: { targetPos: 'hero' } };
    }

    const playerFront = game.player.board.front;
    const hasFrontMinions = playerFront.some(m => m !== null);
    for (const row of ['front', 'back'] as const) {
        const rowArray = row === 'front' ? enemy.board.front : enemy.board.back;
        for (let col = 0; col < 3; col++) {
            const minion = rowArray[col];
            if (minion && canAttack(minion)) {
                if (hasFrontMinions) {
                    let bestCol = -1, bestAtk = -1;
                    for (let c = 0; c < 3; c++) {
                        const m = playerFront[c];
                        if (m && m.atk > bestAtk) { bestAtk = m.atk; bestCol = c; }
                    }
                    if (bestCol >= 0) {
                        return { type: 'attack', data: { attackerPos: { row, col }, targetPos: { row: 'front', col: bestCol } } };
                    }
                }
                return { type: 'attack', data: { attackerPos: { row, col }, targetPos: 'hero' } };
            }
        }
    }

    return { type: 'end_turn' };
}
