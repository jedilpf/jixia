// SkillService - 技能服务
// 提供英雄技能管理、冷却、使用等功能

export type SkillType = "active" | "passive" | "toggle" | "channel";
export type SkillTarget = "self" | "target" | "area" | "direction" | "none";

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  target: SkillTarget;
  manaCost: number;
  cooldown: number; // turns
  duration?: number;
  range?: number;
  damage?: number;
  heal?: number;
  icon?: string;
  effects?: string[];
  upgradeLevels?: number[];
}

export interface SkillInstance {
  id: string;
  configId: string;
  ownerId: string;
  level: number;
  currentCooldown: number;
  isActive: boolean;
  isChanneling: boolean;
  channelProgress: number;
}

export interface SkillUseResult {
  success: boolean;
  skill: SkillInstance;
  message?: string;
  damage?: number;
  heal?: number;
}

export class SkillService {
  private skillConfigs: Map<string, SkillConfig> = new Map();
  private playerSkills: Map<string, SkillInstance[]> = new Map();

  constructor() {
    this.registerDefaultSkills();
  }

  private registerDefaultSkills(): void {
    this.registerSkillConfig({
      id: "skill_fireball",
      name: "火球术",
      description: "发射火球造成魔法伤害",
      type: "active",
      target: "target",
      manaCost: 30,
      cooldown: 2,
      damage: 25,
      range: 5,
    });

    this.registerSkillConfig({
      id: "skill_heal",
      name: "治疗术",
      description: "恢复生命值",
      type: "active",
      target: "target",
      manaCost: 40,
      cooldown: 3,
      heal: 30,
      range: 4,
    });

    this.registerSkillConfig({
      id: "skill_shield",
      name: "护盾",
      description: "获得护盾吸收伤害",
      type: "active",
      target: "self",
      manaCost: 25,
      cooldown: 4,
      duration: 2,
    });
  }

  registerSkillConfig(config: SkillConfig): void {
    this.skillConfigs.set(config.id, config);
  }

  learnSkill(playerId: string, skillConfigId: string): SkillInstance | null {
    const config = this.skillConfigs.get(skillConfigId);
    if (!config) return null;

    const skill: SkillInstance = {
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      configId: skillConfigId,
      ownerId: playerId,
      level: 1,
      currentCooldown: 0,
      isActive: false,
      isChanneling: false,
      channelProgress: 0,
    };

    if (!this.playerSkills.has(playerId)) {
      this.playerSkills.set(playerId, []);
    }
    this.playerSkills.get(playerId)!.push(skill);

    return skill;
  }

  useSkill(skillId: string, playerId: string, target?: string): SkillUseResult {
    const skills = this.playerSkills.get(playerId);
    if (!skills) {
      return { success: false, skill: null as unknown as SkillInstance, message: "未找到技能" };
    }

    const skill = skills.find((s) => s.id === skillId);
    if (!skill) {
      return { success: false, skill: null as unknown as SkillInstance, message: "技能不存在" };
    }

    const config = this.skillConfigs.get(skill.configId);
    if (!config) {
      return { success: false, skill, message: "技能配置不存在" };
    }

    if (skill.currentCooldown > 0) {
      return { success: false, skill, message: "技能冷却中" };
    }

    // Use skill
    skill.currentCooldown = config.cooldown;
    
    return {
      success: true,
      skill,
      damage: config.damage,
      heal: config.heal,
    };
  }

  reduceCooldowns(playerId: string): void {
    const skills = this.playerSkills.get(playerId);
    if (!skills) return;

    skills.forEach((skill) => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  }

  getPlayerSkills(playerId: string): SkillInstance[] {
    return this.playerSkills.get(playerId) || [];
  }

  upgradeSkill(skillId: string, playerId: string): boolean {
    const skills = this.playerSkills.get(playerId);
    if (!skills) return false;

    const skill = skills.find((s) => s.id === skillId);
    if (!skill) return false;

    const config = this.skillConfigs.get(skill.configId);
    if (!config?.upgradeLevels) return false;

    if (skill.level >= config.upgradeLevels.length) return false;

    skill.level++;
    return true;
  }
}

export const skillService = new SkillService();
