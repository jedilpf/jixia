import {
  CARDS as GENERATED_CARDS,
  CARD_SOURCE_INFO,
  rarityColor,
  typeColor,
  type CardData,
  type CardStatus,
} from '@/generated/cardsRuntime';
import { getCardImageUrl } from '@/utils/assets';

export type { CardData, CardStatus };
export { getCardImageUrl, rarityColor, typeColor };

export const CARDS: CardData[] = GENERATED_CARDS;
export const ACTIVE_CARDS: CardData[] = CARDS.filter((card) => card.status === 'active');
export const NON_ACTIVE_CARDS: CardData[] = CARDS.filter((card) => card.status !== 'active');

const COLLECTION_FACTION_DISPLAY_MAP: Record<string, string> = {
  礼心殿: '儒家',
  玄匠盟: '墨家',
};

export const COLLECTION_FACTION_ORDER: string[] = [
  '儒家',
  '墨家',
  '衡戒廷',
  '归真观',
  '九阵堂',
  '名相府',
  '司天台',
  '游策阁',
  '万农坊',
  '兼采楼',
  '天工坊',
  '两仪署',
  '杏林馆',
  '稗言社',
  '养真院',
  '筹天阁',
  '通用',
];

const COLLECTION_FACTION_RANK = new Map(
  COLLECTION_FACTION_ORDER.map((name, index) => [name, index])
);
const SOURCE_ORDER_BY_ID = new Map(CARDS.map((card, index) => [card.id, index]));

export function getCollectionFactionName(rawFaction: string): string {
  return COLLECTION_FACTION_DISPLAY_MAP[rawFaction] ?? rawFaction;
}

function compareCollectionCards(a: CardData, b: CardData): number {
  const factionA = getCollectionFactionName(a.faction);
  const factionB = getCollectionFactionName(b.faction);
  const factionRankA = COLLECTION_FACTION_RANK.get(factionA) ?? Number.MAX_SAFE_INTEGER;
  const factionRankB = COLLECTION_FACTION_RANK.get(factionB) ?? Number.MAX_SAFE_INTEGER;

  if (factionRankA !== factionRankB) {
    return factionRankA - factionRankB;
  }

  if (factionA !== factionB) {
    return factionA.localeCompare(factionB);
  }

  return (SOURCE_ORDER_BY_ID.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (SOURCE_ORDER_BY_ID.get(b.id) ?? Number.MAX_SAFE_INTEGER);
}

export const COLLECTION_CARDS: CardData[] = CARDS
  .filter((card) => card.status !== 'archived')
  .slice()
  .sort(compareCollectionCards);

export const ACTIVE_COLLECTION_CARDS: CardData[] = COLLECTION_CARDS.filter((card) => card.status === 'active');

export function getActiveCollectionIndexById(cardId: string): number {
  return ACTIVE_COLLECTION_CARDS.findIndex((card) => card.id === cardId);
}

export const ACTIVE_CARD_SOURCE = CARD_SOURCE_INFO.source;
