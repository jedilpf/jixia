export interface LevelAbility {
  type: 'unlock_card' | 'unlock_hero_power' | 'unlock_skill' | 'stat_boost' | 'bonus_reward';
  name: string;
  description: string;
  icon?: string;
  value?: number;
}

export interface LevelCondition {
  type: 'win_games' | 'play_games' | 'deal_damage' | 'use_cards' | 'earn_exp' | 'collect_cards';
  name: string;
  description: string;
  target: number;
  current?: number;
}

export interface LevelReward {
  type: 'gold' | 'gems' | 'card_pack' | 'avatar' | 'title' | 'border' | 'card' | 'feature_unlock';
  name: string;
  description: string;
  icon?: string;
  value?: number;
}

export interface LevelDetail {
  minLevel: number;
  maxLevel: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  description: string;
  conditions: LevelCondition[];
  abilities: LevelAbility[];
  rewards: LevelReward[];
}

export interface LevelRank {
  minLevel: number;
  maxLevel: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
}

export const LEVEL_RANKS: LevelRank[] = [
  { minLevel: 1, maxLevel: 9, title: '初窥门径', subtitle: '初入稷下', color: '#8B7355', icon: '📖' },
  { minLevel: 10, maxLevel: 19, title: '入门弟子', subtitle: '小有所成', color: '#9EAD8A', icon: '🎓' },
  { minLevel: 20, maxLevel: 29, title: '书院学子', subtitle: '崭露头角', color: '#C9A063', icon: '📜' },
  { minLevel: 30, maxLevel: 39, title: '论道秀才', subtitle: '名动四方', color: '#C06F6F', icon: '🎤' },
  { minLevel: 40, maxLevel: 49, title: '百家智者', subtitle: '执掌一派', color: '#9C88A8', icon: '🏆' },
  { minLevel: 50, maxLevel: 50, title: '稷下宗师', subtitle: '天下无双', color: '#d4a520', icon: '👑' },
];

