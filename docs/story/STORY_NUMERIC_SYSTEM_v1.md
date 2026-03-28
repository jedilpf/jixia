# 争鸣史·数值系统需求文档 v1.0

<!--
  Author: Trae AI
  Project: 稷下学宫·问道百家 - 争鸣史
  Created: 2026-03-28
  Type: 数值系统需求文档
  目录: docs/story/

  ⚠️ 本文档为争鸣史剧情模块专用，不涉及主项目代码
-->

---

## 一、需求背景与目标

### 1.1 问题描述

在 `STORY_SCRIPT_CH1_v1.md` 等故事脚本中，存在大量数值相关的说明注释：

```markdown
【系统提示】
- 智慧+8
- 道家倾向+15
- 获得道具：纵横家帖
- 获得成就：道家认可
```

**当前问题：**
- 这些数值目前只是**文档注释**
- 用户在阅读脚本时能看到所有数值
- 但这些数值应该作为**后端数据**存储和计算
- 用户不应该直接看到数值结果

### 1.2 核心目标

| 目标 | 说明 |
|------|------|
| 数值后台化 | 所有属性、倾向等数值在后台计算，不显示给用户 |
| 叙事化呈现 | 通过NPC对话和剧情描写暗示数值变化 |
| 可存档读取 | 玩家状态可以保存和加载 |
| 剧情影响 | 数值影响后续剧情分支解锁 |

---

## 二、需求详细说明

### 2.1 数值分类

#### A类：后台数值（不显示给用户）

| 数值类型 | 示例 | 用途 | 显示方式 |
|---------|------|------|---------|
| 角色属性 | 智慧、勇气、魅力 | 影响QTE测试成功率 | ❌ 通过QTE难度暗示 |
| 门派倾向 | 儒家倾向、道家倾向 | 解锁门派专属剧情 | ❌ 通过NPC态度暗示 |
| 学宫声望 | 学宫声望值 | 影响在學宫的地位 | ❌ 通过NPC反应暗示 |

#### B类：可显示数值

| 数值类型 | 示例 | 显示方式 |
|---------|------|---------|
| 道具背包 | 纵横家帖、秦使名片 | ✅ 显示道具图标和名称 |
| 成就系统 | 道家认可、明辨是非 | ✅ 显示成就徽章和名称 |

### 2.2 玩家状态数据结构

```typescript
// 路径：src/game/story/types.ts

interface PlayerState {
  // 角色属性（不直接显示）
  attributes: {
    wisdom: number;       // 智慧
    courage: number;      // 勇气
    charm: number;        // 魅力
  };

  // 门派倾向（不直接显示，但影响剧情）
  factionAffinity: {
    confucianism: number;    // 儒家
    legalism: number;        // 法家
    taoism: number;          // 道家
    mohism: number;          // 墨家
    militarism: number;      // 兵家
    geopolitics: number;     // 纵横家
    // ... 其他门派
  };

  // 学宫声望（不直接显示）
  academyReputation: number;

  // 道具背包（可显示）
  inventory: string[];

  // 已解锁成就（可显示）
  achievements: string[];

  // 已触发剧情节点（后台）
  triggeredScenes: string[];

  // 已做选择记录（后台）
  choicesMade: {
    sceneId: string;
    choiceId: string;
  }[];
}
```

### 2.3 数值变化处理

#### 当前文档写法（问题）：
```markdown
【系统提示】
- 智慧+8
- 道家倾向+15
```

#### 期望后端处理（解决方案）：
```typescript
// 后端处理函数
function applyChoice(sceneId: string, choiceId: string): PlayerState {
  const choice = getChoice(sceneId, choiceId);

  // 应用数值变化
  let newState = { ...currentState };

  if (choice.effects) {
    if (choice.effects.wisdom)
      newState.attributes.wisdom += choice.effects.wisdom;
    if (choice.effects.factionAffinity)
      Object.keys(choice.effects.factionAffinity).forEach(
        faction => newState.factionAffinity[faction] += choice.effects.factionAffinity[faction]
      );
    if (choice.effects.inventory)
      newState.inventory.push(...choice.effects.inventory);
    if (choice.effects.achievements)
      newState.achievements.push(...choice.effects.achievements);
  }

  return newState;
}
```

### 2.4 前端展示方式

#### 不显示数值的示例：

| 原始写法（问题） | 期望展示（解决方案） |
|----------------|-------------------|
| 智慧+8 | 汝在辩论中表现卓越，思维敏捷异常。 |
| 道家倾向+15 | 庄周对汝微微一笑："汝与道有缘。" |
| 学宫声望+10 | 众学子看汝之眼神，带着几分敬意。 |

#### 显示数值的示例：

| 类型 | 展示方式 |
|------|---------|
| 道具获得 | "汝获得【纵横家帖】，可用于..." |
| 成就解锁 | 🏆 解锁成就：道家认可 |

---

## 三、故事脚本改造说明

### 3.1 脚本注释格式改造

#### 当前格式（问题）：
```markdown
【系统提示】
- 智慧+8
- 道家倾向+15
- 获得道具：纵横家帖
```

#### 改造后格式（后端数据）：

```markdown
<!--
  数值效果（后台处理，不显示给用户）:
  - attributes.wisdom: +8
  - factionAffinity.taoism: +15
  - inventory: ["纵横家帖"]
  - unlockScene: "Scene-2.5"
-->

【NPC对话】
庄周对汝微微一笑："汝与道有缘。"
```

### 3.2 数值效果定义格式

