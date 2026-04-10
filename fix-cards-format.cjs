const fs = require('fs');

const filePath = 'src/data/showcaseCards.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. 统一关键词格式：将 [] 改为 【】
// 但要注意不要修改代码中的数组语法

// 2. 统一数值表述格式
// "造成X点伤害" -> "造成X点伤害" (保持不变)
// "攻击+1" -> "攻击+1" (保持不变)
// 统一使用 "X点" 格式

// 3. 古风表述优化
const replacements = [
  // 统一关键词格式
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
  
  // 古风表述优化
  { from: /抽1/g, to: '抽壹' },
  { from: /抽2/g, to: '抽贰' },
  { from: /抽3/g, to: '抽叁' },
  { from: /抽4/g, to: '抽肆' },
  { from: /抽5/g, to: '抽伍' },
  { from: /回复1点/g, to: '回复壹点' },
  { from: /回复2点/g, to: '回复贰点' },
  { from: /回复3点/g, to: '回复叁点' },
  { from: /回复4点/g, to: '回复肆点' },
  { from: /回复5点/g, to: '回复伍点' },
  { from: /回复6点/g, to: '回复陆点' },
  { from: /回复7点/g, to: '回复柒点' },
  { from: /回复8点/g, to: '回复捌点' },
  { from: /回复9点/g, to: '回复玖点' },
  { from: /回复10点/g, to: '回复拾点' },
  { from: /造成1点/g, to: '造成壹点' },
  { from: /造成2点/g, to: '造成贰点' },
  { from: /造成3点/g, to: '造成叁点' },
  { from: /造成4点/g, to: '造成肆点' },
  { from: /造成5点/g, to: '造成伍点' },
  { from: /造成6点/g, to: '造成陆点' },
  { from: /费用-1/g, to: '费用减壹' },
  { from: /费用\+1/g, to: '费用加壹' },
  { from: /费用\+2/g, to: '费用加贰' },
  { from: /攻击\+1/g, to: '攻击加壹' },
  { from: /攻击\+2/g, to: '攻击加贰' },
  { from: /伤害-1/g, to: '伤害减壹' },
  { from: /伤害-2/g, to: '伤害减贰' },
  { from: /伤害-3/g, to: '伤害减叁' },
  { from: /伤害\+1/g, to: '伤害加壹' },
  { from: /伤害\+2/g, to: '伤害加贰' },
  { from: /伤害\+3/g, to: '伤害加叁' },
  { from: /伤害\+4/g, to: '伤害加肆' },
  { from: /获得【护持1】/g, to: '获得【护持壹】' },
  { from: /获得【护持2】/g, to: '获得【护持贰】' },
  { from: /获得【护持3】/g, to: '获得【护持叁】' },
  { from: /获得【护持4】/g, to: '获得【护持肆】' },
  { from: /获得【护持5】/g, to: '获得【护持伍】' },
  { from: /获得【护持6】/g, to: '获得【护持陆】' },
  { from: /获得【怀疑\+1/g, to: '获得【怀疑加壹' },
  { from: /获得【怀疑\+2/g, to: '获得【怀疑加贰' },
  { from: /获得【学识\+1/g, to: '获得【学识加壹' },
  { from: /获得【学识\+2/g, to: '获得【学识加贰' },
  { from: /获得【清明\+1/g, to: '获得【清明加壹' },
  { from: /获得【失序\+1/g, to: '获得【失序加壹' },
  { from: /【怀疑\+1】/g, to: '【怀疑加壹】' },
  { from: /【怀疑\+2】/g, to: '【怀疑加贰】' },
  { from: /【学识\+1】/g, to: '【学识加壹】' },
  { from: /【学识\+2】/g, to: '【学识加贰】' },
  { from: /【清明\+1】/g, to: '【清明加壹】' },
  { from: /【失序\+1】/g, to: '【失序加壹】' },
  { from: /【清静\+1】/g, to: '【清静加壹】' },
  { from: /1张/g, to: '壹张' },
  { from: /2张/g, to: '贰张' },
  { from: /3张/g, to: '叁张' },
  { from: /4张/g, to: '肆张' },
  { from: /1回合/g, to: '壹回合' },
  { from: /2回合/g, to: '贰回合' },
  { from: /3回合/g, to: '叁回合' },
  { from: /1次/g, to: '壹次' },
  { from: /2次/g, to: '贰次' },
  { from: /3次/g, to: '叁次' },
  { from: /第1次/g, to: '第壹次' },
  { from: /第2次/g, to: '第贰次' },
  { from: /第3次/g, to: '第叁次' },
  { from: /第1张/g, to: '第壹张' },
  { from: /第2张/g, to: '第贰张' },
  { from: /第3张/g, to: '第叁张' },
  { from: /一半/g, to: '半数' },
  { from: /30%/g, to: '三成' },
  { from: /40%/g, to: '四成' },
  { from: /50%/g, to: '半数' },
  { from: /25%/g, to: '二成五' },
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
