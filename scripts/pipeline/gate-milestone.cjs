const fs = require('fs');
const path = require('path');
const {
  runNodeScript,
  ROOT,
} = require('./common.cjs');

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function main() {
  let failed = 0;

  console.log('[gate-milestone] Running weekly gate first...');
  const weeklyStatus = runNodeScript('scripts/pipeline/gate-weekly.cjs');
  if (weeklyStatus !== 0) {
    failed += 1;
  }

  if (!fileExists('canon/anchors.yaml')) {
    failed += 1;
    console.error('[gate-milestone] Missing canon/anchors.yaml');
  }

  if (!fileExists('scope/bs01.yaml')) {
    failed += 1;
    console.error('[gate-milestone] Missing scope/bs01.yaml');
  }

  if (!fileExists('mechanics/index.yaml')) {
    failed += 1;
    console.error('[gate-milestone] Missing mechanics/index.yaml');
  }

  if (!fileExists('backlog.md')) {
    failed += 1;
    console.error('[gate-milestone] Missing backlog.md');
  }

  if (!fileExists('open_questions.md')) {
    failed += 1;
    console.error('[gate-milestone] Missing open_questions.md');
  }

  if (!fileExists('CHANGELOG.md')) {
    console.warn('[gate-milestone] WARN: CHANGELOG.md not found yet');
  } else {
    console.log('[gate-milestone] CHANGELOG.md found');
  }

  if (failed > 0) {
    console.error(`[gate-milestone] FAILED (${failed} blocking issue(s))`);
    process.exit(1);
  }

  console.log('[gate-milestone] PASS');
}

main();