export const LEVEL_DETAILS: LevelDetail[] = [
  {
    minLevel: 1,
    maxLevel: 9,
    title: '初窥门径',
    subtitle: '初入稷下',
    color: '#8B7355',
    icon: '📖',
    description: '初入稷下学宫，开始你的百家争鸣之路。通过基础对战积累经验，熟悉游戏规则。',
    conditions: [
      { type: 'play_games', name: '完成对战', description: '参与任意对战', target: 1 },
      { type: 'earn_exp', name: '积累经验', description: '获得初始经验', target: 100 },
    ],
    abilities: [
      { type: 'stat_boost', name: '初始属性', description: '基础生命值30，初始学识3', icon: '💪', value: 0 },
      { type: 'unlock_card', name: '基础卡牌', description: '解锁基础立论卡牌', icon: '🃏' },
    ],
    rewards: [
      { type: 'gold', name: '新手礼包', description: '获得100金币', icon: '💰', value: 100 },
      { type: 'card_pack', name: '新手卡包', description: '获得新手卡包×1', icon: '📦', value: 1 },
    ],
  },
  {
    minLevel: 10,
    maxLevel: 19,
    title: '入门弟子',
    subtitle: '小有所成',
    color: '#9EAD8A',
    icon: '🎓',
    description: '已入门径，开始研习百家经典。你的辩论技巧逐渐纯熟，可以在论战中初露锋芒。',
    conditions: [
      { type: 'win_games', name: '论战胜场', description: '赢得对战', target: 5 },
      { type: 'play_games', name: '累计对战', description: '完成对战', target: 10 },
      { type: 'use_cards', name: '使用卡牌', description: '累计使用30张卡牌', target: 30 },
    ],
    abilities: [
      { type: 'stat_boost', name: '生命提升', description: '生命值+5', icon: '❤️', value: 5 },
      { type: 'unlock_hero_power', name: '学派技能', description: '解锁学派专属技能', icon: '⚡' },
      { type: 'bonus_reward', name: '胜利奖励', description: '对战胜利获得额外10%金币', icon: '💰', value: 10 },
    ],
    rewards: [
      { type: 'gold', name: '晋级奖励', description: '获得300金币', icon: '💰', value: 300 },
      { type: 'card', name: '弟子卡牌', description: '解锁一张弟子专属卡牌', icon: '🃏' },
      { type: 'title', name: '称号解锁', description: '解锁"入门弟子"称号', icon: '🏅' },
    ],
  },
  {
    minLevel: 20,
    maxLevel: 29,
    title: '书院学子',
    subtitle: '崭露头角',
    color: '#C9A063',
    icon: '📜',
    description: '进入书院深造的学子。你的学识日益渊博，能够灵活运用各种辩论策略。',
    conditions: [
      { type: 'win_games', name: '论战胜场', description: '赢得对战', target: 15 },
      { type: 'deal_damage', name: '累计伤害', description: '累计造成500点伤害', target: 500 },
      { type: 'collect_cards', name: '收集卡牌', description: '拥有15张不同卡牌', target: 15 },
    ],
    abilities: [
      { type: 'stat_boost', name: '学识提升', description: '初始学识+1，最大学识+2', icon: '🧠', value: 2 },
      { type: 'stat_boost', name: '生命提升', description: '生命值+10', icon: '❤️', value: 10 },
      { type: 'unlock_card', name: '进阶卡牌', description: '解锁进阶立论卡牌', icon: '🃏' },
      { type: 'bonus_reward', name: '胜利奖励', description: '对战胜利获得额外15%金币', icon: '💰', value: 15 },
    ],
    rewards: [
      { type: 'gold', name: '晋级奖励', description: '获得500金币', icon: '💰', value: 500 },
      { type: 'card_pack', name: '学子卡包', description: '获得学子卡包×1', icon: '📦', value: 1 },
      { type: 'border', name: '头像框', description: '解锁书院学子头像框', icon: '🖼️' },
    ],
  },
  {
    minLevel: 30,
    maxLevel: 39,
    title: '论道秀才',
    subtitle: '名动四方',
    color: '#C06F6F',
    icon: '🎤',
    description: '才华横溢的论道秀才，已能在百家争鸣中独当一面。你的名声开始传扬，吸引志同道合者。',
    conditions: [
      { type: 'win_games', name: '论战胜场', description: '赢得对战', target: 30 },
      { type: 'win_games', name: '连胜成就', description: '取得5连胜', target: 5 },
      { type: 'deal_damage', name: '累计伤害', description: '累计造成2000点伤害', target: 2000 },
      { type: 'collect_cards', name: '收集卡牌', description: '拥有30张不同卡牌', target: 30 },
    ],
    abilities: [
      { type: 'stat_boost', name: '属性均衡', description: '生命值+15，学识+3', icon: '📈', value: 18 },
      { type: 'unlock_skill', name: '策术卡牌', description: '解锁策术类卡牌', icon: '🎯' },
      { type: 'unlock_card', name: '精英卡牌', description: '解锁精英品质卡牌', icon: '⭐' },
      { type: 'bonus_reward', name: '每日奖励', description: '每日登录额外奖励', icon: '🎁', value: 20 },
    ],
    rewards: [
      { type: 'gold', name: '晋级奖励', description: '获得1000金币', icon: '💰', value: 1000 },
      { type: 'gems', name: '宝石', description: '获得50宝石', icon: '💎', value: 50 },
      { type: 'avatar', name: '专属头像', description: '解锁论道秀才专属头像', icon: '👤' },
      { type: 'title', name: '称号解锁', description: '解锁"论道秀才"称号', icon: '🏅' },
    ],
  },
  {
    minLevel: 40,
    maxLevel: 49,
    title: '百家智者',
    subtitle: '执掌一派',
    color: '#9C88A8',
    icon: '🏆',
    description: '学贯古今的百家智者，已具备开宗立派的资格。你的见解独到深刻，令众人折服。',
    conditions: [
      { type: 'win_games', name: '论战胜场', description: '赢得对战', target: 50 },
      { type: 'win_games', name: '连胜成就', description: '取得10连胜', target: 10 },
      { type: 'deal_damage', name: '累计伤害', description: '累计造成5000点伤害', target: 5000 },
      { type: 'collect_cards', name: '收集卡牌', description: '拥有50张不同卡牌', target: 50 },
    ],
    abilities: [
      { type: 'stat_boost', name: '大师属性', description: '生命值+25，学识+5', icon: '📈', value: 30 },
      { type: 'unlock_hero_power', name: '终极技能', description: '解锁百家终极技能', icon: '🔥' },
      { type: 'unlock_card', name: '传说卡牌', description: '解锁传说品质卡牌', icon: '🌟' },
      { type: 'bonus_reward', name: '全部奖励', description: '所有奖励加成25%', icon: '💰', value: 25 },
    ],
    rewards: [
      { type: 'gold', name: '晋级奖励', description: '获得2000金币', icon: '💰', value: 2000 },
      { type: 'gems', name: '宝石', description: '获得200宝石', icon: '💎', value: 200 },
      { type: 'card_pack', name: '智者卡包', description: '获得智者卡包×2', icon: '📦', value: 2 },
      { type: 'feature_unlock', name: '功能解锁', description: '解锁观战功能', icon: '👁️' },
    ],
  },
  {
    minLevel: 50,
    maxLevel: 50,
    title: '稷下宗师',
    subtitle: '天下无双',
    color: '#d4a520',
    icon: '👑',
    description: '站在百家争鸣巅峰的绝顶宗师，你的名字已成为传说。你的智慧与谋略无人能及。',
    conditions: [
      { type: 'win_games', name: '终极胜场', description: '赢得对战', target: 100 },
      { type: 'win_games', name: '连胜巅峰', description: '取得20连胜', target: 20 },
      { type: 'deal_damage', name: '累计伤害', description: '累计造成10000点伤害', target: 10000 },
      { type: 'collect_cards', name: '集齐卡牌', description: '拥有全部卡牌', target: 100 },
    ],
    abilities: [
      { type: 'stat_boost', name: '宗师属性', description: '生命值+50，学识+10', icon: '📈', value: 60 },
      { type: 'unlock_card', name: '全卡解锁', description: '解锁全部卡牌', icon: '🃏' },
      { type: 'bonus_reward', name: '终极奖励', description: '所有奖励加成50%', icon: '💰', value: 50 },
      { type: 'stat_boost', name: '专属特效', description: '解锁独有战斗特效', icon: '✨' },
    ],
    rewards: [
      { type: 'gold', name: '终极奖励', description: '获得5000金币', icon: '💰', value: 5000 },
      { type: 'gems', name: '宝石', description: '获得500宝石', icon: '💎', value: 500 },
      { type: 'title', name: '宗师称号', description: '获得"稷下宗师"无双称号', icon: '👑' },
      { type: 'border', name: '专属框', description: '解锁稷下宗师专属头像框', icon: '🖼️' },
      { type: 'avatar', name: '传说头像', description: '解锁传说品质专属头像', icon: '👤' },
    ],
  },
];

