# AI 记忆库：常见错误与最佳实践

## 一、React Hooks 常见错误

### 1. useRef vs useState 混淆
**错误：** 用 useState 来存储不需要触发UI更新的值（如处理锁、临时数据）

**正确做法：**
- `useState` → 用于 UI 状态（dialogueState, showSeal, displayedText）
- `useRef` → 用于不需要触发渲染的值（isProcessingRef, currentNodeRef, typingIntervalRef）

**示例：**
```typescript
// 错误：处理锁用 useState
const [isProcessing, setIsProcessing] = useState(false);

// 正确：处理锁用 useRef
const isProcessingRef = useRef(false);
```

### 2. useCallback 依赖遗漏
**错误：** 回调函数依赖了变化的 state，但没放在依赖数组里

**正确做法：**
```typescript
// 错误
const handleClick = useCallback(() => {
  doSomething(count); // count 变化了但没在依赖里
}, []);

// 正确
const handleClick = useCallback(() => {
  doSomething(count);
}, [count]);
```

### 3. 在 useEffect 清理函数中清理不存在的定时器
**错误：** 组件卸载时定时器可能已经不存在了

**正确做法：**
```typescript
useEffect(() => {
  const id = setInterval(() => {}, 1000);
  return () => {
    if (id) clearInterval(id); // 检查存在
  };
}, []);
```

---

## 二、游戏状态管理常见错误

### 1. 事件监听器中忘记清理
**错误：** 订阅事件后没有在 cleanup 中取消订阅

**正确做法：**
```typescript
useEffect(() => {
  const unsubscribe = engine.subscribe(handler);
  return () => {
    unsubscribe(); // 必须清理
  };
}, [engine]);
```

### 2. 状态更新和事件触发时序问题
**错误：** 点击处理函数中多次设置 state，导致状态不一致

**正确做法：**
```typescript
// 用 ref 来追踪最新状态，用锁来防止重复执行
const isProcessingRef = useRef(false);

const handleChoice = () => {
  if (isProcessingRef.current) return; // 防止重复
  isProcessingRef.current = true;

  engine.makeChoice(cid);

  // 在事件回调中重置
};
```

### 3. 忘记在状态变化时更新 ref
**错误：** state 变了但 ref 没更新，导致闭包问题

**正确做法：**
```typescript
// 在 node_changed 事件中同时更新 state 和 ref
if (event.type === 'node_changed') {
  const nextNode = engine.getCurrentNode();
  currentNodeRef.current = nextNode; // 同步更新 ref
  setCurrentNode(nextNode);           // 更新 UI
}
```

---

## 三、StoryScreen 特定问题记录

### 1. 选择后无限循环问题
**现象：** 选择后跳回到原来的选择点

**原因：**
- 没有防重复点击机制
- `dialogueState` 状态变化导致多次触发

**解决方案：**
```typescript
const isProcessingRef = useRef(false);

const handleMakeChoice = (cid: string) => {
  if (isProcessingRef.current) return;
  if (dialogueState !== 'choice') return;

  isProcessingRef.current = true;
  setShowSeal(true);

  setTimeout(() => {
    engine.makeChoice(cid);
    // node_changed 事件会重置 isProcessingRef
  }, 800);
};
```

### 2. Ending 节点后继续跳转问题
**现象：** 看到 ending 后点击继续，又跳回开头

**原因：** Ending 节点有 nextNode 属性，点击继续会执行跳转

**解决方案：**
```typescript
const handleContinue = () => {
  if (dialogueState === 'complete' && currentNode?.nextNode) {
    if (currentNode.type === 'ending') return; // Ending 不跳转
    engine.goToNext();
  }
};
```

### 3. 动画期间误触问题
**现象：** 选择动画期间点击又触发了其他操作

**解决方案：**
```typescript
// 动画期间禁用主区域点击
<main onClick={showSeal ? undefined : handleContinue}>

// 选择面板动画期间也禁用
{showSeal && <选择面板隐藏>}
```

