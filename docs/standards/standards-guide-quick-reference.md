# 《谋天下·问道百家》命名规范快速参考指南 v1.0

## 文档说明

本文档提供命名规范的快速参考，以v1.0版本为基准。
本文件为规范命名主文件；旧文件名 `QUICK_REFERENCE_GUIDE.md` 已下线。

---

## 一、一页纸速查表

### 1.1 代码命名速查

| 元素类型 | 命名风格 | 示例 | 记忆口诀 |
|----------|----------|------|----------|
| 变量 | `camelCase` | `playerHealth` | 小驼峰，首字小 |
| 函数 | `camelCase` | `getCardById()` | 小驼峰，动词起 |
| 类 | `PascalCase` | `BattleEngine` | 大驼峰，首字大 |
| 常量 | `SCREAMING_SNAKE_CASE` | `MAX_HAND_SIZE` | 全大写，下划连 |
| 文件(组件) | `PascalCase.tsx` | `BattleFrame.tsx` | 大驼峰tsx |
| 文件(工具) | `kebab-case.ts` | `battle-engine.ts` | 小写连字符 |
| 目录 | `kebab-case` | `battle-system/` | 小写连字符 |
| CSS类 | `kebab-case` | `.card-container` | 小写连字符 |

### 文档命名速查

```
格式：{模块}-{类型}-{主题}-{版本}.md

示例：
battle-design-核心规则-v1.2.md
card-spec-数据格式.md
ui-guide-开发指南-v1.md
```

---

## 二、命名风格图解

```
camelCase        →  playerHealth, currentRound, isSelected
                   └─小写开头，后续单词首字母大写

PascalCase       →  BattleEngine, CardResolver, GameState
                   └─每个单词首字母都大写

snake_case       →  player_health, current_round
                   └─全小写，单词间用下划线

SCREAMING_SNAKE  →  MAX_HAND_SIZE, DEFAULT_MANA
                   └─全大写，单词间用下划线

kebab-case       →  battle-engine, card-resolver
                   └─全小写，单词间用连字符
```

---

## 三、正确与错误示例对比

### 3.1 变量命名

| [正确] | [错误] | 原因 |
|---------|---------|------|
| `playerHealth` | `PlayerHealth` | 应小写开头 |
| `currentRound` | `current_round` | 应使用驼峰 |
| `isSelected` | `selected` | 布尔值应加前缀 |
| `cardIds` | `cardArray` | 数组用复数形式 |

### 3.2 函数命名

| [正确] | [错误] | 原因 |
|---------|---------|------|
| `getPlayerHealth()` | `playerHealth()` | 缺少动词 |
| `calculateDamage()` | `damage()` | 缺少动词 |
| `handleCardClick()` | `onCardClick()` | 用handle前缀 |
| `validateCardPlay()` | `doValidation()` | do前缀冗余 |

### 3.3 文件命名

| [正确] | [错误] | 原因 |
|---------|---------|------|
| `BattleFrame.tsx` | `battleFrame.tsx` | 组件应大写开头 |
| `battle-engine.ts` | `BattleEngine.ts` | 工具文件应小写 |
| `card-resolver.ts` | `cardResolver.ts` | 应使用连字符 |

---

## 四、常用前缀/后缀速查

### 4.1 函数动词前缀

| 前缀 | 用途 | 示例 |
|------|------|------|
| `get` | 获取数据 | `getPlayerHealth()` |
| `set` | 设置数据 | `setCurrentRound()` |
| `calculate` | 计算值 | `calculateDamage()` |
| `validate` | 验证 | `validateCardPlay()` |
| `handle` | 事件处理 | `handleCardClick()` |
| `create` | 创建 | `createBattleState()` |
| `update` | 更新 | `updatePlayerMana()` |
| `remove` | 删除 | `removeCardFromHand()` |

### 布尔变量前缀

