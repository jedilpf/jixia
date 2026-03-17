# Step5 乱码修复 + UI 微调记录（2026-03-17）

## 目标
- 修复当前可见乱码文案
- 优化门派选择页按钮可点击性
- 恢复卡牌附框并减少手牌区域遮挡/裁切感

## 本步改动文件
1. `electron/main.cjs`
   - 修复窗口标题乱码：`谋天下：问道百家`
   - 修复渲染崩溃弹窗乱码文案
2. `package.json`
   - 修复 `build.productName` 为 `谋天下：问道百家`
3. `src/components/battle/controls/LogButton.tsx`
   - 修复按钮标题与文案乱码（战斗日志/日志）
4. `src/components/PreBattleFlow.tsx`
   - 优化议题/门派锁定底栏交互层级：提高 z-index、增强 pointer-events
   - 滚动区加底部留白，避免按钮被内容压住导致“点不到”
5. `src/components/BattleFrameV2.tsx`
   - 右侧操作提示在窄屏隐藏，避免挤压主战区
6. `src/components/battle/controls/OperationHints.tsx`
   - 侧栏宽度微调，减少对战场占用
7. `src/components/battle/layers/BottomControls.tsx`
   - 按卡牌类型恢复附框：立论/策术/反诘/门客/玄章
   - 手牌扇形角度与偏移收敛，降低裁切感
   - 手牌区改为横向可滚动，避免边缘卡被截断
8. `src/components/battle/layers/BattleArena.tsx`
   - 战场展示卡（主议/旁议）同步加回类型附框

## 资源映射（附框）
- 立论 -> `assets/frames/frame-lilun.png`
- 策术 -> `assets/frames/frame-ceshu.png`
- 反诘 -> `assets/frames/frame-fanje.png`
- 门客 -> `assets/frames/frame-menke.png`
- 玄章 -> `assets/frames/frame-xuanzhang.png`

## 验证
- `npm run typecheck` 通过
- `npm run electron:dev` 启动日志显示已拉起 Vite 与 Electron（端口自动回退可用）

## 影响边界
- 本步仅改显示层/交互层，不改规则引擎与数值配置
