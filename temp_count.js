const fs = require('fs');
const content = fs.readFileSync('src/data/showcaseCards.ts', 'utf8');
const matches = content.match(/\{ id: '[^']+'[^}]+\}/g) || [];
console.log('总卡牌数:', matches.length);

const factions = {};
const types = {};
const rarities = {};

matches.forEach(card => {
  const faction = card.match(/faction: '([^']+)'/)?.[1];
  const type = card.match(/type: '([^']+)'/)?.[1];
  const rarity = card.match(/rarity: '([^']+)'/)?.[1];

  if (faction) factions[faction] = (factions[faction] || 0) + 1;
  if (type) types[type] = (types[type] || 0) + 1;
  if (rarity) rarities[rarity] = (rarities[rarity] || 0) + 1;
});

console.log('\n门派分布:', factions);
console.log('\n类型分布:', types);
console.log('\n稀有度分布:', rarities);
