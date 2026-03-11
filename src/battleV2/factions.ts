import type { SceneBias } from './types';

export type FactionHook =
  | 'OnJudgement'
  | 'OnTopicGain'
  | 'OnResonanceGain'
  | 'OnCycleChange'
  | 'OnEntropyEvent';

export type FactionStage = '首发核心' | '第二批' | '扩展';

export interface FactionBlueprint {
  name: string;
  source: string;
  persona: string;
  routePreference: string;
  winPath: string;
  passive: string;
  weakness: string;
  hooks: FactionHook[];
  stage: FactionStage;
}

export const ALL_HOOKS: FactionHook[] = [
  'OnJudgement',
  'OnTopicGain',
  'OnResonanceGain',
  'OnCycleChange',
  'OnEntropyEvent',
];

export const FRAMEWORK_FACTIONS: FactionBlueprint[] = [
  {
    name: '礼心殿',
    source: '礼/教化',
    persona: '先手·稳态·单路·场面',
    routePreference: '中 > 左 > 右',
    winPath: '以中路护持与议势推进稳压取胜',
    passive: '你每回合第一次在中路打出明辩时，该牌+0/+1。',
    weakness: '爆发不足，右路反应偏弱',
    hooks: ['OnJudgement', 'OnTopicGain'],
    stage: '首发核心',
  },
  {
    name: '太寂宗',
    source: '道/无为',
    persona: '后手·稳态·跨路·规则',
    routePreference: '左 = 右 > 中',
    winPath: '靠回手、减压与昼夜切换拖长局势',
    passive: '每当昼夜切换时，你可令一个友军移位或恢复1根基。',
    weakness: '正面终结慢，中路硬碰偏弱',
    hooks: ['OnCycleChange', 'OnResonanceGain'],
    stage: '首发核心',
  },
  {
    name: '衡戒廷',
    source: '法/刑名',
    persona: '后手·稳态·单路·规则',
    routePreference: '中 > 右 > 左',
    winPath: '通过惩罚规则与中路税制锁住对手',
    passive: '对手每回合第一次在中路使用术牌时，额外支付1心印。',
    weakness: '铺场慢，左路经营差',
    hooks: ['OnJudgement', 'OnTopicGain'],
    stage: '首发核心',
  },
  {
    name: '玄匠盟',
    source: '墨/工造',
    persona: '先手·稳态·单路·规则',
    routePreference: '左 > 中 > 右',
    winPath: '靠左路构筑、工造衍生与防线滚雪球',
    passive: '你在左路召唤的衍生物额外+0/+1。',
    weakness: '机动性差，怕移位拆阵',
    hooks: ['OnResonanceGain', 'OnTopicGain'],
    stage: '首发核心',
  },
  {
    name: '九阵堂',
    source: '兵/阵列',
    persona: '先手·爆发·跨路·场面',
    routePreference: '中 > 右 > 左',
    winPath: '依靠换位、集火与阵列连动瞬间改写路权',
    passive: '你每回合第一次移位友军后，该军+1辩锋直到回合结束。',
    weakness: '怕硬控和持续税制',
    hooks: ['OnTopicGain', 'OnJudgement'],
    stage: '第二批',
  },
  {
    name: '正言院',
    source: '名/论证',
    persona: '后手·爆发·单路·规则',
    routePreference: '右 > 中 > 左',
    winPath: '沉言、拆词与精确惩罚关键牌',
    passive: '对手每回合第一次触发单位文本时，你可令其本回合失效。',
    weakness: '对铺场和大身材处理吃力',
    hooks: ['OnJudgement'],
    stage: '第二批',
  },
  {
    name: '万农坊',
    source: '农/地利',
    persona: '先手·稳态·单路·场面',
    routePreference: '左 > 中 > 右',
    winPath: '左路经营、衍生铺场、后续自然溢出到中路',
    passive: '你控制左路结束回合时，额外获得1点灵势或恢复1个衍生物1根基。',
    weakness: '怕清场和高爆发右路偷袭',
    hooks: ['OnTopicGain', 'OnEntropyEvent'],
    stage: '第二批',
  },
  {
    name: '星玄院',
    source: '阴阳/观星',
    persona: '后手·稳态·跨路·规则',
    routePreference: '右 > 左 > 中',
    winPath: '观星、昼夜、延迟收益，逐步锁死资源线',
    passive: '每当昼夜切换时，观星1；若你控制右路，再得1机变。',
    weakness: '前期场面虚，怕快攻',
    hooks: ['OnCycleChange', 'OnResonanceGain'],
    stage: '第二批',
  },
  {
    name: '游策阁',
    source: '纵横/机谋',
    persona: '后手·爆发·跨路·场面',
    routePreference: '右 > 中 > 左',
    winPath: '偷路、换位、借势，靠节奏差翻盘',
    passive: '每当你改变一路控制权时，获得1机变。',
    weakness: '站场薄，怕持续防守型门派',
    hooks: ['OnJudgement', 'OnResonanceGain'],
    stage: '第二批',
  },
  {
    name: '兼综府',
    source: '杂/综采',
    persona: '先手·稳态·跨路·规则',
    routePreference: '左 = 中 = 右',
    winPath: '工具箱式应对，用混编模块应付不同场地',
    passive: '开局可额外查看本局通用池顶3张并留1张入手。',
    weakness: '上限不够尖锐，怕极端专精派',
    hooks: ALL_HOOKS,
    stage: '扩展',
  },
  {
    name: '灵枢馆',
    source: '医/调衡',
    persona: '后手·稳态·单路·场面',
    routePreference: '左 > 中 > 右',
    winPath: '靠恢复、净化与持续修复压垮对手资源',
    passive: '你每回合第一次恢复友军根基时，额外抽1后弃1。',
    weakness: '缺少硬终结，怕被跳过正面对抗',
    hooks: ['OnJudgement', 'OnEntropyEvent'],
    stage: '扩展',
  },
  {
    name: '乐律坊',
    source: '乐/节奏',
    persona: '先手·爆发·跨路·规则',
    routePreference: '中 > 右 > 左',
    winPath: '利用节拍窗、连奏与昼夜共鸣形成一波流',
    passive: '同回合打出第2张牌时，本回合你的下一个单位+1/+1。',
    weakness: '容易断节奏，怕反应暗策',
    hooks: ['OnCycleChange', 'OnResonanceGain'],
    stage: '扩展',
  },
  {
    name: '算筹阁',
    source: '算/筹算',
    persona: '后手·爆发·单路·规则',
    routePreference: '中 > 左 > 右',
    winPath: '计数、累计与精确结算形成定点爆发',
    passive: '每当你本回合使用第3张牌时，获得1声律。',
    weakness: '起手慢，怕持续干扰',
    hooks: ['OnTopicGain', 'OnJudgement'],
    stage: '扩展',
  },
  {
    name: '稗影社',
    source: '稗闻/异记',
    persona: '后手·爆发·跨路·规则',
    routePreference: '右 > 左 > 中',
    winPath: '叙事牌、异闻牌和失序事件联动制造意外局势',
    passive: '每当失序事件触发时，你可令一个单位移位或沉言一个1费敌军。',
    weakness: '稳定性差，易自爆节奏',
    hooks: ['OnEntropyEvent', 'OnCycleChange'],
    stage: '扩展',
  },
  {
    name: '方技局',
    source: '方技/炼制',
    persona: '先手·爆发·单路·规则',
    routePreference: '左 > 右 > 中',
    winPath: '药引、状态转换与短时强化形成尖峰回合',
    passive: '你每回合第一次施加状态时，目标额外获得1层同系弱状态或友方额外获得1层正状态。',
    weakness: '资源消耗快，怕长线拖控',
    hooks: ['OnResonanceGain', 'OnJudgement'],
    stage: '扩展',
  },
  {
    name: '观物台',
    source: '格物/观测',
    persona: '后手·稳态·跨路·场面',
    routePreference: '中 = 右 > 左',
    winPath: '观察、复制、适配，对不同敌派进行针对性反制',
    passive: '本局首次见到对手打出的牌型后，你抽1并本回合该类牌-1费一次。',
    weakness: '对不透明 combo 适应慢，前期压迫不足',
    hooks: ['OnTopicGain', 'OnJudgement'],
    stage: '扩展',
  },
];

