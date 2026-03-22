const {
  loadCards,
  extractYamlIds,
  readUtf8,
} = require('./common.cjs');

function main() {
  const { cards, parseErrors } = loadCards();
  const errors = [];
  const warnings = [];

  if (parseErrors.length > 0) {
    for (const item of parseErrors) {
      errors.push(`${item.filePath}: JSON parse failed -> ${item.error}`);
    }
  }

  if (cards.length === 0) {
    console.log('[validate-references] No card files found in content/cards, skip.');
    process.exit(0);
  }

  const anchorIds = new Set(extractYamlIds('canon/anchors.yaml'));
  const mechanicIds = new Set(extractYamlIds('mechanics/index.yaml'));
  const openQuestions = readUtf8('open_questions.md');

  for (const cardFile of cards) {
    const { relativePath, data } = cardFile;

    const loreAnchorIds = Array.isArray(data.lore_anchor_ids) ? data.lore_anchor_ids : [];
    for (const anchorId of loreAnchorIds) {
      if (anchorId === 'UNKNOWN') {
        if (!openQuestions.includes(data.id)) {
          errors.push(`${relativePath}: UNKNOWN exists but card id "${data.id}" is not tracked in open_questions.md`);
        }
        continue;
      }
      if (!anchorIds.has(anchorId)) {
        errors.push(`${relativePath}: unknown lore_anchor_id "${anchorId}"`);
      }
    }

    const cardMechanicIds = Array.isArray(data.mechanic_ids) ? data.mechanic_ids : [];
    for (const mechanicId of cardMechanicIds) {
      if (!mechanicIds.has(mechanicId)) {
        errors.push(`${relativePath}: unknown mechanic_id "${mechanicId}"`);
      }
    }

    if (loreAnchorIds.length === 0) {
      errors.push(`${relativePath}: lore_anchor_ids cannot be empty`);
    }
    if (cardMechanicIds.length === 0) {
      errors.push(`${relativePath}: mechanic_ids cannot be empty`);
    }
  }

  if (warnings.length > 0) {
    console.warn(`[validate-references] WARN ${warnings.length}`);
    for (const w of warnings) {
      console.warn(`- ${w}`);
    }
  }

  if (errors.length > 0) {
    console.error(`[validate-references] FAILED with ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`[validate-references] PASS (${cards.length} file(s))`);
}

main();
