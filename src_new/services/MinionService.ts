// MinionService - 随从服务
// 提供随从管理、召唤、属性计算等功能

export interface MinionTemplate {
  id: string;
  name: string;
  cost: number;
  attack: number;
  health: number;
  keywords: string[];
  effects: string[];
  tribe?: string;
  isLegendary?: boolean;
  isElite?: boolean;
}

export interface MinionInstance {
  id: string;
  templateId: string;
  ownerId: string;
  currentAttack: number;
  currentHealth: number;
  maxHealth: number;
  keywords: Set<string>;
  buffs: string[];
  canAttack: boolean;
  hasAttacked: boolean;
  isDead: boolean;
  summonTurn: number;
}

export class MinionService {
  private templates: Map<string, MinionTemplate> = new Map();
  private minions: Map<string, MinionInstance[]> = new Map();

  registerTemplate(template: MinionTemplate): void {
    this.templates.set(template.id, template);
  }

  summonMinion(templateId: string, ownerId: string, turn: number): MinionInstance | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const minion: MinionInstance = {
      id: `minion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      ownerId,
      currentAttack: template.attack,
      currentHealth: template.health,
      maxHealth: template.health,
      keywords: new Set(template.keywords),
      buffs: [],
      canAttack: template.keywords.includes("charge") || template.keywords.includes("rush"),
      hasAttacked: false,
      isDead: false,
      summonTurn: turn,
    };

    if (!this.minions.has(ownerId)) {
      this.minions.set(ownerId, []);
    }
    this.minions.get(ownerId)!.push(minion);

    return minion;
  }

  getMinions(ownerId: string): MinionInstance[] {
    return this.minions.get(ownerId) || [];
  }

  getMinion(minionId: string, ownerId: string): MinionInstance | undefined {
    return this.getMinions(ownerId).find((m) => m.id === minionId);
  }

  removeMinion(minionId: string, ownerId: string): boolean {
    const minions = this.minions.get(ownerId);
    if (!minions) return false;

    const index = minions.findIndex((m) => m.id === minionId);
    if (index === -1) return false;

    minions.splice(index, 1);
    return true;
  }

  damageMinion(minionId: string, ownerId: string, damage: number): boolean {
    const minion = this.getMinion(minionId, ownerId);
    if (!minion || minion.isDead) return false;

    // Check divine shield
    if (minion.keywords.has("divineShield")) {
      minion.keywords.delete("divineShield");
      return true;
    }

    minion.currentHealth -= damage;
    if (minion.currentHealth <= 0) {
      minion.isDead = true;
    }

    return true;
  }

  healMinion(minionId: string, ownerId: string, heal: number): boolean {
    const minion = this.getMinion(minionId, ownerId);
    if (!minion || minion.isDead) return false;

    minion.currentHealth = Math.min(minion.maxHealth, minion.currentHealth + heal);
    return true;
  }

  buffMinion(minionId: string, ownerId: string, attack: number, health: number): boolean {
    const minion = this.getMinion(minionId, ownerId);
    if (!minion || minion.isDead) return false;

    minion.currentAttack += attack;
    minion.currentHealth += health;
    minion.maxHealth += health;

    return true;
  }

  resetAttackFlags(ownerId: string): void {
    const minions = this.getMinions(ownerId);
    minions.forEach((m) => {
      m.hasAttacked = false;
      m.canAttack = true;
    });
  }

  canMinionAttack(minionId: string, ownerId: string): boolean {
    const minion = this.getMinion(minionId, ownerId);
    if (!minion) return false;
    return minion.canAttack && !minion.hasAttacked && !minion.keywords.has("freeze");
  }
}

export const minionService = new MinionService();
