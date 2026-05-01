import { CARDS as SHOWCASE_CARDS, type CardData as ShowcaseCardData } from './showcaseCards';

export type CardStatus = 'active' | 'planned' | 'draft' | 'rework' | 'archived';

/**
 * 图鉴卡牌数据（扩展展示卡牌）
 * 目前所有卡牌状态为 active
 */
export interface CatalogCard extends ShowcaseCardData {
  status: CardStatus;
  catalogOrder: number;
  source: 'showcase';
}

/**
 * 根据稀有度获取星级（用于排序）
 * 常见 -> 1（一等）
 * 稀有/史诗 -> 2（二等）
 * 传说 -> 3（三等）
 */
function getStarTierByRarity(rarity: string): number {
  switch (rarity) {
    case '常见':
      return 1;
    case '稀有':
    case '史诗':
      return 2;
    case '传说':
      return 3;
    default:
      return 1;
  }
}

/**
 * 迁移收口适配层：
 * - 当前以 showcaseCards 作为 battleV2 + 图鉴共用的活跃数据源。
 * - 后续若切换到 content/cards，可在此层完成字段/状态映射而不改业务调用方。
 */
function toCatalogCard(card: ShowcaseCardData, index: number): CatalogCard {
  return {
    ...card,
    status: 'active',
    catalogOrder: index + 1,
    source: 'showcase',
  };
}

// 图鉴卡牌列表（带状态信息）
export const CATALOG_CARDS: CatalogCard[] = SHOWCASE_CARDS.map(toCatalogCard);

// 活跃卡牌（可用于战斗）
export const ACTIVE_CARDS: CatalogCard[] = CATALOG_CARDS.filter((card) => card.status === 'active');

// 非活跃卡牌（开发中/已废弃）
export const NON_ACTIVE_CARDS: CatalogCard[] = CATALOG_CARDS.filter((card) => card.status !== 'active');

export const CARD_SOURCE_INFO = {
  source: 'src/data/showcaseCards.ts',
  adapter: 'src/data/catalogAdapter.ts',
  cardCount: CATALOG_CARDS.length,
  activeCount: ACTIVE_CARDS.length,
} as const;

// 按门派分组，并按星级排序（一等 -> 二等 -> 三等）
export const CARDS_BY_FACTION = CATALOG_CARDS.reduce((acc, card) => {
  if (!acc[card.faction]) {
    acc[card.faction] = [];
  }
  acc[card.faction].push(card);
  return acc;
}, {} as Record<string, CatalogCard[]>);

// 对每个门派的卡牌按星级排序
Object.keys(CARDS_BY_FACTION).forEach((faction) => {
  CARDS_BY_FACTION[faction].sort((a, b) => {
    const tierA = getStarTierByRarity(a.rarity);
    const tierB = getStarTierByRarity(b.rarity);
    return tierA - tierB; // 按星级升序排列：一等(1) -> 二等(2) -> 三等(3)
  });
});

// 按类型分组
export const CARDS_BY_TYPE = CATALOG_CARDS.reduce((acc, card) => {
  if (!acc[card.type]) {
    acc[card.type] = [];
  }
  acc[card.type].push(card);
  return acc;
}, {} as Record<string, CatalogCard[]>);

// 按稀有度分组
export const CARDS_BY_RARITY = CATALOG_CARDS.reduce((acc, card) => {
  if (!acc[card.rarity]) {
    acc[card.rarity] = [];
  }
  acc[card.rarity].push(card);
  return acc;
}, {} as Record<string, CatalogCard[]>);