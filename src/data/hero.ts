import { HeroPower } from '@/types';

// ==================== 英雄技能 ====================

export function createHeroPower(): HeroPower {
    return {
        name: '召唤报告兵',
        cost: 2,
        type: 'summon',
        value: 1,
        description: '召唤一个1/1的报告兵',
        usedThisTurn: false,
    };
}
