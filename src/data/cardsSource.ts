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

export const ACTIVE_CARD_SOURCE = CARD_SOURCE_INFO.source;
