# 命名规范框架 v2.0
## 《思筹之录》统一命名标准

---

## 文档信息

| 属性 | 值 |
|------|-----|
| 文档ID | DOC-STANDARDS-002 |
| 版本 | 2.0.0 |
| 创建日期 | 2026-03-23 |
| 状态 | Active |
| 适用范围 | 代码、文档、API、UI |

---

## 一、命名规范总览

### 1.1 双层命名体系

本项目采用**双层命名体系**，分别针对不同受众：

```
┌─────────────────────────────────────────────────────────────┐
│                      命名规范体系                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │   内部命名      │        │   外部命名      │            │
│  │ (Internal)      │        │ (External)      │            │
│  ├─────────────────┤        ├─────────────────┤            │
│  │ • 变量          │        │ • UI文本        │            │
│  │ • 函数          │        │ • API端点       │            │
│  │ • 类/接口       │        │ • 公共文档      │            │
│  │ • 文件名        │        │ • 用户提示      │            │
│  │ • 数据库字段    │        │ • 错误消息      │            │
│  └─────────────────┘        └─────────────────┘            │
│                                                             │
│  受众：开发者/AI系统          受众：用户/非技术人员          │
│  特点：技术精确性             特点：人类可读性              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心原则

| 原则 | 内部命名 | 外部命名 |
|------|----------|----------|
| **精确性** | 技术术语精确，无歧义 | 业务术语清晰，易理解 |
| **一致性** | 全项目统一风格 | 全产品统一语言 |
| **可读性** | 机器可解析 | 人类可阅读 |
| **可维护性** | 重构友好 | 本地化友好 |

---

## 二、内部命名规范 (Internal Naming)

### 2.1 通用规则

#### 2.1.1 语言选择

| 元素类型 | 语言 | 示例 |
|----------|------|------|
| 变量名 | 英文 | `playerMana`, `currentRound` |
| 函数名 | 英文 | `calculateDamage()`, `resolveBattle()` |
| 类名 | 英文 | `BattleEngine`, `CardResolver` |
| 常量 | 英文 | `MAX_HAND_SIZE`, `DEFAULT_MANA` |
| 文件名 | 英文 | `battleEngine.ts`, `cardResolver.ts` |
| 注释 | 中文 | `// 计算伤害值` |
| 文档字符串 | 中文 | `/** 返回玩家当前法力值 */` |

#### 2.1.2 命名风格对照表

| 元素类型 | 命名风格 | 示例 | 说明 |
|----------|----------|------|------|
| 变量 | camelCase | `playerHealth` | 小驼峰 |
| 函数 | camelCase | `getCardById()` | 小驼峰，动词开头 |
| 类 | PascalCase | `BattleManager` | 大驼峰 |
| 接口 | PascalCase | `IGameState` | 大驼峰，I前缀可选 |
| 类型别名 | PascalCase | `CardType` | 大驼峰 |
| 枚举 | PascalCase | `BattlePhase` | 大驼峰 |
| 枚举值 | SCREAMING_SNAKE_CASE | `HIDDEN_SUBMIT` | 全大写下划线 |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_CARD_COUNT` | 全大写下划线 |
| 文件名 | kebab-case | `battle-manager.ts` | 小写连字符 |
| 目录名 | kebab-case | `battle-system/` | 小写连字符 |
| CSS类名 | kebab-case | `.card-container` | 小写连字符 |
| 组件名 | PascalCase | `BattleFrame.tsx` | 大驼峰 |

### 2.2 变量命名规范

#### 2.2.1 基本变量

```typescript
// ✅ 正确示例
let playerHealth = 100;
let currentRound = 1;
let selectedCardUid = 'card-001';
let isPlayerTurn = true;
let hasCompletedTutorial = false;

// ❌ 错误示例
let PlayerHealth = 100;      // 应使用camelCase
let current_round = 1;       // 应使用camelCase
let selectedCardUID = '';    // ID缩写应小写: Uid
let isplayerturn = true;     // 应使用camelCase
```

#### 2.2.2 布尔变量

布尔变量应使用 `is`、`has`、`can`、`should`、`will` 等前缀：

```typescript
// ✅ 正确示例
let isActive = true;
let hasShield = false;
let canAttack = true;
let shouldEndTurn = false;
let willTriggerEffect = true;

