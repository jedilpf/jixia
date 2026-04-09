# 剧情系统优化报告

## 一、问题诊断

### 循环问题已修复
1. ✅ 点击冷却时间从 100ms 增加到 300ms
2. ✅ ending 状态点击不再跳转，等待用户返回
3. ✅ choices 状态点击空白区域无响应

---

## 二、参考 ink 的优化

### 1. 增强节点类型
```typescript
// 参考 ink 的节点设计
type StoryNodeType =
  | 'dialogue'    // 对话（角色说话）
  | 'narration'  // 旁白（叙述）
  | 'choice'      // 选择（分支）
  | 'ending'      // 结局
  | 'scene'       // 场景切换
  | 'transition'; // 过渡
```

### 2. 增加 sticky 选择（不可反悔的选择）
```typescript
interface StoryChoice {
  id: string;
  text: string;
  nextNode: string;
  effects: ChoiceImpact;
  sticky?: boolean;  // 选择后不可反悔
  conditions?: StoryCondition[];
}
```

---

## 三、参考 VN Engine 的优化

### 1. ScriptResult 形式的统一返回
```typescript
interface ScriptResult {
  type: 'dialogue' | 'choice' | 'ending' | 'scene_complete' | 'error';
  node: StoryNode;
  canContinue: boolean;
  choices?: StoryChoice[];
}
```

### 2. 事件驱动架构
```typescript
type StoryEvent =
  | { type: 'node_changed'; node: StoryNode }
  | { type: 'dialogue_complete' }
  | { type: 'choice_made'; choice: StoryChoice }
  | { type: 'chapter_completed'; chapterId: string }
  | { type: 'error'; message: string };
```

---

## 四、当前系统已有的优化

### 1. 节点链接验证
```typescript
// StoryEngine.loadAndValidateNodes() 会检查：
// - 重复节点ID
// - nextNode 是否存在
// - choices 中的 nextNode 是否存在
```

### 2. 智能跳转
```typescript
// findSmartNextNode() 支持：
// - ending 节点自动跳转下一章节
// - 数字递增：n001 -> n002
// - 模式匹配：prolog_0_1 -> prolog_0_2
```

### 3. 存档系统
```typescript
// 支持多种存档槽位
type SaveSlotType =
  | 'manual_1' | 'manual_2' | 'manual_3'  // 手动存档
  | 'auto_1' | 'quick_1'                   // 自动/快速存档
  | 'autosave';                             // 自动存档
```

---

## 五、建议的下一步优化

### 1. 短期（立即可做）
- [x] 修复循环问题
- [ ] 添加开发控制台日志
- [ ] 增加节点验证工具

### 2. 中期（需要时间）
- [ ] 参考 ink 重写剧情数据格式
- [ ] 增加剧本式语法支持
- [ ] 添加可视化编辑器

### 3. 长期（重大改动）
- [ ] 支持 YAML/JSON 格式剧情脚本
- [ ] 参考 RenJS 的插件系统
- [ ] 添加运行时调试器

---

## 六、验证清单

使用前运行验证：
```typescript
const engine = getStoryEngine();
const brokenLinks = engine.getBrokenLinks();
if (brokenLinks.size > 0) {
  console.warn('发现断裂链接:', brokenLinks);
}
```

检查节点：
```typescript
const allNodes = engine.getAllNodes();
console.log(`共 ${allNodes.length} 个节点`);
```
