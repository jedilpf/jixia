const fs = require('fs');

const filePath = 'src/game/story/data/prolog.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// 修复 …? 为 ……
content = content.replace(/…\?/g, '……');

// 修复行457的 』? 为 』
content = content.replace(/』\?/g, '』');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('修复完成：将所有 …? 替换为 ……，将 』? 替换为 』');
