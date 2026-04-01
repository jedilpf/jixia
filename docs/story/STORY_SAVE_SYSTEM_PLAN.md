# 争鸣史存档功能修复策划案

## 问题分析

### 当前状态
- **StoryEngine 已有存档功能**：`save()` 和 `load()` 方法完整
- **已加载的节点**：
  - `PROLOG_NODES`（序幕）
  - `CHAPTER_MORU_001_NODES`（第一章·上篇 n001-n010）

### 发现的问题
- **`chapterMoru001_part2.ts`（第一章·下篇 n011-n041）未被加载到 StoryEngine**
- `StoryEngine.loadNodes()` 只加载了 `chapterMoru001.ts`，没有加载 `chapterMoru001_part2.ts`

```typescript
// 当前代码 (StoryEngine.ts:62)
const storyNodes = [...PROLOG_NODES, ...CHAPTER_MORU_001_NODES];
```

### 影响
- 玩家在完成 n010 后进入下篇（n011-n041）
- 但这些节点未被 StoryEngine 加载
- 存档后重新加载，无法找到 n011 等节点，导致无法继续

## 修复方案

### 方案：加载 chapterMoru001_part2 节点

**修改文件**：`src/game/story/StoryEngine.ts`

**修改内容**：

1. 添加 import
```typescript
import { CHAPTER_MORU_001_PART2_NODES } from './data/chapterMoru001_part2';
```

2. 修改 loadNodes 方法
```typescript
private loadNodes() {
  const storyNodes = [...PROLOG_NODES, ...CHAPTER_MORU_001_NODES, ...CHAPTER_MORU_001_PART2_NODES];
  // ...
}
```

### 存档数据结构（已完善）

```typescript
interface StorySaveData {
  version: string;
  timestamp: number;
  currentNodeId: string;      // 当前节点ID
  player: {
    stats: PlayerStats;        // 角色属性
    relationships: Relationships;  // 人物关系
    flags: StoryFlags;         // 剧情flag
  };
  progress: {
    chapter: number;
    scene: number;
    completedNodes: string[];  // 已完成节点
  };
  history: {
    nodeIds: string[];        // 历史节点
    choices: Array<{ nodeId: string; choiceId: string }>;  // 选择记录
  };
}
```

## 存档存储位置

| 环境 | 存储方式 |
|------|----------|
| 浏览器 | localStorage |
| Electron | 预留 electronAPI 接口（待实现） |

```typescript
// persistence.ts
const STORAGE_KEY = 'jixia.story.save.v1';
```

## 待办事项

- [ ] **P0 修复**：将 chapterMoru001_part2.ts 加载到 StoryEngine
- [ ] **P1 功能**：添加 UI 存档/读档按钮
- [ ] **P1 功能**：自动存档（在节点切换时）
- [ ] **P2 功能**：支持多个存档槽位
- [ ] **P2 功能**：Electron 主进程存储（持久化到文件系统）

## 实现步骤

### Step 1: 修复节点加载（5分钟）
1. 在 StoryEngine.ts 添加 import
2. 修改 loadNodes() 方法
3. 验证所有节点被正确加载

### Step 2: 添加存档UI（15分钟）
1. 在 StoryUI 组件添加存档/读档按钮
2. 连接 StoryEngine.save()/load() 方法
3. 添加存档列表显示

### Step 3: 自动存档（10分钟）
1. 在 node_changed 事件时自动存档
2. 或者每隔 N 个节点存档一次

## 预计工时

| 任务 | 优先级 | 预计时间 |
|------|--------|----------|
| 修复节点加载 | P0 | 5分钟 |
| 添加存档UI | P1 | 15分钟 |
| 自动存档 | P1 | 10分钟 |
| 多存档槽位 | P2 | 20分钟 |
| Electron存储 | P2 | 30分钟 |

**总计：约 80分钟**
