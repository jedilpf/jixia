import { ArenaId } from './types';

export interface ArenaDefinition {
  id: ArenaId;
  name: string;
  oneLine: string;
  passive: string;
  bias: string;
  skill: string;
}

export const ARENAS: ArenaDefinition[] = [
  {
    id: 'jixia',
    name: '稷下学宫',
    oneLine: '标准战场，适合入门',
    passive: '开局双方各得 1 层护盾',
    bias: '首次立论额外得 1 筹码',
    skill: '首张反诘牌费用减 1',
  },
  {
    id: 'huode',
    name: '火德论坛',
    oneLine: '进攻战场，伤害为王',
    passive: '前席攻击时伤害 +1',
    bias: '击破敌人后额外造成 1 点伤害',
    skill: '指定一路本回合伤害无法被护盾吸收',
  },
  {
    id: 'cangshu',
    name: '藏书秘阁',
    oneLine: '防守战场，持久作战',
    passive: '首次着书额外获得 1 层护盾',
    bias: '第二次着书起每次回复 1 点生命',
    skill: '立即着书并抽 1 张牌',
  },
  {
    id: 'guanxing',
    name: '玄机观星台',
    oneLine: '暗策战场，信息为王',
    passive: '锁定暗策后可看到对手暗策类型',
    bias: '每回合首张暗策获得 1 层护盾',
    skill: '查看对手本回合暗策牌',
  },
];

export const ARENA_BY_ID: Record<ArenaId, ArenaDefinition> = ARENAS.reduce(
  (acc, arena) => {
    acc[arena.id] = arena;
    return acc;
  },
  {} as Record<ArenaId, ArenaDefinition>
);
