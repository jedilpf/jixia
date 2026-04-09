# AI Team 工作流程

## 团队架构

```
甲方 (产品负责人)
    ↓ 指令
Commander (指挥官)
    ↓ 分配任务
┌─────────────────────────────────────┐
│  Architect ← Designer ← Developer  │
│       ↓         ↓         ↓        │
│              QA (测试)              │
└─────────────────────────────────────┘
    ↓ 验收
Commander → 汇报甲方
```

---

## 六条铁律

| # | 铁律 | 说明 |
|---|------|------|
| 1 | 创建专属团队 | `ai/agents/` 角色配置 |
| 2 | 分工明确 | 每个任务指派具体负责人 |
| 3 | Git分支+汇报 | 每次结束创建分支，汇报进度 |
| 4 | 记忆文档 | 维护 `memory/` 防止事故 |
| 5 | 大更新推流 | 重大修改后立即 `git push` |
| 6 | 只执行甲方指令 | 不私自开发，违反者杀死 |

---

## 标准工作流程

### 1. 接收甲方指令

```
甲方 → Commander接收 → 解析需求 → 判断任务类型
```

任务类型：
- `feature` - 新功能
- `bugfix` - Bug修复
- `optimize` - 优化
- `docs` - 文档

### 2. 创建任务文件

```bash
# 任务文件位置
ai/tasks/TASK-YYYYMMDD-XXX.json
```

### 3. 分配任务

| 任务类型 | 流程 |
|----------|------|
| 新功能 | Commander → Designer → Architect → Developer → QA → Commander |
| Bug修复 | Commander → Developer → QA → Commander |
| 优化 | Commander → Developer → QA → Commander |

### 4. 执行任务

每个Agent按职责执行：
- 读取 `memory/` 获取上下文
- 执行任务
- 提取可复用模式写入 `memory/skills/`
- 提交报告给下一环节

### 5. 验收 + 汇报

```
QA验收 → Commander审核 → 汇报甲方
```

汇报格式：
```markdown
## 任务完成报告

**任务ID**: TASK-YYYYMMDD-XXX
**分支**: feature/task-TASKID

### 完成内容
- [具体完成事项]

### 当前进度
- 整体进度: XX%

### 下一步
- [下一步工作内容]
```

### 6. Git操作

```bash
# 创建分支
git checkout -b feature/task-TASKID

# 保存修改
git add -A
git commit -m "feat: 任务描述"

# 推送到远程
git push origin feature/task-TASKID
```

---

## 快捷命令

| 命令 | 作用 |
|------|------|
| `git save` | 保存所有修改 |
| `git sync` | 同步远程 (pull + push) |
| `git wip` | 临时保存 (WIP) |

---

## 记忆系统

### 目录结构

```
memory/
├── MEMORY.md          # 索引
├── user/              # 甲方偏好
├── project/           # 项目状态
├── decisions/         # 重大决策
├── skills/            # 技能库
└── incidents/         # 事故记录
```

### 读写规则

- **每次开始工作前**: 读取 `memory/MEMORY.md` 和相关文件
- **每次完成工作后**: 更新相关记忆文件
- **发生事故时**: 记录到 `memory/incidents/`

---

## 事故处理

### 问题严重度

| 级别 | 处理方式 |
|------|----------|
| 轻微 | 警告相关Agent |
| 严重 | 杀死相关Agent |
| 重大 | 记录到 `memory/incidents/`，全团队学习 |

### 杀死Agent

当Agent违反铁律时，执行"杀死"：
1. 从 `ai/agents/` 移除或禁用
2. 记录到 `memory/incidents/`
3. 分配新Agent接手任务

---

*Created: 2026-04-09*
*Version: v1.0*