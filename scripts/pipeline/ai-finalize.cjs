const { runNodeScriptWithArgs, runNodeScript } = require('./common.cjs');
const { getArg } = require('./task-utils.cjs');

function main() {
  const taskArg = getArg('--task');
  if (!taskArg) {
    console.error('[ai-finalize] missing required argument: --task <path>');
    process.exit(1);
  }

  let failed = 0;

  console.log('[ai-finalize] Step 1/3 validate task definition');
  if (runNodeScriptWithArgs('scripts/pipeline/validate-ai-task.cjs', ['--task', taskArg]) !== 0) {
    failed += 1;
  }

  console.log('[ai-finalize] Step 2/3 enforce changed file scope');
  if (runNodeScriptWithArgs('scripts/pipeline/enforce-task-scope.cjs', ['--task', taskArg, '--staged']) !== 0) {
    failed += 1;
  }

  console.log('[ai-finalize] Step 3/3 run daily gate');
  if (runNodeScript('scripts/pipeline/gate-daily.cjs') !== 0) {
    failed += 1;
  }

  if (failed > 0) {
    console.error(`[ai-finalize] FAILED (${failed} step(s) failed)`);
    process.exit(1);
  }

  console.log('[ai-finalize] PASS');
}

main();
