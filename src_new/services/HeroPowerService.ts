// HeroPowerService - 英雄能力服务
// 提供英雄技能管理、使用、强化等功能

export interface HeroPowerConfig {
  id: string;
  name: string;
  description: string;
  cost: number;
  damage?: number;
  heal?: number;
  armor?: number;
  summon?: string;
  draw?: number;
  effects: string[];
  upgradeId?: string;
}

export interface HeroPowerState {
  configId: string;
  ownerId: string;
  isUsed: boolean;
  isUpgraded: boolean;
  useCount: number;
}

export interface HeroPowerResult {
  success: boolean;
  damage?: number;
  heal?: number;
  armor?: number;
  summon?: string;
  draw?: number;
  message?: string;
}

export class HeroPowerService {
  private configs: Map<string, HeroPowerConfig> = new Map();
  private states: Map<string, HeroPowerState> = new Map();

  constructor() {
    this.registerDefaultPowers();
  }

  private registerDefaultPowers(): void {
    this.registerConfig({
      id: "hero_power_armor_up",
      name: "全副武装",
      description: "获得2点护甲",
      cost: 2,
      armor: 2,
      effects: [],
    });

    this.registerConfig({
      id: "hero_power_fireblast",
      name: "火焰冲击",
      description: "造成1点伤害",
      cost: 2,
      damage: 1,
      effects: [],
    });

    this.registerConfig({
      id: "hero_power_heal",
      name: "次级治疗术",
      description: "恢复2点生命值",
      cost: 2,
      heal: 2,
      effects: [],
    });

    this.registerConfig({
      id: "hero_power_dagger_mastery",
      name: "匕首精通",
      description: "装备一把1/2的匕首",
      cost: 2,
      effects: ["equip_dagger"],
    });

    this.registerConfig({
      id: "hero_power_shapeshift",
      name: "变形",
      description: "获得1点攻击力和1点护甲",
      cost: 2,
      armor: 1,
      effects: ["hero_attack_1"],
    });

    this.registerConfig({
      id: "hero_power_life_tap",
      name: "生命分流",
      description: "抽一张牌，受到2点伤害",
      cost: 2,
      draw: 1,
      effects: ["self_damage_2"],
    });

    this.registerConfig({
      id: "hero_power_reinforce",
      name: "增援",
      description: "召唤一个1/1的白银之手新兵",
      cost: 2,
      summon: "silver_hand_recruit",
      effects: [],
    });

    this.registerConfig({
      id: "hero_power_steady_shot",
      name: "稳固射击",
      description: "对敌方英雄造成2点伤害",
      cost: 2,
      damage: 2,
      effects: ["target_enemy_hero"],
    });

    this.registerConfig({
      id: "hero_power_totemic_call",
      name: "图腾召唤",
      description: "随机召唤一个图腾",
      cost: 2,
      effects: ["summon_random_totem"],
    });

    this.registerConfig({
      id: "hero_power_mind_spike",
      name: "心灵尖刺",
      description: "造成2点伤害",
      cost: 2,
      damage: 2,
      effects: [],
      upgradeId: "hero_power_mind_shatter",
    });

    this.registerConfig({
      id: "hero_power_mind_shatter",
      name: "心灵碎裂",
      description: "造成3点伤害",
      cost: 2,
      damage: 3,
      effects: [],
    });
  }

  registerConfig(config: HeroPowerConfig): void {
    this.configs.set(config.id, config);
  }

  initializeHeroPower(playerId: string, configId: string): HeroPowerState {
    const state: HeroPowerState = {
      configId,
      ownerId: playerId,
      isUsed: false,
      isUpgraded: false,
      useCount: 0,
    };

    this.states.set(playerId, state);
    return state;
  }

  useHeroPower(playerId: string, target?: string): HeroPowerResult {
    const state = this.states.get(playerId);
    if (!state) {
      return { success: false, message: "英雄技能未初始化" };
    }

    if (state.isUsed) {
      return { success: false, message: "本回合已使用过英雄技能" };
    }

    const config = this.configs.get(state.configId);
    if (!config) {
      return { success: false, message: "英雄技能配置不存在" };
    }

    state.isUsed = true;
    state.useCount++;

    return {
      success: true,
      damage: config.damage,
      heal: config.heal,
      armor: config.armor,
      summon: config.summon,
      draw: config.draw,
    };
  }

  resetHeroPower(playerId: string): void {
    const state = this.states.get(playerId);
    if (state) {
      state.isUsed = false;
    }
  }

  upgradeHeroPower(playerId: string): boolean {
    const state = this.states.get(playerId);
    if (!state || state.isUpgraded) return false;

    const config = this.configs.get(state.configId);
    if (!config?.upgradeId) return false;

    state.configId = config.upgradeId;
    state.isUpgraded = true;
    return true;
  }

  getHeroPowerState(playerId: string): HeroPowerState | undefined {
    return this.states.get(playerId);
  }

  getHeroPowerCost(playerId: string): number {
    const state = this.states.get(playerId);
    if (!state) return 2;

    const config = this.configs.get(state.configId);
    return config?.cost || 2;
  }

  canUseHeroPower(playerId: string): boolean {
    const state = this.states.get(playerId);
    return state ? !state.isUsed : false;
  }

  getHeroPowerConfig(playerId: string): HeroPowerConfig | undefined {
    const state = this.states.get(playerId);
    if (!state) return undefined;

    return this.configs.get(state.configId);
  }
}

export const heroPowerService = new HeroPowerService();
