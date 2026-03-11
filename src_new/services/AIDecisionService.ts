export type NodeType = "selector" | "sequence" | "parallel" | "action" | "condition" | "decorator";

export type NodeStatus = "success" | "failure" | "running";

export interface BehaviorNode {
  id: string;
  type: NodeType;
  name: string;
  children?: BehaviorNode[];
  condition?: (context: AIContext) => boolean;
  action?: (context: AIContext) => NodeStatus | Promise<NodeStatus>;
  weight?: number;
  maxAttempts?: number;
}

export interface AIContext {
  gameState: unknown;
  playerId: string;
  turn: number;
  mana: number;
  hand: unknown[];
  field: unknown[];
  enemyHealth: number;
  playerHealth: number;
  [key: string]: unknown;
}

export interface DecisionResult {
  action: string;
  target?: string;
  priority: number;
  reason: string;
}

export class AIDecisionService {
  private trees: Map<string, BehaviorNode> = new Map();
  private runningNodes: Map<string, BehaviorNode> = new Map();

  registerTree(treeId: string, rootNode: BehaviorNode): void {
    this.trees.set(treeId, rootNode);
  }

  unregisterTree(treeId: string): boolean {
    return this.trees.delete(treeId);
  }

  async execute(treeId: string, context: AIContext): Promise<DecisionResult | null> {
    const tree = this.trees.get(treeId);
    if (!tree) {
      console.warn(`Behavior tree not found: ${treeId}`);
      return null;
    }

    const status = await this.executeNode(tree, context);

    if (status === "success") {
      return this.extractDecision(tree, context);
    }

    return null;
  }

  private async executeNode(node: BehaviorNode, context: AIContext): Promise<NodeStatus> {
    switch (node.type) {
      case "selector":
        return this.executeSelector(node, context);
      case "sequence":
        return this.executeSequence(node, context);
      case "parallel":
        return this.executeParallel(node, context);
      case "action":
        return this.executeAction(node, context);
      case "condition":
        return this.executeCondition(node, context);
      case "decorator":
        return this.executeDecorator(node, context);
      default:
        return "failure";
    }
  }

  private async executeSelector(node: BehaviorNode, context: AIContext): Promise<NodeStatus> {
    if (!node.children) return "failure";

    for (const child of node.children) {
      const status = await this.executeNode(child, context);
      if (status === "success") return "success";
      if (status === "running") return "running";
    }

    return "failure";
  }

  private async executeSequence(node: BehaviorNode, context: AIContext): Promise<NodeStatus> {
    if (!node.children) return "success";

    for (const child of node.children) {
      const status = await this.executeNode(child, context);
      if (status === "failure") return "failure";
      if (status === "running") return "running";
    }

    return "success";
  }

  private async executeParallel(node: BehaviorNode, context: AIContext): Promise<NodeStatus> {
    if (!node.children) return "success";

    const results = await Promise.all(
      node.children.map((child) => this.executeNode(child, context))
    );

    if (results.every((r) => r === "success")) return "success";
    if (results.some((r) => r === "failure")) return "failure";
    return "running";
  }

  private async executeAction(node: BehaviorNode, context: AIContext): Promise<NodeStatus> {
    if (!node.action) return "failure";

    try {
      const result = await node.action(context);
      return result;
    } catch (e) {
      console.error(`Action failed: ${node.name}`, e);
      return "failure";
    }
  }

  private executeCondition(node: BehaviorNode, context: AIContext): NodeStatus {
    if (!node.condition) return "failure";

    try {
      return node.condition(context) ? "success" : "failure";
    } catch (e) {
      console.error(`Condition failed: ${node.name}`, e);
      return "failure";
    }
  }

  private async executeDecorator(node: BehaviorNode, context: AIContext): Promise<NodeStatus> {
    if (!node.children || node.children.length === 0) return "failure";

    const child = node.children[0];
    const status = await this.executeNode(child, context);

    // Inverter decorator
    if (node.name === "Inverter") {
      if (status === "success") return "failure";
      if (status === "failure") return "success";
      return status;
    }

    // Repeat decorator
    if (node.name === "Repeat" && node.maxAttempts) {
      for (let i = 0; i < node.maxAttempts; i++) {
        const repeatStatus = await this.executeNode(child, context);
        if (repeatStatus === "failure") return "failure";
      }
      return "success";
    }

    return status;
  }

