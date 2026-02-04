// ============================================
// DISCORD - Autenticação via servidor local
// ============================================
(function () {
  if (!Injector.isMainFrame()) return;

  const LOCAL_SERVER = 'http://localhost:3000';
  let discordNick = null;
  let discordUsername = null;
  let discordId = null;
  let isVerified = false;
  let isLoaded = false;
  const isGhostMode = localStorage.getItem('ghost_mode') === 'true';
  const PRESENCE_SHARE_ONLY = true; // solo presencia manual

  let gameNick = null; // nick usado en el juego
  let lastPresence = { roomName: null, roomLink: null, isOnline: null };
  let userCache = {};

  // =====================
  // Backend helpers
  // =====================
  function fetchUserStatus() {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', LOCAL_SERVER + '/user', true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.logged_in) {
              discordNick = data.nick;
              discordUsername = data.username;
              discordId = data.discord_id;
              isVerified = data.is_verified;
            }
            resolve(data);
          } catch {
            resolve({ logged_in: false });
          }
        }
      };
      xhr.onerror = () => resolve({ logged_in: false });
      xhr.send();
    });
  }

  function saveUserToBackend() {
    if (!discordId || !discordNick || isGhostMode) return;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', LOCAL_SERVER + '/user', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(
      JSON.stringify({
        username: discordUsername,
        nick: discordNick,
        discord_id: discordId,
        is_verified: isVerified
      })
    );
  }

  function updatePresence(roomName, roomLink, isOnline) {
    if (PRESENCE_SHARE_ONLY || !discordId || isGhostMode) return;
    if (lastPresence.roomName === roomName && lastPresence.roomLink === roomLink && lastPresence.isOnline === isOnline)
      return;

    lastPresence = { roomName, roomLink, isOnline };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', LOCAL_SERVER + '/presence', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(
      JSON.stringify({
        user_id: discordId,
        room_name: roomName || null,
        room_link: roomLink || null,
        is_online: isOnline !== false
      })
    );
  }

  function startAuth() {
    if (window.electronAPI) window.electronAPI.startAuth();
  }

  // =====================
  // Nick / login UI
  // =====================
  function handleNickDialog(doc) {
    const dialog = doc.querySelector('.dialog');
    if (!dialog || dialog.dataset.discordSetup === 'done') return;
    dialog.dataset.discordSetup = 'done';

    const nickInput = dialog.querySelector('input[data-hook="input"]');
    const okBtn = dialog.querySelector('button[data-hook="ok"]');
    if (!nickInput || !okBtn) return;

    // --- Ghost Mode ---
    if (isGhostMode) {
      const savedGhostNick = localStorage.getItem('ghost_nick') || '';
      nickInput.value = savedGhostNick;
      return;
    }

    // --- Logged in Discord ---
    if (discordNick) {
      nickInput.placeholder = discordNick;
      const savedNick = localStorage.getItem('haxball_nick') || '';
      nickInput.value = savedNick || discordNick;

      okBtn.onclick = () => {
        const customNick = nickInput.value.trim() || discordNick;
        gameNick = customNick;
        localStorage.setItem('haxball_nick', customNick);
        nickInput.value = customNick;
        saveUserToBackend(); // Guarda usuario en backend
        okBtn.click();
      };
      return;
    }

    // --- No logueado ---
    const loginBtn = doc.createElement('button');
    loginBtn.textContent = 'Entrar con Discord';
    loginBtn.onclick = () => {
      loginBtn.disabled = true;
      startAuth();

      const poll = setInterval(() => {
        fetchUserStatus().then((data) => {
          if (data.logged_in) {
            clearInterval(poll);
            saveUserToBackend();
            window.location.reload();
          }
        });
      }, 1500);

      setTimeout(() => clearInterval(poll), 120000);
    };
    dialog.appendChild(loginBtn);
  }

  // =====================
  // Observers
  // =====================
  function watchGameIframe() {
    let roomDetected = false;

    const checkIframe = () => {
      const iframe = document.querySelector('iframe[src*="game.html"]');
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc || !doc.body) return;

        if (!roomDetected) {
          roomDetected = true;
        }

        const dialog = doc.querySelector('.dialog');
        if (dialog) handleNickDialog(doc);
      } catch {}
    };

    const observer = new MutationObserver(checkIframe);
    observer.observe(document.body, { childList: true, subtree: true });
    checkIframe();
  }

  // =====================
  // Init
  // =====================
  function init() {
    if (isLoaded) return;
    isLoaded = true;

    fetchUserStatus().then(() => {
      Injector.log('Discord: ' + (discordNick ? 'Logado como ' + discordNick : 'Não logado'));
      watchGameIframe();
    });

    window.addEventListener('beforeunload', () => {
      updatePresence(null, null, false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HaxDiscord = {
    getNick: () => discordNick,
    getId: () => (isGhostMode ? null : discordId),
    isVerified: () => (isGhostMode ? false : isVerified),
    isGhostMode: () => isGhostMode,
    updatePresence,
    refresh: fetchUserStatus
  };

  Injector.log('Discord module loaded');
})();
