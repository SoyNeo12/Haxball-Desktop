// ============================================
// VERIFIED - Badge de verificado (v2)
// Usa player ID para identificar usuários reais
// ============================================
(function() {
    function isGameContext() {
        var loc = window.location.href;
        return loc.indexOf('game.html') !== -1 ||
            loc.indexOf('html5.haxball.com') !== -1 ||
            loc.indexOf('/play') !== -1 ||
            loc.indexOf('/rs/') !== -1 ||
            loc.indexOf('?c=') !== -1 ||
            loc.indexOf('&c=') !== -1;
    }

    if (Injector.isMainFrame() && !isGameContext()) return;

    var LOCAL_SERVER = 'http://localhost:5483';
    var BADGE_SVG = '<svg width="12" height="12" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="#249EF0"/><path d="M15 9l-4.5 4.5L8 11" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var verifiedCache = {};
    window.__verifiedCache = verifiedCache; // Expõe globalmente desde o início
    var myVerified = false;
    var myDiscordId = null; // Discord ID do usuário local

    var statusLoaded = false;
    var listObservers = [];
    var isActive = false;
    var lastSentPlayerId = null;
    var observerInitialized = false;
    
    
    // Remove o caractere invisível do nick para obter o nick limpo (compatibilidade com nicks antigos)
    function cleanNick(nick) {
        return nick ? nick.replace(/\u200B/g, '') : nick;
    }

    function isGhostMode() {
        return localStorage.getItem('ghost_mode') === 'true';
    }

    function getLocalPlayerId() {
        return window.__myLocalPlayerId;
    }

    function getLocalPlayerIdFromPage() {
        var resultEl = document.getElementById('__hax_player_id_result');
        if (!resultEl) {
            resultEl = document.createElement('div');
            resultEl.id = '__hax_player_id_result';
            resultEl.style.display = 'none';
            document.body.appendChild(resultEl);
        }
        
        resultEl.removeAttribute('data-player-id');
        
        var script = document.createElement('script');
        script.textContent = '(function() { var el = document.getElementById("__hax_player_id_result"); if (el) { var id = window.__haxLocalPlayerId; el.setAttribute("data-player-id", id != null ? id : "null"); } })();';
        document.body.appendChild(script);
        script.remove();
        
        var playerIdStr = resultEl.getAttribute('data-player-id');
        if (playerIdStr != null && playerIdStr !== 'null') {
            return parseInt(playerIdStr, 10);
        }
        return null;
    }

    function waitForMyPlayerId(callback, maxAttempts) {
        maxAttempts = maxAttempts || 50;
        var attempts = 0;
        
        function check() {
            var id = getLocalPlayerIdFromPage();
            if (id != null) {
                callback(id);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(check, 200);
            }
        }
        check();
    }

    function getRoomId() {
        try {
            var url = window.top.location.href;
            var match = url.match(/[?&]c=([^&]+)/);
            if (match) return match[1];
        } catch (e) {}
        return null;
    }

    function fetchMyStatus(callback) {
        if (statusLoaded) { if (callback) callback(); return; }
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', LOCAL_SERVER + '/user', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.logged_in) {
                        myVerified = data.is_verified;
                        myDiscordId = data.discord_id;
                        
                        // Injeta discord_id e flag de debug no contexto do game-min
                        if (myDiscordId) {
                            var script = document.createElement('script');
                            script.textContent = 'window.__haxDiscordId = "' + myDiscordId + '";';
                            document.body.appendChild(script);
                            script.remove();
                        }
                    }
                    statusLoaded = true;
                } catch (e) {}
                if (callback) callback();
            }
        };
        xhr.onerror = function() { 
            if (callback) callback(); 
        };
        xhr.send();
    }

    function sendPlayerIdToServer(playerId, roomId) {
        if (playerId === lastSentPlayerId) return;
        lastSentPlayerId = playerId;
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', LOCAL_SERVER + '/session/player-id', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ player_id: playerId, room_id: roomId }));
    }

    // Pega o nick do jogador local
    function getLocalNick() {
        var localPlayerId = getLocalPlayerId();
        if (localPlayerId == null) return null;
        
        var players = document.querySelectorAll('.player-list-item');
        for (var i = 0; i < players.length; i++) {
            var pid = parseInt(players[i].dataset.playerId, 10);
            if (pid === localPlayerId) {
                var nameEl = players[i].querySelector('[data-hook="name"]');
                if (nameEl) {
                    return cleanNick((nameEl.textContent || '').trim());
                }
            }
        }
        return null;
    }

    // Envia nick do jogo para o servidor (para outros jogadores identificarem)
    function sendGameNickToServer(gameNick, roomId) {
        if (!gameNick) return;
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', LOCAL_SERVER + '/session/game-nick', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ game_nick: gameNick, room_id: roomId }));
    }

    function notifyLeaveRoom() {
        lastSentPlayerId = null;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', LOCAL_SERVER + '/session/leave-room', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send('{}');
    }

    function fetchVerifiedUsers(nicks, roomId, callback) {
        if (!nicks.length) { callback({}); return; }
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', LOCAL_SERVER + '/verified-v2', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                try {
                    var result = JSON.parse(xhr.responseText);
                    callback(result || {});
                } catch (e) {
                    callback({});
                }
            }
        };
        xhr.onerror = function() { 
            callback({}); 
        };
        xhr.send(JSON.stringify({ nicks: nicks, room_id: roomId }));
    }

    function applyBadge(item) {
        if (isGhostMode()) {
            return;
        }

        var nameEl = item.querySelector('[data-hook="name"]');
        if (!nameEl) return;

        var rawName = (nameEl.textContent || '').trim();
        var name = cleanNick(rawName); // Nick sem o caractere invisível (compatibilidade)
        var playerId = parseInt(item.dataset.playerId, 10);
        var localPlayerId = getLocalPlayerId();

        var showBadge = false;
        var badgeColor = '#249EF0'; // Cor padrão
        var badgeGradient = ''; // Gradiente do badge
        var nickColor = null;
        var nickGradient = ''; // Gradiente do nick
        var banner = null;
        var font = null;
        var customBannerC1 = null;
        var customBannerC2 = null;

        if (playerId === localPlayerId) {
            // Jogador local - usa configurações Pro independente de ser verificado
            // Badge aparece se for verificado OU se for PRO
            if (myVerified || window.__proSettings) {
                showBadge = true;
            }
            // Aplica configurações Pro (cor/gradiente/banner/fonte) mesmo sem ser verificado
            if (window.__proSettings) {
                if (window.__proSettings.verified_color) badgeColor = window.__proSettings.verified_color;
                if (window.__proSettings.verified_gradient) badgeGradient = window.__proSettings.verified_gradient;
                if (window.__proSettings.nick_color) nickColor = window.__proSettings.nick_color;
                if (window.__proSettings.nick_gradient) nickGradient = window.__proSettings.nick_gradient;
                if (window.__proSettings.banner) banner = window.__proSettings.banner;
                if (window.__proSettings.font) font = window.__proSettings.font;
                if (window.__proSettings.custom_banner_color1) customBannerC1 = window.__proSettings.custom_banner_color1;
                if (window.__proSettings.custom_banner_color2) customBannerC2 = window.__proSettings.custom_banner_color2;
            }
        } else {
            var info = verifiedCache[name];
            if (info) {
                // Verifica pelo nick diretamente
                var isMatch = true;
                
                if (isMatch) {
                    // Badge aparece se for verificado OU se for PRO
                    if (info.verified || info.isPro) {
                        showBadge = true;
                    }
                    // Aplica configurações Pro mesmo sem ser verificado (basta ser PRO)
                    if (info.isPro || info.verified) {
                        if (info.verified_color) badgeColor = info.verified_color;
                        if (info.verified_gradient) badgeGradient = info.verified_gradient;
                        if (info.nick_color) nickColor = info.nick_color;
                        if (info.nick_gradient) nickGradient = info.nick_gradient;
                        if (info.banner) banner = info.banner;
                        if (info.font) font = info.font;
                        if (info.custom_banner_color1) customBannerC1 = info.custom_banner_color1;
                        if (info.custom_banner_color2) customBannerC2 = info.custom_banner_color2;
                    }
                }
            }
        }

        // Aplica banner Pro (mesmo sem badge de verificado)
        applyBanner(item, banner, playerId, localPlayerId, name, customBannerC1, customBannerC2);
        
        // Aplica fonte Pro
        applyFont(nameEl, font, playerId, localPlayerId, name);

        // Aplica cor ou gradiente no nick (mesmo sem badge de verificado)
        if (!item.classList.contains('admin')) {
            if (nickGradient) {
                var colors = nickGradient.split(',');
                var gradientCSS = 'linear-gradient(90deg, ' + colors[0].trim() + ', ' + colors[1].trim() + ')';
                // Aplica no primeiro nó de texto (span do nick), não no container inteiro
                var nickSpan = nameEl.childNodes[0];
                if (nickSpan && nickSpan.nodeType === 3) {
                    // É um nó de texto, precisa envolver em span
                    var wrapper = document.createElement('span');
                    wrapper.className = 'nick-gradient';
                    wrapper.textContent = nickSpan.textContent;
                    nameEl.replaceChild(wrapper, nickSpan);
                    nickSpan = wrapper;
                } else if (!nickSpan || !nickSpan.classList || !nickSpan.classList.contains('nick-gradient')) {
                    // Procura span existente ou cria um
                    var existingWrapper = nameEl.querySelector('.nick-gradient');
                    if (existingWrapper) {
                        nickSpan = existingWrapper;
                    } else {
                        // Pega o texto do nick (antes das badges)
                        var textContent = '';
                        for (var n = 0; n < nameEl.childNodes.length; n++) {
                            if (nameEl.childNodes[n].nodeType === 3) {
                                textContent += nameEl.childNodes[n].textContent;
                            }
                        }
                        if (textContent.trim()) {
                            var wrapper = document.createElement('span');
                            wrapper.className = 'nick-gradient';
                            wrapper.textContent = textContent.trim();
                            // Remove nós de texto antigos
                            for (var n = nameEl.childNodes.length - 1; n >= 0; n--) {
                                if (nameEl.childNodes[n].nodeType === 3) {
                                    nameEl.removeChild(nameEl.childNodes[n]);
                                }
                            }
                            nameEl.insertBefore(wrapper, nameEl.firstChild);
                            nickSpan = wrapper;
                        }
                    }
                }
                if (nickSpan && nickSpan.style) {
                    nickSpan.style.setProperty('background', gradientCSS, 'important');
                    nickSpan.style.setProperty('-webkit-background-clip', 'text', 'important');
                    nickSpan.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
                    nickSpan.style.setProperty('background-clip', 'text', 'important');
                    nickSpan.style.setProperty('display', 'inline-block', 'important');
                    nickSpan.style.setProperty('color', 'transparent', 'important');
                }
                // Limpa estilos do container
                nameEl.style.color = '';
            } else if (nickColor) {
                // Remove wrapper de gradiente se existir
                var gradientWrapper = nameEl.querySelector('.nick-gradient');
                if (gradientWrapper) {
                    var text = gradientWrapper.textContent;
                    gradientWrapper.replaceWith(document.createTextNode(text));
                }
                nameEl.style.background = '';
                nameEl.style.webkitBackgroundClip = '';
                nameEl.style.webkitTextFillColor = '';
                nameEl.style.backgroundClip = '';
                nameEl.style.display = '';
                nameEl.style.color = nickColor;
            } else {
                // Remove wrapper de gradiente se existir
                var gradientWrapper = nameEl.querySelector('.nick-gradient');
                if (gradientWrapper) {
                    var text = gradientWrapper.textContent;
                    gradientWrapper.replaceWith(document.createTextNode(text));
                }
                nameEl.style.background = '';
                nameEl.style.webkitBackgroundClip = '';
                nameEl.style.webkitTextFillColor = '';
                nameEl.style.backgroundClip = '';
                nameEl.style.display = '';
                nameEl.style.color = '';
            }
        }

        if (!showBadge) return;

        // Remove badge existente para atualizar cor
        var existingBadge = item.querySelector('.verified-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        var badge = document.createElement('span');
        badge.className = 'verified-badge';
        
        // Badge com gradiente ou cor sólida
        if (badgeGradient) {
            var colors = badgeGradient.split(',');
            badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 22 22"><defs><linearGradient id="vg-' + playerId + '" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="' + colors[0] + '"/><stop offset="100%" stop-color="' + colors[1] + '"/></linearGradient></defs><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="url(#vg-' + playerId + ')"/><path d="M15 9l-4.5 4.5L8 11" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else {
            badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="' + badgeColor + '"/><path d="M15 9l-4.5 4.5L8 11" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        badge.style.cssText = 'display:inline-flex;align-items:center;margin-left:3px;vertical-align:middle;';
        
        // Insere antes de outras badges (team-badge) pra manter ordem correta
        var teamBadge = nameEl.querySelector('.team-badge');
        if (teamBadge) {
            nameEl.insertBefore(badge, teamBadge);
        } else {
            nameEl.appendChild(badge);
        }
    }

    // Aplica fonte Pro no nick
    function applyFont(nameEl, font, playerId, localPlayerId, name) {
        // Fontes disponíveis
        var fonts = window.__proFonts || {
            'default': { family: 'Space Grotesk' },
            'roboto': { family: 'Roboto' },
            'poppins': { family: 'Poppins' },
            'montserrat': { family: 'Montserrat' },
            'oswald': { family: 'Oswald' },
            'raleway': { family: 'Raleway' },
            'ubuntu': { family: 'Ubuntu' },
            'quicksand': { family: 'Quicksand' },
            'comfortaa': { family: 'Comfortaa' },
            'righteous': { family: 'Righteous' },
            'orbitron': { family: 'Orbitron' },
            'pressstart': { family: 'Press Start 2P' }
        };

        // Remove fonte customizada se não tiver fonte válida
        if (!font || font === 'default' || !fonts[font]) {
            nameEl.style.removeProperty('font-family');
            return;
        }

        var fontFamily = fonts[font].family;
        // Usa setProperty com 'important' para sobrescrever o CSS global
        nameEl.style.setProperty('font-family', "'" + fontFamily + "', sans-serif", 'important');
    }

    // Aplica banner Pro no fundo do player-list-item
    function applyBanner(item, banner, playerId, localPlayerId, name, customC1, customC2) {
        // Banners disponíveis
        var banners = window.__proBanners || {
            'none': { gradient: 'none' },
            'gold': { gradient: 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(255,193,7,0.25) 50%, rgba(255,215,0,0.15) 100%)' },
            'diamond': { gradient: 'linear-gradient(90deg, rgba(185,242,255,0.15) 0%, rgba(0,191,255,0.25) 50%, rgba(185,242,255,0.15) 100%)' },
            'fire': { gradient: 'linear-gradient(90deg, rgba(255,69,0,0.15) 0%, rgba(255,140,0,0.25) 50%, rgba(255,69,0,0.15) 100%)' },
            'emerald': { gradient: 'linear-gradient(90deg, rgba(0,201,87,0.15) 0%, rgba(80,200,120,0.25) 50%, rgba(0,201,87,0.15) 100%)' },
            'purple': { gradient: 'linear-gradient(90deg, rgba(138,43,226,0.15) 0%, rgba(186,85,211,0.25) 50%, rgba(138,43,226,0.15) 100%)' },
            'rainbow': { gradient: 'linear-gradient(90deg, rgba(255,0,0,0.2) 0%, rgba(255,127,0,0.2) 17%, rgba(255,255,0,0.2) 33%, rgba(0,255,0,0.2) 50%, rgba(0,127,255,0.2) 67%, rgba(139,0,255,0.2) 83%, rgba(255,0,0,0.2) 100%)' },
            'neon': { gradient: 'linear-gradient(90deg, rgba(57,255,20,0.15) 0%, rgba(0,255,255,0.25) 50%, rgba(57,255,20,0.15) 100%)' },
            'sunset': { gradient: 'linear-gradient(90deg, rgba(255,94,77,0.15) 0%, rgba(255,154,0,0.25) 50%, rgba(255,94,77,0.15) 100%)' },
            'ocean': { gradient: 'linear-gradient(90deg, rgba(0,105,148,0.15) 0%, rgba(0,168,232,0.25) 50%, rgba(0,105,148,0.15) 100%)' },
            'midnight': { gradient: 'linear-gradient(90deg, rgba(25,25,112,0.2) 0%, rgba(72,61,139,0.3) 50%, rgba(25,25,112,0.2) 100%)' },
            'cherry': { gradient: 'linear-gradient(90deg, rgba(222,49,99,0.15) 0%, rgba(255,105,180,0.25) 50%, rgba(222,49,99,0.15) 100%)' },
            'custom': { gradient: 'none' }
        };

        // Remove banner existente
        item.classList.remove('pro-banner');
        item.style.removeProperty('--pro-banner-gradient');

        // Verifica se tem banner válido
        if (!banner || banner === 'none') {
            return;
        }

        var gradient;
        if (banner === 'custom' && customC1 && customC2) {
            // Banner personalizado
            gradient = 'linear-gradient(90deg, ' + customC1 + '33 0%, ' + customC2 + '44 50%, ' + customC1 + '33 100%)';
        } else if (banners[banner] && banners[banner].gradient !== 'none') {
            gradient = banners[banner].gradient;
        }

        if (gradient) {
            item.classList.add('pro-banner');
            item.style.setProperty('--pro-banner-gradient', gradient);
        }
    }

    // Função para reprocessar banners
    function refreshBanners() {
        if (!isActive) return;
        var players = document.querySelectorAll('.player-list-item');
        var localPlayerId = getLocalPlayerId();
        
        for (var i = 0; i < players.length; i++) {
            var item = players[i];
            var nameEl = item.querySelector('[data-hook="name"]');
            if (!nameEl) continue;
            
            var name = (nameEl.textContent || '').trim();
            var playerId = parseInt(item.dataset.playerId, 10);
            var banner = null;
            
            if (playerId === localPlayerId && window.__proSettings) {
                banner = window.__proSettings.banner;
            } else {
                var info = verifiedCache[name];
                if (info && info.banner) {
                    banner = info.banner;
                }
            }
            
            applyBanner(item, banner, playerId, localPlayerId, name);
        }
    }

    // Função para reprocessar fontes
    function refreshFonts() {
        if (!isActive) return;
        var players = document.querySelectorAll('.player-list-item');
        var localPlayerId = getLocalPlayerId();
        
        for (var i = 0; i < players.length; i++) {
            var item = players[i];
            var nameEl = item.querySelector('[data-hook="name"]');
            if (!nameEl) continue;
            
            var name = (nameEl.textContent || '').trim();
            var playerId = parseInt(item.dataset.playerId, 10);
            var font = null;
            
            if (playerId === localPlayerId && window.__proSettings) {
                font = window.__proSettings.font;
            } else {
                var info = verifiedCache[name];
                if (info && info.font) {
                    font = info.font;
                }
            }
            
            applyFont(nameEl, font, playerId, localPlayerId, name);
        }
    }

    function processPlayers() {
        if (!isActive) return;
        
        var localPlayerId = getLocalPlayerId();
        var roomId = getRoomId();
        
        if (localPlayerId != null && localPlayerId !== lastSentPlayerId) {
            sendPlayerIdToServer(localPlayerId, roomId);
        }
        
        var players = document.querySelectorAll('.player-list-item');
        if (!players.length) return;

        var nicks = [];
        var localNickSent = false;
        
        // Processa jogador local primeiro para mostrar badge instantaneamente
        for (var i = 0; i < players.length; i++) {
            var playerId = parseInt(players[i].dataset.playerId, 10);
            if (playerId === localPlayerId) {
                var nameEl = players[i].querySelector('[data-hook="name"]');
                if (nameEl) {
                    var rawNick = (nameEl.textContent || '').trim();
                    var nick = cleanNick(rawNick);
                    
                    // Envia o nick do jogo para o servidor (só uma vez)
                    if (!localNickSent) {
                        sendGameNickToServer(nick, roomId);
                        localNickSent = true;
                    }
                    
                    applyBadge(players[i]); // Badge local aparece instantaneamente
                }
                break;
            }
        }

        // Depois processa os outros jogadores
        for (var i = 0; i < players.length; i++) {
            var nameEl = players[i].querySelector('[data-hook="name"]');
            var playerId = parseInt(players[i].dataset.playerId, 10);
            
            // Pula jogador local (já processado)
            if (playerId === localPlayerId) continue;
            
            if (nameEl) {
                var rawNick = (nameEl.textContent || '').trim();
                var nick = cleanNick(rawNick); // Nick limpo para busca
                
                // Sempre aplica badge (applyBadge já verifica se precisa)
                applyBadge(players[i]);
                
                // Busca pelo nick limpo (só se não tiver no cache)
                if (nick && !verifiedCache.hasOwnProperty(nick)) {
                    nicks.push(nick);
                }
            }
        }

        if (nicks.length === 0) return;

        fetchVerifiedUsers(nicks, roomId, function(result) {
            for (var nick in result) {
                verifiedCache[nick] = result[nick];
            }
            for (var k = 0; k < nicks.length; k++) {
                if (!verifiedCache[nicks[k]]) {
                    verifiedCache[nicks[k]] = { verified: false, playerId: null, discordId: null, isPro: false };
                }
            }
            window.__verifiedCache = verifiedCache;
            try {
                localStorage.setItem('haxclient_verified_cache', JSON.stringify(verifiedCache));
            } catch(e) {}
            
            // Aplica só nos jogadores que buscamos
            var ps = document.querySelectorAll('.player-list-item');
            for (var m = 0; m < ps.length; m++) {
                var nameEl = ps[m].querySelector('[data-hook="name"]');
                if (nameEl) {
                    var rawNick = (nameEl.textContent || '').trim();
                    var nick = cleanNick(rawNick); // Nick limpo para comparação
                    if (nicks.indexOf(nick) !== -1) {
                        applyBadge(ps[m]);
                    }
                }
            }
        });
    }

    // Processa só jogadores novos (chamado pelo MutationObserver)
    function processNewPlayers(items) {
        if (!isActive) return;
        
        var localPlayerId = getLocalPlayerId();
        var roomId = getRoomId();
        var nicks = [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var nameEl = item.querySelector('[data-hook="name"]');
            var playerId = parseInt(item.dataset.playerId, 10);
            
            if (nameEl) {
                var rawNick = (nameEl.textContent || '').trim();
                var nick = cleanNick(rawNick); // Nick limpo
                
                // Sempre aplica badge (applyBadge já verifica se precisa)
                applyBadge(item);
                
                // Busca pelo nick limpo (só se não tiver no cache)
                if (nick && !verifiedCache.hasOwnProperty(nick) && playerId !== localPlayerId) {
                    nicks.push(nick);
                }
            }
        }

        if (nicks.length === 0) return;

        fetchVerifiedUsers(nicks, roomId, function(result) {
            for (var nick in result) {
                verifiedCache[nick] = result[nick];
            }
            for (var k = 0; k < nicks.length; k++) {
                if (!verifiedCache[nicks[k]]) {
                    verifiedCache[nicks[k]] = { verified: false, playerId: null, discordId: null, isPro: false };
                }
            }
            window.__verifiedCache = verifiedCache;
            try {
                localStorage.setItem('haxclient_verified_cache', JSON.stringify(verifiedCache));
            } catch(e) {}
            
            // Aplica só nos que buscamos
            for (var m = 0; m < items.length; m++) {
                var nameEl = items[m].querySelector('[data-hook="name"]');
                if (nameEl) {
                    var rawNick = (nameEl.textContent || '').trim();
                    var nick = cleanNick(rawNick);
                    if (nicks.indexOf(nick) !== -1) {
                        applyBadge(items[m]);
                    }
                }
            }
        });
    }

    function startObserver() {
        var lists = document.querySelectorAll('.player-list-view .list[data-hook="list"]');
        if (!lists.length) {
            setTimeout(startObserver, 200);
            return;
        }
        
        if (window.__myLocalPlayerId != null && observerInitialized) {
            isActive = true;
            if (listObservers.length === 0) {
                for (var i = 0; i < lists.length; i++) {
                    var observer = new MutationObserver(function(mutations) {
                        // Processa só os nodes adicionados, não todos
                        var addedItems = [];
                        for (var j = 0; j < mutations.length; j++) {
                            var added = mutations[j].addedNodes;
                            for (var k = 0; k < added.length; k++) {
                                if (added[k].nodeType === 1 && added[k].className && added[k].className.indexOf('player-list-item') !== -1) {
                                    addedItems.push(added[k]);
                                }
                            }
                        }
                        if (addedItems.length > 0) {
                            processNewPlayers(addedItems);
                        }
                    });
                    observer.observe(lists[i], { childList: true });
                    listObservers.push(observer);
                }
            }
            processPlayers();
            return;
        }
        
        if (observerInitialized) return;
        
        waitForMyPlayerId(function(localId) {
            if (observerInitialized) return;
            observerInitialized = true;
            
            window.__myLocalPlayerId = localId;
            isActive = true;
            verifiedCache = {};
            processedPlayers = {};
            
            for (var i = 0; i < lists.length; i++) {
                var observer = new MutationObserver(function(mutations) {
                    // Processa só os nodes adicionados, não todos
                    var addedItems = [];
                    for (var j = 0; j < mutations.length; j++) {
                        var added = mutations[j].addedNodes;
                        for (var k = 0; k < added.length; k++) {
                            if (added[k].nodeType === 1 && added[k].className && added[k].className.indexOf('player-list-item') !== -1) {
                                addedItems.push(added[k]);
                            }
                        }
                    }
                    if (addedItems.length > 0) {
                        processNewPlayers(addedItems);
                    }
                });
                observer.observe(lists[i], { childList: true });
                listObservers.push(observer);
            }
            
            processPlayers();
        });
    }

    function resetObserver() {
        isActive = false;
        observerInitialized = false;
        window.__myLocalPlayerId = null;
        lastSentPlayerId = null;
        verifiedCache = {};
        processedPlayers = {}; // Limpa cache de processados
        for (var i = 0; i < listObservers.length; i++) {
            listObservers[i].disconnect();
        }
        listObservers = [];
    }

    // Função para reprocessar badges (chamada quando configurações Pro são carregadas)
    function refreshBadges() {
        if (!isActive) return;
        var players = document.querySelectorAll('.player-list-item');
        for (var i = 0; i < players.length; i++) {
            applyBadge(players[i]);
        }
    }

    function init() {
        if (!((Injector.isGameFrame && Injector.isGameFrame()) || isGameContext())) {
            return;
        }
        
        // Exporta função de refresh globalmente
        window.__refreshVerifiedBadges = refreshBadges;
        window.__refreshProBanners = refreshBanners;
        window.__refreshProFonts = refreshFonts;
        
        fetchMyStatus(function() {
            Injector.onView('room-view', function() {
                setTimeout(startObserver, 100);
            });
            
            Injector.onViewLeave('room-view', function() {
                resetObserver();
                notifyLeaveRoom();
            });
            
            if (document.querySelector('.room-view')) {
                setTimeout(startObserver, 100);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

