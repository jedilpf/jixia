// CardEffectService - 卡牌效果服务
// 提供卡牌效果解析、执行、条件判断等功能

import type { Card } from "../types/new";

export type EffectType =
  | "damage"
  | "heal"
  | "draw"
  | "summon"
  | "buff"
  | "debuff"
  | "destroy"
  | "return"
  | "discard"
  | "armor"
  | "mana"
  | "transform"
  | "copy"
  | "steal"
  | "silence"
  | "freeze"
  | "taunt"
  | "charge"
  | "divineShield"
  | "windfury"
  | "stealth"
  | "poisonous"
  | "lifesteal"
  | "rush"
  | "reborn"
  | "spellDamage"
  | "invoke"
  | "discover"
  | "adapt"
  | "quest"
  | "reward"
  | "secret"
  | "combo"
  | "overload"
  | "spellburst"
  | "frenzy"
  | "honorableKill"
  | "deathrattle"
  | "battlecry"
  | "inspire"
  | "joust"
  | "chooseOne"
  | "tradeable"
  | "forge"
  | "manathirst"
  | "finale"
  | "overheal";

export type EffectTarget =
  | "self"
  | "enemy"
  | "allEnemies"
  | "randomEnemy"
  | "ally"
  | "allAllies"
  | "randomAlly"
  | "all"
  | "hero"
  | "enemyHero"
  | "allyHero"
  | "minion"
  | "enemyMinion"
  | "allyMinion"
  | "allMinions"
  | "weapon"
  | "hand"
  | "deck"
  | "graveyard"
  | "target";

export type EffectTrigger =
  | "play"
  | "death"
  | "attack"
  | "damaged"
  | "healed"
  | "turnStart"
  | "turnEnd"
  | "draw"
  | "summon"
  | "spellCast"
  | "secretRevealed"
  | "weaponEquip"
  | "weaponDestroy"
  | "heroPower"
  | "minionDied"
  | "cardDiscarded"
  | "armorGained"
  | "combo"
  | "inspire"
  | "joust"
  | "discover"
  | "overheal"
  | "honorableKill"
  | "frenzy"
  | "spellburst"
  | "finale"
  | "manathirst"
  | "trade"
  | "forge";

export interface EffectCondition {
  type: "hasCard" | "hasMinion" | "hasWeapon" | "hasSecret" | "hasMana" | "hasHealth" | "hasArmor" | "isDamaged" | "isFrozen" | "hasTaunt" | "hasDivineShield" | "hasStealth" | "hasWindfury" | "hasPoisonous" | "hasLifesteal" | "hasRush" | "hasReborn" | "hasDeathrattle" | "hasBattlecry" | "hasSpellDamage" | "hasCombo" | "hasOverload" | "hasQuest" | "hasReward" | "hasAdapt" | "hasInvoke" | "hasTradeable" | "hasForge" | "hasManathirst" | "hasFinale" | "hasOverheal" | "hasFrenzy" | "hasHonorableKill" | "hasSpellburst" | "hasChooseOne" | "hasJoust" | "hasInspire" | "hasDiscover";
  target?: EffectTarget;
  value?: number | string | boolean;
  operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte";
}

export interface CardEffect {
  id: string;
  type: EffectType;
  target: EffectTarget;
  value?: number | string | unknown;
  trigger?: EffectTrigger;
  condition?: EffectCondition;
  randomCount?: number;
  duration?: number;
  isRepeatable?: boolean;
  isOptional?: boolean;
  options?: CardEffect[];
  chain?: CardEffect[];
}

export interface EffectContext {
  source: Card;
  caster: string;
  target?: Card | string;
  gameState: unknown;
  trigger?: EffectTrigger;
}

export interface EffectResult {
  success: boolean;
  effect: CardEffect;
  targets: (Card | string)[];
  value: unknown;
  sideEffects?: EffectResult[];
}

export type EffectHandler = (effect: CardEffect, context: EffectContext) => EffectResult | Promise<EffectResult>;

export class CardEffectService {
  private effectHandlers: Map<EffectType, EffectHandler> = new Map();
  private conditionCheckers: Map<EffectCondition["type"], (condition: EffectCondition, context: EffectContext) => boolean> = new Map();

  constructor() {
    this.registerDefaultHandlers();
    this.registerDefaultConditionCheckers();
  }

