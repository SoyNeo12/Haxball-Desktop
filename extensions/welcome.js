// Welcome popup
(function () {
  if (Injector.isMainFrame()) return;

  const CURRENT_VERSION = '1.2.3';
  let currentLang = localStorage.getItem('haxball_language') || 'pt';
  let selectedLang = null;

  const TRANSLATIONS = {
    pt: {
      langTitle: 'Idioma',
      langText:
        'Desde o lançamento, recebemos muito carinho de jogadores de toda a América Latina! Argentinos, uruguaios, chilenos, peruanos e tantos outros nos pediram suporte ao espanhol.<br><br>Então aqui está: agora você pode usar o aplicativo no seu idioma. Obrigado por todo o apoio!',
      continue: 'Continuar',
      portuguese: 'Português',
      spanish: 'Español'
    },
    es: {
      langTitle: 'Idioma',
      langText:
        '¡Desde el lanzamiento, recibimos mucho cariño de jugadores de toda América Latina! Argentinos, uruguayos, chilenos, peruanos y tantos otros nos pidieron soporte en español.<br><br>Así que aquí está: ahora puedes usar la aplicación en tu idioma. Gracias por todo el apoyo!',
      continue: 'Continuar',
      portuguese: 'Português',
      spanish: 'Español'
    }
  };

  function t(key) {
    return TRANSLATIONS[currentLang][key] || TRANSLATIONS['pt'][key] || key;
  }

  function createWelcomePopup() {
    if (document.getElementById('welcome-popup-overlay')) return;

    let overlay = document.createElement('div');
    overlay.id = 'welcome-popup-overlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10002;display:flex;align-items:center;justify-content:center;';

    let popup = document.createElement('div');
    popup.id = 'welcome-popup';
    popup.style.cssText =
      'background:#111;border:1px solid #252525;border-radius:12px;max-width:500px;width:90vw;overflow:hidden;';

    function renderPopup() {
      const continueDisabled = selectedLang === null;

      popup.innerHTML =
        '<div style="padding:20px 24px;border-bottom:1px solid #222;">' +
        '<span style="color:#fff;font-size:17px;font-weight:600;">' +
        t('langTitle') +
        '</span>' +
        '</div>' +
        '<div style="padding:24px;">' +
        '<div style="color:#888;font-size:13px;line-height:1.7;">' +
        t('langText') +
        '</div>' +
        '<div style="display:flex;gap:12px;margin-top:24px;">' +
        '<button id="lang-pt" style="flex:1;padding:14px;background:' +
        (selectedLang === 'pt' ? '#fff' : '#1a1a1a') +
        ';border:1px solid ' +
        (selectedLang === 'pt' ? '#fff' : '#333') +
        ';border-radius:8px;color:' +
        (selectedLang === 'pt' ? '#000' : '#888') +
        ';font-size:13px;font-weight:' +
        (selectedLang === 'pt' ? '600' : '400') +
        ';cursor:pointer;">' +
        TRANSLATIONS['pt']['portuguese'] +
        '</button>' +
        '<button id="lang-es" style="flex:1;padding:14px;background:' +
        (selectedLang === 'es' ? '#fff' : '#1a1a1a') +
        ';border:1px solid ' +
        (selectedLang === 'es' ? '#fff' : '#333') +
        ';border-radius:8px;color:' +
        (selectedLang === 'es' ? '#000' : '#888') +
        ';font-size:13px;font-weight:' +
        (selectedLang === 'es' ? '600' : '400') +
        ';cursor:pointer;">' +
        TRANSLATIONS['es']['spanish'] +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div style="padding:16px 24px;border-top:1px solid #222;display:flex;justify-content:flex-end;">' +
        '<button id="welcome-continue" style="padding:10px 24px;background:' +
        (continueDisabled ? '#1a1a1a' : '#fff') +
        ';border:none;border-radius:6px;color:' +
        (continueDisabled ? '#555' : '#000') +
        ';font-size:12px;font-weight:600;cursor:' +
        (continueDisabled ? 'not-allowed' : 'pointer') +
        ';opacity:' +
        (continueDisabled ? '0.5' : '1') +
        ';"' +
        (continueDisabled ? ' disabled' : '') +
        '>' +
        t('continue') +
        '</button>' +
        '</div>';

      popup.querySelector('#lang-pt').onclick = function () {
        if (selectedLang !== 'pt') {
          selectedLang = 'pt';
          currentLang = 'pt';
          renderPopup();
        }
      };

      popup.querySelector('#lang-es').onclick = function () {
        if (selectedLang !== 'es') {
          selectedLang = 'es';
          currentLang = 'es';
          renderPopup();
        }
      };

      popup.querySelector('#welcome-continue').onclick = function () {
        if (!continueDisabled) {
          localStorage.setItem('haxball_language', selectedLang);

          if (window.__haxSetLanguage) {
            window.__haxSetLanguage(selectedLang);
          }

          closeWelcomePopup();
        }
      };
    }

    renderPopup();
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  function closeWelcomePopup() {
    let overlay = document.getElementById('welcome-popup-overlay');
    if (overlay) overlay.remove();
    localStorage.setItem('haxball_welcome_seen', CURRENT_VERSION);
  }

  window.__showWelcomePopup = createWelcomePopup;
  window.__closeWelcomePopup = closeWelcomePopup;

  // Mostra o popup ao carregar (apenas se não viu essa versão)
  Injector.waitForElement('body').then(function () {
    const seenVersion = localStorage.getItem('haxball_welcome_seen');
    if (seenVersion !== CURRENT_VERSION) {
      setTimeout(createWelcomePopup, 800);
    }
  });
})();
