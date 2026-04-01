const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const NON_ASCII_PATH_RE = /[^\x00-\x7F]/;

async function ensureDirRemoved(target) {
  await fs.rm(target, { recursive: true, force: true });
}

async function copyDir(from, to) {
  await ensureDirRemoved(to);
  await fs.cp(from, to, { recursive: true, force: true });
}

async function run() {
  const { build } = await import('vite');

  const projectRoot = process.cwd();
  const finalOutDir = path.resolve(projectRoot, 'dist');
  const tempOutDir = path.resolve(os.tmpdir(), 'jixia-build-dist');
  const useSafeOutDir = NON_ASCII_PATH_RE.test(projectRoot);

  if (!useSafeOutDir) {
    await build();
    return;
  }

  console.log('[build-safe] Detected non-ASCII project path, using temp output directory.');
  console.log(`[build-safe] tempOutDir=${tempOutDir}`);

  await build({
    build: {
      outDir: tempOutDir,
      emptyOutDir: true,
    },
  });

  await copyDir(tempOutDir, finalOutDir);
  console.log(`[build-safe] Copied build artifacts to ${finalOutDir}`);
}

run().catch((error) => {
  console.error('[build-safe] Build failed:', error);
  process.exit(1);
});
