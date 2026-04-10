const fs = require('fs');

const filePath = 'src/game/story/data/prolog.ts';
const content = fs.readFileSync(filePath, 'utf-8');

let fixed = content;

const replacements = [
  // 行184 - 陈述句结尾
  { from: '来此求学问道?', to: '来此求学问道。"' },

  // 行373 - 疑问句
  { from: '害了彼?', to: '害了彼？"' },

  // 行393 - 疑问句
  { from: '什么话?', to: '什么话？"' },

  // 行554 - 陈述句/感叹
  { from: '冲吾来?', to: '冲吾来！"' },

  // 行729 - 陈述句
  { from: '悔过之机?', to: '悔过之机。"' },

  // 行739 - 疑问句
  { from: '仁心?', to: '仁心？"' },

  // 行749 - 疑问句
  { from: '?质问律法本身?', to: '？质问律法本身：「' },

  // 行975 - 陈述句
  { from: '小院之中?祖父', to: '小院之中。祖父' },
];

let count = 0;
for (const { from, to } of replacements) {
  if (fixed.includes(from)) {
    fixed = fixed.replaceAll(from, to);
    count++;
    console.log(`✓ 修复: "${from}" → "${to}"`);
  }
}

fs.writeFileSync(filePath, fixed, 'utf-8');
console.log(`\n共修复 ${count} 处标点问题`);
