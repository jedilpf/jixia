const fs = require('fs');
const path = require('path');
const { resolveProjectPath, readUtf8 } = require('./common.cjs');

const SOURCE_PATH = 'src/data/showcaseCards.ts';
const CARDS_DIR = resolveProjectPath('public', 'assets', 'cards');
const VALID_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];
const PNG_EXACT_IDS = new Set(['xingpan', 'liangyi', 'mingxiang10']);
const PNG_GROUP_REGEX = /^(tiangong|liangyi|xinglin|baiyan|yangzhen|choutian|lixindian|hengjieting|guizhen|wannong|jianai|youce)\d+$/;
const PNG_SHORT_GROUP_REGEX = /^(rujia|fajia)[1-5]$/;

function parseShowcaseCards(sourceText) {
  const cards = [];
  const cardRegex = /\{[^{}]*id:\s*'([^']+)'[^{}]*name:\s*'([^']+)'[^{}]*faction:\s*'([^']+)'[^{}]*\}/g;
  let match = cardRegex.exec(sourceText);
  while (match) {
    cards.push({
      id: match[1],
      name: match[2],
      faction: match[3],
    });
    match = cardRegex.exec(sourceText);
  }
  return cards;
}

function getExpectedExtension(cardId) {
  if (PNG_EXACT_IDS.has(cardId) || PNG_GROUP_REGEX.test(cardId) || PNG_SHORT_GROUP_REGEX.test(cardId)) {
    return '.png';
  }
  return '.jpg';
}

function findExistingAsset(cardId) {
  return VALID_EXTS
    .map((ext) => ({
      ext,
      fullPath: path.join(CARDS_DIR, `${cardId}${ext}`),
    }))
    .filter((entry) => fs.existsSync(entry.fullPath));
}

function main() {
  const sourceText = readUtf8(SOURCE_PATH);
  const cards = parseShowcaseCards(sourceText);

  if (!cards.length) {
    console.error('[audit-card-art] FAILED: no showcase cards parsed');
    process.exit(1);
  }

  const seenIds = new Set();
  const duplicateIds = [];
  const missingAssets = [];
  const mismatchedAssets = [];

  for (const card of cards) {
    if (seenIds.has(card.id)) {
      duplicateIds.push(card.id);
      continue;
    }
    seenIds.add(card.id);

    const expectedExt = getExpectedExtension(card.id);
    const expectedFile = path.join(CARDS_DIR, `${card.id}${expectedExt}`);
    if (fs.existsSync(expectedFile)) {
      continue;
    }

    const alternatives = findExistingAsset(card.id);
    if (alternatives.length > 0) {
      mismatchedAssets.push({
        ...card,
        expectedExt,
        found: alternatives.map((entry) => path.basename(entry.fullPath)),
      });
      continue;
    }

    missingAssets.push({
      ...card,
      expectedExt,
    });
  }

  if (duplicateIds.length > 0) {
    console.error(`[audit-card-art] FAILED: duplicate showcase ids (${duplicateIds.length})`);
    for (const id of duplicateIds) {
      console.error(`- duplicate id: ${id}`);
    }
    process.exit(1);
  }

  if (mismatchedAssets.length > 0 || missingAssets.length > 0) {
    console.error(
      `[audit-card-art] FAILED (cards=${cards.length}, missing=${missingAssets.length}, mismatched=${mismatchedAssets.length})`
    );

    for (const entry of mismatchedAssets) {
      console.error(
        `- wrong extension: ${entry.id} expected ${entry.expectedExt} but found ${entry.found.join(', ')}`
      );
    }

    for (const entry of missingAssets) {
      console.error(
        `- missing: ${entry.id} (${entry.name}) faction=${entry.faction} expected=${entry.id}${entry.expectedExt}`
      );
    }

    process.exit(1);
  }

  console.log(`[audit-card-art] PASS (cards=${cards.length}, missing=0, mismatched=0)`);
}

main();
