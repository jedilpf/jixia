const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'cards');
const SHOWCASE_PATH = path.join(ROOT, 'src', 'data', 'showcaseCards.ts');
const DB_PATH = path.join(ROOT, 'src', 'data', 'cardsDB.json');

const FACTION_ALIAS_MAP = {
  礼心殿: '儒家',
  儒家: '儒家',
  玄匠盟: '墨家',
  墨家: '墨家',
};

const ALLOWED_DISPLAY_TYPES = new Set(['技能', '事件', '场地', '装备', '角色', '反制']);

function safeText(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function sanitizeIdPart(raw) {
  const normalized = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized.length > 0 ? normalized : 'CARD';
}

function normalizeFaction(rawFaction) {
  const faction = safeText(rawFaction, '');
  return FACTION_ALIAS_MAP[faction] || faction;
}

function identityKey(card) {
  return [
    safeText(card.name, ''),
    normalizeFaction(card.faction),
  ].join('||');
}

function parseShowcaseCards() {
  const source = fs.readFileSync(SHOWCASE_PATH, 'utf8');
  const executable = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const context = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(executable, context, { filename: 'showcaseCards.ts' });
  const cards = context.module.exports.CARDS || context.exports.CARDS;
  if (!Array.isArray(cards)) {
    throw new Error('Failed to parse CARDS array from src/data/showcaseCards.ts');
  }
  return cards.map((card) => ({
    contentId: `LEG-SC-${sanitizeIdPart(card.id)}`,
    name: safeText(card.name, ''),
    faction: safeText(card.faction, ''),
    displayType: safeText(card.type, ''),
  }));
}

function parseCardsDb() {
  const cards = JSON.parse(fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, ''));
  if (!Array.isArray(cards)) return [];
  return cards.map((card) => ({
    contentId: `LEG-DB-${sanitizeIdPart(card.id)}`,
    name: safeText(card.name, ''),
    faction: safeText(card.school, ''),
    displayType: safeText(card.raw_text?.type || card.type, ''),
  }));
}

function buildDisplayTypeIndexes() {
  const byContentId = new Map();
  const byIdentity = new Map();

  for (const entry of [...parseShowcaseCards(), ...parseCardsDb()]) {
    if (!ALLOWED_DISPLAY_TYPES.has(entry.displayType)) {
      continue;
    }
    byContentId.set(entry.contentId, entry.displayType);
    const key = identityKey(entry);
    if (key !== '||' && !byIdentity.has(key)) {
      byIdentity.set(key, entry.displayType);
    }
  }

  return { byContentId, byIdentity };
}

function main() {
  const { byContentId, byIdentity } = buildDisplayTypeIndexes();
  const files = fs.readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.json')).sort();
  let updated = 0;

  for (const fileName of files) {
    const filePath = path.join(CONTENT_DIR, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const nextDisplayType =
      byContentId.get(String(data.id || '')) ||
      byIdentity.get(identityKey({ name: data.name, faction: data.faction }));

    if (!nextDisplayType || data.display_type === nextDisplayType) {
      continue;
    }

    data.display_type = nextDisplayType;
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    updated += 1;
  }

  console.log(`[backfill-legacy-display-types] Updated ${updated} card file(s)`);
}

main();
