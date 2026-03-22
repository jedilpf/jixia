const { execSync } = require('child_process');
const { loadTask, validateTask, getArg, normalizePath } = require('./task-utils.cjs');

function unique(list) {
  return Array.from(new Set(list));
}

function readLines(command) {
  const raw = execSync(command, { encoding: 'utf8' });
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getChangedPaths(options) {
  if (options.stagedOnly) {
    return unique(readLines('git diff --name-only --cached').map(normalizePath));
  }

  const tracked = readLines('git diff --name-only').map(normalizePath);
  const staged = readLines('git diff --name-only --cached').map(normalizePath);
  const untracked = readLines('git ls-files --others --exclude-standard').map(normalizePath);
  return unique([...tracked, ...staged, ...untracked]);
}

function isAllowed(filePath, prefixes) {
  for (const prefix of prefixes) {
    const normalizedPrefix = normalizePath(prefix).replace(/\/+$/, '');
    if (filePath === normalizedPrefix || filePath.startsWith(`${normalizedPrefix}/`)) {
      return true;
    }
  }
  return false;
}

function main() {
  const taskArg = getArg('--task');
  const stagedOnly = process.argv.includes('--staged');
  if (!taskArg) {
    console.error('[enforce-task-scope] missing required argument: --task <path>');
    process.exit(1);
  }

  let loaded = null;
  try {
    loaded = loadTask(taskArg);
  } catch (error) {
    console.error(`[enforce-task-scope] ${error.message || error}`);
    process.exit(1);
  }

  const taskErrors = validateTask(loaded.data);
  if (taskErrors.length > 0) {
    console.error('[enforce-task-scope] task invalid, run validate-ai-task first');
    process.exit(1);
  }

  const allowList = [
    ...loaded.data.allowed_write_paths,
    loaded.taskRelPath,
  ].map(normalizePath);

  const changedPaths = getChangedPaths({ stagedOnly });
  if (changedPaths.length === 0) {
    console.error('[enforce-task-scope] no changed files found in selected scope');
    if (stagedOnly) {
      console.error('hint: stage your task-related files first, then rerun');
    }
    process.exit(1);
  }
  const violations = changedPaths.filter((filePath) => !isAllowed(filePath, allowList));

  if (violations.length > 0) {
    console.error(`[enforce-task-scope] FAILED: ${violations.length} changed path(s) outside task scope`);
    console.error('Allowed prefixes:');
    for (const prefix of allowList) {
      console.error(`- ${prefix}`);
    }
    console.error('Violations:');
    for (const filePath of violations) {
      console.error(`- ${filePath}`);
    }
    process.exit(1);
  }

  console.log(`[enforce-task-scope] PASS (${changedPaths.length} changed file(s) checked, stagedOnly=${stagedOnly})`);
}

main();
