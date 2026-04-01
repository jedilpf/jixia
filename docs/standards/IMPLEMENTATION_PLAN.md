# 命名规范实施计划 v1.0
## 《谋天下·问道百家》命名标准化执行方案

---

## 文档信息

| 属性 | 值 |
|------|-----|
| 文档ID | DOC-STANDARDS-004 |
| 版本 | 1.0.0 |
| 创建日期 | 2026-03-23 |
| 状态 | Active |

---

## 一、实施概述

### 1.1 实施目标

| 目标 | 描述 | 成功标准 |
|------|------|----------|
| **统一性** | 全项目命名风格一致 | 95%以上文件符合规范 |
| **可维护性** | 命名便于理解和修改 | 新成员上手时间减少50% |
| **自动化** | 命名检查自动化 | CI/CD集成验证 |
| **文档化** | 规范清晰可查 | 所有规范文档化 |

### 1.2 实施范围

```
实施范围清单
├── 源代码文件
│   ├── TypeScript/TSX 文件
│   ├── 样式文件 (CSS/SCSS)
│   └── 配置文件
├── 文档文件
│   ├── Markdown 文档
│   ├── JSON 数据文件
│   └── YAML 配置文件
├── 资源文件
│   ├── 图片资源
│   └── 音频资源
└── 项目配置
    ├── package.json
    ├── tsconfig.json
    └── eslint 配置
```

---

## 二、实施阶段

### Phase 1: 准备阶段（第1周）

#### 2.1.1 任务清单

| 任务 | 负责人 | 预计时间 | 产出 |
|------|--------|----------|------|
| 审查现有命名规范文档 | 技术负责人 | 2小时 | 差异分析报告 |
| 安装命名检查工具 | 开发者 | 1小时 | 工具配置完成 |
| 创建命名检查脚本 | 开发者 | 4小时 | 验证脚本 |
| 备份当前代码 | 开发者 | 0.5小时 | 备份完成 |

#### 2.1.2 工具准备

```bash
# 安装必要工具
npm install --save-dev eslint @typescript-eslint/eslint-plugin

# 配置ESLint命名规则
# 参考 NAMING_RULEBOOK.json 中的 eslint_rules 配置
```

#### 2.1.3 验证脚本创建

```javascript
// scripts/validate-naming.cjs
const fs = require('fs');
const path = require('path');

const RULES = {
  components: /^[A-Z][a-zA-Z]+\.tsx$/,
  utils: /^[a-z]+(-[a-z]+)*\.ts$/,
  types: /^[a-z]+(-[a-z]+)*\.ts$/,
  styles: /^[a-z]+(-[a-z]+)*\.(css|scss)$/,
  docs: /^[a-z]+-[a-z]+-.+\.md$/,
};

function validateDirectory(dir, ruleKey) {
  const rule = RULES[ruleKey];
  if (!rule) return [];

  const violations = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      violations.push(...validateDirectory(filePath, ruleKey));
    } else if (!rule.test(file)) {
      violations.push({
        file: filePath,
        rule: ruleKey,
        expected: rule.source,
      });
    }
  });

  return violations;
}

function main() {
  const violations = [
    ...validateDirectory('src/components', 'components'),
    ...validateDirectory('src/utils', 'utils'),
    ...validateDirectory('src/types', 'types'),
    ...validateDirectory('docs', 'docs'),
  ];

  if (violations.length > 0) {
    console.log('❌ 发现命名违规:');
    violations.forEach(v => {
      console.log(`  ${v.file} - 应符合规则: ${v.expected}`);
    });
    process.exit(1);
  } else {
    console.log('✅ 所有文件命名符合规范');
    process.exit(0);
  }
}

main();
```

---

### Phase 2: 代码重构阶段（第2-3周）

#### 2.2.1 重命名优先级

| 优先级 | 类型 | 原因 | 预计影响 |
|--------|------|------|----------|
| P0 | 公共API | 影响外部调用 | 高 |
| P1 | 核心模块 | 影响多个文件 | 中高 |
| P2 | 工具函数 | 影响部分文件 | 中 |
| P3 | 内部变量 | 影响单个文件 | 低 |
| P4 | 注释文本 | 不影响运行 | 最低 |

#### 2.2.2 重命名执行步骤

**步骤1：创建重命名映射表**

```json
// scripts/rename-mapping.json
{
  "files": [
    {
      "old": "src/components/battle/BattleBoardSync.tsx",
      "new": "src/components/battle/BattleBoardSync.tsx",
      "status": "keep"
    }
  ],
  "variables": [
    {
      "file": "src/core/gameEngine.ts",
      "old": "player_health",
      "new": "playerHealth",
      "line": 42
    }
  ],
  "functions": [
    {
      "file": "src/utils/gameLogic.ts",
      "old": "DoValidation",
      "new": "validateGameState",
      "line": 128
    }
  ]
}
```

**步骤2：执行重命名脚本**

```bash
# 执行自动重命名
node scripts/apply-rename.cjs

# 手动检查重命名结果
git diff
```

**步骤3：验证重命名**

```bash
# 运行测试
npm test

# 运行类型检查
npm run typecheck

# 运行命名验证
node scripts/validate-naming.cjs
```

#### 2.2.3 重命名检查清单

每个文件重命名后需确认：

- [ ] 文件名符合规范
- [ ] 内部变量名符合规范
- [ ] 函数名符合规范
- [ ] 类型定义符合规范
- [ ] 导入路径已更新
- [ ] 测试文件已更新
- [ ] 文档引用已更新

---

### Phase 3: 文档整理阶段（第4周）

#### 2.3.1 文档迁移计划

