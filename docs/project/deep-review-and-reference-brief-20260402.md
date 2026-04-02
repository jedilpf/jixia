# 稷下项目深盘与外部参考简报（2026-04-02）

## 0. 结论先行

基于当前本地实测与代码盘点，项目下一阶段应优先做两件事：

1. **先保证“对局必收束”**（防长局/僵局/非预期超时）。  
2. **再校准 AI 胜率到 45%-55%**（先公平，再提高“聪明感”）。

不建议当前就继续扩剧情或上新系统，否则会放大后续返工成本。

---

## 1. 当前现状（来自本地实测）

来自 `playtests/2026-04-02-session-01.md`：
- 3 局样本中，2 局完赛，1 局在 480 秒上限内未到结算页；
- 完赛局 AI 全胜（2/2），样本小但已提示存在“强度偏置”风险；
- 平均完赛时长约 4 分 28 秒（自动脚本策略下）。

这说明当前主流程已可跑通，但“收束稳定性 + 胜率平衡”还未进入可控区间。

---

## 2. 本地代码风险盘点（结构层）

### 2.1 收束上限配置存在“声明与执行分离”
- `src/battleV2/engine.ts` 中定义了 `MAX_ROUNDS = 99` 并写入 `state.maxRounds`；
- 但在 `advancePhase -> resolve` 的结束判定路径里，未看到 `round >= maxRounds` 的强制结算分支。

这意味着：理论上对局可能依赖“大势/心证归零”自然结束，缺少“硬停止阀”。

### 2.2 长局控制主要依赖自然博弈，不依赖系统兜底
- 目前核心结束条件以 `WIN_DASHI` 或 `xinZheng <= 0` 为主；
- 若双方进入低交互、低伤害或互保状态，会出现对局时间上浮。

### 2.3 质量门禁与开发门禁有分叉
- `gate:daily` 当前通过；
- 但 `typecheck` 仍有 `chapterMoru003.ts` 的类型阻塞（`emotion: "serious"`）。

这会导致“运行可用但静态质量不闭合”的长期风险。

---

## 3. 外部参考（已筛选，可直接落地）

## 3.1 核心设计方法（把“体验目标”反推到机制）
- **MDA Framework（Hunicke/LeBlanc/Zubek）**  
  核心价值：从 Mechanics → Dynamics → Aesthetics 双向迭代，强调“代码细节会级联到体验”。  
  对本项目应用：先定义“对局应在可控时间内结束 + 玩家感知公平”，再反推回合规则与AI策略。

- **GameFlow（Sweetser & Wyeth）**  
  核心价值：用清晰目标、即时反馈、挑战-技能匹配、沉浸等要素评估体验。  
  对本项目应用：把“每回合能做什么、为什么赢/输”反馈显式化，降低“看不懂下一步”。

## 3.2 平衡目标口径（公平性）
- **Riot Matchmaking 文档/开发说明**  
  口径非常明确：公平对局接近 **50% ±1%** 预期胜率。  
  对本项目应用：你现在定的 45%-55% 区间是合理工程化目标，可继续沿用。

## 3.3 对局收束机制（防僵局）
- **Blizzard Hearthstone: Fatigue 机制说明**  
  空牌库后每次抽牌递增伤害（1、2、3…），用于确保长局必然收束。  
  对本项目应用：可借鉴“递增惩罚”思路做“稷下版疲劳”或“回合压力升级”。

## 3.4 测试流程与发布纪律（工程管理）
- **Microsoft Game Dev（GDC 2025）**  
  强调 Bug Bash、稳定性优先、上线前“pencils down”冻结、服务器负载预演。  
  对本项目应用：你现在要求“不能随意篡改内容”非常正确，建议固化为冻结窗口规则。

- **Unity QA/Testing Best Practices**  
  强调测试贯穿全生命周期、手工+自动结合、回归测试与功能验收标准。  
  对本项目应用：目前 `playtests` + 自动脚本并行方向正确，应扩成固定周节奏。

- **自动化游戏测试研究（arXiv）**  
  论文显示自动化回归与覆盖率提升在游戏测试中有效。  
  对本项目应用：继续建设“脚本对战回归池”，优先覆盖收束、胜负判定、卡死。

---

## 4. 立即执行方案（按优先级）

### P0：对局收束兜底（本周必须完成）

目标：**任何局都必须在可配置上限内结束**。

建议改造：
1. 在 `battleV2` 结算阶段加入 `round >= maxRounds` 强制收束分支。  
2. 加入“僵持检测”：连续 N 回合关键指标无变化时触发“终局规则”（例如疲劳/骤死）。  
3. 对局日志明确写入“终局触发原因”（自然胜/回合上限/僵持裁决）。

验收：
- 50 局自动回归中，0 局超时；
- 所有终局都可在日志里定位原因。

### P1：AI 胜率校准（P0后立即）

目标：玩家 vs AI 的总体胜率收敛到 **45%-55%**。

建议改造：
1. 先做“参数校准”而非大改算法；  
2. 拆出 AI 配置档（激进/均衡/保守），便于 A/B；  
3. 每 20 局统计一次，按窗口调整评分权重。

验收：
- 100 局回归（固定随机种子集合）胜率在目标区间；
- 不出现某一套路长期统治。

### P2：可观测性与测试运营（并行推进）

目标：让问题可复现、可归因、可验证。

建议改造：
1. 每回合输出结构化统计（回合号、资源变化、终局距离）。  
2. 固定每周一次 Bug Bash（30-45 分钟，跨角色参与）。  
3. 建立“冻结窗口”：上线前仅修阻断问题，不再接受非必要改动。

---

## 5. 风险提醒（管理面）

- 继续扩内容（章节/新系统）会掩盖收束与平衡问题，导致后期整包返工；
- “运行通过但 typecheck 失败”的状态不能长期维持，建议尽快收敛；
- 自动脚本试玩数据必须与人工试玩交叉验证，避免误判为真实玩家体验。

---

## 6. 参考链接（可追溯）

- MDA: A Formal Approach to Game Design and Game Research  
  https://users.cs.northwestern.edu/~hunicke/MDA.pdf

- GameFlow: A Model for Evaluating Player Enjoyment in Games  
  https://www.valuesatplay.org/wp-content/uploads/2007/09/sweetser.pdf

- Riot：Matchmaking and Autofill（50%±1%公平口径）  
  https://support-leagueoflegends.riotgames.com/hc/en-us/articles/201752954-Matchmaking-and-Autofill

- Riot：/dev Matchmaking Real Talk（公平与感知偏差）  
  https://www.leagueoflegends.com/en-us/news/dev/dev-matchmaking-real-talk/

- Blizzard：Endgame Moves: Finessing Fatigue  
  https://hearthstone.blizzard.com/en-us/news/22819074/endgame-moves-finessing-fatigue

- Microsoft Game Dev（GDC 2025 发版与 Bug Bash 实践）  
  https://developer.microsoft.com/en-us/games/articles/2025/03/gdc-2025-how-to-ensure-a-successful-game-launch/

- Unity：Testing and QA tips for Unity projects  
  https://unity.com/how-to/testing-and-quality-assurance-tips-unity-projects

- Unity：Automated tests with Unity Test Framework  
  https://unity.com/how-to/automated-tests-unity-test-framework

- arXiv：On Automating Video Game Regression Testing by Planning and Learning  
  https://arxiv.org/abs/2402.12393

- arXiv：Augmenting Automated Game Testing with Deep Reinforcement Learning  
  https://arxiv.org/abs/2103.15819

- Steam（Testing Your Game on Steam / Steam Playtest deck）  
  https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/latam/TestingYourGameonSteam.pdf