// ❌ 错误示例
let active = true;           // 缺少前缀
let shield = false;          // 缺少前缀
let attackable = true;       // 应使用can前缀
```

#### 2.2.3 数组与集合

数组变量应使用复数形式或添加 `List`、`Array` 后缀：

```typescript
// ✅ 正确示例
let cards = [];
let playerList = [];
let cardIds = [];
let activeMinions = [];

// ❌ 错误示例
let card = [];               // 应使用复数
let playersArray = [];       // 后缀冗余
```

#### 2.2.4 对象与映射

对象变量应使用描述性名称：

```typescript
// ✅ 正确示例
let playerStats = {};
let cardMap = new Map();
let factionById = {};
let config = {};

// ❌ 错误示例
let obj = {};                // 过于泛化
let data = {};               // 过于泛化
```

### 2.3 函数命名规范

#### 2.3.1 函数命名模式

| 操作类型 | 前缀 | 示例 |
|----------|------|------|
| 获取数据 | get | `getPlayerHealth()` |
| 设置数据 | set | `setCurrentRound()` |
| 计算值 | calculate | `calculateDamage()` |
| 验证 | validate, check, is | `validateCardPlay()` |
| 转换 | convert, transform, to | `convertToGameState()` |
| 创建 | create, make, new | `createCardInstance()` |
| 删除 | delete, remove, clear | `removeCardFromHand()` |
| 更新 | update, modify, change | `updatePlayerMana()` |
| 处理 | handle, process, resolve | `handleBattlePhase()` |
| 触发 | trigger, fire, emit | `triggerCardEffect()` |
| 渲染 | render, draw, display | `renderCardList()` |

#### 2.3.2 函数命名示例

```typescript
// ✅ 正确示例
function getCardById(id: string): Card { }
function calculateTotalDamage(attacker: Unit, defender: Unit): number { }
function validateCardPlay(card: Card, player: Player): boolean { }
function handleEndTurnClick(): void { }
function createBattleState(config: BattleConfig): BattleState { }

// ❌ 错误示例
function card(id) { }                    // 缺少动词
function damage(attacker, defender) { }  // 缺少动词
function doValidation(card) { }          // do前缀冗余
function onClick() { }                   // 缺少业务含义
```

#### 2.3.3 事件处理器命名

事件处理器使用 `handle` + `事件名` 格式：

```typescript
// ✅ 正确示例
function handleCardClick(card: Card): void { }
function handleEndTurnButtonClick(): void { }
function handlePlayerHandover(): void { }
function handleBattlePhaseChange(phase: BattlePhase): void { }

// ❌ 错误示例
function onCardClick() { }               // 使用handle前缀
function cardClickHandler() { }          // 后缀形式不推荐
function clickCard() { }                 // 缺少handle前缀
```

### 2.4 类与接口命名规范

#### 2.4.1 类命名

```typescript
// ✅ 正确示例
class BattleEngine { }
class CardResolver { }
class PlayerStateManager { }
class LocalBattleController { }

// ❌ 错误示例
class battleEngine { }       // 应使用PascalCase
class Battle_Engine { }      // 不应使用下划线
class Battleengine { }       // 单词应分开
```

#### 2.4.2 接口命名

```typescript
// 方式一：I前缀（推荐用于公共接口）
interface IGameState { }
interface ICardResolver { }

// 方式二：无前缀（推荐用于类型定义）
interface GameState { }
interface CardConfig { }

// ✅ 正确示例
interface BattleState {
  round: number;
  phase: BattlePhase;
  players: PlayerState[];
}

// ❌ 错误示例
interface battle_state { }   // 应使用PascalCase
interface IBattlestate { }   // 单词应分开
```

#### 2.4.3 类型别名命名

```typescript
// ✅ 正确示例
type CardId = string;
type PlayerIndex = 0 | 1;
type BattlePhase = 'hidden_submit' | 'reveal' | 'resolution';
type CardResolver = (card: Card, context: BattleContext) => void;

// ❌ 错误示例
type cardId = string;       // 应使用PascalCase
type CARD_ID = string;      // 不应使用全大写
```

### 2.5 枚举命名规范

```typescript
// ✅ 正确示例
enum BattlePhase {
  HIDDEN_SUBMIT = 'hidden_submit',
  REVEAL = 'reveal',
  RESOLUTION = 'resolution',
}

