# 《思筹之录》多模型协作执行计划 v1

**编制日期**：2026-03-22  
**适用对象**：Claude（Cloud）、CodeX/Codex、Kimi、GLM、DeepSeek、MiniMax、Gemini 等  
**输入依据**：
- `项目完成度评估-2026.03.22.md`
- `docs/archive/多智能体协作生成百家争鸣主题卡牌内容的可复用工作流深度研究报告.docx`

---

## 1. 目标与边界

本计划只做一件事：把当前“规则完整但联网缺失”的项目，变成**可被多个模型稳定协同执行**的工程流水线。  

当前关键事实（来自完成度评估）：
- 规则与设计：90%+
- 前端与编译：70%-100%
- 战斗引擎：约75%
- 同步机制：约55%（缺后端支撑）
- 网络层/玩家系统/持久化：0%

因此，**第一优先级不是再写新设定，而是把联网对战MVP打通**。

---

## 2. 三条总原则（所有模型必须遵守）

1. Single Source of Truth（唯一事实源）
- 设定锚点、术语、规则、卡牌、协议、测试结果都必须落盘到仓库。
- 任何“仅存在于对话窗口”的结论都不算完成。

2. 结构化交付优先
- 最终可执行资产必须是结构化文件（JSON/YAML/TS/MD），可被脚本检查。
- 自由文本只用于解释，不用于最终发布资产。

3. 双门禁机制
- 自动门禁：schema/lint/typecheck/test/build。
- 人工门禁：只审“异常项、冲突项、风险项”，不重复审已自动通过内容。

---

## 3. 统一任务单协议（跨模型通用）

后续你给任何模型的任务，都建议强制使用下列模板。

```yaml
task_id: NET-P1-001
task_type: code|design|balance|review|ops
priority: P0|P1|P2
phase: P0|P1|P2|P3
goal: 一句话定义目标
inputs:
  files:
    - path: src/battleV2/engine.ts
    - path: docs/battle/battle-design-核心规则-v1.2.md
  constraints:
    - 不改动无关文件
    - 允许 UNKNOWN，不允许臆造
output_contract:
  deliverables:
    - path: docs/project/record/xxx.md
      format: markdown|json|yaml|ts
  required_fields:
    - status
    - changed_files
    - verification
acceptance:
  commands:
    - npm run typecheck
    - npm run lint
    - npm run build
  pass_criteria:
    - 退出码为0
handoff_to: 下一个工位或模型
```

模型回传统一用以下结构：

```json
{
  "task_id": "NET-P1-001",
  "status": "PASS|BLOCKED|NEEDS_HUMAN_REVIEW",
  "changed_files": [],
  "verification": [],
  "open_questions": [],
  "risks": [],
  "next_actions": []
}
```

---

## 4. 工位分配矩阵（主备模型）

| 工位 | 主模型 | 备份模型 | 交付格式 |
|---|---|---|---|
| 任务拆解/总控 | ChatGPT/CodeX | Claude | Markdown + 任务单YAML |
| 设定一致性审校 | Claude | GLM | JSON（冲突清单）+ MD |
| 中文创意候选 | Kimi | MiniMax/GLM | YAML候选列表 |
| 结构化定稿（卡牌/机制） | ChatGPT/CodeX | DeepSeek | 严格JSON/YAML（过schema） |
| 平衡风险与测试用例 | DeepSeek | ChatGPT/Claude | JSON（风险+case） |
| 代码实现与修复 | CodeX/Codex | Claude Code/Trae | TS/JS + 测试结果 |
| 美术Brief结构化 | Gemini | Kimi/Claude | YAML |
| 运营文案与本地化草案 | MiniMax | GLM/Kimi | Markdown + i18n JSON |

执行规则：
- 同一任务只设一个“主模型负责人”，避免多模型重复写同一文件。
- 备份模型只在主模型失败或产出不达标时接管。
- 接管时必须引用上一次任务单输出，禁止从头重写。

---

## 5. 分阶段落地路线（面向当前项目）

## P0（1周）：协作基建与门禁先行

目标：把“协作协议、校验脚本、目录约束”落到仓库。

交付：
- 新增 `schemas/`（card/mechanic/protocol）
- 新增 `tools/validate_*`（schema + 引用完整性）
- 新增 `.github/workflows/pr-validate.yml`
- 新增 `docs/project/plan/task-board-template.md`

