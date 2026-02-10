// ============================================
// AUTO UPDATE - Electron Updater (GitHub)
// ============================================
(function () {
  if (Injector.isMainFrame()) return;

  var UPDATE_CHECK_KEY = 'last_update_check';
  var UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hora

  function shouldCheckUpdate() {
    var last = localStorage.getItem(UPDATE_CHECK_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last) > UPDATE_INTERVAL;
  }

  function markUpdateChecked() {
    localStorage.setItem(UPDATE_CHECK_KEY, Date.now().toString());
  }

  function injectVersionAndUpdateButton(version, updateInfo) {
    if (document.getElementById('version-info')) return;

    var versionContainer = document.createElement('div');
    versionContainer.id = 'version-info';
    versionContainer.style.cssText = 'position:fixed;bottom:10px;left:10px;font-size:11px;color:#666;z-index:9999;';

    if (updateInfo && updateInfo.has_update) {
      versionContainer.innerHTML =
        'v' +
        version +
        ' <button id="update-btn" style="background:#f59e0b;border:none;color:#000;padding:2px 8px;border-radius:4px;font-size:11px;cursor:pointer;margin-left:6px;">Atualizar para v' +
        updateInfo.latest +
        '</button>';
    } else {
      versionContainer.textContent = 'v' + version;
    }

    document.body.appendChild(versionContainer);

    var updateBtn = document.getElementById('update-btn');
    if (updateBtn && updateInfo) {
      updateBtn.addEventListener('click', function () {
        showUpdateDialog(updateInfo);
      });
    }

    Injector.log('Version info injected: v' + version);
  }

  function showUpdateDialog(updateInfo) {
    var existing = document.getElementById('update-dialog-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'update-dialog-overlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:100000;display:flex;align-items:center;justify-content:center;';

    var dialog = document.createElement('div');
    dialog.style.cssText =
      'background:#141414;border:1px solid #232323;border-radius:12px;padding:24px;max-width:450px;width:90%;max-height:80vh;overflow-y:auto;';

    dialog.innerHTML =
      '\
            <h2 style="color:#fff;margin:0 0 8px 0;font-size:18px;">Nova versão disponível!</h2>\
            <p style="color:#888;margin:0 0 16px 0;font-size:13px;">v' +
      updateInfo.current +
      ' → v' +
      updateInfo.latest +
      '</p>\
            <div id="update-progress" style="display:none;margin-bottom:16px;">\
                <div style="background:#272727;border-radius:4px;height:6px;overflow:hidden;">\
                    <div id="progress-bar" style="background:#f59e0b;height:100%;width:0%;transition:width 0.3s;"></div>\
                </div>\
                <p id="progress-text" style="color:#888;font-size:11px;margin:8px 0 0 0;">Preparando...</p>\
            </div>\
            <div id="update-buttons" style="display:flex;gap:10px;">\
                <button id="update-cancel" style="flex:1;padding:10px;background:#272727;border:none;border-radius:6px;color:#fff;cursor:pointer;">Depois</button>\
                <button id="update-download" style="flex:1;padding:10px;background:#f59e0b;border:none;border-radius:6px;color:#000;cursor:pointer;font-weight:600;">Atualizar agora</button>\
            </div>\
        ';

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    document.getElementById('update-cancel').addEventListener('click', function () {
      overlay.remove();
    });

    document.getElementById('update-download').addEventListener('click', function () {
      startUpdate();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  function startUpdate() {
    let buttons = document.getElementById('update-buttons');
    let progress = document.getElementById('update-progress');
    let progressBar = document.getElementById('progress-bar');
    let progressText = document.getElementById('progress-text');

    buttons.style.display = 'none';
    progress.style.display = 'block';
    progressText.textContent = 'Baixando atualização...';

    window.updater
      .download()
      .then(function () {
        progressBar.style.width = '100%';
        progressText.textContent = 'Download completo! Reiniciando...';

        setTimeout(function () {
          window.updater.apply();
        }, 1000);
      })
      .catch(function (err) {
        progressText.textContent = 'Erro: ' + err.message;
        progressText.style.color = '#ff4444';
        buttons.style.display = 'flex';
        progress.style.display = 'none';
      });
  }

  function checkForUpdates() {
    window.updater
      .check()
      .then(function (data) {
        markUpdateChecked();
        injectVersionAndUpdateButton(data.current, data);

        if (data.has_update) {
          showUpdateDialog(data);
        }
      })
      .catch(function () {
        injectVersionAndUpdateButton('?', null);
      });
  }

  function showVersionInfo() {
    var el = document.getElementById('version-info');
    if (el) el.style.display = 'block';
  }

  function hideVersionInfo() {
    var el = document.getElementById('version-info');
    if (el) el.style.display = 'none';
  }

  function init() {
    if (shouldCheckUpdate()) {
      checkForUpdates();
    } else {
      window.updater
        .check()
        .then(function (data) {
          injectVersionAndUpdateButton(data.current, data);
        })
        .catch(function () {
          injectVersionAndUpdateButton('?', null);
        });
    }

    Injector.onView('roomlist-view', showVersionInfo);
    Injector.onView('choose-nickname-view', showVersionInfo);
    Injector.onView('room-view', hideVersionInfo);
    Injector.onView('game-view', hideVersionInfo);

    Injector.log('Auto update module loaded (Electron)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
