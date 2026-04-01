# 争鸣史存档系统设计方案

## 一、当前实现的问题分析

### 1.1 自动存档时机问题
**问题**：当前只在`goToNode()`时存档，但：
- 用户在阅读长文本时刷新页面会丢失进度
- 选择选项后没有立即存档
- 同一个节点内可能有多次交互没有存档

**影响**：用户可能丢失较长的阅读进度

### 1.2 restore() 后 UI 更新问题
**问题**：`restore()`内部调用`load()`，会触发`emit('node_changed')`，但UI层的`handleLoad`又手动调用了多个setState

**当前代码**：
```typescript
const handleLoad = useCallback(() => {
  const success = engine.restore(); // 内部会 emit('node_changed')
  if (success) {
    const node = engine.getCurrentNode();
    setCurrentNode(node);        // 重复设置
    setChapter(engine.getChapter());  // 重复设置
    // ... 更多重复设置
  }
}, [engine, startTyping]);
```

**影响**：可能造成状态不一致或重复渲染

### 1.3 存档类型混淆
**问题**：
- 手动存档和自动存档共用同一个存储键
- 无法区分"手动存档点"和"自动存档点"
- 用户手动存档后可能被自动存档覆盖

**存储键**：`jixia.story.autosave.v1`（只有自动存档）

### 1.4 缺少存档元数据
**问题**：
- 无法显示"存档时间"
- 无法显示"存档进度"（第几章）
- 无法显示"存档节点名称"

### 1.5 load() 方法不完整
**问题**：`load()`方法没有恢复`bridgeState`

```typescript
// 当前 load() 代码
public load(saveData: StorySaveData) {
  this.currentNodeId = saveData.currentNodeId;
  this.player = { ...saveData.player.stats };
  // ... 其他字段
  // 但没有恢复 bridgeState
}
```

## 二、设计方案

### 2.1 存档类型设计

```typescript
interface StorySaveSlot {
  type: 'autosave' | 'manual';  // 存档类型
  timestamp: number;              // 存档时间
  data: StorySaveData;            // 存档数据
  metadata: {
    nodeId: string;               // 当前节点ID
    chapter: number;              // 当前章节
    nodeCount: number;            // 已访问节点数
  };
}

// 存储键
const STORAGE_KEYS = {
  AUTOSAVE: 'jixia.story.autosave.v1',
  MANUAL_1: 'jixia.story.manual.1.v1',
  MANUAL_2: 'jixia.story.manual.2.v1',
  MANUAL_3: 'jixia.story.manual.3.v1',
};
```

### 2.2 存档时机设计

| 触发时机 | 存档类型 | 说明 |
|----------|----------|------|
| 节点切换完成 | autosave | goToNode成功后 |
| 选择选项后 | autosave | makeChoice成功后 |
| 章节结束 | manual(预留) | 重要里程碑 |
| 用户点击存档按钮 | manual | 用户主动存档 |

### 2.3 自动存档优化

```typescript
// 在以下时机触发 autosave
public goToNode(nodeId: string) {
  // ... 原有逻辑
  this.emit({ type: 'node_changed', nodeId });
  this.persist('autosave');  // 自动存档
}

public makeChoice(choiceId: string): boolean {
  // ... 原有逻辑
  if (choice.nextNode) {
    this.goToNode(choice.nextNode);
  }
  this.persist('autosave');  // 选择后存档
}
```

### 2.4 手动存档接口设计

```typescript
class StoryEngine {
  // 手动存档（用户点击存档按钮）
  public saveManual(slot: 'manual_1' | 'manual_2' | 'manual_3'): boolean {
    const key = STORAGE_KEYS[slot];
    const saveSlot = this.createSaveSlot('manual');
    try {
      localStorage.setItem(key, JSON.stringify(saveSlot));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 读取存档
  public loadSlot(slot: string): boolean {
    const key = STORAGE_KEYS[slot];
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const saveSlot: StorySaveSlot = JSON.parse(raw);
    this.load(saveSlot.data);
    return true;
  }

  // 获取所有存档槽信息
  public getAllSaveSlots(): Array<{slot: string; metadata: StorySaveSlot['metadata']; timestamp: number} | null> {
    // 遍历所有槽位，返回存档信息
  }
}
```

### 2.5 restore() 优化

```typescript
public restore(): boolean {
  const raw = localStorage.getItem(STORAGE_KEYS.AUTOSAVE);
  if (!raw) return false;
  try {
    const saveSlot: StorySaveSlot = JSON.parse(raw);
    this.load(saveSlot.data);
    return true;
  } catch (e) {
    return false;
  }
}
```

### 2.6 load() 完整性修复

