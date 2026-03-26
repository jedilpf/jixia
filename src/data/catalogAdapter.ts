import { CARDS as SHOWCASE_CARDS, type CardData as ShowcaseCardData } from './showcaseCards';

export type CardStatus = 'active' | 'planned' | 'draft' | 'rework' | 'archived';

export interface CardData extends ShowcaseCardData {
  status: CardStatus;
  catalogOrder: number;
  source: 'showcase';
}

/**
 * 迁移收口适配层：
 * - 当前以 showcaseCards 作为 battleV2 + 图鉴共用的活跃数据源。
 * - 后续若切换到 content/cards，可在此层完成字段/状态映射而不改业务调用方。
 */
function toCatalogCard(card: ShowcaseCardData, index: number): CardData {
  return {
    ...card,
    status: 'active',
    catalogOrder: index + 1,
    source: 'showcase',
  };
}

export const CARDS: CardData[] = SHOWCASE_CARDS.map(toCatalogCard);
export const ACTIVE_CARDS: CardData[] = CARDS.filter((card) => card.status === 'active');
export const NON_ACTIVE_CARDS: CardData[] = CARDS.filter((card) => card.status !== 'active');

export const CARD_SOURCE_INFO = {
  source: 'src/data/showcaseCards.ts',
  adapter: 'src/data/catalogAdapter.ts',
  cardCount: CARDS.length,
} as const;
