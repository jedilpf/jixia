# 争鸣史存档系统设计方案

## 一、方案选择

**选择：本地多槽位存档（localStorage）**

理由：
- 单机游戏，暂不需要多设备同步
- 开发成本低，见效快
- 满足90%的玩家需求
- 后端方案作为远期预留

## 二、最终设计方案

### 2.1 存档槽位

| 槽位 | 用途 | 说明 |
|------|------|------|
| autosave | 自动存档 | 每次节点切换自动覆盖 |
| manual_1 | 手动存档槽1 | 用户主动存档 |
| manual_2 | 手动存档槽2 | 用户主动存档 |
| manual_3 | 手动存档槽3 | 用户主动存档 |

### 2.2 存储键

```typescript
const STORAGE_KEYS = {
  AUTOSAVE: 'jixia.story.autosave.v2',
  MANUAL_1: 'jixia.story.manual.1.v2',
  MANUAL_2: 'jixia.story.manual.2.v2',
  MANUAL_3: 'jixia.story.manual.3.v2',
};
```

### 2.3 存档数据结构

```typescript
interface StorySaveSlot {
  type: 'autosave' | 'manual_1' | 'manual_2' | 'manual_3';
  timestamp: number;
  data: StorySaveData;
}

interface StorySaveData {
  version: string;
  timestamp: number;
  currentNodeId: string;
  player: {
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
  bridgeState?: StoryBridgeState;  // 可选
}
```

### 2.4 存档时机

| 触发时机 | 存档类型 | 说明 |
|----------|----------|------|
| 节点切换完成 | autosave | goToNode成功后 |
| 选择选项后 | autosave | makeChoice成功后 |
| 用户点击存档按钮 | manual_1/2/3 | 用户选择槽位 |

## 三、技术实现

### 3.1 StoryEngine 修改清单

- [x] `persist(slot)` - 支持存档类型参数
- [x] `restore(slot)` - 从指定槽位读取
- [x] `save()` - 获取存档数据
- [x] `load(data)` - 恢复存档数据
- [x] `hasSaveData(slot)` - 检查槽位是否有存档
- [x] `deleteSaveData(slot)` - 删除存档
- [x] `getSaveSlots()` - 获取所有槽位信息

### 3.2 StoryScreen 修改清单

- [ ] `SaveModal` 组件 - 存档槽位选择弹窗
- [ ] `LoadModal` 组件 - 读档槽位选择弹窗
- [ ] `handleSave` - 打开存档弹窗
- [ ] `handleLoad` - 打开读档弹窗
- [ ] 修复 handleLoad 中的重复 setState

## 四、UI 设计

### 4.1 存档弹窗

```
┌────────────────────────────────┐
│         💾 存档                │
├────────────────────────────────┤
│                                │
│  [槽位1] 手动存档 1            │
│         2024-03-15 14:30      │
│         第一章·百家争鸣         │
│                                │
│  [槽位2] 手动存档 2（空）       │
│                                │
│  [槽位3] 手动存档 3（空）       │
│                                │
├────────────────────────────────┤
│           [取消]               │
└────────────────────────────────┘
```

### 4.2 读档弹窗

```
┌────────────────────────────────┐
│         📂 读档                │
├────────────────────────────────┤
│                                │
│  [自动存档] 第一章·百家争鸣      │
│         2024-03-15 14:30      │
│         已访问42个节点         │
│                                │
│  [槽位1] 手动存档 1            │
│         2024-03-14 10:00      │
│                                │
│  [槽位2] （空）                │
│                                │
├────────────────────────────────┤
│           [取消]               │
└────────────────────────────────┘
```

## 五、注意事项

1. **自动存档**：每次节点切换自动保存，不打扰用户
2. **手动存档**：用户主动触发，可选择槽位
3. **读档确认**：读档前弹出确认框，防止误操作
4. **存档覆盖**：存档前弹出确认框，防止误覆盖

## 六、远期预留（后端方案）

如后续需要多设备同步，可扩展为：

```
当前：localStorage 多槽位
  ↓ 扩展
后端：SQLite + Express API
  ↓ 扩展
云端：Firebase/Supabase
```

## 七、已完成的工作

- [x] 设计文档编写
- [x] StoryEngine persist/restore 方法
- [x] 自动存档（goToNode 时触发）
- [x] 基础存档/读档UI按钮
- [x] chapterMoru001_part2 节点加载修复

## 八、待完成的工作

- [ ] 完善 StoryEngine 多槽位方法
- [ ] 实现 SaveModal/LoadModal 组件
- [ ] 修复 handleLoad 重复 setState 问题
- [ ] 添加存档元数据显示
- [ ] 添加存档覆盖/删除确认
