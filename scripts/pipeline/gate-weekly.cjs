const fs = require('fs');
const path = require('path');
const {
  runNodeScript,
  ROOT,
  readUtf8,
} = require('./common.cjs');

function countOpenBlockingQuestions() {
  const content = readUtf8('open_questions.md');
  const rows = content
    .split(/\r?\n/)
    .filter((line) => /^\|\s*OQ-/.test(line));
  let count = 0;
  for (const row of rows) {
    const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
    if (cols.length < 8) {
      continue;
    }
    const priority = cols[3];
    const status = cols[6].toLowerCase();
    if (status === 'open' && (priority === 'P0' || priority === 'P1')) {
      count += 1;
    }
  }
  return count;
}

function hasPlaytestRecord() {
  const playtestsDir = path.join(ROOT, 'playtests');
  if (!fs.existsSync(playtestsDir)) {
    return false;
  }
  const files = fs.readdirSync(playtestsDir).filter((name) => name.toLowerCase().endsWith('.md'));
  const sessionFiles = files.filter((name) => name.toLowerCase() !== 'readme.md');
  return sessionFiles.length > 0;
}

function main() {
  let failed = 0;

  console.log('[gate-weekly] Running daily gate first...');
  const dailyStatus = runNodeScript('scripts/pipeline/gate-daily.cjs');
  if (dailyStatus !== 0) {
    failed += 1;
  }

  const blockingCount = countOpenBlockingQuestions();
  if (blockingCount > 3) {
    failed += 1;
    console.error(`[gate-weekly] Blocking questions exceeded: ${blockingCount} > 3`);
  } else {
    console.log(`[gate-weekly] Blocking questions OK: ${blockingCount}`);
  }

  if (!hasPlaytestRecord()) {
    console.warn('[gate-weekly] WARN: no playtest session record found under playtests/');
  } else {
    console.log('[gate-weekly] Playtest record found');
  }

  if (failed > 0) {
    console.error(`[gate-weekly] FAILED (${failed} step(s) failed)`);
    process.exit(1);
  }

  console.log('[gate-weekly] PASS');
}

main();