enum CardType {
  SPELL = 'spell',
  MINION = 'minion',
  WEAPON = 'weapon',
}

// ❌ 错误示例
enum battlePhase {           // 应使用PascalCase
  HiddenSubmit = 'hidden_submit',  // 值应使用SCREAMING_SNAKE_CASE
}
```

### 2.6 文件与目录命名规范

#### 2.6.1 源代码文件

```typescript
// 组件文件：PascalCase
BattleFrame.tsx
CardView.tsx
EndTurnButton.tsx

// 工具/逻辑文件：kebab-case
battle-engine.ts
card-resolver.ts
phase-manager.ts

// 类型定义文件：kebab-case
types.ts
battle-types.ts
card-instances.ts

// 样式文件：kebab-case
battle-frame.css
card-view.module.css
```

#### 2.6.2 目录结构

```
src/
├── components/           # 组件目录
│   ├── battle/          # 战斗相关组件
│   ├── common/          # 通用组件
│   └── ui/              # UI组件
├── hooks/               # 自定义Hooks
├── utils/               # 工具函数
├── types/               # 类型定义
├── data/                # 数据文件
└── config/              # 配置文件
```

### 2.7 常量命名规范

```typescript
// ✅ 正确示例
const MAX_HAND_SIZE = 10;
const DEFAULT_PLAYER_MANA = 3;
const BATTLE_PHASE_DURATION = 30000;
const CARD_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

// ❌ 错误示例
const maxHandSize = 10;              // 应使用SCREAMING_SNAKE_CASE
const MAXHANDSIZE = 10;              // 应使用下划线分隔
const Max_Hand_Size = 10;            // 大小写混合错误
```

---

## 三、外部命名规范 (External Naming)

### 3.1 UI文本命名规范

#### 3.1.1 界面文本原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 简洁性 | 文本简短有力 | "开始对战" 而非 "点击此处开始对战" |
| 一致性 | 相同功能使用相同术语 | 统一使用"门派"而非混用"学派" |
| 专业性 | 使用游戏领域术语 | "护持"、"怀疑"、"论场" |
| 友好性 | 语气亲切但不随意 | "请交给玩家2" |

#### 3.1.2 按钮文本规范

```typescript
// ✅ 正确示例
const BUTTON_TEXT = {
  START_BATTLE: '开始对战',
  LOCAL_MULTIPLAYER: '本地双人',
  END_TURN: '鸣金',
  SURRENDER: '认输',
  CONFIRM: '确认',
  CANCEL: '取消',
};

// 文本长度建议
// 主按钮：2-4个汉字
// 次要按钮：2-6个汉字
// 链接按钮：可更长
```

#### 3.1.3 提示文本规范

```typescript
// ✅ 正确示例
const TOOLTIP_TEXT = {
  MANA_INFO: '势：用于打出卡牌的资源',
  HANDOVER_INFO: '请将设备交给玩家2，点击确认继续',
  VICTORY: '论道胜利！你成功说服了对手',
};

// 提示文本结构
// [动作/状态] + [原因/结果]
// "无法出牌 - 法力不足"
```

### 3.2 API端点命名规范

#### 3.2.1 RESTful API命名

```
基础格式：/api/v{版本}/{资源}/{操作}

资源命名：kebab-case，使用复数形式

✅ 正确示例
GET    /api/v1/cards              # 获取卡牌列表
GET    /api/v1/cards/:id          # 获取单个卡牌
POST   /api/v1/battles            # 创建对战
PUT    /api/v1/battles/:id        # 更新对战状态
DELETE /api/v1/decks/:id          # 删除牌组

GET    /api/v1/player-stats       # 获取玩家统计
POST   /api/v1/local-battles      # 创建本地对战

❌ 错误示例
GET    /api/v1/getCards           # 不应在URL中使用动词
GET    /api/v1/card               # 应使用复数形式
GET    /api/v1/playerStats        # 应使用kebab-case
```

#### 3.2.2 WebSocket事件命名

```typescript
// 事件命名：snake_case
// 格式：{资源}_{动作}

// ✅ 正确示例
socket.emit('battle_join', { battleId: 'xxx' });
socket.emit('card_play', { cardId: 'xxx', target: 'main' });
socket.emit('turn_end', { playerId: 'xxx' });

