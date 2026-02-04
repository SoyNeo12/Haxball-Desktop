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

// ============================================
// PROTEÇÃO ANTI-TAMPERING
// ============================================
(function () {
  // Detecta se está rodando em ambiente de debug/análise
  // Verifica integridade do processo
  // // Verifica se ASAR foi extraído
  // var _0x3 = function () {
  //   try {
  //     // Se conseguir listar o diretório pai do __dirname, pode estar extraído
  //     var parent = path.dirname(__dirname);
  //     if (parent.indexOf('app.asar') === -1 && app.isPackaged) {
  //       // Verifica se existe pasta 'app' ao lado (sinal de extração)
  //       var appFolder = path.join(path.dirname(process.execPath), 'resources', 'app');
  //       if (fs.existsSync(appFolder) && fs.statSync(appFolder).isDirectory()) {
  //         return true;
  //       }
  //     }
  //   } catch (e) {}
  //   return false;
  // };
  // // Executa verificações periodicamente
  // setInterval(function () {
  //   if (_0x1() || _0x2() || _0x3()) {
  //     app.quit();
  //     process.exit(1);
  //   }
  // }, 3000);
  // // Verifica na inicialização
  // if (_0x2() || _0x3()) {
  //   app.quit();
  //   process.exit(1);
  // }
})();