export const FRAMEWORK_FACTION_BY_NAME: Record<string, FactionBlueprint> = Object.fromEntries(
  FRAMEWORK_FACTIONS.map((f) => [f.name, f])
);

export const FRAMEWORK_FACTION_NAMES = FRAMEWORK_FACTIONS.map((f) => f.name);

export const CORE_FACTION_NAMES = FRAMEWORK_FACTIONS
  .filter((f) => f.stage === '首发核心')
  .map((f) => f.name);

// 表格门派名 -> 当前 showcaseCards 门派名（用于兼容现有数据）
export const FACTION_ALIAS_TO_SHOWCASE: Record<string, string> = {
  礼心殿: '礼心殿',
  太寂宗: '归真观',
  衡戒廷: '衡戒廷',
  玄匠盟: '玄匠盟',
  九阵堂: '九阵堂',
  正言院: '名相府',
  万农坊: '万农坊',
  星玄院: '司天台',
  游策阁: '游策阁',
  兼综府: '兼采楼',
  灵枢馆: '杏林馆',
  乐律坊: '两仪署',
  算筹阁: '筹天阁',
  稗影社: '稗言社',
  方技局: '养真院',
  观物台: '天工坊',
};

export const SHOWCASE_TO_FRAMEWORK_FACTION: Record<string, string> = Object.fromEntries(
  Object.entries(FACTION_ALIAS_TO_SHOWCASE).map(([framework, showcase]) => [showcase, framework])
);

export function resolveFactionForCards(faction: string): string {
  return FACTION_ALIAS_TO_SHOWCASE[faction] ?? faction;
}

export function toFrameworkFactionName(faction: string): string {
  return FRAMEWORK_FACTION_BY_NAME[faction]?.name ?? SHOWCASE_TO_FRAMEWORK_FACTION[faction] ?? faction;
}

export function pickSceneBiasFromRoutePreference(routePreference: string): SceneBias {
  const primary = routePreference.split('>')[0]?.trim() ?? routePreference;
  if (primary.includes('左')) return 'left';
  if (primary.includes('中')) return 'center';
  if (primary.includes('右')) return 'right';
  return 'all';
}
