export type CardType = 'skill' | 'event' | 'field' | 'gear' | 'character' | 'counter';
export type HeroPowerType = 'summon' | 'damage' | 'armor' | 'draw';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type RarityZh = '常见' | '稀有' | '史诗' | '传说';

export const RarityMap: Record<RarityZh, Rarity> = {
    '常见': 'common',
    '稀有': 'rare',
    '史诗': 'epic',
    '传说': 'legendary',
};

export const RarityZhMap: Record<Rarity, RarityZh> = {
    'common': '常见',
    'rare': '稀有',
    'epic': '史诗',
    'legendary': '传说',
};

export const RarityColors: Record<Rarity, string> = {
    common: '#9ca3af',
    rare: '#60a5fa',
    epic: '#a855f7',
    legendary: '#f59e0b',
};

export const RarityZhColors: Record<RarityZh, string> = {
    '常见': '#9ca3af',
    '稀有': '#60a5fa',
    '史诗': '#a855f7',
    '传说': '#f59e0b',
};

export type EffectType = 
    | 'damage' 
    | 'heal' 
    | 'draw' 
    | 'discard' 
    | 'buff' 
    | 'debuff' 
    | 'summon' 
    | 'destroy' 
    | 'transform'
    | 'search'
    | 'protect'
    | 'counter';

export type TargetType = 
    | 'self' 
    | 'enemy' 
    | 'all_enemies' 
    | 'all_allies' 
    | 'all' 
    | 'random_enemy' 
    | 'random_ally'
    | 'selected'
    | 'hero'
    | 'enemy_hero';

export type KeywordType = 
    | '护持' 
    | '清明' 
    | '学识' 
    | '气势' 
    | '壁垒' 
    | '怀疑' 
    | '沉默';

export interface CardEffect {
    type: EffectType;
    value?: number;
    target?: TargetType;
    condition?: string;
    description?: string;
}

export interface Keyword {
    type: KeywordType;
    value: number;
    duration?: number;
}

export interface Card {
    id: string;
    name: string;
    cost: number;
    type: CardType;
    faction: string;
    rarity: RarityZh;
    background?: string;
    skillDesc?: string;
    keywords?: Keyword[];
    effects?: CardEffect[];
}

export interface CharacterCard extends Card {
    type: 'character';
    atk: number;
    hp: number;
    hasTaunt?: boolean;
    hasCharge?: boolean;
    hasDivineShield?: boolean;
    hasStealth?: boolean;
}

export interface GearCard extends Card {
    type: 'gear';
    atk?: number;
    shield?: number;
    durability?: number;
}

export interface FieldCard extends Card {
    type: 'field';
    shield?: number;
    duration?: number;
}

export interface SkillCard extends Card {
    type: 'skill';
    effects?: CardEffect[];
}

export interface EventCard extends Card {
    type: 'event';
    effects?: CardEffect[];
}

export interface CounterCard extends Card {
    type: 'counter';
    triggerCondition?: string;
    effects?: CardEffect[];
}

export type AnyCard = 
    | CharacterCard 
    | GearCard 
    | FieldCard 
    | SkillCard 
    | EventCard 
    | CounterCard;

export interface CardTemplate {
    id: string;
    name: string;
    type: CardType;
    rarity: RarityZh;
    faction: string;
    cost: number;
    attack?: number;
    hp?: number;
    shield?: number;
    durability?: number;
    background: string;
    skill: string;
    keywords?: Keyword[];
}

export interface CardCollection {
    cards: Card[];
    totalCount: number;
    byFaction: Record<string, Card[]>;
    byType: Record<CardType, Card[]>;
    byRarity: Record<RarityZh, Card[]>;
}

export function isCharacterCard(card: Card): card is CharacterCard {
    return card.type === 'character';
}

export function isGearCard(card: Card): card is GearCard {
    return card.type === 'gear';
}

export function isFieldCard(card: Card): card is FieldCard {
    return card.type === 'field';
}

export function isSkillCard(card: Card): card is SkillCard {
    return card.type === 'skill';
}

export function isEventCard(card: Card): card is EventCard {
    return card.type === 'event';
}

export function isCounterCard(card: Card): card is CounterCard {
    return card.type === 'counter';
}

