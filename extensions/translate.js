// ============================================
// TRANSLATE - Sistema de tradução multi-idioma
// ============================================
(function () {
  if (Injector.isMainFrame()) return;

  // Idiomas disponíveis: 'pt' (português), 'es' (espanhol)
  const LANG_KEY = 'haxball_language';

  function detectLanguage() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'pt' || saved === 'es') return saved;

    const browserLang = (navigator.language || '').toLowerCase();
    return browserLang.startsWith('es') ? 'es' : 'pt';
  }

  const currentLang = detectLanguage();
  function setLanguage(lang) {
    if (!lang || lang === currentLang) return;

    localStorage.setItem(LANG_KEY, lang);
    currentLang = lang;
    window.__haxLang = lang;

    document.querySelectorAll('[data-translated]').forEach(function (el) {
      el.removeAttribute('data-translated');
    });

    translateAll(document);
  }

  function getLanguage() {
    return currentLang;
  }

  window.__haxLang = currentLang;
  window.__haxSetLanguage = setLanguage;
  window.__haxGetLanguage = getLanguage;

  // Traduções: chave em inglês -> { pt: 'português', es: 'español' }
  var TRANSLATIONS = {
    // === HAXBALL ORIGINAL ===
    Name: { pt: 'Nome', es: 'Nombre' },
    Players: { pt: 'Jogadores', es: 'Jugadores' },
    Distance: { pt: 'País', es: 'País' },
    Pass: { pt: 'Senha', es: 'Contraseña' },
    'Room list': { pt: 'Lista de Salas', es: 'Lista de Salas' },
    Refresh: { pt: 'Atualizar', es: 'Actualizar' },
    Ok: { pt: 'Ok', es: 'Ok' },
    Cancel: { pt: 'Cancelar', es: 'Cancelar' },
    'Create Room': { pt: 'Criar sala', es: 'Crear sala' },
    'Join Room': { pt: 'Entrar', es: 'Entrar' },
    Settings: { pt: 'Configurações', es: 'Configuración' },
    Leave: { pt: 'Sair', es: 'Salir' },
    Replays: { pt: 'Replays', es: 'Replays' },
    'Room name': { pt: 'Nome da sala', es: 'Nombre de la sala' },
    Password: { pt: 'Senha', es: 'Contraseña' },
    'Max players': { pt: 'Máx. jogadores', es: 'Máx. jugadores' },
    Public: { pt: 'Pública', es: 'Pública' },
    Unlock: { pt: 'Desbloquear', es: 'Desbloquear' },
    Lock: { pt: 'Bloquear', es: 'Bloquear' },
    Change: { pt: 'Alterar', es: 'Cambiar' },
    Close: { pt: 'Fechar', es: 'Cerrar' },
    Sound: { pt: 'Som', es: 'Sonido' },
    Video: { pt: 'Vídeo', es: 'Video' },
    Input: { pt: 'Teclas', es: 'Teclas' },
    Misc: { pt: 'Outros', es: 'Otros' },

    // === EXTENSÃO - HEADER ===
    'Cole o link da sala aqui...': { pt: 'Cole o link da sala aqui...', es: 'Pega el enlace de la sala aquí...' },
    'Modo Anônimo': { pt: 'Modo Anônimo', es: 'Modo Anónimo' },
    'Esconder header': { pt: 'Esconder header', es: 'Ocultar header' },

    // === EXTENSÃO - ROOMLIST ===
    'Pesquisar salas...': { pt: 'Pesquisar salas...', es: 'Buscar salas...' },
    Atualizar: { pt: 'Atualizar', es: 'Actualizar' },
    Entrar: { pt: 'Entrar', es: 'Entrar' },
    'Criar Sala': { pt: 'Criar Sala', es: 'Crear Sala' },
    Favoritos: { pt: 'Favoritos', es: 'Favoritos' },
    Amizades: { pt: 'Amizades', es: 'Amistades' },
    Equipe: { pt: 'Equipe', es: 'Equipo' },
    Configurações: { pt: 'Configurações', es: 'Configuración' },
    Voltar: { pt: 'Voltar', es: 'Volver' },
    'Fixar no Topo': { pt: 'Fixar no Topo', es: 'Fijar Arriba' },
    'Desafixar Sala': { pt: 'Desafixar Sala', es: 'Desfijar Sala' },
    'Adicionar aos Favoritos': { pt: 'Adicionar aos Favoritos', es: 'Añadir a Favoritos' },
    'Remover dos Favoritos': { pt: 'Remover dos Favoritos', es: 'Quitar de Favoritos' },
    'Todos os países': { pt: 'Todos os países', es: 'Todos los países' },
    'Limpar filtro': { pt: 'Limpar filtro', es: 'Limpiar filtro' },

    // === EXTENSÃO - SETTINGS ===
    Som: { pt: 'Som', es: 'Sonido' },
    Vídeo: { pt: 'Vídeo', es: 'Video' },
    Controles: { pt: 'Controles', es: 'Controles' },
    Avatares: { pt: 'Avatares', es: 'Avatares' },
    'Host Token': { pt: 'Host Token', es: 'Host Token' },
    Temas: { pt: 'Temas', es: 'Temas' },
    'Multi-Auth': { pt: 'Multi-Auth', es: 'Multi-Auth' },
    Diversos: { pt: 'Diversos', es: 'Varios' },

    // === EXTENSÃO - SETTINGS (game-min.js) ===
    Desempenho: { pt: 'Desempenho', es: 'Rendimiento' },
    'Ative as opções para melhorar o FPS.': {
      pt: 'Ative as opções para melhorar o FPS.',
      es: 'Activa las opciones para mejorar el FPS.'
    },
    'Linhas simplificadas': { pt: 'Linhas simplificadas', es: 'Líneas simplificadas' },
    'Reduz a espessura das linhas do campo de 3px para 1px. Menos pixels para desenhar.': {
      pt: 'Reduz a espessura das linhas do campo de 3px para 1px. Menos pixels para desenhar.',
      es: 'Reduce el grosor de las líneas del campo de 3px a 1px. Menos píxeles para dibujar.'
    },
    'Curvas viram retas': { pt: 'Curvas viram retas', es: 'Curvas se vuelven rectas' },
    'Converte todas as linhas curvas em retas. Desenhar retas é muito mais rápido que arcos.': {
      pt: 'Converte todas as linhas curvas em retas. Desenhar retas é muito mais rápido que arcos.',
      es: 'Convierte todas las líneas curvas en rectas. Dibujar rectas es mucho más rápido que arcos.'
    },
    'Culling de viewport': { pt: 'Culling de viewport', es: 'Culling de viewport' },
    'Não desenha objetos fora da tela. Em mapas grandes, evita renderizar o que você não vê.': {
      pt: 'Não desenha objetos fora da tela. Em mapas grandes, evita renderizar o que você não vê.',
      es: 'No dibuja objetos fuera de la pantalla. En mapas grandes, evita renderizar lo que no ves.'
    },
    'Desativar avatares e cores': { pt: 'Desativar avatares e cores', es: 'Desactivar avatares y colores' },
    'Remove avatares personalizados e usa cores padrão dos times. Menos texturas.': {
      pt: 'Remove avatares personalizados e usa cores padrão dos times. Menos texturas.',
      es: 'Elimina avatares personalizados y usa colores estándar de los equipos. Menos texturas.'
    },
    'Desativar nomes': { pt: 'Desativar nomes', es: 'Desactivar nombres' },
    'Esconde os nomes dos jogadores. Menos texto para renderizar.': {
      pt: 'Esconde os nomes dos jogadores. Menos texto para renderizar.',
      es: 'Oculta los nombres de los jugadores. Menos texto para renderizar.'
    },
    'Campo simplificado': { pt: 'Campo simplificado', es: 'Campo simplificado' },
    'Usa cores sólidas no campo ao invés de gradientes. Renderização mais simples.': {
      pt: 'Usa cores sólidas no campo ao invés de gradientes. Renderização mais simples.',
      es: 'Usa colores sólidos en el campo en lugar de degradados. Renderizado más simple.'
    },
    'Círculos de baixa qualidade': { pt: 'Círculos de baixa qualidade', es: 'Círculos de baja calidad' },
    'Pré-renderiza os círculos. Mais rápido mas visual pixelado.': {
      pt: 'Pré-renderiza os círculos. Mais rápido mas visual pixelado.',
      es: 'Pre-renderiza los círculos. Más rápido pero visual pixelado.'
    },
    'Gráficos brutos': { pt: 'Gráficos brutos', es: 'Gráficos crudos' },
    'Desativa suavização de imagens. Visual mais pixelado mas processamento mais rápido.': {
      pt: 'Desativa suavização de imagens. Visual mais pixelado mas processamento mais rápido.',
      es: 'Desactiva el suavizado de imágenes. Visual más pixelado pero procesamiento más rápido.'
    },
    'Desativar animações de gol': { pt: 'Desativar animações de gol', es: 'Desactivar animaciones de gol' },
    'Remove as animações quando um gol é marcado. Evita quedas de FPS momentâneas.': {
      pt: 'Remove as animações quando um gol é marcado. Evita quedas de FPS momentâneas.',
      es: 'Elimina las animaciones cuando se marca un gol. Evita caídas de FPS momentáneas.'
    },
    'Desativar indicador do jogador': { pt: 'Desativar indicador do jogador', es: 'Desactivar indicador del jugador' },
    'A seta que mostra onde você está. Economiza um pouco de renderização.': {
      pt: 'A seta que mostra onde você está. Economiza um pouco de renderização.',
      es: 'La flecha que muestra dónde estás. Ahorra un poco de renderizado.'
    },
    'Desativar indicador de chat': { pt: 'Desativar indicador de chat', es: 'Desactivar indicador de chat' },
    'O balão que aparece quando alguém fala. Remove essa renderização extra.': {
      pt: 'O balão que aparece quando alguém fala. Remove essa renderização extra.',
      es: 'El globo que aparece cuando alguien habla. Elimina ese renderizado extra.'
    },
    Cuidado: { pt: 'Cuidado', es: 'Cuidado' },
    'Mostrar nomes dos jogadores': { pt: 'Mostrar nomes dos jogadores', es: 'Mostrar nombres de jugadores' },
    'Mostrar avatares e cores': { pt: 'Mostrar avatares e cores', es: 'Mostrar avatares y colores' },
    'Mostrar indicador do jogador': { pt: 'Mostrar indicador do jogador', es: 'Mostrar indicador del jugador' },
    'Mostrar animações de gol': { pt: 'Mostrar animações de gol', es: 'Mostrar animaciones de gol' },
    'Mostrar indicador de chat': { pt: 'Mostrar indicador de chat', es: 'Mostrar indicador de chat' },
    'Culling de viewport (não desenhar fora da tela)': {
      pt: 'Culling de viewport (não desenhar fora da tela)',
      es: 'Culling de viewport (no dibujar fuera de pantalla)'
    },
    // === EXTENSÃO - QUICK AVATAR ===
    'Defina teclas de atalho para trocar de avatar rapidamente durante o jogo.': {
      pt: 'Defina teclas de atalho para trocar de avatar rapidamente durante o jogo.',
      es: 'Define teclas de acceso rápido para cambiar de avatar rápidamente durante el juego.'
    },
    'Adicionar atalho': { pt: 'Adicionar atalho', es: 'Añadir atajo' },
    'Novo Atalho': { pt: 'Novo Atalho', es: 'Nuevo Atajo' },
    'Editar Atalho': { pt: 'Editar Atalho', es: 'Editar Atajo' },
    'Tecla de Atalho': { pt: 'Tecla de Atalho', es: 'Tecla de Atajo' },
    'Avatar (emoji ou texto)': { pt: 'Avatar (emoji ou texto)', es: 'Avatar (emoji o texto)' },
    'Clique para definir tecla': { pt: 'Clique para definir tecla', es: 'Haz clic para definir tecla' },
    'Pressione uma tecla...': { pt: 'Pressione uma tecla...', es: 'Presiona una tecla...' },
    'Tecla inválida, tente outra': { pt: 'Tecla inválida, tente outra', es: 'Tecla inválida, intenta otra' },
    Editar: { pt: 'Editar', es: 'Editar' },
    Salvar: { pt: 'Salvar', es: 'Guardar' },
    vazio: { pt: 'vazio', es: 'vacío' },

    // === EXTENSÃO - HIDE UI ===
    'Ocultar Chat': { pt: 'Ocultar Chat', es: 'Ocultar Chat' },
    'Ocultar Placar/Timer': { pt: 'Ocultar Placar/Timer', es: 'Ocultar Marcador/Tiempo' },
    'Ocultar Ping/FPS': { pt: 'Ocultar Ping/FPS', es: 'Ocultar Ping/FPS' },

    // === EXTENSÃO - STRETCHED ===
    Esticar: { pt: 'Esticar', es: 'Estirar' },
    Nativo: { pt: 'Nativo', es: 'Nativo' },

    // === GAME-MIN - QUALITY MODE ===
    'Quality Mode:': { pt: 'Qualidade:', es: 'Calidad:' },
    'Performance (90%)': { pt: 'Desempenho (90%)', es: 'Rendimiento (90%)' },
    'HD (100%)': { pt: 'HD (100%)', es: 'HD (100%)' }
  };

  window.__TRANSLATIONS = TRANSLATIONS;

  // Função de tradução global
  function t(key) {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[currentLang] || entry['pt'] || key;
  }

  // Exporta função de tradução
  window.__t = t;

  // Tradução Global
  function translateElement(el) {
    if (!el) return;
    if (el.dataset.translated === currentLang) return;
    if (el.getAttribute('data-hook') === 'share-friends') return;

    let textNodes = [];

    for (let i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) {
        textNodes.push(el.childNodes[i]);
      }
    }

    if (!textNodes.length) return;

    const originalText = textNodes
      .map(function (n) {
        return n.nodeValue;
      })
      .join('')
      .trim();

    if (!originalText) return;

    const entry = TRANSLATIONS[originalText];
    if (!entry || !entry[currentLang]) return;

    textNodes.forEach(function (node) {
      node.nodeValue = node.nodeValue.replace(originalText, entry[currentLang]);
    });

    el.dataset.translated = currentLang;
  }

  function translateAll(root) {
    if (!root) return;

    const selectors = 'button, h1, h2, h3, th, td, label';
    const elements = root.querySelectorAll(selectors);

    for (let i = 0; i < elements.length; i++) {
      translateElement(elements[i]);
    }

    translateAttributes(root);
  }

  function translateAttributes(root) {
    const attrElements = root.querySelectorAll('[placeholder], [title]');

    for (let i = 0; i < attrElements.length; i++) {
      let el = attrElements[i];

      if (el.placeholder) {
        const p = el.placeholder.trim();
        if (TRANSLATIONS[p]) {
          el.placeholder = t(p);
        }
      }

      if (el.title) {
        const tt = el.title.trim();
        if (TRANSLATIONS[tt]) {
          el.title = t(tt);
        }
      }
    }
  }

  // Observer
  function startObserver() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            translateAll(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    translateAll(document);
    startObserver();

    if (Injector.isGameFrame()) {
      Injector.onView('view', function (el) {
        translateAll(el);
      });

      Injector.onView('dialog', function (el) {
        translateAll(el);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  Injector.log('Translate module loaded (lang: ' + currentLang + ')');
})();
