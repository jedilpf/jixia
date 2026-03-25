const fs = require('fs');
const path = require('path');

const TARGETS = {
  factionCount: 16,
  cardsPerFaction: 8,
  genericCardCount: 12,
};

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'content', 'cards');
const outputPath = path.join(rootDir, 'scripts', 'expansion-template.json');

function loadCardsFromContent() {
  if (!fs.existsSync(sourceDir)) return [];
  const files = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json'));
  return files
    .map((name) => {
      const full = path.join(sourceDir, name);
      const data = JSON.parse(fs.readFileSync(full, 'utf8'));
      return {
        id: data.id,
        faction: data.faction,
        cost: Number.isFinite(data.cost) ? Number(data.cost) : 1,
      };
    })
    .filter((card) => typeof card.id === 'string' && typeof card.faction === 'string');
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
  const cards = loadCardsFromContent();
  if (!cards.length) {
    throw new Error('No cards parsed from content/cards');
  }

  const { factionDecks, usedIds, factionOrder } = pickFactionCards(cards, TARGETS.cardsPerFaction);
  const genericCardIds = pickGenericCards(cards, usedIds, TARGETS.genericCardCount);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: path.relative(rootDir, sourceDir).replace(/\\/g, '/'),
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
