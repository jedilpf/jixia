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
    oneLine: '标准环境，适合新手',
    passive: '公议初启：双方开局获得 1 护印',
    bias: '立言有据：首次立论且未着书时，获得 1 证立',
    skill: '公议（一次）：第一张反诘费用 -1（待实装按钮）',
  },
  {
    id: 'huode',
    name: '火德论坛',
    oneLine: '进攻环境，强调打穿一路',
    passive: '烈辩先声：前席争鸣辩锋 +1',
    bias: '穿席余烬：击破前席且有溢出时，额外造成 1 心证伤害',
    skill: '焚势（一次）：指定一路本回合不能被护印完全吸收（待实装按钮）',
  },
  {
    id: 'cangshu',
    name: '藏书秘阁',
    oneLine: '着书成长，后期兑现',
    passive: '秘阁藏卷：首次着书额外获得 1 护印',
    bias: '文脉深藏：第 2 次着书起，每次着书回复 1 心证',
    skill: '校书（一次）：立即着书，再抽 1 弃 1（待实装按钮）',
  },
  {
    id: 'guanxing',
    name: '玄机观星台',
    oneLine: '信息差与暗策环境',
    passive: '星轨照影：暗策锁定后可见对手暗策牌类',
    bias: '天机偏衡：每回合首次打出暗策时，获得 1 护印',
    skill: '窥衡（一次）：查看对手本回合暗策并强化反诘（待实装按钮）',
  },
];

export const ARENA_BY_ID: Record<ArenaId, ArenaDefinition> = ARENAS.reduce(
  (acc, arena) => {
    acc[arena.id] = arena;
    return acc;
  },
  {} as Record<ArenaId, ArenaDefinition>
);
