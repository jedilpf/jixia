const fs = require('fs');
const path = require('path');

const RULES = {
  components: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.tsx$/,
    description: 'React component files should use PascalCase.tsx',
  },
  utils: {
    pattern: /^[a-z][a-z0-9-]*\.ts$/,
    description: 'Utility files should use kebab-case.ts',
  },
  types: {
    pattern: /^[a-z][a-z0-9-]*\.ts$/,
    description: 'Type files should use kebab-case.ts',
  },
  docs: {
    pattern: /^[a-z]+-[a-z]+-.+\.md$/,
    description: 'Docs should use {module}-{type}-{topic}.md',
  },
  directories: {
    pattern: /^[a-z][a-z0-9-]*$/,
    description: 'Directories should use kebab-case',
  },
};

const IGNORE_PATTERNS = [
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)\.git(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)build(\/|$)/,
  /(^|\/)\.next(\/|$)/,
  /(^|\/)coverage(\/|$)/,
];

function normalizePath(input) {
  return String(input || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function shouldIgnore(filePath) {
  const normalized = normalizePath(filePath);
  return IGNORE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function addViolation(violations, ruleKey, absolutePath, actualName) {
  violations.push({
    rule: ruleKey,
    path: absolutePath,
    actual: actualName,
    expected: RULES[ruleKey].description,
  });
}

function validateDirectory(dir, ruleKey, violations) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const rule = RULES[ruleKey];
  if (!rule) return;

  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (shouldIgnore(absPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      if ((ruleKey === 'components' || ruleKey === 'utils') && !RULES.directories.pattern.test(entry.name)) {
        addViolation(violations, 'directories', absPath, entry.name);
      }
      if (ruleKey === 'components' || ruleKey === 'utils') {
        validateDirectory(absPath, ruleKey, violations);
      }
      continue;
    }

    if (entry.isFile() && !rule.pattern.test(entry.name)) {
      addViolation(violations, ruleKey, absPath, entry.name);
    }
  }
}

function validateDocs(dir, violations) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (shouldIgnore(absPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      validateDocs(absPath, violations);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md') && !RULES.docs.pattern.test(entry.name)) {
      addViolation(violations, 'docs', absPath, entry.name);
    }
  }
}

function readFilesFromFileList(fileListPath) {
  if (!fileListPath) return [];
  if (!fs.existsSync(fileListPath)) return [];
  const raw = fs.readFileSync(fileListPath, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((line) => normalizePath(line))
    .filter(Boolean);
}

function readFilesFromInline(filesArg) {
  if (!filesArg) return [];
  return String(filesArg)
    .split(',')
    .map((item) => normalizePath(item))
    .filter(Boolean);
}

function validateChangedFiles(projectRoot, changedFiles, violations) {
  const relevant = [];

  for (const rel of changedFiles) {
    const normalized = normalizePath(rel);
    if (shouldIgnore(normalized)) continue;

    const absPath = path.resolve(projectRoot, normalized);
    if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) continue;

    const baseName = path.basename(normalized);

    if (normalized.startsWith('src/components/')) {
      relevant.push(normalized);
      if (!RULES.components.pattern.test(baseName)) {
        addViolation(violations, 'components', absPath, baseName);
      }
      continue;
    }

    if (normalized.startsWith('src/utils/')) {
      relevant.push(normalized);
      if (!RULES.utils.pattern.test(baseName)) {
        addViolation(violations, 'utils', absPath, baseName);
      }
      continue;
    }

    if (normalized.startsWith('src/types/')) {
      relevant.push(normalized);
      if (!RULES.types.pattern.test(baseName)) {
        addViolation(violations, 'types', absPath, baseName);
      }
      continue;
    }

    if (normalized.startsWith('docs/') && baseName.toLowerCase().endsWith('.md')) {
      relevant.push(normalized);
      if (!RULES.docs.pattern.test(baseName)) {
        addViolation(violations, 'docs', absPath, baseName);
      }
    }
  }

  return relevant;
}

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function printReport(violations, modeLabel, relevantCount) {
  console.log('\n============================================================');
  console.log('Naming Convention Validation Report');
  console.log('============================================================');
  console.log(`Mode: ${modeLabel}`);
  if (typeof relevantCount === 'number') {
    console.log(`Relevant files: ${relevantCount}`);
  }
  console.log(`Violations: ${violations.length}`);
  console.log('============================================================');

  if (violations.length === 0) {
    console.log('\nPASS: no naming violations.\n');
    return;
  }

  const grouped = new Map();
  for (const violation of violations) {
    if (!grouped.has(violation.rule)) {
      grouped.set(violation.rule, []);
    }
    grouped.get(violation.rule).push(violation);
  }

  console.log('\nFound naming violations:\n');
  for (const [rule, items] of grouped.entries()) {
    console.log(`[${rule}] (${items.length})`);
    console.log(`  Rule: ${items[0].expected}`);
    for (const item of items) {
      console.log(`  - ${item.actual}`);
      console.log(`    ${item.path}`);
    }
    console.log('');
  }
}

function runFullScan(projectRoot) {
  const violations = [];
  validateDirectory(path.join(projectRoot, 'src/components'), 'components', violations);
  validateDirectory(path.join(projectRoot, 'src/utils'), 'utils', violations);
  validateDirectory(path.join(projectRoot, 'src/types'), 'types', violations);
  validateDocs(path.join(projectRoot, 'docs'), violations);
  printReport(violations, 'full', null);
  return violations.length === 0 ? 0 : 1;
}

function runChangedScan(projectRoot, changedFiles) {
  const violations = [];
  const relevant = validateChangedFiles(projectRoot, changedFiles, violations);

  if (relevant.length === 0) {
    console.log('\nNaming check: no relevant changed files, skip.\n');
    return 0;
  }

  printReport(violations, 'changed-only', relevant.length);
  return violations.length === 0 ? 0 : 1;
}

function main() {
  const projectRoot = process.cwd();

  const filesFileArg = getArgValue('--files-file');
  const filesArg = getArgValue('--files');

  const changedFromFile = readFilesFromFileList(filesFileArg);
  const changedFromInline = readFilesFromInline(filesArg);
  const changedFiles = [...new Set([...changedFromFile, ...changedFromInline])];

  const exitCode = changedFiles.length > 0
    ? runChangedScan(projectRoot, changedFiles)
    : runFullScan(projectRoot);

  process.exit(exitCode);
}

main();

