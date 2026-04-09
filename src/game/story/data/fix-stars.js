const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname);
const files = [
  'prolog.ts',
  'chapterMoru001.ts',
  'chapterMoru001_part2.ts',
  'chapterMoru002.ts',
  'chapterMoru003.ts',
  'chapterMoru004.ts',
  'chapterMoru005.ts',
  'chapterMoru006.ts',
  'chapterMoru007.ts',
  'chapterMoru008.ts'
];

files.forEach(f => {
  const filePath = path.join(dataDir, f);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content.length;
    content = content.replace(/\*([^*]+)\*/g, '$1');
    content = content.replace(/\*\*+/g, '');
    const after = content.length;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`fixed: ${f} (${before} -> ${after} chars)`);
  }
});
