# 稷下学宫·剧情模式UI设计文档 v1.0

**项目名称**：稷下学宫 - 问道百家剧情模式
**文档版本**：v1.0
**创建日期**：2026-03-27

---

## 第一部分：界面布局设计

### 1.1 整体布局结构

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           剧情模式主界面布局                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              顶部状态栏 (80px)                               │
│  ┌─────────┐                                          ┌─────────────────┐  │
│  │章节进度 │  ◄  返回菜单                    菜单 ►   │   ⚙️ 设置       │  │
│  └─────────┘                                          └─────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              中央对话区域                                     │
│                           (flex-grow, 自适应)                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │                     【场景描述文字区域】                              │   │
│  │                     描述当前环境和氛围                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌────────┐                                                        │   │
│  │  │立绘    │  NPC名称                                                │   │
│  │  │        │  "对话内容对话框内容显示在这里..."                      │   │
│  │  │        │                                                        │   │
│  │  └────────┘                                                        │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                              选项区域 (底部)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  [A] 选项一                                                       │   │
│  │  [B] 选项二                                                       │   │
│  │  [C] 选项三                                                       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                            关系值显示条 (60px)                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │儒家    │ │法家    │ │道家    │ │墨家    │ │...     │ │名望    │       │
│  │████████│ │██████░░│ │████░░░░│ │███░░░░░│ │        │ │███████░│       │
│  │ 好感+20│ │ 好感+10│ │ 好感+5 │ │ 好感+3 │ │        │ │  名望50 │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 布局规格

```typescript
// 布局规格定义
const STORY_LAYOUT_SPEC = {
  // 整体容器
  container: {
    width: '100%',
    height: '100dvh',
    background: '#0f0f1a',  // 与游戏主背景一致
    overflow: 'hidden',
  },

  // 顶部状态栏
  topBar: {
    height: '80px',
    padding: '0 24px',
    borderBottom: '1px solid rgba(139,115,85,0.3)', // 青铜色边框
  },

  // 中央对话区域
  centerArea: {
    flexGrow: 1,
    padding: '32px 48px',
    overflowY: 'auto',
  },

  // 场景描述
  sceneDescription: {
    fontSize: '18px',
    lineHeight: 1.8,
    color: '#D4C5A9',  // 竹简色
    marginBottom: '24px',
    padding: '16px 24px',
    background: 'rgba(26,26,46,0.6)', // 面板深色
    borderRadius: '8px',
    borderLeft: '3px solid #8B7355', // 青铜色
  },

  // 立绘区域
  portraitArea: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '24px',
    marginBottom: '24px',
  },

  portrait: {
    width: '180px',
    height: '280px',
    borderRadius: '8px',
    border: '2px solid #8B7355',
    objectFit: 'cover',
  },

  dialogueBox: {
    flex: 1,
    background: 'rgba(26,26,46,0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(139,115,85,0.5)',
    padding: '20px 24px',
  },

  speakerName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#D4A017',  // 亮金色
    marginBottom: '8px',
  },

  dialogueText: {
    fontSize: '18px',
    lineHeight: 1.7,
    color: '#f0ddbb',
  },

  // 选项区域
  choicesArea: {
    padding: '24px 48px',
    background: 'rgba(15,15,26,0.9)',
    borderTop: '1px solid rgba(139,115,85,0.3)',
  },

  choiceButton: {
    width: '100%',
    padding: '16px 24px',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
    border: '1px solid rgba(139,115,85,0.6)',
    borderRadius: '8px',
    color: '#f0ddbb',
    fontSize: '16px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',

    hover: {
      background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2a 100%)',
      borderColor: '#E85D04',  // 炉火橙
      transform: 'translateX(8px)',
    },

    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },

  // 关系值显示条
  relationshipBar: {
    height: '60px',
    padding: '0 24px',
    background: 'rgba(15,15,26,0.95)',
    borderTop: '1px solid rgba(139,115,85,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  factionBadge: {
    minWidth: '80px',
    padding: '8px 12px',
    background: 'rgba(26,26,46,0.8)',
    borderRadius: '6px',
    border: '1px solid rgba(139,115,85,0.4)',
    textAlign: 'center',
  },

  reputationBar: {
    height: '4px',
    background: 'rgba(139,115,85,0.3)',
    borderRadius: '2px',
    marginTop: '4px',
    overflow: 'hidden',
  },

  reputationFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
};
```

---

## 第二部分：组件设计

### 2.1 StoryScreen 主组件

