const fs = require('fs');
const path = require('path');

const showcaseFile = fs.readFileSync('src/data/showcaseCards.ts', 'utf-8');
const idRegex = /id:\s*'([^']+)'/g;
const ids = [];
let match;
while ((match = idRegex.exec(showcaseFile)) !== null) {
  ids.push(match[1]);
}

const files = fs.readdirSync('public/assets/cards');
const fileNames = new Set(files);

const missing = [];
for (const id of ids) {
  if (!fileNames.has(`${id}.jpg`) && !fileNames.has(`${id}.png`)) {
    missing.push(id);
  }
}

console.log("Missing images for IDs:", missing);