export function createCardFromTemplate(template: CardTemplate): Card {
    const base: Omit<Card, 'type'> = {
        id: template.id,
        name: template.name,
        cost: template.cost,
        faction: template.faction,
        rarity: template.rarity,
        background: template.background,
        skillDesc: template.skill,
        keywords: template.keywords,
    };

    switch (template.type) {
        case 'character':
            return {
                ...base,
                type: 'character',
                atk: template.attack ?? 0,
                hp: template.hp ?? 1,
            } as CharacterCard;

        case 'gear':
            return {
                ...base,
                type: 'gear',
                atk: template.attack,
                shield: template.shield,
                durability: template.durability,
            } as GearCard;

        case 'field':
            return {
                ...base,
                type: 'field',
                shield: template.shield,
                duration: template.durability,
            } as FieldCard;

        case 'skill':
            return {
                ...base,
                type: 'skill',
            } as SkillCard;

        case 'event':
            return {
                ...base,
                type: 'event',
            } as EventCard;

        case 'counter':
            return {
                ...base,
                type: 'counter',
            } as CounterCard;

        default:
            return base as Card;
    }
}

export function groupCardsByFaction(cards: Card[]): Record<string, Card[]> {
    return cards.reduce((acc, card) => {
        const faction = card.faction;
        if (!acc[faction]) {
            acc[faction] = [];
        }
        acc[faction].push(card);
        return acc;
    }, {} as Record<string, Card[]>);
}

export function groupCardsByType(cards: Card[]): Record<CardType, Card[]> {
    const initial: Record<CardType, Card[]> = {
        skill: [],
        event: [],
        field: [],
        gear: [],
        character: [],
        counter: [],
    };
    return cards.reduce((acc, card) => {
        acc[card.type].push(card);
        return acc;
    }, initial);
}

export function groupCardsByRarity(cards: Card[]): Record<RarityZh, Card[]> {
    const initial: Record<RarityZh, Card[]> = {
        '常见': [],
        '稀有': [],
        '史诗': [],
        '传说': [],
    };
    return cards.reduce((acc, card) => {
        acc[card.rarity].push(card);
        return acc;
    }, initial);
}

export function createCardCollection(cards: Card[]): CardCollection {
    return {
        cards,
        totalCount: cards.length,
        byFaction: groupCardsByFaction(cards),
        byType: groupCardsByType(cards),
        byRarity: groupCardsByRarity(cards),
    };
}

export function filterCards(
    cards: Card[],
    options: {
        faction?: string;
        type?: CardType;
        rarity?: RarityZh;
        costMin?: number;
        costMax?: number;
        keyword?: KeywordType;
    }
): Card[] {
    return cards.filter(card => {
        if (options.faction && card.faction !== options.faction) return false;
        if (options.type && card.type !== options.type) return false;
        if (options.rarity && card.rarity !== options.rarity) return false;
        if (options.costMin !== undefined && card.cost < options.costMin) return false;
        if (options.costMax !== undefined && card.cost > options.costMax) return false;
        if (options.keyword) {
            const hasKeyword = card.keywords?.some(k => k.type === options.keyword);
            if (!hasKeyword) return false;
        }
        return true;
    });
}

export function searchCards(cards: Card[], query: string): Card[] {
    const lowerQuery = query.toLowerCase();
    return cards.filter(card => 
        card.name.toLowerCase().includes(lowerQuery) ||
        card.skillDesc?.toLowerCase().includes(lowerQuery) ||
        card.background?.toLowerCase().includes(lowerQuery) ||
        card.faction.toLowerCase().includes(lowerQuery)
    );
}

export function sortCards(
    cards: Card[],
    sortBy: 'cost' | 'name' | 'rarity' | 'type' | 'faction',
    ascending: boolean = true
): Card[] {
    const rarityOrder: RarityZh[] = ['常见', '稀有', '史诗', '传说'];
    
    return [...cards].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'cost':
                comparison = a.cost - b.cost;
                break;
            case 'name':
                comparison = a.name.localeCompare(b.name, 'zh-CN');
                break;
            case 'rarity':
                comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                break;
            case 'type':
                comparison = a.type.localeCompare(b.type);
                break;
            case 'faction':
                comparison = a.faction.localeCompare(b.faction, 'zh-CN');
                break;
        }
        
        return ascending ? comparison : -comparison;
    });
}
