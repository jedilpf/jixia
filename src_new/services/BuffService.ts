// BuffService - Buff/Debuff管理服务
// 提供增益/减益效果的管理、触发、过期处理等功能

export type BuffType = 
  | "attack"
  | "health"
  | "armor"
  | "spellDamage"
  | "manaCost"
  | "attackSpeed"
  | "moveSpeed"
  | "critRate"
  | "critDamage"
  | "dodge"
  | "block"
  | "lifesteal"
  | "reflect"
  | "immune"
  | "invulnerable"
  | "silence"
  | "stun"
  | "root"
  | "disarm"
  | "blind"
  | "burn"
  | "poison"
  | "bleed"
  | "freeze"
  | "slow"
  | "weak"
  | "vulnerable"
  | "taunt"
  | "stealth"
  | "shield"
  | "regen"
  | "fury"
  | "energy"
  | "combo"
  | "divine"
  | "curse"
  | "blessing";

export type BuffStackType = "none" | "intensity" | "duration" | "both";

export interface BuffConfig {
  id: string;
  name: string;
  description: string;
  type: BuffType;
  isDebuff: boolean;
  value: number;
  duration: number; // -1 for permanent, 0 for instant
  maxStacks: number;
  stackType: BuffStackType;
  refreshOnReapply: boolean;
  isDispellable: boolean;
  isStealable: boolean;
  icon?: string;
  color?: string;
  particleEffect?: string;
  soundEffect?: string;
}

export interface BuffInstance {
  id: string;
  configId: string;
  targetId: string;
  casterId: string;
  stacks: number;
  remainingDuration: number;
  totalDuration: number;
  value: number;
  appliedAt: number;
  sourceCardId?: string;
  isActive: boolean;
}

export interface BuffModifier {
  attack?: number;
  health?: number;
  armor?: number;
  spellDamage?: number;
  manaCost?: number;
  attackSpeed?: number;
  moveSpeed?: number;
  critRate?: number;
  critDamage?: number;
  dodge?: number;
  block?: number;
  lifesteal?: number;
  reflect?: number;
}

export type BuffEventType = 
  | "applied"
  | "removed"
  | "expired"
  | "dispelled"
  | "stolen"
  | "refreshed"
  | "stackAdded"
  | "tick"
  | "triggered";

export interface BuffEvent {
  type: BuffEventType;
  buff: BuffInstance;
  targetId: string;
  timestamp: number;
  data?: unknown;
}

type BuffEventCallback = (event: BuffEvent) => void;

export class BuffService {
  private buffConfigs: Map<string, BuffConfig> = new Map();
  private activeBuffs: Map<string, BuffInstance[]> = new Map(); // targetId -> buffs
  private listeners: Set<BuffEventCallback> = new Set();
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  constructor() {
    this.registerDefaultBuffs();
  }

  private registerDefaultBuffs(): void {
    // Positive buffs
    this.registerBuffConfig({
      id: "buff_attack_up",
      name: "攻击提升",
      description: "攻击力提升",
      type: "attack",
      isDebuff: false,
      value: 2,
      duration: 3,
      maxStacks: 3,
      stackType: "intensity",
      refreshOnReapply: true,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "buff_health_regen",
      name: "生命恢复",
      description: "每回合恢复生命值",
      type: "regen",
      isDebuff: false,
      value: 2,
      duration: 3,
      maxStacks: 5,
      stackType: "intensity",
      refreshOnReapply: true,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "buff_divine_shield",
      name: "圣盾",
      description: "免疫下一次伤害",
      type: "divine",
      isDebuff: false,
      value: 1,
      duration: -1,
      maxStacks: 1,
      stackType: "none",
      refreshOnReapply: false,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "buff_stealth",
      name: "潜行",
      description: "无法被选中为目标",
      type: "stealth",
      isDebuff: false,
      value: 1,
      duration: -1,
      maxStacks: 1,
      stackType: "none",
      refreshOnReapply: false,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "buff_taunt",
      name: "嘲讽",
      description: "敌人必须攻击此目标",
      type: "taunt",
      isDebuff: false,
      value: 1,
      duration: -1,
      maxStacks: 1,
      stackType: "none",
      refreshOnReapply: false,
      isDispellable: true,
      isStealable: false,
    });

    // Negative buffs (debuffs)
    this.registerBuffConfig({
      id: "debuff_burn",
      name: "燃烧",
      description: "每回合受到伤害",
      type: "burn",
      isDebuff: true,
      value: 2,
      duration: 3,
      maxStacks: 5,
      stackType: "intensity",
      refreshOnReapply: true,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "debuff_poison",
      name: "中毒",
      description: "每回合受到伤害，无视护甲",
      type: "poison",
      isDebuff: true,
      value: 1,
      duration: 3,
      maxStacks: 10,
      stackType: "intensity",
      refreshOnReapply: true,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "debuff_freeze",
      name: "冻结",
      description: "无法行动",
      type: "freeze",
      isDebuff: true,
      value: 1,
      duration: 1,
      maxStacks: 1,
      stackType: "duration",
      refreshOnReapply: true,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "debuff_silence",
      name: "沉默",
      description: "无法使用技能",
      type: "silence",
      isDebuff: true,
      value: 1,
      duration: 2,
      maxStacks: 1,
      stackType: "duration",
      refreshOnReapply: true,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "debuff_stun",
      name: "眩晕",
      description: "无法行动",
      type: "stun",
      isDebuff: true,
      value: 1,
      duration: 1,
      maxStacks: 1,
      stackType: "duration",
      refreshOnReapply: false,
      isDispellable: true,
      isStealable: false,
    });

    this.registerBuffConfig({
      id: "debuff_weak",
      name: "虚弱",
      description: "攻击力降低",
      type: "weak",
      isDebuff: true,
      value: 2,
      duration: 3,
      maxStacks: 3,
      stackType: "intensity",
      refreshOnReapply: true,
      isDispellable: true,
      isStealable: false,
    });
  }