```typescript
public load(saveData: StorySaveData) {
  this.currentNodeId = saveData.currentNodeId;
  this.player = { ...saveData.player.stats };
  this.relationships = JSON.parse(JSON.stringify(saveData.player.relationships));
  this.flags = { ...saveData.player.flags };
  this.chapter = saveData.progress.chapter;
  this.scene = saveData.progress.scene;
  this.completedNodes = new Set(saveData.progress.completedNodes);
  this.visitedNodes = new Set(saveData.progress.completedNodes);
  this.history = saveData.history.choices.map(c => ({ nodeId: c.nodeId, choiceId: c.choiceId }));
  this.syncChapterByNodeId(this.currentNodeId);
  this.markNodeVisited(this.currentNodeId);

  // 恢复 bridgeState（如果有）
  if (saveData.bridgeState) {
    this.bridgeState = { ...saveData.bridgeState };
  }

  this.emit({ type: 'node_changed', nodeId: this.currentNodeId });
}
```

### 2.7 StorySaveData 扩展

```typescript
export interface StorySaveData {
  version: string;
  timestamp: number;
  currentNodeId: string;
  player: {
    name?: string;
    stats: PlayerStats;
    relationships: Relationships;
    flags: StoryFlags;
  };
  progress: {
    chapter: number;
    scene: number;
    completedNodes: string[];
  };
  history: {
    nodeIds: string[];
    choices: Array<{ nodeId: string; choiceId: string }>;
  };
  bridgeState?: StoryBattleBridgeState;  // 新增：可选的桥接状态
}
```

## 三、UI 交互设计

### 3.1 存档按钮交互

```
点击存档按钮
    ↓
显示存档槽选择弹窗（如果有多个手动槽位）
    ↓
用户选择槽位 / 确认覆盖
    ↓
保存到 localStorage
    ↓
显示"存档成功"提示
```

### 3.2 读档按钮交互

```
点击读档按钮
    ↓
显示存档列表弹窗
    ├── 自动存档（最新时间）
    ├── 手动存档 1（如果有）
    ├── 手动存档 2（如果有）
    └── 手动存档 3（如果有）
    ↓
用户确认读取
    ↓
engine.restore() / engine.loadSlot()
    ↓
UI 自动通过 node_changed 事件更新
    ↓
显示"读档成功"提示
```

### 3.3 自动存档反馈（可选）

- 不显示任何提示（避免打扰）
- 或者在角落显示一个短暂的保存图标

## 四、技术实现清单

### 4.1 StoryEngine.ts 修改

- [ ] 定义 SaveSlotType 和 STORAGE_KEYS
- [ ] 创建 createSaveSlot() 私有方法
- [ ] 修改 persist() 支持存档类型参数
- [ ] 新增 saveManual(slot) 公开方法
- [ ] 新增 loadSlot(slot) 公开方法
- [ ] 新增 getAllSaveSlots() 公开方法
- [ ] 修复 load() 恢复 bridgeState
- [ ] 修复 goToNode() 和 makeChoice() 存档时机

### 4.2 StoryScreen.tsx 修改

- [ ] 添加存档/读档弹窗组件
- [ ] handleSave → 打开弹窗选择槽位
- [ ] handleLoad → 打开弹窗选择存档
- [ ] 移除手动的 setState 调用，依赖事件更新

### 4.3 存储键常量

```typescript
const SAVE_STORAGE_KEYS = {
  AUTOSAVE: 'jixia.story.autosave.v2',  // 升级版本号
  MANUAL_1: 'jixia.story.manual.1.v2',
  MANUAL_2: 'jixia.story.manual.2.v2',
  MANUAL_3: 'jixia.story.manual.3.v2',
};
```

## 五、版本兼容性

### 5.1 旧存档迁移

如果用户有 v1 版本的存档（只有一个 autosave），可以尝试读取并转换为 v2 格式：

```typescript
function migrateV1ToV2(): void {
  const v1Key = 'jixia.story.autosave.v1';
  const raw = localStorage.getItem(v1Key);
  if (raw) {
    const v1Data = JSON.parse(raw);
    const v2Slot: StorySaveSlot = {
      type: 'autosave',
      timestamp: v1Data.timestamp,
      data: v1Data,
      metadata: {
        nodeId: v1Data.currentNodeId,
        chapter: v1Data.progress?.chapter ?? 0,
        nodeCount: v1Data.progress?.completedNodes?.length ?? 0,
      },
    };
    localStorage.setItem(SAVE_STORAGE_KEYS.AUTOSAVE, JSON.stringify(v2Slot));
    localStorage.removeItem(v1Key);
  }
}
```

## 六、预计工作量

| 任务 | 优先级 | 复杂度 |
|------|--------|--------|
| 修复 load() bridgeState | P0 | 低 |
| 优化存档时机 | P0 | 中 |
| 多槽位存档支持 | P1 | 高 |
| UI 弹窗组件 | P1 | 高 |
| 存档迁移逻辑 | P2 | 低 |