| 前缀 | 含义 | 示例 |
|------|------|------|
| `is` | 是否 | `isActive`, `isSelected` |
| `has` | 是否有 | `hasShield`, `hasCard` |
| `can` | 是否能 | `canAttack`, `canPlay` |
| `should` | 是否应该 | `shouldEndTurn` |
| `will` | 将要 | `willTriggerEffect` |

---

## 五、游戏术语映射表

### 5.1 内部代码与外部显示对照

| 代码名称 | 用户看到 | 说明 |
|----------|----------|------|
| `mana` | 用度 | 法力资源 |
| `health` | 生命 | 生命值 |
| `shield` | 护持 | 护盾值 |
| `momentum` | 大势 | 大势值 |
| `mainQueue` | 主议 | 主议题区 |
| `sideQueue` | 旁议 | 旁议题区 |
| `hiddenSubmit` | 暗辩 | 暗辩阶段 |
| `reveal` | 明辩 | 明辩阶段 |

### 门派名称映射

| 代码ID | 显示名称 |
|--------|----------|
| `confucianism` | 儒家 |
| `legalism` | 法家 |
| `mohism` | 墨家 |
| `daoism` | 道家 |
| `military` | 兵家 |
| `logicians` | 名家 |
| `yin-yang` | 阴阳家 |
| `diplomats` | 纵横家 |
| `agriculturalists` | 农家 |
| `miscellaneous` | 杂家 |

---

## 六、常见问题解答

### 6.1 什么时候用驼峰，什么时候用连字符？

**简单记忆**：
- 代码内部 → 驼峰 (`camelCase` 或 `PascalCase`)
- 文件名/URL → 连字符 (`kebab-case`)

### 6.2 类和接口怎么区分？

```typescript
// 类：描述一个实体
class BattleEngine { }

// 接口：描述数据结构
interface BattleState { }

// 类型别名：简化类型定义
type CardId = string;
```

### 6.3 常量和变量怎么区分？

```typescript
// 常量：运行时不变的值，全大写
const MAX_HAND_SIZE = 10;

// 变量：可能变化的值，驼峰
let currentHandSize = 5;
```

### 6.4 文档命名太复杂怎么办？

**简化记忆**：`模块-类型-主题-版本.md`

```
battle-design-核心规则-v1.md
│       │      │      │
│       │      │      └─ 版本号
│       │      └─ 中文主题
│       └─ 文档类型
└─ 功能模块
```

---

## 七、检查清单

### 7.1 新建文件时检查

- [ ] 文件名是否符合命名规范？
- [ ] 内部变量是否使用驼峰？
- [ ] 函数是否以动词开头？
- [ ] 常量是否全大写？
- [ ] 类/接口是否大写开头？

### 7.2 提交代码前检查

- [ ] 运行 `npm run lint` 无错误
- [ ] 运行命名验证脚本通过
- [ ] 无中英文混用的变量名
- [ ] 无过于简化的名称（如 `a`, `b`, `data`）

---

## 八、遇到问题时的处理

### 8.1 命名不确定时

1. 查看项目中类似文件的命名方式
2. 参考本文档的示例
3. 询问团队成员

### 8.2 发现命名违规

1. 记录问题位置
2. 创建重命名任务
3. 按优先级修复

### 8.3 规范有疑问

1. 提交反馈表
2. 团队讨论
3. 更新规范文档

---

## 九、相关文档

| 文档 | 位置 | 用途 |
|------|------|------|
| 完整命名规范 | `docs/standards/NAMING_CONVENTION_FRAMEWORK.md` | 详细规则说明 |
| 机器可读规则 | `docs/standards/NAMING_RULEBOOK.json` | AI/工具使用 |
| 文档组织规范 | `docs/standards/DOCUMENT_ORGANIZATION_STANDARD.md` | 文档管理 |
| 实施计划 | `docs/standards/IMPLEMENTATION_PLAN.md` | 执行方案 |

---

## 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-23 | 初始版本 | AI Assistant |
