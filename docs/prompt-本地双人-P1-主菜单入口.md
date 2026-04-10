# 本地双人功能开发 - Prompt 1：主菜单入口与基础状态

---

## Prompt 内容

```
## 任务目标

在《思筹之录》项目中实现"本地双人对战"功能的第一步：
**主菜单入口 + 本地双人模式状态骨架 + 页面基础结构**

## 项目背景

这是一个以春秋战国诸子百家为题材的回合制卡牌对战游戏。
- 技术栈：React + TypeScript
- 现有结构：src/ui/screens/、src/components/、src/hooks/
- 现有页面：HomeScreen（主菜单）、PreBattleFlow（战前流程）、SyncBattlePage（战斗页）

## 具体要求

### 1. 主菜单新增"本地双人"入口

在 HomeScreen 中新增一个"本地双人"按钮，与现有的"开始对战（AI）"并列。

入口层级：
- 开始对战（AI）
- 本地双人 ← 新增
- 规则说明
- 开发测试入口

### 2. 建立本地双人模式状态

新增一个状态字段用于标识本地双人模式：

```typescript
type GameMode = 'ai_battle' | 'local_pvp';
type LocalBattleMeta = {
  mode: "local_pvp";
  currentActingPlayerId: string;      // 当前操作玩家ID
  pendingHandover: boolean;          // 是否需要交接遮罩
  handVisibilityOwnerId: string | null; // 当前谁可以看到手牌
};
```

### 3. 新增页面骨架

至少新增以下页面的空壳/骨架：

| 页面 | 文件名 | 说明 |
|------|--------|------|
| 本地双人准备页 | LocalBattleSetupScreen.tsx | 局前选择流程 |
| 玩家交接遮罩页 | PlayerHandoverScreen.tsx | 回合切换遮罩 |
| 本地双人战斗页 | LocalBattleScreen.tsx | 实际战斗（可复用现有SyncBattlePage） |
| 本地双人结果页 | LocalBattleResultScreen.tsx | 结算页 |

### 4. 路由配置

确保从主菜单可以导航到 LocalBattleSetupScreen。

## 约束

- 不要重构整个项目
- 不要修改现有的 AI 对战逻辑
- 不要新增联网逻辑
- 复用现有的 UI 组件和样式系统

## 输出要求

请先列出：
1. 准备修改的文件清单
2. 每个文件的作用
3. 改动摘要
4. 还未实现的 TODO
5. 是否存在风险或依赖项

完成后，等待确认再进入 Prompt 2。
```

---

## 使用说明

1. 将上面的 Prompt 内容复制给 AI 助手（Claude / Codex 等）
2. 等待 AI 列出文件清单和改动计划
3. 确认后让 AI 开始实现
4. 完成后，再使用 Prompt 2

---

## Prompt 2 预告

```
Prompt 2 的内容将是：
- 接入议题预览
- 玩家1/玩家2 门派选择
- 交接遮罩页
- 加载页展示
```

