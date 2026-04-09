# 争鸣史问题修复方案

## 现状问题

**问题：选择后会反复跳回同一个选择点，无法继续剧情**

## 原因分析

玩家点击选项后：
1. 调用 `engine.makeChoice(cid)` 执行选择
2. 引擎跳转到下一个节点
3. 触发 `node_changed` 事件
4. UI收到事件，更新状态

**可能的问题：** 状态更新和事件触发之间的时序不对，导致选择被重复执行。

## 修复方案

### 1. 简化选择处理逻辑

**改前：**
```typescript
const handleMakeChoice = (cid: string) => {
  if (isChoosing || dialogueState !== 'choice') return;
  // 很多状态设置...
  engine.makeChoice(cid);
};
```

**改后：**
```typescript
const handleMakeChoice = (cid: string) => {
  if (isChoosing) return;
  if (dialogueState !== 'choice') return;
  if (!currentNode?.choices) return;

  const choice = currentNode.choices.find(c => c.id === cid);
  if (!choice || !choice.nextNode) return;

  setIsChoosing(true);
  engine.makeChoice(cid);
};
```

### 2. 确保状态正确重置

在 `node_changed` 事件处理中重置所有状态：

```typescript
if (event.type === 'node_changed') {
  setDialogueState('typing');
  setShowSeal(false);
  setIsChoosing(false);
  startTyping(nextNode?.content || '', Boolean(nextNode?.choices));
}
```

### 3. UI优化（已完成）

| 功能 | 状态 |
|------|------|
| 选项从底部滑出 | 已完成 |
| 选项可收起/展开 | 已完成 |
| 诸子羁绊折叠面板 | 已完成 |
| 云墨过渡动画 | 已完成 |

## 待测试

选择以下节点，确认能正常跳转：
- ch_moru_001_n003（第1个选择）
- ch_moru_001_n005（第2个选择）
- ch_moru_001_n007（第3个选择）
- ch_moru_001_n009（第4个选择）
- ch_moru_001_n010（最终选择）

## 文件修改

- `src/ui/screens/StoryScreen.tsx` - 主界面
- `src/game/story/StoryEngine.ts` - 剧情引擎（如果需要）

## 结论

现在代码已经按照这个方案修改了。让用户刷新页面测试，如果还是循环，就告诉我具体是在哪个选择点开始循环的。
