const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/game/story/data/prolog.ts');
const content = fs.readFileSync(filePath);

console.log('File size:', content.length, 'bytes');
console.log('First 10 bytes:', Array.from(content.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

// Check for UTF-8 BOM
if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
  console.log('Encoding: UTF-8 with BOM');
} else if (content[0] === 0xFF && content[1] === 0xFE) {
  console.log('Encoding: UTF-16 LE');
} else if (content[0] === 0xFE && content[1] === 0xFF) {
  console.log('Encoding: UTF-16 BE');
} else {
  console.log('Encoding: No BOM (likely UTF-8)');
}