export const MAX_LEVEL = 50;

export function getLevelRank(level: number): LevelRank {
  const rank = LEVEL_RANKS.find(r => level >= r.minLevel && level <= r.maxLevel);
  return rank ?? LEVEL_RANKS[0];
}

export function getLevelDetail(level: number): LevelDetail {
  const detail = LEVEL_DETAILS.find(d => level >= d.minLevel && level <= d.maxLevel);
  return detail ?? LEVEL_DETAILS[0];
}

export function getLevelTitle(level: number): string {
  return getLevelRank(level).title;
}

export function getLevelSubtitle(level: number): string {
  return getLevelRank(level).subtitle;
}

export function getLevelColor(level: number): string {
  return getLevelRank(level).color;
}

export function getLevelIcon(level: number): string {
  return getLevelRank(level).icon;
}

export function getLevelDescription(level: number): string {
  return getLevelDetail(level).description;
}

export function calculateExpForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) * 100;
}

export function calculateTotalExp(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateExpForNextLevel(i);
  }
  return total;
}

export function calculateLevelFromExp(totalExp: number): { level: number; exp: number } {
  let level = 1;
  let exp = totalExp;

  while (level < MAX_LEVEL) {
    const requiredExp = calculateExpForNextLevel(level);
    if (exp >= requiredExp) {
      exp -= requiredExp;
      level++;
    } else {
      break;
    }
  }

  return { level, exp };
}

export function getExpProgress(level: number, currentExp: number): { current: number; required: number; percentage: number } {
  if (level >= MAX_LEVEL) {
    return { current: 0, required: 1, percentage: 100 };
  }
  const required = calculateExpForNextLevel(level);
  const percentage = Math.round((currentExp / required) * 100);
  return { current: currentExp, required, percentage };
}

export function getLevelRankProgress(level: number): { current: number; total: number; title: string; nextTitle: string } {
  const rank = getLevelRank(level);
  const nextRank = LEVEL_RANKS.find(r => r.minLevel > rank.maxLevel);
  return {
    current: level - rank.minLevel,
    total: rank.maxLevel - rank.minLevel + 1,
    title: rank.title,
    nextTitle: nextRank?.title || rank.title,
  };
}

export function isLevelMaxed(level: number): boolean {
  return level >= MAX_LEVEL;
}

export function getNextRankInfo(level: number): { title: string; levelsRemaining: number; expRequired: number } | null {
  if (level >= MAX_LEVEL) return null;

  const currentRank = getLevelRank(level);
  const nextRank = LEVEL_RANKS.find(r => r.minLevel > currentRank.maxLevel);

  if (!nextRank) return null;

  const levelsRemaining = nextRank.minLevel - level;
  let expRequired = 0;
  for (let l = level; l < nextRank.minLevel; l++) {
    expRequired += calculateExpForNextLevel(l);
  }

  return {
    title: nextRank.title,
    levelsRemaining,
    expRequired,
  };
}
