/**
 * 18 张测试卡 - 轻异构三路版 V0.1
 * 
 * 结构：
 * - 左路倾向 6 张（立势 - 经营）
 * - 中路倾向 6 张（争衡 - 胜利）
 * - 右路倾向 6 张（机辩 - 技巧）
 */

import { DebateCard } from './types';

export const TEST_CARDS_V01: DebateCard[] = [
  // ═══════════════════════════════════════════════════════════════
  // 左路倾向【立势】- 经营、资源、持续收益
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'left-001',
    name: '守拙弟子',
    type: '门客',
    cost: 1,
    effectKind: 'summon_front',
    effectValue: 1,
    power: 1,
    hp: 3,
    description: '先陈：若置于左路，获得 +1 根基',
    lanePreference: 'left',
    art: 'assets/cards/left-001.png',
  },
  {
    id: 'left-002',
    name: '积学侍读',
    type: '门客',
    cost: 2,
    effectKind: 'summon_front',
    effectValue: 2,
    power: 1,
    hp: 4,
    description: '终论：若你控制左路，获得 1 心证',
    lanePreference: 'left',
    art: 'assets/cards/left-002.png',
  },
  {
    id: 'left-003',
    name: '藏经阁主',
    type: '门客',
    cost: 3,
    effectKind: 'summon_back',
    effectValue: 3,
    power: 3,
    hp: 4,
    description: '先陈：若置于左路，抽 1 张牌',
    lanePreference: 'left',
    art: 'assets/cards/left-003.png',
  },
  {
    id: 'left-004',
    name: '厚积薄发',
    type: '策术',
    cost: 2,
    effectKind: 'zhengli',
    effectValue: 0,
    description: '为一个友军 +0/+1，并使其获得"终论：若你控制左路，+2 议势"',
    lanePreference: 'left',
    art: 'assets/cards/left-004.png',
  },
  {
    id: 'left-005',
    name: '深耕细作',
    type: '策术',
    cost: 3,
    effectKind: 'shield',
    effectValue: 3,
    description: '为一个友军 +0/+3；若其在左路，你获得 1 心证',
    lanePreference: 'left',
    art: 'assets/cards/left-005.png',
  },
  {
    id: 'left-006',
    name: '学富五车',
    type: '玄章',
    cost: 4,
    effectKind: 'draw',
    effectValue: 2,
    description: '抽 2 张牌；若你控制左路，获得 1 点灵势',
    lanePreference: 'left',
    art: 'assets/cards/left-006.png',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 中路倾向【争衡】- 胜利、对抗、站场
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'center-001',
    name: '争锋弟子',
    type: '门客',
    cost: 1,
    effectKind: 'summon_front',
    effectValue: 1,
    power: 2,
    hp: 1,
    description: '先陈：若置于中路，获得 +0/+1',
    lanePreference: 'center',
    art: 'assets/cards/center-001.png',
  },
  {
    id: 'center-002',
    name: '主辩侍者',
    type: '门客',
    cost: 2,
    effectKind: 'summon_front',
    effectValue: 2,
    power: 2,
    hp: 3,
    description: '护持；位于中路时，击败敌军后额外 +1 议势',
    lanePreference: 'center',
    art: 'assets/cards/center-002.png',
  },
  {
    id: 'center-003',
    name: '执正司仪',
    type: '门客',
    cost: 3,
    effectKind: 'summon_front',
    effectValue: 3,
    power: 3,
    hp: 4,
    description: '先陈：若你控制中路，使一个敌军 -1 辩锋',
    lanePreference: 'center',
    art: 'assets/cards/center-003.png',
  },
  {
    id: 'center-004',
    name: '据理力争',
    type: '策术',
    cost: 2,
    effectKind: 'damage',
    effectValue: 2,
    description: '对一个敌军造成 2 点伤害；若其在中路，改为造成 3 点',
    lanePreference: 'center',
    art: 'assets/cards/center-004.png',
  },
  {
    id: 'center-005',
    name: '中流砥柱',
    type: '策术',
    cost: 3,
    effectKind: 'shield',
    effectValue: 2,
    description: '为一个友军 +1/+1；若其在中路，改为 +2/+2',
    lanePreference: 'center',
    art: 'assets/cards/center-005.png',
  },
  {
    id: 'center-006',
    name: '一锤定音',
    type: '玄章',
    cost: 5,
    effectKind: 'damage',
    effectValue: 5,
    description: '消灭中路一个辩锋 4 或以下的敌军',
    lanePreference: 'center',
    art: 'assets/cards/center-006.png',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 右路倾向【机辩】- 技巧、减费、机动
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'right-001',
    name: '灵动机士',
    type: '门客',
    cost: 1,
    effectKind: 'summon_front',
    effectValue: 1,
    power: 1,
    hp: 2,
    description: '先陈：可移位到相邻路',
    lanePreference: 'right',
    art: 'assets/cards/right-001.png',
  },
  {
    id: 'right-002',
    name: '诡辩散人',
    type: '门客',
    cost: 2,
    effectKind: 'summon_back',
    effectValue: 2,
    power: 2,
    hp: 2,
    description: '先陈：若位于右路，本回合不能被敌方术牌指定',
    lanePreference: 'right',
    art: 'assets/cards/right-002.png',
  },
  {
    id: 'right-003',
    name: '机变谋士',
    type: '门客',
    cost: 3,
    effectKind: 'summon_back',
    effectValue: 3,
    power: 2,
    hp: 4,
    description: '先陈：若你有机变，获得 +1 辩锋',
    lanePreference: 'right',
    art: 'assets/cards/right-003.png',
  },
  {
    id: 'right-004',
    name: '反诘先机',
    type: '反诘',
    cost: 1,
    effectKind: 'damage',
    effectValue: 1,
    description: '当敌军进场时，对其造成 1 点伤害；若你有机变，改为造成 2 点',
    lanePreference: 'right',
    art: 'assets/cards/right-004.png',
  },
  {
    id: 'right-005',
    name: '奇策巧思',
    type: '策术',
    cost: 2,
    effectKind: 'zhengli',
    effectValue: 0,
    description: '获得 1 点机变；你的下一张策术或反诘费用 -1',
    lanePreference: 'right',
    art: 'assets/cards/right-005.png',
  },
  {
    id: 'right-006',
    name: '移形换影',
    type: '策术',
    cost: 3,
    effectKind: 'summon_front',
    effectValue: 0,
    description: '将两个友军交换位置；每移动 1 个，该单位 +1/+1',
    lanePreference: 'right',
    art: 'assets/cards/right-006.png',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 新增核心卡牌（根据平衡性评估建议）
  // ═══════════════════════════════════════════════════════════════
  
  // 左路核心 - 4 费 3/5
  {
    id: 'left-core-001',
    name: '博学士长',
    type: '门客',
    cost: 4,
    effectKind: 'summon_back',
    effectValue: 4,
    power: 3,
    hp: 5,
    description: '你的其他左路友军获得 +1/+1',
    lanePreference: 'left',
    art: 'assets/cards/left-core-001.png',
  },
  
  // 中路刺客 - 3 费 4/2
  {
    id: 'center-assassin-001',
    name: '破论刺客',
    type: '门客',
    cost: 3,
    effectKind: 'summon_front',
    effectValue: 3,
    power: 4,
    hp: 2,
    description: '先陈：对中路一个敌军造成 2 点伤害',
    lanePreference: 'center',
    art: 'assets/cards/center-assassin-001.png',
  },
  
  // 右路爆发 - 2 费直伤
  {
    id: 'right-burst-001',
    name: '机锋毕露',
    type: '策术',
    cost: 2,
    effectKind: 'damage',
    effectValue: 3,
    description: '对一个敌军造成 3 点伤害；消耗 1 点机变',
    lanePreference: 'right',
    art: 'assets/cards/right-burst-001.png',
  },

  // ═══════════════════════════════════════════════════════════════
  // 第八门派：纵横家 - 外交、联盟、策略
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'zongheng-001',
    name: '合纵之策',
    type: '策术',
    cost: 2,
    effectKind: 'zhengli',
    effectValue: 2,
    description: '选择一路，该路所有友军获得 +1/+1',
    lanePreference: 'center',
    faction: '纵横家',
    art: 'assets/cards/合纵之策.png',
  },
  {
    id: 'zongheng-002',
    name: '连横之契',
    type: '策术',
    cost: 3,
    effectKind: 'shield',
    effectValue: 3,
    description: '为一个友军 +0/+3；若你控制中路，再抽 1 张牌',
    lanePreference: 'center',
    faction: '纵横家',
    art: 'assets/cards/连横之契.png',
  },
  {
    id: 'zongheng-003',
    name: '游说之辞',
    type: '反诘',
    cost: 1,
    effectKind: 'damage',
    effectValue: 2,
    description: '当敌军攻击时，使其 -1 辩锋',
    lanePreference: 'right',
    faction: '纵横家',
    art: 'assets/cards/游说之辞.png',
  },
  {
    id: 'zongheng-004',
    name: '盟书',
    type: '玄章',
    cost: 4,
    effectKind: 'draw',
    effectValue: 2,
    description: '抽 2 张牌；本回合你控制的每一路使你获得 1 心证',
    lanePreference: 'center',
    faction: '纵横家',
    art: 'assets/cards/盟书.png',
  },
  {
    id: 'zongheng-005',
    name: '八面逢源',
    type: '门客',
    cost: 3,
    effectKind: 'summon_front',
    effectValue: 3,
    power: 2,
    hp: 4,
    description: '先陈：若你控制至少两路，获得 +1/+1',
    lanePreference: 'center',
    faction: '纵横家',
    art: 'assets/cards/八面逢源.png',
  },

  // ═══════════════════════════════════════════════════════════════
  // 第九门派：农家 - 资源、生长、丰收
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'nongjia-001',
    name: '春耕起垄',
    type: '策术',
    cost: 1,
    effectKind: 'zhengli',
    effectValue: 1,
    description: '获得 1 点整理；下回合开始时抽 1 张牌',
    lanePreference: 'left',
    faction: '农家',
    art: 'assets/cards/春耕起垄.png',
  },
  {
    id: 'nongjia-002',
    name: '灌渠饮水',
    type: '策术',
    cost: 2,
    effectKind: 'shield',
    effectValue: 2,
    description: '为一个友军 +0/+2；若其在左路，再 +1/+1',
    lanePreference: 'left',
    faction: '农家',
    art: 'assets/cards/灌渠饮水.png',
  },
  {
    id: 'nongjia-003',
    name: '田舍长者',
    type: '门客',
    cost: 2,
    effectKind: 'summon_back',
    effectValue: 2,
    power: 1,
    hp: 4,
    description: '终论：若你控制左路，获得 1 心证',
    lanePreference: 'left',
    faction: '农家',
    art: 'assets/cards/田舍长者.png',
  },
  {
    id: 'nongjia-004',
    name: '五谷丰登',
    type: '玄章',
    cost: 5,
    effectKind: 'draw',
    effectValue: 3,
    description: '抽 3 张牌；你每控制一路，费用 -1',
    lanePreference: 'left',
    faction: '农家',
    art: 'assets/cards/五谷丰登.png',
  },
  {
    id: 'nongjia-005',
    name: '谷仓封藏',
    type: '策术',
    cost: 3,
    effectKind: 'shield',
    effectValue: 4,
    description: '为一个友军 +0/+4；若你控制左路，使其获得"护持"',
    lanePreference: 'left',
    faction: '农家',
    art: 'assets/cards/谷仓封藏.png',
  },
];

/**
 * 获取左路倾向卡牌
 */
export function getLeftLaneCards(): DebateCard[] {
  return TEST_CARDS_V01.filter(card => card.lanePreference === 'left');
}

/**
 * 获取中路倾向卡牌
 */
export function getCenterLaneCards(): DebateCard[] {
  return TEST_CARDS_V01.filter(card => card.lanePreference === 'center');
}

/**
 * 获取右路倾向卡牌
 */
export function getRightLaneCards(): DebateCard[] {
  return TEST_CARDS_V01.filter(card => card.lanePreference === 'right');
}

/**
 * 创建测试卡组（每路 6 张，共 18 张）
 */
export function createTestDeck(): DebateCard[] {
  // 每组 6 张，洗牌后返回
  const leftCards = getLeftLaneCards();
  const centerCards = getCenterLaneCards();
  const rightCards = getRightLaneCards();
  
  // 简单洗牌
  const shuffle = (cards: DebateCard[]) => {
    const result = [...cards];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  
  return [
    ...shuffle(leftCards),
    ...shuffle(centerCards),
    ...shuffle(rightCards),
  ];
}
