# Step4 开场动画链路恢复记录（2026-03-17）

## 目标
- 恢复“点击开始后播放 5~10 秒转场视频”的链路
- 保持已有框架不改规则

## 本步改动
1. `src/ui/screens/MvpFlowShell.tsx`
   - 新增 `TransitionScreen` 接入
   - Home 点击开始后，不再直接 `START_MATCH_FLOW`
   - 改为：先显示转场动画，动画完成后再 `dispatch({ type: 'START_MATCH_FLOW' })`

2. `src/hooks/useResponsive.ts`
   - 清理未使用变量 `isDesktop`（零行为变化，仅为通过类型检查）

## 验证
- 代码链路验证：
  - 旧流程（`App.tsx`）仍保留 `screen === 'transition'` 与 `handleStartGame -> transition`
  - 新流程（`MvpFlowShell`）新增 `TransitionScreen`，开始对战后先播动画再进匹配
- 资源验证：
  - `public/assets/transition.mp4` 存在（442,772 bytes）
- `npm run typecheck` 通过

## 影响范围
- 仅 UI 流程层；未修改战斗规则、数值、结算逻辑
