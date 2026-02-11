// ============================================
// SETTINGS - Dialog de configurações com sidebar
// ============================================
(function () {
  if (Injector.isMainFrame()) return;

  // Função de tradução
  function t(key) {
    return window.__t ? window.__t(key) : key;
  }

  function modifySettingsDialog(doc) {
    // O dialog settings-view aparece como .dialog.settings-view
    var dialog = doc.querySelector('.dialog.settings-view');
    if (!dialog) return;

    // Já foi modificado
    if (doc.getElementById('settings-sidebar-panel')) return;

    // Cria tooltip customizado
    var tooltip = doc.getElementById('settings-sidebar-tooltip');
    if (!tooltip) {
      tooltip = doc.createElement('div');
      tooltip.id = 'settings-sidebar-tooltip';
      tooltip.style.cssText =
        'position:fixed;background:var(--theme-tooltip-bg);color:var(--theme-text-primary);padding:6px 10px;border-radius:6px;font-size:12px;pointer-events:none;opacity:0;transition:opacity 0.15s;z-index:10000;white-space:nowrap;border:1px solid var(--theme-tooltip-border);box-shadow:0 4px 16px rgba(0,0,0,0.3);';
      doc.body.appendChild(tooltip);
    }

    function showTooltip(el, text) {
      var rect = el.getBoundingClientRect();
      tooltip.textContent = text;
      tooltip.style.left = rect.right + 8 + 'px';
      tooltip.style.top = rect.top + rect.height / 2 - 12 + 'px';
      tooltip.style.opacity = '1';
    }

    function hideTooltip() {
      tooltip.style.opacity = '0';
    }

    function addTooltip(el, text) {
      if (!el) return;
      el.addEventListener('mouseenter', function () {
        showTooltip(el, text);
      });
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('click', hideTooltip);
    }

    // Cria sidebar
    var sidebar = doc.createElement('div');
    sidebar.id = 'settings-sidebar-panel';
    sidebar.style.cssText =
      'position:absolute;left:-50px;top:5px;bottom:5px;width:50px;background:var(--theme-bg-primary);border:1px solid var(--theme-border);border-radius:8px 0 0 8px;display:flex;flex-direction:column;gap:8px;padding:10px 6px;box-sizing:border-box;z-index:-1;';

    sidebar.addEventListener('mouseleave', hideTooltip);

    // Pega as tabs originais
    var tabs = dialog.querySelector('.tabs');

    // Ícones para cada aba
    var tabIcons = {
      soundbtn: {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
        tooltip: t('Som'),
        order: 1
      },
      videobtn: {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        tooltip: t('Vídeo'),
        order: 2
      },
      inputbtn: {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12"/></svg>',
        tooltip: t('Controles'),
        order: 3
      },
      perfbtn: {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        tooltip: t('Desempenho'),
        order: 4
      },
      avatarbtn: {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>',
        tooltip: t('Avatares'),
        order: 5
      },
      themebtn: {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        tooltip: t('Temas'),
        order: 7
      },
      miscbtn: {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
        tooltip: t('Diversos'),
        order: 9
      }
    };

    // Ordem customizada dos botões
    var tabOrder = ['soundbtn', 'videobtn', 'inputbtn', 'perfbtn', 'avatarbtn', 'themebtn', 'miscbtn'];

    // Cria a aba de temas customizada
    function createThemeTab(doc, tabs) {
      // Verifica se já existe
      if (tabs.querySelector('button[data-hook="themebtn"]')) return;

      var themeBtn = doc.createElement('button');
      themeBtn.setAttribute('data-hook', 'themebtn');
      themeBtn.textContent = t('Temas');
      themeBtn.style.display = 'none';
      tabs.appendChild(themeBtn);

      // Cria o conteúdo da seção de temas
      var themeSection = doc.createElement('section');
      themeSection.className = 'theme-section section';
      themeSection.setAttribute('data-hook', 'theme-section');
      themeSection.style.display = 'none';

      // Container principal
      var container = doc.createElement('div');
      container.className = 'theme-container';

      // Seção de Tema
      var themeGroup = doc.createElement('div');
      themeGroup.className = 'settings-group';

      var themeLabel = doc.createElement('div');
      themeLabel.className = 'settings-group-label';
      themeLabel.textContent = t('Tema');
      themeGroup.appendChild(themeLabel);

      var themeOptions = doc.createElement('div');
      themeOptions.className = 'theme-options';

      var themes = window.HaxThemes
        ? window.HaxThemes.getThemes()
        : { default: { name: t('Padrão') }, dark: { name: t('Escuro') }, light: { name: t('Claro') } };
      var currentTheme = window.HaxThemes ? window.HaxThemes.getCurrent() : 'dark';

      var themeDescs = {
        default: t('Sem alterações de cor'),
        dark: t('Reduz o cansaço visual'),
        light: t('Melhor visibilidade'),
        onix: t('Preto total, escuridão absoluta')
      };

      for (var key in themes) {
        var option = doc.createElement('div');
        option.className = 'theme-option' + (key === currentTheme ? ' selected' : '');
        option.setAttribute('data-theme', key);

        var textWrapper = doc.createElement('div');
        textWrapper.className = 'theme-text';

        var name = doc.createElement('span');
        name.className = 'theme-name';
        name.textContent = themes[key].name;
        textWrapper.appendChild(name);

        var desc = doc.createElement('span');
        desc.className = 'theme-desc';
        desc.textContent = themeDescs[key] || '';
        textWrapper.appendChild(desc);

        option.appendChild(textWrapper);

        var check = doc.createElement('div');
        check.className = 'theme-check';
        check.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
        option.appendChild(check);

        option.addEventListener(
          'click',
          (function (themeKey) {
            return function () {
              var allOptions = themeOptions.querySelectorAll('.theme-option');
              for (var i = 0; i < allOptions.length; i++) {
                allOptions[i].classList.remove('selected');
              }
              this.classList.add('selected');
              if (window.HaxThemes) {
                window.HaxThemes.apply(themeKey);
              }
            };
          })(key)
        );

        themeOptions.appendChild(option);
      }

      themeGroup.appendChild(themeOptions);
      container.appendChild(themeGroup);

      themeSection.appendChild(container);

      // Insere a seção no dialog
      var dialogContent = dialog.querySelector('.section') || dialog;
      dialogContent.parentNode.insertBefore(themeSection, dialogContent.nextSibling);

      // Handler para mostrar/esconder a seção
      themeBtn.addEventListener('click', function () {
        var sections = dialog.querySelectorAll('.tabcontents > .section');
        for (var i = 0; i < sections.length; i++) {
          sections[i].style.display = 'none';
        }
        themeSection.style.display = 'block';

        var allTabs = tabs.querySelectorAll('button');
        for (var i = 0; i < allTabs.length; i++) {
          allTabs[i].classList.remove('selected');
        }
        themeBtn.classList.add('selected');
      });

      var originalTabs = tabs.querySelectorAll('button:not([data-hook="themebtn"])');
      for (var i = 0; i < originalTabs.length; i++) {
        originalTabs[i].addEventListener('click', function () {
          themeSection.style.display = 'none';
          var sections = dialog.querySelectorAll('.tabcontents > .section');
          for (var j = 0; j < sections.length; j++) {
            sections[j].style.display = '';
          }
        });
      }

      return themeBtn;
    }

    // Cria a aba de desempenho customizada
    function createPerfTab(doc, tabs) {
      if (tabs.querySelector('button[data-hook="perfbtn"]')) return;

      let perfBtn = doc.createElement('button');
      perfBtn.setAttribute('data-hook', 'perfbtn');
      perfBtn.textContent = t('Desempenho');
      perfBtn.style.display = 'none';
      tabs.appendChild(perfBtn);

      let perfSection = doc.createElement('section');
      perfSection.className = 'perf-section section';
      perfSection.setAttribute('data-hook', 'perf-section');
      perfSection.style.display = 'none';

      // Descrições das opções
      const PERF_OPTIONS = [
        {
          hook: 'tmisc-simplelines',
          title: t('Linhas simplificadas'),
          desc: t('Reduz a espessura das linhas do campo de 3px para 1px. Menos pixels para desenhar.')
        },
        {
          hook: 'tmisc-ultrasimplelines',
          title: t('Curvas viram retas'),
          desc: t('Converte todas as linhas curvas em retas. Desenhar retas é muito mais rápido que curvas.')
        },
        {
          hook: 'tmisc-culling',
          title: t('Culling de viewport'),
          desc: t('Não desenha objetos fora da tela. Em mapas grandes, evita renderizar o que você não vê.')
        },
        {
          hook: 'tmisc-showavatars',
          title: t('Desativar avatares e cores'),
          desc: t('Remove avatares personalizados e usa cores padrão dos times. Menos texturas.')
        },
        {
          hook: 'tmisc-shownames',
          title: t('Desativar nomes'),
          desc: t('Esconde os nomes dos jogadores. Menos texto para renderizar.')
        },
        {
          hook: 'tmisc-simplefield',
          title: t('Campo simplificado'),
          desc: t('Usa cores sólidas no campo ao invés de gradientes. Renderização mais simples.')
        },
        {
          hook: 'tmisc-lowqualitycircles',
          title: t('Círculos de baixa qualidade'),
          desc: t('Pré-renderiza os círculos. Mais rápido mas visual pixelado.')
        },
        {
          hook: 'tmisc-showanimations',
          title: t('Desativar animações de gol'),
          desc: t('Remove as animações quando um gol é marcado. Evita quedas de FPS momentâneas.')
        },
        {
          hook: 'tmisc-showindicator',
          title: t('Desativar indicador do jogador'),
          desc: t('O círculo que mostra onde você está. Economiza um pouco de renderização.')
        },
        {
          hook: 'tmisc-showchat',
          title: t('Desativar indicador de chat'),
          desc: t('O balão que aparece quando alguém fala. Remove essa renderização extra.')
        }
      ];

      let container = doc.createElement('div');
      container.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

      // Header
      let header = doc.createElement('div');
      header.style.cssText =
        'color:var(--theme-text-muted);font-size:11px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--theme-border);';
      header.innerHTML = t('Ative as opções para melhorar o FPS.');
      container.appendChild(header);

      // Cria cada opção
      PERF_OPTIONS.forEach(function (opt) {
        let row = doc.createElement('div');
        row.className = 'perf-option-row';
        row.style.cssText =
          'display:flex;align-items:flex-start;gap:10px;padding:6px 8px;border-radius:6px;cursor:pointer;';
        row.setAttribute('data-perf-hook', opt.hook);

        row.onmouseenter = function () {
          row.style.background = 'var(--theme-bg-hover)';
        };
        row.onmouseleave = function () {
          row.style.background = '';
        };

        // Checkbox visual
        let checkbox = doc.createElement('div');
        checkbox.className = 'perf-checkbox';
        checkbox.style.cssText =
          'width:18px;height:18px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;';
        checkbox.innerHTML =
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="opacity:0;"><polyline points="20 6 9 17 4 12"/></svg>';

        // Texto
        let textDiv = doc.createElement('div');
        textDiv.style.cssText = 'flex:1;min-width:0;';

        let titleRow = doc.createElement('div');
        titleRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:2px;';

        var title = doc.createElement('span');
        title.style.cssText = 'color:var(--theme-text-primary);font-size:13px;font-weight:500;';
        title.textContent = opt.title;
        titleRow.appendChild(title);

        if (opt.warning) {
          var warning = doc.createElement('span');
          warning.style.cssText =
            'color:#f59e0b;font-size:10px;font-weight:600;padding:2px 6px;background:rgba(245,158,11,0.15);border-radius:4px;';
          warning.textContent = t('Cuidado');
          titleRow.appendChild(warning);
        }

        textDiv.appendChild(titleRow);

        var desc = doc.createElement('div');
        desc.style.cssText = 'color:var(--theme-text-muted);font-size:11px;line-height:1.4;';
        desc.textContent = opt.desc;
        textDiv.appendChild(desc);

        row.appendChild(checkbox);
        row.appendChild(textDiv);

        // Click handler - encontra e clica no toggle original
        (function (hookName) {
          row.onclick = function () {
            var miscSection = dialog.querySelector('[data-hook="miscsec"]');
            if (miscSection) {
              var originalToggle = miscSection.querySelector('[data-hook="' + hookName + '"]');
              if (originalToggle) {
                originalToggle.click();
                // Aguarda um pouco mais para a UI atualizar
                setTimeout(updatePerfCheckboxes, 100);
              }
            }
          };
        })(opt.hook);

        container.appendChild(row);
      });

      // ============================================
      // BOTÕES DE EXPORT/IMPORT DE CONFIGURAÇÕES
      // ============================================
      var exportImportSection = doc.createElement('div');
      exportImportSection.style.cssText =
        'display:flex;gap:10px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);';

      // Chaves de localStorage para configurações de desempenho
      var PERF_STORAGE_KEYS = [
        'simple_lines',
        'ultra_simple_lines',
        'culling_enabled',
        'show_avatars',
        'show_names',
        'simple_field',
        'low_quality_circles',
        'show_animations',
        'show_indicator',
        'show_chat_indicator',
        'canvas_boost_scale',
        'fps_limit',
        'resolution_scale',
        'viewmode'
      ];

      // Função para gerar código de configuração
      function generatePerfCode() {
        var config = {};
        PERF_STORAGE_KEYS.forEach(function (key) {
          var val = localStorage.getItem(key);
          if (val !== null) config[key] = val;
        });
        // Converte para base64 compacto
        var json = JSON.stringify(config);
        var code = btoa(json).replace(/=/g, '');
        return code;
      }

      // Função para aplicar código de configuração
      function applyPerfCode(code) {
        try {
          // Adiciona padding de base64 se necessário
          while (code.length % 4 !== 0) code += '=';
          var json = atob(code);
          var config = JSON.parse(json);

          // Limpa configurações atuais
          PERF_STORAGE_KEYS.forEach(function (key) {
            localStorage.removeItem(key);
          });

          // Aplica novas configurações
          for (var key in config) {
            if (PERF_STORAGE_KEYS.indexOf(key) !== -1) {
              localStorage.setItem(key, config[key]);
            }
          }
          return true;
        } catch (e) {
          return false;
        }
      }

      // Botão de Export (copia código)
      var exportBtn = doc.createElement('button');
      exportBtn.style.cssText =
        'flex:1;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;';
      exportBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        t('Exportar');
      exportBtn.onmouseenter = function () {
        exportBtn.style.background = 'var(--theme-bg-hover)';
      };
      exportBtn.onmouseleave = function () {
        exportBtn.style.background = 'var(--theme-bg-secondary)';
      };
      exportBtn.onclick = function () {
        var code = generatePerfCode();
        navigator.clipboard.writeText(code).then(function () {
          var originalText = exportBtn.innerHTML;
          exportBtn.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
            t('Copiado!');
          exportBtn.style.borderColor = '#22c55e';
          setTimeout(function () {
            exportBtn.innerHTML = originalText;
            exportBtn.style.borderColor = '';
          }, 2000);
        });
      };

      // Botão de Import (cola código)
      var importBtn = doc.createElement('button');
      importBtn.style.cssText =
        'flex:1;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;';
      importBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
        t('Importar');
      importBtn.onmouseenter = function () {
        importBtn.style.background = 'var(--theme-bg-hover)';
      };
      importBtn.onmouseleave = function () {
        importBtn.style.background = 'var(--theme-bg-secondary)';
      };
      importBtn.onclick = function () {
        var originalText = importBtn.innerHTML;
        navigator.clipboard
          .readText()
          .then(function (code) {
            code = code.trim();
            if (!code) {
              importBtn.innerHTML =
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                t('Clipboard vazio');
              importBtn.style.borderColor = '#dc2626';
              setTimeout(function () {
                importBtn.innerHTML = originalText;
                importBtn.style.borderColor = '';
              }, 2000);
              return;
            }
            if (applyPerfCode(code)) {
              importBtn.innerHTML =
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
                t('Aplicado! Recarregue');
              importBtn.style.borderColor = '#22c55e';
              setTimeout(function () {
                importBtn.innerHTML = originalText;
                importBtn.style.borderColor = '';
              }, 3000);
            } else {
              importBtn.innerHTML =
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                t('Código inválido');
              importBtn.style.borderColor = '#dc2626';
              setTimeout(function () {
                importBtn.innerHTML = originalText;
                importBtn.style.borderColor = '';
              }, 2000);
            }
          })
          .catch(function () {
            importBtn.innerHTML =
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
              t('Sem permissão');
            importBtn.style.borderColor = '#dc2626';
            setTimeout(function () {
              importBtn.innerHTML = originalText;
              importBtn.style.borderColor = '';
            }, 2000);
          });
      };

      exportImportSection.appendChild(exportBtn);
      exportImportSection.appendChild(importBtn);
      container.appendChild(exportImportSection);

      // Dica sobre os botões
      var exportImportTip = doc.createElement('div');
      exportImportTip.style.cssText = 'color:var(--theme-text-muted);font-size:10px;margin-top:6px;text-align:center;';
      exportImportTip.textContent = t('Compartilhe suas configurações de desempenho com amigos!');
      container.appendChild(exportImportTip);

      perfSection.appendChild(container);

      // Função para sincronizar checkboxes
      function updatePerfCheckboxes() {
        var miscSection = dialog.querySelector('[data-hook="miscsec"]');
        if (!miscSection) return;

        PERF_OPTIONS.forEach(function (opt) {
          var perfRow = perfSection.querySelector('[data-perf-hook="' + opt.hook + '"]');
          if (!perfRow) return;

          var originalToggle = miscSection.querySelector('[data-hook="' + opt.hook + '"]');
          if (!originalToggle) return;

          var perfCheckbox = perfRow.querySelector('.perf-checkbox');
          if (!perfCheckbox) return;
          var svg = perfCheckbox.querySelector('svg');
          if (!svg) return;

          // Verifica se o toggle está ativo - busca qualquer <i> dentro do toggle
          var icons = originalToggle.getElementsByTagName('i');
          var isToggleActive = false;
          for (var i = 0; i < icons.length; i++) {
            if (icons[i].classList.contains('icon-ok')) {
              isToggleActive = true;
              break;
            }
          }

          // Algumas opções são invertidas (mostrar = desativado para performance)
          var isInverted =
            [
              'tmisc-showavatars',
              'tmisc-shownames',
              'tmisc-showanimations',
              'tmisc-showindicator',
              'tmisc-showchat'
            ].indexOf(opt.hook) !== -1;
          var isActive = isInverted ? !isToggleActive : isToggleActive;

          if (isActive) {
            perfCheckbox.style.background = '#22c55e';
            perfCheckbox.style.borderColor = '#22c55e';
            svg.style.opacity = '1';
            svg.style.stroke = '#fff';
          } else {
            perfCheckbox.style.background = '';
            perfCheckbox.style.borderColor = '';
            svg.style.opacity = '0';
          }
        });
      }

      // Insere a seção
      var dialogContent = dialog.querySelector('.section') || dialog;
      dialogContent.parentNode.insertBefore(perfSection, dialogContent.nextSibling);

      // Handler para mostrar a seção
      perfBtn.addEventListener('click', function () {
        var sections = dialog.querySelectorAll('.tabcontents > .section');
        for (var i = 0; i < sections.length; i++) {
          sections[i].style.display = 'none';
        }
        var themeSection = dialog.querySelector('[data-hook="theme-section"]');
        if (themeSection) themeSection.style.display = 'none';

        perfSection.style.display = 'block';

        // Aumenta o tamanho do dialog para caber tudo
        dialog.style.maxHeight = '90vh';
        dialog.style.height = 'auto';
        var tabcontents = dialog.querySelector('.tabcontents');
        if (tabcontents) {
          tabcontents.style.maxHeight = 'calc(90vh - 100px)';
          tabcontents.style.overflowY = 'auto';
        }

        updatePerfCheckboxes();

        var allTabs = tabs.querySelectorAll('button');
        for (var i = 0; i < allTabs.length; i++) {
          allTabs[i].classList.remove('selected');
        }
        perfBtn.classList.add('selected');
      });

      // Esconde quando outras tabs são clicadas
      var originalTabs = tabs.querySelectorAll('button:not([data-hook="perfbtn"])');
      for (var i = 0; i < originalTabs.length; i++) {
        originalTabs[i].addEventListener('click', function () {
          perfSection.style.display = 'none';
          // Reseta o tamanho do dialog
          dialog.style.maxHeight = '';
          dialog.style.height = '';
          var tabcontents = dialog.querySelector('.tabcontents');
          if (tabcontents) {
            tabcontents.style.maxHeight = '';
            tabcontents.style.overflowY = '';
          }
        });
      }

      return perfBtn;
    }

    // Cria a aba de Multi-Auth
    function createMultiAuthTab(doc, tabs) {
      if (tabs.querySelector('button[data-hook="multiauthbtn"]')) return;

      var multiAuthBtn = doc.createElement('button');
      multiAuthBtn.setAttribute('data-hook', 'multiauthbtn');
      multiAuthBtn.textContent = t('Multi-Auth');
      multiAuthBtn.style.display = 'none';
      tabs.appendChild(multiAuthBtn);

      var multiAuthSection = doc.createElement('section');
      multiAuthSection.className = 'multiauth-section section';
      multiAuthSection.setAttribute('data-hook', 'multiauth-section');
      multiAuthSection.style.display = 'none';

      // Constantes
      var MAX_AUTHS = 5;
      var STORAGE_KEY = 'haxdesk_multi_auths';
      var CURRENT_AUTH_KEY = 'player_auth_key';

      // Funções de gerenciamento
      function getStoredAuths() {
        try {
          var data = localStorage.getItem(STORAGE_KEY);
          return data ? JSON.parse(data) : [];
        } catch (e) {
          return [];
        }
      }

      function saveAuths(auths) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auths));
      }

      function getCurrentAuth() {
        return localStorage.getItem(CURRENT_AUTH_KEY) || '';
      }

      function setCurrentAuth(authKey) {
        if (authKey) {
          localStorage.setItem(CURRENT_AUTH_KEY, authKey);
        }
      }

      function truncateAuth(auth) {
        if (!auth || auth.length < 20) return auth || '';
        return auth.substring(0, 8) + '...' + auth.substring(auth.length - 8);
      }

      function isValidAuth(auth) {
        // Formato: idkey.xxx.xxx.xxx (4 partes separadas por ponto)
        if (!auth || typeof auth !== 'string') return false;
        var parts = auth.split('.');
        return parts.length === 4 && parts[0].length > 0;
      }

      // Container principal
      var container = doc.createElement('div');
      container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

      // Header com auth atual
      var header = doc.createElement('div');
      header.style.cssText =
        'color:var(--theme-text-muted);font-size:11px;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);';

      var currentAuth = getCurrentAuth();
      var auths = getStoredAuths();
      var currentAuthObj = auths.find(function (a) {
        return a.key === currentAuth;
      });
      var currentName = currentAuthObj ? currentAuthObj.name : '';

      if (currentAuth) {
        header.innerHTML =
          t('Auth atual: ') +
          '<span style="color:var(--theme-text-primary);font-family:monospace;">' +
          truncateAuth(currentAuth) +
          '</span>' +
          (currentName ? ' (' + currentName + ')' : '');
      } else {
        header.innerHTML = t('Nenhuma auth ativa. Máximo de 5 auths.');
      }
      container.appendChild(header);

      function updateHeader() {
        var current = getCurrentAuth();
        var authsList = getStoredAuths();
        var found = authsList.find(function (a) {
          return a.key === current;
        });
        var name = found ? found.name : '';

        if (current) {
          header.innerHTML =
            t('Auth atual: ') +
            '<span style="color:var(--theme-text-primary);font-family:monospace;">' +
            truncateAuth(current) +
            '</span>' +
            (name ? ' (' + name + ')' : '');
        } else {
          header.innerHTML = t('Nenhuma auth ativa. Máximo de 5 auths.');
        }
      }

      // Lista de auths salvas
      var listContainer = doc.createElement('div');
      listContainer.style.cssText = 'display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;';

      function renderAuthList() {
        listContainer.innerHTML = '';
        var auths = getStoredAuths();
        var currentAuth = getCurrentAuth();

        if (auths.length === 0) {
          var emptyMsg = doc.createElement('div');
          emptyMsg.style.cssText = 'color:var(--theme-text-muted);font-size:12px;text-align:center;padding:20px;';
          emptyMsg.textContent = t('Nenhuma auth salva. Adicione uma abaixo.');
          listContainer.appendChild(emptyMsg);
          return;
        }

        auths.forEach(function (authObj, index) {
          var row = doc.createElement('div');
          row.style.cssText =
            'display:flex;align-items:center;gap:8px;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;';

          var isActive = authObj.key === currentAuth;
          if (isActive) {
            row.style.borderColor = '#22c55e';
            row.style.background = 'rgba(34, 197, 94, 0.1)';
          }

          // Indicador de ativo
          var indicator = doc.createElement('div');
          indicator.style.cssText =
            'width:8px;height:8px;border-radius:50%;flex-shrink:0;' +
            (isActive ? 'background:#22c55e;' : 'background:var(--theme-border);');
          row.appendChild(indicator);

          // Info
          var info = doc.createElement('div');
          info.style.cssText = 'flex:1;min-width:0;';

          var name = doc.createElement('div');
          name.style.cssText =
            'color:var(--theme-text-primary);font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
          name.textContent = authObj.name || t('Auth ') + (index + 1);
          info.appendChild(name);

          var keyPreview = doc.createElement('div');
          keyPreview.style.cssText = 'color:var(--theme-text-muted);font-size:10px;font-family:monospace;';
          keyPreview.textContent = truncateAuth(authObj.key);
          info.appendChild(keyPreview);

          row.appendChild(info);

          // Botão usar
          if (!isActive) {
            var useBtn = doc.createElement('button');
            useBtn.style.cssText =
              'padding:6px 12px;background:#3b82f6;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;';
            useBtn.textContent = t('Usar');
            useBtn.onmouseenter = function () {
              useBtn.style.background = '#2563eb';
            };
            useBtn.onmouseleave = function () {
              useBtn.style.background = '#3b82f6';
            };
            useBtn.onclick = function () {
              setCurrentAuth(authObj.key);
              updateHeader();
              renderAuthList();
              if (window.showToast) {
                window.showToast(t('Auth alterada! Feche e abra o app para aplicar.'), 'success');
              }
            };
            row.appendChild(useBtn);
          }

          // Botão remover
          var removeBtn = doc.createElement('button');
          removeBtn.style.cssText =
            'padding:6px 8px;background:transparent;border:1px solid var(--theme-border);border-radius:4px;color:var(--theme-text-muted);font-size:11px;cursor:pointer;';
          removeBtn.innerHTML =
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
          removeBtn.onmouseenter = function () {
            removeBtn.style.borderColor = '#dc2626';
            removeBtn.style.color = '#dc2626';
          };
          removeBtn.onmouseleave = function () {
            removeBtn.style.borderColor = '';
            removeBtn.style.color = '';
          };
          removeBtn.onclick = function () {
            var newAuths = auths.filter(function (_, i) {
              return i !== index;
            });
            saveAuths(newAuths);
            renderAuthList();
            if (window.showToast) {
              window.showToast(t('Auth removida'), 'info');
            }
          };
          row.appendChild(removeBtn);

          listContainer.appendChild(row);
        });
      }

      container.appendChild(listContainer);

      // Seção de adicionar nova auth
      var addSection = doc.createElement('div');
      addSection.style.cssText = 'margin-top:12px;padding-top:12px;border-top:1px solid var(--theme-border);';

      var addLabel = doc.createElement('div');
      addLabel.style.cssText = 'color:var(--theme-text-primary);font-size:12px;font-weight:500;margin-bottom:8px;';
      addLabel.textContent = t('Adicionar Nova Auth');
      addSection.appendChild(addLabel);

      // Input nome
      var nameInput = doc.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = t('Nome (opcional)');
      nameInput.style.cssText =
        'width:100%;padding:8px 12px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;margin-bottom:8px;box-sizing:border-box;';
      addSection.appendChild(nameInput);

      // Input auth key
      var authInput = doc.createElement('input');
      authInput.type = 'text';
      authInput.placeholder = t('Auth Key (ex: idkey.xxx.xxx.xxx)');
      authInput.style.cssText =
        'width:100%;padding:8px 12px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;margin-bottom:8px;box-sizing:border-box;font-family:monospace;';
      addSection.appendChild(authInput);

      // Botões
      var btnRow = doc.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:8px;';

      // Botão adicionar
      var addBtn = doc.createElement('button');
      addBtn.style.cssText =
        'flex:1;padding:10px;background:#22c55e;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;';
      addBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        t('Adicionar');
      addBtn.onmouseenter = function () {
        addBtn.style.background = '#16a34a';
      };
      addBtn.onmouseleave = function () {
        addBtn.style.background = '#22c55e';
      };
      addBtn.onclick = function () {
        var authKey = authInput.value.trim();
        var authName = nameInput.value.trim();

        if (!authKey) {
          if (window.showToast) window.showToast(t('Digite uma auth key'), 'error');
          return;
        }

        if (!isValidAuth(authKey)) {
          if (window.showToast) window.showToast(t('Formato inválido. Use: idkey.xxx.xxx.xxx'), 'error');
          return;
        }

        var auths = getStoredAuths();

        // Verifica duplicata
        var exists = auths.some(function (a) {
          return a.key === authKey;
        });
        if (exists) {
          if (window.showToast) window.showToast(t('Esta auth já está salva'), 'error');
          return;
        }

        if (auths.length >= MAX_AUTHS) {
          if (window.showToast) window.showToast(t('Limite de ' + MAX_AUTHS + ' auths atingido'), 'error');
          return;
        }

        auths.push({ name: authName || '', key: authKey });
        saveAuths(auths);

        authInput.value = '';
        nameInput.value = '';
        renderAuthList();

        if (window.showToast) window.showToast(t('Auth adicionada!'), 'success');
      };
      btnRow.appendChild(addBtn);

      // Botão salvar atual
      var saveCurrentBtn = doc.createElement('button');
      saveCurrentBtn.style.cssText =
        'padding:10px 16px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;cursor:pointer;';
      saveCurrentBtn.textContent = t('Salvar Atual');
      saveCurrentBtn.onmouseenter = function () {
        saveCurrentBtn.style.background = 'var(--theme-bg-hover)';
      };
      saveCurrentBtn.onmouseleave = function () {
        saveCurrentBtn.style.background = 'var(--theme-bg-secondary)';
      };
      saveCurrentBtn.onclick = function () {
        var currentAuth = getCurrentAuth();
        if (!currentAuth) {
          if (window.showToast) window.showToast(t('Nenhuma auth atual para salvar'), 'error');
          return;
        }

        var auths = getStoredAuths();
        var exists = auths.some(function (a) {
          return a.key === currentAuth;
        });
        if (exists) {
          if (window.showToast) window.showToast(t('Auth atual já está salva'), 'info');
          return;
        }

        if (auths.length >= MAX_AUTHS) {
          if (window.showToast) window.showToast(t('Limite de ' + MAX_AUTHS + ' auths atingido'), 'error');
          return;
        }

        var authName = nameInput.value.trim() || t('Auth ') + (auths.length + 1);
        auths.push({ name: authName, key: currentAuth });
        saveAuths(auths);
        nameInput.value = '';
        renderAuthList();

        if (window.showToast) window.showToast(t('Auth atual salva!'), 'success');
      };
      btnRow.appendChild(saveCurrentBtn);

      addSection.appendChild(btnRow);
      container.appendChild(addSection);

      // Dica
      var tip = doc.createElement('div');
      tip.style.cssText =
        'color:var(--theme-text-muted);font-size:10px;margin-top:12px;padding:8px;background:var(--theme-bg-secondary);border-radius:6px;';
      tip.textContent = t('Após trocar de auth, feche e abra o app para aplicar.');
      container.appendChild(tip);

      multiAuthSection.appendChild(container);

      // Renderiza lista inicial
      renderAuthList();

      // Insere a seção
      var dialogContent = dialog.querySelector('.section') || dialog;
      dialogContent.parentNode.insertBefore(multiAuthSection, dialogContent.nextSibling);

      // Handler para mostrar a seção
      multiAuthBtn.addEventListener('click', function () {
        var sections = dialog.querySelectorAll('.tabcontents > .section');
        for (var i = 0; i < sections.length; i++) {
          sections[i].style.display = 'none';
        }
        var themeSection = dialog.querySelector('[data-hook="theme-section"]');
        if (themeSection) themeSection.style.display = 'none';
        var perfSection = dialog.querySelector('[data-hook="perf-section"]');
        if (perfSection) perfSection.style.display = 'none';

        multiAuthSection.style.display = 'block';
        updateHeader();
        renderAuthList();

        var allTabs = tabs.querySelectorAll('button');
        for (var i = 0; i < allTabs.length; i++) {
          allTabs[i].classList.remove('selected');
        }
        multiAuthBtn.classList.add('selected');
      });

      // Esconde quando outras tabs são clicadas
      var originalTabs = tabs.querySelectorAll('button:not([data-hook="multiauthbtn"])');
      for (var i = 0; i < originalTabs.length; i++) {
        originalTabs[i].addEventListener('click', function () {
          multiAuthSection.style.display = 'none';
        });
      }

      return multiAuthBtn;
    }

    // Função para criar botão na sidebar
    var sidebarButtons = [];
    var pendingButtons = {};

    function createSidebarButton(originalBtn) {
      var hook = originalBtn.getAttribute('data-hook');

      // Já existe botão para esse hook
      if (sidebar.querySelector('[data-hook-ref="' + hook + '"]')) return;

      var iconData = tabIcons[hook] || {
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
        tooltip: originalBtn.textContent,
        order: 99
      };

      var sidebarBtn = doc.createElement('button');
      sidebarBtn.className = 'settings-sidebar-btn';
      sidebarBtn.setAttribute('data-hook-ref', hook);
      sidebarBtn.setAttribute('data-order', iconData.order || 99);
      sidebarBtn.innerHTML = iconData.icon;

      if (originalBtn.classList.contains('selected')) {
        sidebarBtn.classList.add('selected');
      }

      addTooltip(sidebarBtn, iconData.tooltip);

      sidebarBtn.onclick = function () {
        // Remove selected de todos os botões da sidebar
        var allBtns = sidebar.querySelectorAll('.settings-sidebar-btn:not([data-close])');
        for (var j = 0; j < allBtns.length; j++) {
          allBtns[j].classList.remove('selected');
        }
        sidebarBtn.classList.add('selected');

        // Esconde a seção de temas se não for o botão de temas
        if (hook !== 'themebtn') {
          var themeSection = dialog.querySelector('[data-hook="theme-section"]');
          if (themeSection) themeSection.style.display = 'none';
        }

        // Esconde a seção de desempenho se não for o botão de desempenho
        if (hook !== 'perfbtn') {
          var perfSection = dialog.querySelector('[data-hook="perf-section"]');
          if (perfSection) perfSection.style.display = 'none';
          // Reseta o tamanho do dialog
          dialog.style.maxHeight = '';
          dialog.style.height = '';
          var tabcontents = dialog.querySelector('.tabcontents');
          if (tabcontents) {
            tabcontents.style.maxHeight = '';
            tabcontents.style.overflowY = '';
          }
        }

        // Esconde a seção de multi-auth se não for o botão de multi-auth
        if (hook !== 'multiauthbtn') {
          var multiAuthSection = dialog.querySelector('[data-hook="multiauth-section"]');
          if (multiAuthSection) multiAuthSection.style.display = 'none';
        }

        // Mostra as sections originais se não for tema, desempenho ou multiauth
        if (hook !== 'themebtn' && hook !== 'perfbtn' && hook !== 'multiauthbtn') {
          var sections = dialog.querySelectorAll('.tabcontents > .section');
          for (var k = 0; k < sections.length; k++) {
            sections[k].style.display = '';
          }
        }

        // Clica no botão original
        originalBtn.click();
      };

      // Sincroniza quando o botão original é clicado
      originalBtn.addEventListener('click', function () {
        var allBtns = sidebar.querySelectorAll('.settings-sidebar-btn:not([data-close])');
        for (var j = 0; j < allBtns.length; j++) {
          allBtns[j].classList.remove('selected');
        }
        sidebarBtn.classList.add('selected');
      });

      pendingButtons[hook] = sidebarBtn;
      sidebarButtons.push(sidebarBtn);
    }

    function insertButtonsInOrder() {
      var spacer = sidebar.querySelector('[data-spacer]');

      // Ordena pelos hooks na ordem definida
      for (var i = 0; i < tabOrder.length; i++) {
        var hook = tabOrder[i];
        if (pendingButtons[hook]) {
          if (spacer) {
            sidebar.insertBefore(pendingButtons[hook], spacer);
          } else {
            sidebar.appendChild(pendingButtons[hook]);
          }
        }
      }
    }

    // Cria botões para tabs existentes
    var tabButtons = tabs ? tabs.querySelectorAll('button') : [];
    for (var i = 0; i < tabButtons.length; i++) {
      createSidebarButton(tabButtons[i]);
    }

    // Cria a aba de temas
    if (tabs) {
      var themeTabBtn = createThemeTab(doc, tabs);
      if (themeTabBtn) {
        createSidebarButton(themeTabBtn);
      }
    }

    // Cria a aba de desempenho
    if (tabs) {
      var perfTabBtn = createPerfTab(doc, tabs);
      if (perfTabBtn) {
        createSidebarButton(perfTabBtn);
      }
    }

    // Cria a aba de Multi-Auth
    if (tabs) {
      var multiAuthTabBtn = createMultiAuthTab(doc, tabs);
      if (multiAuthTabBtn) {
        createSidebarButton(multiAuthTabBtn);
      }
    }

    // Espaçador
    var spacer = doc.createElement('div');
    spacer.style.cssText = 'flex:1;';
    spacer.setAttribute('data-spacer', 'true');
    sidebar.appendChild(spacer);

    // Insere os botões na ordem correta
    insertButtonsInOrder();

    // Botão de fechar no final
    var closeBtn = dialog.querySelector('button[data-hook="close"]');
    if (closeBtn) {
      var sidebarCloseBtn = doc.createElement('button');
      sidebarCloseBtn.className = 'settings-sidebar-btn';
      sidebarCloseBtn.setAttribute('data-close', 'true');
      sidebarCloseBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      addTooltip(sidebarCloseBtn, t('Fechar'));
      sidebarCloseBtn.onclick = function () {
        closeBtn.click();
      };
      sidebar.appendChild(sidebarCloseBtn);
    }

    // Observer para detectar novas tabs (como Avatars do quickavatar.js, Host Token)
    if (tabs) {
      var tabsObserver = new MutationObserver(function (mutations) {
        var needsReorder = false;
        for (var m = 0; m < mutations.length; m++) {
          var added = mutations[m].addedNodes;
          for (var n = 0; n < added.length; n++) {
            if (added[n].tagName === 'BUTTON') {
              createSidebarButton(added[n]);
              needsReorder = true;
            }
          }
        }
        // Reordena os botões quando novos são adicionados
        if (needsReorder) {
          insertButtonsInOrder();
        }
      });
      tabsObserver.observe(tabs, { childList: true });
    }

    // Esconde tabs originais e botão close
    if (tabs) {
      tabs.style.display = 'none';
    }
    if (closeBtn) {
      closeBtn.style.display = 'none';
    }

    // Ajusta o dialog
    dialog.style.position = 'relative';
    dialog.appendChild(sidebar);

    Injector.log('Settings sidebar injected');
  }

  function hideTooltip() {
    var tooltip = document.getElementById('settings-sidebar-tooltip');
    if (tooltip) tooltip.style.opacity = '0';
  }

  function init() {
    if (!Injector.isGameFrame()) return;

    var checkInterval = null;

    var startChecking = function () {
      if (checkInterval) return;
      // Verifica a cada 300ms se o settings apareceu
      checkInterval = setInterval(function () {
        var settingsDialog = document.querySelector('.dialog.settings-view');
        var sidebar = document.getElementById('settings-sidebar-panel');
        if (settingsDialog && !sidebar) {
          modifySettingsDialog(document);
        }
      }, 300);
    };

    var stopChecking = function () {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      hideTooltip();
    };

    // Sempre mantém o checking ativo (settings pode abrir em qualquer view)
    startChecking();

    Injector.log('Settings sidebar module loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