| 原位置 | 新位置 | 文档数量 | 状态 |
|--------|--------|----------|------|
| docs/ 根目录 | docs/standards/ | 2 | 待迁移 |
| docs/archive/ | docs/archive/old-versions/ | 5 | 待整理 |
| docs/*.md | 按模块分类 | 10+ | 待重命名 |

#### 2.3.2 文档重命名执行

```bash
# 批量重命名脚本
# scripts/rename-docs.sh

#!/bin/bash

# 重命名文档
mv "docs/任务说明文档_本地双人对战功能.md" "docs/project/project-req-本地双人-v1.md"
mv "docs/任务说明文档_本地双人对战功能_v2.md" "docs/project/project-req-本地双人-v2.md"

# 移动到正确目录
mv docs/prompt-*.md docs/project/plan/

# 更新索引
node scripts/update-doc-index.cjs
```

#### 2.3.3 文档索引更新

更新 `docs/index.md`：

```markdown
# 文档索引

## 标准规范 (standards/)
- [文档组织规范](standards/DOCUMENT_ORGANIZATION_STANDARD.md)
- [命名规范框架](standards/NAMING_CONVENTION_FRAMEWORK.md)
- [命名规则书(JSON)](standards/NAMING_RULEBOOK.json)

## 战斗系统
...

## 卡牌系统
...
```

---

### Phase 4: 验证与固化阶段（第5周）

#### 2.4.1 验证方法

**自动化验证**

```yaml
# .github/workflows/naming-check.yml
name: Naming Convention Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Validate naming conventions
        run: node scripts/validate-naming.cjs
        
      - name: Check document naming
        run: node scripts/validate-doc-naming.cjs
```

**人工审查清单**

| 审查项 | 审查人 | 完成状态 |
|--------|--------|----------|
| 核心模块命名一致性 | 技术负责人 | [ ] |
| 公共API命名可读性 | 产品经理 | [ ] |
| 文档命名规范性 | 文档管理员 | [ ] |
| 错误消息友好性 | 测试人员 | [ ] |

#### 2.4.2 验收标准

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 文件命名合规率 | ≥95% | 自动化脚本统计 |
| 变量命名合规率 | ≥98% | ESLint报告 |
| 文档命名合规率 | ≥90% | 自动化脚本统计 |
| 测试通过率 | 100% | CI/CD报告 |

---

## 三、资源需求

### 3.1 人力资源

| 角色 | 投入时间 | 主要职责 |
|------|----------|----------|
| 技术负责人 | 20小时 | 规划、审查、决策 |
| 开发者A | 40小时 | 代码重构、脚本开发 |
| 开发者B | 30小时 | 文档整理、测试验证 |
| 测试人员 | 10小时 | 验证测试 |

### 3.2 工具资源

| 工具 | 用途 | 状态 |
|------|------|------|
| ESLint | 代码命名检查 | 已配置 |
| 自定义脚本 | 文件命名验证 | 待开发 |
| GitHub Actions | CI/CD集成 | 待配置 |
| VS Code插件 | 实时提示 | 可选 |

---

## 四、风险管理

### 4.1 风险识别

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 重命名导致功能异常 | 中 | 高 | 充分测试，保留回滚点 |
| 团队成员不熟悉规范 | 中 | 中 | 培训，提供快速参考 |
| 命名规范过于复杂 | 低 | 中 | 简化规范，提供示例 |
| 工具误报 | 低 | 低 | 调整规则，添加例外 |

### 4.2 回滚计划

```bash
# 创建回滚点
git tag naming-refactor-backup

# 如需回滚
git reset --hard naming-refactor-backup
```

---

## 五、培训计划

### 5.1 培训内容

| 培训主题 | 时长 | 对象 | 形式 |
|----------|------|------|------|
| 命名规范总览 | 30分钟 | 全体 | 会议 |
| 代码命名实践 | 1小时 | 开发者 | 工作坊 |
| 文档命名规范 | 30分钟 | 全体 | 会议 |
| 工具使用培训 | 30分钟 | 开发者 | 实操 |

### 5.2 培训材料

- [ ] 命名规范PPT
- [ ] 快速参考卡片
- [ ] 常见错误示例
- [ ] 实践练习题

---

## 六、持续改进

### 6.1 定期审查

| 审查周期 | 审查内容 | 负责人 |
|----------|----------|--------|
| 每周 | 新增文件命名合规性 | 开发者 |
| 每月 | 规范执行情况统计 | 技术负责人 |
| 每季度 | 规范修订评审 | 团队 |

### 6.2 反馈机制

```markdown
## 命名规范反馈表

**反馈类型**: [ ] 规则建议 [ ] 规则问题 [ ] 工具问题

**具体描述**:


**建议方案**:


**提交人**: 
**日期**: 
```

---

## 七、验收清单

### 7.1 最终验收

- [ ] 所有源代码文件命名符合规范
- [ ] 所有文档文件命名符合规范
- [ ] ESLint命名规则配置完成
- [ ] CI/CD命名检查集成完成
- [ ] 团队培训完成
- [ ] 快速参考指南分发完成
- [ ] 文档索引更新完成

### 7.2 交付物清单

| 交付物 | 位置 | 状态 |
|--------|------|------|
| 文档组织规范 | docs/standards/DOCUMENT_ORGANIZATION_STANDARD.md | ✅ |
| 命名规范框架 | docs/standards/NAMING_CONVENTION_FRAMEWORK.md | ✅ |
| 命名规则书(JSON) | docs/standards/NAMING_RULEBOOK.json | ✅ |
| 实施计划 | docs/standards/IMPLEMENTATION_PLAN.md | ✅ |
| 快速参考指南 | docs/standards/standards-guide-quick-reference.md | 已创建 |
| 验证脚本 | scripts/validate-naming.cjs | 待创建 |

---

## 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-23 | 初始版本 | AI Assistant |
