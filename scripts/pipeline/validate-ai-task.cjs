const { loadTask, validateTask, getArg } = require('./task-utils.cjs');

function main() {
  const taskArg = getArg('--task');
  if (!taskArg) {
    console.error('[validate-ai-task] missing required argument: --task <path>');
    process.exit(1);
  }

  let loaded = null;
  try {
    loaded = loadTask(taskArg);
  } catch (error) {
    console.error(`[validate-ai-task] ${error.message || error}`);
    process.exit(1);
  }

  const errors = validateTask(loaded.data);
  if (errors.length > 0) {
    console.error(`[validate-ai-task] FAILED with ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`[validate-ai-task] PASS (${loaded.taskRelPath})`);
}

main();
