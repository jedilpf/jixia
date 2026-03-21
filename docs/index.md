# 《谋天下·问道百家》项目文档索引

## 文档目录结构

```
docs/
├── index.md                          # 文档索引（本文档）
├── 项目整理方案_v1.md                 # 项目整理方案
├── 多版本设计文档梳理报告.md           # 多版本文档梳理报告
├── 项目演示视频字幕文案.md             # 演示视频字幕
│
├── game-design/                      # 游戏设计文档
│   ├── 核心战斗规则_v1.2.md          # 核心战斗规则（整合版）
│   ├── 门派设定全集_v1.2.md          # 门派设定全集（整合版）
│   ├── 百家争鸣_核心战斗规则规范_v0.2.md  # 原始文档
│   ├── 战斗机制总说明_v1.md          # 原始文档
│   ├── 对战系统文档索引.md
│   ├── 游戏机制深度分析.md
│   ├── 游戏设计白皮书.md
│   ├── BALANCE_SUMMARY.md
│   ├── CARD_BALANCE_CHANGES_V02.md
│   ├── CARD_BALANCE_EVALUATION.md
│   ├── CARD_STATS_VISUALIZATION.md
│   ├── CARD_TEXT_ADAPTATION.md
│   ├── 首发4个论场完整设定文档_v1.md
│   ├── 后期开发总策划_基于战斗方式_v1.md
│   └── 游戏机制分析_现有原型卡整理.md
│
├── development/                      # 开发文档
│   ├── 百家争鸣_项目完整方案_v1.md
│   ├── 百家争鸣_明谋暗辩_开发实现说明_v2.md
│   ├── 明谋暗辩_需求分析_v1.md
│   ├── 明谋暗辩_规划设计_v1.md
│   ├── 明谋暗辩_开发规划_v1.md
│   ├── 明谋暗辩_集成测试报告_v1.md
│   ├── 明谋暗辩_验收交付_v1.md
│   ├── 知识库-01-项目总览.md
│   ├── 知识库-02-技术架构.md
│   ├── 知识库-03-开发进度.md
│   ├── 知识库-04-游戏机制.md
│   ├── 知识库-05-开发者指南.md
│   └── 知识库-06-AI技能说明.md
│
├── ui-design/                        # UI设计文档
│   ├── 首发战斗界面框架_v1.md
│   ├── style-pass-bronze-mechanism.md
│   ├── style-pass-bronze-mechanism.docx
│   └── 卡牌设计假设与统一视觉规范.docx
│
├── specs/                            # 规格文档
│   └── SYNC_BATTLE_DESIGN.md        # 同步对战设计规格
│
├── design-system/                    # 设计系统
│   ├── design-tokens.css
│   ├── design-tokens.json
│   └── design-tokens.scss
│
├── analysis/                         # 分析报告
│   └── repo-file-metrics-brief.md
│
└── archive/                          # 历史文档（只读）
    ├── old-versions/                 # 旧版本文档
    │   ├── 卡牌设计.md
    │   ├── 卡牌游戏框架审查报告_v1.md
    │   ├── 优化相关文档...
    │   └── 开发步骤文档...
    │
    └── references/                   # 参考资料
        ├── 核心信息提取.md
        ├── 稷下论道_Master_GDD_v1.1.md
        ├── 稷下策划案.pdf
        ├── 软著申请材料.md
        └── 阅读这个项目：...pdf
```

## 快速导航

### 新开发者入门
1. 先阅读 [百家争鸣_项目完整方案_v1.md](development/百家争鸣_项目完整方案_v1.md)
2. 查看 [知识库-01-项目总览.md](development/知识库-01-项目总览.md)
3. 参考 [知识库-05-开发者指南.md](development/知识库-05-开发者指南.md)

### 游戏设计了解
1. [核心战斗规则_v1.2.md](game-design/核心战斗规则_v1.2.md) - **推荐**
2. [门派设定全集_v1.2.md](game-design/门派设定全集_v1.2.md) - **推荐**
3. [百家争鸣_核心战斗规则规范_v0.2.md](game-design/百家争鸣_核心战斗规则规范_v0.2.md)
4. [首发4个论场完整设定文档_v1.md](game-design/首发4个论场完整设定文档_v1.md)

### UI设计参考
1. [首发战斗界面框架_v1.md](ui-design/首发战斗界面框架_v1.md)
2. [style-pass-bronze-mechanism.md](ui-design/style-pass-bronze-mechanism.md)

### 同步对战系统
1. [SYNC_BATTLE_DESIGN.md](specs/SYNC_BATTLE_DESIGN.md)
2. [百家争鸣_明谋暗辩_开发实现说明_v2.md](development/百家争鸣_明谋暗辩_开发实现说明_v2.md)

---

## 版本说明

### 当前版本：v1.2

核心文档已整合为以下两个主文档：

| 文档 | 说明 |
|------|------|
| 核心战斗规则_v1.2.md | 整合版核心战斗规则，包含全局规则、游戏流程、论场系统 |
| 门派设定全集_v1.2.md | 整合版门派设定，包含16门派详细设计和卡牌数据 |

### 整合来源

- 4门派版本（首发版）
- 9门派版本（扩展版）
- 16门派版本（完整版 v1.2）

详见 [多版本设计文档梳理报告.md](多版本设计文档梳理报告.md)

---

**最后更新**：2026-03-21
**版本**：v2.0
