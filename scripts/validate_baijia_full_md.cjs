const fs = require('fs');
const path = require('path');

const DOC_PATH = 'C:/Users/21389/Desktop/百家争鸣_v1.2_全量卡牌数据.md';
const RUNS = 100;

const EXPECTED_GLOBAL_RULE_SNIPPETS = [
  '不使用题面',
  '先到 **8 大势** 获胜',
  '起手 **5 张**',
  '后手开局额外 **抽 1 张**',
  '每回合最多打 **2 张牌**',
  '同一张立论每回合最多被 **1 张敌方施策指定**',
  '主议胜：**+1 大势**',
  '旁议胜：获得 **1 个筹**',
  '每名玩家最多持有 **1 个筹**',
  '消耗 1 个筹可令你本回合打出的一张牌 **-1 用度**',
  '平局：该议位双方各失去 **1 根基**',
  '每位玩家每回合通过卡牌效果额外获得的大势，最多 **+1**',
];

const EXPECTED_FACTION_COUNTS = {
  礼心殿: 8,
  游策阁: 8,
  名相府: 8,
  万农坊: 8,
  通用: 12,
};

function parseMarkdownTableRows(lines) {
  const rows = lines.filter((line) => line.trim().startsWith('|'));
  if (rows.length < 3) return [];
  const dataRows = rows.slice(2);
  return dataRows.map((row) => row.trim());
}

function rowToCard(row) {
  const cols = row
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());

  if (cols.length !== 7) {
    return { parseError: `列数不是 7，实际为 ${cols.length}：${row}` };
  }

  const [faction, name, type, cost, attack, hp, effect] = cols;
  return { faction, name, type, cost, attack, hp, effect, raw: row };
}

function validateCardSchema(card, errors) {
  const hasEmpty = [card.faction, card.name, card.type, card.cost, card.attack, card.hp, card.effect]
    .some((v) => v === '');
  if (hasEmpty) {
    errors.push(`存在空字段：${card.raw}`);
    return;
  }

  if (!['立论', '施策'].includes(card.type)) {
    errors.push(`牌类非法（应为立论/施策）：${card.name} -> ${card.type}`);
  }

  const costNum = Number(card.cost);
  if (!Number.isInteger(costNum) || costNum < 0) {
    errors.push(`用度非法：${card.name} -> ${card.cost}`);
  }

  if (card.type === '立论') {
    const bf = Number(card.attack);
    const gj = Number(card.hp);
    if (!Number.isInteger(bf) || bf < 0) {
      errors.push(`立论辩锋非法：${card.name} -> ${card.attack}`);
    }
    if (!Number.isInteger(gj) || gj < 1) {
      errors.push(`立论根基非法：${card.name} -> ${card.hp}`);
    }
  }

  if (card.type === '施策') {
    if (!(card.attack === '-' && card.hp === '-')) {
      errors.push(`施策的辩锋/根基应为“-”：${card.name} -> ${card.attack}/${card.hp}`);
    }
  }
}

function runOnePass() {
  const content = fs.readFileSync(DOC_PATH, 'utf8');
  const lines = content.split(/\r?\n/);

  const errors = [];
  const warnings = [];

  for (const snippet of EXPECTED_GLOBAL_RULE_SNIPPETS) {
    if (!content.includes(snippet)) {
      errors.push(`缺少全局规则：${snippet}`);
    }
  }

  const tableRows = parseMarkdownTableRows(lines);
  if (!tableRows.length) {
    errors.push('未解析到卡牌表格数据行');
    return { errors, warnings, stats: null };
  }

  const parsedCards = tableRows.map(rowToCard);
  for (const row of parsedCards) {
    if (row.parseError) {
      errors.push(row.parseError);
      continue;
    }
    validateCardSchema(row, errors);
  }

  const cards = parsedCards.filter((c) => !c.parseError);

  const nameSet = new Set();
  for (const card of cards) {
    if (nameSet.has(card.name)) errors.push(`牌名重复：${card.name}`);
    nameSet.add(card.name);
  }

  const factionCounts = {};
  for (const card of cards) {
    factionCounts[card.faction] = (factionCounts[card.faction] || 0) + 1;
  }

  const totalExpected = Object.values(EXPECTED_FACTION_COUNTS).reduce((a, b) => a + b, 0);
  if (cards.length !== totalExpected) {
    errors.push(`总牌数不符：实际 ${cards.length}，预期 ${totalExpected}`);
  }

  for (const [faction, expected] of Object.entries(EXPECTED_FACTION_COUNTS)) {
    const actual = factionCounts[faction] || 0;
    if (actual !== expected) {
      errors.push(`阵营牌数不符：${faction} 实际 ${actual}，预期 ${expected}`);
    }
  }

  const effectsText = cards.map((c) => c.effect).join('\n');
  const globalRuleText = lines
    .slice(
      lines.findIndex((l) => l.includes('## 全局规则')),
      lines.findIndex((l) => l.includes('## 说明'))
    )
    .join('\n');

  const termChecks = [
    { term: '文本失效', hint: '建议补充“文本失效”具体作用域（是否禁用持续/触发/数值修正）' },
    { term: '易席', hint: '效果里有“易席”，规则区主要写“移动”，建议明确二者是否等价' },
    { term: '对位敌方立论', hint: '建议定义当对位为空时如何结算（失效/改选目标）' },
    { term: '胜负局面', hint: '建议定义“改变胜负局面”的判定时点与比较基准' },
  ];

  for (const check of termChecks) {
    if (effectsText.includes(check.term) && !globalRuleText.includes(check.term)) {
      warnings.push(check.hint);
    }
  }

  if (!content.includes('| 阵营 | 牌名 | 牌类 | 用度 | 辩锋 | 根基 | 效果 |')) {
    warnings.push('建议保持表头字段固定，避免后续导入脚本失配');
  }

  const stats = {
    totalCards: cards.length,
    byFaction: factionCounts,
    typeCount: {
      立论: cards.filter((c) => c.type === '立论').length,
      施策: cards.filter((c) => c.type === '施策').length,
    },
  };

  return { errors, warnings, stats };
}

function main() {
  if (!fs.existsSync(DOC_PATH)) {
    console.error(`文档不存在：${DOC_PATH}`);
    process.exit(1);
  }

  const runResults = [];
  for (let i = 0; i < RUNS; i += 1) {
    runResults.push(runOnePass());
  }

  const errorCounts = runResults.map((r) => r.errors.length);
  const warningCounts = runResults.map((r) => r.warnings.length);
  const stableErrors = errorCounts.every((n) => n === errorCounts[0]);
  const stableWarnings = warningCounts.every((n) => n === warningCounts[0]);

  const base = runResults[0];
  const report = {
    docPath: DOC_PATH,
    runs: RUNS,
    stable: {
      errors: stableErrors,
      warnings: stableWarnings,
    },
    perRun: {
      errorCount: errorCounts[0],
      warningCount: warningCounts[0],
    },
    stats: base.stats,
    errors: base.errors,
    warnings: base.warnings,
  };

  const outputPath = path.join(__dirname, 'baijia-md-100run-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`100轮校验完成，报告已生成：${outputPath}`);
  console.log(`每轮错误 ${report.perRun.errorCount}，每轮警告 ${report.perRun.warningCount}`);
}

main();
