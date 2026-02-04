// ============================================
// HEADER - Barra customizada com link de sala
// ============================================
function onDomReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

(function () {
  if (!Injector.isMainFrame()) return;
  if (window.__headerInjected) return;
  window.__headerInjected = true;

  var LOGO_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="28" height="28"><g class="logo-fill" stroke-width="0"><path d="M108 136.5c-12.5 1.9-17.5 3.5-32.5 10.6-34.6 16.2-59.1 49-66 88.3-1.7 9.5-1.9 29.7-.5 36.4.6 2.6 1.5 6.9 2.1 9.7 6.3 29.7 20.9 52.1 46.8 71.5 12.3 9.2 32.8 17.5 51.5 20.9 8.3 1.5 27.5 1.4 37.6-.3 14.6-2.4 38.3-11.6 47.9-18.7l3-2.2-2.4-3.1c-6.2-8.2-11.2-21.4-12.5-32.8-4.2-36.4 21-69.9 58-77.2l5.5-1.1-.3-3.5c-1.2-13.5-12.6-39.7-23.1-53-5.8-7.4-19.1-20.2-26.4-25.4-7.2-5.1-26.1-14.4-33.7-16.5-2.5-.8-5.6-1.7-7-2.2-8.5-2.8-33.6-3.6-48-1.4m244.5 0c-13.1 2.1-20.8 4.7-34 11.2-27 13.4-47.6 36.4-58.7 65.4-3.8 10.1-5.4 15.2-6.3 21.1-.6 4.1-.8 4 10.5 5.4 3 .3 8.6 1.8 12.4 3.1 6.7 2.4 16.8 7.9 17.4 9.5.2.4.9.8 1.6.8 1.2 0 12.6 10.9 12.6 12 0 .4.9 1.8 2.1 3.1 7.4 8.5 13.9 27.6 13.9 40.8 0 5.6-2.1 16.8-4.5 23.6-2.4 7-4.7 11.2-9.4 17.5-2.2 3-3.7 5.8-3.3 6.2 1.8 1.8 19.5 9.9 28 12.7 20.7 7.1 44.1 8.2 65.2 2.9 34.3-8.4 61.4-29.2 78.3-59.9 3.6-6.5 9.2-23.7 11.6-35.4 8.3-39.6-8-86.4-38.9-111.9-14.7-12.2-26.6-18.8-43.9-24.5-15-5-37-6.4-54.6-3.6"/><path d="M243.6 258.1c-10.4 1.7-24.4 10.7-31.6 20.4-2 2.7-5.6 10.1-7.5 15.4-2 5.8-2 22.1 0 27.9 6.8 19.5 21.1 32 40.9 35.9 19.9 3.8 43.1-8.3 52.3-27.4 8-16.6 6.5-36.9-3.8-52-4.7-6.8-9.9-11.1-18.4-15.3-11.4-5.7-19.8-7-31.9-4.9"/></g></svg>';

  var HEADER_CSS =
    '\
        .header { display: none !important; }\
        #custom-header {\
            position: fixed; top: 0; left: 0; right: 0; height: 48px;\
            background: var(--theme-bg-primary, #1A2125); border-bottom: 1px solid var(--theme-border, #232323);\
            display: flex; align-items: center; justify-content: space-between;\
            padding: 0 20px; z-index: 99999; font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;\
        }\
        [data-theme="default"] #custom-header { background: #1A2125; }\
        [data-theme="default"] #custom-header .room-link-bar { background: #2a3138; }\
        [data-theme="default"] #custom-header #room-link-input { color: #fff; }\
        [data-theme="default"] #custom-header #room-link-input::placeholder { color: #888; }\
        [data-theme="default"] #custom-header #room-link-btn { background: #3a4148; }\
        [data-theme="default"] #custom-header #room-link-btn:hover { background: #4a5158; }\
        [data-theme="default"] #lang-dropdown { background: #1A2125; border-color: #2a3138; }\
        [data-theme="default"] #lang-dropdown .lang-item { color: #fff; }\
        [data-theme="default"] #lang-dropdown .lang-item:hover { background: #2a3138; }\
        [data-theme="onix"] #custom-header { background: #000000; border-bottom-color: #1a1a1a; }\
        [data-theme="onix"] #custom-header .room-link-bar { background: #000000; }\
        [data-theme="onix"] #custom-header #room-link-input { color: #fff; }\
        [data-theme="onix"] #custom-header #room-link-input::placeholder { color: #555; }\
        [data-theme="onix"] #custom-header #room-link-btn { background: #0a0a0a; }\
        [data-theme="onix"] #custom-header #room-link-btn:hover { background: #111111; }\
        [data-theme="onix"] #lang-dropdown { background: #000000; border-color: #1a1a1a; }\
        [data-theme="onix"] #lang-dropdown .lang-item { color: #fff; }\
        [data-theme="onix"] #lang-dropdown .lang-item:hover { background: #111111; }\
        #custom-header .header-left { flex: 1; display: flex; align-items: center; }\
        #custom-header .header-left svg .logo-fill { fill: var(--theme-text-secondary, #888); }\
        #custom-header .header-center { flex: 2; display: flex; justify-content: center; }\
        #custom-header .room-link-bar {\
            display: flex; background: var(--theme-bg-secondary, #1a1a1a); border-radius: 6px;\
            overflow: hidden; width: 100%; max-width: 400px;\
        }\
        #custom-header #room-link-input {\
            flex: 1; background: transparent; border: none; padding: 8px 12px;\
            color: var(--theme-text-primary, #fff); font-size: 13px; outline: none;\
            user-select: text !important; -webkit-user-select: text !important;\
        }\
        #custom-header #room-link-input::placeholder { color: var(--theme-text-muted, #666); }\
        #custom-header #room-link-btn {\
            background: var(--theme-bg-tertiary, #272727); border: none; padding: 8px 12px;\
            color: var(--theme-text-primary, #fff); cursor: pointer; display: flex; align-items: center;\
        }\
        #custom-header #room-link-btn:hover { background: var(--theme-bg-hover, #333); }\
        #custom-header .header-right { flex: 1; display: flex; justify-content: flex-end; gap: 8px; }\
        #custom-header #discord-btn {\
            background: transparent; border: none; color: var(--theme-text-muted, #666); cursor: pointer; padding: 4px; display: flex;\
        }\
        #custom-header #discord-btn:hover { color: #5865F2; }\
        #custom-header #lang-btn {\
            background: transparent; border: none; color: var(--theme-text-muted, #666); cursor: pointer; padding: 4px; display: flex; position: relative;\
        }\
        #custom-header #lang-btn:hover { color: var(--theme-text-primary, #fff); }\
        #lang-dropdown {\
            position: absolute; top: 100%; right: 0; background: var(--theme-bg-secondary, #1a1a1a); border: 1px solid var(--theme-border-light, #333);\
            border-radius: 8px; padding: 4px; min-width: 120px; z-index: 100000; display: none; margin-top: 4px;\
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);\
        }\
        #lang-dropdown .lang-item {\
            padding: 8px 12px; cursor: pointer; color: var(--theme-text-primary, #fff); font-size: 13px; border-radius: 4px;\
            display: flex; align-items: center; gap: 8px;\
        }\
        #lang-dropdown .lang-item:hover { background: var(--theme-bg-hover, #333); }\
        #lang-dropdown .lang-item.active { color: #3B82F6; }\
        #custom-header #ghost-mode-btn {\
            background: transparent; border: none; color: var(--theme-text-muted, #666); cursor: pointer; padding: 4px; display: flex;\
        }\
        #custom-header #ghost-mode-btn:hover { color: var(--theme-text-primary, #fff); }\
        #custom-header #ghost-mode-btn.active { color: #8b5cf6; }\
        #custom-header #hide-header-btn {\
            background: transparent; border: none; color: var(--theme-text-muted, #666); cursor: pointer; padding: 4px; display: flex;\
        }\
        #custom-header #hide-header-btn:hover { color: var(--theme-text-primary, #fff); }\
        #show-header-btn {\
            position: fixed; top: 8px; left: 8px; background: transparent; border: none;\
            color: rgba(255,255,255,0.3); cursor: pointer; padding: 6px; z-index: 99999; display: none;\
        }\
        #show-header-btn:hover { color: rgba(255,255,255,0.7); }\
        html, body { margin: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }\
        [data-theme="dark"] body, [data-theme="light"] body { background: var(--theme-bg-primary) !important; }\
        .view-wrapper, .game-view { margin-top: 0 !important; padding-top: 48px !important; box-sizing: border-box !important; height: 100% !important; }\
        iframe[src*="game.html"], iframe[src*="html5.haxball"] { position: fixed !important; top: 48px !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: calc(100vh - 48px) !important; border: none !important; }\
    ';

  onDomReady(function () {
    // Desabilita tradução automática do Google
    var noTranslate = document.createElement('meta');
    noTranslate.name = 'google';
    noTranslate.content = 'notranslate';
    document.head.appendChild(noTranslate);

    // Adiciona classe notranslate no html
    document.documentElement.classList.add('notranslate');
    document.documentElement.setAttribute('translate', 'no');

    // Carrega fonte Space Grotesk na página principal
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    // Observer para detectar quando iframes são adicionados e aplicar estilos
    var iframeObserver = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (node.tagName === 'IFRAME') {
            // Aplica estilos ao iframe quando ele aparece
            var headerVisible =
              document.getElementById('custom-header') &&
              document.getElementById('custom-header').style.display !== 'none';
            var top = headerVisible ? '48px' : '0';
            var height = headerVisible ? 'calc(100vh - 48px)' : '100vh';
            node.style.cssText =
              'position: fixed !important; top: ' +
              top +
              ' !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: ' +
              height +
              ' !important; border: none !important;';
          }
        }
      }
    });
    iframeObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Aplica tema salvo no main frame
    var savedTheme = localStorage.getItem('haxball-theme') || 'dark';

    // Aplica data-theme imediatamente para evitar flash
    document.documentElement.setAttribute('data-theme', savedTheme);

    var themeColors = {
      default: null, // Tema padrão não aplica cores
      dark: {
        '--theme-bg-primary': '#141414',
        '--theme-bg-secondary': '#1a1a1a',
        '--theme-bg-tertiary': '#272727',
        '--theme-bg-hover': '#333',
        '--theme-bg-selected': '#222',
        '--theme-border': '#232323',
        '--theme-border-light': '#333',
        '--theme-text-primary': '#fff',
        '--theme-text-secondary': '#888',
        '--theme-text-muted': '#666',
        '--theme-tooltip-bg': '#222',
        '--theme-tooltip-border': '#333'
      },
      light: {
        '--theme-bg-primary': '#f5f5f5',
        '--theme-bg-secondary': '#ffffff',
        '--theme-bg-tertiary': '#e8e8e8',
        '--theme-bg-hover': '#ddd',
        '--theme-bg-selected': '#d0d0d0',
        '--theme-border': '#ccc',
        '--theme-border-light': '#ddd',
        '--theme-text-primary': '#1a1a1a',
        '--theme-text-secondary': '#666',
        '--theme-text-muted': '#999',
        '--theme-tooltip-bg': '#fff',
        '--theme-tooltip-border': '#ddd'
      },
      onix: {
        '--theme-bg-primary': '#000000',
        '--theme-bg-secondary': '#000000',
        '--theme-bg-tertiary': '#0a0a0a',
        '--theme-bg-hover': '#111111',
        '--theme-bg-selected': '#0d0d0d',
        '--theme-border': '#1a1a1a',
        '--theme-border-light': '#222222',
        '--theme-text-primary': '#ffffff',
        '--theme-text-secondary': '#888888',
        '--theme-text-muted': '#555555',
        '--theme-tooltip-bg': '#0a0a0a',
        '--theme-tooltip-border': '#1a1a1a'
      }
    };

    var allThemeVars = [
      '--theme-bg-primary',
      '--theme-bg-secondary',
      '--theme-bg-tertiary',
      '--theme-bg-hover',
      '--theme-bg-selected',
      '--theme-border',
      '--theme-border-light',
      '--theme-text-primary',
      '--theme-text-secondary',
      '--theme-text-muted',
      '--theme-tooltip-bg',
      '--theme-tooltip-border'
    ];

    if (savedTheme === 'default') {
      // Remove todas as variáveis de tema
      for (var i = 0; i < allThemeVars.length; i++) {
        document.documentElement.style.removeProperty(allThemeVars[i]);
      }
    } else {
      var colors = themeColors[savedTheme] || themeColors.dark;
      for (var key in colors) {
        document.documentElement.style.setProperty(key, colors[key]);
      }
    }
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);

    // Função para aplicar tema
    function applyThemeToMainFrame(theme) {
      if (theme === 'default') {
        // Remove todas as variáveis de tema
        for (var i = 0; i < allThemeVars.length; i++) {
          document.documentElement.style.removeProperty(allThemeVars[i]);
        }
      } else {
        var c = themeColors[theme] || themeColors.dark;
        for (var k in c) {
          document.documentElement.style.setProperty(k, c[k]);
        }
      }
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }

    // Escuta mudanças de tema do iframe
    window.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'themeChanged') {
        applyThemeToMainFrame(e.data.theme);
      }
    });

    // Escuta mudanças no localStorage (quando tema muda no iframe)
    window.addEventListener('storage', function (e) {
      if (e.key === 'haxball-theme' && e.newValue) {
        applyThemeToMainFrame(e.newValue);
      }
    });

    var oldHeader = document.querySelector('.header');
    if (oldHeader) oldHeader.style.display = 'none';
    if (document.getElementById('custom-header')) return;

    Injector.injectCSS('header-css', HEADER_CSS);

    var header = document.createElement('div');
    header.id = 'custom-header';
    header.innerHTML =
      '\
            <div class="header-left">' +
      LOGO_SVG +
      '</div>\
            <div class="header-center">\
                <div class="room-link-bar">\
                    <input type="text" id="room-link-input" data-translate-placeholder="Cole o link da sala aqui..." />\
                    <button id="room-link-btn">\
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>\
                    </button>\
                </div>\
            </div>\
            <div class="header-right">\
                <button id="lang-btn" title="Idioma">\
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>\
                </button>\
                <button id="discord-btn" title="Discord">\
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>\
                </button>\
                <button id="ghost-mode-btn" data-translate-title="Modo Anônimo">\
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>\
                </button>\
                <button id="hide-header-btn" data-translate-title="Esconder header">\
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>\
                </button>\
            </div>\
        ';
    document.body.insertBefore(header, document.body.firstChild);

    var showBtn = document.createElement('button');
    showBtn.id = 'show-header-btn';
    showBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
    document.body.appendChild(showBtn);

    setupHeaderEvents(header, showBtn);

    // Aplica traduções nos elementos do header
    applyHeaderTranslations();

    Injector.log('Header created');
  });

  function applyHeaderTranslations() {
    // Traduções locais para o main frame (translate.js roda só no game frame)
    var lang = localStorage.getItem('haxball_language') || 'pt';
    var translations = {
      'Cole o link da sala aqui...': { pt: 'Cole o link da sala aqui...', es: 'Pega el enlace de la sala aquí...' },
      'Modo Anônimo': { pt: 'Modo Anônimo', es: 'Modo Anónimo' },
      'Esconder header': { pt: 'Esconder header', es: 'Ocultar header' }
    };

    function t(key) {
      var entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry['pt'] || key;
    }

    var input = document.getElementById('room-link-input');
    if (input) {
      var placeholderKey = input.getAttribute('data-translate-placeholder');
      if (placeholderKey) input.placeholder = t(placeholderKey);
    }

    var ghostBtn = document.getElementById('ghost-mode-btn');
    if (ghostBtn) {
      var titleKey = ghostBtn.getAttribute('data-translate-title');
      if (titleKey) ghostBtn.title = t(titleKey);
    }

    var hideBtn = document.getElementById('hide-header-btn');
    if (hideBtn) {
      var titleKey2 = hideBtn.getAttribute('data-translate-title');
      if (titleKey2) hideBtn.title = t(titleKey2);
    }
  }

  function setupHeaderEvents(header, showBtn) {
    var codeRegex = /^[a-zA-Z0-9_-]{8,15}$/;
    var urlRegex = /^(https?:\/\/)?(www\.)?haxball\.com\/play\?c=([a-zA-Z0-9_-]{8,15})$/;

    // Verifica se modo anônimo está ativo
    var isGhostMode = localStorage.getItem('ghost_mode') === 'true';
    var ghostBtn = document.getElementById('ghost-mode-btn');
    if (ghostBtn && isGhostMode) {
      ghostBtn.classList.add('active');
    }

    function goToRoom() {
      var input = document.getElementById('room-link-input');
      var link = input.value.trim();
      if (!link) return;

      var roomCode = '';
      var urlMatch = link.match(urlRegex);

      if (urlMatch) {
        roomCode = urlMatch[3];
      } else if (codeRegex.test(link)) {
        roomCode = link;
      }

      if (roomCode) {
        window.location.href = 'https://www.haxball.com/play?c=' + roomCode;
      }
    }

    function updateLayout(headerVisible) {
      var top = headerVisible ? '48px' : '0';
      var height = headerVisible ? 'calc(100vh - 48px)' : '100vh';
      var padding = headerVisible ? '48px' : '0';

      // Atualiza todos os iframes possíveis
      var iframes = document.querySelectorAll('iframe[src*="game.html"], iframe[src*="html5.haxball"]');
      for (var i = 0; i < iframes.length; i++) {
        iframes[i].style.cssText =
          'position: fixed !important; top: ' +
          top +
          ' !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: ' +
          height +
          ' !important; border: none !important;';
      }

      var viewWrapper = document.querySelector('.view-wrapper');
      if (viewWrapper) viewWrapper.style.paddingTop = padding;

      var gameView = document.querySelector('.game-view');
      if (gameView) gameView.style.paddingTop = padding;
    }

    function hideHeader() {
      header.style.display = 'none';
      showBtn.style.display = 'flex';
      updateLayout(false);
    }

    function showHeaderFn() {
      header.style.display = 'flex';
      showBtn.style.display = 'none';
      updateLayout(true);
    }

    function toggleGhostMode() {
      var newMode = !isGhostMode;
      localStorage.setItem('ghost_mode', newMode.toString());

      // Atualiza visual do botão
      if (newMode) {
        ghostBtn.classList.add('active');
      } else {
        ghostBtn.classList.remove('active');
      }

      // Recarrega a página para aplicar o modo
      window.location.reload();
    }

    document.getElementById('room-link-btn').addEventListener('click', goToRoom);
    document.getElementById('room-link-input').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') goToRoom();
    });

    const discordBtn = document.getElementById('discord-btn');

    if (discordBtn) {
      discordBtn.addEventListener('click', () => {
        const url = 'https://discord.gg/EVqUSFb4CZ';

        if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
          window.electronAPI.openExternal(url);
        } else {
          console.warn('electronAPI no disponible todavía, usando fallback');
          window.open(url, '_blank');
        }
      });
    }

    // Dropdown de idiomas
    var langBtn = document.getElementById('lang-btn');
    var langDropdown = document.createElement('div');
    langDropdown.id = 'lang-dropdown';

    var currentLang = localStorage.getItem('haxball_language') || 'pt';

    langDropdown.innerHTML =
      '<div class="lang-item' +
      (currentLang === 'pt' ? ' active' : '') +
      '" data-lang="pt">Português</div>' +
      '<div class="lang-item' +
      (currentLang === 'es' ? ' active' : '') +
      '" data-lang="es">Español</div>';

    langBtn.style.position = 'relative';
    langBtn.appendChild(langDropdown);

    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      langDropdown.style.display = langDropdown.style.display === 'none' ? 'block' : 'none';
    });

    var langItems = langDropdown.querySelectorAll('.lang-item');
    for (var i = 0; i < langItems.length; i++) {
      (function (item) {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          var lang = item.getAttribute('data-lang');
          localStorage.setItem('haxball_language', lang);
          if (window.__haxSetLanguage) window.__haxSetLanguage(lang);
          langDropdown.style.display = 'none';
          // Recarrega para aplicar traduções
          window.location.reload();
        });
      })(langItems[i]);
    }

    document.addEventListener('click', function () {
      langDropdown.style.display = 'none';
    });
    document.getElementById('hide-header-btn').addEventListener('click', hideHeader);
    document.getElementById('ghost-mode-btn').addEventListener('click', toggleGhostMode);
    showBtn.addEventListener('click', showHeaderFn);

    // Atalho de teclado ' para toggle da header
    function handleToggleHeader() {
      if (header.style.display === 'none') {
        showHeaderFn();
      } else {
        hideHeader();
      }
    }

    document.addEventListener('keydown', function (e) {
      // Ignora se estiver digitando em input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === "'") {
        e.preventDefault();
        handleToggleHeader();
      }
    });

    // Escuta mensagens do iframe para toggle da header
    window.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'toggleHeader') {
        handleToggleHeader();
      }
    });
  }
})();