  private registerDefaultHandlers(): void {
    // Damage effect
    this.registerEffectHandler("damage", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);
      const damage = Number(effect.value) || 0;

      return {
        success: true,
        effect,
        targets,
        value: damage,
      };
    });

    // Heal effect
    this.registerEffectHandler("heal", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);
      const heal = Number(effect.value) || 0;

      return {
        success: true,
        effect,
        targets,
        value: heal,
      };
    });

    // Draw effect
    this.registerEffectHandler("draw", (effect, context) => {
      const count = Number(effect.value) || 1;

      return {
        success: true,
        effect,
        targets: [context.caster],
        value: count,
      };
    });

    // Summon effect
    this.registerEffectHandler("summon", (effect, context) => {
      const minionId = String(effect.value);
      const count = effect.randomCount || 1;

      return {
        success: true,
        effect,
        targets: [],
        value: { minionId, count },
      };
    });

    // Buff effect
    this.registerEffectHandler("buff", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: effect.value,
      };
    });

    // Armor effect
    this.registerEffectHandler("armor", (effect, context) => {
      const armor = Number(effect.value) || 0;

      return {
        success: true,
        effect,
        targets: [context.caster],
        value: armor,
      };
    });

    // Mana effect
    this.registerEffectHandler("mana", (effect, context) => {
      const mana = Number(effect.value) || 0;

      return {
        success: true,
        effect,
        targets: [context.caster],
        value: mana,
      };
    });

    // Destroy effect
    this.registerEffectHandler("destroy", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: null,
      };
    });

    // Return effect
    this.registerEffectHandler("return", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: null,
      };
    });

    // Discard effect
    this.registerEffectHandler("discard", (effect, context) => {
      const count = Number(effect.value) || 1;

      return {
        success: true,
        effect,
        targets: [context.caster],
        value: count,
      };
    });

    // Copy effect
    this.registerEffectHandler("copy", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: effect.value,
      };
    });

    // Steal effect
    this.registerEffectHandler("steal", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: null,
      };
    });

    // Silence effect
    this.registerEffectHandler("silence", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: null,
      };
    });

    // Freeze effect
    this.registerEffectHandler("freeze", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: effect.duration || 1,
      };
    });

    // Keyword effects
    const keywordEffects: EffectType[] = [
      "taunt", "charge", "divineShield", "windfury", "stealth",
      "poisonous", "lifesteal", "rush", "reborn", "spellDamage",
    ];

    keywordEffects.forEach((keyword) => {
      this.registerEffectHandler(keyword, (effect, context) => {
        const targets = this.resolveTargets(effect.target, context);

        return {
          success: true,
          effect,
          targets,
          value: effect.value ?? true,
        };
      });
    });

    // Complex effects
    this.registerEffectHandler("discover", (effect, context) => {
      const options = effect.options || [];

      return {
        success: true,
        effect,
        targets: [context.caster],
        value: options,
      };
    });

    this.registerEffectHandler("adapt", (effect, context) => {
      const targets = this.resolveTargets(effect.target, context);

      return {
        success: true,
        effect,
        targets,
        value: effect.options || [],
      };
    });

    this.registerEffectHandler("invoke", (effect, context) => {
      return {
        success: true,
        effect,
        targets: [],
        value: effect.value,
      };
    });

    this.registerEffectHandler("quest", (effect, context) => {
      return {
        success: true,
        effect,
        targets: [context.caster],
        value: effect.value,
      };
    });

    this.registerEffectHandler("secret", (effect, context) => {
      return {
        success: true,
        effect,
        targets: [context.caster],
        value: effect.value,
      };
    });
  }

  private registerDefaultConditionCheckers(): void {
    this.conditionCheckers.set("hasMana", (condition, context) => {
      // Check if caster has enough mana
      return true;
    });

    this.conditionCheckers.set("hasCard", (condition, context) => {
      // Check if target has specific card
      return true;
    });

    this.conditionCheckers.set("hasMinion", (condition, context) => {
      // Check if board has minions
      return true;
    });

    this.conditionCheckers.set("isDamaged", (condition, context) => {
      // Check if target is damaged
      return true;
    });

    this.conditionCheckers.set("hasTaunt", (condition, context) => {
      // Check if target has taunt
      return true;
    });
  }

  registerEffectHandler(type: EffectType, handler: EffectHandler): void {
    this.effectHandlers.set(type, handler);
  }

  registerConditionChecker(
    type: EffectCondition["type"],
    checker: (condition: EffectCondition, context: EffectContext) => boolean
  ): void {
    this.conditionCheckers.set(type, checker);
  }

  async executeEffect(effect: CardEffect, context: EffectContext): Promise<EffectResult> {
    // Check condition
    if (effect.condition && !this.checkCondition(effect.condition, context)) {
      return {
        success: false,
        effect,
        targets: [],
        value: null,
      };
    }

    // Get handler
    const handler = this.effectHandlers.get(effect.type);
    if (!handler) {
      return {
        success: false,
        effect,
        targets: [],
        value: null,
      };
    }

    // Execute effect
    const result = await handler(effect, context);

    // Execute chain effects
    if (effect.chain && result.success) {
      const sideEffects: EffectResult[] = [];
      for (const chainEffect of effect.chain) {
        const chainResult = await this.executeEffect(chainEffect, context);
        sideEffects.push(chainResult);
      }
      result.sideEffects = sideEffects;
    }

    return result;
  }

  async executeEffects(effects: CardEffect[], context: EffectContext): Promise<EffectResult[]> {
    const results: EffectResult[] = [];

    for (const effect of effects) {
      const result = await this.executeEffect(effect, context);
      results.push(result);
    }

    return results;
  }

  checkCondition(condition: EffectCondition, context: EffectContext): boolean {
    const checker = this.conditionCheckers.get(condition.type);
    if (!checker) return true;
    return checker(condition, context);
  }

  private resolveTargets(targetType: EffectTarget, context: EffectContext): (Card | string)[] {
    // This would integrate with game state to resolve actual targets
    switch (targetType) {
      case "self":
        return [context.source];
      case "target":
        return context.target ? [context.target] : [];
      case "enemyHero":
        return ["enemyHero"];
      case "allyHero":
        return ["allyHero"];
      default:
        return [];
    }
  }

  parseEffect(effectString: string): CardEffect | null {
    try {
      return JSON.parse(effectString) as CardEffect;
    } catch {
      return null;
    }
  }

  serializeEffect(effect: CardEffect): string {
    return JSON.stringify(effect);
  }

  createEffect(
    type: EffectType,
    target: EffectTarget,
    value?: number | string | unknown,
    options?: Partial<CardEffect>
  ): CardEffect {
    return {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      target,
      value,
      ...options,
    };
  }

  cloneEffect(effect: CardEffect): CardEffect {
    return {
      ...effect,
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  combineEffects(effects: CardEffect[]): CardEffect {
    return {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: effects[0]?.type || "damage",
      target: effects[0]?.target || "all",
      chain: effects,
    };
  }

  getEffectDescription(effect: CardEffect): string {
    const descriptions: Record<EffectType, string> = {
      damage: `造成 ${effect.value} 点伤害`,
      heal: `恢复 ${effect.value} 点生命值`,
      draw: `抽 ${effect.value} 张牌`,
      summon: `召唤 ${effect.value}`,
      buff: `获得增益效果`,
      debuff: `获得减益效果`,
      destroy: `消灭目标`,
      return: `将目标移回手牌`,
      discard: `弃掉 ${effect.value} 张牌`,
      armor: `获得 ${effect.value} 点护甲`,
      mana: `获得 ${effect.value} 点法力水晶`,
      transform: `变形为 ${effect.value}`,
      copy: `复制目标`,
      steal: `偷取目标`,
      silence: `沉默目标`,
      freeze: `冻结目标`,
      taunt: "嘲讽",
      charge: "冲锋",
      divineShield: "圣盾",
      windfury: "风怒",
      stealth: "潜行",
      poisonous: "剧毒",
      lifesteal: "吸血",
      rush: "突袭",
      reborn: "复生",
      spellDamage: "法术伤害",
      invoke: "祈求",
      discover: "发现",
      adapt: "进化",
      quest: "任务",
      reward: "奖励",
      secret: "奥秘",
      combo: "连击",
      overload: "过载",
      spellburst: "法术迸发",
      frenzy: "暴怒",
      honorableKill: "荣誉消灭",
      deathrattle: "亡语",
      battlecry: "战吼",
      inspire: "激励",
      joust: "枪术对决",
      chooseOne: "抉择",
      tradeable: "可交易",
      forge: "锻造",
      manathirst: "法力渴求",
      finale: "压轴",
      overheal: "过量治疗",
    };

    return descriptions[effect.type] || effect.type;
  }

  hasKeyword(effect: CardEffect, keyword: EffectType): boolean {
    if (effect.type === keyword) return true;
    if (effect.chain) {
      return effect.chain.some((e) => this.hasKeyword(e, keyword));
    }
    return false;
  }

  getKeywords(effect: CardEffect): EffectType[] {
    const keywords: EffectType[] = [];

    if (this.isKeywordEffect(effect.type)) {
      keywords.push(effect.type);
    }

    if (effect.chain) {
      effect.chain.forEach((e) => {
        keywords.push(...this.getKeywords(e));
      });
    }

    return [...new Set(keywords)];
  }

  private isKeywordEffect(type: EffectType): boolean {
    const keywords: EffectType[] = [
      "taunt", "charge", "divineShield", "windfury", "stealth",
      "poisonous", "lifesteal", "rush", "reborn", "spellDamage",
      "deathrattle", "battlecry", "combo", "overload", "secret",
      "quest", "inspire", "joust", "discover", "adapt",
      "invoke", "tradeable", "forge", "manathirst", "finale",
      "overheal", "frenzy", "honorableKill", "spellburst",
    ];
    return keywords.includes(type);
  }
}

export const cardEffectService = new CardEffectService();
