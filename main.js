const { app, BrowserWindow, session, shell, ipcMain, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// const __hxdNoop = () => {};
// console.log = __hxdNoop;
// console.warn = __hxdNoop;
// console.error = __hxdNoop;
// console.info = __hxdNoop;

// Pega versão do package.json ou do app
const APP_VERSION = app.getVersion() || '1.0.0';

// Define userData path único por versão para evitar conflitos
const userDataPath = path.join(app.getPath('appData'), 'haxball-app', APP_VERSION);
app.setPath('userData', userDataPath);

console.log('[APP] Versão:', APP_VERSION);
console.log('[APP] UserData Path:', userDataPath);

// FLAGS DE PERFORMANCE
app.disableHardwareAcceleration();

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

let mainWindow = null;
let server = null;
let currentZoomPercent = 100;

const isWindows = process.platform === 'win32';

// NOVO: Extração e carregamento de extensões melhorado
function getExtensionPath() {
  const extDir = path.join(app.getPath('userData'), 'extensions');

  if (!fs.existsSync(extDir)) {
    fs.mkdirSync(extDir, { recursive: true });
  }

  return extDir;
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function extractExtensions() {
  const extDestPath = getExtensionPath();
  const extSourcePath = path.join(__dirname, 'extensions');

  console.log('[EXT] Extraindo extensões...');
  console.log('[EXT] Origem:', extSourcePath);
  console.log('[EXT] Destino:', extDestPath);

  try {
    if (!fs.existsSync(extSourcePath)) {
      console.error('[EXT] Diretório de origem não existe');
      return null;
    }

    if (fs.existsSync(extDestPath)) {
      fs.rmSync(extDestPath, { recursive: true, force: true });
    }

    fs.mkdirSync(extDestPath, { recursive: true });
    copyFolderRecursiveSync(extSourcePath, extDestPath);

    const manifestPath = path.join(extDestPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      console.error('[EXT] manifest.json não encontrado');
      return null;
    }

    processDirectoryRecursive(extDestPath);

    console.log('[EXT] Extensão extraída corretamente');
    return extDestPath;
  } catch (err) {
    console.error('[EXT] Erro extraindo extensão:', err.message);
    return null;
  }
}

function forceUTF8(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    let content;
    try {
      content = buffer.toString('utf8');
      if (content.includes('\uFFFD')) {
        throw new Error('Invalid UTF8');
      }
    } catch {
      content = buffer.toString('latin1');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    console.error('[EXT] Erro convertendo UTF-8:', err.message);
    return false;
  }
}

function processDirectoryRecursive(dir) {
  if (!fs.existsSync(dir)) {
    console.error('[EXT] Diretório não existe:', dir);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectoryRecursive(filePath);
    } else if (file.endsWith('.js')) {
      forceUTF8(filePath);
    }
  });
}

async function loadExtensionSafely(extPath) {
  if (!extPath || !fs.existsSync(extPath)) {
    console.error('[EXT] Caminho inválido:', extPath);
    return false;
  }

  try {
    const loadedExt = await session.defaultSession.extensions.loadExtension(extPath, {
      allowFileAccess: true
    });

    console.log('[EXT] Extensão carregada:', loadedExt.name);
    return true;
  } catch (err) {
    console.error('[EXT] Falha ao carregar extensão:');
    console.error('[EXT] Mensagem:', err.message);
    return false;
  }
}

// Função para mostrar indicador de zoom
function showZoomIndicator(zoomPercent) {
  if (!mainWindow || !mainWindow.webContents) return;

  const code = `
        (function() {
            var old = document.getElementById('hxd-zoom-indicator');
            if (old) old.remove();
            
            var div = document.createElement('div');
            div.id = 'hxd-zoom-indicator';
            div.textContent = 'Zoom: ${zoomPercent}%';
            div.style.cssText = 'position:fixed;top:20px;right:20px;color:#fff;padding:8px 16px;z-index:999999;font-family:"Space Grotesk",system-ui,sans-serif;font-size:14px;font-weight:400;pointer-events:none;text-shadow:0 2px 4px rgba(0,0,0,0.5);';
            document.body.appendChild(div);
            
            setTimeout(function() {
                div.style.opacity = '0';
                div.style.transition = 'opacity 0.3s ease';
                setTimeout(function() { div.remove(); }, 300);
            }, 2000);
        })();
    `;

  mainWindow.webContents.executeJavaScript(code).catch(function () {});
}

