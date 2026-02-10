// ============================================
// WELCOME - Popup de boas-vindas
// ============================================
(function () {
  if (Injector.isMainFrame()) return;

  var CURRENT_VERSION = '1.2.3';
  var currentPage = 0;
  var currentLang = localStorage.getItem('haxball_language') || 'pt';

  var TRANSLATIONS = {
    pt: {
      welcomeTitle: 'Bem-vindo à v' + CURRENT_VERSION,
      welcomeText:
        'Esta versão traz diversas melhorias de desempenho, permitindo que você personalize o jogo para rodar da melhor forma possível no seu computador.<br><br>Todos os bugs reportados na versão anterior foram corrigidos, incluindo o problema que impedia o logout quando havia duas contas vinculadas.<br><br>Nas próximas páginas, explicamos cada novidade em detalhes.',
      langTitle: 'Idioma',
      langText:
        'Desde o lançamento, recebemos muito carinho de jogadores de toda a América Latina! Argentinos, uruguaios, chilenos, peruanos e tantos outros nos pediram suporte ao espanhol.<br><br>Então aqui está: agora você pode usar o aplicativo no seu idioma. Gracias por todo el apoyo!',
      perfTitle: 'Desempenho',
      perfText: 'Adicionamos uma nova aba de Desempenho nas configurações com várias opções para otimizar seu jogo:',
      perfItems: [
        { title: 'Linhas simplificadas', desc: 'Reduz a espessura das linhas do campo de 3px para 1px.' },
        { title: 'Curvas viram retas', desc: 'Converte todas as linhas curvas em retas.' },
        { title: 'Culling de viewport', desc: 'Não desenha objetos fora da tela.' },
        { title: 'Desativar avatares e cores', desc: 'Remove avatares personalizados e usa cores padrão.' },
        { title: 'Desativar nomes', desc: 'Esconde os nomes dos jogadores.' },
        { title: 'Campo simplificado', desc: 'Usa cores sólidas no campo ao invés de imagens.' },
        { title: 'Círculos de baixa qualidade', desc: 'Pré-renderiza os círculos. Mais rápido mas pixelado.' },
        { title: 'Desativar animações de gol', desc: 'Remove as animações quando um gol é marcado.' },
        { title: 'Desativar indicador do jogador', desc: 'O círculo que mostra onde você está.' },
        { title: 'Desativar indicador de chat', desc: 'O balão que aparece quando alguém fala.' },
        { title: 'Alta prioridade', desc: 'Dá mais recursos do sistema para o jogo.' }
      ],
      perfFooter: 'Exporte e importe suas configurações para compartilhar com amigos.',
      prev: 'Anterior',
      next: 'Próximo',
      start: 'Começar',
      portuguese: 'Português',
      spanish: 'Español'
    },
    es: {
      welcomeTitle: 'Bienvenido a v' + CURRENT_VERSION,
      welcomeText:
        'Esta versión trae diversas mejoras de rendimiento, permitiéndote personalizar el juego para que funcione de la mejor manera posible en tu computadora.<br><br>Todos los bugs reportados en la versión anterior fueron corregidos, incluyendo el problema que impedía cerrar sesión cuando había dos cuentas vinculadas.<br><br>En las próximas páginas, explicamos cada novedad en detalle.',
      perfTitle: 'Rendimiento',
      perfText:
        'Agregamos una nueva pestaña de Rendimiento en la configuración con varias opciones para optimizar tu juego:',
      perfItems: [
        { title: 'Líneas simplificadas', desc: 'Reduce el grosor de las líneas del campo de 3px a 1px.' },
        { title: 'Curvas se vuelven rectas', desc: 'Convierte todas las líneas curvas en rectas.' },
        { title: 'Culling de viewport', desc: 'No dibuja objetos fuera de la pantalla.' },
        { title: 'Desactivar avatares y colores', desc: 'Elimina avatares personalizados y usa colores estándar.' },
        { title: 'Desactivar nombres', desc: 'Oculta los nombres de los jugadores.' },
        { title: 'Campo simplificado', desc: 'Usa colores sólidos en el campo en lugar de imágenes.' },
        { title: 'Círculos de baja calidad', desc: 'Pre-renderiza los círculos. Más rápido pero pixelado.' },
        { title: 'Desactivar animaciones de gol', desc: 'Elimina las animaciones cuando se marca un gol.' },
        { title: 'Desactivar indicador del jugador', desc: 'El círculo que muestra dónde estás.' },
        { title: 'Desactivar indicador de chat', desc: 'El globo que aparece cuando alguien habla.' },
        { title: 'Alta prioridad', desc: 'Da más recursos del sistema al juego.' }
      ],
      perfFooter: 'Exporta e importa tus configuraciones para compartir con amigos.',
      prev: 'Anterior',
      next: 'Siguiente',
      start: 'Comenzar',
      portuguese: 'Português',
      spanish: 'Español'
    }
  };

  function t(key) {
    return TRANSLATIONS[currentLang][key] || TRANSLATIONS['pt'][key] || key;
  }

  function createListHTML(items, twoColumns) {
    if (twoColumns) {
      var half = Math.ceil(items.length / 2);
      var col1 = items.slice(0, half);
      var col2 = items.slice(half);

      function renderCol(colItems) {
        var html = '';
        for (var i = 0; i < colItems.length; i++) {
          var item = colItems[i];
          if (typeof item === 'object') {
            html +=
              '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;white-space:nowrap;">' +
              '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;margin-top:5px;"></div>' +
              '<div>' +
              '<div style="color:#ccc;font-size:12px;font-weight:500;">' +
              item.title +
              '</div>' +
              '<div style="color:#555;font-size:10px;margin-top:1px;">' +
              item.desc +
              '</div>' +
              '</div>' +
              '</div>';
          } else {
            html +=
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;white-space:nowrap;">' +
              '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;"></div>' +
              '<span style="color:#999;font-size:12px;">' +
              item +
              '</span>' +
              '</div>';
          }
        }
        return html;
      }

      return (
        '<div style="display:flex;gap:24px;margin-top:14px;">' +
        '<div style="flex:1;">' +
        renderCol(col1) +
        '</div>' +
        '<div style="flex:1;">' +
        renderCol(col2) +
        '</div>' +
        '</div>'
      );
    } else {
      var html = '<div style="margin-top:14px;display:flex;flex-direction:column;gap:12px;">';
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (typeof item === 'object') {
          if (item.icon) {
            html +=
              '<div style="display:flex;align-items:flex-start;gap:14px;white-space:nowrap;">' +
              '<div style="color:#888;flex-shrink:0;display:flex;align-items:center;height:20px;">' +
              item.icon +
              '</div>' +
              '<div>' +
              '<div style="color:#fff;font-size:14px;font-weight:500;line-height:20px;">' +
              item.title +
              '</div>' +
              '<div style="color:#666;font-size:12px;margin-top:4px;">' +
              item.desc +
              '</div>' +
              '</div>' +
              '</div>';
          } else {
            html +=
              '<div style="display:flex;align-items:flex-start;gap:10px;white-space:nowrap;">' +
              '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;margin-top:6px;"></div>' +
              '<div>' +
              '<div style="color:#ccc;font-size:13px;font-weight:500;">' +
              item.title +
              '</div>' +
              '<div style="color:#555;font-size:11px;margin-top:2px;">' +
              item.desc +
              '</div>' +
              '</div>' +
              '</div>';
          }
        } else {
          html +=
            '<div style="display:flex;align-items:center;gap:10px;white-space:nowrap;">' +
            '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;"></div>' +
            '<span style="color:#999;font-size:13px;">' +
            item +
            '</span>' +
            '</div>';
        }
      }
      html += '</div>';
      return html;
    }
  }

  // Preview minimalista da aba de desempenho
  function getPerfPreview() {
    return (
      '<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:12px;width:180px;flex-shrink:0;">' +
      '<div style="color:#666;font-size:9px;margin-bottom:8px;text-transform:uppercase;">Preview</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<div style="width:12px;height:12px;border:1px solid #333;border-radius:2px;background:#22c55e;display:flex;align-items:center;justify-content:center;">' +
      '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
      '</div>' +
      '<span style="color:#888;font-size:9px;">Linhas simples</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<div style="width:12px;height:12px;border:1px solid #333;border-radius:2px;background:#22c55e;display:flex;align-items:center;justify-content:center;">' +
      '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
      '</div>' +
      '<span style="color:#888;font-size:9px;">Culling</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<div style="width:12px;height:12px;border:1px solid #333;border-radius:2px;"></div>' +
      '<span style="color:#555;font-size:9px;">Alta prioridade</span>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #1a1a1a;display:flex;gap:6px;">' +
      '<div style="flex:1;padding:4px;background:#1a1a1a;border-radius:4px;text-align:center;color:#666;font-size:8px;">Exportar</div>' +
      '<div style="flex:1;padding:4px;background:#1a1a1a;border-radius:4px;text-align:center;color:#666;font-size:8px;">Importar</div>' +
      '</div>' +
      '</div>'
    );
  }

  // Preview minimalista do painel Pro
  function getProPreview() {
    return (
      '<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:12px;width:180px;flex-shrink:0;">' +
      '<div style="color:#666;font-size:9px;margin-bottom:10px;text-transform:uppercase;">Preview</div>' +
      // Preview do nick com badge
      '<div style="text-align:center;padding:14px 10px;background:#111;border-radius:6px;border:1px solid #1a1a1a;margin-bottom:10px;">' +
      '<div style="display:inline-flex;align-items:center;gap:5px;">' +
      '<span style="background:linear-gradient(90deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:13px;font-weight:600;">snow</span>' +
      '<svg width="12" height="12" viewBox="0 0 22 22" fill="#3b82f6"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z"/><path d="M15 9l-4.5 4.5L8 11" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</div>' +
      '</div>' +
      // Seletores de cor
      '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
      '<div style="flex:1;background:#111;border-radius:6px;padding:8px;">' +
      '<div style="color:#666;font-size:8px;margin-bottom:4px;">NICK</div>' +
      '<div style="display:flex;gap:4px;">' +
      '<div style="width:16px;height:16px;background:#f59e0b;border-radius:3px;border:1px solid #333;"></div>' +
      '<div style="width:16px;height:16px;background:#ef4444;border-radius:3px;border:1px solid #333;"></div>' +
      '</div>' +
      '</div>' +
      '<div style="flex:1;background:#111;border-radius:6px;padding:8px;">' +
      '<div style="color:#666;font-size:8px;margin-bottom:4px;">BADGE</div>' +
      '<div style="display:flex;gap:4px;">' +
      '<div style="width:16px;height:16px;background:#3b82f6;border-radius:3px;border:1px solid #333;"></div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      // Banner
      '<div style="padding:8px;background:linear-gradient(90deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2));border-radius:6px;border:1px solid rgba(99,102,241,0.3);">' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<span style="background:linear-gradient(90deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:10px;font-weight:500;">snow</span>' +
      '<svg width="8" height="8" viewBox="0 0 22 22" fill="#3b82f6"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z"/></svg>' +
      '</div>' +
      '</div>' +
      // Botão salvar
      '<div style="margin-top:10px;padding:8px;background:#fff;border-radius:6px;text-align:center;color:#000;font-size:10px;font-weight:600;">Salvar</div>' +
      '</div>'
    );
  }

  // Preview minimalista do painel de Equipe
  function getTeamPreview() {
    return (
      '<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:12px;width:180px;flex-shrink:0;">' +
      '<div style="color:#666;font-size:9px;margin-bottom:10px;text-transform:uppercase;">Preview</div>' +
      // Header da equipe
      '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#111;border-radius:6px;border:1px solid #1a1a1a;margin-bottom:10px;">' +
      '<div style="width:32px;height:32px;background:#1a1a1a;border-radius:4px;display:flex;align-items:center;justify-content:center;">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
      '</div>' +
      '<div>' +
      '<div style="color:#fff;font-size:11px;font-weight:600;">Tigers</div>' +
      '<div style="color:#555;font-size:9px;margin-top:2px;">3 ' +
      (currentLang === 'es' ? 'miembros' : 'membros') +
      '</div>' +
      '</div>' +
      '</div>' +
      // Preview da lista de jogadores com badge
      '<div style="padding:8px;background:#111;border-radius:6px;margin-bottom:10px;">' +
      '<div style="color:#666;font-size:8px;margin-bottom:6px;">' +
      (currentLang === 'es' ? 'LISTA DE JUGADORES' : 'LISTA DE JOGADORES') +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
      '<div style="display:flex;align-items:center;gap:4px;padding:4px 6px;background:#1a1a1a;border-radius:4px;">' +
      '<span style="color:#fff;font-size:10px;">z1co</span>' +
      '<svg width="10" height="10" viewBox="0 0 22 22" fill="#3b82f6"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z"/><path d="M15 9l-4.5 4.5L8 11" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:4px;padding:4px 6px;background:#1a1a1a;border-radius:4px;">' +
      '<span style="color:#fff;font-size:10px;">dnts</span>' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:4px;padding:4px 6px;background:#1a1a1a;border-radius:4px;">' +
      '<span style="color:#fff;font-size:10px;">pedy</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      // Lista de membros da equipe
      '<div style="padding:8px;background:#111;border-radius:6px;">' +
      '<div style="color:#666;font-size:8px;margin-bottom:6px;">' +
      (currentLang === 'es' ? 'MIEMBROS' : 'MEMBROS') +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:4px;">' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<span style="color:#ccc;font-size:9px;">z1co</span>' +
      '<svg width="10" height="10" viewBox="0 0 576 512" fill="#F4A261"><path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86 427.4c5.5 30.4 32 52.6 63 52.6H427c31 0 57.4-22.2 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"/></svg>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<span style="color:#ccc;font-size:9px;">dnts</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<span style="color:#ccc;font-size:9px;">pedy</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function getPages() {
    return [
      {
        title: t('welcomeTitle'),
        content: t('welcomeText'),
        type: 'text'
      },
      {
        title: t('langTitle'),
        content: t('langText'),
        type: 'language'
      },
      {
        title: t('perfTitle'),
        content:
          t('perfText') +
          createListHTML(t('perfItems'), true) +
          '<div style="margin-top:16px;color:#666;">' +
          t('perfFooter') +
          '</div>',
        type: 'perf'
      }
    ];
  }

  function createWelcomePopup() {
    if (document.getElementById('welcome-popup-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'welcome-popup-overlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10002;display:flex;align-items:center;justify-content:center;';

    var popup = document.createElement('div');
    popup.id = 'welcome-popup';
    popup.style.cssText = 'background:#111;border:1px solid #252525;border-radius:12px;max-width:95vw;overflow:hidden;';

    function renderPage(index) {
      var pages = getPages();
      var page = pages[index];
      var isFirst = index === 0;
      var isLast = index === pages.length - 1;

      var contentHTML = '';
      var previewHTML = '';

      if (page.type === 'language') {
        contentHTML =
          '<div style="color:#888;font-size:13px;line-height:1.7;">' +
          page.content +
          '</div>' +
          '<div style="display:flex;gap:12px;margin-top:24px;">' +
          '<button id="lang-pt" style="flex:1;padding:14px;background:' +
          (currentLang === 'pt' ? '#fff' : '#1a1a1a') +
          ';border:1px solid ' +
          (currentLang === 'pt' ? '#fff' : '#333') +
          ';border-radius:8px;color:' +
          (currentLang === 'pt' ? '#000' : '#888') +
          ';font-size:13px;font-weight:' +
          (currentLang === 'pt' ? '600' : '400') +
          ';cursor:pointer;">' +
          t('portuguese') +
          '</button>' +
          '<button id="lang-es" style="flex:1;padding:14px;background:' +
          (currentLang === 'es' ? '#fff' : '#1a1a1a') +
          ';border:1px solid ' +
          (currentLang === 'es' ? '#fff' : '#333') +
          ';border-radius:8px;color:' +
          (currentLang === 'es' ? '#000' : '#888') +
          ';font-size:13px;font-weight:' +
          (currentLang === 'es' ? '600' : '400') +
          ';cursor:pointer;">' +
          t('spanish') +
          '</button>' +
          '</div>';
      } else if (page.type === 'perf') {
        contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
        previewHTML = getPerfPreview();
      } else if (page.type === 'team') {
        contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
        previewHTML = getTeamPreview();
      } else if (page.type === 'pro') {
        contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
        previewHTML = getProPreview();
      } else {
        contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
      }

      var bodyHTML = previewHTML
        ? '<div style="display:flex;gap:20px;align-items:flex-start;">' +
          '<div style="flex:1;">' +
          contentHTML +
          '</div>' +
          previewHTML +
          '</div>'
        : contentHTML;

      popup.innerHTML =
        '<div style="padding:20px 24px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="color:#fff;font-size:17px;font-weight:600;">' +
        page.title +
        '</span>' +
        '<span style="color:#444;font-size:11px;">' +
        (index + 1) +
        ' / ' +
        pages.length +
        '</span>' +
        '</div>' +
        '<div style="padding:24px;">' +
        bodyHTML +
        '</div>' +
        '<div style="padding:16px 24px;border-top:1px solid #222;display:flex;justify-content:space-between;align-items:center;">' +
        '<button id="welcome-prev" style="padding:10px 18px;background:' +
        (isFirst ? 'transparent' : '#1a1a1a') +
        ';border:none;border-radius:6px;color:' +
        (isFirst ? '#333' : '#999') +
        ';font-size:12px;cursor:' +
        (isFirst ? 'default' : 'pointer') +
        ';display:flex;align-items:center;gap:6px;"' +
        (isFirst ? ' disabled' : '') +
        '>' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
        t('prev') +
        '</button>' +
        '<button id="welcome-next" style="padding:10px 18px;background:#fff;border:none;border-radius:6px;color:#000;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">' +
        (isLast ? t('start') : t('next')) +
        (isLast
          ? ''
          : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>') +
        '</button>' +
        '</div>';

      popup.querySelector('#welcome-prev').onclick = function () {
        if (index > 0) {
          currentPage--;
          renderPage(currentPage);
        }
      };

      popup.querySelector('#welcome-next').onclick = function () {
        if (isLast) {
          closeWelcomePopup();
        } else {
          currentPage++;
          renderPage(currentPage);
        }
      };

      if (page.type === 'language') {
        popup.querySelector('#lang-pt').onclick = function () {
          if (currentLang !== 'pt') {
            currentLang = 'pt';
            localStorage.setItem('haxball_language', 'pt');
            currentPage = 0;
            renderPage(currentPage);
          }
        };
        popup.querySelector('#lang-es').onclick = function () {
          if (currentLang !== 'es') {
            currentLang = 'es';
            localStorage.setItem('haxball_language', 'es');
            currentPage = 0;
            renderPage(currentPage);
          }
        };
      }
    }

    renderPage(0);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  function closeWelcomePopup() {
    var overlay = document.getElementById('welcome-popup-overlay');
    if (overlay) overlay.remove();
    // Marca como visto ao fechar
    localStorage.setItem('haxball_welcome_seen', CURRENT_VERSION);
  }

  window.__showWelcomePopup = createWelcomePopup;
  window.__closeWelcomePopup = closeWelcomePopup;

  // Mostra o popup ao carregar (apenas se não viu essa versão)
  Injector.waitForElement('body').then(function () {
    var seenVersion = localStorage.getItem('haxball_welcome_seen');
    if (seenVersion !== CURRENT_VERSION) {
      setTimeout(createWelcomePopup, 800);
    }
  });
})();