---

## 四、防重复执行的模式

### 1. 使用 ref 作为锁
```typescript
const isProcessingRef = useRef(false);

// 检查
if (isProcessingRef.current) return;

// 设置
isProcessingRef.current = true;

// 重置（在事件回调或 setTimeout 中）
setTimeout(() => {
  isProcessingRef.current = false;
}, duration);
```

### 2. 使用 ref 追踪最新状态
```typescript
const currentNodeRef = useRef(currentNode);

// 每次 state 变化时更新 ref
useEffect(() => {
  currentNodeRef.current = currentNode;
}, [currentNode]);

// 在回调中使用 ref 而不是 state
const handle = () => {
  const node = currentNodeRef.current; // 永远是最新值
};
```

### 3. 组合：锁 + ref
```typescript
const LOCK_DURATION = 800;

const handleChoice = (cid: string) => {
  if (isProcessingRef.current) return;

  isProcessingRef.current = true;
  setShowSeal(true);

  setTimeout(() => {
    engine.makeChoice(cid);
    // 注意：不要在这里手动重置锁
    // 锁应该在 node_changed 事件中重置
  }, LOCK_DURATION);
};
```

---

## 三、剧情系统（StoryEngine）常见问题

### 1. 节点循环跳转
**问题：** 选择后跳回同一个节点

**排查步骤：**
- [ ] 检查选择节点的 nextNode 是否正确
- [ ] 检查 goToNode 是否被多次调用
- [ ] 检查事件监听是否重复订阅

**解决方案：**
- 使用 ref 作为锁防止重复执行
- ending 状态点击不跳转
- 点击冷却时间足够长（300ms）

### 2. 断裂的节点链接
**问题：** nextNode 指向不存在的节点

**解决方案：**
```typescript
// 启动时验证
const brokenLinks = engine.getBrokenLinks();
if (brokenLinks.size > 0) {
  console.warn('断裂链接:', brokenLinks);
}
```

### 3. 状态同步问题
**问题：** UI 状态和引擎状态不一致

**解决方案：**
- UI 订阅引擎事件来同步状态
- 不要在引擎外部修改状态

---

## 四、参考项目学习总结

### 1. ink (inkle Studios)
**GitHub:** https://github.com/inkle/ink

**核心设计：**
- 节点（Knots）+ 子节点（Stitches）
- 用 `->` 实现跳转
- 支持变量、条件判断、循环

### 2. VN Engine
**npm:** vn-engine

**核心设计：**
- 事件驱动的状态管理
- ScriptResult 形式的统一返回
- YAML/JSON 脚本格式

### 3. RenJS V2
**GitHub:** https://github.com/lunafromthemoon/RenJS-V2

**核心设计：**
- 插件系统
- GUI Builder 可视化编辑
- 基于 PhaserJS 的动画支持

---

## 五、检查清单

修改状态管理代码前，确认：

- [ ] 变化的UI值用 useState
- [ ] 不变化的临时值用 useRef
- [ ] 回调函数用 useCallback 并包含所有依赖
- [ ] useEffect cleanup 函数正确清理
- [ ] 防重复点击使用 ref 锁
- [ ] ref 在 state 变化时同步更新
- [ ] 动画/处理期间禁用相关交互
- [ ] 节点链接在启动时验证

---

## 六、搜索结果摘要

### useRef 最佳实践
- 用于 DOM 访问、大量数据、持久化值
- 改变 `.current` 不会触发重新渲染
- 适合游戏中的帧数据、动画值

### useState 最佳实践
- 用于 UI 状态
- 每次更新触发重新渲染
- 适合对话框状态、显示/隐藏

### 游戏状态管理建议
- 复杂状态用 Zustand/Redux
- 跨组件状态用 Context（但注意性能）
- 本地状态用 useState/useReducer
- 临时/处理状态用 useRef
