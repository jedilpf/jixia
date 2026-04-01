const fs = require('fs');
const path = require('path');

const TARGETS = {
  factionCount: 16,
  cardsPerFaction: 8,
  genericCardCount: 12,
};

const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'src', 'data', 'showcaseCards.ts');
const outputPath = path.join(rootDir, 'scripts', 'expansion-template.json');

function parseCardsFromSource(sourceText) {
  const cards = [];
  const cardRegex = /\{[^{}]*id:\s*'([^']+)'[^{}]*faction:\s*'([^']+)'[^{}]*cost:\s*(\d+)[^{}]*\}/g;
  let match = cardRegex.exec(sourceText);
  while (match) {
    cards.push({
      id: match[1],
      faction: match[2],
      cost: Number(match[3]),
    });
    match = cardRegex.exec(sourceText);
  }
  return cards;
}

function pickFactionCards(cards, cardsPerFaction) {
  const byFaction = new Map();
  for (const card of cards) {
    if (!byFaction.has(card.faction)) byFaction.set(card.faction, []);
    byFaction.get(card.faction).push(card);
  }

  const factionOrder = [...byFaction.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([faction]) => faction)
    .slice(0, TARGETS.factionCount);

  const factionDecks = {};
  const usedIds = new Set();

  for (const faction of factionOrder) {
    const pool = [...(byFaction.get(faction) || [])]
      .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));

    if (!pool.length) continue;

    const picked = [];
    for (let i = 0; i < cardsPerFaction; i += 1) {
      const card = pool[i % pool.length];
      picked.push(card.id);
      usedIds.add(card.id);
    }

    factionDecks[faction] = picked;
  }

  return { factionDecks, usedIds, factionOrder };
}

function pickGenericCards(cards, usedIds, genericCardCount) {
  return cards
    .filter((card) => !usedIds.has(card.id))
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id))
    .slice(0, genericCardCount)
    .map((card) => card.id);
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  const sourceText = fs.readFileSync(sourcePath, 'utf8');
  const cards = parseCardsFromSource(sourceText);
  if (!cards.length) {
    throw new Error('No cards parsed from showcaseCards.ts');
  }

  const { factionDecks, usedIds, factionOrder } = pickFactionCards(cards, TARGETS.cardsPerFaction);
  const genericCardIds = pickGenericCards(cards, usedIds, TARGETS.genericCardCount);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: path.relative(rootDir, sourcePath).replace(/\\/g, '/'),
    targets: TARGETS,
    selectedFactions: factionOrder,
    factions: factionDecks,
    genericCardIds,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Generated: ${path.relative(rootDir, outputPath).replace(/\\/g, '/')}`);
  console.log(`Factions: ${factionOrder.length}, Generic: ${genericCardIds.length}`);
}

main();
