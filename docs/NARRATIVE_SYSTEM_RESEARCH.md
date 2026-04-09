# 剧情系统开源项目调研报告（完整版）

## 一、项目概述

本次调研了与剧情系统、类底特律变人互动叙事相关的开源项目，重点关注分支选择、状态管理、存档系统等核心功能。

---

## 二、优秀开源项目推荐

### 1. ink / inkle (inkle Studios)
**GitHub:** https://github.com/inkle/ink
**特点：** 专为分支叙事设计的脚本语言，被多款商业游戏使用（如《80 Days》）

**核心概念：**
- **Knots（节点）：** 故事的基本单元，用 `=== 节点名 ===` 定义
- **Stitches（子节点）：** 节点内部的小单元，用 `= 子节点名` 定义
- **Choices（选项）：** 用 `*` 开头表示选项
- **Diverts（跳转）：** 用 `-> 目标` 实现跳转

**示例语法：**
```
=== 城堡大门 ===
你站在厚重的橡木大门前。
* [推门] -> 进入城堡
* [敲门] -> 有人回应
* [离开] -> END

=== 进入城堡 ===
-> 城堡.大厅
```

**优势：**
- 纯文本格式，非程序员也能编写
- 支持变量、条件判断、循环
- 导出为JSON，可在任何引擎集成
- inkjs 支持 JavaScript 环境

---

### 2. RenJS V2
**GitHub:** https://github.com/lunafromthemoon/RenJS-V2
**特点：** 基于 PhaserJS 的视觉小说引擎，脚本类似剧本

**核心概念：**
- **Scenes（场景）：** 包含 actions 的列表
- **Actions（动作）：** 显示角色、播放音乐、显示对话、执行选择
- **Choices（选择）：** 支持分支和条件判断
- **Plugins（插件系统）：** 可扩展功能

**脚本示例：**
```yaml
- scene: 城堡大门
- say: 你站在厚重的橡木大门前。
- choice:
    - 选项1: 推门
      target: 进入城堡
    - 选项2: 敲门
      target: 有人回应
- scene: 进入城堡
- 设置背景: 城堡.jpg
- say: 你推开了门...
```

**优势：**
- 基于 PhaserJS，可添加小游戏和特效
- GUI Builder 工具可视化编辑界面
- 插件系统强大
- 支持国际化

---

### 3. VN-Sutra
**GitHub:** https://github.com/sutori-project
**特点：** 模块化 JavaScript SDK，使用 Konva.js 和 Tailwind CSS

**核心模块：**
- GameLogic: 游戏逻辑
- UI: 用户界面
- AssetManagement: 资源管理
- SaveLoadSystem: 存档系统
- StoryScripting: 剧情脚本

**架构：**
```
VN-Sutra
├── Character: 角色立绘管理
├── Engine: 场景和背景管理
├── Router: 导航和分支逻辑
├── Choices: 决策系统
└── VN: 工具类
```

---

### 4. Sutori (XML格式对话引擎)
**GitHub:** https://github.com/sutori-project/sutori-js
**特点：** 用 XML 编写对话，非程序员友好

**XML示例：**
```xml
<document>
   <moments>
      <moment>
         <text>Which door do you want to open?</text>
         <option target="door1">Door 1</option>
         <option target="door2">Door 2</option>
      </moment>
      <moment id="door1" clear="true" goto="end">
         <text>You picked door1</text>
      </moment>
   </moments>
</document>
```

**优势：**
- XML格式，易于编辑和维护
- 支持多语言
- 无外部依赖
- 可用于网站、应用、游戏

---

### 5. EasyVN
**GitHub:** https://github.com/Eshan276/easyvn
**npm:** npm i easyvn
**特点：** 轻量级、模块化的 TypeScript 视觉小说引擎

**核心功能：**
- 🎭 角色系统：多表情、多位置
- 🎬 场景管理：背景切换过渡
- 🔀 分支叙事：goto/jump 机制
- 💬 对话系统：点击继续、多选择

**代码示例：**
```typescript
import { startScene, showChoice } from 'easyvn';

async function 开头() {
  await showChoice([
    { text: "选项1", target: "结局A" },
    { text: "选项2", target: "结局B" }
  ]);
}
```

---

### 6. VN Engine
**npm:** npm install vn-engine
**特点：** 强大的 TypeScript 视觉小说库，支持 YAML 脚本

**核心功能：**
- 📝 YAML脚本格式
- 🎮 通用游戏状态（变量系统）
- 🌟 双模板引擎（Handlebars + 简单回退）
- 🔀 选择追踪
- 🎯 事件驱动
- 🚀 热更新 DLC

**脚本示例：**
```yaml
welcome:
  - "你好，欢迎来到视觉小说！"
  - speaker: "向导"
    say: "你叫什么名字？"
    actions:
      - type: setVar
        key: player_name
        value: "英雄"
  - speaker: "{{player_name}}"
    say: "很高兴认识你！"
```

---

### 7. WebGAL
**GitCode:** https://gitcode.com/gh_mirrors/we/WebGAL
**特点：** 全新的网页端视觉小说引擎，基于 WebGL 和 Pixi.js

**脚本示例：**
```
# 场景开始
bgm 晴天.mp3
changeBg 校园.webp fade 2000
say 小明 今天的天气真好啊~
plaintext
choose
  - 选项1: 回家 -> 回家场景
  - 选项2: 去学校 -> 学校场景
```

