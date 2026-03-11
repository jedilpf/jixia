/**
 * 教学引导服务
 *
 * 为新玩家提供交互式教学引导
 */

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'wait';
  delay?: number;
  highlight?: boolean;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  completed: boolean;
  reward?: {
    type: 'card' | 'gold' | 'exp';
    value: number;
  };
}

export class TutorialService {
  private tutorials: Map<string, Tutorial> = new Map();
  private currentTutorial: Tutorial | null = null;
  private currentStepIndex: number = 0;
  private isActive: boolean = false;
  private onStepCallback: ((step: TutorialStep, index: number) => void) | null = null;
  private onCompleteCallback: ((tutorial: Tutorial) => void) | null = null;
  private readonly STORAGE_KEY = 'jixia_tutorials';

  constructor() {
    this.initializeTutorials();
    this.loadProgress();
  }

  /**
   * 初始化教学关卡
   */
  private initializeTutorials(): void {
    const basicTutorial: Tutorial = {
      id: 'basic',
      name: '基础教学',
      description: '学习游戏的基本操作',
      completed: false,
      reward: { type: 'gold', value: 100 },
      steps: [
        {
          id: 'welcome',
          title: '欢迎来到稷下学宫',
          content: '在这里你将学习诸子百家的智慧，通过论道击败对手。',
          delay: 1000,
        },
        {
          id: 'hand_cards',
          title: '手牌区域',
          content: '这是你的手牌，点击选择要出战的卡牌。',
          targetElement: '.hand-card',
          position: 'top',
          action: 'click',
          highlight: true,
        },
        {
          id: 'mana',
          title: '学识（法力）',
          content: '每张卡牌需要消耗学识才能打出。学识每回合自动回复。',
          targetElement: '.mana-display',
          position: 'right',
          highlight: true,
        },
        {
          id: 'battlefield',
          title: '战场',
          content: '将卡牌拖拽到战场上召唤名士为你作战。',
          targetElement: '.battle-board',
          position: 'bottom',
          action: 'click',
          highlight: true,
        },
        {
          id: 'end_turn',
          title: '结束回合',
          content: '完成操作后点击结束回合，让对手进行论述。',
          targetElement: '.end-turn-button',
          position: 'left',
          action: 'click',
          highlight: true,
        },
        {
          id: 'complete',
          title: '教学完成',
          content: '恭喜！你已经掌握了基本操作。开始你的论道之旅吧！',
          delay: 500,
        },
      ],
    };

    const syncBattleTutorial: Tutorial = {
      id: 'sync_battle',
      name: '同步对战教学',
      description: '学习同步回合制的特殊机制',
      completed: false,
      reward: { type: 'card', value: 1 },
      steps: [
        {
          id: 'sync_intro',
          title: '同步回合制',
          content: '在同步对战中，双方同时进行操作，增加了策略深度。',
          delay: 1000,
        },
        {
          id: 'reveal_phase',
          title: '揭示阶段',
          content: '前10秒双方可以看到对方已选择的卡牌。',
          targetElement: '.phase-indicator',
          position: 'bottom',
          highlight: true,
        },
        {
          id: 'hidden_phase',
          title: '隐藏阶段',
          content: '后10秒新选择的卡牌将隐藏，需要预判对手行动。',
          targetElement: '.phase-indicator',
          position: 'bottom',
          highlight: true,
        },
        {
          id: 'adjustment',
          title: '灵活调整',
          content: '在20秒内你可以随时调整已选择的卡牌。',
          delay: 1000,
        },
        {
          id: 'sync_complete',
          title: '准备就绪',
          content: '现在你已经了解了同步对战的精髓，去实战中体验吧！',
          delay: 500,
        },
      ],
    };

    this.tutorials.set(basicTutorial.id, basicTutorial);
    this.tutorials.set(syncBattleTutorial.id, syncBattleTutorial);
  }

  /**
   * 开始教学
   */
  startTutorial(tutorialId: string): boolean {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial || tutorial.completed) {
      return false;
    }

    this.currentTutorial = tutorial;
    this.currentStepIndex = 0;
    this.isActive = true;

