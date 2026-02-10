// ============================================
// AUTO UPDATE - Sistema de atualização via Supabase
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

    var notes = (updateInfo.notes || 'Sem notas de atualização').replace(/\n/g, '<br>');
    var fileCount = updateInfo.files ? updateInfo.files.length : 0;

    dialog.innerHTML =
      '\
            <h2 style="color:#fff;margin:0 0 8px 0;font-size:18px;">Nova versão disponível!</h2>\
            <p style="color:#888;margin:0 0 16px 0;font-size:13px;">v' +
      updateInfo.current +
      ' → v' +
      updateInfo.latest +
      ' (' +
      (updateInfo.date || '') +
      ')</p>\
            <div style="background:#1a1a1a;border-radius:8px;padding:12px;margin-bottom:16px;max-height:200px;overflow-y:auto;">\
                <p style="color:#ccc;margin:0;font-size:12px;line-height:1.6;">' +
      notes +
      '</p>\
            </div>\
            <p style="color:#666;font-size:11px;margin:0 0 16px 0;">' +
      fileCount +
      ' arquivo(s) para atualizar</p>\
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
      startUpdate(updateInfo);
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  function startUpdate(_updateInfo) {
    var buttons = document.getElementById('update-buttons');
    var progress = document.getElementById('update-progress');
    var progressBar = document.getElementById('progress-bar');
    var progressText = document.getElementById('progress-text');

    buttons.style.display = 'none';
    progress.style.display = 'block';
    progressText.textContent = 'Baixando arquivos...';

    fetch('http://localhost:5483/download-update')
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success && data.ready) {
          progressBar.style.width = '100%';
          progressText.textContent = 'Download completo! Aplicando atualização...';

          setTimeout(function () {
            fetch('http://localhost:5483/apply-update')
              .then(function () {
                progressText.textContent = 'Reiniciando...';
              })
              .catch(function () {
                progressText.textContent = 'Reiniciando...';
              });
          }, 1000);
        } else {
          progressText.textContent = 'Erro: ' + (data.error || 'Falha no download');
          progressText.style.color = '#ff4444';
          buttons.style.display = 'flex';
          progress.style.display = 'none';
        }
      })
      .catch(function (err) {
        progressText.textContent = 'Erro: ' + err.message;
        progressText.style.color = '#ff4444';
        buttons.style.display = 'flex';
        progress.style.display = 'none';
      });

    // Simula progresso enquanto baixa
    var fakeProgress = 0;
    var progressInterval = setInterval(function () {
      fakeProgress += Math.random() * 15;
      if (fakeProgress > 90) {
        clearInterval(progressInterval);
        fakeProgress = 90;
      }
      progressBar.style.width = fakeProgress + '%';
    }, 500);
  }

  function checkForUpdates() {
    fetch('http://localhost:5483/check-update')
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        markUpdateChecked();
        Injector.log(
          'Update check: current=' + data.current + ', latest=' + data.latest + ', has_update=' + data.has_update
        );
        injectVersionAndUpdateButton(data.current, data);

        // Se for update forçado, mostra dialog automaticamente
        if (data.has_update && data.force_update) {
          showUpdateDialog(data);
        }
      })
      .catch(function (err) {
        Injector.log('Update check failed: ' + err);
        fetch('http://localhost:5483/version')
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            injectVersionAndUpdateButton(data.version, null);
          })
          .catch(function () {
            injectVersionAndUpdateButton('?', null);
          });
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
      fetch('http://localhost:5483/version')
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          fetch('http://localhost:5483/check-update')
            .then(function (res) {
              return res.json();
            })
            .then(function (updateData) {
              injectVersionAndUpdateButton(data.version, updateData);
            })
            .catch(function () {
              injectVersionAndUpdateButton(data.version, null);
            });
        })
        .catch(function () {});
    }

    Injector.onView('roomlist-view', showVersionInfo);
    Injector.onView('choose-nickname-view', showVersionInfo);
    Injector.onView('room-view', hideVersionInfo);
    Injector.onView('game-view', hideVersionInfo);

    Injector.log('Auto update module loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
