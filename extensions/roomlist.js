// ============================================
// ROOMLIST - Lista de salas com pesquisa e filtros
// ============================================
(function() {
    if (Injector.isMainFrame()) return;

    var roomListObserver = null;
    var cachedRows = null;
    var selectedCountry = 'all';
    var searchTimeout = null;
    var isFilteringFavs = false;

    // === FAVORITOS ===
    var FAV_STORAGE_KEY = 'fav_rooms';

    function getFavRooms() {
        try {
            return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveFavRooms(rooms) {
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(rooms));
    }

    function toggleFavRoom(roomName) {
        var cleanName = roomName.trim();
        var favRooms = getFavRooms();
        var index = favRooms.indexOf(cleanName);
        
        if (index === -1) {
            favRooms.push(cleanName);
            saveFavRooms(favRooms);
            return true;
        } else {
            favRooms.splice(index, 1);
            saveFavRooms(favRooms);
            return false;
        }
    }

    function isFavRoom(roomName) {
        return getFavRooms().indexOf(roomName) !== -1;
    }

    // === SALAS FIXADAS (PIN) ===
    var PINNED_STORAGE_KEY = 'pinned_rooms';

    function getPinnedRooms() {
        try {
            return JSON.parse(sessionStorage.getItem(PINNED_STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function savePinnedRooms(rooms) {
        sessionStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(rooms));
    }

    function togglePinnedRoom(roomName) {
        var cleanName = roomName.trim();
        var pinnedRooms = getPinnedRooms();
        var index = pinnedRooms.indexOf(cleanName);
        
        if (index === -1) {
            pinnedRooms.push(cleanName);
            savePinnedRooms(pinnedRooms);
            return true;
        } else {
            pinnedRooms.splice(index, 1);
            savePinnedRooms(pinnedRooms);
            return false;
        }
    }

    function isPinnedRoom(roomName) {
        return getPinnedRooms().indexOf(roomName.trim()) !== -1;
    }

    function clearPinnedRooms() {
        sessionStorage.removeItem(PINNED_STORAGE_KEY);
    }

    function movePinnedToTop(listContainer) {
        if (!listContainer) return;
        var pinnedRooms = getPinnedRooms();
        if (pinnedRooms.length === 0) return;

        var rows = Array.prototype.slice.call(listContainer.querySelectorAll('tr'));
        var pinnedRows = [];
        var normalRows = [];
        
        // Separa as rows em fixadas e normais
        for (var i = 0; i < rows.length; i++) {
            var nameCell = rows[i].querySelector('[data-hook="name"]');
            if (nameCell) {
                var roomName = (nameCell.textContent || '').trim();
                if (pinnedRooms.indexOf(roomName) !== -1) {
                    pinnedRows.push(rows[i]);
                } else {
                    normalRows.push(rows[i]);
                }
            } else {
                normalRows.push(rows[i]);
            }
        }

        // Verifica se já está na ordem correta (evita loop infinito)
        var needsReorder = false;
        for (var j = 0; j < pinnedRows.length; j++) {
            if (rows[j] !== pinnedRows[j]) {
                needsReorder = true;
                break;
            }
        }

        if (!needsReorder) return;

        // Remove todas as rows
        for (var k = 0; k < rows.length; k++) {
            rows[k].remove();
        }

        // Adiciona fixadas primeiro, depois normais
        for (var m = 0; m < pinnedRows.length; m++) {
            listContainer.appendChild(pinnedRows[m]);
        }
        for (var n = 0; n < normalRows.length; n++) {
            listContainer.appendChild(normalRows[n]);
        }
    }

    function updatePinnedHighlight(container) {
        var rows = container.querySelectorAll('tr');
        var pinnedRooms = getPinnedRooms();
        
        for (var i = 0; i < rows.length; i++) {
            var nameCell = rows[i].querySelector('[data-hook="name"]');
            if (!nameCell) continue;
            var name = (nameCell.textContent || '').trim();
            if (pinnedRooms.indexOf(name) !== -1) {
                rows[i].classList.add('pinned-room');
            } else {
                rows[i].classList.remove('pinned-room');
            }
        }
    }

    function cleanupRoomList() {
        if (roomListObserver) {
            roomListObserver.disconnect();
            roomListObserver = null;
        }
        cachedRows = null;
    }

    function buildCache(iframeDoc) {
        var table = iframeDoc.querySelector("[data-hook='list']");
        if (!table) return [];

        cachedRows = [];
        var rows = table.querySelectorAll('tr');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var nameCell = row.querySelector("[data-hook='name']");
            var flagCell = row.querySelector("[data-hook='flag']");
            cachedRows.push({
                row: row,
                name: nameCell ? (nameCell.textContent || '').toLowerCase() : '',
                country: flagCell ? flagCell.className.replace('flagico f-', '').trim() : ''
            });
        }
        return cachedRows;
    }

    function doSearch(iframeDoc, searchTerm) {
        var rows = cachedRows || buildCache(iframeDoc);
        if (!rows.length) return;

        for (var i = 0; i < rows.length; i++) {
            var item = rows[i];
            var matchesSearch = searchTerm === '' || item.name.indexOf(searchTerm) !== -1;
            var matchesCountry = selectedCountry === 'all' || item.country === selectedCountry;

            if (matchesSearch && matchesCountry) {
                item.row.classList.remove('search-hidden');
            } else {
                item.row.classList.add('search-hidden');
            }
        }
    }

    function modifyRoomList(iframeDoc) {
        var listContainer = iframeDoc.querySelector('.roomlist-view tbody[data-hook="list"]');
        var roomlistView = iframeDoc.querySelector('.roomlist-view');

        if (!listContainer || !roomlistView) {
            cleanupRoomList();
            return;
        }

        var dialog = roomlistView.querySelector('.dialog');
        if (!dialog) return;

        // Cria painel lateral se não existir
        if (!iframeDoc.getElementById('sidebar-panel')) {
            // Cria tooltip customizado
            var tooltip = iframeDoc.createElement('div');
            tooltip.id = 'sidebar-tooltip';
            tooltip.style.cssText = 'position:fixed;background:var(--theme-tooltip-bg, #222);color:var(--theme-text-primary, #fff);padding:6px 10px;border-radius:6px;font-size:12px;pointer-events:none;opacity:0;transition:opacity 0.15s;z-index:10000;white-space:nowrap;border:1px solid var(--theme-tooltip-border, #333);box-shadow:0 4px 16px rgba(0,0,0,0.3);';
            iframeDoc.body.appendChild(tooltip);

            function showTooltip(el, text) {
                var rect = el.getBoundingClientRect();
                tooltip.textContent = text;
                // Posiciona à direita do botão (fora do dialog)
                tooltip.style.left = (rect.right + 8) + 'px';
                tooltip.style.top = (rect.top + rect.height / 2 - 12) + 'px';
                tooltip.style.opacity = '1';
            }

            function hideTooltip() {
                tooltip.style.opacity = '0';
            }

            function addTooltip(el, text) {
                if (!el) return;
                el.addEventListener('mouseenter', function() { showTooltip(el, text); });
                el.addEventListener('mouseleave', hideTooltip);
                el.addEventListener('click', hideTooltip); // Esconde ao clicar
            }

            var sidebar = iframeDoc.createElement('div');
            sidebar.id = 'sidebar-panel';
            sidebar.style.cssText = 'position:absolute;right:-50px;top:5px;bottom:5px;width:50px;background:var(--theme-bg-primary, #141414);border:1px solid var(--theme-border, #232323);border-radius:0 8px 8px 0;display:flex;flex-direction:column;gap:8px;padding:10px 6px;box-sizing:border-box;z-index:-1;';
            
            // Esconde tooltip quando mouse sai do sidebar
            sidebar.addEventListener('mouseleave', hideTooltip);

            // Pega botões originais
            var refreshBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="refresh"]');
            var joinBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="join"]');
            var createBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="create"]');
            var replaysLabel = iframeDoc.querySelector('.roomlist-view label[for="replayfile"]');
            var settingsBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="settings"]');

            // Adiciona ícones e move pro sidebar
            if (refreshBtn) {
                refreshBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';
                var t = window.__t || function(k) { return k; };
                addTooltip(refreshBtn, t('Atualizar'));
                sidebar.appendChild(refreshBtn);
            }
            if (joinBtn) {
                // Wrapper para o botão de entrar (tooltip funciona mesmo desabilitado)
                var joinWrapper = iframeDoc.createElement('div');
                joinWrapper.style.cssText = 'display:flex;justify-content:center;';
                joinBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>';
                addTooltip(joinWrapper, t('Entrar'));
                joinWrapper.appendChild(joinBtn);
                sidebar.appendChild(joinWrapper);
            }
            if (createBtn) {
                createBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
                addTooltip(createBtn, t('Criar Sala'));
                sidebar.appendChild(createBtn);
            }

            // Botão de favoritos (bookmark)
            var favBtn = iframeDoc.createElement('button');
            favBtn.id = 'fav-filter-btn';
            addTooltip(favBtn, t('Favoritos'));
            favBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
            favBtn.onclick = function() {
                var rows = listContainer.querySelectorAll('tr');
                var favRooms = getFavRooms();

                if (!isFilteringFavs) {
                    if (favRooms.length === 0) return;
                    
                    for (var i = 0; i < rows.length; i++) {
                        var nameEl = rows[i].querySelector('[data-hook="name"]');
                        if (!nameEl) continue;
                        var roomName = (nameEl.textContent || '').trim();
                        if (favRooms.indexOf(roomName) !== -1) {
                            rows[i].classList.remove('fav-hidden');
                        } else {
                            rows[i].classList.add('fav-hidden');
                        }
                    }
                    isFilteringFavs = true;
                    var svg = favBtn.querySelector('svg');
                    svg.setAttribute('fill', '#f59e0b');
                    svg.setAttribute('stroke', '#f59e0b');
                } else {
                    for (var j = 0; j < rows.length; j++) {
                        rows[j].classList.remove('fav-hidden');
                    }
                    isFilteringFavs = false;
                    var svg = favBtn.querySelector('svg');
                    svg.setAttribute('fill', 'none');
                    svg.setAttribute('stroke', 'currentColor');
                }
            };
            sidebar.appendChild(favBtn);

            // Botão de amizades
            var friendsBtn = iframeDoc.createElement('button');
            friendsBtn.id = 'friends-btn';
            addTooltip(friendsBtn, t('Amizades'));
            friendsBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            friendsBtn.onclick = function() {
                if (window.FriendsSystem) {
                    window.FriendsSystem.injectFriendsButton(iframeDoc);
                    // Simula clique no botão injetado ou abre diretamente
                    var injectedBtn = iframeDoc.getElementById('friends-btn-panel');
                    if (injectedBtn) {
                        injectedBtn.click();
                    } else {
                        // Abre painel diretamente
                        window.FriendsSystem.toggleFriendsPanel(iframeDoc);
                    }
                }
            };
            sidebar.appendChild(friendsBtn);

            // Botão de equipes
            var teamsBtn = iframeDoc.createElement('button');
            teamsBtn.id = 'teams-btn';
            addTooltip(teamsBtn, t('Equipe'));
            teamsBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
            teamsBtn.onclick = function() {
                if (window.TeamsSystem) {
                    window.TeamsSystem.toggleTeamsPanel(iframeDoc);
                }
            };
            sidebar.appendChild(teamsBtn);

            // Botão Pro
            var proBtn = iframeDoc.createElement('button');
            proBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="currentColor"/><path d="M15 9l-4.5 4.5L8 11" stroke="var(--theme-bg-primary, #141414)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            addTooltip(proBtn, 'Pro');
            proBtn.onclick = function() {
                if (window.__showProPopup) {
                    window.__showProPopup();
                } else if (window.top && window.top.__showProPopup) {
                    window.top.__showProPopup();
                }
            };
            sidebar.appendChild(proBtn);

            // Espaçador
            var spacer = iframeDoc.createElement('div');
            spacer.style.cssText = 'flex:1;';
            sidebar.appendChild(spacer);

            // Replays e Settings no final
            if (replaysLabel) {
                replaysLabel.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                addTooltip(replaysLabel, t('Replays'));
                sidebar.appendChild(replaysLabel);
            }
            if (settingsBtn) {
                settingsBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';
                addTooltip(settingsBtn, t('Configurações'));
                sidebar.appendChild(settingsBtn);
            }

            // Esconde container original dos botões
            var buttonsContainer = iframeDoc.querySelector('.roomlist-view .buttons');
            if (buttonsContainer) {
                buttonsContainer.style.display = 'none';
            }

            // Botão de voltar para página principal (no topo)
            var backBtn = iframeDoc.createElement('button');
            backBtn.id = 'back-btn';
            addTooltip(backBtn, t('Voltar'));
            backBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>';
            backBtn.onclick = function() {
                window.top.location.reload();
            };
            sidebar.insertBefore(backBtn, sidebar.firstChild);

            dialog.style.position = 'relative';
            dialog.appendChild(sidebar);

            // Listener pro refresh limpar cache e resetar filtro
            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() { 
                    cachedRows = null;
                    isFilteringFavs = false;
                    var favBtnEl = iframeDoc.getElementById('fav-filter-btn');
                    if (favBtnEl) {
                        var svg = favBtnEl.querySelector('svg');
                        if (svg) {
                            svg.setAttribute('fill', 'none');
                            svg.setAttribute('stroke', 'currentColor');
                        }
                    }
                });
            }

            // Menu de contexto para favoritos
            var contextMenu = null;
            
            function createContextMenu() {
                var menu = iframeDoc.createElement('div');
                menu.id = 'room-context-menu';
                menu.style.cssText = 'position:fixed;background:var(--theme-bg-secondary, #1a1a1a);border:1px solid var(--theme-border-light, #333);border-radius:8px;padding:6px;min-width:180px;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,0.5);display:none;';
                iframeDoc.body.appendChild(menu);
                return menu;
            }

            function showContextMenu(e, roomName) {
                e.preventDefault();
                if (!contextMenu) contextMenu = createContextMenu();

                var isFav = isFavRoom(roomName);
                var isPinned = isPinnedRoom(roomName);
                var bookmarkIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isFav ? '#f59e0b' : 'none') + '" stroke="' + (isFav ? '#f59e0b' : 'var(--theme-text-secondary, #888)') + '" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
                var pinIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isPinned ? '#3b82f6' : 'none') + '" stroke="' + (isPinned ? '#3b82f6' : 'var(--theme-text-secondary, #888)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>';
                
                var t = window.__t || function(k) { return k; };
                contextMenu.innerHTML = '<div class="ctx-item ctx-pin" style="padding:10px 14px;cursor:pointer;color:var(--theme-text-primary, #fff);font-size:13px;display:flex;align-items:center;gap:10px;border-radius:6px;transition:background 0.1s;">' + pinIcon + '<span>' + (isPinned ? t('Desafixar Sala') : t('Fixar no Topo')) + '</span></div>' +
                    '<div class="ctx-item ctx-fav" style="padding:10px 14px;cursor:pointer;color:var(--theme-text-primary, #fff);font-size:13px;display:flex;align-items:center;gap:10px;border-radius:6px;transition:background 0.1s;">' + bookmarkIcon + '<span>' + (isFav ? t('Remover dos Favoritos') : t('Adicionar aos Favoritos')) + '</span></div>';

                var items = contextMenu.querySelectorAll('.ctx-item');
                for (var i = 0; i < items.length; i++) {
                    (function(item) {
                        item.onmouseenter = function() { item.style.background = 'var(--theme-bg-tertiary, #272727)'; };
                        item.onmouseleave = function() { item.style.background = ''; };
                    })(items[i]);
                }

                // Handler para fixar sala
                var pinItem = contextMenu.querySelector('.ctx-pin');
                pinItem.onclick = function() {
                    togglePinnedRoom(roomName);
                    contextMenu.style.display = 'none';
                    updatePinnedHighlight(listContainer);
                    movePinnedToTop(listContainer);
                };

                // Handler para favoritos
                var favItem = contextMenu.querySelector('.ctx-fav');
                favItem.onclick = function() {
                    toggleFavRoom(roomName);
                    contextMenu.style.display = 'none';
                    updateFavHighlight(listContainer);
                    
                    if (isFilteringFavs && !isFavRoom(roomName)) {
                        var rows = listContainer.querySelectorAll('tr');
                        for (var i = 0; i < rows.length; i++) {
                            var nameCell = rows[i].querySelector('[data-hook="name"]');
                            if (nameCell && (nameCell.textContent || '').trim() === roomName) {
                                rows[i].classList.add('fav-hidden');
                            }
                        }
                    }
                };

                contextMenu.style.left = e.clientX + 'px';
                contextMenu.style.top = e.clientY + 'px';
                contextMenu.style.display = 'block';
            }

            iframeDoc.addEventListener('click', function() {
                if (contextMenu) contextMenu.style.display = 'none';
            });

            iframeDoc.addEventListener('contextmenu', function(e) {
                var target = e.target;
                var row = target.closest ? target.closest('tr') : null;
                if (!row) {
                    var el = target;
                    while (el && el.tagName !== 'TR') el = el.parentElement;
                    row = el;
                }
                
                if (row && listContainer.contains(row)) {
                    var nameCell = row.querySelector('[data-hook="name"]');
                    if (nameCell) {
                        var roomName = (nameCell.textContent || '').trim();
                        if (roomName) showContextMenu(e, roomName);
                    }
                }
            });

            // Destaca salas favoritas
            function updateFavHighlight(container) {
                var rows = container.querySelectorAll('tr');
                var favRooms = getFavRooms();
                
                for (var i = 0; i < rows.length; i++) {
                    var nameCell = rows[i].querySelector('[data-hook="name"]');
                    if (!nameCell) continue;
                    var name = (nameCell.textContent || '').trim();
                    if (favRooms.indexOf(name) !== -1) {
                        nameCell.classList.add('fav-room');
                    } else {
                        nameCell.classList.remove('fav-room');
                    }
                }
            }

            // Observer pra destacar favoritos e fixados quando lista muda
            var observerTimeout = null;
            var isReordering = false;
            var favObserver = new MutationObserver(function(mutations) {
                // Ignora mutações durante reordenação
                if (isReordering) return;
                
                if (observerTimeout) clearTimeout(observerTimeout);
                observerTimeout = setTimeout(function() {
                    updateFavHighlight(listContainer);
                    updatePinnedHighlight(listContainer);
                    isReordering = true;
                    movePinnedToTop(listContainer);
                    isReordering = false;
                }, 100);
            });
            favObserver.observe(listContainer, { childList: true });
            updateFavHighlight(listContainer);
            updatePinnedHighlight(listContainer);
            movePinnedToTop(listContainer);
        }

        // Adiciona barra de pesquisa
        if (!iframeDoc.getElementById('room-search-input')) {
            var searchContainer = iframeDoc.createElement('div');
            searchContainer.id = 'room-search';
            searchContainer.style.cssText = 'padding:0px 16px 8px 16px;display:flex;gap:10px;align-items:center;';

            // Ícone de busca
            var svgNS = 'http://www.w3.org/2000/svg';
            var svg = iframeDoc.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', '#666');
            svg.setAttribute('stroke-width', '2');
            var circle = iframeDoc.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', '11');
            circle.setAttribute('cy', '11');
            circle.setAttribute('r', '8');
            var path = iframeDoc.createElementNS(svgNS, 'path');
            path.setAttribute('d', 'm21 21-4.35-4.35');
            svg.appendChild(circle);
            svg.appendChild(path);

            // Input de pesquisa
            var input = iframeDoc.createElement('input');
            input.type = 'text';
            input.id = 'room-search-input';
            var t = window.__t || function(k) { return k; };
            input.placeholder = t('Pesquisar salas...');
            input.autocomplete = 'off';
            input.style.cssText = 'flex:1;background:var(--theme-bg-secondary, #1a1a1a);border:1px solid var(--theme-border-light, #333);border-radius:4px;padding:8px 12px;color:var(--theme-text-primary, #fff);font-size:13px;outline:none;';

            input.oninput = function() {
                if (searchTimeout) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function() {
                    var searchValue = input.value.toLowerCase();
                    doSearch(iframeDoc, searchValue);
                    // Salva o termo de pesquisa
                    sessionStorage.setItem('roomlist_search_term', input.value);
                }, 50);
            };

            input.onfocus = function() { input.style.borderColor = 'var(--theme-border-light, #444)'; };
            input.onblur = function() { input.style.borderColor = 'var(--theme-border-light, #333)'; };

            // Restaura termo de pesquisa salvo
            var savedSearch = sessionStorage.getItem('roomlist_search_term');
            if (savedSearch) {
                input.value = savedSearch;
                // Aguarda a lista carregar e aplica a pesquisa
                setTimeout(function() {
                    doSearch(iframeDoc, savedSearch.toLowerCase());
                }, 100);
            }

            // Botão refresh limpa cache mas mantém pesquisa
            var refreshBtn = iframeDoc.querySelector('[data-hook="refresh"]');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() { 
                    cachedRows = null;
                    // Reaplica pesquisa após refresh
                    setTimeout(function() {
                        var currentSearch = input.value.toLowerCase();
                        if (currentSearch) {
                            doSearch(iframeDoc, currentSearch);
                        }
                    }, 200);
                });
            }

            // Filtro por país - design simplificado
            var filterBtn = iframeDoc.createElement('button');
            filterBtn.id = 'country-filter-btn';
            filterBtn.style.cssText = 'background:var(--theme-bg-secondary, #1a1a1a);border:1px solid var(--theme-border-light, #333);padding:0 10px;color:var(--theme-text-muted, #666);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:12px;font-weight:600;height:34px;';
            filterBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
            filterBtn.onmouseenter = function() { filterBtn.style.background = 'var(--theme-bg-hover, #333)'; filterBtn.style.color = 'var(--theme-text-primary, #fff)'; };
            filterBtn.onmouseleave = function() { if (selectedCountry === 'all') { filterBtn.style.background = 'var(--theme-bg-secondary, #1a1a1a)'; filterBtn.style.color = 'var(--theme-text-muted, #666)'; } };

            var dropdown = iframeDoc.createElement('div');
            dropdown.id = 'country-dropdown';
            dropdown.style.cssText = 'display:none;position:absolute;top:100%;right:0;background:var(--theme-bg-secondary, #1a1a1a);border:1px solid var(--theme-border-light, #333);border-radius:8px;max-height:240px;overflow-y:auto;z-index:1000;min-width:160px;margin-top:4px;box-shadow:0 8px 32px rgba(0,0,0,0.4);padding:4px 0;';

            var filterWrapper = iframeDoc.createElement('div');
            filterWrapper.style.cssText = 'position:relative;';
            filterWrapper.appendChild(filterBtn);
            filterWrapper.appendChild(dropdown);

            function updateCountryList() {
                var table = iframeDoc.querySelector("[data-hook='list']");
                if (!table) return;

                var countries = {};
                var rows = table.querySelectorAll('tr');
                for (var i = 0; i < rows.length; i++) {
                    var flagCell = rows[i].querySelector("[data-hook='flag']");
                    if (flagCell) {
                        var code = flagCell.className.replace('flagico f-', '').trim();
                        if (code) countries[code] = true;
                    }
                }

                dropdown.innerHTML = '';
                
                // Ordena os países alfabeticamente
                var sortedCountries = [];
                for (var c in countries) {
                    sortedCountries.push(c);
                }
                sortedCountries.sort();

                // Adiciona "Todos" primeiro
                var t = window.__t || function(k) { return k; };
                var allItem = iframeDoc.createElement('div');
                allItem.style.cssText = 'padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:4px;margin:0 4px;';
                allItem.onmouseenter = function() { allItem.style.background = 'var(--theme-bg-hover, #333)'; };
                allItem.onmouseleave = function() { allItem.style.background = ''; };
                allItem.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-muted, #666)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span style="color:var(--theme-text-primary, #fff);font-size:13px;">' + t('Todos os países') + '</span>';
                allItem.onclick = function() {
                    selectedCountry = 'all';
                    dropdown.style.display = 'none';
                    filterBtn.style.background = 'var(--theme-bg-secondary, #1a1a1a)';
                    filterBtn.style.color = 'var(--theme-text-muted, #666)';
                    filterBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
                    // Limpa salas fixadas ao mudar filtro de país
                    clearPinnedRooms();
                    updatePinnedHighlight(listContainer);
                    doSearch(iframeDoc, input.value.toLowerCase());
                };
                dropdown.appendChild(allItem);

                // Adiciona os países ordenados
                for (var j = 0; j < sortedCountries.length; j++) {
                    (function(code) {
                        var item = iframeDoc.createElement('div');
                        item.style.cssText = 'padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:4px;margin:0 4px;';
                        item.onmouseenter = function() { item.style.background = 'var(--theme-bg-hover, #333)'; };
                        item.onmouseleave = function() { item.style.background = ''; };
                        item.innerHTML = '<span class="flagico f-' + code + '" style="width:20px;height:15px;display:inline-block;"></span><span style="color:var(--theme-text-primary, #fff);font-size:13px;">' + code.toUpperCase() + '</span>';

                        item.onclick = function() {
                            selectedCountry = code;
                            dropdown.style.display = 'none';
                            filterBtn.style.background = 'var(--theme-bg-hover, #333)';
                            filterBtn.style.color = 'var(--theme-text-primary, #fff)';
                            filterBtn.innerHTML = '<span style="font-size:12px;font-weight:600;">' + code.toUpperCase() + '</span>';
                            // Limpa salas fixadas ao mudar filtro de país
                            clearPinnedRooms();
                            updatePinnedHighlight(listContainer);
                            doSearch(iframeDoc, input.value.toLowerCase());
                        };

                        dropdown.appendChild(item);
                    })(sortedCountries[j]);
                }
            }

            filterBtn.onclick = function(e) {
                e.stopPropagation();
                updateCountryList();
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            };

            iframeDoc.addEventListener('click', function() {
                dropdown.style.display = 'none';
            });

            searchContainer.appendChild(svg);
            searchContainer.appendChild(input);
            searchContainer.appendChild(filterWrapper);

            var dialog = roomlistView.querySelector('.dialog');
            if (dialog) {
                // Design 1.3: Barra de pesquisa acima do header da tabela
                var headerTable = dialog.querySelector('table.header');
                if (headerTable && headerTable.parentNode) {
                    headerTable.parentNode.insertBefore(searchContainer, headerTable);
                } else {
                    // Fallback: insere antes do content
                    var content = dialog.querySelector('.content');
                    if (content && content.parentNode) {
                        content.parentNode.insertBefore(searchContainer, content);
                    }
                }
            }
        }

        if (roomListObserver && listContainer.dataset.observing) return;
        listContainer.dataset.observing = 'true';

        function applyPasswordOpacity() {
            try {
                var rows = listContainer.querySelectorAll('tr');
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var passCell = row.querySelector('[data-hook="pass"]');
                    if (passCell) {
                        row.style.opacity = (passCell.textContent || '').indexOf('Yes') !== -1 ? '0.5' : '1';
                    }
                }
            } catch (e) {}
        }

        cleanupRoomList();

        roomListObserver = new MutationObserver(applyPasswordOpacity);
        roomListObserver.observe(listContainer, { childList: true });

        applyPasswordOpacity();
    }

    // Observer otimizado - desconecta durante gameplay
    function init() {
        if (!Injector.isGameFrame()) return;
        
        var checkInterval = null;
        
        var hideTooltipAndMenu = function() {
            var tooltip = document.getElementById('sidebar-tooltip');
            if (tooltip) tooltip.style.opacity = '0';
            var ctxMenu = document.getElementById('room-context-menu');
            if (ctxMenu) ctxMenu.remove();
        };
        
        var checkAndModify = function() {
            var roomlistView = document.querySelector('.roomlist-view');
            var sidebar = document.getElementById('sidebar-panel');
            
            if (roomlistView && !sidebar) {
                modifyRoomList(document);
            } else if (!roomlistView) {
                hideTooltipAndMenu();
            }
        };
        
        var startChecking = function() {
            if (checkInterval) return;
            Injector.log('Roomlist: startChecking');
            checkInterval = setInterval(checkAndModify, 300);
            checkAndModify();
        };
        
        var stopChecking = function() {
            if (checkInterval) {
                Injector.log('Roomlist: stopChecking');
                clearInterval(checkInterval);
                checkInterval = null;
            }
            hideTooltipAndMenu();
        };
        
        // Usa o sistema de views do core
        Injector.onView('roomlist-view', function() {
            Injector.log('Roomlist: onView roomlist-view');
            startChecking();
        });
        
        Injector.onView('room-view', function() {
            Injector.log('Roomlist: onView room-view');
            startChecking();
        });
        
        Injector.onView('game-view', function() {
            Injector.log('Roomlist: onView game-view');
            stopChecking();
        });
        
        // Inicia se não estiver em game-view
        if (!document.querySelector('.game-view')) {
            startChecking();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    Injector.log('Roomlist module loaded');
})();
