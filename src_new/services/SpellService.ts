// SpellService - 法术服务
// 提供法术管理、施放、效果结算等功能

export interface SpellTemplate {
  id: string;
  name: string;
  cost: number;
  damage?: number;
  heal?: number;
  draw?: number;
  armor?: number;
  effects: string[];
  target: "none" | "target" | "allEnemies" | "allAllies" | "all";
  isSecret?: boolean;
  isQuest?: boolean;
  school?: "arcane" | "fire" | "frost" | "nature" | "shadow" | "holy";
}

export interface SpellCastResult {
  success: boolean;
  spellId: string;
  damage?: number;
  heal?: number;
  cardsDrawn?: number;
  armor?: number;
  targets?: string[];
  message?: string;
}

export class SpellService {
  private templates: Map<string, SpellTemplate> = new Map();

  registerTemplate(template: SpellTemplate): void {
    this.templates.set(template.id, template);
  }

  castSpell(
    spellId: string,
    casterId: string,
    target?: string
  ): SpellCastResult {
    const template = this.templates.get(spellId);
    if (!template) {
      return { success: false, spellId, message: "法术不存在" };
    }

    const result: SpellCastResult = {
      success: true,
      spellId,
      damage: template.damage,
      heal: template.heal,
      cardsDrawn: template.draw,
      armor: template.armor,
      targets: target ? [target] : undefined,
    };

    return result;
  }

  getSpellCost(spellId: string): number {
    return this.templates.get(spellId)?.cost || 0;
  }

  getSpellTemplate(spellId: string): SpellTemplate | undefined {
    return this.templates.get(spellId);
  }
}

export const spellService = new SpellService();
