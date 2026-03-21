# Step2 运行/闪退修复记录（2026-03-17）

## 目标
- 只修复运行链路（P0）：启动失败、端口冲突导致无法访问、Electron 启动异常
- 不改规则逻辑与数值

## 本步改动文件
1. `package.json`
   - `electron:dev` 改为 `node scripts/electron-dev.cjs`
   - 新增保留命令 `electron:dev:legacy`（旧并发方式）
2. `scripts/electron-dev.cjs`（新增）
   - 统一启动顺序：先 Vite，再 Electron
   - 自动解析 Vite 实际 Local URL 并注入 `VITE_DEV_SERVER_URL`
   - 启动前清理 `ELECTRON_RUN_AS_NODE`
   - 捕获异常并进行子进程回收

## 关键修复点
- 避免了旧并发命令在端口冲突时直接失败并留下残留子进程的问题
- 避免 Electron 因错误环境变量走到 Node 模式引发启动异常
- 允许在 5173 被占用时仍可通过 Vite 实际端口启动 Electron

## 验证记录
- 复现前：存在大量残留 `vite/electron` 进程，`5173/5174/4173` 常驻占用
- 修复后：可拉起 Vite + Electron 主进程（已观测到对应 PID）
  - `vite_pid=36296`
  - `electron_main_pid=27920`
- 未再复现此前日志中的 `Cannot read properties of undefined (reading 'isPackaged')`

## 已知说明
- 旧 `runtime.log` 中存在历史 renderer crash 记录（3/16）属于历史数据，不代表本步新回归
- `npm run typecheck` 仍失败（这是 Step3 范围，不在本步修改）

## 回滚方式
- 将 `package.json` 中 `electron:dev` 切回 `electron:dev:legacy`
- 删除 `scripts/electron-dev.cjs`