**优势：**
- 可视化编辑 + 即时预览
- 脚本系统简洁直观
- 支持条件分支、变量运算
- 动画效果丰富

---

### 8. GD Dialog (Godot)
**GitHub:** https://github.com/QueenChristina/gd_dialog
**特点：** 纯 JSON 配置的对话系统

**JSON示例：**
```json
{
  "robust_text_id": {
    "name": "秦蒂娜",
    "text": ["这是对话内容。"],
    "choices": [
      {"text": "同意", "next": "next_node_id"},
      {"text": "不同意", "next": "other_node_id"}
    ]
  }
}
```

---

## 三、核心功能对比

| 功能 | ink | RenJS | EasyVN | VN Engine | Sutori |
|------|-----|-------|--------|-----------|--------|
| 分支选择 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 变量系统 | ✓ | ✓ | ✓ | ✓ | - |
| 条件判断 | ✓ | ✓ | ✓ | ✓ | - |
| 循环对话 | ✓ | ✓ | ✓ | ✓ | - |
| 存档系统 | 需自实现 | 内置 | 需自实现 | 内置 | 需自实现 |
| 热重载 | ✓ | ✓ | ✓ | ✓ | - |
| 导出格式 | JSON | YAML/JSON | TS | YAML/JSON | XML |
| 编辑器 | Inky | GUI Builder | - | - | Sutori Studio |
| 特效/动画 | ✓(Phaser) | ✓(Phaser) | ✓ | ✓ | - |

---

## 四、适合我们项目的参考点

### 1. 节点组织方式（参考 ink）
```
节点ID: {
    type: 'dialogue' | 'narration' | 'choice' | 'ending',
    speaker: '角色名',
    content: '对话内容',
    choices: [...],
    next: '下一个节点ID'
}
```

### 2. 事件驱动的状态管理（参考 VN Engine）
```typescript
// 事件系统
vnEngine.on('stateChange', (result) => {
  if (result.type === 'show_choices') {
    // 显示选项
  } else if (result.type === 'display_dialogue') {
    // 显示对话
  }
});

// 状态结果
interface ScriptResult {
  type: 'display_dialogue' | 'show_choices' | 'scene_complete'
  content?: string
  speaker?: string
  choices?: ChoiceOption[]
}
```

### 3. 插件系统（参考 RenJS V2）
```typescript
const myPlugin = {
  onInit: () => { /* 初始化 */ },
  onSave: (data) => { /* 保存时 */ },
  onLoad: (data) => { /* 加载时 */ },
  customAction: (args) => { /* 自定义动作 */ }
};
```

### 4. XML格式对话（参考 Sutori）
- 编剧可直接编辑
- 支持多语言
- 结构清晰

---

## 五、当前项目优化建议

### 1. 采用类似 ink 的节点定义格式
```typescript
interface StoryNode {
  id: string;
  type: 'dialogue' | 'narration' | 'choice' | 'ending';
  speaker?: string;
  content: string;
  image?: string;
  speakerImage?: string;
  choices?: StoryChoice[];
  nextNode?: string;
  effects?: StoryEffect[];
}
```

### 2. 增加节点链接验证
```typescript
function validateNodeLinks(nodes: StoryNode[]) {
  const nodeIds = new Set(nodes.map(n => n.id));
  for (const node of nodes) {
    if (node.nextNode && !nodeIds.has(node.nextNode)) {
      console.warn(`节点 ${node.id} 链接到不存在的节点: ${node.nextNode}`);
    }
    // 验证 choices 中的 nextNode
  }
}
```

### 3. 支持多种跳转类型
```typescript
interface StoryChoice {
  id: string;
  text: string;
  nextNode: string;
  effects?: ChoiceEffect[];    // 选择效果
  conditions?: Condition[];     // 显示条件
  hint?: string;               // 选择提示
}
```

### 4. 事件驱动的 UI 更新
```typescript
// UI 订阅引擎事件
engine.on('nodeChanged', (node) => {
  setCurrentNode(node);
  setDialogueState('typing');
  startTyping(node.content);
});

engine.on('choicesAvailable', (choices) => {
  setDialogueState('choice');
  setChoices(choices);
});
```

---

## 六、参考资料

1. ink 官方文档：https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md
2. inkjs (JavaScript移植)：https://github.com/y-lohse/inkjs/
3. RenJS V2：https://github.com/lunafromthemoon/RenJS-V2
4. VN-Sutra：https://github.com/sutori-project
5. Sutori JS：https://github.com/sutori-project/sutori-js
6. EasyVN：https://github.com/Eshan276/easyvn
7. VN Engine：https://www.npmjs.com/package/vn-engine
8. WebGAL：https://gitcode.com/gh_mirrors/we/WebGAL
9. Godot Dialog System：https://github.com/QueenChristina/gd_dialog

---

## 七、结论

**最值得参考的项目：**

1. **ink** - 设计最成熟，适合复杂分支叙事
2. **RenJS V2** - 有完整工具链，插件系统强大
3. **VN Engine** - 事件驱动架构值得学习
4. **EasyVN** - 轻量简洁，易于集成

**关键学习点：**
1. 节点和跳转的清晰定义
2. 变量和条件系统的设计
3. 状态持久化和恢复机制
4. 事件驱动的 UI 更新
5. 编辑器支持的设计

**下一步建议：**
1. 参考 ink 的节点定义，优化现有的 StoryNode 结构
2. 引入类似 VN Engine 的事件系统
3. 增加节点链接验证
4. 考虑支持 YAML/JSON 格式的剧情脚本
