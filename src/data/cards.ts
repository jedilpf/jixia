import { 
    Card, 
    CharacterCard, 
    GearCard, 
    FieldCard,
    CardType, 
    RarityZh,
    createCardCollection,
    CardCollection,
    filterCards,
    searchCards,
    sortCards,
} from '@/types';
import { CARDS } from './showcaseCards';
import type { CardData } from './showcaseCards';

const TYPE_MAP: Record<string, CardType> = {
    '技能': 'skill',
    '事件': 'event',
    '场地': 'field',
    '装备': 'gear',
    '角色': 'character',
    '反制': 'counter',
};

const RARITY_MAP: Record<string, RarityZh> = {
    '常见': '常见',
    '稀有': '稀有',
    '史诗': '史诗',
    '传说': '传说',
};

export function mapType(zhType: string): CardType {
    return TYPE_MAP[zhType] ?? 'skill';
}

export function mapRarity(zhRarity: string): RarityZh {
    return RARITY_MAP[zhRarity] ?? '常见';
}

export function mapShowcaseToBattleCard(data: CardData): Card {
    const type = mapType(data.type);
    
    const baseCard = {
        id: data.id,
        name: data.name,
        cost: data.cost,
        type,
        faction: data.faction,
        rarity: mapRarity(data.rarity),
        background: data.background,
        skillDesc: data.skill,
    };

    switch (type) {
        case 'character':
            return {
                ...baseCard,
                type: 'character',
                atk: data.attack ?? 0,
                hp: data.hp ?? 1,
            } as CharacterCard;

        case 'gear':
            return {
                ...baseCard,
                type: 'gear',
                atk: data.attack,
                shield: data.shield,
            } as GearCard;

        case 'field':
            return {
                ...baseCard,
                type: 'field',
                shield: data.shield,
            } as FieldCard;

        default:
            return baseCard as Card;
    }
}

export function mapAllShowcaseCards(): Card[] {
    return CARDS.map(mapShowcaseToBattleCard);
}

export const ALL_CARDS: Card[] = mapAllShowcaseCards();

export const CARD_COLLECTION: CardCollection = createCardCollection(ALL_CARDS);

export const CARDS_BY_FACTION = CARD_COLLECTION.byFaction;
export const CARDS_BY_TYPE = CARD_COLLECTION.byType;
export const CARDS_BY_RARITY = CARD_COLLECTION.byRarity;

export function getCardById(id: string): Card | undefined {
    return ALL_CARDS.find(card => card.id === id);
}

export function getCardsByFaction(faction: string): Card[] {
    return CARDS_BY_FACTION[faction] ?? [];
}

export function getCardsByType(type: CardType): Card[] {
    return CARDS_BY_TYPE[type] ?? [];
}

export function getCardsByRarity(rarity: RarityZh): Card[] {
    return CARDS_BY_RARITY[rarity] ?? [];
}

export function searchCardCollection(query: string): Card[] {
    return searchCards(ALL_CARDS, query);
}

export function filterCardCollection(options: {
    faction?: string;
    type?: CardType;
    rarity?: RarityZh;
    costMin?: number;
    costMax?: number;
}): Card[] {
    return filterCards(ALL_CARDS, options);
}

export function sortCardCollection(
    cards: Card[],
    sortBy: 'cost' | 'name' | 'rarity' | 'type' | 'faction',
    ascending?: boolean
): Card[] {
    return sortCards(cards, sortBy, ascending);
}

export const createCharacterCard = (
    id: string,
    name: string,
    cost: number,
    atk: number,
    hp: number,
    opts?: {
        rarity?: RarityZh;
        faction?: string;
        background?: string;
        skillDesc?: string;
    }
): CharacterCard => ({
    id,
    name,
    cost,
    type: 'character',
    faction: opts?.faction ?? '稷下',
    rarity: opts?.rarity ?? '常见',
    atk,
    hp,
    background: opts?.background,
    skillDesc: opts?.skillDesc,
});

export const createMinionCard = createCharacterCard;

export const createGearCard = (
    id: string,
    name: string,
    cost: number,
    atk: number,
    shield: number,
    rarity?: RarityZh,
    faction?: string
): GearCard => ({
    id,
    name,
    cost,
    type: 'gear',
    faction: faction ?? '稷下',
    rarity: rarity ?? '常见',
    atk,
    shield,
});

export const createWeaponCard = (
    id: string,
    name: string,
    cost: number,
    atk: number,
    _durability: number,
    rarity?: RarityZh
): GearCard => createGearCard(id, name, cost, atk, _durability, rarity);

export const INITIAL_DECK: Card[] = [];

const deckSize = 30;
const cardCount = CARDS.length;

for (let i = 0; i < deckSize; i++) {
    const showcaseCard = CARDS[i % cardCount];
    const battleCard = mapShowcaseToBattleCard(showcaseCard);
    INITIAL_DECK.push({ 
        ...battleCard, 
        id: `deck_${i}_${showcaseCard.id}` 
    });
}

export function buildDeck(cardIds: string[]): Card[] {
    return cardIds.map((id, index) => {
        const templateCard = getCardById(id);
        if (!templateCard) {
            throw new Error(`Card with id "${id}" not found`);
        }
        return {
            ...templateCard,
            id: `deck_${index}_${id}`,
        };
    });
}

export function buildRandomDeck(size: number = 30, options?: {
    faction?: string;
    rarity?: RarityZh;
}): Card[] {
    const availableCards = options 
        ? filterCardCollection(options)
        : [...ALL_CARDS];
    
    const deck: Card[] = [];
    for (let i = 0; i < size && availableCards.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const card = availableCards[randomIndex];
        deck.push({
            ...card,
            id: `deck_${i}_${card.id}`,
        });
    }
    
    return deck;
}

export function validateDeck(deck: Card[]): {
    valid: boolean;
    errors: string[];
    stats: {
        totalCards: number;
        byType: Record<CardType, number>;
        byFaction: Record<string, number>;
        averageCost: number;
    };
} {
    const errors: string[] = [];
    const byType: Record<CardType, number> = {
        skill: 0,
        event: 0,
        field: 0,
        gear: 0,
        character: 0,
        counter: 0,
    };
    const byFaction: Record<string, number> = {};
    let totalCost = 0;

    for (const card of deck) {
        byType[card.type]++;
        byFaction[card.faction] = (byFaction[card.faction] ?? 0) + 1;
        totalCost += card.cost;
    }

    if (deck.length < 30) {
        errors.push(`牌库不足30张，当前${deck.length}张`);
    }

    if (deck.length > 60) {
        errors.push(`牌库超过60张，当前${deck.length}张`);
    }

    if (byType.character < 5) {
        errors.push(`角色牌过少，建议至少5张，当前${byType.character}张`);
    }

    return {
        valid: errors.length === 0,
        errors,
        stats: {
            totalCards: deck.length,
            byType,
            byFaction,
            averageCost: deck.length > 0 ? totalCost / deck.length : 0,
        },
    };
}