```tsx
// 组件结构
interface StoryScreenProps {
  // 初始节点ID（用于加载存档后继续）
  initialNodeId?: string;
  // 回调
  onExit: () => void;
  onSave?: () => void;
}

// 组件状态
interface StoryScreenState {
  currentNode: StoryNode;              // 当前节点
  playerStats: PlayerStats;             // 玩家属性
  relationships: Relationships;         // 关系值
  flags: StoryFlags;                    // 剧情标志
  history: string[];                   // 历史节点ID
  isChoiceVisible: boolean;             // 选项是否可见
  isDialogueComplete: boolean;         // 对话是否完成
}
```

### 2.2 子组件列表

| 组件名 | 功能 | 优先级 |
|--------|------|--------|
| `TopStatusBar` | 章节进度、返回按钮、设置 | P0 |
| `SceneDescription` | 场景环境描述文字 | P0 |
| `DialogueBox` | NPC对话、旁白显示 | P0 |
| `CharacterPortrait` | 角色立绘显示 | P0 |
| `ChoicePanel` | 选项按钮组 | P0 |
| `RelationshipBar` | 门派关系值显示 | P1 |
| `QTETimer` | QTE快速反应计时器 | P1 |
| `StoryMenu` | 存档/读档/设置菜单 | P1 |
| `EmotionIndicator` | 角色情绪指示器 | P2 |
| `BackgroundLayer` | 场景背景层 | P0 |
| `ParticleEffects` | 粒子效果（炉火/齿轮） | P2 |

---

## 第三部分：界面状态

### 3.1 对话显示状态机

```
DialogueState:
│
├── Typing          // 打字中状态
│   ├── 显示角色立绘
│   ├── 文字逐字显示
│   ├── 可点击加速
│   └── 选项隐藏
│
├── Complete         // 对话完成状态
│   ├── 文字全部显示
│   ├── 等待玩家确认
│   └── 继续显示 ▼ 指示
│
├── Choice          // 选择状态
│   ├── 显示选项面板
│   ├── 选项可点击
│   └── 背景可点击跳过（可选）
│
└── Transition      // 场景转换状态
    ├── 淡出当前内容
    ├── 切换背景
    ├── 淡入新内容
    └── 自动继续
```

### 3.2 QTE状态

```
QTEState:
│
├── Waiting          // 等待QTE
│   ├── 显示计时条
│   ├── 倒计时显示
│   └── 选项可见
│
├── Responding       // 玩家响应中
│   ├── 记录输入
│   └── 判定结果
│
└── Result           // QTE结果
    ├── 成功反馈
    ├── 失败反馈
    └── 继续剧情
```

---

## 第四部分：视觉效果

### 4.1 稷下青铜风格配色

```css
/* 剧情模式专用样式 */
.story-screen {
  /* 背景 */
  --story-bg: #0f0f1a;
  --story-panel: #1a1a2e;
  --story-panel-soft: rgba(26,26,46,0.6);

  /* 主色调 */
  --bronze: #8B7355;
  --bronze-light: #A89070;
  --patina: #4A7C6F;
  --furnace: #E85D04;
  --cinnabar: #8B2635;
  --gold: #D4A017;
  --bamboo: #D4C5A9;

  /* 文字 */
  --text-primary: #f0ddbb;
  --text-secondary: #D4C5A9;
  --text-muted: #8B7355;
  --text-gold: #D4A017;

  /* 边框 */
  --border-bronze: rgba(139,115,85,0.5);
  --border-furnace: rgba(232,93,4,0.7);

  /* 效果 */
  --glow-furnace: 0 0 20px rgba(232,93,4,0.5);
  --glow-gold: 0 0 15px rgba(212,160,23,0.4);
}
```

### 4.2 动画效果

```css
/* 文字打字机效果 */
@keyframes typewriter {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 场景淡入淡出 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* 选项出现 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 立绘入场 */
@keyframes portraitEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 炉火粒子 */
@keyframes emberFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}

/* 齿轮旋转（装饰） */
@keyframes gearRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 第五部分：交互设计

### 5.1 玩家输入处理

```typescript
// 输入类型
type StoryInput =
  | { type: 'click'; target: 'dialogue' | 'choice'; index?: number }
  | { type: 'keypress'; key: 'Space' | 'Enter' | '1' | '2' | '3' | '4' | 'Escape' }
  | { type: 'swipe'; direction: 'up' | 'down' };

