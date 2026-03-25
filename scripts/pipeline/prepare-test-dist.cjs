const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, '.tmp', 'test-dist');
const outSrcDir = path.join(outDir, 'src');
const outTestsDir = path.join(outDir, 'tests');
const outPkg = path.join(outDir, 'package.json');
const testsIndex = path.join(outTestsDir, 'index.js');

function walkJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full);
    }
  }

  return files;
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function rewriteAliasRequires(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');

  const rewritten = original.replace(/require\(["']@\/([^"']+)["']\)/g, (_, importPath) => {
    const target = importPath === 'utils/assets'
      ? path.join(outTestsDir, 'stubs', 'assets')
      : path.join(outSrcDir, importPath);
    const rel = path.relative(path.dirname(filePath), target);
    const normalized = toPosix(rel.startsWith('.') ? rel : `./${rel}`);
    return `require("${normalized}")`;
  });

  if (rewritten !== original) {
    fs.writeFileSync(filePath, rewritten, 'utf8');
    return true;
  }

  return false;
}

function buildTestsIndex() {
  const testFiles = walkJsFiles(outTestsDir)
    .filter((file) => file !== testsIndex)
    .filter((file) => file.endsWith('.test.js'))
    .sort((a, b) => a.localeCompare(b));

  const lines = testFiles.map((file) => {
    const rel = path.relative(path.dirname(testsIndex), file);
    const normalized = toPosix(rel.startsWith('.') ? rel : `./${rel}`);
    return `require("${normalized}");`;
  });

  fs.writeFileSync(testsIndex, `${lines.join('\n')}\n`, 'utf8');
  return testFiles.length;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPkg, `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`, 'utf8');

const jsFiles = [...walkJsFiles(outSrcDir), ...walkJsFiles(outTestsDir)];
const rewrittenCount = jsFiles.reduce((count, file) => count + (rewriteAliasRequires(file) ? 1 : 0), 0);
const testsCount = buildTestsIndex();

console.log(`[prepare-test-dist] Wrote ${path.relative(root, outPkg)}`);
console.log(`[prepare-test-dist] Rewrote alias requires in ${rewrittenCount} file(s)`);
console.log(`[prepare-test-dist] Indexed ${testsCount} compiled test file(s) -> ${path.relative(root, testsIndex)}`);
