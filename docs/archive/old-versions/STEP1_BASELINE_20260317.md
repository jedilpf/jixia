# Step1 基线清单（2026-03-17）

## 1) 基线快照
- 时间: 2026-03-17 18:24:26
- 分支: `main`
- 提交: `b4cc90b`
- 工作区状态: Dirty（大量历史改动混入，未形成单一可回滚提交）

## 2) 当前实现并行结构（KRAE/Trae落地程度）
- 主入口: `src/App.tsx`
- 并行流A（当前默认）: `menu -> transition -> battle_setup -> pre_battle -> battle`
- 并行流B（新MVP，仅 `?newFlow=1`）: `src/app + src/core + src/ui`
- 并行流C（KRAE/Trae备选架构）: `src_new`（80文件，features/services最重）

## 3) 已确认事实
- 开场动画资源仍存在:
  - `public/assets/transition.mp4`
  - `public/素材/fbe7eb1e32979861693d5d7ff6742c3e.mp4`
- 开场动画组件仍存在:
  - `src/components/TransitionScreen.tsx`

## 4) 可复现问题（本地扫描结果）

### P0 运行稳定性
- Electron 启动链路曾出现：
  - `TypeError: Cannot read properties of undefined (reading 'isPackaged')`
  - 该异常会导致桌面端“无法进入/闪退感”

### P1 编译链路
- `npm run typecheck` 失败：
  - `src/components/BattleLayout.tsx` 依赖 `./battle` 的旧导出项，当前 `src/components/battle/index.ts` 未导出这些符号
  - 另外存在隐式 `any` 报错

### P1 文案乱码
- 发现关键乱码位置：
  - `electron/main.cjs`：窗口标题、报错弹窗文案
  - `package.json`：`productName`

## 5) 改动分布概览（git status 统计）
- `src` 相关改动最多（约46条）
- `docs` 次之（约24条）
- `src` 内高频目录：
  - `src/battleV2`（10）
  - `src/utils`（10）
  - `src/types`（7）
  - `src/data`（5）

## 6) 后续步骤改动白名单（提案）

### Step2（仅修运行/闪退）允许改
- `electron/main.cjs`
- `package.json`（仅脚本/启动参数，不改依赖版本）
- `src/App.tsx`（仅入口守卫、流程切换守卫）
- 必要时: `electron/preload.js`（仅兼容性守卫）

### Step2 禁改
- `src/battleV2/**` 规则逻辑
- `src/core/**` 规则逻辑
- `src/data/**` 数值内容
- 任何卡牌平衡与玩法参数

### Step3（编译修复）允许改
- `src/components/battle/index.ts`（补导出，不重写）
- `src/components/BattleLayout.tsx`（仅修类型/引用，不改玩法）

### Step4（动画恢复）允许改
- `src/components/TransitionScreen.tsx`
- `src/App.tsx` 中 transition 相关调用
- 禁止替换现有视频素材，只补兼容和回退

### Step5（乱码修复）允许改
- `electron/main.cjs`
- `package.json`
- 明确出现乱码的 UI 文案文件

## 7) 验收门槛（每步必须通过）
- Step2 验收: 浏览器版 + Electron版都可进入主菜单，不崩溃
- Step3 验收: `npm run typecheck` 通过
- Step4 验收: 点击开始后出现5~10秒转场动画，可跳过
- Step5 验收: 关键路径无乱码（主菜单/转场/弹窗/窗口标题）

## 8) 回退策略
- 每一步只改白名单文件
- 每一步结束后输出“修改文件清单 + 验证结果”
- 任何一步失败，立即停在该步，不连带推进后续步骤
