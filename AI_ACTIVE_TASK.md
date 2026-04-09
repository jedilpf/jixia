# AI Active Task

## Current active task
**用户认证系统开发**

任务文件：`ai/tasks/TASK-20260409-157-backend-user-auth.json`

## 状态切换记录

| 时间 | 任务 | 状态 |
|------|------|------|
| 2026-04-09 | 前端性能与体验优化 | ✅ 已完成 |
| 2026-04-09 | 用户认证系统 | ✅ 核心功能已完成 |

## 当前工作范围

### 已完成文件
- ✅ `server/utils/password.cjs` - 密码哈希工具
- ✅ `server/utils/jwt.cjs` - JWT令牌工具
- ✅ `server/middleware/auth.cjs` - 认证中间件
- ✅ `server/store/user-store.cjs` - 用户数据存储
- ✅ `server/routes/auth.cjs` - 认证路由（注册/登录/刷新/登出）
- ✅ `server/routes/users.cjs` - 用户路由（用户信息管理）
- ✅ `server/app.cjs` - 集成认证系统

### API端点
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新令牌
- `POST /api/v1/auth/logout` - 登出
- `POST /api/v1/auth/logout-all` - 登出所有设备
- `GET /api/v1/users/me` - 获取当前用户信息
- `PUT /api/v1/users/me` - 更新用户信息
- `PUT /api/v1/users/me/password` - 更改密码
- `GET /api/v1/users/:userId` - 获取指定用户公开信息

### 禁止删除
- 所有现有的server文件
- 前端优化新增的文件（见下方清单）

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