import { createDefaultAppConfig, type AppConfig } from '@shared/appConfig';
import type { HardwareSettingsV1 } from '@shared/hardwareSettings';
import { randomBytes } from 'node:crypto';
import { app, BrowserWindow, ipcMain } from 'electron';
import type { Server } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConfigFile, writeConfigFile, paths } from './configStore';
import { addInboundRuleForPort } from './firewall';
import { readHardware, writeHardware } from './hardwareStore';
import { getLanIPv4Addresses } from './network';
import { openDatabase, type PosDatabase } from './db/database';
import { enqueueOutbox } from './db/outbox';
import { createLocalServer, startLocalServer } from './server/localServer';
import { flushOutboxToServer } from './sync/syncEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let db: PosDatabase | null = null;
let httpServer: Server | null = null;
let currentConfig: AppConfig = createDefaultAppConfig();

function getPaths() {
  return paths(app.getPath('userData'));
}

async function loadState(): Promise<void> {
  const p = getPaths();
  currentConfig = await readConfigFile(p.config);
}

function stopHttpServer(): void {
  if (httpServer) {
    httpServer.close();
    httpServer = null;
  }
}

function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

function startHttpServerIfNeeded(): void {
  stopHttpServer();
  if (!currentConfig.setupCompleted || currentConfig.mode !== 'SERVER_AND_POS') {
    return;
  }
  const p = getPaths();
  if (!db) {
    db = openDatabase(p.database);
  }
  const expressApp = createLocalServer({ config: currentConfig, db });
  httpServer = startLocalServer(expressApp, currentConfig.serverPort, '0.0.0.0');
}

function ensureDatabaseOpen(): void {
  const p = getPaths();
  if (!currentConfig.setupCompleted) return;
  if (!db) {
    db = openDatabase(p.database);
  }
}

function applyRuntimeFromConfig(): void {
  closeDatabase();
  stopHttpServer();
  if (!currentConfig.setupCompleted) return;
  ensureDatabaseOpen();
  if (currentConfig.mode === 'SERVER_AND_POS') {
    startHttpServerIfNeeded();
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
  if (isDev && rendererUrl) {
    void mainWindow.loadURL(rendererUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function ensureAuthSecret(config: AppConfig): AppConfig {
  if (config.syncAuthSecret && config.syncAuthSecret.length > 0) return config;
  return {
    ...config,
    syncAuthSecret: randomBytes(24).toString('hex'),
  };
}

function registerIpc(): void {
  ipcMain.handle('posapp:getConfig', async () => currentConfig);

  ipcMain.handle('posapp:saveConfig', async (_e, next: AppConfig) => {
    const p = getPaths();
    let merged = { ...currentConfig, ...next };
    merged = ensureAuthSecret(merged);
    await writeConfigFile(p.config, merged);
    currentConfig = merged;
    applyRuntimeFromConfig();
  });

  ipcMain.handle('posapp:getHardwareSettings', async () => {
    const p = getPaths();
    return readHardware(p.hardware);
  });

  ipcMain.handle('posapp:saveHardwareSettings', async (_e, settings: HardwareSettingsV1) => {
    const p = getPaths();
    await writeHardware(p.hardware, settings);
  });

  ipcMain.handle('posapp:getLanAddresses', async () => getLanIPv4Addresses());

  ipcMain.handle('posapp:applyFirewallRule', async (_e, port: number) => {
    return addInboundRuleForPort(port);
  });

  ipcMain.handle('posapp:syncNow', async () => {
    ensureDatabaseOpen();
    if (!db) return { ok: false, error: 'Database not ready' };
    const base =
      currentConfig.mode === 'POS_ONLY'
        ? currentConfig.serverHostUrl
        : `http://127.0.0.1:${currentConfig.serverPort}`;
    return flushOutboxToServer(db, {
      baseUrl: base,
      authSecret: currentConfig.syncAuthSecret,
    });
  });

  ipcMain.handle('posapp:enqueueTestOutbox', async () => {
    ensureDatabaseOpen();
    if (!db) return { ok: false };
    const id = enqueueOutbox(db, { type: 'test', at: new Date().toISOString() });
    return { ok: true, id };
  });
}

app.whenReady().then(() => {
  void (async () => {
    await loadState();
    applyRuntimeFromConfig();
    registerIpc();
    createWindow();
  })();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopHttpServer();
    closeDatabase();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopHttpServer();
  closeDatabase();
});
