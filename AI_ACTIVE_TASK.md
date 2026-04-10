# AI Active Task

## Current active task
**主菜单标题与副标题改名**

任务文件：`ai/tasks/TASK-20260410-190-title-retitle.json`

## 状态切换记录

| 时间 | 任务 | 状态 |
|------|------|------|
| 2026-04-10 | 主菜单标题与副标题改名 | 🔄 进行中 |
| 2026-04-10 | 社区模块滚动修复 | 🔄 进行中 |
| 2026-04-10 | 社区模块金红主题换色 | 🔄 进行中 |
| 2026-04-09 | 前端性能与体验优化 | ✅ 已完成 |
| 2026-04-09 | 用户认证系统 | ✅ 核心功能已完成 |

## 当前工作范围

### 当前工作范围

#### 目标
- 将主菜单标题“谋天下：问道百家”改为“思筹之录”
- 将主菜单副标题改为“包罗万象，百家永生。”
- 不改其他主菜单文案、结构与交互

#### 允许修改文件
- `src/components/MainMenu.tsx`
- `AI_ACTIVE_TASK.md`
- `ai/tasks/TASK-20260410-190-title-retitle.json`

#### 禁止修改
- 除指定标题与副标题外的其他主菜单文案
- 非主菜单模块界面
- 所有现有剧情、战斗、社区、后端逻辑文件

#### 验收目标
- 主菜单显示新标题“思筹之录”
- 主菜单显示新副标题“包罗万象，百家永生。”
- 项目构建通过

## 当前边界规则

### 后端相关文件（可修改）
- `server/*`
- `electron/main.cjs`
- 数据库相关配置
- API接口

### 前端优化已完成（勿删除）
以下文件为今日新增，请保留：
- `src/components/battle/AIActionPreview.tsx`
- `src/components/battle/DiscardAssistant.tsx`
- `src/components/battle/PhaseTransition.tsx`
- `src/components/battle/panels/EnhancedLogDrawer.tsx`
- `src/ui/components/SaveSlotManager.tsx`
- `src/utils/performanceMonitor.ts`
- `src/utils/renderOptimization.tsx`
- `src/utils/resourceLoader.tsx`
- `src/config/gameConfig.ts`

### 协作规则
1. 新任务请创建 `ai/tasks/TASK-YYYYMMDD-XXX.json` 文件
2. 修改此文件 `AI_ACTIVE_TASK.md` 说明当前活跃任务
3. 删除代码前请确认不影响其他AI的工作

## 历史任务归档

### 新手引导任务（已暂停）
原任务：Build onboarding / tutorial for the "新手试炼" flow

此任务已被用户暂停，前端优化任务优先执行。

原允许修改范围：
- `src/ui/screens/MvpFlowShell.tsx`
- `src/ui/screens/BattleScreen.tsx`
- `src/ui/tutorial/*`

原禁止修改范围（现解除部分限制）：
- `src/components/BattleFrameV2.tsx` - 已增量修改（仅添加组件渲染）
- `src/battleV2/*` - 未修改核心逻辑
- `server/*` - 现可作为后端开发目标

---

## Rule for future AI contributors

1. 开始新任务前，先阅读此文件了解当前状态
2. 在 `ai/tasks/` 下创建任务文件记录你的工作
3. 只在明确授权的范围内修改代码
4. 如果发现边界冲突，在 `open_questions.md` 中记录并询问用户