socket.on('battle_started', callback);
socket.on('card_played', callback);
socket.on('turn_changed', callback);

// ❌ 错误示例
socket.emit('battleJoin', {});     // 应使用snake_case
socket.emit('playCard', {});       // 应使用snake_case
```

### 3.3 错误消息规范

#### 3.3.1 错误消息结构

```typescript
interface ErrorMessage {
  code: string;           // 错误代码（机器可读）
  message: string;        // 错误消息（用户可读）
  details?: string;       // 详细信息（可选）
}

// ✅ 正确示例
const ERROR_MESSAGES = {
  INSUFFICIENT_MANA: {
    code: 'E001',
    message: '法力不足',
    details: '需要 {required} 点法力，当前只有 {current} 点',
  },
  CARD_NOT_PLAYABLE: {
    code: 'E002',
    message: '无法打出此牌',
    details: '当前阶段不允许打出此类型卡牌',
  },
  NOT_YOUR_TURN: {
    code: 'E003',
    message: '不是你的回合',
    details: '请等待对手完成操作',
  },
};
```

#### 3.3.2 错误代码规范

```
格式：E{类别}{序号}

类别：
- E0xx：通用错误
- E1xx：卡牌相关错误
- E2xx：战斗相关错误
- E3xx：网络相关错误
- E4xx：验证相关错误

示例：
E001：通用错误
E101：卡牌不存在
E201：非玩家回合
E301：网络连接失败
E401：参数验证失败
```

### 3.4 公共文档命名规范

#### 3.4.1 用户文档

```
文档类型：面向用户的使用说明

命名格式：{功能}-{文档类型}-{语言}

✅ 正确示例
getting-started-guide-zh-CN.md
api-reference-en-US.md
faq-zh-CN.md
changelog.md

❌ 错误示例
Getting Started Guide.md    # 应使用kebab-case
新手指南.md                  # 缺少语言标识
```

#### 3.4.2 版本说明

```markdown
# 更新日志

## [1.2.0] - 2026-03-23

### 新增功能
- 新增本地双人对战模式
- 新增战斗日志系统

### 问题修复
- 修复卡牌拖拽异常
- 修复回合结束按钮状态错误

### 变更说明
- 调整法力回复机制
- 优化战斗动画性能

### 已知问题
- 部分设备可能存在音效延迟
```

---

## 四、特殊场景命名规范

### 4.1 游戏术语映射

| 内部名称 | 外部显示 | 说明 |
|----------|----------|------|
| `cost` | 势 | 打出卡牌资源 |
| `hp` | 学识 | 生命值 |
| `shield` | 护体 | 护盾值 |
| `momentum` | 大势 | 大势值 |
| `mainQueue` | 主议 | 主议题区 |
| `sideQueue` | 旁议 | 旁议题区 |
| `hiddenSubmit` | 暗辩 | 暗辩阶段 |
| `reveal` | 明辩 | 明辩阶段 |

### 4.2 门派命名映射

```typescript
const FACTION_NAMES = {
  // 内部ID -> 外部显示名
  'confucianism': '儒家',
  'legalism': '法家',
  'mohism': '墨家',
  'daoism': '道家',
  'military': '兵家',
  'logicians': '名家',
  'yin-yang': '阴阳家',
  'diplomats': '纵横家',
  'agriculturalists': '农家',
  'miscellaneous': '杂家',
};
```

### 4.3 卡牌命名规范

#### 4.3.1 卡牌ID格式

```
格式：{系列}-{类型}-{序号}

系列标识：
- BS01：百家争鸣基础系列
- XP01：扩展包1

类型标识：
- MO：随从 (Minion)
- RU：法术 (Rune/Spell)
- WP：武器 (Weapon)
- FD：领域 (Field)

示例：
BS01-MO-001：百家争鸣系列-随从-001号
BS01-RU-005：百家争鸣系列-法术-005号
XP01-WP-003：扩展包1-武器-003号
```

#### 4.3.2 卡牌文件命名

```
内容文件：content/cards/{卡牌ID}.json
图片文件：public/assets/cards/{卡牌拼音或英文名}.{ext}

