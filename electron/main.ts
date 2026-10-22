/**
 * TypeFlow Electron Main Process
 * - System-wide keyboard detection via uiohook-napi
 * - System tray with start/stop controls
 * - Settings persistence via electron-store (JSON file)
 * - IPC bridge between main ↔ renderer
 * - Privacy: only key codes (not characters) are used; nothing is logged
 */

import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  shell,
  nativeTheme,
} from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// ─── Paths ────────────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── App state ────────────────────────────────────────────────────────────────
let isQuitting = false;

// ─── Global keyboard hook ─────────────────────────────────────────────────────
let uiohook: typeof import('uiohook-napi') | null = null;
let hookRunning = false;

async function loadUiohook() {
  try {
    uiohook = await import('uiohook-napi');
    console.log('[TypeFlow] uiohook-napi loaded successfully');
  } catch (e) {
    console.warn('[TypeFlow] uiohook-napi not available:', e);
    uiohook = null;
  }
}

// Exact modifier & special keys from uiohook-napi UiohookKey to ignore for sound triggers
const IGNORED_KEY_CODES = new Set([
  29, 3613, // Ctrl, CtrlRight
  56, 3640, // Alt, AltRight
  42, 54,   // Shift, ShiftRight
  3675, 3676, // Meta (Win), MetaRight
  58,       // CapsLock
  69,       // NumLock
  70,       // ScrollLock
  3639,     // PrintScreen
  // F1 - F12
  59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 87, 88,
  // F13 - F24
  91, 92, 93, 99, 100, 101, 102, 103, 104, 105, 106, 107,
]);

// ─── Settings store ────────────────────────────────────────────────────────────
const settingsPath = path.join(app.getPath('userData'), 'typeflow-settings.json');

function loadStoredSettings(): Record<string, unknown> {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch (_) {}
  return {};
}

function saveStoredSettings(data: Record<string, unknown>): void {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[TypeFlow] Failed to save settings:', e);
  }
}

// ─── Window ───────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let typingSoundsEnabled = true;

function getIconPath(): string {
  const iconFile = process.platform === 'win32' ? 'typeflow-icon.ico'
    : process.platform === 'darwin' ? 'typeflow-icon.icns'
    : 'typeflow-icon.png';

  // In development, use the public folder
  const devPath = path.join(process.cwd(), 'public', iconFile);
  if (fs.existsSync(devPath)) return devPath;

  // In production (packaged), use resources folder
  const prodPath = path.join(process.resourcesPath ?? '', iconFile);
  if (fs.existsSync(prodPath)) return prodPath;

  // Fallback: SVG-based nativeImage
  return path.join(process.cwd(), 'public', 'typeflow-icon.svg');
}

function createWindow(): void {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    title: 'TypeFlow',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0a0a12',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a12',
      symbolColor: '#A29BFE',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Hide to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray(): void {
  try {
    const iconPath = getIconPath();
    const icon = fs.existsSync(iconPath)
      ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
      : nativeImage.createEmpty();

    tray = new Tray(icon);
    tray.setToolTip('TypeFlow — Ambient Keyboard Sounds');
    updateTrayMenu();

    tray.on('double-click', () => {
      showWindow();
    });
  } catch (e) {
    console.warn('[TypeFlow] Tray creation failed:', e);
  }
}

function updateTrayMenu(): void {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    {
      label: 'TypeFlow',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: typingSoundsEnabled ? '🔊 Typing Sounds: ON' : '🔇 Typing Sounds: OFF',
      click: () => {
        typingSoundsEnabled = !typingSoundsEnabled;
        mainWindow?.webContents.send('typing-sounds-toggled', typingSoundsEnabled);
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: '📂 Show TypeFlow',
      click: showWindow,
    },
    { type: 'separator' },
    {
      label: '✕ Quit TypeFlow',
      click: () => {
        isQuitting = true;
        stopGlobalHook();
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
}

function showWindow(): void {
  if (!mainWindow) {
    createWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

// ─── Global keyboard hook ─────────────────────────────────────────────────────

function startGlobalHook(): void {
  if (!uiohook || hookRunning) return;
  try {
    uiohook.uIOhook.on('keydown', (event) => {
      if (!typingSoundsEnabled) return;
      // Skip modifier keys
      if (IGNORED_KEY_CODES.has(event.keycode)) return;
      // Skip if Ctrl or Alt are held (avoids intercepting shortcuts)
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      // Send key event to renderer (code only, not character)
      mainWindow?.webContents.send('global-keydown', {
        keycode: event.keycode,
        shiftKey: event.shiftKey,
      });
    });
    uiohook.uIOhook.start();
    hookRunning = true;
    console.log('[TypeFlow] Global keyboard hook started');
  } catch (e) {
    console.warn('[TypeFlow] Failed to start global hook:', e);
    hookRunning = false;
  }
}

function stopGlobalHook(): void {
  if (!uiohook || !hookRunning) return;
  try {
    uiohook.uIOhook.stop();
    hookRunning = false;
    console.log('[TypeFlow] Global keyboard hook stopped');
  } catch (e) {
    console.warn('[TypeFlow] Failed to stop global hook:', e);
  }
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

function setupIPC(): void {
  // Renderer asks for current hook status
  ipcMain.handle('get-hook-status', () => ({
    hookAvailable: uiohook !== null,
    hookRunning,
    typingSoundsEnabled,
  }));

  // Renderer requests to start/stop hook
  ipcMain.handle('set-typing-enabled', (_e, enabled: boolean) => {
    typingSoundsEnabled = enabled;
    if (enabled && !hookRunning) {
      startGlobalHook();
    } else if (!enabled && hookRunning) {
      stopGlobalHook();
    }
    updateTrayMenu();
    return { success: true, hookRunning };
  });

  // Settings persistence (main-process backed, survives app restarts)
  ipcMain.handle('load-settings', () => loadStoredSettings());
  ipcMain.handle('save-settings', (_e, data: Record<string, unknown>) => {
    saveStoredSettings(data);
    return { success: true };
  });

  // Theme info for native title bar
  ipcMain.on('theme-changed', (_e, themeId: string) => {
    void themeId; // could update tray icon color in future
  });

  // Dark mode sync
  ipcMain.handle('get-system-dark-mode', () => nativeTheme.shouldUseDarkColors);

  // Open external URLs safely
  ipcMain.on('open-external', (_e, url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
  });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  await loadUiohook();
  setupIPC();
  createWindow();
  createTray();

  // Start global hook immediately if enabled
  if (typingSoundsEnabled) {
    startGlobalHook();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // On Windows/Linux: keep running in tray
  if (process.platform !== 'darwin') {
    // Do NOT quit — stay in tray
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopGlobalHook();
});

app.on('will-quit', () => {
  stopGlobalHook();
});