// ============================================
// DISCORD OAUTH2 CONFIG (mesmo do Chromium)
// ============================================
const DISCORD_CLIENT_ID = '1352869838590054410';
const DISCORD_REDIRECT_URI = 'http://localhost:5483/callback';
const DISCORD_SCOPES = 'identify guilds.members.read';
const DISCORD_VERIFIED_ROLE_ID = '1449751425637814374';
const DISCORD_WHITELIST_ROLE_ID = '1449799574502768711';
const API_URL = 'https://gqyvzdqstfgoxwjrxbnl.supabase.co/functions/v1/api';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeXZ6ZHFzdGZnb3h3anJ4Ym5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Njg1MzksImV4cCI6MjA4NDM0NDUzOX0.38cRl586HYUVU6ONlKR1kbpIAU99XzQnXmH-X2M84ts';
const SUPABASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`
};
let currentUser = null;
let myTeam = null;

// ============================================
// PERSISTÊNCIA DO LOGIN
// ============================================
function getUserDataPath() {
  return path.join(app.getPath('userData'), 'user.dat');
}

function saveUserSession(user) {
  try {
    const data = JSON.stringify(user);
    const key = crypto.createHash('sha256').update('hxd-session-key').digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const toSave = Buffer.concat([iv, encrypted]).toString('base64');
    fs.writeFileSync(getUserDataPath(), toSave);
  } catch (e) {}
}

function loadUserSession() {
  try {
    const filePath = getUserDataPath();
    if (!fs.existsSync(filePath)) return null;

    const saved = fs.readFileSync(filePath, 'utf8');
    const buffer = Buffer.from(saved, 'base64');
    const iv = buffer.slice(0, 16);
    const encrypted = buffer.slice(16);

    const key = crypto.createHash('sha256').update('hxd-session-key').digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return JSON.parse(decrypted.toString('utf8'));
  } catch (e) {
    return null;
  }
}

function clearUserSession() {
  try {
    const filePath = getUserDataPath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {}
}

// HTTPS REQUESTS
function httpsRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }

        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) req.write(body);
    req.end();
  });
}

// ============================================
// PROTEÇÃO: Bloqueia flags de debug
// ============================================
const blockedArgs = ['--inspect', '--inspect-brk', '--remote-debugging-port', '--remote-debugging-address'];
for (let i = 0; i < process.argv.length; i++) {
  for (let j = 0; j < blockedArgs.length; j++) {
    if (process.argv[i].indexOf(blockedArgs[j]) !== -1) {
      app.quit();
      process.exit(1);
    }
  }
}

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
let tempExtPath = null;
let decryptedGameCode = null;
let currentZoomPercent = 100;
const PORT = 5483;

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
// SUPABASE - Busca/cria usuário e verifica VIP
// ============================================
async function processSupabaseUser(discordId, discordName, discordUsername, isVerified, isWhitelisted, _accessToken) {
  const https = require('https');

  // Helper para fazer requests HTTPS
  function apiRequest(method, endpoint, data = null) {
    return new Promise((resolve, _reject) => {
      const url = new URL(API_URL + endpoint);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: { 'Content-Type': 'application/json', ...SUPABASE_HEADERS }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.setTimeout(10000, () => {
        req.destroy();
        resolve(null);
      });

      if (data) {
        const postData = JSON.stringify(data);
        req.setHeader('Content-Length', Buffer.byteLength(postData));
        req.write(postData);
      }
      req.end();
    });
  }

  try {
    // 1. Busca usuário existente
    let user = await apiRequest('GET', `/user?discord_id=${discordId}`);

    // 2. Se não existe, cria
    if (!user || !user.discord_id) {
      user = await apiRequest('POST', '/user', {
        discord_id: discordId,
        discord_name: discordName,
        username: discordUsername,
        is_verified: isVerified,
        is_whitelisted: isWhitelisted
      });
    } else {
      // Atualiza dados do usuário
      await apiRequest('PATCH', `/user?discord_id=${discordId}`, {
        discord_name: discordName,
        username: discordUsername,
        is_verified: isVerified || user.is_verified,
        is_whitelisted: isWhitelisted || user.is_whitelisted
      });
    }

    // 3. Verifica status VIP/Pro
    const vipStatus = await apiRequest('GET', `/vip/status?discord_id=${discordId}`);

    // 4. Atualiza presença (online)
    await apiRequest('POST', '/presence', {
      discord_id: discordId,
      discord_name: discordName,
      is_online: true
    });

    return {
      is_verified: user?.is_verified || isVerified,
      is_whitelisted: user?.is_whitelisted || isWhitelisted,
      is_banned: user?.is_banned || false,
      is_pro: vipStatus?.is_pro || false,
      is_vip: vipStatus?.is_vip || false
    };
  } catch (e) {
    return {
      is_verified: isVerified,
      is_whitelisted: isWhitelisted,
      is_banned: false,
      is_pro: false,
      is_vip: false
    };
  }
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

function loadMyTeam() {
  if (!currentUser || !currentUser.discord_id) {
    myTeam = null;
    return;
  }

  const https = require('https');
  const url = new URL(`${API_URL}/teams/user?discord_id=${currentUser.discord_id}`);

  const req = https.request(
    {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: SUPABASE_HEADERS
    },
    (apiRes) => {
      let responseData = '';
      apiRes.on('data', (c) => (responseData += c));
      apiRes.on('end', () => {
        try {
          const data = JSON.parse(responseData);
          if (data && data.id) {
            myTeam = data;
          } else {
            myTeam = null;
          }
        } catch (e) {
          myTeam = null;
        }
      });
    }
  );

  req.on('error', () => {
    myTeam = null;
  });

  req.end();
}

app.whenReady().then(async function () {
  // Carrega sessão salva (se existir)
  currentUser = loadUserSession();

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

  // Descriptografa código do game em memória (uma vez só)
  decryptedGameCode = decryptGameCode(extPath);
  if (!decryptedGameCode) {
    app.quit();
    return;
  }

  // Servidor HTTP
  server = https.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    var urlParts = req.url.split('?');
    var url = urlParts[0];
    var queryString = urlParts[1] || '';

    // Handler do callback do Discord OAuth
    if (url === '/callback') {
      (async () => {
        const params = new URLSearchParams(queryString);
        const code = params.get('code');
        const error = params.get('error');
        const state = params.get('state');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

        if (error) {
          return res.end(`
        <html><body><h2>Login cancelado</h2><p>Você pode fechar esta janela</p></body></html>
      `);
        }

        if (!code) {
          return res.end('<html><body><h2>Erro: Código não encontrado</h2></body></html>');
        }

        if (!state || state !== oauthState) {
          return res.end('<html><body><h2>Erro: Estado OAuth inválido</h2></body></html>');
        }

        try {
          const tokenResponse = await httpsRequest(
            `${API_URL}/discord/token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...SUPABASE_HEADERS
              }
            },
            JSON.stringify({ code, redirect_uri: DISCORD_REDIRECT_URI })
          );

          const accessToken = tokenResponse.access_token;

          if (!accessToken) {
            throw new Error('Token não recebido');
          }

          const user = await httpsRequest(`${API_URL}/discord/user`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ...SUPABASE_HEADERS
            }
          });

          const discordId = user.id;
          const globalName = user.global_name || user.username;
          const discordUsername = user.username;

          let isVerified = false;
          let isWhitelisted = false;

          try {
            const rolesResponse = await httpsRequest(`${API_URL}/discord/guilds/member`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                ...SUPABASE_HEADERS
              }
            });

            const roles = rolesResponse.roles || [];
            isVerified = roles.includes(DISCORD_VERIFIED_ROLE_ID);
            isWhitelisted = roles.includes(DISCORD_WHITELIST_ROLE_ID);
          } catch {
            console.warn('[OAuth] Falha ao buscar roles, continuando...');
          }

          const supabaseData = await processSupabaseUser(
            discordId,
            globalName,
            discordUsername,
            isVerified,
            isWhitelisted,
            accessToken
          ).catch(() => null);

          const finalData = supabaseData || {};

          currentUser = {
            logged_in: true,
            discord_id: discordId,
            nick: globalName,
            username: discordUsername,
            is_verified: finalData.is_verified ?? isVerified,
            is_whitelisted: finalData.is_whitelisted ?? isWhitelisted,
            is_pro: finalData.is_pro ?? false,
            is_vip: finalData.is_vip ?? false,
            is_banned: finalData.is_banned ?? false,
            access_token: accessToken
          };

          if (currentUser.is_banned) {
            currentUser = null;
            clearUserSession();
            return res.end(`
          <html><body><h2>Acesso Negado</h2><p>Você está banido.</p></body></html>
        `);
          }

          saveUserSession(currentUser);
          loadMyTeam();

          return res.end(`
        <html><body>
        <h2>Login realizado com sucesso!</h2>
        <p>Bem-vindo, ${globalName}!</p>
        <p>Você pode fechar esta janela</p>
        </body></html>
      `);
        } catch (err) {
          console.error('[OAuth Error]', err.message);
          return res.end('<html><body><h2>Erro durante autenticação</h2></body></html>');
        }
      })();

      return;
    }

    // Serve o game-min.js com proteção HARDCORE
    if (url === '/game-min.js') {
      if (!decryptedGameCode) {
        res.writeHead(500);
        res.end('Error');
        return;
      }

      var loader = generateProtectedLoader(decryptedGameCode);

      res.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-store'
      });
      res.end(loader);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });

    // Endpoint /auth - abre o navegador com a URL do Discord OAuth
    if (url === '/auth') {
      var authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(DISCORD_SCOPES)}`;
      shell.openExternal(authUrl);
      res.end('{"ok":true}');
      return;
    }

    if (url === '/user') {
      if (currentUser) {
        res.end(JSON.stringify(currentUser));
      } else {
        res.end('{"logged_in":false}');
      }
    } else if (url === '/version') res.end(JSON.stringify({ version: APP_VERSION }));
    // ============================================
    // VIP/PRO ENDPOINTS - Proxy para Supabase
    // ============================================
    else if (url === '/vip/status') {
      if (currentUser && currentUser.discord_id) {
        proxyGet(`/vip/status?discord_id=${currentUser.discord_id}`, res, (data) => {
          if (data) {
            currentUser.is_pro = data.is_pro || false;
            currentUser.is_vip = data.is_vip || false;
          }
        });
      } else {
        res.end('{"is_vip":false,"is_pro":false}');
      }
      return;
    } else if (url === '/vip/settings') {
      if (req.method === 'POST') {
        // Salvar settings
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          if (!currentUser || !currentUser.discord_id) {
            res.end('{"success":false,"error":"Not logged in"}');
            return;
          }
          try {
            const settings = JSON.parse(body);
            settings.discord_id = currentUser.discord_id;
            proxyPost('/vip/settings', settings, res);
          } catch (e) {
            res.end('{"success":false}');
          }
        });
        return;
      } else {
        // Buscar settings
        if (currentUser && currentUser.discord_id) {
          proxyGet(`/vip/settings?discord_id=${currentUser.discord_id}`, res);
        } else {
          res.end('{}');
        }
        return;
      }
    } else if (url === '/vip/check-boost') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"is_booster":false,"error":"Not logged in"}');
          return;
        }
        const data = {
          discord_id: currentUser.discord_id,
          access_token: currentUser.access_token || ''
        };
        proxyPost('/vip/check-boost', data, res);
      });
      return;
    }

    // ============================================
    // PRESENCE ENDPOINTS
    // ============================================
    else if (url === '/presence') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"ok":true}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.discord_id = currentUser.discord_id;
          data.discord_name = currentUser.nick;
          proxyPost('/presence', data, res);
        } catch (e) {
          res.end('{"ok":true}');
        }
      });
      return;
    }

    // ============================================
    // SESSION ENDPOINTS
    // ============================================
    else if (url === '/session/player-id') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":true}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.discord_id = currentUser.discord_id;
          proxyPost('/presence/player-id', data, res);
        } catch (e) {
          res.end('{"success":true}');
        }
      });
      return;
    } else if (url === '/session/game-nick') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":true}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.discord_id = currentUser.discord_id;
          proxyPost('/presence/game-nick', data, res);
        } catch (e) {
          res.end('{"success":true}');
        }
      });
      return;
    } else if (url === '/session/leave-room') {
      if (currentUser && currentUser.discord_id) {
        proxyPost('/presence/player-id', { discord_id: currentUser.discord_id, player_id: null }, res);
      } else {
        res.end('{"success":true}');
      }
      return;
    }

    // ============================================
    // VERIFIED ENDPOINTS
    // ============================================
    else if (url === '/verified-v2') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          proxyPost('/verified-v2', data, res);
        } catch (e) {
          res.end('{}');
        }
      });
      return;
    }

    // ============================================
    // FRIENDS ENDPOINTS (compatibilidade com frontend)
    // ============================================
    // GET lista de amigos
    else if (url === '/friends') {
      if (currentUser && currentUser.discord_id) {
        proxyGet(`/friends?discord_id=${currentUser.discord_id}`, res);
      } else {
        res.end('[]');
      }
      return;
    }

    // GET solicitações pendentes (compatível)
    else if (url === '/friends/requests') {
      if (currentUser && currentUser.discord_id) {
        proxyGet(`/friends/requests?discord_id=${currentUser.discord_id}`, res);
      } else {
        res.end('[]');
      }
      return;
    }

    // GET busca (ex: /friends/search?q=...)
    else if (url === '/friends/search') {
      const params = new URLSearchParams(queryString);
      const query = params.get('q');
      if (!query || query.length < 2) {
        res.end('[]');
        return;
      }
      // Faz proxy para /users/search (rota que já existe)
      proxyGet(`/users/search?q=${encodeURIComponent(query)}`, res);
      return;
    }

    // GET usuário por username/discord_id (ex: /friends/user?username=...)
    else if (url === '/friends/user') {
      const params = new URLSearchParams(queryString);
      const username = params.get('username');
      const discordId = params.get('discord_id');

      if (!username && !discordId) {
        res.end('null');
        return;
      }

      // Busca por username: usa /users/search e pega o primeiro resultado
      if (username) {
        proxyGet(`/users/search?q=${encodeURIComponent(username)}`, res, (data) => {
          // Transforma array em objeto único (busca exata por username)
          if (Array.isArray(data) && data.length > 0) {
            const exactMatch = data.find((u) => u.username === username);
            return exactMatch || null;
          }
          return null;
        });
      }
      // Busca por discord_id: usa /user
      else {
        proxyGet(`/user?discord_id=${encodeURIComponent(discordId)}`, res);
      }
      return;
    }

    // POST enviar solicitação (compatível com frontend '/friends/requests/send')
    else if (url === '/friends/requests/send') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":false,"error":"Usuário não autenticado"}');
          return;
        }
        try {
          const data = JSON.parse(body);

          // Validação básica: verifica se to_discord_id foi fornecido
          if (!data.to_discord_id || data.to_discord_id === '') {
            res.end('{"success":false,"error":"ID do destinatário não fornecido"}');
            return;
          }

          data.from_discord_id = currentUser.discord_id;
          data.from_discord_name = currentUser.nick;
          proxyPost('/friends/request', data, res);
        } catch (e) {
          console.error('Erro ao processar solicitação de amizade:', e);
          res.end('{"success":false,"error":"Erro ao processar solicitação"}');
        }
      });
      return;
    }

    // POST aceitar solicitação (compatível com frontend '/friends/requests/accept')
    else if (url === '/friends/requests/accept') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":false}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.user_discord_id = currentUser.discord_id;
          proxyPost('/friends/accept', data, res);
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    }

    // POST recusar solicitação (compatível com frontend '/friends/requests/reject')
    else if (url === '/friends/requests/reject') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          proxyPost('/friends/reject', data, res);
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    }

    // POST remover amigo (compatível com frontend '/friends/remove')
    else if (url === '/friends/remove') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const userId = data.user_discord_id || (currentUser && currentUser.discord_id);
          const friendId = data.friend_discord_id;

          if (userId && friendId) {
            proxyDelete(`/friends?user_id=${userId}&friend_id=${friendId}`, res);
          } else {
            res.end('{"success":false}');
          }
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    }

    // Backwards-compat: rota antiga singular '/friends/request'
    else if (url === '/friends/request') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":false}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.from_discord_id = currentUser.discord_id;
          data.from_discord_name = currentUser.nick;
          proxyPost('/friends/request', data, res);
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    }

    // ============================================
    // TEAMS ENDPOINTS
    // ============================================
    else if (url === '/teams/invites') {
      if (currentUser && currentUser.discord_id) {
        proxyGet(`/teams/invites?discord_id=${currentUser.discord_id}`, res);
      } else {
        res.end('[]');
      }
      return;
    } else if (url === '/teams/user' || url === '/teams/my') {
      if (currentUser && currentUser.discord_id) {
        proxyGet(`/teams/user?discord_id=${currentUser.discord_id}`, res);
      } else {
        res.end('null');
      }
      return;
    } else if (url === '/teams/members') {
      if (currentUser && currentUser.discord_id) {
        proxyGet(`/teams/members?team_id=${myTeam?.id}`, res);
      } else {
        res.end('[]');
      }
      return;
    } else if (url === '/teams/create') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":false,"error":"Not logged in"}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.owner_discord_id = currentUser.discord_id;
          data.owner_discord_name = currentUser.nick;
          proxyPostWithCallback('/teams', data, res, function (response) {
            if (response) {
              try {
                const result = JSON.parse(response);
                if (result.success && result.team) {
                  myTeam = result.team;
                }
              } catch (e) {}
            }
          });
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    } else if (url === '/teams/delete') {
      if (currentUser && currentUser.discord_id) {
        proxyDeleteWithCallback(
          `/teams?team_id=${myTeam?.id}&owner_discord_id=${currentUser.discord_id}`,
          res,
          function (response) {
            if (response) {
              try {
                const result = JSON.parse(response);
                if (result.success) {
                  myTeam = null;
                }
              } catch (e) {}
            }
          }
        );
      } else {
        res.end('{"success":false}');
      }
      return;
    } else if (url === '/teams/by-nicks') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          proxyPost('/teams/by-nicks', data, res);
        } catch (e) {
          res.end('{}');
        }
      });
      return;
    } else if (url === '/teams/invite') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id || !myTeam) {
          res.end('{"success":false}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.team_id = myTeam.id;
          data.from_discord_id = currentUser.discord_id;
          proxyPost('/teams/invite', data, res);
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    } else if (url === '/teams/invites/accept') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":false}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.discord_id = currentUser.discord_id;
          proxyPostWithCallback('/teams/invites/accept', data, res, function (response) {
            if (response) {
              try {
                const result = JSON.parse(response);
                if (result.success) {
                  loadMyTeam();
                }
              } catch (e) {}
            }
          });
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    } else if (url === '/teams/invites/reject') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          proxyPost('/teams/invites/reject', data, res);
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    } else if (url === '/teams/leave') {
      if (currentUser && currentUser.discord_id) {
        proxyPostWithCallback('/teams/leave', { discord_id: currentUser.discord_id }, res, function (response) {
          if (response) {
            try {
              const result = JSON.parse(response);
              if (result.success) {
                myTeam = null;
              }
            } catch (e) {}
          }
        });
      } else {
        res.end('{"success":false}');
      }
      return;
    } else if (url === '/teams/update') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":false}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.discord_id = currentUser.discord_id;
          proxyPostWithCallback('/teams/update', data, res, function (response) {
            if (response) {
              try {
                const result = JSON.parse(response);
                if (result.success && result.team) {
                  myTeam = result.team;
                }
              } catch (e) {}
            }
          });
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    } else if (url === '/teams/logo') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        if (!currentUser || !currentUser.discord_id) {
          res.end('{"success":false}');
          return;
        }
        try {
          const data = JSON.parse(body);
          data.discord_id = currentUser.discord_id;
          proxyPostWithCallback('/teams/logo', data, res, function (response) {
            if (response) {
              try {
                const result = JSON.parse(response);
                if (result.success && result.logo_url) {
                  if (myTeam) myTeam.logo_url = result.logo_url;
                }
              } catch (e) {}
            }
          });
        } catch (e) {
          res.end('{"success":false}');
        }
      });
      return;
    }

    // ============================================
    // USER SEARCH
    // ============================================
    else if (url.startsWith('/user/by-nick')) {
      const nick = params.get('nick');
      if (nick) {
        proxyGet(`/users/search?q=${encodeURIComponent(nick)}`, res, (data) => {
          // Retorna primeiro resultado ou null
          if (Array.isArray(data) && data.length > 0) {
            return data[0];
          }
          return null;
        });
      } else {
        res.end('null');
      }
      return;
    } else if (url.startsWith('/users/search')) {
      const q = params.get('q');
      if (q) {
        proxyGet(`/users/search?q=${encodeURIComponent(q)}`, res);
      } else {
        res.end('[]');
      }
      return;
    }

    // ============================================
    // OTHER ENDPOINTS
    // ============================================
    else if (url === '/check-update') res.end('{"has_update":false}');
    else if (url === '/status') res.end('{"ok":true}');
    else if (url === '/logout') {
      // Marca como offline no Supabase
      if (currentUser && currentUser.discord_id) {
        proxyPost(
          '/presence',
          {
            discord_id: currentUser.discord_id,
            is_online: false
          },
          { end: () => {} }
        ); // Fire and forget
      }
      currentUser = null;
      clearUserSession();
      res.end('{"ok":true}');
      return;
    } else res.end('{"ok":true}');
  });
  server.listen(PORT, '127.0.0.1');

  // Registra protocol customizado pra servir game-min.js da memória
  session.defaultSession.webRequest.onBeforeRequest(function (details, callback) {
    if (details.url.indexOf('game-min.js') !== -1) {
      callback({ redirectURL: 'hxd://game-min.js' });
    } else {
      callback({});
    }
  });

  // Cria janela
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

ipcMain.handle('backend:getUsers', async () => {
  const res = await fetch('http://localhost:3000/users');
  return res.json();
});

ipcMain.handle('backend:addUser', async (event, user) => {
  const res = await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  return res.json();
});

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
