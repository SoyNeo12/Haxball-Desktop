// ============================================
// FRIENDS SYSTEM + PRESENCE
// ============================================
(function () {
  const API_BASE = 'http://localhost:5483';
  let friendsPanelOpen = false;
  let friendsInterval = null;
  let requestsInterval = null;
  let searchTimeout = null;

  // ============================================
  // PRESENCE THROTTLE
  // ============================================
  let lastPresence = { roomName: null, roomLink: null, roomKey: null, isOnline: null };
  let lastPresenceAt = 0;
  const PRESENCE_HEARTBEAT_MS = 90 * 1000;

  function sendPresence(payload, force) {
    const now = Date.now();
    const roomKey = payload.roomKey || null;
    const isOnline = payload.is_online !== false;

    const shouldSend =
      force ||
      lastPresence.isOnline !== isOnline ||
      (isOnline && roomKey && roomKey !== lastPresence.roomKey) ||
      (isOnline && now - lastPresenceAt >= PRESENCE_HEARTBEAT_MS);

    if (!shouldSend) {
      lastPresence.roomName = payload.room_name || lastPresence.roomName;
      lastPresence.roomLink = payload.room_link || lastPresence.roomLink;
      lastPresence.roomKey = roomKey || lastPresence.roomKey;
      lastPresence.isOnline = isOnline;
      return;
    }

    lastPresence = {
      roomName: payload.room_name || null,
      roomLink: payload.room_link || null,
      roomKey: roomKey,
      isOnline: isOnline
    };
    lastPresenceAt = now;

    fetch(`${API_BASE}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_name: payload.room_name || null,
        room_link: payload.room_link || null,
        is_online: isOnline
      })
    }).catch(() => {});
  }

  function updateRoomPresence(roomName, roomLink, roomKey, force) {
    sendPresence({ room_name: roomName, room_link: roomLink, roomKey, is_online: true }, !!force);
  }

  function setOfflinePresence() {
    sendPresence({ room_name: null, room_link: null, roomKey: null, is_online: false }, true);
  }

  // ============================================
  // UTIL
  // ============================================
  function t(key) {
    return window.__t ? window.__t(key) : key;
  }

  function cleanupIntervals() {
    if (friendsInterval) {
      clearInterval(friendsInterval);
      friendsInterval = null;
    }
    if (requestsInterval) {
      clearInterval(requestsInterval);
      requestsInterval = null;
    }
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
  }

  // ============================================
  // PANEL
  // ============================================
  function closeFriendsPanel(doc) {
    const panel = doc.getElementById('friends-panel');
    if (panel) panel.remove();
    friendsPanelOpen = false;
    cleanupIntervals();
  }

  function createFriendsPanel(doc) {
    if (doc.getElementById('friends-panel')) return doc.getElementById('friends-panel');

    const panel = doc.createElement('div');
    panel.id = 'friends-panel';
    panel.style.cssText = `
      position:fixed;top:0;right:-320px;width:320px;height:100%;
      background:#141414;border-left:1px solid #232323;
      z-index:9999;transition:right 0.3s ease;
      display:flex;flex-direction:column;font-family:"Space Grotesk",sans-serif;
      user-select:none;
    `;

    panel.innerHTML = `
      <div style="padding:38px 16px 0 16px;position:relative;">
        <button id="close-friends-btn" style="position:absolute;top:10px;right:10px;background:none;border:none;color:#666;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;" title="${t('Fechar')}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h1 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 16px 0;padding:6px 0 5px 0;border-bottom:3px solid #232323;text-align:center;">${t('Amizades')}</h1>
      </div>
      <div id="add-friend-section" style="padding:10px 16px;display:flex;gap:10px;align-items:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="friend-id-input" type="text" placeholder="${t('Username do Discord')}" autocomplete="off" style="flex:1;padding:8px 12px;background:#272727;border:none;border-radius:4px;color:#fff;font-size:13px;font-family:'Space Grotesk',sans-serif;outline:none;">
        <button id="add-friend-btn" style="padding:6px 10px;background:#272727;border:none;border-radius:4px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div id="search-results" style="padding:0 16px;max-height:150px;overflow-y:auto;"></div>
      <p id="add-friend-status" style="color:#8ED2AB;font-size:12px;margin:0;padding:0 16px 8px 16px;text-align:center;min-height:16px;"></p>
      <div id="pending-requests" style="padding:0 12px;"></div>
      <div id="friends-list" style="flex:1;overflow-y:auto;padding:12px;"></div>
    `;

    doc.body.appendChild(panel);
    setupPanelListeners(doc, panel);

    return panel;
  }

  function setupPanelListeners(doc, panel) {
    const closeBtn = panel.querySelector('#close-friends-btn');
    closeBtn.addEventListener('click', () => toggleFriendsPanel(doc));
    closeBtn.addEventListener('mouseenter', () => (closeBtn.style.color = '#fff'));
    closeBtn.addEventListener('mouseleave', () => (closeBtn.style.color = '#666'));

    const addBtn = panel.querySelector('#add-friend-btn');
    const input = panel.querySelector('#friend-id-input');
    const status = panel.querySelector('#add-friend-status');
    const searchResults = panel.querySelector('#search-results');

    input.addEventListener('input', () => {
      const query = input.value.trim();
      if (searchTimeout) clearTimeout(searchTimeout);
      if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
      }

      searchTimeout = setTimeout(() => {
        fetch(`${API_BASE}/friends/search?q=${encodeURIComponent(query)}`)
          .then((r) => r.json())
          .then((users) => {
            if (!Array.isArray(users)) {
              searchResults.innerHTML = `<div style="padding:8px;color:#666;font-size:12px;">${t('Erro ao buscar usuários')}</div>`;
              return;
            }
            if (users.length === 0) {
              searchResults.innerHTML = `<div style="padding:8px;color:#666;font-size:12px;">${t('Nenhum usuário encontrado')}</div>`;
              return;
            }

            searchResults.innerHTML = users
              .map((user) => {
                const verified = user.is_verified ? '<svg width="12" height="12" ...></svg>' : '';
                return `
                <div class="search-result-item" data-id="${user.discord_id}" data-name="${user.discord_name || user.username}" style="display:flex;align-items:center;padding:8px 12px;background:#1a1a1a;border-radius:4px;margin-bottom:4px;cursor:pointer;">
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;color:${user.is_verified ? '#249EF0' : '#fff'};font-size:13px;font-weight:600;">
                      ${user.discord_name || user.username}${verified}
                    </div>
                    <div style="color:#666;font-size:11px;">@${user.username}</div>
                  </div>
                  <button class="add-from-search" data-id="${user.discord_id}" style="padding:4px 10px;background:#272727;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:11px;">${t('Adicionar')}</button>
                </div>`;
              })
              .join('');

            searchResults.querySelectorAll('.add-from-search').forEach((btn) => {
              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const discordId = btn.dataset.id;
                fetch(`${API_BASE}/friends/requests/send`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ to_discord_id: discordId })
                })
                  .then((r) => r.json())
                  .then((res) => {
                    if (res.success) {
                      status.textContent = t('Solicitação enviada!');
                      status.style.color = '#8ED2AB';
                      input.value = '';
                      searchResults.innerHTML = '';
                    } else {
                      status.textContent = res.error || t('Erro ao enviar');
                      status.style.color = '#ff6b6b';
                    }
                  });
              });
            });
          });
      }, 300);
    });

    addBtn.addEventListener('click', () => {
      const friendId = input.value.trim();
      if (!friendId) {
        status.textContent = t('Digite um username');
        status.style.color = '#ff6b6b';
        return;
      }

      status.textContent = t('Buscando...');
      status.style.color = '#8ED2AB';
      fetch(`${API_BASE}/friends/user?username=${encodeURIComponent(friendId)}`)
        .then((r) => r.json())
        .then((user) => {
          if (!user)
            return fetch(`${API_BASE}/friends/user?discord_id=${encodeURIComponent(friendId)}`).then((r) => r.json());
          return user;
        })
        .then((user) => {
          if (!user || !user.discord_id) {
            status.textContent = t('Usuário não encontrado');
            status.style.color = '#ff6b6b';
            return;
          }
          fetch(`${API_BASE}/friends/requests/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_discord_id: user.discord_id })
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) {
                status.textContent = t('Solicitação enviada!');
                status.style.color = '#8ED2AB';
                input.value = '';
                searchResults.innerHTML = '';
              } else {
                status.textContent = res.error || t('Erro ao enviar');
                status.style.color = '#ff6b6b';
              }
            });
        })
        .catch(() => {
          status.textContent = t('Erro ao buscar usuário');
          status.style.color = '#ff6b6b';
        });
    });
  }

  // ============================================
  // FRIENDS LIST
  // ============================================
  function renderFriendsList(doc, friends) {
    const list = doc.getElementById('friends-list');
    if (!list) return;
    if (!friends || friends.length === 0) {
      list.innerHTML = `<p style="color:#666;text-align:center;padding:20px;font-size:13px;">${t('Nenhum amigo adicionado')}</p>`;
      return;
    }

    const sorted = friends.slice().sort((a, b) => {
      if (a.is_online && !b.is_online) return -1;
      if (!a.is_online && b.is_online) return 1;
      return (a.discord_name || '').localeCompare(b.discord_name || '');
    });

    list.innerHTML = sorted
      .map((friend) => {
        const statusColor = friend.is_online ? '#22c55e' : '#444';
        const statusText = friend.is_online ? friend.room_name || t('Online') : t('Offline');
        const verifiedBadge = friend.is_verified ? '<svg width="12" height="12" ...></svg>' : '';
        const joinBtn =
          friend.is_online && friend.room_link
            ? `<button class="join-friend-btn" data-link="${friend.room_link}" style="padding:5px 15px;background:#22c55e;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:13px;font-weight:600;margin-left:8px;" title="${t('Entrar')}">${t('Entrar')}</button>`
            : '';
        return `
        <div class="friend-item" data-id="${friend.discord_id}" style="display:flex;align-items:center;padding:12px;background:#0f0f0f;border-radius:6px;margin-bottom:8px;">
          <div style="width:10px;height:10px;border-radius:50%;background:${statusColor};margin-right:12px;"></div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;color:${friend.is_verified ? '#249EF0' : '#fff'};font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;">${friend.discord_name || friend.discord_id}${verifiedBadge}</div>
            <div style="color:#666;font-size:12px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;">${statusText}</div>
          </div>
          ${joinBtn}
          <button class="remove-friend-btn" data-id="${friend.discord_id}" style="padding:5px 15px;background:#272727;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:13px;font-weight:600;margin-left:8px;" title="${t('Remover')}">${t('Remover')}</button>
        </div>`;
      })
      .join('');

    // Botones
    list.querySelectorAll('.join-friend-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const link = btn.dataset.link;
        if (link) {
          closeFriendsPanel(doc);
          window.location.href = link;
        }
      });
    });
    list.querySelectorAll('.remove-friend-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) {
          fetch(`${API_BASE}/friends/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friend_discord_id: id })
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) loadFriends(doc);
            });
        }
      });
    });
  }

  function loadFriends(doc) {
    fetch(`${API_BASE}/friends`)
      .then((r) => r.json())
      .then((f) => renderFriendsList(doc, f))
      .catch(() => {});
  }

  // ============================================
  // PENDING REQUESTS
  // ============================================
  function renderPendingRequests(doc, requests) {
    const container = doc.getElementById('pending-requests');
    if (!container) return;
    if (!requests || requests.length === 0) {
      container.innerHTML = '';
      return;
    }
    const unique = [];
    const seen = {};
    requests.forEach((r) => {
      if (!seen[r.id]) {
        seen[r.id] = true;
        unique.push(r);
      }
    });
    container.innerHTML = unique
      .map(
        (req) => `
      <div class="request-item" data-id="${req.id}" style="display:flex;align-items:center;padding:10px 12px;background:#1a1a1a;border-radius:6px;margin-bottom:6px;">
        <div style="flex:1;min-width:0;"><div style="color:#fff;font-size:13px;font-weight:600;">${req.from_discord_name || req.from_discord_id}</div></div>
        <div style="display:flex;gap:6px;">
          <button class="accept-request-btn" data-id="${req.id}" style="padding:4px 12px;background:#22c55e;border:none;border-radius:4px;color:#fff;font-size:12px;font-weight:600;">${t('Aceitar')}</button>
          <button class="reject-request-btn" data-id="${req.id}" style="padding:4px 12px;background:#272727;border:none;border-radius:4px;color:#fff;font-size:12px;font-weight:600;">${t('Recusar')}</button>
        </div>
      </div>
    `
      )
      .join('');

    container.querySelectorAll('.accept-request-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        if (id) {
          fetch(`${API_BASE}/friends/requests/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: id })
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) {
                loadPendingRequests(doc);
                loadFriends(doc);
              }
            });
        }
      });
    });
    container.querySelectorAll('.reject-request-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        if (id) {
          fetch(`${API_BASE}/friends/requests/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: id })
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) loadPendingRequests(doc);
            });
        }
      });
    });
  }

  function loadPendingRequests(doc) {
    fetch(`${API_BASE}/friends/requests`)
      .then((r) => r.json())
      .then((req) => renderPendingRequests(doc, req))
      .catch(() => {});
  }

  // ============================================
  // TOGGLE PANEL
  // ============================================
  function toggleFriendsPanel(doc) {
    const panel = doc.getElementById('friends-panel') || createFriendsPanel(doc);
    friendsPanelOpen = !friendsPanelOpen;

    if (friendsPanelOpen) {
      panel.style.right = '0';
      loadFriends(doc);
      loadPendingRequests(doc);
      cleanupIntervals();
      friendsInterval = setInterval(() => loadFriends(doc), 15000);
      requestsInterval = setInterval(() => loadPendingRequests(doc), 15000);
    } else {
      panel.style.right = '-320px';
      cleanupIntervals();
    }
  }

  function setupFriendsPanel(doc) {
    createFriendsPanel(doc);
  }

  function injectFriendsButton(iframeDoc) {
    const roomlist = iframeDoc.querySelector('.roomlist-view');
    if (!roomlist) return;
    const createBtn = roomlist.querySelector('[data-hook="create"]');
    if (!createBtn) return;
    if (createBtn.parentElement.querySelector('#friends-btn')) return;

    const btn = iframeDoc.createElement('button');
    btn.id = 'friends-btn';
    btn.innerHTML = '<i class="icon-heart"></i><div>Amizades</div>';
    btn.addEventListener('click', () => {
      setupFriendsPanel(iframeDoc);
      toggleFriendsPanel(iframeDoc);
    });
    createBtn.after(btn);
  }

  window.FriendsSystem = {
    injectFriendsButton,
    closeFriendsPanel,
    updateRoomPresence,
    setOfflinePresence,
    toggleFriendsPanel: (doc) => {
      setupFriendsPanel(doc);
      toggleFriendsPanel(doc);
    }
  };

  console.log('Friends system loaded');
})();
