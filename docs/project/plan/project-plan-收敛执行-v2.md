# 百家争鸣收敛执行计划 v2

- 版本: `v2`
- 日期: `2026-03-22`
- 目标: 把“想法驱动”改成“约束驱动”，把每次产出都纳入可验证流水线。

## 0. 执行总表（逐条）

| 序号 | 角度 | 核心动作 | 状态 | 验收标准 |
|---|---|---|---|---|
| 01 | 单一可信源 | 固定 `canon/anchors.yaml` | 已完成 | 锚点文件存在且可被脚本读取 |
| 02 | 禁写边界 | 固定 `canon/taboo.yaml` | 已完成 | 含复杂度和范围硬阈值 |
| 03 | 术语治理 | 固定 `canon/terminology.yaml` | 已完成 | 术语可被规则校验器读取 |
| 04 | 范围治理 | 固定 `scope/bs01.yaml` | 已完成 | 包含in/out scope与周预算 |
| 05 | 机制索引 | 固定 `mechanics/index.yaml` | 已完成 | mechanic id 可被引用校验 |
| 06 | 结构门禁 | `validate-structure` | 已完成 | 可对 `content/cards/*.json` 校验 |
| 07 | 引用门禁 | `validate-references` | 已完成 | 锚点/机制引用能阻断错误 |
| 08 | 术语门禁 | `validate-terminology` | 已完成 | 非注册术语能被识别 |
| 09 | 复杂度门禁 | `validate-complexity` | 已完成 | 文本长度/关键词超限即失败 |
| 10 | 日门禁 | `gate:daily` | 已完成 | 一条命令串起日常检查 |
| 11 | 周门禁 | `gate:weekly` | 已完成 | 每周阻断项阈值可检查 |
| 12 | 里程碑门禁 | `gate:milestone` | 已完成 | 关键文件缺失可阻断 |
| 13 | CI自动化 | `.github/workflows/pr-validate.yml` | 已完成 | PR自动触发门禁与静态检查 |
| 14 | 执行容器 | backlog/open_questions/playtests/provenance | 已完成 | 有结构化模板可直接填报 |
| 15 | 新设定流程 | `NEW_CANON_PROPOSAL` | 已完成 | 新锚点有且仅有一条入口 |
| 16 | 数据模板 | `schemas/card.schema.json` + 样例卡2张 | 已完成 | 新卡可参照模板产出 |
| 17 | 运行验证 | 本地跑通 `gate:daily` | 进行中 | 命令返回0并输出PASS |
| 18 | 真实数据迁移 | 将现有卡池映射到新格式并分批入库 | 待开始 | 首批10张迁移并通过门禁 |

## 1. 根因角度（决策带宽）

- 问题: 生成速度大于决策速度，导致“每个方向都像对的”。
- 策略: 用约束文件替代口头想法，所有新增内容先过边界再讨论。
- 已落地:
  - `canon/anchors.yaml`
  - `canon/taboo.yaml`
  - `scope/bs01.yaml`
- 下一步:
  - 每次AI任务附带 `anchors + taboo + scope` 三件套。

## 2. 一致性角度（世界观与机制）

- 问题: 多模型并行会写出冲突设定。
- 策略: 引用义务 + 锚点白名单。
- 已落地:
  - 卡牌字段强制 `lore_anchor_ids`
  - `validate-references` 校验锚点存在性
- 验收:
  - 不存在“无锚点ID”的候选卡。

## 3. 范围角度（Scope Creep）

- 问题: 学派和机制持续膨胀。
- 策略: `scope/bs01.yaml` 锁双学派与周预算。
- 已落地:
  - 双学派MVP约束
  - 每周预算: 新机制0、新锚点0、新卡10
- 验收:
  - 超出内容全部转入 `backlog.md`。

## 4. 卡牌复杂度角度

- 问题: 单卡规则越来越长，审校成本飙升。
- 策略: 复杂度硬阈值。
- 已落地:
  - `max_rules_text_length: 25`
  - `max_keywords_per_card: 2`
  - `max_rules_sentences: 2`
- 验收:
  - `validate-complexity` 全量通过。

## 5. 术语角度（语言漂移）

- 问题: 同义词漂移导致规则歧义和脚本不可判定。
- 策略: 术语白名单 + 括号术语扫描。
- 已落地:
  - `canon/terminology.yaml`
  - `validate-terminology`
- 验收:
  - 规则文本中的 `【术语】` 全部可映射到术语表。

## 6. 结构化产出角度

- 问题: 文本草案多，机器不可校验。
- 策略: 每张卡单文件JSON + schema。
- 已落地:
  - `schemas/card.schema.json`
  - `content/cards/*.json` 样例
  - `validate-structure`
- 验收:
  - 必填字段、枚举、ID格式和provenance完整。

## 7. AI调度角度

- 问题: 工位并行但缺统一“收件箱”和准入标准。
- 策略: 候选统一进入 `content/cards/`，由脚本二元判定。
- 已落地:
  - `content/cards/README.md`
  - `gate:daily` 命令
- 后续建议:
  - A波生成后只允许“入收件箱”，不允许直接改主数据。

## 8. 风险角度

- P0: 一致性崩坏、范围蔓延
- P1: 幻觉不可复现、平衡失控
- P2: 数据泄露、IP风险

已落地应对:
- 一致性: 引用义务 + anchors白名单
- 范围: scope预算 + backlog容器
- 幻觉: provenance必填
- 平衡: 预留 `gate:weekly` 阈值检查入口

## 9. 门禁角度（流程治理）

- 日门禁: `npm run gate:daily`
- 周门禁: `npm run gate:weekly`
- 里程碑门禁: `npm run gate:milestone`

已落地:
- 4个基础校验器 + 3个组合门禁器
- open questions 阻断规则（P0/P1 open > 3 则阻断）

## 10. 工程自动化角度

- 已落地:
  - `.github/workflows/pr-validate.yml`
  - PR自动执行: `gate:daily + typecheck + lint`
- 预期收益:
  - 把错误拦在合并前，而不是试玩后。

## 11. 版本与回滚角度

- 当前策略:
  - `gate:milestone` 保证关键资产存在性
  - 回滚触发建议: 平衡偏离 > 10% 或设定冲突不可调和
- 后续增强:
  - 增加 tag 检查与 `CHANGELOG.md` 强约束。

## 12. 运营与节奏角度（Solo可持续）

- 固定节奏:
  - 早间审异常
  - 上午批量生成
  - 午间结构化定稿
  - 下午平衡与工程
  - 晚间门禁合并
- 已落地容器:
  - `open_questions.md`
  - `backlog.md`
  - `playtests/README.md`

## 13. 一条一条执行清单（下一批）

1. 跑 `npm run gate:daily`，修掉当前首批失败项。
2. 从 `src/data/cardsDB.json` 迁移首批10张卡到 `content/cards/` 新结构。
3. 为这10张卡补全 `lore_anchor_ids` 与 `mechanic_ids`。
4. 将未知项以 `UNKNOWN` 标注并登记到 `open_questions.md`。
5. 每完成一批就跑一次 `gate:daily`，通过后再进下一批。
