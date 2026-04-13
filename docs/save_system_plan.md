# 存档系统优化策划案

## 一、现状分析

### 1.1 当前存档架构
- **存档位置**: localStorage
- **槽位数量**: 4个（autosave + 3个手动槽位）
- **数据结构**: StorySaveData + UnifiedSaveData（两套并行系统）
- **存档触发**: 
  - StoryEngine.goToNode() 每次节点切换都调用 persist() （**问题根源**）
  - StoryScreen 界面有存档按钮入口
- **存档展示**: SaveLoadModal / SaveSlotManager 组件可查看槽位信息

### 1.2 关键代码问题定位

#### 问题1：每次节点切换都存档（StoryEngine.ts:137）
```typescript
// 当前代码 - goToNode() 每次都调用 persist()
public goToNode(nodeId: string) {
  // ...节点切换逻辑...
  this.emit({ type: 'node_changed', nodeId });
  this.persist();  // ← 每次节点切换都存档！
}
```

#### 问题2：无存档锁机制
```typescript
// 当前 persist() 直接写入，无任何限制
public persist(slot: SaveSlotType = 'autosave'): void {
  const saveData = this.save();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
}
```

#### 问题3：两套存档系统并存
- StoryEngine 自有：`STORAGE_KEYS` = `jixia.story.*.v2`
- SaveManager 统一：`SAVE_KEY_PREFIX` = `jixia.mvp.save.*`
- 数据结构不完全一致，可能导致恢复问题

### 1.3 已存在的问题清单
| 问题 | 代码位置 | 影响 |
|------|----------|------|
| **节点切换必存档** | StoryEngine.ts:137 | 频繁写入，可能循环 |
| **无防抖机制** | persist() 方法 | 短时间内重复存档 |
| **两套系统并存** | StoryEngine + SaveManager | 数据结构不一致 |
| **存档入口分散** | StoryScreen、MainMenu、MvpFlowShell | 逻辑不统一 |
| **无存档反馈** | persist() 无返回值 | 用户不知道存档是否成功 |

---

## 二、调研参考：业界最佳实践

### 2.1 视觉小说存档设计惯例
参考主流视觉小说（如《命运石之门》、《蒸汽之都的侦探少女》）：
- **存档时机**: 仅在用户手动操作或章节结束时存档
- **自动存档间隔**: 通常 30秒~2分钟，而非每个节点
- **防抖策略**: 同节点不重复存档，最少间隔 5秒

### 2.2 localStorage 最佳实践
- **写入频率**: 建议 < 1次/秒，避免阻塞 UI
- **容量检测**: 写入前检查剩余空间
- **错误处理**: catch quota exceeded 异常并提示用户

### 2.3 存档数据结构建议
- **版本控制**: 必须有 version 字段，兼容未来升级
- **增量存档**: 历史记录只存 nodeIds，不存完整内容
- **元数据分离**: 存档列表展示的数据应单独存储，避免每次解析完整存档

---

## 二、优化目标

### 2.1 核心目标
- **防重复存档**: 同一节点短时间内不重复存档
- **存档可回看**: 存档详情展示完整，支持预览章节/节点内容
- **存档稳定可靠**: 写入失败有提示，数据损坏可恢复

### 2.2 用户体验目标
- 存档操作有明确反馈（成功/失败提示）
- 存档槽位信息清晰（章节名、节点名、游戏时长）
- 读取存档后状态完整恢复（属性、关系、历史）

---

## 三、技术方案

### 3.1 核心修改：StoryEngine.goToNode() 去除自动存档

**当前代码（问题）**:
```typescript
// StoryEngine.ts:118-138
public goToNode(nodeId: string) {
  // ...
  this.emit({ type: 'node_changed', nodeId });
  this.persist();  // ← 删除此行！
}
```

**修改方案**:
```typescript
public goToNode(nodeId: string) {
  // ...
  this.emit({ type: 'node_changed', nodeId });
  // 移除 this.persist() - 存档由外部触发
  
  // 仅章节结束时强制存档
  if (node?.type === 'ending') {
    this.forceSave('autosave');
  }
}
```

### 3.2 新增：存档防抖机制（SaveManager.ts）

