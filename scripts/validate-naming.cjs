const fs = require('fs');
const path = require('path');

const RULES = {
  components: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.tsx$/,
    description: 'React组件文件应使用PascalCase.tsx格式',
  },
  utils: {
    pattern: /^[a-z][a-z0-9-]*\.ts$/,
    description: '工具文件应使用kebab-case.ts格式',
  },
  types: {
    pattern: /^[a-z][a-z0-9-]*\.ts$/,
    description: '类型文件应使用kebab-case.ts格式',
  },
  styles: {
    pattern: /^[a-z][a-z0-9-]*\.(css|scss|module\.css)$/,
    description: '样式文件应使用kebab-case.css格式',
  },
  docs: {
    pattern: /^[a-z]+-[a-z]+-.+\.md$/,
    description: '文档应使用{模块}-{类型}-{主题}.md格式',
  },
  directories: {
    pattern: /^[a-z][a-z0-9-]*$/,
    description: '目录应使用kebab-case格式',
  },
};

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.next/,
  /coverage/,
];

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function validateDirectory(dir, ruleKey, violations) {
  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️ 目录不存在: ${dir}`);
    return;
  }

  const rule = RULES[ruleKey];
  if (!rule) return;

  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const itemPath = path.join(dir, item);
    
    if (shouldIgnore(itemPath)) return;

    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      if (ruleKey === 'directories' || ruleKey === 'components') {
        if (!RULES.directories.pattern.test(item)) {
          violations.push({
            type: 'directory',
            path: itemPath,
            rule: 'directories',
            expected: RULES.directories.description,
            actual: item,
          });
        }
      }
      
      if (ruleKey === 'components' || ruleKey === 'utils') {
        validateDirectory(itemPath, ruleKey, violations);
      }
    } else if (stat.isFile()) {
      if (!rule.pattern.test(item)) {
        violations.push({
          type: 'file',
          path: itemPath,
          rule: ruleKey,
          expected: rule.description,
          actual: item,
        });
      }
    }
  });
}

function validateDocs(dir, violations) {
  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️ 目录不存在: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach(item => {
    const itemPath = path.join(dir, item.name);
    
    if (shouldIgnore(itemPath)) return;

    if (item.isDirectory()) {
      validateDocs(itemPath, violations);
    } else if (item.name.endsWith('.md')) {
      if (!RULES.docs.pattern.test(item.name)) {
        violations.push({
          type: 'document',
          path: itemPath,
          rule: 'docs',
          expected: RULES.docs.description,
          actual: item.name,
        });
      }
    }
  });
}

function generateReport(violations) {
  console.log('\n' + '='.repeat(60));
  console.log('命名规范验证报告');
  console.log('='.repeat(60));
  console.log(`验证时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`违规数量: ${violations.length}`);
  console.log('='.repeat(60));

  if (violations.length === 0) {
    console.log('\n✅ 所有文件命名符合规范！\n');
    return;
  }

  const groupedViolations = {};
  violations.forEach(v => {
    if (!groupedViolations[v.rule]) {
      groupedViolations[v.rule] = [];
    }
    groupedViolations[v.rule].push(v);
  });

  console.log('\n❌ 发现以下命名违规:\n');

  Object.entries(groupedViolations).forEach(([rule, items]) => {
    console.log(`\n【${rule}】(${items.length}个违规)`);
    console.log(`  规则: ${items[0].expected}`);
    console.log('  违规文件:');
    items.forEach((item, index) => {
      console.log(`    ${index + 1}. ${item.actual}`);
      console.log(`       路径: ${item.path}`);
    });
  });

  console.log('\n' + '-'.repeat(60));
  console.log('建议修复步骤:');
  console.log('1. 查看上述违规文件列表');
  console.log('2. 参考 docs/standards/NAMING_CONVENTION_FRAMEWORK.md');
  console.log('3. 使用 docs/standards/QUICK_REFERENCE_GUIDE.md 快速参考');
  console.log('4. 重命名后重新运行此脚本验证');
  console.log('-'.repeat(60) + '\n');
}

function main() {
  console.log('\n🔍 开始验证命名规范...\n');

  const violations = [];
  const projectRoot = process.cwd();

  console.log('验证目录:');
  console.log(`  - ${path.join(projectRoot, 'src/components')}`);
  validateDirectory(path.join(projectRoot, 'src/components'), 'components', violations);

  console.log(`  - ${path.join(projectRoot, 'src/utils')}`);
  validateDirectory(path.join(projectRoot, 'src/utils'), 'utils', violations);

  console.log(`  - ${path.join(projectRoot, 'src/types')}`);
  validateDirectory(path.join(projectRoot, 'src/types'), 'types', violations);

  console.log(`  - ${path.join(projectRoot, 'docs')}`);
  validateDocs(path.join(projectRoot, 'docs'), violations);

  generateReport(violations);

  process.exit(violations.length > 0 ? 1 : 0);
}

main();
