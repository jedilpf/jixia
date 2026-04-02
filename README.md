# 百家争鸣 2.0（项目主入口）

本仓库当前基线为：
- 论辩题材卡牌对战主玩法
- 剧情模式与战斗链路并行开发
- 190 张卡数据基线（见日常门禁输出）

## 快速开始

### 1) Node.js 版本要求

- 推荐：Node.js `20.10.0`
- 最低：Node.js `>=20.10.0`
- 项目已提供 `.nvmrc`，可直接执行：

```bash
nvm use
```

### 2) 安装依赖与启动

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run build
npm run preview
npm run typecheck
```

## 目录与入口约定（重要）

- `src/`：唯一前端主代码入口（当前可运行版本）
- `server/`：后端 API 与存档/进度持久化
- `docs/`：策划、架构、流程与知识库文档
- `scripts/`：工程脚本与自动化门禁
- `tests/`：自动化测试用例

说明：
- 历史探索目录 `src_new/` 不再作为主分支入口，当前结构以 `src/` 为准。
- 主分支仅保留一套可运行主链路，探索性内容建议放独立分支。

## 测试

本项目提供基础自动化测试入口：

```bash
npm run test
```

当前测试重点是后端 API 冒烟验证（健康检查、存档路由基础行为），后续会继续补充前端与集成测试。

## AI 协作流程（仓库强约束）

在执行任何内容/设计/代码任务前，请先遵循：
1. 阅读 `AI_START_HERE.md`
2. 在 `ai/tasks/*.json` 创建任务文件
3. 执行 `npm run ai:prompt -- --task <task-file>`
4. 严格遵循 packet 约束和 allowed scope
5. 结束执行 `npm run ai:finalize -- --task <task-file>`

## License

本仓库使用 MIT License，详见根目录 [LICENSE](./LICENSE)。