  private extractDecision(node: BehaviorNode, context: AIContext): DecisionResult {
    // Extract decision from the executed tree
    // This is a simplified version - in practice, you'd want to track which nodes were executed
    return {
      action: node.name,
      priority: node.weight || 0,
      reason: `Executed ${node.type} node: ${node.name}`,
    };
  }

  // Create common behavior trees
  createAggressiveTree(): BehaviorNode {
    return {
      id: "aggressive",
      type: "selector",
      name: "Aggressive AI",
      children: [
        {
          id: "lethal_check",
          type: "sequence",
          name: "Check Lethal",
          children: [
            {
              id: "can_win",
              type: "condition",
              name: "Can Win This Turn",
              condition: (ctx) => this.canWinThisTurn(ctx),
            },
            {
              id: "play_lethal",
              type: "action",
              name: "Play Lethal Cards",
              action: () => "success",
              weight: 100,
            },
          ],
        },
        {
          id: "play_minions",
          type: "sequence",
          name: "Play Minions",
          children: [
            {
              id: "has_minions",
              type: "condition",
              name: "Has Minions in Hand",
              condition: (ctx) => (ctx.hand as any[]).some((c) => c.type === "minion"),
            },
            {
              id: "play_best_minion",
              type: "action",
              name: "Play Best Minion",
              action: () => "success",
              weight: 50,
            },
          ],
        },
        {
          id: "attack_face",
          type: "action",
          name: "Attack Enemy Hero",
          action: () => "success",
          weight: 30,
        },
      ],
    };
  }

  createDefensiveTree(): BehaviorNode {
    return {
      id: "defensive",
      type: "selector",
      name: "Defensive AI",
      children: [
        {
          id: "survival_check",
          type: "sequence",
          name: "Check Survival",
          children: [
            {
              id: "low_health",
              type: "condition",
              name: "Low Health",
              condition: (ctx) => ctx.playerHealth < 10,
            },
            {
              id: "play_defensive",
              type: "action",
              name: "Play Defensive Cards",
              action: () => "success",
              weight: 90,
            },
          ],
        },
        {
          id: "board_control",
          type: "sequence",
          name: "Board Control",
          children: [
            {
              id: "enemy_has_threats",
              type: "condition",
              name: "Enemy Has Threats",
              condition: (ctx) => (ctx.field as any[]).some((c) => c.attack > 5),
            },
            {
              id: "remove_threats",
              type: "action",
              name: "Remove Threats",
              action: () => "success",
              weight: 70,
            },
          ],
        },
        {
          id: "value_play",
          type: "action",
          name: "Value Play",
          action: () => "success",
          weight: 40,
        },
      ],
    };
  }

  createBalancedTree(): BehaviorNode {
    return {
      id: "balanced",
      type: "selector",
      name: "Balanced AI",
      children: [
        {
          id: "lethal_check",
          type: "condition",
          name: "Check Lethal",
          condition: (ctx) => this.canWinThisTurn(ctx),
        },
        {
          id: "curve_play",
          type: "action",
          name: "Play On Curve",
          action: () => "success",
          weight: 60,
        },
        {
          id: "board_development",
          type: "action",
          name: "Board Development",
          action: () => "success",
          weight: 50,
        },
        {
          id: "hero_power",
          type: "action",
          name: "Use Hero Power",
          action: () => "success",
          weight: 20,
        },
      ],
    };
  }

  private canWinThisTurn(context: AIContext): boolean {
    // Simplified lethal check
    const totalDamage = (context.field as any[]).reduce((sum, card) => sum + (card.attack || 0), 0);
    return totalDamage >= context.enemyHealth;
  }
}

export const aiDecisionService = new AIDecisionService();