```typescript
class SaveManager {
  private saveLock = {
    lastNodeId: '',
    lastTimestamp: 0,
    minInterval: 5000,  // 5秒最小间隔
    locked: false,
  };

  // 智能存档（带防抖）
  smartSave(
    slot: SaveSlotType,
    data: UnifiedSaveData,
    currentNodeId: string,
    force: boolean = false
  ): SaveResult {
    // 强制存档绕过防抖
    if (force) {
      return this.doSave(slot, data, currentNodeId);
    }

    // 防抖检查
    const now = Date.now();
    const sameNode = currentNodeId === this.saveLock.lastNodeId;
    const tooSoon = now - this.saveLock.lastTimestamp < this.saveLock.minInterval;

    if (sameNode && tooSoon) {
      console.log('[SaveManager] 存档被防抖拦截：同节点间隔过短');
      return { success: false, error: 'DEBOUNCED', reason: '同节点间隔过短' };
    }

    if (tooSoon) {
      console.log('[SaveManager] 存档被防抖拦截：间隔过短');
      return { success: false, error: 'DEBOUNCED', reason: '间隔过短' };
    }

    return this.doSave(slot, data, currentNodeId);
  }

  private doSave(
    slot: SaveSlotType,
    data: UnifiedSaveData,
    currentNodeId: string
  ): SaveResult {
    this.saveLock.locked = true;
    
    try {
      // 容量检测
      const estimatedSize = JSON.stringify(data).length;
      const available = this.checkStorageAvailable();
      if (estimatedSize > available) {
        return { success: false, error: 'STORAGE_FULL' };
      }

      // 写入
      localStorage.setItem(this.getSlotKey(slot), JSON.stringify(data));
      
      // 更新锁状态
      this.saveLock.lastNodeId = currentNodeId;
      this.saveLock.lastTimestamp = Date.now();

      // 延迟解锁
      setTimeout(() => {
        this.saveLock.locked = false;
      }, 500);

      return { success: true };
    } catch (e) {
      return { success: false, error: 'WRITE_FAILED', message: String(e) };
    }
  }

  private checkStorageAvailable(): number {
    // 检测 localStorage 剩余空间（约 5MB 上限）
    const used = Object.keys(localStorage)
      .filter(k => k.startsWith(SAVE_KEY_PREFIX))
      .reduce((sum, k) => sum + (localStorage.getItem(k)?.length || 0), 0);
    return 5 * 1024 * 1024 - used;  // 5MB - 已用
  }
}
```

### 3.3 存档触发时机重新设计

| 场景 | 触发方式 | 防抖 | 代码位置 |
|------|----------|------|----------|
| 用户点击「存档」按钮 | force=true | **禁用** | StoryScreen.tsx |
| 章节结束节点 | force=true | **禁用** | StoryEngine.goToNode() |
| 定时自动存档 | smartSave | 启用 | SaveManager.enableAutoSave() |
| 游戏暂停/打开菜单 | smartSave | 启用 | StoryScreen.tsx |
| 选择确认后 | smartSave | 启用 | StoryScreen.tsx handleChoice() |

### 3.4 存档成功/失败反馈（UI）

```typescript
// StoryScreen.tsx 新增状态
const [saveFeedback, setSaveFeedback] = useState<{
  show: boolean;
  success: boolean;
  message: string;
}>({ show: false, success: false, message: '' });

// 存档处理
const handleSave = async (slot: SaveSlotType) => {
  const result = saveManager.smartSave(
    slot,
    collectGameState(),
    engine.getCurrentNodeId(),
    true  // 手动存档强制执行
  );

  setSaveFeedback({
    show: true,
    success: result.success,
    message: result.success 
      ? '存档成功！' 
      : `存档失败：${result.error}`,
  });

  // 2秒后自动隐藏
  setTimeout(() => setSaveFeedback({ show: false, success: false, message: '' }), 2000);
};
```

---

## 四、实现文件清单

| 文件 | 操作 | 主要改动 |
|------|------|----------|
| `src/utils/SaveManager.ts` | 重构 | 添加存档锁、防抖机制、统一数据结构 |
| `src/game/story/StoryEngine.ts` | 修改 | persist() 调用改为带防抖的 save() |
| `src/ui/screens/StoryScreen.tsx` | 修改 | 存档按钮触发逻辑、存档成功/失败反馈 |
| `src/ui/components/SaveLoadModal.tsx` | 增强 | 存档详情展示、预览模式 |
| `src/ui/components/SaveSlotManager.tsx` | 检查 | 确保与新数据结构兼容 |
| `src/game/story/types.ts` | 修改 | 更新 SaveData 接口定义 |

---

## 五、测试验证清单

1. **防抖测试**
   - 快速连续点击同一节点 → 应只产生一次存档
   - 章节结束时强制存档 → 应成功

2. **存档加载测试**
   - 读取存档 → 属性、关系、flags 应正确恢复
   - 历史记录 → 应能回溯到正确节点

3. **边界测试**
   - localStorage 满时 → 应显示错误提示
   - 存档数据损坏 → 应显示「无法读取」

4. **多槽位测试**
   - 存档到不同槽位 → 应独立保存
   - 覆盖已有存档 → 应二次确认

---

## 六、实施优先级

