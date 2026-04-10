const fs = require('fs');

const filePath = 'src/game/story/data/prolog.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 修复标点符号问题
// 1. 修复行尾的 ? 应该是 。的情况（陈述句结尾）
// 2. 修复行尾的 ? 应该是 ？的情况（疑问句结尾）
// 3. 修复 —? 应该是 —— 或 ——。

const lines = content.split('\n');
const fixedLines = lines.map((line, index) => {
  let fixed = line;
  
  // 修复模式：文本内容行（包含 content: ` 或 speaker: 后的文本）
  if (line.includes('content: `') || line.includes("content: '") || line.includes('text: \'')) {
    // 修复 ? 前面是汉字的情况，应该是 。
    fixed = fixed.replace(/([\u4e00-\u9fa5])\?$/g, '$1。');
    
    // 修复 ? 前面是标点的情况
    fixed = fixed.replace(/([。！，、；：""''（）【】])\?$/g, '$1');
    
    // 修复 —? 应该是 ——
    fixed = fixed.replace(/—\?$/g, '——');
    
    // 修复 ……? 应该是 ……
    fixed = fixed.replace(/……\?$/g, '……');
    
    // 修复 ！? 应该是 ！
    fixed = fixed.replace(/！\?$/g, '！');
    
    // 修复 ？? 应该是 ？
    fixed = fixed.replace(/？\?$/g, '？');
  }
  
  return fixed;
});

content = fixedLines.join('\n');

// 全局替换：修复所有在模板字符串中的 ?
// 模式：汉字后面跟着 ? 应该是 。
content = content.replace(/([\u4e00-\u9fa5])\?([\n\r])/g, '$1。$2');

// 修复 ——? 为 ——
content = content.replace(/——\?/g, '——');
content = content.replace(/—\?/g, '——');

// 修复 ……? 为 ……
content = content.replace(/……\?/g, '……');

// 修复 ！? 为 ！
content = content.replace(/！\?/g, '！');

// 修复 ？? 为 ？
content = content.replace(/？\?/g, '？');

// 修复 。? 为 。
content = content.replace(/。\?/g, '。');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Punctuation fixed!');
