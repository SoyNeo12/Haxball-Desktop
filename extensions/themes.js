// ============================================
// THEMES - Sistema de temas (claro/escuro)
// ============================================
(function () {
  // Só executa dentro do iframe do jogo
  if (Injector.isMainFrame()) return;

  // Função de tradução
  function t(key) {
    console.log(window.__t);
    return window.__t ? window.__t(key) : key;
  }

  // Definição dos temas
  const THEMES = {
    default: {
      nameKey: 'Padrão',
      colors: {}
    },
    dark: {
      nameKey: 'Escuro',
      colors: {
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
        '--theme-scrollbar-track': '#1a1a1a',
        '--theme-scrollbar-thumb': '#555',
        '--theme-scrollbar-thumb-hover': '#666',
        '--theme-tooltip-bg': '#222',
        '--theme-tooltip-border': '#333'
      }
    },
    light: {
      nameKey: 'Claro',
      colors: {
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
        '--theme-scrollbar-track': '#f0f0f0',
        '--theme-scrollbar-thumb': '#bbb',
        '--theme-scrollbar-thumb-hover': '#999',
        '--theme-tooltip-bg': '#fff',
        '--theme-tooltip-border': '#ddd'
      }
    },
    onix: {
      nameKey: 'Onix',
      colors: {
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
        '--theme-scrollbar-track': '#000000',
        '--theme-scrollbar-thumb': '#333333',
        '--theme-scrollbar-thumb-hover': '#444444',
        '--theme-tooltip-bg': '#0a0a0a',
        '--theme-tooltip-border': '#1a1a1a'
      }
    }
  };

  let STORAGE_KEY = 'haxball-theme';
  let currentTheme = 'dark';

  // Carrega tema salvo
  function loadSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES[saved]) {
        currentTheme = saved;
      }
      console.log(currentTheme);
    } catch (e) {}
    return currentTheme;
  }

  // Salva tema
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  // Lista de todas as variáveis de tema
  var ALL_THEME_VARS = [
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
    '--theme-scrollbar-track',
    '--theme-scrollbar-thumb',
    '--theme-scrollbar-thumb-hover',
    '--theme-tooltip-bg',
    '--theme-tooltip-border'
  ];

  // Aplica tema
  function applyTheme(theme) {
    if (!THEMES[theme]) return;

    currentTheme = theme;
    saveTheme(theme);

    var root = document.documentElement;

    // Se for tema padrão, remove todas as variáveis de tema
    if (theme === 'default') {
      for (var i = 0; i < ALL_THEME_VARS.length; i++) {
        root.style.removeProperty(ALL_THEME_VARS[i]);
      }
    } else {
      var colors = THEMES[theme].colors;
      for (var key in colors) {
        root.style.setProperty(key, colors[key]);
      }
    }

    // Atualiza atributo para CSS condicional (no html e body)
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Notifica outros módulos
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));

    // Notifica o parent frame (header)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'themeChanged', theme: theme }, '*');
    }

    Injector.log('Theme applied: ' + theme);
  }

  // Obtém tema atual
  function getCurrentTheme() {
    return currentTheme;
  }

  // Obtém lista de temas (com nomes traduzidos)
  function getThemes() {
    let result = {};
    for (let key in THEMES) {
      result[key] = {
        name: t(THEMES[key].nameKey),
        colors: THEMES[key].colors
      };
    }
    return result;
  }

  // Alterna entre temas
  function toggleTheme() {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const newIndex = (currentIndex + 1) % themeKeys.length;
    const newTheme = themeKeys[newIndex];
    applyTheme(newTheme);
    return newTheme;
  }

  // Inicializa
  function init() {
    loadSavedTheme();

    // Aplica data-theme no html imediatamente para evitar flash
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Aplica tema completo assim que possível
    if (document.body) {
      applyTheme(currentTheme);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        applyTheme(currentTheme);
      });
    }

    Injector.log('Themes module loaded');
  }

  // Exporta API
  window.HaxThemes = {
    apply: applyTheme,
    toggle: toggleTheme,
    getCurrent: getCurrentTheme,
    getThemes: getThemes,
    THEMES: THEMES
  };

  init();
})();