    this.showCurrentStep();
    return true;
  }

  /**
   * 显示当前步骤
   */
  private showCurrentStep(): void {
    if (!this.currentTutorial || !this.isActive) return;

    const step = this.currentTutorial.steps[this.currentStepIndex];
    this.onStepCallback?.(step, this.currentStepIndex);

    // 如果有延迟，自动进入下一步
    if (step.delay && step.delay > 0) {
      setTimeout(() => {
        if (step.action === 'wait') {
          this.nextStep();
        }
      }, step.delay);
    }
  }

  /**
   * 下一步
   */
  nextStep(): void {
    if (!this.currentTutorial || !this.isActive) return;

    this.currentStepIndex++;

    if (this.currentStepIndex >= this.currentTutorial.steps.length) {
      this.completeTutorial();
    } else {
      this.showCurrentStep();
    }
  }

  /**
   * 上一步
   */
  previousStep(): void {
    if (!this.currentTutorial || !this.isActive) return;

    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.showCurrentStep();
    }
  }

  /**
   * 跳过教学
   */
  skipTutorial(): void {
    if (!this.currentTutorial) return;

    this.isActive = false;
    this.currentTutorial = null;
    this.currentStepIndex = 0;
  }

  /**
   * 完成教学
   */
  private completeTutorial(): void {
    if (!this.currentTutorial) return;

    this.currentTutorial.completed = true;
    this.saveProgress();

    this.onCompleteCallback?.(this.currentTutorial);

    this.isActive = false;
    this.currentTutorial = null;
    this.currentStepIndex = 0;
  }

  /**
   * 检查是否需要显示教学
   */
  shouldShowTutorial(tutorialId: string): boolean {
    const tutorial = this.tutorials.get(tutorialId);
    return tutorial ? !tutorial.completed : false;
  }

  /**
   * 获取所有教学
   */
  getAllTutorials(): Tutorial[] {
    return Array.from(this.tutorials.values());
  }

  /**
   * 获取未完成的教学
   */
  getPendingTutorials(): Tutorial[] {
    return this.getAllTutorials().filter((t) => !t.completed);
  }

  /**
   * 重置教学进度
   */
  resetTutorial(tutorialId: string): void {
    const tutorial = this.tutorials.get(tutorialId);
    if (tutorial) {
      tutorial.completed = false;
      this.saveProgress();
    }
  }

  /**
   * 重置所有教学
   */
  resetAllTutorials(): void {
    this.tutorials.forEach((tutorial) => {
      tutorial.completed = false;
    });
    this.saveProgress();
  }

  /**
   * 保存进度
   */
  private saveProgress(): void {
    try {
      const progress = Array.from(this.tutorials.entries()).map(([id, tutorial]) => ({
        id,
        completed: tutorial.completed,
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('[Tutorial] Failed to save progress:', error);
    }
  }

  /**
   * 加载进度
   */
  private loadProgress(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const progress: { id: string; completed: boolean }[] = JSON.parse(stored);
        progress.forEach(({ id, completed }) => {
          const tutorial = this.tutorials.get(id);
          if (tutorial) {
            tutorial.completed = completed;
          }
        });
      }
    } catch (error) {
      console.error('[Tutorial] Failed to load progress:', error);
    }
  }

  /**
   * 检查是否正在进行教学
   */
  isTutorialActive(): boolean {
    return this.isActive;
  }

  /**
   * 获取当前教学
   */
  getCurrentTutorial(): Tutorial | null {
    return this.currentTutorial;
  }

  /**
   * 获取当前步骤索引
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /**
   * 获取当前步骤
   */
  getCurrentStep(): TutorialStep | null {
    if (!this.currentTutorial) return null;
    return this.currentTutorial.steps[this.currentStepIndex] || null;
  }

  // ==================== 事件监听 ====================

  onStep(callback: (step: TutorialStep, index: number) => void): void {
    this.onStepCallback = callback;
  }

  onComplete(callback: (tutorial: Tutorial) => void): void {
    this.onCompleteCallback = callback;
  }
}

// 便捷导出
export const tutorialService = new TutorialService();
export default tutorialService;