```markdown
<!--
  场景: Scene-2.6
  选择: choice_A
  数值效果:
    attributes:
      wisdom: +8
      courage: +5
    factionAffinity:
      taoism: +15
      confucianism: -5
    academyReputation: +10
    inventory:
      - "道家信物"
    achievements:
      - "道家认可"
    unlockFlags:
      - "TAOISM_LINE_UNLOCKED"
-->
```

---

## 四、系统架构设计

### 4.1 目录结构

```
docs/story/                              # 争鸣史文档目录
├── STORY_DESIGN_WORKFLOW_v1.md         # 设计工作流
├── STORY_WORLD_SETTING_v1.md           # 世界观设定
├── STORY_CHARACTERS_v1.md              # 角色档案
├── STORY_CHAPTERS_v1.md                # 章节大纲
├── STORY_SCRIPT_CH1_v1.md              # 第一章脚本
├── STORY_SCRIPT_CH2_v1.md              # 第二章脚本
└── STORY_NUMERIC_SYSTEM_v1.md          # 本文档：数值系统需求
```

```
src/game/story/                          # 争鸣史代码目录
├── types.ts                             # 类型定义
├── StoryEngine.ts                       # 剧情引擎
├── PlayerStateManager.ts                 # 玩家状态管理器
├── SceneLoader.ts                       # 场景加载器
├── ChoiceProcessor.ts                   # 选择处理器
└── SaveManager.ts                       # 存档管理器
```

### 4.2 模块依赖关系

```
StoryScreen (UI)
    ↓
StoryEngine (核心引擎)
    ↓
┌───────────────────┐
│ SceneLoader       │ ← 加载场景数据
│ ChoiceProcessor   │ ← 处理选择，应用数值
│ PlayerStateManager│ ← 管理玩家状态
│ SaveManager       │ ← 存档/读档
└───────────────────┘
```

---

## 五、可行性分析

### 5.1 文档编写（✅ 可完成）

| 任务 | 状态 | 说明 |
|------|------|------|
| 需求文档 | ✅ 可完成 | 本文档 |
| 数值效果注释规范 | ✅ 可完成 | 制定注释格式标准 |
| 场景数值效果清单 | ✅ 可完成 | 为每个场景编写数值效果 |

**完成度：100%**

### 5.2 后端代码实现（⚠️ 部分可完成）

| 模块 | 可行性 | 说明 |
|------|--------|------|
| 类型定义 | ✅ 可完成 | TypeScript类型定义 |
| 玩家状态管理 | ✅ 可完成 | PlayerStateManager |
| 选择处理器 | ✅ 可完成 | ChoiceProcessor |
| 存档管理器 | ⚠️ 需确认 | 需要与主项目存档系统协调 |
| 场景加载器 | ✅ 可完成 | SceneLoader |

**限制说明：**
- ⚠️ 存档系统需要与主项目 `SaveManager` 协调
- ⚠️ 需要确认主项目是否有通用存档接口
- ⚠️ 如果没有，需要创建独立的存档系统

**完成度：80%**（存档模块需进一步确认）

### 5.3 前端UI实现（❌ 需要确认）

| 组件 | 可行性 | 说明 |
|------|--------|------|
| 剧情文本展示 | ✅ 可完成 | 显示叙事内容和选项 |
| 道具背包UI | ⚠️ 需确认 | 需要设计UI组件 |
| 成就展示UI | ⚠️ 需确认 | 需要设计UI组件 |
| 数值隐藏处理 | ✅ 可完成 | 后端传值，前端不显示数值 |

**限制说明：**
- ❌ UI组件需要与主项目UI规范一致
- ❌ 需要使用现有UI框架和组件库
- ❌ 道具/成就UI可能影响主项目UI布局

**完成度：60%**（UI部分需与主项目协调）

### 5.4 整体可行性评估

| 层面 | 可行性 | 完成度 |
|------|--------|--------|
| 文档编写 | ✅ 可完成 | 100% |
| 后端逻辑 | ⚠️ 部分可完成 | 80% |
| 前端UI | ⚠️ 需要确认 | 60% |
| **整体** | **⚠️ 可行** | **80%** |

---

## 六、实施计划

### 阶段一：文档与规范（独立完成）

- [x] 需求文档编写
- [ ] 数值效果注释规范制定
- [ ] 场景数值效果清单编制
- [ ] 脚本改造标准流程

### 阶段二：后端逻辑（独立完成）

- [ ] 类型定义文件创建
- [ ] PlayerStateManager实现
- [ ] ChoiceProcessor实现
- [ ] SceneLoader实现
- [ ] 与主项目存档系统对接

### 阶段三：前端UI（需协调）

- [ ] StoryScreen剧情展示组件
- [ ] 道具背包UI组件
- [ ] 成就展示UI组件
- [ ] 与主项目UI规范统一

---

## 七、开放问题

| 问题 | 状态 | 说明 |
|------|------|------|
| 主项目存档接口 | ❓ 待确认 | 是否有通用存档接口？ |
| UI框架规范 | ❓ 待确认 | 使用什么UI框架？ |
| 道具系统设计 | ❓ 待确认 | 是否复用主项目道具系统？ |
| 成就系统设计 | ❓ 待确认 | 是否复用主项目成就系统？ |

---

## 八、结论

1. **文档层面**：✅ 完全可完成，可独立进行
2. **后端逻辑**：⚠️ 80%可完成，存档模块需确认
3. **前端UI**：⚠️ 60%可行，需与主项目协调

**建议下一步行动：**
1. 确认主项目是否有可复用的存档、道具、成就系统
2. 如有，复用主项目系统；如无，创建独立系统
3. 优先完成文档和规范制定

---

*最后更新：2026-03-28*
*Author: Trae AI*
*Version: v1.0*
