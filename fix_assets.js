import fs from 'fs';

const showcaseFile = fs.readFileSync('src/data/showcaseCards.ts', 'utf-8');
const idRegex = /\{ id:\s*'([^']+)', name:\s*'([^']+)'/g;

const nameToId = {};
let match;
while ((match = idRegex.exec(showcaseFile)) !== null) {
  nameToId[match[2]] = match[1];
}

const files = fs.readdirSync('public/assets/cards');
const pngIds = [];
for (const file of files) {
  if (file.endsWith('.png')) {
    pngIds.push(file.replace('.png', ''));
  }
}

// Generate the new code snippet
let newExtOverrides = `const CARD_IMAGE_EXT_OVERRIDES: Record<string, 'png' | 'jpg'> = {\n`;
for (const id of pngIds) {
  newExtOverrides += `  '${id}': 'png',\n`;
}
newExtOverrides += `};\n`;

let newNameToId = `const CARD_NAME_TO_IMAGE_ID: Record<string, string> = {\n`;
for (const [name, id] of Object.entries(nameToId)) {
  newNameToId += `  '${name}': '${id}',\n`;
}
newNameToId += `};\n`;

const assetFile = fs.readFileSync('src/utils/assets.ts', 'utf-8');

// Replace the original blocks
const extBlockRegex = /const CARD_IMAGE_EXT_OVERRIDES[\s\S]*?};\n/m;
const nameBlockRegex = /const CARD_NAME_TO_IMAGE_ID[\s\S]*?};\n/m;

let updated = assetFile.replace(extBlockRegex, newExtOverrides);
updated = updated.replace(nameBlockRegex, newNameToId);

fs.writeFileSync('src/utils/assets.ts', updated);
console.log("Successfully rebuilt assets.ts logic dynamically based on physical files and showcaseCards DB");
