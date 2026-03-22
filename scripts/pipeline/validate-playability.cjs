const {
  loadCards,
  extractYamlList,
} = require('./common.cjs');

const CJK_RE = /[\u4e00-\u9fff]/;
const EFFECT_PATTERNS = [
  /抽(\d+)/,
  /回复(\d+)点?生命?/,
  /获得【护持(\d+)】/,
  /造成(\d+)点伤害/,
  /施加【怀疑\+(\d+)/,
  /净化|移除自身全部负面|移除全部负面/,
];

function hasAnyEffectToken(text) {
  return EFFECT_PATTERNS.some((pattern) => pattern.test(text));
}

function main() {
  const { cards, parseErrors } = loadCards();
  const errors = [];

  if (parseErrors.length > 0) {
    for (const item of parseErrors) {
      errors.push(`${item.filePath}: JSON parse failed -> ${item.error}`);
    }
  }

  if (cards.length === 0) {
    console.log('[validate-playability] No card files found in content/cards, skip.');
    process.exit(0);
  }

  const activeFactions = new Set(extractYamlList('scope/bs01.yaml', 'active_factions'));

  for (const cardFile of cards) {
    const { relativePath, data } = cardFile;
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const rulesText = typeof data.rules_text === 'string' ? data.rules_text.trim() : '';
    const faction = typeof data.faction === 'string' ? data.faction.trim() : '';

    if (!CJK_RE.test(name)) {
      errors.push(`${relativePath}: name should contain Chinese text for current CN card set`);
    }

    if (!CJK_RE.test(rulesText)) {
      errors.push(`${relativePath}: rules_text should contain Chinese text for current CN card set`);
    }

    if (activeFactions.size > 0 && !activeFactions.has(faction)) {
      errors.push(`${relativePath}: faction "${faction}" is not in scope/bs01.yaml active_factions`);
    }

    if (!hasAnyEffectToken(rulesText)) {
      errors.push(`${relativePath}: rules_text has no runtime-recognized effect token`);
    }
  }

  const uniqueCosts = new Set(cards.map((cardFile) => cardFile.data.cost));
  if (uniqueCosts.size < 2) {
    errors.push('all cards use the same cost; cost curve is too flat for playtest');
  }

  if (errors.length > 0) {
    console.error(`[validate-playability] FAILED with ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`[validate-playability] PASS (${cards.length} file(s))`);
}

main();
