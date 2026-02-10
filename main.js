const { app, BrowserWindow, session, shell, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

// const __hxdNoop = () => {};
// console.log = __hxdNoop;
// console.warn = __hxdNoop;
// console.error = __hxdNoop;
// console.info = __hxdNoop;

// Pega versão do package.json ou do app
const APP_VERSION = app.getVersion() || '1.2.3';

// Define userData path único por versão para evitar conflitos
const userDataPath = path.join(app.getPath('appData'), 'HaxBall Desktop', APP_VERSION);
app.setPath('userData', userDataPath);

console.log('[APP] Versão:', APP_VERSION);
console.log('[APP] UserData Path:', userDataPath);

const API_URL = 'https://gqyvzdqstfgoxwjrxbnl.supabase.co/functions/v1/api';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeXZ6ZHFzdGZnb3h3anJ4Ym5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Njg1MzksImV4cCI6MjA4NDM0NDUzOX0.38cRl586HYUVU6ONlKR1kbpIAU99XzQnXmH-X2M84ts';
const SUPABASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`
};

// ============================================
// FLAGS DE PERFORMANCE
// ============================================
app.disableHardwareAcceleration();

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

// ============================================
// FIX CORS - Private Network Access
// ============================================
app.commandLine.appendSwitch(
  'disable-features',
  'PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'
);

let mainWindow = null;
let server = null;
let currentZoomPercent = 100;

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

// Descriptografa o game.enc em memória
function decryptGameCode(extPath) {
  var encPath = path.join(extPath, 'game.enc');
  var plainPath = path.join(extPath, 'game-min-original.js');

  // Se existe arquivo criptografado, usa ele
  if (fs.existsSync(encPath)) {
    try {
      var encData = fs.readFileSync(encPath, 'utf8');
      var encrypted = Buffer.from(encData, 'base64');
      var key = deriveKey();
      var iv = deriveIV('game-min-original.js');
      var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      var decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (e) {
      // Erro silencioso
    }
  }

  // Fallback: usa arquivo plain (dev mode)
  if (fs.existsSync(plainPath)) {
    return fs.readFileSync(plainPath, 'utf8');
  }

  return null;
}

// ============================================
// PROTEÇÃO HARDCORE - Múltiplas camadas
// ============================================
function generateProtectedLoader(code) {
  // Gera nomes de variáveis aleatórios
  var chars = 'abcdefghijklmnopqrstuvwxyz';
  function rv() {
    var r = '_';
    for (var j = 0; j < 6; j++) r += chars[Math.floor(Math.random() * 26)];
    return r;
  }

  // Gera chave XOR aleatória (muda a cada request!)
  var xorKey = Math.floor(Math.random() * 200) + 50;

  // 1. Aplica XOR em cada byte e converte pra string em chunks
  var xoredStr = '';
  for (var i = 0; i < code.length; i++) {
    xoredStr += String.fromCharCode(code.charCodeAt(i) ^ xorKey);
  }

  // 2. Converte pra base64
  var b64 = Buffer.from(xoredStr, 'binary').toString('base64');

  // 3. Divide em chunks pequenos e embaralha a ordem
  var chunkSize = 3000;
  var chunks = [];
  for (var i = 0; i < b64.length; i += chunkSize) {
    chunks.push({ idx: chunks.length, data: b64.slice(i, i + chunkSize) });
  }

  // Embaralha os chunks
  var shuffled = chunks.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Gera variáveis
  var vKey = rv(),
    vResult = rv(),
    vI = rv();
  var vB64 = rv(),
    vXored = rv(),
    vEl = rv();
  var vOrder = rv(),
    vChunks = rv();

  // Monta o array de chunks embaralhados com índices
  var chunksCode = shuffled
    .map(function (c) {
      return '[' + c.idx + ',"' + c.data + '"]';
    })
    .join(',');

  // Gera números ofuscados
  function obfNum(n) {
    var a = Math.floor(Math.random() * 1000);
    return '(' + (n + a) + '-' + a + ')';
  }

  // Loader com múltiplas camadas de proteção
  var loader =
    '(function(){' +
    // Dados embaralhados
    'var ' +
    vChunks +
    '=[' +
    chunksCode +
    '];' +
    // Reordena chunks
    'var ' +
    vOrder +
    '=new Array(' +
    vChunks +
    '.length);' +
    'for(var ' +
    vI +
    '=0;' +
    vI +
    '<' +
    vChunks +
    '.length;' +
    vI +
    '++){' +
    vOrder +
    '[' +
    vChunks +
    '[' +
    vI +
    '][0]]=' +
    vChunks +
    '[' +
    vI +
    '][1];' +
    '}' +
    // Junta chunks
    'var ' +
    vB64 +
    '=' +
    vOrder +
    '["join"]("");' +
    // Decode base64
    'var ' +
    vXored +
    '=atob(' +
    vB64 +
    ');' +
    // Chave XOR (ofuscada)
    'var ' +
    vKey +
    '=' +
    obfNum(xorKey) +
    ';' +
    // Aplica XOR reverso
    'var ' +
    vResult +
    '="";' +
    'for(var ' +
    vI +
    '=0;' +
    vI +
    '<' +
    vXored +
    '.length;' +
    vI +
    '++){' +
    vResult +
    '+=String["fromCharCode"](' +
    vXored +
    '.charCodeAt(' +
    vI +
    ')^' +
    vKey +
    ');' +
    '}' +
    // Executa via script element
    'var ' +
    vEl +
    '=document["createElement"]("script");' +
    vEl +
    '["textContent"]=' +
    vResult +
    ';' +
    'document["head"]["appendChild"](' +
    vEl +
    ');' +
    vEl +
    '["remove"]();' +
    '})();';

  return loader;
}

// ============================================
// PROXY HELPERS - Encaminha requests para Supabase
// ============================================
function proxyGet(endpoint, res, transform = null) {
  const https = require('https');
  const url = new URL(API_URL + endpoint);

  https
    .get(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers: { 'Content-Type': 'application/json', ...SUPABASE_HEADERS }
      },
      (apiRes) => {
        let data = '';
        apiRes.on('data', (c) => (data += c));
        apiRes.on('end', () => {
          try {
            let parsed = JSON.parse(data);
            if (transform) {
              const transformed = transform(parsed);
              if (transformed !== undefined) {
                res.end(JSON.stringify(transformed));
                return;
              }
            }
            res.end(data);
          } catch (e) {
            res.end('null');
          }
        });
      }
    )
    .on('error', () => {
      res.end('null');
    });
}

function proxyPost(endpoint, data, res) {
  const https = require('https');
  const url = new URL(API_URL + endpoint);
  const postData = JSON.stringify(data);

  const req = https.request(
    {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...SUPABASE_HEADERS
      }
    },
    (apiRes) => {
      let responseData = '';
      apiRes.on('data', (c) => (responseData += c));
      apiRes.on('end', () => {
        try {
          res.end(responseData);
        } catch (e) {
          res.end('{"success":false}');
        }
      });
    }
  );

  req.on('error', () => {
    res.end('{"success":false}');
  });

  req.write(postData);
  req.end();
}

function proxyDelete(endpoint, res) {
  const https = require('https');
  const url = new URL(API_URL + endpoint);

  const req = https.request(
    {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...SUPABASE_HEADERS
      }
    },
    (apiRes) => {
      let responseData = '';
      apiRes.on('data', (c) => (responseData += c));
      apiRes.on('end', () => {
        try {
          res.end(responseData);
        } catch (e) {
          res.end('{"success":false}');
        }
      });
    }
  );

  req.on('error', () => {
    res.end('{"success":false}');
  });

  req.end();
}

function proxyDeleteWithCallback(endpoint, res, callback) {
  const https = require('https');
  const url = new URL(API_URL + endpoint);

  const req = https.request(
    {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...SUPABASE_HEADERS
      }
    },
    (apiRes) => {
      let responseData = '';
      apiRes.on('data', (c) => (responseData += c));
      apiRes.on('end', () => {
        try {
          res.end(responseData);
          if (callback) callback(responseData);
        } catch (e) {
          res.end('{"success":false}');
          if (callback) callback(null);
        }
      });
    }
  );

  req.on('error', () => {
    res.end('{"success":false}');
    if (callback) callback(null);
  });

  req.end();
}

function proxyPostWithCallback(endpoint, data, res, callback) {
  const https = require('https');
  const url = new URL(API_URL + endpoint);
  const postData = JSON.stringify(data);

  const req = https.request(
    {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...SUPABASE_HEADERS
      }
    },
    (apiRes) => {
      let responseData = '';
      apiRes.on('data', (c) => (responseData += c));
      apiRes.on('end', () => {
        try {
          res.end(responseData);
          if (callback) callback(responseData);
        } catch (e) {
          res.end('{"success":false}');
          if (callback) callback(null);
        }
      });
    }
  );

  req.on('error', () => {
    res.end('{"success":false}');
    if (callback) callback(null);
  });

  req.write(postData);
  req.end();
}

app.whenReady().then(async function () {
  const extPath = extractExtensions();

  if (extPath) {
    tempExtPath = extPath;

    let loaded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`[EXT] Tentativa ${attempt}/3 de carregar extensão...`);
      loaded = await loadExtensionSafely(extPath);

      if (loaded) break;

      if (attempt < 3) {
        console.log('[EXT] Aguardando 1 segundo antes de tentar novamente....');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!loaded) {
      console.error('[EXT] A extensão não pôde ser carregada após 3 tentativas.');
    }
  } else {
    console.error('[EXT] Não foi possível extrair a extensão.');
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'HaxBall Desktop',
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setMenu(null);

  globalShortcut.register('Ctrl+E', function () {
    if (mainWindow) {
      mainWindow.webContents.openDevTools();
    }
  });

  globalShortcut.register('CommandOrControl+H', function () {
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

  // Click direito é controlado pela extensão security.js
  // Permite em: lista de salas, jogadores individuais
  // Bloqueia no resto

  mainWindow.once('ready-to-show', function () {
    mainWindow.show();

    // Verifica se extensões foram carregadas após 3 segundos
    setTimeout(function () {
      const extensions = session.defaultSession.extensions?.getAllExtensions() || {};
      const extensionsList = [];

      for (let id in extensions) {
        extensionsList.push(extensions[id].name);
        console.log('[EXT] Extensão activa:', extensions[id].name, 'ID:', id);
      }

      if (extensionsList.length === 0) {
        console.error('[EXT] ⚠️ Nenhuma extensão foi carregada!');

        mainWindow.webContents
          .executeJavaScript(
            `
          setTimeout(function() {
            var div = document.createElement('div');
            div.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ff4444;color:#fff;padding:15px 25px;border-radius:8px;z-index:999999;font-family:system-ui;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
            div.innerHTML = '<strong>⚠️ Extensões não carregadas!</strong><br>O HaxBall Desktop pode não funcionar corretamente.<br><small>Tente reiniciar o aplicativo.</small>';
            document.body.appendChild(div);
            setTimeout(function() { div.remove(); }, 10000);
          }, 2000);
        `
          )
          .catch(() => {});
      } else {
        console.log('[EXT] ✓ Extensões carregadas:', extensionsList.join(', '));
      }
    }, 3000);
  });

  // F11 = Fullscreen (F12 bloqueado)
  mainWindow.webContents.on('before-input-event', function (e, input) {
    // Só processa eventos de teclado
    if (input.type !== 'keyDown') return;

    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }

    // Zoom In: Ctrl + = ou Ctrl + +
    if (input.control && (input.key === '=' || input.key === '+')) {
      e.preventDefault();
      currentZoomPercent += 10;
      mainWindow.webContents.setZoomFactor(currentZoomPercent / 100);
      showZoomIndicator(currentZoomPercent);
    }

    if (input.control && input.key === '-') {
      e.preventDefault();
      currentZoomPercent -= 10;
      mainWindow.webContents.setZoomFactor(currentZoomPercent / 100);
      showZoomIndicator(currentZoomPercent);
    }

    if (input.control && input.key === '0') {
      e.preventDefault();
      currentZoomPercent = 100;
      mainWindow.webContents.setZoomFactor(1.0);
      showZoomIndicator(currentZoomPercent);
    }

    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      e.preventDefault();
    }
  });

  mainWindow.loadURL('https://www.haxball.com/play');
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

ipcMain.handle('close-app', async () => {
  app.quit();
});

ipcMain.handle('get-version', async () => {
  return APP_VERSION;
});

ipcMain.handle('get-extension-status', async () => {
  try {
    const extensions = session.defaultSession.extensions?.getAllExtensions() || {};
    const status = {
      loaded: false,
      extensions: []
    };

    for (let id in extensions) {
      const ext = extensions[id];
      status.extensions.push({
        id: id,
        name: ext.name,
        version: ext.version
      });

      if (ext.name === 'HaxBall Desktop') {
        status.loaded = true;
      }
    }

    return status;
  } catch (e) {
    return { loaded: false, error: e.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  if (url) {
    shell.openExternal(url);
  }
});
