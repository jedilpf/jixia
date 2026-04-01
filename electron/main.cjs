const electron = require('electron');
if (!electron || typeof electron !== 'object' || !electron.app) {
  console.error(
    '[electron-main] Electron app API unavailable. Check ELECTRON_RUN_AS_NODE and start command.'
  );
  process.exit(1);
}
const { app, BrowserWindow, shell, dialog } = electron;
const fs = require('fs');
const os = require('os');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173';
const MAX_RENDERER_RELOADS = 2;
const RENDERER_RELOAD_RESET_MS = 12000;

let mainWindow = null;
let rendererReloadAttempts = 0;
let rendererLastCrashAt = 0;
let hasOpenedBrowserFallback = false;

// Use a stable writable runtime directory to avoid Chromium cache permission crashes.
const runtimeBaseDir = path.join(os.tmpdir(), 'jixia2-runtime');
const runtimeSessionDir = path.join(runtimeBaseDir, 'Session');
const runtimeCacheDir = path.join(runtimeBaseDir, 'Cache');
try {
  fs.mkdirSync(runtimeBaseDir, { recursive: true });
  fs.mkdirSync(runtimeSessionDir, { recursive: true });
  fs.mkdirSync(runtimeCacheDir, { recursive: true });
  app.setPath('userData', runtimeBaseDir);
  app.setPath('sessionData', runtimeSessionDir);
} catch (error) {
  console.error('[runtime-path-init-failed]', error);
}

// Renderer crashes in some environments are tied to GPU cache init failures.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-accelerated-video-decode');
app.commandLine.appendSwitch('disk-cache-dir', runtimeCacheDir);
if (isDev) {
  // Windows environments with strict code integrity policies can crash the renderer.
  app.commandLine.appendSwitch('disable-features', 'RendererCodeIntegrity');
}

function getRuntimeLogPath() {
  try {
    return path.join(app.getPath('userData'), 'runtime.log');
  } catch {
    return path.join(process.cwd(), 'runtime.log');
  }
}

function safeStderrWrite(line) {
  try {
    if (process.stderr && !process.stderr.destroyed) {
      process.stderr.write(`${line}\n`);
    }
  } catch {
    // ignore stderr pipe issues (EPIPE etc.)
  }
}

function runtimeLog(message, extra) {
  const details = extra ? ` ${JSON.stringify(extra)}` : '';
  const line = `[${new Date().toISOString()}] ${message}${details}`;
  safeStderrWrite(line);
  try {
    fs.appendFileSync(getRuntimeLogPath(), `${line}\n`, 'utf8');
  } catch {
    // ignore write failures to avoid recursive crashes
  }
}

function shouldAttemptRendererReload() {
  const now = Date.now();
  if (now - rendererLastCrashAt > RENDERER_RELOAD_RESET_MS) {
    rendererReloadAttempts = 0;
  }
  rendererLastCrashAt = now;
  rendererReloadAttempts += 1;
  return rendererReloadAttempts <= MAX_RENDERER_RELOADS;
}

function handleRendererCrash(win, source, details) {
  runtimeLog(`${source}-render-process-gone`, details);
  if (!win || win.isDestroyed()) return;

  if (shouldAttemptRendererReload()) {
    runtimeLog('renderer-reload-attempt', { source, attempt: rendererReloadAttempts });
    win.reload();
    return;
  }

  runtimeLog('renderer-reload-suppressed', { source, attempt: rendererReloadAttempts });
  if (isDev && !hasOpenedBrowserFallback) {
    hasOpenedBrowserFallback = true;
    shell.openExternal(DEV_URL).catch(() => undefined);
    dialog.showErrorBox(
      '桌面渲染异常',
      '桌面渲染进程崩溃，已自动切换到浏览器版本。请先在浏览器继续使用。'
    );
  }
}

function attachWindowDiagnostics(win) {
  win.webContents.on('did-fail-load', (_event, code, desc, url) => {
    runtimeLog('did-fail-load', { code, desc, url });
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    handleRendererCrash(win, 'window', details);
  });

  win.webContents.on('unresponsive', () => {
    runtimeLog('window-unresponsive');
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: '谋天下：问道百家',
    autoHideMenuBar: true,
  });

  mainWindow = win;
  attachWindowDiagnostics(win);

  const loadTask = isDev
    ? win.loadURL(DEV_URL)
    : win.loadFile(path.join(__dirname, '../dist/index.html'));

  loadTask.catch((error) => {
    runtimeLog('load-failed', { message: error?.message || String(error) });
  });

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });
}

let isHandlingFatalError = false;

process.on('uncaughtException', (error) => {
  if (isHandlingFatalError) {
    safeStderrWrite(`[${new Date().toISOString()}] uncaught-exception-fallback ${error?.message || String(error)}`);
    return;
  }
  isHandlingFatalError = true;
  try {
    runtimeLog('uncaught-exception', { message: error?.message, stack: error?.stack });
  } finally {
    isHandlingFatalError = false;
  }
});

process.on('unhandledRejection', (reason) => {
  runtimeLog('unhandled-rejection', { reason: String(reason) });
});

app.on('render-process-gone', (_event, webContents, details) => {
  const owner = BrowserWindow.fromWebContents(webContents);
  if (owner && !owner.isDestroyed()) return;
  runtimeLog('app-render-process-gone', details);
});

app.on('child-process-gone', (_event, details) => {
  runtimeLog('child-process-gone', details);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

