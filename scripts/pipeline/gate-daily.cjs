const {
  runNodeScript,
  readUtf8,
} = require('./common.cjs');

const CHECKS = [
  'scripts/pipeline/validate-structure.cjs',
  'scripts/pipeline/validate-references.cjs',
  'scripts/pipeline/validate-terminology.cjs',
  'scripts/pipeline/validate-playability.cjs',
  'scripts/pipeline/validate-complexity.cjs',
];

function validateOpenQuestions() {
  const content = readUtf8('open_questions.md');
  const lines = content.split(/\r?\n/);
  const rows = lines.filter((line) => /^\|\s*OQ-/.test(line));
  const issues = [];
  let blockingCount = 0;

  for (const row of rows) {
    const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
    if (cols.length < 8) {
      issues.push(`malformed row: ${row}`);
      continue;
    }

    const id = cols[0];
    const priority = cols[3];
    const owner = cols[4];
    const status = cols[6].toLowerCase();

    if (status === 'open' && (priority === 'P0' || priority === 'P1')) {
      blockingCount += 1;
    }

    if (status === 'open' && (owner === 'TBD' || owner === '')) {
      issues.push(`${id}: open item has no assignee`);
    }
  }

  if (blockingCount > 3) {
    issues.push(`blocking open questions exceeded: ${blockingCount} > 3`);
  }

  return issues;
}

function main() {
  let failed = 0;

  console.log('[gate-daily] Running automated checks...');
  for (const check of CHECKS) {
    const status = runNodeScript(check);
    if (status !== 0) {
      failed += 1;
    }
  }

  console.log('[gate-daily] Running open_questions check...');
  const questionIssues = validateOpenQuestions();
  if (questionIssues.length > 0) {
    failed += 1;
    console.error(`[gate-daily] open_questions FAILED with ${questionIssues.length} issue(s):`);
    for (const issue of questionIssues) {
      console.error(`- ${issue}`);
    }
  } else {
    console.log('[gate-daily] open_questions PASS');
  }

  if (failed > 0) {
    console.error(`[gate-daily] FAILED (${failed} step(s) failed)`);
    process.exit(1);
  }

  console.log('[gate-daily] PASS');
}

main();