  registerBuffConfig(config: BuffConfig): void {
    this.buffConfigs.set(config.id, config);
  }

  getBuffConfig(id: string): BuffConfig | undefined {
    return this.buffConfigs.get(id);
  }

  applyBuff(
    configId: string,
    targetId: string,
    casterId: string,
    customDuration?: number,
    sourceCardId?: string
  ): BuffInstance | null {
    const config = this.buffConfigs.get(configId);
    if (!config) return null;

    const existingBuffs = this.getBuffsOnTarget(targetId);
    const existingBuff = existingBuffs.find((b) => b.configId === configId);

    if (existingBuff) {
      // Reapply logic
      if (config.refreshOnReapply) {
        existingBuff.remainingDuration = customDuration ?? config.duration;
        existingBuff.totalDuration = customDuration ?? config.duration;
      }

      // Stack logic
      if (config.maxStacks > 1 && existingBuff.stacks < config.maxStacks) {
        existingBuff.stacks++;
        if (config.stackType === "intensity") {
          existingBuff.value += config.value;
        }
        this.emitEvent({
          type: "stackAdded",
          buff: existingBuff,
          targetId,
          timestamp: Date.now(),
        });
      }

      this.emitEvent({
        type: "refreshed",
        buff: existingBuff,
        targetId,
        timestamp: Date.now(),
      });

      return existingBuff;
    }

    // Create new buff
    const buff: BuffInstance = {
      id: `buff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      configId,
      targetId,
      casterId,
      stacks: 1,
      remainingDuration: customDuration ?? config.duration,
      totalDuration: customDuration ?? config.duration,
      value: config.value,
      appliedAt: Date.now(),
      sourceCardId,
      isActive: true,
    };

    if (!this.activeBuffs.has(targetId)) {
      this.activeBuffs.set(targetId, []);
    }
    this.activeBuffs.get(targetId)!.push(buff);

    this.emitEvent({
      type: "applied",
      buff,
      targetId,
      timestamp: Date.now(),
    });

    return buff;
  }

  removeBuff(buffId: string, targetId: string): boolean {
    const buffs = this.activeBuffs.get(targetId);
    if (!buffs) return false;

    const index = buffs.findIndex((b) => b.id === buffId);
    if (index === -1) return false;

    const buff = buffs[index];
    buff.isActive = false;
    buffs.splice(index, 1);

    this.emitEvent({
      type: "removed",
      buff,
      targetId,
      timestamp: Date.now(),
    });

    return true;
  }

  removeBuffsByConfig(targetId: string, configId: string): number {
    const buffs = this.activeBuffs.get(targetId);
    if (!buffs) return 0;

    const toRemove = buffs.filter((b) => b.configId === configId);
    toRemove.forEach((buff) => this.removeBuff(buff.id, targetId));

    return toRemove.length;
  }

  removeAllBuffs(targetId: string, includeDebuffs = true): number {
    const buffs = this.activeBuffs.get(targetId);
    if (!buffs) return 0;

    const toRemove = includeDebuffs
      ? [...buffs]
      : buffs.filter((b) => !this.buffConfigs.get(b.configId)?.isDebuff);

    toRemove.forEach((buff) => this.removeBuff(buff.id, targetId));

    return toRemove.length;
  }

  dispelBuffs(targetId: string, count: number = Infinity): number {
    const buffs = this.activeBuffs.get(targetId);
    if (!buffs) return 0;

    const dispellable = buffs
      .filter((b) => this.buffConfigs.get(b.configId)?.isDispellable)
      .slice(0, count);

    dispellable.forEach((buff) => {
      this.removeBuff(buff.id, targetId);
      this.emitEvent({
        type: "dispelled",
        buff,
        targetId,
        timestamp: Date.now(),
      });
    });

    return dispellable.length;
  }

  stealBuff(buffId: string, fromTargetId: string, toTargetId: string): boolean {
    const buffs = this.activeBuffs.get(fromTargetId);
    if (!buffs) return false;

    const buff = buffs.find((b) => b.id === buffId);
    if (!buff) return false;

    const config = this.buffConfigs.get(buff.configId);
    if (!config?.isStealable) return false;

    // Remove from original target
    this.removeBuff(buffId, fromTargetId);

    // Apply to new target
    this.applyBuff(buff.configId, toTargetId, buff.casterId, buff.remainingDuration, buff.sourceCardId);

    this.emitEvent({
      type: "stolen",
      buff,
      targetId: toTargetId,
      timestamp: Date.now(),
      data: { fromTargetId },
    });

    return true;
  }

  getBuffsOnTarget(targetId: string): BuffInstance[] {
    return this.activeBuffs.get(targetId) || [];
  }

  getActiveBuffsOnTarget(targetId: string): BuffInstance[] {
    return this.getBuffsOnTarget(targetId).filter((b) => b.isActive);
  }

  getBuffsByType(targetId: string, type: BuffType): BuffInstance[] {
    return this.getBuffsOnTarget(targetId).filter((b) => {
      const config = this.buffConfigs.get(b.configId);
      return config?.type === type;
    });
  }

  hasBuff(targetId: string, configId: string): boolean {
    return this.getBuffsOnTarget(targetId).some((b) => b.configId === configId);
  }

  hasBuffType(targetId: string, type: BuffType): boolean {
    return this.getBuffsByType(targetId, type).length > 0;
  }

  getBuffValue(targetId: string, type: BuffType): number {
    const buffs = this.getBuffsByType(targetId, type);
    return buffs.reduce((sum, b) => sum + b.value, 0);
  }

  getTotalModifiers(targetId: string): BuffModifier {
    const buffs = this.getBuffsOnTarget(targetId);
    const modifier: BuffModifier = {};

    for (const buff of buffs) {
      const config = this.buffConfigs.get(buff.configId);
      if (!config) continue;

      const key = config.type as keyof BuffModifier;
      if (key in modifier) {
        modifier[key]! += buff.value;
      } else {
        (modifier as Record<string, number>)[key] = buff.value;
      }
    }

    return modifier;
  }

  tickBuffs(): void {
    for (const [targetId, buffs] of this.activeBuffs) {
      for (const buff of [...buffs]) {
        const config = this.buffConfigs.get(buff.configId);
        if (!config) continue;

        // Emit tick event for DoT/HoT effects
        this.emitEvent({
          type: "tick",
          buff,
          targetId,
          timestamp: Date.now(),
        });

        // Decrease duration
        if (buff.remainingDuration > 0) {
          buff.remainingDuration--;

          if (buff.remainingDuration <= 0) {
            this.removeBuff(buff.id, targetId);
            this.emitEvent({
              type: "expired",
              buff,
              targetId,
              timestamp: Date.now(),
            });
          }
        }
      }
    }
  }

  startTicking(intervalMs: number = 1000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tickInterval = setInterval(() => this.tickBuffs(), intervalMs);
  }

  stopTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.isRunning = false;
  }

  onBuffEvent(callback: BuffEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emitEvent(event: BuffEvent): void {
    this.listeners.forEach((callback) => callback(event));
  }

  extendDuration(targetId: string, configId: string, extraDuration: number): boolean {
    const buffs = this.getBuffsOnTarget(targetId);
    const buff = buffs.find((b) => b.configId === configId);
    if (!buff) return false;

    buff.remainingDuration += extraDuration;
    buff.totalDuration += extraDuration;
    return true;
  }

  reduceDuration(targetId: string, configId: string, reduceBy: number): boolean {
    const buffs = this.getBuffsOnTarget(targetId);
    const buff = buffs.find((b) => b.configId === configId);
    if (!buff) return false;

    buff.remainingDuration = Math.max(0, buff.remainingDuration - reduceBy);
    if (buff.remainingDuration === 0) {
      this.removeBuff(buff.id, targetId);
    }
    return true;
  }

  transferBuff(buffId: string, fromTargetId: string, toTargetId: string): boolean {
    const buffs = this.activeBuffs.get(fromTargetId);
    if (!buffs) return false;

    const buff = buffs.find((b) => b.id === buffId);
    if (!buff) return false;

    // Remove from original
    this.removeBuff(buffId, fromTargetId);

    // Add to new target
    if (!this.activeBuffs.has(toTargetId)) {
      this.activeBuffs.set(toTargetId, []);
    }

    buff.targetId = toTargetId;
    this.activeBuffs.get(toTargetId)!.push(buff);

    return true;
  }

  getAllActiveBuffs(): Map<string, BuffInstance[]> {
    return new Map(this.activeBuffs);
  }

  clearAllBuffs(): void {
    this.activeBuffs.clear();
  }
}

export const buffService = new BuffService();