// ============================================
// CRIPTOGRAFIA - Deriva chave do sistema
// ============================================
function deriveKey() {
  const parts = [
    'HXD',
    'haxball-desktop-v1',
    Buffer.from('aGF4YmFsbC1kZXNrdG9w').toString(),
    'electron-protected',
    '2024'
  ];
  return crypto.createHash('sha256').update(parts.join('|')).digest();
}

function deriveIV(filename) {
  return crypto
    .createHash('md5')
    .update(filename + 'hxd-iv')
    .digest();
}

app.whenReady().then(async function () {
  autoUpdater.checkForUpdates();

  const extPath = extractExtensions();
  let extensionLoaded = false;

  if (extPath) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`[EXT] Tentativa ${attempt}/3 de carregar extensão...`);
      extensionLoaded = await loadExtensionSafely(extPath);

      if (extensionLoaded) break;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // 🔎 Verificación REAL
  const extensions = session.defaultSession.extensions?.getAllExtensions() || {};
  const hasExtension = Object.keys(extensions).length > 0;

  if (!extensionLoaded || !hasExtension) {
    console.error('[EXT] ❌ Extensão não carregada. Abortando exibição da janela.');
    return; // ❌ No crea la ventana
  }

  console.log('[EXT] ✓ Todas as extensões carregadas corretamente');

  // 🚀 Solo ahora creamos la ventana
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL('https://www.haxball.com/play');

  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: ['*://www.haxball.com/*/__cache_static__/g/game-min.js*']
    },
    (details, callback) => {
      console.log('[HOOK] Substituindo game-min.js:', details.url);

      callback({
        redirectURL: 'file://' + path.join(__dirname, 'extensions/game-min-original.js')
      });
    }
  );

  globalShortcut.register('Ctrl+E', function () {
    if (mainWindow) {
      mainWindow.webContents.openDevTools();
    }
  });

  const shortcut = isWindows ? 'CommandOrControl+H' : 'Ctrl+H';
  globalShortcut.register(shortcut, function () {
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
                var settingsBtn = document.querySelector('[data-hook="settings"]');
                if (settingsBtn) {
                    settingsBtn.click();
                }
            `);
    }
  });

  // Proteção: fecha DevTools se abrir (redundante mas seguro)
  // mainWindow.webContents.on('devtools-opened', function () {
  //   mainWindow.webContents.closeDevTools();
  // });

  mainWindow.webContents.once('did-finish-load', () => {
    console.log('[APP] Página carregada e extensões OK');
    mainWindow.show();
  });

  // F11 = Fullscreen (F12 bloqueado)
  mainWindow.webContents.on('before-input-event', function (e, input) {
    // Só processa eventos de teclado
    if (input.type !== 'keyDown') return;

    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }

    // Zoom In: Ctrl +
    if (input.control && input.key === '+') {
      e.preventDefault();
      currentZoomPercent += 10;
      mainWindow.webContents.setZoomFactor(currentZoomPercent / 100);
      showZoomIndicator(currentZoomPercent);
    }

    // Zoom Out: Ctrl -
    if (input.control && input.key === '-') {
      e.preventDefault();
      currentZoomPercent -= 10;
      mainWindow.webContents.setZoomFactor(currentZoomPercent / 100);
      showZoomIndicator(currentZoomPercent);
    }

    // Reset Zoom: Ctrl + 0
    if (input.control && input.key === '0') {
      e.preventDefault();
      currentZoomPercent = 100;
      mainWindow.webContents.setZoomFactor(1.0);
      showZoomIndicator(currentZoomPercent);
    }

    // F12 bloquiado
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      e.preventDefault();
    }
  });
});

app.on('window-all-closed', function () {
  app.quit();
});

app.on('will-quit', function () {
  globalShortcut.unregisterAll();
  if (server) server.close();
});

// Single instance
const lock = app.requestSingleInstanceLock();
if (!lock) {
  app.quit();
} else {
  app.on('second-instance', function () {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// IPC
ipcMain.handle('close-app', async () => {
  app.quit();
});

ipcMain.handle('get-version', async () => {
  return APP_VERSION;
});

ipcMain.handle('open-external', async (event, url) => {
  if (url) {
    shell.openExternal(url);
  }
});

ipcMain.handle('updater-check', async () => {
  const result = await autoUpdater.checkForUpdates();

  return {
    current: app.getVersion(),
    latest: result?.updateInfo?.version || app.getVersion(),
    has_update: !!result?.updateInfo
  };
});

ipcMain.handle('updater-download', async () => {
  await autoUpdater.downloadUpdate();
  return true;
});

ipcMain.handle('updater-apply', async () => {
  autoUpdater.quitAndInstall();
});