| 优先级 | 功能 | 原因 |
|--------|------|------|
| P0 | 存档防抖机制 | 解决核心痛点（重复存档） |
| P0 | 存档成功/失败反馈 | 用户必须知道存档状态 |
| P1 | 存档详情展示 | 提升回看体验 |
| P1 | 统一数据结构 | 消除两套系统混乱 |
| P2 | 存档预览模式 | 可选增强功能 |
| P2 | 快捷键存档 | 可选便捷功能 |

---

## 七、预期效果

- **存档不再重复**: 同节点最少间隔 5 秒才能再次存档
- **存档状态可查**: 每个槽位显示章节名、节点名、时长
- **存档可靠**: 写入失败有提示，数据损坏可检测
- **代码整洁**: 单一存档系统，统一数据格式

---

## 八、具体代码改动预览

### 8.1 StoryEngine.ts 改动（核心）

```diff
 public goToNode(nodeId: string) {
   if (!this.nodeMap.has(nodeId)) {
     console.warn(`StoryEngine: Node ${nodeId} not found`);
     return;
   }

   this.history.push({ nodeId: this.currentNodeId });
   this.currentNodeId = nodeId;
   this.markNodeVisited(nodeId);
   this.syncChapterByNodeId(nodeId);

   const node = this.getCurrentNode();
   if (node) {
     if (node.type === 'ending') {
       this.handleChapterEnding(node.id);
+      // 仅章节结束时强制存档
+      this.forceSave('autosave');
     }
   }

   this.emit({ type: 'node_changed', nodeId });
-  this.persist();  // ← 删除此行！
 }

+// 新增：强制存档方法（绕过防抖）
+public forceSave(slot: SaveSlotType = 'autosave'): boolean {
+  try {
+    const saveData = this.save();
+    localStorage.setItem(STORAGE_KEYS[slot], JSON.stringify(saveData));
+    console.log(`[StoryEngine] 强制存档成功: ${slot}`);
+    return true;
+  } catch (e) {
+    console.error(`[StoryEngine] 强制存档失败:`, e);
+    return false;
+  }
+}
```

### 8.2 SaveManager.ts 新增接口和属性

```typescript
// 新增返回类型
export interface SaveResult {
  success: boolean;
  error?: 'DEBOUNCED' | 'STORAGE_FULL' | 'WRITE_FAILED' | 'UNKNOWN';
  reason?: string;
  message?: string;
}

// SaveManager 类新增私有属性
private saveLock = {
  lastNodeId: '',
  lastTimestamp: 0,
  minInterval: 5000,  // 可通过 constructor 配置
  locked: false,
};

// 新增公共方法
public smartSave(
  slot: SaveSlotType,
  data: UnifiedSaveData,
  currentNodeId: string,
  force: boolean = false
): SaveResult;

// 新增私有方法
private doSave(...): SaveResult;
private checkStorageAvailable(): number;
```

### 8.3 StoryScreen.tsx 存档按钮位置

```tsx
// 在 topBar 区域新增存档按钮（约在 line 250 附近）
<button
  onClick={() => setShowSaveModal(true)}
  onMouseEnter={() => uiAudio.playHover()}
  style={{
    padding: '6px 14px',
    background: 'rgba(88,35,16,0.76)',
    borderRadius: '6px',
    border: '1px solid rgba(236,185,87,0.5)',
    color: '#fff0d1',
    fontSize: '13px',
  }}
>
  📁 存档
</button>

// 新增存档反馈 Toast（底部浮动）
{saveFeedback.show && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 24px',
      borderRadius: '8px',
      background: saveFeedback.success ? 'rgba(90,201,114,0.9)' : 'rgba(180,60,60,0.9)',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 600,
      zIndex: 1000,
    }}
  >
    {saveFeedback.success ? '✓ 存档成功' : `✗ ${saveFeedback.message}`}
  </motion.div>
)}
```

---

## 九、风险与备选方案

### 9.1 潜在风险
| 风险 | 影响 | 处理方案 |
|------|------|----------|
| localStorage 容量不足 | 存档失败 | checkStorageAvailable() 检测 + Toast 提示 |
| 旧存档数据结构不兼容 | 读取失败 | 版本号检测 + 兼容迁移函数 |
| 用户快速点击绕过防抖 | 短时间多次存档 | 可调 minInterval 到 10秒 |
| goToNode 移除 persist 后丢失进度 | 章节内意外退出无存档 | 保留定时存档（30秒） |

### 9.2 备选方案（如 localStorage 不够用）
- **IndexedDB**: 更大容量（50MB+），异步不阻塞 UI
- **压缩存档**: 使用 LZ-string 库压缩 JSON，减少 50%+ 存储占用
- **服务器云存档**: 最可靠，需后端支持（已在 SaveManager 预留接口）