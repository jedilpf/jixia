const fs = require('fs');

const filePath = 'src/data/showcaseCards.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// 补充替换规则
const replacements = [
  // 修复遗漏的 + 号
  { from: /【怀疑\+1/g, to: '【怀疑加壹' },
  { from: /【怀疑\+2/g, to: '【怀疑加贰' },
  { from: /【学识\+1/g, to: '【学识加壹' },
  { from: /【学识\+2/g, to: '【学识加贰' },
  { from: /【清明\+1/g, to: '【清明加壹' },
  { from: /【失序\+1/g, to: '【失序加壹' },
  { from: /【清静\+1/g, to: '【清静加壹' },
  
  // 修复遗漏的数字
  { from: /1点/g, to: '壹点' },
  { from: /2点/g, to: '贰点' },
  { from: /3点/g, to: '叁点' },
  { from: /4点/g, to: '肆点' },
  { from: /5点/g, to: '伍点' },
  { from: /6点/g, to: '陆点' },
  { from: /7点/g, to: '柒点' },
  { from: /8点/g, to: '捌点' },
  { from: /9点/g, to: '玖点' },
  { from: /10点/g, to: '拾点' },
  
  // 修复其他遗漏
  { from: /第1/g, to: '第壹' },
  { from: /第2/g, to: '第贰' },
  { from: /第3/g, to: '第叁' },
  { from: /1张/g, to: '壹张' },
  { from: /2张/g, to: '贰张' },
  { from: /3张/g, to: '叁张' },
  { from: /4张/g, to: '肆张' },
  { from: /1次/g, to: '壹次' },
  { from: /2次/g, to: '贰次' },
  { from: /3次/g, to: '叁次' },
  { from: /1回合/g, to: '壹回合' },
  { from: /2回合/g, to: '贰回合' },
  { from: /3回合/g, to: '叁回合' },
  
  // 修复 [] 为 【】
  { from: /\[怀疑\]/g, to: '【怀疑】' },
  { from: /\[沉默\]/g, to: '【沉默】' },
  { from: /\[失序\]/g, to: '【失序】' },
  { from: /\[清明\]/g, to: '【清明】' },
  { from: /\[学识\]/g, to: '【学识】' },
  { from: /\[护持\]/g, to: '【护持】' },
  { from: /\[壁垒\]/g, to: '【壁垒】' },
  { from: /\[轻盈\]/g, to: '【轻盈】' },
  { from: /\[清静\]/g, to: '【清静】' },
  { from: /\[幻象\]/g, to: '【幻象】' },
];

let count = 0;
for (const { from, to } of replacements) {
  if (content.match(from)) {
    const matches = content.match(new RegExp(from, 'g'));
    content = content.replace(from, to);
    count += matches ? matches.length : 0;
    console.log(`✓ 替换: "${from}" → "${to}" (${matches ? matches.length : 0}处)`);
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\n共完成 ${count} 处替换`);