// 输入处理逻辑
const handleInput = (input: StoryInput) => {
  switch (currentState) {
    case 'Typing':
      // 打字中：点击/回车加速，数字键直接选择
      if (input.type === 'click' || input.key === 'Enter' || input.key === 'Space') {
        skipTyping();
      }
      break;

    case 'Complete':
      // 对话完成：点击继续
      if (input.type === 'click' || input.key === 'Enter') {
        proceedToNext();
      }
      break;

    case 'Choice':
      // 选择状态：数字键直接选择
      if (input.type === 'keypress' && ['1', '2', '3', '4'].includes(input.key)) {
        selectChoice(parseInt(input.key) - 1);
      }
      break;
  }
};
```

### 5.2 选项状态

```typescript
// 选项状态
interface ChoiceState {
  id: string;
  text: string;
  icon?: string;        // 图标
  disabled: boolean;   // 是否禁用
  hoverEffect: boolean;

  // 条件显示
  condition?: {
    type: 'stat' | 'flag' | 'relationship';
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
    target: string;
    value: any;
  };

  // 效果预览（hover时显示）
  effectPreview?: string;
}
```

---

## 第六部分：功能模块

### 6.1 存档系统

```typescript
// 存档数据结构
interface StorySaveData {
  version: string;              // 版本号
  timestamp: number;           // 保存时间
  currentNodeId: string;       // 当前节点

  // 玩家状态
  player: {
    name?: string;
    stats: PlayerStats;
    relationships: Relationships;
    flags: StoryFlags;
  };

  // 剧情进度
  progress: {
    chapter: number;
    scene: number;
    completedNodes: string[];
  };

  // 历史记录
  history: {
    nodeIds: string[];
    choices: Array<{ nodeId: string; choiceId: string }>;
  };
}
```

### 6.2 设置选项

```typescript
// 设置面板
interface StorySettings {
  // 文字
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  autoPlaySpeed: number;  // ms每字符

  // 音效
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;

  // 显示
  showRelationshipChanges: boolean;
  showEffectPreview: boolean;
  skipAlreadyRead: boolean;

  // QTE
  qteDifficulty: 'easy' | 'normal' | 'hard';
}
```

---

## 第七部分：屏幕组件清单

### 7.1 剧情主屏幕

```
StoryScreen
├── TopStatusBar
│   ├── ChapterProgress
│   ├── BackButton
│   └── SettingsButton
├── BackgroundLayer
│   ├── SceneBackground
│   └── ParticleEffects
├── CenterContent
│   ├── SceneDescription
│   ├── DialogueArea
│   │   ├── CharacterPortrait
│   │   └── DialogueBox
│   └── EmotionIndicator
├── ChoicePanel
│   └── ChoiceButton (×n)
├── RelationshipBar
│   └── FactionBadge (×16)
└── Optional Overlays
    ├── QTETimer
    ├── StoryMenu
    └── NotificationToast
```

---

## 第八部分：API设计

### 8.1 StoryEngine API

```typescript
// StoryEngine 核心接口
interface IStoryEngine {
  // 初始化
  init(initialNodeId?: string): void;

  // 节点操作
  getCurrentNode(): StoryNode;
  goToNode(nodeId: string): void;
  goToNext(): void;
  goBack(): void;

  // 选择
  makeChoice(choiceId: string): void;
  getAvailableChoices(): Choice[];

  // 状态查询
  getPlayerStats(): PlayerStats;
  getRelationships(): Relationships;
  getFlags(): StoryFlags;

  // QTE
  startQTE(qteId: string): void;
  submitQTAnswer(answer: string): void;

  // 存档
  save(): StorySaveData;
  load(saveData: StorySaveData): void;

  // 监听
  subscribe(callback: (event: StoryEvent) => void): () => void;
}

// StoryEvent 类型
type StoryEvent =
  | { type: 'node_changed'; nodeId: string }
  | { type: 'choice_made'; choiceId: string; effects: ChoiceImpact }
  | { type: 'stats_changed'; changes: Partial<PlayerStats> }
  | { type: 'relationship_changed'; characterId: string; changes: RelationshipChange }
  | { type: 'flag_changed'; flagId: string; value: boolean | number }
  | { type: 'qte_started'; qteId: string }
  | { type: 'qte_completed'; success: boolean }
  | { type: 'chapter_completed'; chapterId: string }
  | { type: 'story_completed'; endingId: string };
```

---

**文档状态**：v1.0 UI设计完成
**下一步**：StoryScreen组件实现 → StoryEngine核心 → 集成到MvpFlowShell

---

*最后更新：2026-03-27*
