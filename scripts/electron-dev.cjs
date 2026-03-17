const { spawn, spawnSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const electronBinary = require('electron');
const vitePkgPath = require.resolve('vite/package.json');
const viteCli = path.join(path.dirname(vitePkgPath), 'bin', 'vite.js');

function stripAnsi(input) {
  return input.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}

function killProcessTree(proc) {
  if (!proc || proc.killed || proc.exitCode !== null) return;

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  try {
    process.kill(-proc.pid, 'SIGTERM');
  } catch {
    try {
      process.kill(proc.pid, 'SIGTERM');
    } catch {
      // ignore
    }
  }
}

let viteProc = null;
let electronProc = null;
let electronStarted = false;
let shuttingDown = false;
let detectedDevUrl = null;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  killProcessTree(electronProc);
  killProcessTree(viteProc);
  setTimeout(() => process.exit(exitCode), 60);
}

function startElectron(devUrl) {
  if (electronStarted) return;
  electronStarted = true;

  const env = { ...process.env, NODE_ENV: 'development', VITE_DEV_SERVER_URL: devUrl };
  delete env.ELECTRON_RUN_AS_NODE;

  console.log(`[electron-dev] start electron with ${devUrl}`);
  electronProc = spawn(electronBinary, ['.'], {
    stdio: 'inherit',
    env,
    windowsHide: false,
  });

  electronProc.on('exit', (code) => {
    console.log(`[electron-dev] electron exited with code ${code ?? 0}`);
    shutdown(code ?? 0);
  });
}

function bindViteOutput(stream, isErr) {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    const text = stripAnsi(line);
    const prefix = isErr ? '[vite:err]' : '[vite]';
    console.log(`${prefix} ${text}`);

    if (!detectedDevUrl) {
      const m = text.match(/Local:\s*(https?:\/\/[^\s]+)/i);
      if (m && m[1]) {
        detectedDevUrl = m[1].trim();
        startElectron(detectedDevUrl);
      }
    }
  });
}

function main() {
  if (typeof electronBinary !== 'string' || !electronBinary) {
    console.error('[electron-dev] failed to resolve electron binary');
    process.exit(1);
  }

  delete process.env.ELECTRON_RUN_AS_NODE;
  console.log('[electron-dev] start vite dev server');

  viteProc = spawn(
    process.execPath,
    [viteCli, '--host', '127.0.0.1', '--port', '5173'],
    {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: false,
      detached: process.platform !== 'win32',
      env: { ...process.env, NODE_ENV: 'development' },
      cwd: path.resolve(__dirname, '..'),
    },
  );

  bindViteOutput(viteProc.stdout, false);
  bindViteOutput(viteProc.stderr, true);

  viteProc.on('exit', (code) => {
    console.log(`[electron-dev] vite exited with code ${code ?? 0}`);
    if (!electronStarted) {
      shutdown(code ?? 1);
      return;
    }
    shutdown(code ?? 0);
  });

  setTimeout(() => {
    if (!electronStarted) {
      const fallback = 'http://127.0.0.1:5173';
      detectedDevUrl = fallback;
      startElectron(fallback);
    }
  }, 8000);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (error) => {
  console.error('[electron-dev] uncaughtException', error);
  shutdown(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[electron-dev] unhandledRejection', reason);
  shutdown(1);
});

main();