示例：
content/cards/BS01-MO-001.json
public/assets/cards/bafeng.jpg
```

---

## 五、命名冲突处理

### 5.1 冲突检测规则

当出现命名冲突时，按以下优先级处理：

1. **语义优先**：选择更能表达含义的名称
2. **作用域限定**：添加模块前缀
3. **类型后缀**：添加类型标识

### 5.2 冲突处理决策流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                    命名冲突处理决策流程                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ 发现命名冲突？   │
                    └────────┬────────┘
                             │ 是
                             ▼
                    ┌─────────────────┐
                    │ 是否在同一模块？ │
                    └────────┬────────┘
                      │              │
                     是              否
                      │              │
                      ▼              ▼
            ┌──────────────┐  ┌──────────────────┐
            │ 使用类型后缀  │  │ 使用模块前缀      │
            │ CardData     │  │ BattleCard       │
            │ CardInstance │  │ DeckCard         │
            └──────┬───────┘  └────────┬─────────┘
                   │                   │
                   └───────┬───────────┘
                           ▼
                  ┌─────────────────┐
                  │ 仍有冲突？       │
                  └────────┬────────┘
                      │          │
                     是          否
                      │          │
                      ▼          ▼
            ┌──────────────┐  ┌─────────────┐
            │ 使用命名空间  │  │ 完成！       │
            │ namespace    │  └─────────────┘
            └──────┬───────┘
                   │
                   ▼
         ┌─────────────────┐
         │ 仍有冲突？       │
         └────────┬────────┘
             │          │
            是          否
             │          │
             ▼          ▼
   ┌──────────────┐  ┌─────────────┐
   │ 团队讨论决定  │  │ 完成！       │
   │ 记录决策原因  │  └─────────────┘
   └──────────────┘
```

### 5.3 冲突处理示例

```typescript
// 冲突示例：多个模块都有Card类型

// 方案一：模块前缀（推荐用于跨模块冲突）
interface BattleCard { }
interface DeckCard { }

// 方案二：类型后缀（推荐用于同模块内冲突）
interface CardData { }
interface CardInstance { }
interface CardConfig { }
```

### 5.4 命名空间使用

```typescript
// 使用命名空间避免冲突
namespace Battle {
  export interface State { }
  export interface Config { }
}

namespace Deck {
  export interface State { }
  export interface Config { }
}

// 使用
const battleState: Battle.State = {};
const deckState: Deck.State = {};
```

### 5.5 常见冲突场景处理表

| 冲突场景 | 推荐方案 | 示例 |
|----------|----------|------|
| 同模块内多个相似类型 | 类型后缀 | `CardData`, `CardInstance`, `CardConfig` |
| 跨模块同名类型 | 模块前缀 | `BattleCard`, `DeckCard` |
| 同名状态类型 | 命名空间 | `Battle.State`, `Deck.State` |
| 同名配置类型 | 作用域限定 | `BattleConfig`, `DeckConfig` |
| 工具函数冲突 | 功能描述 | `validateCardPlay`, `validateDeckBuild` |

---

## 六、命名检查工具配置

### 6.1 ESLint命名规则

```json
{
  "rules": {
    "camelcase": ["error", {
      "properties": "always",
      "ignoreDestructuring": true
    }],
    "id-match": ["error", "^[a-zA-Z_$][a-zA-Z0-9_$]*$", {
      "onlyDeclarations": true
    }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "class",
        "format": ["PascalCase"]
      },
      {
        "selector": "interface",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      },
      {
        "selector": "enumMember",
        "format": ["UPPER_CASE"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

### 6.2 文件命名检查脚本

```javascript
// scripts/validate-naming.cjs
const fs = require('fs');
const path = require('path');

const rules = {
  components: /^[A-Z][a-zA-Z]+\.tsx$/,
  utils: /^[a-z]+(-[a-z]+)*\.ts$/,
  types: /^[a-z]+(-[a-z]+)*\.ts$/,
};

function validateFileNaming(dir, rule) {
  const files = fs.readdirSync(dir);
  const violations = [];
  
  files.forEach(file => {
    if (!rule.test(file)) {
      violations.push(path.join(dir, file));
    }
  });
  
  return violations;
}
```

---

## 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v2.0.0 | 2026-03-23 | 全面重构，增加内外部命名双轨制 | AI Assistant |
| v1.0.0 | 2026-03-21 | 初始版本 | Design Team |

