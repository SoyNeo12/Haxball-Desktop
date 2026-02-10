// ============================================
// STYLES - Estilos customizados (igual Electron)
// ============================================
(function () {
  // Só executa dentro do iframe do jogo
  if (Injector.isMainFrame()) return;

  // Códigos de países para bandeiras
  var COUNTRY_CODES = [
    'ad',
    'ae',
    'af',
    'ag',
    'ai',
    'al',
    'am',
    'ao',
    'aq',
    'ar',
    'as',
    'at',
    'au',
    'aw',
    'ax',
    'az',
    'ba',
    'bb',
    'bd',
    'be',
    'bf',
    'bg',
    'bh',
    'bi',
    'bj',
    'bl',
    'bm',
    'bn',
    'bo',
    'bq',
    'br',
    'bs',
    'bt',
    'bv',
    'bw',
    'by',
    'bz',
    'ca',
    'cc',
    'cd',
    'cf',
    'cg',
    'ch',
    'ci',
    'ck',
    'cl',
    'cm',
    'cn',
    'co',
    'cr',
    'cu',
    'cv',
    'cw',
    'cx',
    'cy',
    'cz',
    'de',
    'dj',
    'dk',
    'dm',
    'do',
    'dz',
    'ec',
    'ee',
    'eg',
    'eh',
    'er',
    'es',
    'et',
    'fi',
    'fj',
    'fk',
    'fm',
    'fo',
    'fr',
    'ga',
    'gb',
    'gd',
    'ge',
    'gf',
    'gg',
    'gh',
    'gi',
    'gl',
    'gm',
    'gn',
    'gp',
    'gq',
    'gr',
    'gs',
    'gt',
    'gu',
    'gw',
    'gy',
    'hk',
    'hm',
    'hn',
    'hr',
    'ht',
    'hu',
    'id',
    'ie',
    'il',
    'im',
    'in',
    'io',
    'iq',
    'ir',
    'is',
    'it',
    'je',
    'jm',
    'jo',
    'jp',
    'ke',
    'kg',
    'kh',
    'ki',
    'km',
    'kn',
    'kp',
    'kr',
    'kw',
    'ky',
    'kz',
    'la',
    'lb',
    'lc',
    'li',
    'lk',
    'lr',
    'ls',
    'lt',
    'lu',
    'lv',
    'ly',
    'ma',
    'mc',
    'md',
    'me',
    'mf',
    'mg',
    'mh',
    'mk',
    'ml',
    'mm',
    'mn',
    'mo',
    'mp',
    'mq',
    'mr',
    'ms',
    'mt',
    'mu',
    'mv',
    'mw',
    'mx',
    'my',
    'mz',
    'na',
    'nc',
    'ne',
    'nf',
    'ng',
    'ni',
    'nl',
    'no',
    'np',
    'nr',
    'nu',
    'nz',
    'om',
    'pa',
    'pe',
    'pf',
    'pg',
    'ph',
    'pk',
    'pl',
    'pm',
    'pn',
    'pr',
    'ps',
    'pt',
    'pw',
    'py',
    'qa',
    're',
    'ro',
    'rs',
    'ru',
    'rw',
    'sa',
    'sb',
    'sc',
    'sd',
    'se',
    'sg',
    'sh',
    'si',
    'sj',
    'sk',
    'sl',
    'sm',
    'sn',
    'so',
    'sr',
    'ss',
    'st',
    'sv',
    'sx',
    'sy',
    'sz',
    'tc',
    'td',
    'tf',
    'tg',
    'th',
    'tj',
    'tk',
    'tl',
    'tm',
    'tn',
    'to',
    'tr',
    'tt',
    'tv',
    'tw',
    'tz',
    'ua',
    'ug',
    'um',
    'us',
    'uy',
    'uz',
    'va',
    'vc',
    've',
    'vg',
    'vi',
    'vn',
    'vu',
    'wf',
    'ws',
    'xk',
    'ye',
    'yt',
    'za',
    'zm',
    'zw'
  ];

  // Gera CSS das bandeiras
  function generateFlagCSS() {
    var css = '';
    for (var i = 0; i < COUNTRY_CODES.length; i++) {
      var code = COUNTRY_CODES[i];
      css +=
        '.flagico.f-' +
        code +
        ' { background-image: url("https://flagicons.lipis.dev/flags/4x3/' +
        code +
        '.svg") !important; background-size: contain !important; background-repeat: no-repeat !important; background-position: center !important; } ';
    }
    return css;
  }

  var MAIN_STYLES =
    '\
        /* Variáveis de tema - só aplica se não for tema padrão */\
        :root:not([data-theme="default"]) {\
            --theme-bg-primary: #141414;\
            --theme-bg-secondary: #1a1a1a;\
            --theme-bg-tertiary: #272727;\
            --theme-bg-hover: #333;\
            --theme-bg-selected: #222;\
            --theme-border: #232323;\
            --theme-border-light: #333;\
            --theme-text-primary: #fff;\
            --theme-text-secondary: #888;\
            --theme-text-muted: #666;\
            --theme-scrollbar-track: #1a1a1a;\
            --theme-scrollbar-thumb: #555;\
            --theme-scrollbar-thumb-hover: #666;\
            --theme-tooltip-bg: #222;\
            --theme-tooltip-border: #333;\
        }\
        \
        /* Background do iframe - só aplica se não for tema padrão */\
        html:not([data-theme="default"]) body,\
        body:not([data-theme="default"]) {\
            background: var(--theme-bg-primary) !important;\
            background-color: var(--theme-bg-primary) !important;\
        }\
        \
        /* Fonte global */\
        * { font-family: "Space Grotesk", sans-serif !important; }\
        \
        /* Botões - só aplica tema se não for default */\
        html:not([data-theme="default"]) button {\
            background: var(--theme-bg-tertiary) !important;\
            border: none !important;\
            border-radius: 4px !important;\
            color: var(--theme-text-primary) !important;\
        }\
        html:not([data-theme="default"]) button:hover {\
            background: var(--theme-bg-hover) !important;\
        }\
        /* Dialog base - cor sólida (sem blur pra não afetar FPS) */\
        html:not([data-theme="default"]) .dialog,\
        html:not([data-theme="default"]) .dialog.section {\
            background: var(--theme-bg-primary) !important;\
            background-color: var(--theme-bg-primary) !important;\
            border: 1px solid var(--theme-border) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        \
        /* Esconde elementos desnecessários */\
        img[src="images/haxball.png"] { display: none !important; }\
        button[data-hook="changenick"] { display: none !important; }\
        #translateDisclaimer { display: none !important; }\
        #toggleChat > span { display: none !important; }\
        .navbar { display: none !important; }\
        \
        /* Separadores - esconde */\
        .separator {\
            display: none !important;\
        }\
        \
        /* Scoreboard e Timer - só aplica tema se não for default */\
        html:not([data-theme="default"]) .bar { background: var(--theme-bg-primary) !important; }\
        .scoreboard, .scoreboard *, .game-timer-view, .game-timer-view * {\
            font-family: "Space Grotesk", sans-serif !important;\
        }\
        .scoreboard, .scoreboard * { font-weight: bold !important; }\
        html:not([data-theme="default"]) .scoreboard {\
            background: var(--theme-bg-primary) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        \
        /* Desabilita animação do timer (melhora ~150 FPS) */\
        .game-timer-view, .game-timer-view * {\
            animation: none !important;\
            -webkit-animation: none !important;\
        }\
        html:not([data-theme="default"]) .game-timer-view:not(.time-warn),\
        html:not([data-theme="default"]) .game-timer-view:not(.time-warn) * {\
            color: var(--theme-text-primary) !important;\
        }\
        .game-timer-view .digit {\
            opacity: 1 !important;\
            visibility: visible !important;\
        }\
        /* Timer vermelho quando tempo acabando */\
        .game-timer-view.time-warn, .game-timer-view.time-warn * {\
            color: #e74c3c !important;\
        }\
        \
        /* Dialog base */\
        .dialog {\
            position: fixed !important;\
            top: 50% !important;\
            left: 50% !important;\
            transform: translate(-50%, -50%) !important;\
            margin: 0 !important;\
            overflow: visible !important;\
        }\
        html:not([data-theme="default"]) .dialog {\
            background: var(--theme-bg-primary) !important;\
            border-color: var(--theme-border) !important;\
        }\
        .dialog * {\
            user-select: none !important;\
        }\
        .dialog input, .dialog textarea { user-select: text !important; -webkit-user-select: text !important; }\
        .chatbox-view, .chatbox-view *, .chatbox-view p, .log, .log *, .log p, .log-contents, .log-contents *, .log-contents p { user-select: text !important; -webkit-user-select: text !important; cursor: text !important; }\
        html:not([data-theme="default"]) .dialog h1 {\
            text-align: center !important;\
            border-bottom-color: var(--theme-border) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .roomlist-view .dialog h1 {\
            margin-bottom: 12px !important;\
        }\
        .dialog button {\
            background: var(--theme-bg-tertiary) !important;\
            border: none !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .dialog button:hover { background: var(--theme-bg-selected) !important; }\
        /* Selects */\
        .dialog select, select {\
            background: var(--theme-bg-secondary) !important;\
            border: 1px solid var(--theme-border-light) !important;\
            border-radius: 4px !important;\
            color: var(--theme-text-primary) !important;\
            padding: 8px 30px 8px 12px !important;\
            font-size: 13px !important;\
            line-height: 1.4 !important;\
            min-height: 36px !important;\
            -webkit-appearance: none !important;\
            appearance: none !important;\
            cursor: pointer !important;\
        }\
        .dialog select option {\
            background: var(--theme-bg-secondary) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        \
        /* Inputs */\
        .label-input {\
            border: none !important;\
            box-shadow: none !important;\
            background: transparent !important;\
            padding: 0 !important;\
            margin: 0 0 15px 0 !important;\
        }\
        .label-input label { display: none !important; }\
        .label-input input, .label-input input[data-hook="input"] {\
            width: 100% !important;\
            box-sizing: border-box !important;\
            background: var(--theme-bg-secondary) !important;\
            border: 1px solid var(--theme-border-light) !important;\
            border-radius: 4px !important;\
            padding: 8px 10px !important;\
            color: var(--theme-text-primary) !important;\
            font-size: 13px !important;\
            outline: none !important;\
        }\
        .label-input input:focus { border-color: #444 !important; }\
        .label-input input::placeholder { color: var(--theme-text-muted) !important; }\
        \
        /* Room view e Game view (menu ESC) */\
        .room-view .container,\
        .game-view .container {\
            background: var(--theme-bg-primary) !important;\
            border: 1px solid var(--theme-border) !important;\
            border-radius: 8px !important;\
        }\
        .room-view select,\
        .game-view select {\
            background: var(--theme-bg-secondary) !important;\
            border: 1px solid var(--theme-border-light) !important;\
            border-radius: 4px !important;\
            color: var(--theme-text-primary) !important;\
            padding: 0 30px 0 12px !important;\
            font-size: 13px !important;\
            line-height: 36px !important;\
            min-width: 120px !important;\
            height: 36px !important;\
            box-sizing: border-box !important;\
            -webkit-appearance: none !important;\
            appearance: none !important;\
        }\
        .room-view select:disabled,\
        .game-view select:disabled {\
            opacity: 0.6 !important;\
            cursor: not-allowed !important;\
        }\
        .room-view button,\
        .game-view button {\
            background: var(--theme-bg-tertiary) !important;\
            border: none !important;\
            border-radius: 4px !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .room-view button:hover,\
        .game-view button:hover {\
            background: var(--theme-bg-selected) !important;\
        }\
        .room-view .list.thin-scrollbar,\
        .game-view .list.thin-scrollbar {\
            background: var(--theme-bg-primary) !important;\
            border: 1px solid var(--theme-border) !important;\
            border-radius: 4px !important;\
        }\
        .room-view .list tr:hover,\
        .game-view .list tr:hover {\
            background: var(--theme-bg-selected) !important;\
        }\
        .room-view .list tr.highlight,\
        .game-view .list tr.highlight,\
        .room-view .list tr.selected,\
        .game-view .list tr.selected,\
        .room-view .list tr:focus,\
        .game-view .list tr:focus,\
        .room-view .list tr[class*="select"],\
        .game-view .list tr[class*="select"] {\
            background: var(--theme-bg-selected) !important;\
            outline: none !important;\
        }\
        .room-view .list tr::selection,\
        .game-view .list tr::selection,\
        .room-view .list td::selection,\
        .game-view .list td::selection {\
            background: var(--theme-bg-selected) !important;\
        }\
        .room-view .list,\
        .game-view .list {\
            user-select: none !important;\
        }\
        .room-view .settings,\
        .game-view .settings {\
            background: var(--theme-bg-secondary) !important;\
            border: 1px solid var(--theme-border) !important;\
            border-radius: 4px !important;\
            min-width: 350px !important;\
            padding: 15px 20px !important;\
        }\
        h1[data-hook="room-name"] {\
            border-bottom: 1px solid var(--theme-border) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        div.buttons {\
            background: var(--theme-bg-primary) !important;\
        }\
        \
        /* Room list */\
        .roomlist-view .dialog > p:not([data-hook]) { display: none !important; }\
        .roomlist-view span.bool { display: none !important; }\
        .roomlist-view .dialog { width: 900px !important; max-width: 95vw !important; }\
        .roomlist-view table.header {\
            background: #1a1a1a !important;\
            border-radius: 6px !important;\
            padding: 8px 0 !important;\
            margin-bottom: 8px !important;\
        }\
        body[data-theme="light"] .roomlist-view table.header {\
            background: #d5d5d5 !important;\
        }\
        body[data-theme="onix"] .roomlist-view table.header {\
            background: #000000 !important;\
        }\
        .roomlist-view span[data-hook="distance"] { display: none !important; }\
        .roomlist-view [data-hook="flag"] { display: block !important; margin: 0 auto !important; }\
        .roomlist-view td[data-hook="pass"],\
        .roomlist-view table.header td:nth-child(3) { display: none !important; }\
        .roomlist-view table.header tr,\
        .roomlist-view .content table tr {\
            display: flex !important;\
            width: 100% !important;\
            gap: 10px !important;\
            align-items: center !important;\
            position: relative !important;\
            padding-right: 170px !important;\
        }\
        .roomlist-view .content table tr.search-hidden { display: none !important; }\
        .roomlist-view .content table tr.fav-hidden { display: none !important; }\
        .roomlist-view .content table tr.selected {\
            background: var(--theme-bg-tertiary) !important;\
            border-radius: 4px !important;\
        }\
        .roomlist-view .content table tr:hover {\
            background: var(--theme-bg-selected) !important;\
            border-radius: 4px !important;\
        }\
        /* Preserva cor amarela dos favoritos */\
        .roomlist-view td[data-hook="name"][style*="f59e0b"],\
        .roomlist-view .fav-room,\
        td.fav-room,\
        [data-hook="name"].fav-room {\
            color: #f59e0b !important;\
        }\
        /* Salas fixadas - destaque azul */\
        .roomlist-view .content table tr.pinned-room {\
            background: rgba(59, 130, 246, 0.1) !important;\
            border-left: 3px solid #3b82f6 !important;\
        }\
        .roomlist-view .content table tr.pinned-room:hover {\
            background: rgba(59, 130, 246, 0.2) !important;\
        }\
        .roomlist-view table.header td:last-child,\
        .roomlist-view .content table td:last-child {\
            order: -1 !important;\
            width: 40px !important;\
            text-align: center !important;\
            flex-shrink: 0 !important;\
        }\
        .roomlist-view table.header td:first-child {\
            flex: 1 !important;\
            text-align: left !important;\
            padding-left: 80px !important;\
        }\
        .roomlist-view .content table td:first-child { flex: 1 !important; text-align: left !important; }\
        .roomlist-view td[data-hook="players"],\
        .roomlist-view table.header td:nth-child(2) {\
            position: absolute !important;\
            right: 0 !important;\
            width: 90px !important;\
            text-align: center !important;\
        }\
        /* Botões do sidebar - só ícone */\
        #sidebar-panel button,\
        #sidebar-panel label[for="replayfile"] {\
            display: flex !important;\
            align-items: center !important;\
            justify-content: center !important;\
            width: 36px !important;\
            height: 36px !important;\
            padding: 0 !important;\
            font-size: 0 !important;\
            background: var(--theme-bg-tertiary) !important;\
            border: none !important;\
            border-radius: 4px !important;\
            cursor: pointer !important;\
            color: var(--theme-text-primary) !important;\
        }\
        #sidebar-panel button:hover,\
        #sidebar-panel label[for="replayfile"]:hover {\
            background: var(--theme-bg-hover) !important;\
        }\
        #sidebar-panel svg {\
            width: 16px !important;\
            height: 16px !important;\
        }\
        #room-search-input { border: none !important; background: var(--theme-bg-tertiary) !important; color: var(--theme-text-primary) !important; }\
        #room-search-input:focus { border: none !important; outline: none !important; }\
        #country-filter-btn { background: var(--theme-bg-tertiary) !important; border: none !important; }\
        #country-filter-btn:hover { background: var(--theme-bg-hover) !important; }\
        #country-dropdown {\
            background: var(--theme-bg-secondary) !important;\
            border: 1px solid var(--theme-border-light) !important;\
            overflow-y: scroll !important;\
        }\
        #country-dropdown::-webkit-scrollbar { width: 8px !important; }\
        #country-dropdown::-webkit-scrollbar-track { background: var(--theme-scrollbar-track) !important; border-radius: 4px !important; }\
        #country-dropdown::-webkit-scrollbar-thumb { background: var(--theme-scrollbar-thumb) !important; border-radius: 4px !important; }\
        #country-dropdown::-webkit-scrollbar-thumb:hover { background: var(--theme-scrollbar-thumb-hover) !important; }\
        \
        /* Choose nickname dialog - esconde até processar */\
        .choose-nickname-view .dialog h1,\
        .choose-nickname-view .dialog .label-input,\
        .choose-nickname-view .dialog button[data-hook="ok"] {\
            display: none !important;\
        }\
        /* Settings sidebar */\
        .settings-view .dialog {\
            overflow: visible !important;\
        }\
        #settings-sidebar-panel {\
            background: var(--theme-bg-primary) !important;\
            border: 1px solid var(--theme-border) !important;\
        }\
        .settings-sidebar-btn {\
            display: flex !important;\
            align-items: center !important;\
            justify-content: center !important;\
            width: 36px !important;\
            height: 36px !important;\
            padding: 0 !important;\
            font-size: 0 !important;\
            background: var(--theme-bg-tertiary) !important;\
            border: none !important;\
            border-radius: 4px !important;\
            cursor: pointer !important;\
            color: var(--theme-text-secondary) !important;\
            transition: all 0.15s !important;\
        }\
        .settings-sidebar-btn:hover {\
            background: var(--theme-bg-hover) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .settings-sidebar-btn.selected {\
            background: var(--theme-bg-hover) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .settings-sidebar-btn svg {\
            width: 16px !important;\
            height: 16px !important;\
        }\
        \
        /* Theme section styles */\
        .theme-section {\
            padding: 20px !important;\
        }\
        .theme-container {\
            display: flex !important;\
            flex-direction: column !important;\
            gap: 24px !important;\
        }\
        .settings-group {\
            display: flex !important;\
            flex-direction: column !important;\
            gap: 12px !important;\
        }\
        .settings-group-label {\
            font-size: 13px !important;\
            font-weight: 500 !important;\
            color: var(--theme-text-secondary) !important;\
            padding-left: 2px !important;\
        }\
        .theme-options {\
            display: flex !important;\
            flex-direction: column !important;\
            gap: 8px !important;\
        }\
        .theme-option {\
            display: flex !important;\
            align-items: center !important;\
            gap: 14px !important;\
            padding: 14px 16px !important;\
            background: var(--theme-bg-secondary) !important;\
            border: 1px solid var(--theme-border) !important;\
            border-radius: 8px !important;\
            cursor: pointer !important;\
            transition: all 0.15s !important;\
            position: relative !important;\
        }\
        .theme-option:hover {\
            background: var(--theme-bg-tertiary) !important;\
            border-color: var(--theme-border-light) !important;\
        }\
        .theme-option.selected {\
            border-color: #4ade80 !important;\
            background: var(--theme-bg-tertiary) !important;\
        }\
        .theme-text {\
            display: flex !important;\
            flex-direction: column !important;\
            gap: 2px !important;\
            flex: 1 !important;\
        }\
        .theme-name {\
            font-size: 14px !important;\
            font-weight: 500 !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .theme-desc {\
            font-size: 12px !important;\
            color: var(--theme-text-muted) !important;\
        }\
        .theme-check {\
            display: none !important;\
            align-items: center !important;\
            justify-content: center !important;\
            width: 22px !important;\
            height: 22px !important;\
            background: #4ade80 !important;\
            border-radius: 50% !important;\
            color: #000 !important;\
            flex-shrink: 0 !important;\
        }\
        .theme-option.selected .theme-check {\
            display: flex !important;\
        }\
        \
        /* Range/Slider inputs */\
        input[type="range"] {\
            -webkit-appearance: none !important;\
            appearance: none !important;\
            background: var(--theme-bg-tertiary) !important;\
            border-radius: 4px !important;\
            height: 6px !important;\
            cursor: pointer !important;\
        }\
        input[type="range"]::-webkit-slider-thumb {\
            -webkit-appearance: none !important;\
            appearance: none !important;\
            width: 16px !important;\
            height: 16px !important;\
            background: var(--theme-text-primary) !important;\
            border-radius: 50% !important;\
            cursor: pointer !important;\
            border: 2px solid var(--theme-bg-primary) !important;\
            box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;\
        }\
        input[type="range"]::-moz-range-thumb {\
            width: 16px !important;\
            height: 16px !important;\
            background: var(--theme-text-primary) !important;\
            border-radius: 50% !important;\
            cursor: pointer !important;\
            border: 2px solid var(--theme-bg-primary) !important;\
        }\
        input[type="range"]::-webkit-slider-runnable-track {\
            background: var(--theme-bg-tertiary) !important;\
            border-radius: 4px !important;\
        }\
        \
        /* Cursor pointer para elementos clicáveis */\
        a, button, [role="button"], label[for], select, .clickable {\
            cursor: pointer !important;\
        }\
        \
        /* Links */\
        a {\
            color: var(--theme-text-primary) !important;\
        }\
        a:hover {\
            color: var(--theme-text-secondary) !important;\
        }\
        \
        /* Settings sections */\
        .settings-view .section {\
            background: var(--theme-bg-primary) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .settings-view .section label,\
        .settings-view .section .lbl,\
        .tabcontents label {\
            color: var(--theme-text-secondary) !important;\
        }\
        .settings-view .section .val {\
            color: var(--theme-text-primary) !important;\
        }\
        \
        /* Input rows (keybinds) */\
        .inputrow {\
            background: var(--theme-bg-secondary) !important;\
            border-color: var(--theme-border) !important;\
        }\
        .inputrow > div:first-child {\
            color: var(--theme-text-primary) !important;\
        }\
        .inputrow > div:not(:first-child) {\
            background: var(--theme-bg-tertiary) !important;\
            color: var(--theme-text-primary) !important;\
            border-color: var(--theme-border) !important;\
        }\
        .inputrow > i.icon-plus {\
            background: var(--theme-bg-tertiary) !important;\
            color: var(--theme-text-primary) !important;\
        }\
        .inputrow > div:not(:first-child):hover,\
        .inputrow > i.icon-plus:hover {\
            background: var(--theme-bg-hover) !important;\
        }\
        \
        /* Tema claro - força transparência nos elementos do jogo */\
        body[data-theme="light"] .section,\
        body[data-theme="light"] .section *,\
        body[data-theme="light"] .tabcontents,\
        body[data-theme="light"] .tabcontents * {\
            background-color: transparent !important;\
        }\
        body[data-theme="light"] .section > label,\
        body[data-theme="light"] .tabcontents > label,\
        body[data-theme="light"] .section label[style],\
        body[data-theme="light"] .tabcontents label[style] {\
            background: transparent !important;\
            background-color: transparent !important;\
            color: var(--theme-text-primary) !important;\
        }\
        body[data-theme="light"] .section > label:hover,\
        body[data-theme="light"] .tabcontents > label:hover {\
            background: var(--theme-bg-hover) !important;\
            background-color: var(--theme-bg-hover) !important;\
        }\
        body[data-theme="light"] .inputrow {\
            background: var(--theme-bg-secondary) !important;\
        }\
        body[data-theme="light"] .inputrow > div:not(:first-child),\
        body[data-theme="light"] .inputrow > i.icon-plus {\
            background: var(--theme-bg-tertiary) !important;\
            background-color: var(--theme-bg-tertiary) !important;\
        }\
        \
        /* Lista de jogadores - hover */\
        .player-list-item {\
            background: transparent !important;\
        }\
        .player-list-item:hover {\
            background: var(--theme-bg-hover) !important;\
        }\
        /* Banners Pro exclusivos */\
        .player-list-item.pro-banner {\
            background: var(--pro-banner-gradient) !important;\
            border-radius: 4px !important;\
        }\
        .player-list-item.pro-banner:hover {\
            filter: brightness(1.1) !important;\
        }\
        /* Cor de admin mais escura no modo claro */\
        body[data-theme="light"] .player-list-item [style*="color: rgb(231, 185, 14)"],\
        body[data-theme="light"] .player-list-item [style*="color:#e7b90e"],\
        body[data-theme="light"] .player-list-item [style*="color: #e7b90e"] {\
            color: #b8860b !important;\
        }\
        \
        /* TEMA PADRÃO - Remove apenas fundo do body, mantém elementos customizados com cor da header */\
        html[data-theme="default"] body,\
        body[data-theme="default"] {\
            background: unset !important;\
            background-color: unset !important;\
        }\
        /* Input do nick - mesma cor do input da header */\
        html[data-theme="default"] .label-input input,\
        html[data-theme="default"] .label-input input[data-hook="input"],\
        html[data-theme="default"] .choose-nickname-view input,\
        html[data-theme="default"] .choose-nickname-view input[type="text"] {\
            background: #2a3138 !important;\
            border-color: #3a4148 !important;\
            color: #fff !important;\
        }\
        /* Selects no tema default */\
        html[data-theme="default"] select,\
        html[data-theme="default"] .dialog select,\
        html[data-theme="default"] .room-view select,\
        html[data-theme="default"] .game-view select,\
        html[data-theme="default"] .create-room-view select {\
            background: #2a3138 !important;\
            border-color: #3a4148 !important;\
            color: #fff !important;\
        }\
        html[data-theme="default"] select option,\
        html[data-theme="default"] .dialog select option {\
            background: #1A2125 !important;\
            color: #fff !important;\
        }\
        /* Botões - visíveis */\
        html[data-theme="default"] button,\
        html[data-theme="default"] .dialog button {\
            background: #2a3138 !important;\
            color: #fff !important;\
        }\
        html[data-theme="default"] button:hover,\
        html[data-theme="default"] .dialog button:hover {\
            background: #3a4148 !important;\
        }\
        /* Header da roomlist (País, Nome, Jogadores) */\
        html[data-theme="default"] .roomlist-view table.header {\
            background: #1A2125 !important;\
        }\
        /* Sidebar da room list - mesma cor da header */\
        html[data-theme="default"] #sidebar-panel {\
            background: #1A2125 !important;\
            border-color: #2a3138 !important;\
        }\
        html[data-theme="default"] #sidebar-panel button,\
        html[data-theme="default"] #sidebar-panel label[for="replayfile"] {\
            background: #2a3138 !important;\
            color: #fff !important;\
        }\
        html[data-theme="default"] #sidebar-panel button:hover,\
        html[data-theme="default"] #sidebar-panel label[for="replayfile"]:hover {\
            background: #3a4148 !important;\
        }\
        /* Input de busca e filtro de país */\
        html[data-theme="default"] #room-search-input {\
            background: #2a3138 !important;\
            color: #fff !important;\
        }\
        html[data-theme="default"] #country-filter-btn {\
            background: #2a3138 !important;\
            color: #fff !important;\
        }\
        html[data-theme="default"] #country-filter-btn:hover {\
            background: #3a4148 !important;\
        }\
        html[data-theme="default"] #country-dropdown {\
            background: #1A2125 !important;\
            border-color: #2a3138 !important;\
        }\
        html[data-theme="default"] #country-dropdown .country-item:hover {\
            background: #2a3138 !important;\
        }\
        /* Settings sidebar - mesma cor da header */\
        html[data-theme="default"] #settings-sidebar-panel {\
            background: #1A2125 !important;\
            border-color: #2a3138 !important;\
        }\
        html[data-theme="default"] .settings-sidebar-btn {\
            background: #2a3138 !important;\
            color: #888 !important;\
        }\
        html[data-theme="default"] .settings-sidebar-btn:hover,\
        html[data-theme="default"] .settings-sidebar-btn.selected {\
            background: #3a4148 !important;\
            color: #fff !important;\
        }\
        /* Theme options no tema default */\
        html[data-theme="default"] .theme-option {\
            background: #1A2125 !important;\
            border-color: #2a3138 !important;\
        }\
        html[data-theme="default"] .theme-option:hover {\
            background: #2a3138 !important;\
        }\
        html[data-theme="default"] .theme-option.selected {\
            border-color: #4ade80 !important;\
            background: #2a3138 !important;\
        }\
        /* Host token input */\
        html[data-theme="default"] .hosttoken-section input,\
        html[data-theme="default"] [data-hook="token-section"] input,\
        html[data-theme="default"] .section input[type="text"] {\
            background: #2a3138 !important;\
            border-color: #3a4148 !important;\
            color: #fff !important;\
        }\
        /* Painéis laterais (Pro, Amizades, Equipes) */\
        html[data-theme="default"] #pro-panel,\
        html[data-theme="default"] #friends-panel,\
        html[data-theme="default"] #teams-panel {\
            background: #1A2125 !important;\
            border-color: #2a3138 !important;\
        }\
        html[data-theme="default"] #pro-panel input,\
        html[data-theme="default"] #pro-panel select,\
        html[data-theme="default"] #friends-panel input,\
        html[data-theme="default"] #teams-panel input {\
            background: #2a3138 !important;\
            border-color: #3a4148 !important;\
            color: #fff !important;\
        }\
        html[data-theme="default"] #pro-panel button,\
        html[data-theme="default"] #friends-panel button,\
        html[data-theme="default"] #teams-panel button {\
            background: #2a3138 !important;\
            color: #fff !important;\
        }\
        html[data-theme="default"] #pro-panel button:hover,\
        html[data-theme="default"] #friends-panel button:hover,\
        html[data-theme="default"] #teams-panel button:hover {\
            background: #3a4148 !important;\
        }\
        /* Elementos internos dos painéis */\
        html[data-theme="default"] #pro-preview,\
        html[data-theme="default"] #custom-banner-colors,\
        html[data-theme="default"] .friend-item,\
        html[data-theme="default"] .team-item,\
        html[data-theme="default"] [style*="background:#111"],\
        html[data-theme="default"] [style*="background: #111"],\
        html[data-theme="default"] [style*="background:#1a1a1a"],\
        html[data-theme="default"] [style*="background: #1a1a1a"] {\
            background: #2a3138 !important;\
        }\
        /* Lista de jogadores na sala */\
        html[data-theme="default"] .player-list-view,\
        html[data-theme="default"] .player-list-view .list {\
            background: #1A2125 !important;\
        }\
        html[data-theme="default"] .player-list-item:hover {\
            background: #2a3138 !important;\
        }\
        /* Container da sala */\
        html[data-theme="default"] .room-view .container,\
        html[data-theme="default"] .game-view .container {\
            background: #1A2125 !important;\
            border-color: #2a3138 !important;\
        }\
        /* Settings da sala */\
        html[data-theme="default"] .room-view .settings,\
        html[data-theme="default"] .game-view .settings {\
            background: #1A2125 !important;\
            border-color: #2a3138 !important;\
        }\
        /* Lista thin-scrollbar */\
        html[data-theme="default"] .room-view .list.thin-scrollbar,\
        html[data-theme="default"] .game-view .list.thin-scrollbar,\
        html[data-theme="default"] .player-list-view .list.thin-scrollbar {\
            background: #1A2125 !important;\
            border: 1px solid #2a3138 !important;\
        }\
        /* Listas de times (Red, Spectators, Blue) */\
        html[data-theme="default"] .player-list-view {\
            background: transparent !important;\
        }\
        html[data-theme="default"] .player-list-view .list {\
            background: #1A2125 !important;\
            border: 1px solid #2a3138 !important;\
        }\
        /* Checkboxes de desempenho no tema default */\
        html[data-theme="default"] .perf-checkbox {\
            border-color: #3a4148 !important;\
        }\
        html[data-theme="default"] .perf-option-row:hover {\
            background: #2a3138 !important;\
        }\
    ';

  // Fontes disponíveis para usuários Pro
  var PRO_FONTS = {
    default: { name: 'Padrão', family: 'Space Grotesk' },
    roboto: { name: 'Roboto', family: 'Roboto' },
    poppins: { name: 'Poppins', family: 'Poppins' },
    montserrat: { name: 'Montserrat', family: 'Montserrat' },
    oswald: { name: 'Oswald', family: 'Oswald' },
    raleway: { name: 'Raleway', family: 'Raleway' },
    ubuntu: { name: 'Ubuntu', family: 'Ubuntu' },
    quicksand: { name: 'Quicksand', family: 'Quicksand' },
    comfortaa: { name: 'Comfortaa', family: 'Comfortaa' },
    righteous: { name: 'Righteous', family: 'Righteous' },
    orbitron: { name: 'Orbitron', family: 'Orbitron' },
    pressstart: { name: 'Press Start 2P', family: 'Press Start 2P' }
  };

  // Exporta fontes globalmente
  window.__proFonts = PRO_FONTS;

  function injectStyles() {
    Injector.waitForHead().then(function (head) {
      if (document.getElementById('haxball-custom-styles')) return;

      // Carrega todas as fontes de forma assíncrona
      var fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href =
        'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Ubuntu:wght@400;500;700&family=Quicksand:wght@400;500;600;700&family=Comfortaa:wght@400;500;600;700&family=Righteous&family=Orbitron:wght@400;500;600;700&family=Press+Start+2P&display=swap';
      head.appendChild(fontLink);

      var style = document.createElement('style');
      style.id = 'haxball-custom-styles';
      style.textContent = generateFlagCSS() + MAIN_STYLES;
      head.appendChild(style);

      Injector.log('Custom styles injected');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }
})();
