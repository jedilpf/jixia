/**
 * 同步对战AI托管控制器
 *
 * 当玩家断线或延迟过高时，AI自动接管操作
 */

import type { SyncTurnState, SelectedCard } from "../types/syncBattle";
import type { Card, PlayerId } from "../types/domain";

interface AIControllerConfig {
  reactionDelay: number;      // AI反应延迟(毫秒)
  aggressiveness: number;     // 进攻性 (0-1)
  randomness: number;         // 随机性 (0-1)
}

const DEFAULT_AI_CONFIG: AIControllerConfig = {
  reactionDelay: 500,
  aggressiveness: 0.7,
  randomness: 0.2,
};

export class SyncAIController {
  private playerId: PlayerId;
  private config: AIControllerConfig;
  private isActive: boolean = false;
  private decisionTimer: NodeJS.Timeout | null = null;
  private onAction: ((action: AIAction) => void) | null = null;

  constructor(playerId: PlayerId, config: Partial<AIControllerConfig> = {}) {
    this.playerId = playerId;
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
  }

  /**
   * 启动AI托管
   */
  activate(state: SyncTurnState, hand: Card[]): void {
    if (this.isActive) return;

    this.isActive = true;
    console.log(`[SyncAI] Activated for ${this.playerId}`);

    // 根据当前阶段开始决策
    this.makeDecision(state, hand);
  }

  /**
   * 停止AI托管
   */
  deactivate(): void {
    this.isActive = false;
    if (this.decisionTimer) {
      clearTimeout(this.decisionTimer);
      this.decisionTimer = null;
    }
    console.log(`[SyncAI] Deactivated for ${this.playerId}`);
  }

  /**
   * 状态更新时重新决策
   */
  onStateUpdate(state: SyncTurnState, hand: Card[]): void {
    if (!this.isActive) return;

    // 取消之前的决策
    if (this.decisionTimer) {
      clearTimeout(this.decisionTimer);
    }

    // 延迟后重新决策
    this.decisionTimer = setTimeout(() => {
      this.makeDecision(state, hand);
    }, this.config.reactionDelay);
  }

  /**
   * AI决策逻辑
   */
  private makeDecision(state: SyncTurnState, hand: Card[]): void {
    if (!this.isActive) return;

    const { currentPhase, playerActions } = state;
    const myActions =
      this.playerId === "player" ? playerActions : state.enemyActions;

    // 如果已经选择了最大数量的卡牌，不再选择
    if (myActions.selectedCards.length >= 3) {
      return;
    }

    // 根据阶段和可用卡牌做出决策
    const availableCards = hand.filter((_, index) =>
      myActions.selectedCards.every((selected) => selected.handIndex !== index)
    );

    if (availableCards.length === 0) return;

    // 评估每张卡牌的价值
    const evaluatedCards = availableCards.map((card, index) => ({
      card,
      handIndex: hand.indexOf(card),
      score: this.evaluateCard(card, state),
    }));

    // 排序并选择最优卡牌
    evaluatedCards.sort((a, b) => b.score - a.score);

    // 添加随机性
    const topCards = evaluatedCards.slice(
      0,
      Math.max(1, Math.ceil(evaluatedCards.length * 0.3))
    );
    const selected =
      topCards[Math.floor(Math.random() * topCards.length)];

    if (selected) {
      this.executeAction({
        type: "SELECT_CARD",
        handIndex: selected.handIndex,
        card: selected.card,
      });
    }
  }

  /**
   * 评估卡牌价值
   */
  private evaluateCard(card: Card, state: SyncTurnState): number {
    let score = 0;

    // 基础价值：费用越高价值越高
    score += card.cost * 10;

    // 根据类型评估
    switch (card.type) {
      case "character":
        score += 20; // 随从价值较高
        break;
      case "skill":
        score += 15; // 技能价值中等
        break;
      case "event":
        score += 10;
        break;
      default:
        score += 5;
    }

    // 根据进攻性调整
    if (this.config.aggressiveness > 0.5) {
      // 高进攻性：优先选择攻击类卡牌
      if (card.skillDesc?.includes("伤害")) {
        score += 15;
      }
    } else {
      // 低进攻性：优先选择防御/治疗类卡牌
      if (card.skillDesc?.includes("治疗") || card.skillDesc?.includes("护盾")) {
        score += 15;
      }
    }

    // 添加随机因素
    score += (Math.random() - 0.5) * 20 * this.config.randomness;

    return score;
  }

  /**
   * 执行AI动作
   */
  private executeAction(action: AIAction): void {
    if (!this.isActive) return;

    console.log("[SyncAI] Executing action:", action);
    this.onAction?.(action);
  }

  /**
   * 设置动作回调
   */
  onActionCallback(callback: (action: AIAction) => void): void {
    this.onAction = callback;
  }

  /**
   * 检查是否处于托管状态
   */
  isAIActive(): boolean {
    return this.isActive;
  }
}

// AI动作类型
export type AIActionType = "SELECT_CARD" | "DESELECT_CARD" | "REORDER_CARDS";

export interface AIAction {
  type: AIActionType;
  handIndex?: number;
  card?: Card;
  newOrder?: number[];
}

export default SyncAIController;
