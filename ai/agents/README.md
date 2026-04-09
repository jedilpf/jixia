# Agent Prompt Templates

本目录包含所有AI角色的Prompt模板，用于指导不同AI工具执行特定角色的工作。

## 使用方式

1. 根据任务类型选择合适的Agent模板
2. 将模板内容 + 任务详情 发送给AI工具
3. AI工具按照模板定义的角色执行任务

## 文件结构

```
agents/
├── commander.md      # 项目指挥官 - 任务分解与协调
├── architect.md      # 架构师 - 系统设计
├── designer/
│   ├── story.md      # 剧情策划
│   ├── numeric.md    # 数值策划
│   └── level.md      # 关卡/辩题设计
├── developer/
│   ├── frontend.md   # 前端开发
│   ├── backend.md    # 后端/引擎开发
│   └── tools.md      # 工具开发
├── artist/
│   ├── ui.md         # UI设计
│   └── visual.md     # 视觉/动效设计
├── qa.md             # 测试工程师
└── devops.md         # 运维工程师
```

## 角色选择指南

| 任务类型 | 推荐Agent组合 |
|---------|--------------|
| 新功能开发 | Commander → Architect → Developer → QA |
| Bug修复 | Commander → Developer → QA |
| 数值调整 | Designer(numeric) → Developer → QA |
| 剧情扩展 | Designer(story) → Developer |
| UI优化 | Artist(ui) → Developer(frontend) |
| 性能优化 | Developer → QA → DevOps |
| 文档编写 | 相关角色 |

---

*最后更新: 2026-04-06*