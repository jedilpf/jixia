import { GameState, PlayerId, CharacterInstance, PlayerState } from '@/types';
import { drawCard, createLogEntry } from './gameLogic';

// ==================== 文本效果解析与执行 ====================

// 简单的辅助类型：目标上下文
export interface TargetContext {
    game: GameState;
    sourcePlayerId: PlayerId;
    targetPlayerId?: PlayerId;
    sourceInstance?: CharacterInstance | null;
    targetInstance?: CharacterInstance | null;
}

export function parseAndExecuteSkill(
    context: TargetContext,
    skillDesc: string | undefined,
    timing: 'onPlay' | 'onStart' | 'onEnd' | 'onAttack' | 'onDamage' | 'onDraw' = 'onPlay'
): GameState {
    let newGame = JSON.parse(JSON.stringify(context.game)) as GameState;
    if (!skillDesc) return newGame;

    const sourcePlayer = context.sourcePlayerId === 'player' ? newGame.player : newGame.enemy;
    const enemyPlayerId = context.sourcePlayerId === 'player' ? 'enemy' : 'player';
    const enemyPlayer = enemyPlayerId === 'player' ? newGame.player : newGame.enemy;

    // 根据时机过滤，比如只有描述 "登场：" 才是下场时触发
    if (timing === 'onPlay') {
        // 如果文本里有"登场："、"打出："，截取对应的后半部分，或者如果没加前缀默认执行
        let effectStr = skillDesc;
        if (skillDesc.includes('登场：')) {
            const parts = skillDesc.split('登场：');
            effectStr = parts[1].split('；')[0] || parts[1]; // 简单提取第一句
        } else if (skillDesc.includes('回合') || skillDesc.includes('被动')) {
            // 如果只有回合开始/结束被动，没有登场字样，就不在 onPlay 中执行
            return newGame;
        }

        newGame = executeEffectStr(newGame, sourcePlayer, enemyPlayer, effectStr, context.sourcePlayerId);
    } 
    else if (timing === 'onStart') {
        if (skillDesc.includes('回合开始')) {
             newGame = executeEffectStr(newGame, sourcePlayer, enemyPlayer, skillDesc, context.sourcePlayerId);
        }
    }
    else if (timing === 'onEnd') {
        if (skillDesc.includes('回合结束') || skillDesc.includes('回合末')) {
             newGame = executeEffectStr(newGame, sourcePlayer, enemyPlayer, skillDesc, context.sourcePlayerId);
        }
    }

    return newGame;
}

function executeEffectStr(
    game: GameState, 
    sourcePlayer: PlayerState, 
    enemyPlayer: PlayerState, 
    effectStr: string,
    sourcePlayerId: PlayerId
): GameState {
    let logAction = '';

    // 1. 抽卡：抽X
    const drawMatch = effectStr.match(/抽(\d+)/);
    if (drawMatch) {
        const count = parseInt(drawMatch[1]);
        for (let i = 0; i < count; i++) {
            drawCard(sourcePlayer);
        }
        logAction += `触发效果，抽取了 ${count} 张牌。`;
    }

    // 2. 回复：回复X点?生命
    const healMatch = effectStr.match(/回复(\d+)点?生命?/);
    if (healMatch) {
        const amount = parseInt(healMatch[1]);
        sourcePlayer.hero.hp = Math.min(sourcePlayer.hero.maxHp, sourcePlayer.hero.hp + amount);
        logAction += `触发效果，回复了 ${amount} 点生命。`;
    }

    // 3. 护持：获得【护持X】
    const armorMatch = effectStr.match(/获得【护持(\d+)】/);
    if (armorMatch) {
        const amount = parseInt(armorMatch[1]);
        sourcePlayer.hero.buffs.huchi += amount;
        logAction += `触发效果，获得了 ${amount} 点护持。`;
    }
    
    // 4. 造成伤害：(对敌方/对敌单体)造成X点伤害
    const damageMatch = effectStr.match(/造成(\d+)点伤害/);
    if (damageMatch) {
        const amount = parseInt(damageMatch[1]);
        // 简单化处理：如果是英雄直伤
        enemyPlayer.hero.hp -= amount;
        logAction += `触发效果，对敌方主帅造成了 ${amount} 点伤害。`;
    }

    // 5. 气势：获得【气势+X】
    const auraMatch = effectStr.match(/获得【气势\+(\d+)】/);
    if (auraMatch) {
        const amount = parseInt(auraMatch[1]);
        sourcePlayer.hero.buffs.qishi += amount;
        logAction += `触发效果，获得了 ${amount} 点气势。`;
    }

    // 6. 清明：获得【清明+X】
    const qingmingMatch = effectStr.match(/获得【清明\+(\d+)】/);
    if (qingmingMatch) {
        const amount = parseInt(qingmingMatch[1]);
        sourcePlayer.hero.buffs.qingming += amount;
        logAction += `触发效果，获得了 ${amount} 层清明。`;
    }

    // 7. 净化：移除负面 / 净化
    if (effectStr.includes('净化') || effectStr.includes('移除自身全部负面') || effectStr.includes('移除全部负面')) {
        sourcePlayer.hero.debuffs.chenmo = 0;
        sourcePlayer.hero.debuffs.huaiyi = 0;
        logAction += `触发效果，净化了负面状态。`;
    }

    // 8. 怀疑：施加【怀疑+X】
    const doubtMatch = effectStr.match(/施加【怀疑\+(\d+)/);
    if (doubtMatch) {
        const amount = parseInt(doubtMatch[1]);
        enemyPlayer.hero.debuffs.huaiyi += amount;
        logAction += `触发效果，给敌方施加了 ${amount} 层怀疑。`;
    }

    if (logAction) {
        game.log.push(createLogEntry(game.turnNumber, sourcePlayerId, logAction));
    }

    return game;
}
