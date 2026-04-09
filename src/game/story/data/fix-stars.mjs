import * as fs from 'fs';

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
  const content = fs.readFileSync(f, 'utf8');
  const before = content.length;
  const after = content
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\*\*+/g, '');
  fs.writeFileSync(f, after);
  console.log(`fixed ${f}: ${before} -> ${after.length} chars`);
});