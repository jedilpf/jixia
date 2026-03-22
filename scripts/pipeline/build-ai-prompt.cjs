const fs = require('fs');
const path = require('path');
const {
  resolveProjectPath,
  readUtf8,
} = require('./common.cjs');
const {
  loadTask,
  validateTask,
  getArg,
  ensureDir,
  nowIso,
  normalizePath,
} = require('./task-utils.cjs');

const CONSTRAINT_FILES = [
  'canon/anchors.yaml',
  'canon/taboo.yaml',
  'canon/terminology.yaml',
  'scope/bs01.yaml',
  'mechanics/index.yaml',
];

function fenced(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();
  const lang = ext === '.yaml' || ext === '.yml' ? 'yaml' : ext === '.json' ? 'json' : 'text';
  return `### ${filePath}\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
}

function main() {
  const taskArg = getArg('--task');
  if (!taskArg) {
    console.error('[build-ai-prompt] missing required argument: --task <path>');
    process.exit(1);
  }

  let loaded = null;
  try {
    loaded = loadTask(taskArg);
  } catch (error) {
    console.error(`[build-ai-prompt] ${error.message || error}`);
    process.exit(1);
  }

  const errors = validateTask(loaded.data);
  if (errors.length > 0) {
    console.error(`[build-ai-prompt] task invalid (${errors.length} issue(s)):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  const sections = [];
  sections.push('# AI Task Packet');
  sections.push(`generated_at: ${nowIso()}`);
  sections.push(`task_file: ${loaded.taskRelPath}`);
  sections.push('');
  sections.push('## Non-Negotiable Rules');
  sections.push('- You must follow all constraints below before writing any output.');
  sections.push('- If information is missing, write UNKNOWN and append to open_questions.md.');
  sections.push('- Any card content without lore_anchor_ids must be rejected.');
  sections.push('- Do not modify files outside allowed_write_paths.');
  sections.push('');
  sections.push('## Task Definition');
  sections.push('```json');
  sections.push(JSON.stringify(loaded.data, null, 2));
  sections.push('```');
  sections.push('');
  sections.push('## Constraint Context');
  for (const relative of CONSTRAINT_FILES) {
    const content = readUtf8(relative);
    sections.push(fenced(relative, content));
  }
  sections.push('## Output Contract (required)');
  sections.push('```json');
  sections.push(JSON.stringify({
    task_id: loaded.data.task_id,
    status: 'PASS|BLOCKED|NEEDS_HUMAN_REVIEW',
    changed_files: [],
    verification: [],
    open_questions: [],
    risks: [],
    next_actions: [],
  }, null, 2));
  sections.push('```');
  sections.push('');
  sections.push('## Execution Checklist');
  sections.push('1. Read task definition.');
  sections.push('2. Read all constraint files.');
  sections.push('3. Produce outputs only under allowed_write_paths.');
  sections.push('4. Ensure references and terminology comply.');
  sections.push('5. Return output contract JSON.');

  ensureDir('ai/out');
  const outName = `${loaded.data.task_id}.prompt.md`.replace(/[^\w.\-]/g, '_');
  const outRel = normalizePath(path.join('ai', 'out', outName));
  const outPath = resolveProjectPath(outRel);
  // Add UTF-8 BOM so PowerShell on Windows can display Chinese correctly by default.
  fs.writeFileSync(outPath, `\ufeff${sections.join('\n')}`, 'utf8');

  console.log(`[build-ai-prompt] PASS -> ${outRel}`);
}

main();