DoD：
- 任意模型按任务单都能产出可校验结果
- PR自动校验跑通（至少 typecheck/lint/build）

## P1（2周）：联网MVP骨架

目标：补齐“0%网络层”到可联机最小闭环。

交付：
- `server/`（Node.js + WebSocket）
- 房间创建/加入/离开/重连
- 服务器权威时钟与回合同步协议
- 前端连接状态、超时与断线提示

DoD：
- 两个客户端可完成 1v1 一局
- 明辩/暗谋/揭示计时一致（误差阈值明确）

## P2（2周）：权威结算与一致性

目标：服务端权威结算替代前端本地拍脑袋结算。

交付：
- 服务端战斗结算流程（按五层顺序）
- 客户端改为“输入+渲染”，不直接写最终状态
- Replay日志与结算追踪

DoD：
- 同一对局重放一致
- 非法操作被服务端拒绝并记录原因

## P3（2周）：可测试可迭代版本

目标：形成“可持续扩展”而不是一次性演示。

交付：
- 玩家最小档案（匿名ID或简易登录）
- 对局记录持久化（最小字段集）
- 每日批次内容流水线（10张卡为单位）
- 夜间平衡回归任务（Nightly）

DoD：
- 有可追踪版本号、可回滚Tag、可复现报告
- 批量内容新增不破坏协议与校验

---

## 6. 仓库结构建议（与现项目兼容）

```text
jixia2.0/
  src/
  docs/
  server/                     # 新增：联网与权威结算
  shared/                     # 新增：前后端共享类型/协议
  schemas/                    # 新增：JSON Schema
  tools/                      # 新增：生成/校验脚本
  balance/
    engine/
    reports/
  .github/workflows/
```

建议先不拆多仓，优先单仓落地，等 P2 稳定后再评估 monorepo 拆分。

---

## 7. 门禁标准（必须可自动化）

合并前最小门禁：
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `node tools/validate_cards.js`（P0新增）
- `node tools/validate_protocol.js`（P0新增）

人工门禁只看四类项：
- schema 虽通过但语义冲突
- 规则/设定冲突（锚点不一致）
- 平衡高风险（先手压制、无限循环）
- 安全与合规风险（敏感数据、未授权素材）

---

## 8. 任务表映射规则（你后续给表后直接套用）

收到任务表后，按以下规则路由：

1. `task_type=code`  
- 默认主模型：CodeX/Codex  
- 备份：Claude/Trae  
- 必须附带可运行验证命令

2. `task_type=design` 且需要强一致性  
- 默认主模型：Claude  
- 备份：GLM  
- 必须输出冲突清单与引用锚点ID

3. `task_type=content`（卡牌/机制批量）  
- 候选：Kimi/MiniMax/GLM 并行  
- 定稿：ChatGPT/CodeX 结构化收束  
- 必须过 schema 与术语检查

4. `task_type=balance`  
- 默认主模型：DeepSeek  
- 备份：ChatGPT  
- 必须输出“可量化改动建议”

5. `task_type=ops`（CI/CD、发布、回滚）  
- 默认主模型：CodeX  
- 备份：Claude  
- 必须提供回滚步骤与影响面说明

---

## 9. 风险清单与预案（简版）

1. 多模型结果冲突
- 预案：强制主备制 + 统一任务单 + 单任务单负责人

2. 输出格式崩坏
- 预案：先schema后合并；不通过直接退回

3. 网络层延期拖垮全局
- 预案：P1只做最小可联机闭环，不并行扩新内容

4. 人审负担过高
- 预案：自动门禁前置，人只审异常项

---

## 10. 可直接复制给各模型的统一指令

```text
你将执行一个标准化任务。请严格按任务单输入进行，不要扩展无关范围。
必须遵守：
1) 仅修改任务单允许的文件；
2) 输出必须包含：task_id/status/changed_files/verification/open_questions/risks/next_actions；
3) 信息不足时写 UNKNOWN，并把问题放入 open_questions；
4) 任何最终资产必须落盘为结构化文件并可被脚本校验；
5) 若验证失败，先修复再提交，不要只给建议。
```

---

## 11. 本计划的执行结论

在当前基线下（2026-03-22），项目并不缺“创意”，而是缺“联网MVP与协作门禁”。  
按本计划执行，预计 **4-6周** 可达成“可联机、可回放、可持续扩展”的第一阶段目标，并可让 Claude/CodeX/国产模型在同一协议下稳定协作。


