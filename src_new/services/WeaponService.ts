// WeaponService - 武器服务
// 提供武器管理、装备、耐久度、攻击等功能

export interface WeaponTemplate {
  id: string;
  name: string;
  cost: number;
  attack: number;
  durability: number;
  effects: string[];
  isLegendary?: boolean;
}

export interface WeaponInstance {
  id: string;
  templateId: string;
  ownerId: string;
  currentAttack: number;
  currentDurability: number;
  isEquipped: boolean;
  buffs: string[];
}

export class WeaponService {
  private templates: Map<string, WeaponTemplate> = new Map();
  private equippedWeapons: Map<string, WeaponInstance> = new Map();

  registerTemplate(template: WeaponTemplate): void {
    this.templates.set(template.id, template);
  }

  equipWeapon(templateId: string, ownerId: string): WeaponInstance | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    // Destroy existing weapon
    this.destroyWeapon(ownerId);

    const weapon: WeaponInstance = {
      id: `weapon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      ownerId,
      currentAttack: template.attack,
      currentDurability: template.durability,
      isEquipped: true,
      buffs: [],
    };

    this.equippedWeapons.set(ownerId, weapon);
    return weapon;
  }

  destroyWeapon(ownerId: string): boolean {
    return this.equippedWeapons.delete(ownerId);
  }

  getEquippedWeapon(ownerId: string): WeaponInstance | undefined {
    return this.equippedWeapons.get(ownerId);
  }

  hasWeapon(ownerId: string): boolean {
    return this.equippedWeapons.has(ownerId);
  }

  useWeapon(ownerId: string): { damage: number; destroyed: boolean } {
    const weapon = this.equippedWeapons.get(ownerId);
    if (!weapon) {
      return { damage: 0, destroyed: false };
    }

    const damage = weapon.currentAttack;
    weapon.currentDurability--;

    const destroyed = weapon.currentDurability <= 0;
    if (destroyed) {
      this.destroyWeapon(ownerId);
    }

    return { damage, destroyed };
  }

  buffWeapon(ownerId: string, attack: number, durability: number): boolean {
    const weapon = this.equippedWeapons.get(ownerId);
    if (!weapon) return false;

    weapon.currentAttack += attack;
    weapon.currentDurability += durability;
    return true;
  }

  getWeaponAttack(ownerId: string): number {
    return this.equippedWeapons.get(ownerId)?.currentAttack || 0;
  }
}

export const weaponService = new WeaponService();
