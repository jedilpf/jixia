const fs = require('fs');

const filePath = 'src/game/story/data/prolog.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace [姓名] with 孟舆
const nameCount = (content.match(/\[姓名\]/g) || []).length;
content = content.replace(/\[姓名\]/g, '孟舆');

// Replace [地名] with 临淄
const placeCount = (content.match(/\[地名\]/g) || []).length;
content = content.replace(/\[地名\]/g, '临淄');

fs.writeFileSync(filePath, content, 'utf8');

console.log(`Replaced ${nameCount} [姓名] -> 孟舆`);
console.log(`Replaced ${placeCount} [地名] -> 临淄`);
console.log('Done!');
