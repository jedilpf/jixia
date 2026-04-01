const fs = require('fs');
const path = require('path');

function readUtf8(relativePath) {
  const fullPath = path.resolve(process.cwd(), relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

function fail(message) {
  console.error(`[validate-runtime-baseline] ${message}`);
  process.exit(1);
}

function assertPattern(content, ruleName, pattern) {
  if (!pattern.test(content)) {
    fail(`Missing required runtime rule: ${ruleName}`);
  }
}

function assertNotPattern(content, ruleName, pattern) {
  if (pattern.test(content)) {
    fail(`Found legacy runtime drift: ${ruleName}`);
  }
}

function loadJson(relativePath) {
  try {
    return JSON.parse(readUtf8(relativePath));
  } catch (error) {
    fail(`Cannot parse JSON file "${relativePath}": ${String(error.message || error)}`);
  }
}

function assertArrayIncludes(values, requiredValues, ruleName) {
  const list = Array.isArray(values) ? values : [];
  const missing = requiredValues.filter((item) => !list.includes(item));
  if (missing.length > 0) {
    fail(`${ruleName} missing required key(s): ${missing.join(', ')}`);
  }
}

function assertObjectHasKeys(value, requiredKeys, ruleName) {
  if (!value || typeof value !== 'object') {
    fail(`${ruleName} must be an object`);
  }
  const keys = Object.keys(value);
  const missing = requiredKeys.filter((item) => !keys.includes(item));
  if (missing.length > 0) {
    fail(`${ruleName} missing property key(s): ${missing.join(', ')}`);
  }
}

function countCardsFromShowcase(showcaseSource) {
  // Count id fields in card object literals. Keeps the check stable even if spacing changes.
  return (showcaseSource.match(/\bid:\s*['"`][^'"`]+['"`]\s*,/g) ?? []).length;
}

function main() {
  const showcaseSource = readUtf8('src/data/showcaseCards.ts');
  const battleCardsSource = readUtf8('src/battleV2/cards.ts');
  const battleFrameSource = readUtf8('src/components/BattleFrameV2.tsx');
  const cardShowcaseSource = readUtf8('src/components/CardShowcase.tsx');
  const cardGridSource = readUtf8('src/components/showcase/CardGrid.tsx');
  const cardDetailSource = readUtf8('src/components/showcase/CardDetail.tsx');
  const serverIndexSource = readUtf8('server/index.cjs');
  const serverConstantsSource = readUtf8('server/constants.cjs');
  const contract = loadJson('docs/data-contract.json');

  const cardCount = countCardsFromShowcase(showcaseSource);
  if (cardCount < 170) {
    fail(`Card corpus too small for runtime baseline: ${cardCount} (<170)`);
  }

  assertPattern(
    battleCardsSource,
    'full-pool deck default enabled',
    /const useFullCardPool = options\?\.useFullCardPool \?\? true;/
  );
  assertPattern(
    battleCardsSource,
    'library export sourced from active pool',
    /export function listAllDebateCardsForLibrary\(\): DebateCard\[]/
  );
  assertPattern(
    battleFrameSource,
    'battle library reads full-source helper',
    /listAllDebateCardsForLibrary/
  );
  assertPattern(
    serverIndexSource,
    'server uses configurable safe default host',
    /httpServer\.listen\(port,\s*DEFAULT_HOST,\s*\(\)\s*=>/
  );
  assertPattern(
    serverConstantsSource,
    'default local origin includes vite 5173',
    /127\.0\.0\.1:5173/
  );
  assertPattern(
    cardShowcaseSource,
    'CardShowcase reads cards via cardsSource',
    /from ['"]@\/data\/cardsSource['"]/,
  );
  assertPattern(
    cardGridSource,
    'CardGrid reads cards via cardsSource',
    /from ['"]@\/data\/cardsSource['"]/,
  );
  assertPattern(
    cardDetailSource,
    'CardDetail reads cards via cardsSource',
    /from ['"]@\/data\/cardsSource['"]/,
  );
  assertNotPattern(
    cardShowcaseSource,
    'CardShowcase should not import raw showcaseCards directly',
    /@\/data\/showcaseCards/,
  );
  assertNotPattern(
    cardGridSource,
    'CardGrid should not import raw showcaseCards directly',
    /@\/data\/showcaseCards/,
  );
  assertNotPattern(
    cardDetailSource,
    'CardDetail should not import raw showcaseCards directly',
    /@\/data\/showcaseCards/,
  );

  const battleStateContract = contract?.DebateBattleState;
  if (!battleStateContract || typeof battleStateContract !== 'object') {
    fail('docs/data-contract.json missing DebateBattleState section');
  }

  const requiredBattleStateKeys = [
    'round',
    'maxRounds',
    'phase',
    'secondsLeft',
    'activeTopicId',
    'activeTopic',
    'topicSelectionPending',
    'topicSelectionRound',
    'topicSelectionSecondsLeft',
    'topicOptions',
    'arenaId',
    'arenaName',
    'player',
    'enemy',
    'logs',
    'resolveFeed',
    'internalAudit',
    'winner',
  ];

  assertArrayIncludes(
    battleStateContract.required,
    requiredBattleStateKeys,
    'DebateBattleState.required',
  );
  assertObjectHasKeys(
    battleStateContract.properties,
    requiredBattleStateKeys,
    'DebateBattleState.properties',
  );

  const battleLogEntryContract = contract?.BattleLogEntry;
  if (!battleLogEntryContract || typeof battleLogEntryContract !== 'object') {
    fail('docs/data-contract.json missing BattleLogEntry section');
  }

  assertArrayIncludes(
    battleLogEntryContract.required,
    ['id', 'round', 'text'],
    'BattleLogEntry.required',
  );
  assertObjectHasKeys(
    battleLogEntryContract.properties,
    ['id', 'round', 'text'],
    'BattleLogEntry.properties',
  );

  console.log(
    `[validate-runtime-baseline] PASS (cards=${cardCount}, source_chain=cardsSource, contract=aligned)`
  );
}

main();
