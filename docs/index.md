# 《谋天下·问道百家》项目文档索引 v2.0

## 一、文档目录结构

```
docs/
├── index.md                    # 文档索引（本文档）
├── 文档命名规范_v1.md          # 命名规范
├── 文档变更记录.md             # 变更历史
├── 多版本设计文档梳理报告.md   # 版本梳理报告
│
├── battle/                     # 战斗系统文档
│   ├── battle-design-核心规则-v1.2.md
│   ├── battle-design-门派全集-v1.2.md
│   ├── battle-design-索引.md
│   ├── battle-design-机制分析.md
│   ├── battle-design-明谋暗辩规划-v1.md
│   ├── battle-spec-同步对战.md
│   └── dev/
│       ├── battle-dev-明谋暗辩实现-v2.md
│       ├── battle-test-集成测试-v1.md
│       ├── battle-test-验收报告-v1.md
│       └── battle-guide-游戏机制.md
│
├── card/                       # 卡牌系统文档
│   ├── card-balance-总览.md
│   ├── card-balance-变更记录-v0.2.md
│   ├── card-balance-评估.md
│   ├── card-balance-数据可视化.md
│   ├── card-design-文本规范.md
│   └── card-design-原型卡整理.md
│
├── faction/                    # 学派系统文档
│   └── faction-design-门派全集-v1.2.md
│
├── ui/                         # 用户界面文档
│   ├── ui-design-战斗界面框架-v1.md
│   ├── ui-design-稷下风格规范.md
│   ├── ui-design-稷下风格规范.docx
│   └── ui-design-卡牌设计规范.docx
│
├── project/                    # 项目管理文档
│   ├── project-design-完整方案-v1.md
│   ├── project-design-白皮书.md
│   ├── project-plan-后期开发-v1.md
│   ├── project-plan-明谋暗辩-v1.md
│   ├── project-req-明谋暗辩-v1.md
│   ├── project-record-开发进度.md
│   └── analysis/
│       └── project-analysis-代码分析.md
│
├── dev/                        # 开发技术文档
│   ├── dev-guide-项目总览.md
│   ├── dev-spec-技术架构.md
│   ├── dev-guide-开发者指南.md
│   └── dev-guide-AI技能.md
│
├── design-system/             # 设计系统
│   ├── design-tokens.css
│   ├── design-tokens.json
│   └── design-tokens.scss
│
└── archive/                    # 归档文档
    ├── battle-design-历史版本/
    ├── ui-design-历史版本/
    ├── old-versions/
    └── references/
```

---

## 二、快速导航

### 2.1 游戏设计师入口

| 文档 | 说明 |
|------|------|
| [battle-design-核心规则-v1.2.md](battle/battle-design-核心规则-v1.2.md) | 核心战斗规则（**推荐**） |
| [faction-design-门派全集-v1.2.md](faction/faction-design-门派全集-v1.2.md) | 门派设定全集（**推荐**） |
| [card-balance-总览.md](card/card-balance-总览.md) | 卡牌平衡性总结 |
| [ui-design-稷下风格规范.md](ui/ui-design-稷下风格规范.md) | 视觉风格规范 |

### 2.2 开发者入口

| 文档 | 说明 |
|------|------|
| [dev-guide-项目总览.md](dev/dev-guide-项目总览.md) | 项目总览 |
| [dev-spec-技术架构.md](dev/dev-spec-技术架构.md) | 技术架构 |
| [dev-guide-开发者指南.md](dev/dev-guide-开发者指南.md) | 开发者指南 |
| [battle-dev-明谋暗辩实现-v2.md](battle/dev/battle-dev-明谋暗辩实现-v2.md) | 同步对战实现说明 |

### 2.3 项目管理者入口

| 文档 | 说明 |
|------|------|
| [project-design-完整方案-v1.md](project/project-design-完整方案-v1.md) | 项目完整方案 |
| [project-plan-后期开发-v1.md](project/project-plan-后期开发-v1.md) | 后期开发策划 |
| [project-record-开发进度.md](project/record/project-record-开发进度.md) | 开发进度记录 |

---

## 三、命名规范

### 3.1 命名格式

```
[模块]-[类型]-[主题关键词]-[版本].扩展名
```

### 3.2 模块标识

| 标识 | 中文名 |
|------|--------|
| battle | 战斗系统 |
| card | 卡牌系统 |
| faction | 学派系统 |
| ui | 用户界面 |
| project | 项目管理 |
| dev | 开发技术 |

### 3.3 类型标识

| 标识 | 中文名 |
|------|--------|
| design | 设计文档 |
| spec | 规格文档 |
| guide | 指南手册 |
| report | 报告文档 |
| plan | 规划文档 |
| req | 需求文档 |
| record | 记录文档 |
| balance | 平衡性 |

---

## 四、版本说明

### 当前版本：v1.2

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.2 | 2026-03-21 | 整合16门派完整版 |
| v1.1 | - | 9门派扩展版 |
| v1.0 | - | 4门派首发版 |

---

**最后更新**：2026-03-21
**版本**：v2.0
