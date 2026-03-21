import { HeroPowerType, RarityZh, KeywordType, Keyword } from './cards';

export interface Buffs {
    huchi: number;
    qishi: number;
    qingming: number;
    bilei: number;
    xueshi: number;
}

export interface Debuffs {
    huaiyi: number;
    chenmo: number;
}

export type CardStatus = 
    | 'silenced'
    | 'frozen'
    | 'stealthed'
    | 'immune'
    | 'exhausted'
    | 'divine_shield';

export interface GearInstance {
    instanceId: string;
    cardId: string;
    name: string;
    atk?: number;
    shield?: number;
    durability?: number;
    skillDesc?: string;
}

export interface WeaponInstance {
    instanceId: string;
    cardId: string;
    name: string;
    atk: number;
    durability: number;
}

export interface CharacterInstance {
    instanceId: string;
    cardId: string;
    name: string;
    atk: number;
    hp: number;
    maxHp: number;
    canAttack: boolean;
    hasAttacked: boolean;
    isExhausted: boolean;
    gear: GearInstance | null;
    buffs: Buffs;
    debuffs: Debuffs;
    status: CardStatus[];
    rarity: RarityZh;
    hasTaunt?: boolean;
    hasCharge?: boolean;
    hasDivineShield?: boolean;
    hasStealth?: boolean;
    skillDesc?: string;
    turnPlayed?: number;
    keywords?: Keyword[];
}

export interface FieldInstance {
    instanceId: string;
    cardId: string;
    name: string;
    shield?: number;
    durability?: number;
    skillDesc?: string;
    turnPlayed?: number;
}

export interface HeroPower {
    name: string;
    cost: number;
    type: HeroPowerType;
    value: number;
    description: string;
    usedThisTurn: boolean;
}

export interface Hero {
    hp: number;
    maxHp: number;
    armor: number;
    weapon: WeaponInstance | null;
    heroPower: HeroPower;
    hasAttackedThisTurn: boolean;
    buffs: Buffs;
    debuffs: Debuffs;
    gear: GearInstance | null;
}

export interface CardInstanceBase {
    instanceId: string;
    cardId: string;
    name: string;
    type: string;
}

export type AnyInstance = 
    | CharacterInstance 
    | GearInstance 
    | FieldInstance 
    | Hero;

export function createDefaultBuffs(): Buffs {
    return {
        huchi: 0,
        qishi: 0,
        qingming: 0,
        bilei: 0,
        xueshi: 0,
    };
}

export function createDefaultDebuffs(): Debuffs {
    return {
        huaiyi: 0,
        chenmo: 0,
    };
}

export function createDefaultHero(): Hero {
    return {
        hp: 30,
        maxHp: 30,
        armor: 0,
        weapon: null,
        heroPower: {
            name: '英雄技能',
            cost: 2,
            type: 'damage',
            value: 2,
            description: '造成2点伤害',
            usedThisTurn: false,
        },
        hasAttackedThisTurn: false,
        buffs: createDefaultBuffs(),
        debuffs: createDefaultDebuffs(),
        gear: null,
    };
}

export function createCharacterInstance(
    cardId: string,
    name: string,
    atk: number,
    hp: number,
    rarity: RarityZh,
    options?: {
        hasTaunt?: boolean;
        hasCharge?: boolean;
        hasDivineShield?: boolean;
        hasStealth?: boolean;
        skillDesc?: string;
        keywords?: Keyword[];
    }
): CharacterInstance {
    return {
        instanceId: `char_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        cardId,
        name,
        atk,
        hp,
        maxHp: hp,
        canAttack: options?.hasCharge ?? false,
        hasAttacked: false,
        isExhausted: !options?.hasCharge,
        gear: null,
        buffs: createDefaultBuffs(),
        debuffs: createDefaultDebuffs(),
        status: [],
        rarity,
        hasTaunt: options?.hasTaunt,
        hasCharge: options?.hasCharge,
        hasDivineShield: options?.hasDivineShield,
        hasStealth: options?.hasStealth,
        skillDesc: options?.skillDesc,
        keywords: options?.keywords,
    };
}

export function createFieldInstance(
    cardId: string,
    name: string,
    options?: {
        shield?: number;
        durability?: number;
        skillDesc?: string;
    }
): FieldInstance {
    return {
        instanceId: `field_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        cardId,
        name,
        shield: options?.shield,
        durability: options?.durability,
        skillDesc: options?.skillDesc,
    };
}

