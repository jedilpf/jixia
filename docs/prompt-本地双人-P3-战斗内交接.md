# 本地双人功能开发 - Prompt 3：战斗内双人交接

---

## Prompt 内容

```
## 任务目标

在《思筹之录》项目中实现"本地双人对战"功能的第三步：
**战斗内双人交接和手牌显示控制**

## 前置条件

Prompt 1、Prompt 2 已完成：
- 主菜单入口已添加
- 局前流程（门派选择）已走通
- PlayerHandoverScreen 遮罩组件已创建

## 具体要求

### 1. 当前玩家标识

在战斗界面上明确标识当前操作玩家：
- 添加 CurrentPlayerBanner 组件
- 显示"玩家1操作中"或"玩家2操作中"
- 颜色/样式区分两位玩家

### 2. 回合切换遮罩

当需要切换操作玩家时（如明辩阶段结束进入暗谋阶段）：
- 触发 PlayerHandoverScreen 显示
- 内容："请玩家X操作"
- 非当前玩家请勿查看
- 点击"开始本回合"进入操作

### 3. 手牌显示控制（HiddenHandGuard）

这是本地双人的核心功能：
- 只有当前操作玩家可以看到自己的手牌
- 对方操作时，手牌区域显示为遮罩或隐藏

实现方式：
```typescript
interface HiddenHandGuardProps {
  isCurrentPlayer: boolean;
  actualContent: React.ReactNode;  // 当前玩家的手牌
  hiddenPlaceholder: React.ReactNode; // 对方看到的内容（如问号牌）
}
```

### 4. LocalBattleActionBar 组件

本地双人的操作栏，需要：
- 显示当前玩家信息
- 显示操作提示（如"请选择出牌"）
- 结束回合按钮
- 当前费用、大势等信息

## 状态管理

确保以下状态正确更新：
```typescript
{
  currentActingPlayerId: "player1" | "player2",
  // 切换时触发遮罩
  pendingHandover: true,
  // 手牌可见性
  handVisibilityOwnerId: currentActingPlayerId
}
```

## 约束

- 不要修改现有的 AI 对战逻辑
- 不要改变现有的战斗规则
- 只新增"同设备双人操作模式"

## 输出要求

请先列出：
1. 准备修改的文件清单
2. 每个文件的作用
3. 改动摘要
4. 还未实现的 TODO
5. 是否存在风险或依赖项

完成后，等待确认再进入 Prompt 4。
```

---

## 使用说明

1. 这是 Prompt 3，需要在 Prompt 2 完成后使用
2. 将上面的 Prompt 内容复制给 AI 助手
3. 等待 AI 列出文件清单和改动计划
4. 确认后让 AI 开始实现

---

## Prompt 4 预告

```
Prompt 4 的内容将是：
- 胜利判定
- 结果页展示
- 重新开始闭环
- 返回主菜单
```

