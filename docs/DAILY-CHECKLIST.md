# 日循环核心清单

**目的**：用机械化清单防止乱改、遗漏和低效。每天只需15分钟，保证进度可控。

---

## 开始前（8分钟）— 每天08:00之前做

### ✅ 检查清单

- [ ] **打开这两个文件**（按顺序）
  1. `docs/current-priority.md` — 确认「今天要做什么」
  2. `docs/project-status.md` — 看一遍现在的状态

- [ ] **心理建设**
  - 今天只做「P1」中的一件事（不要同时推进多条线）
  - 如果有新发现的bug，先记到 `open_questions.md`，不要现在改

- [ ] **验证本地状态**
  ```bash
  git status
  npm run typecheck
  npm run validate:structure
  ```
  - [ ] 没有意外的unstaged changes
  - [ ] typecheck通过
  - [ ] structure validate通过

- [ ] **拉取远程**（可选，只在多人协作时）
  ```bash
  git fetch origin
  ```

- [ ] **明确目标**
  在便签或笔记上写一句话：
  ```
  例如：「今天只做：改进AI决策中的威胁评估逻辑」
  ```

---

## 工作中（无固定时间）— 全天遵守

### 🚫 禁止清单

在改代码前，检查否则不动：

- [ ] 这个改动是否在「P1目标」范围内？
  - 如果否，记在 `open_questions.md` 里，继续做P1

- [ ] 修改的文件是否在 `docs/data-contract.json` 允许范围内？
  - 如果改了data contract本身，立刻停，问user

- [ ] 这个改动会不会影响其他我们没想到的系统？
  - 如果是，检查一遍data-contract中的依赖关系

### ✅ 做事规范

- [ ] 每改完一个小功能，立刻跑一遍：
  ```bash
  npm run typecheck
  npm run lint
  ```

- [ ] 如果改了UI，在浏览器里快速看一眼有没有明显bug

- [ ] 每个commit的message简洁准确：
  ```bash
  git commit -m "feat: AI威胁评估函数 - 考虑card.power和opponent.health"
  ```

- [ ] 一天内如果改了多件"几乎独立"的事，用：
  ```bash
  git commit --only -- <file1> <file2>
  ```
  保持commit的focus

---

## 结束前（10分钟）— 每天21:00-22:00做

### 📝 记录清单

- [ ] **更新day-end三件事**

打开 `docs/development/CHANGELOG.md`，添加今天的条目：

```markdown
## 2026-03-29

### ✅ 今日完成
- AI识别对手威胁：新增 evaluateCardThreat() 函数
  - 文件：src/battleV2/engine.ts
  - 测试：手工验证AI在高伤害对手时会选防守卡
  
### ⏳ 进行中
- AI防守得分计算（占任务40%，明天继续）

### 🚨 遇到的问题
- 没有（或填写具体问题）
```

- [ ] **更新 docs/project-status.md**

在「🔄 进行中」部分，更新P1的进度：
```markdown
- **智能AI对手** (进度 40% → 45%)
  - ✅ 威胁评估函数完成
  - ⏳ 防守得分计算进行中
  - 下次预计完成总体评估逻辑
```

- [ ] **git提交和同步**

```bash
# 如果今天有代码改动
git add .
git commit -m "feat: [日期] AI改进第X天 - [1-2句摘要]"

# 同步到dev（不是main！）
git push origin dev
```

- [ ] **确认明天的起点**

在笔记里记一句话（给明天的自己）：
```
例如：「明天继续AI防守部分，从evaluateDefenseNeeds()这个新函数开始」
```

---

## 每周检查（周日晚）— 30分钟

- [ ] 看一遍 CHANGELOG.md，写周总结
- [ ] 检查 current-priority.md，P1完成了多少百分比？
- [ ] 如有新的阻塞或机会，更新 open_questions.md
- [ ] 确认 P2 和 P3 的时间表还realistic吗？

---

## 模板说明

### 为什么这么细？

- 独立开发最怕「改着改着忘了今天的目标」
- 8+10分钟看似浪费，其实能省掉「返工」和「无方向改动」的时间
- 写清楚tomorrow的起点，减少context switch的损耗

### 为什么禁止清单在工作中？

- 防止「顺手改一个小UI bug」导致偏离主线2小时
- 保证每一个改动都对当前priority有直接帮助

### 可以改这个清单吗？

可以。但改之前问自己：「这个改动是为了克服真实的低效，还是为了追求形式上的完美？」

如果是前者，改后记录到 `docs/` 里，让后续的自己也能受益。

---

## 快速链接

- 当前优先级：[docs/current-priority.md](../docs/current-priority.md)
- 项目状态：[docs/project-status.md](../docs/project-status.md)
- 数据契约：[docs/data-contract.json](../docs/data-contract.json)
- 未解决问题：[open_questions.md](../open_questions.md)
- 开发日志：[docs/development/CHANGELOG.md](../docs/development/CHANGELOG.md)