export function createGearInstance(
    cardId: string,
    name: string,
    options?: {
        atk?: number;
        shield?: number;
        durability?: number;
        skillDesc?: string;
    }
): GearInstance {
    return {
        instanceId: `gear_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        cardId,
        name,
        atk: options?.atk,
        shield: options?.shield,
        durability: options?.durability,
        skillDesc: options?.skillDesc,
    };
}

export function hasKeyword(instance: CharacterInstance, keywordType: KeywordType): boolean {
    return instance.keywords?.some(k => k.type === keywordType) ?? false;
}

export function getKeywordValue(instance: CharacterInstance, keywordType: KeywordType): number {
    const keyword = instance.keywords?.find(k => k.type === keywordType);
    return keyword?.value ?? 0;
}

export function addKeyword(instance: CharacterInstance, keyword: Keyword): void {
    if (!instance.keywords) {
        instance.keywords = [];
    }
    const existing = instance.keywords.find(k => k.type === keyword.type);
    if (existing) {
        existing.value += keyword.value;
        if (keyword.duration !== undefined) {
            existing.duration = Math.max(existing.duration ?? 0, keyword.duration);
        }
    } else {
        instance.keywords.push({ ...keyword });
    }
}

export function removeKeyword(instance: CharacterInstance, keywordType: KeywordType): boolean {
    if (!instance.keywords) return false;
    const index = instance.keywords.findIndex(k => k.type === keywordType);
    if (index >= 0) {
        instance.keywords.splice(index, 1);
        return true;
    }
    return false;
}

export function hasStatus(instance: CharacterInstance, status: CardStatus): boolean {
    return instance.status.includes(status);
}

export function addStatus(instance: CharacterInstance, status: CardStatus): void {
    if (!instance.status.includes(status)) {
        instance.status.push(status);
    }
}

export function removeStatus(instance: CharacterInstance, status: CardStatus): void {
    const index = instance.status.indexOf(status);
    if (index >= 0) {
        instance.status.splice(index, 1);
    }
}

export function isSilenced(instance: CharacterInstance): boolean {
    return instance.debuffs.chenmo > 0 || hasStatus(instance, 'silenced');
}

export function canAct(instance: CharacterInstance): boolean {
    return !isSilenced(instance) && !hasStatus(instance, 'frozen') && !instance.isExhausted;
}

export function canAttackTarget(instance: CharacterInstance): boolean {
    return instance.canAttack && !instance.hasAttacked && canAct(instance);
}

export function getEffectiveAttack(instance: CharacterInstance): number {
    return instance.atk + (instance.buffs.qishi ?? 0);
}

export function getEffectiveHealth(instance: CharacterInstance): number {
    return instance.hp + (instance.buffs.huchi ?? 0) + (instance.buffs.bilei ?? 0);
}

export function takeDamage(instance: CharacterInstance, amount: number): number {
    let remainingDamage = amount;
    
    if (instance.buffs.bilei > 0) {
        if (instance.buffs.bilei >= remainingDamage) {
            instance.buffs.bilei -= remainingDamage;
            return 0;
        } else {
            remainingDamage -= instance.buffs.bilei;
            instance.buffs.bilei = 0;
        }
    }
    
    if (instance.buffs.huchi > 0) {
        if (instance.buffs.huchi >= remainingDamage) {
            instance.buffs.huchi -= remainingDamage;
            return 0;
        } else {
            remainingDamage -= instance.buffs.huchi;
            instance.buffs.huchi = 0;
        }
    }
    
    if (hasStatus(instance, 'divine_shield')) {
        removeStatus(instance, 'divine_shield');
        return 0;
    }
    
    instance.hp -= remainingDamage;
    return remainingDamage;
}

export function heal(instance: CharacterInstance, amount: number): number {
    const actualHeal = Math.min(amount, instance.maxHp - instance.hp);
    instance.hp += actualHeal;
    return actualHeal;
}
