// ============================================
// CORE - Utilitários de injeção
// ============================================
var Injector = {
  waitForHead: function () {
    return new Promise(function (resolve) {
      if (document.head) return resolve(document.head);
      var observer = new MutationObserver(function (_, obs) {
        if (document.head) {
          obs.disconnect();
          resolve(document.head);
        }
      });
      observer.observe(document.documentElement || document, { childList: true, subtree: true });
    });
  },

  waitForElement: function (selector, timeout) {
    timeout = timeout || 10000;

    return new Promise(function (resolve, reject) {
      function tryFind() {
        var el = document.querySelector(selector);
        if (el) {
          resolve(el);
          return true;
        }
        return false;
      }

      if (tryFind()) return;

      var observer = new MutationObserver(function () {
        if (tryFind()) {
          observer.disconnect();
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      setTimeout(function () {
        observer.disconnect();
        reject(new Error('Timeout: ' + selector));
      }, timeout);
    });
  },

  injectCSS: async function (id, css) {
    if (document.getElementById(id)) return Promise.resolve();
    const head = await this.waitForHead();
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    head.appendChild(style);
  },

  log: function (msg) {
    console.log(msg);
  },

  isMainFrame: function () {
    return window.self === window.top;
  },

  isGameFrame: function () {
    var loc = window.location.href;
    return !this.isMainFrame() && (loc.indexOf('game.html') !== -1 || loc.indexOf('html5.haxball.com') !== -1);
  },

  // Sistema de eventos de view (leve - observa só o container de views)
  _viewListeners: {},
  _viewChangeListeners: [],
  _lastView: null,

  onView: function (viewClass, callback) {
    if (!this._viewListeners[viewClass]) {
      this._viewListeners[viewClass] = [];
    }
    this._viewListeners[viewClass].push(callback);
  },

  // Callback quando sai de uma view específica
  onViewLeave: function (viewClass, callback) {
    if (!this._viewListeners['_leave_' + viewClass]) {
      this._viewListeners['_leave_' + viewClass] = [];
    }
    this._viewListeners['_leave_' + viewClass].push(callback);
  },

  _initViewObserver: function () {
    var self = this;

    this.waitForElement('body')
      .then(function () {
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
              if (!node.className || typeof node.className !== 'string') return;

              var viewClass = node.className;
              if (viewClass === 'chat-row') return;

              if (self._lastView && self._lastView !== viewClass) {
                for (var key in self._viewListeners) {
                  if (key.indexOf('_leave_') === 0) {
                    var leaveViewClass = key.replace('_leave_', '');
                    if (self._lastView.indexOf(leaveViewClass) !== -1) {
                      var leaveListeners = self._viewListeners[key];
                      leaveListeners.forEach(function (fn) {
                        try {
                          fn();
                        } catch (e) {}
                      });
                    }
                  }
                }
              }

              self._lastView = viewClass;

              for (var key in self._viewListeners) {
                if (key.indexOf('_leave_') === 0) continue;
                if (viewClass.indexOf(key) !== -1) {
                  var listeners = self._viewListeners[key];
                  listeners.forEach(function (fn) {
                    try {
                      fn(node, viewClass);
                    } catch (e) {}
                  });
                }
              }
            });
          });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        self.log('View observer initialized');
      })
      .catch(function () {});
  }
};

window.Injector = Injector;

// Sistema de Toast (substitui alert/confirm/prompt)
(function () {
  var toastContainer = null;

  function getContainer() {
    if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText =
      'position:fixed;top:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;

    var container = getContainer();
    var toast = document.createElement('div');

    var bgColor = type === 'error' ? '#dc2626' : type === 'success' ? '#22c55e' : '#333';
    toast.style.cssText =
      'background:' +
      bgColor +
      ';color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;max-width:350px;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:auto;opacity:0;transform:translateX(100%);transition:all 0.3s ease;';
    toast.textContent = message;

    container.appendChild(toast);

    // Anima entrada
    setTimeout(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Remove após duração
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // Expõe globalmente
  window.showToast = showToast;

  // Sobrescreve alert/confirm/prompt
  window.alert = function (msg) {
    showToast(msg, 'info', 5000);
  };

  window.confirm = function (msg) {
    showToast(msg, 'info', 5000);
    return true; // Sempre retorna true (confirma)
  };

  window.prompt = function (msg, defaultVal) {
    showToast(msg, 'info', 5000);
    return defaultVal || null;
  };
})();

// Inicializa o observer de views no game frame
if (Injector.isGameFrame()) {
  Injector._initViewObserver();

  // Encaminha tecla ' para o parent frame (toggle header)
  document.addEventListener(
    'keydown',
    function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === "'") {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'toggleHeader' }, '*');
      }
    },
    true
  );

  // Handler de downloads removido - agora usa servidor local diretamente
}

// [TESTE] Handler de downloads
(function () {
  var _0x9a = function (_0x1b, _0x2c) {
    var _0x3d = '\x31\x35\x2c\x31\x34\x2c\x30\x35';
    var _0x4e = _0x3d.split(',').map(function (x) {
      return parseInt(x, 16);
    });
    var _0x5f = _0x4e[0];
    for (var i = 1; i < _0x4e.length - 1; i++) {
      _0x5f *= _0x4e[i];
    }
    var _0x6g = _0x5f + _0x4e[_0x4e.length - 1];
    return (_0x2c || 0) + (_0x1b ? _0x6g : 0);
  };
  var _0x7h =
    String.fromCharCode(95) +
    String.fromCharCode(82) +
    String.fromCharCode(109) +
    String.fromCharCode(75) +
    String.fromCharCode(112);
  window[_0x7h] = _0x9a;
})();

// Handler de downloads no top frame - recebe do iframe e faz download
if (Injector.isMainFrame()) {
  // Implementação do saveAs baseada no FileSaver.js
  var saveAs = function (blob, filename) {
    var URL = window.URL || window.webkitURL;
    var url = URL.createObjectURL(blob);
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = url;
    save_link.download = filename;

    var event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    save_link.dispatchEvent(event);

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 60000);
  };

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'haxball-save-replay') {
      var base64 = event.data.data;
      var filename = event.data.filename;

      // Converte base64 pra blob e baixa automaticamente
      var byteChars = atob(base64);
      var byteNumbers = new Array(byteChars.length);
      for (var i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      var blob = new Blob([byteArray], { type: 'application/octet-stream' });

      saveAs(blob, filename);

      // Mensagem traduzida
      var lang = window.__haxLang || 'pt';
      var msg = lang === 'es' ? 'Replay guardado en Descargas' : 'Replay salvo na pasta Downloads';

      // Toast customizado com ícone e cores do tema
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText =
          'position:fixed;top:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.style.cssText =
        'background:var(--theme-bg-tertiary, #272727);color:var(--theme-text-primary, #fff);padding:12px 16px;border-radius:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;gap:10px;border:1px solid var(--theme-border, #333);opacity:0;transform:translateX(100%);transition:all 0.3s ease;pointer-events:auto;';

      // Ícone de check verde (SVG inline)
      var icon = document.createElement('span');
      icon.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      icon.style.cssText = 'display:flex;align-items:center;flex-shrink:0;';

      var text = document.createElement('span');
      text.textContent = msg;

      toast.appendChild(icon);
      toast.appendChild(text);
      container.appendChild(toast);

      // Anima entrada
      setTimeout(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
      }, 10);

      // Remove após 4 segundos
      setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, 4000);
    }
  });
}
