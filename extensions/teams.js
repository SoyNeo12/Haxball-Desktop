    // ============================================
    // TEAMS - Sistema de equipes
    // ============================================
    (function() {
        var API_BASE = 'http://localhost:5483';
        var teamsPanelOpen = false;
        var teamsCache = {};
        var myTeam = null;
        var myTeamLoaded = false;
        var myLocalTeamInfo = null; // Info da equipe do jogador local pra badge
        var useLocalStorage = false; // Flag para usar fallback local
    
    // Cleanup tracking
    var activeObservers = [];
    var processTimeout = null;

    // Função de tradução
    function t(key) {
        return window.__t ? window.__t(key) : key;
    }

    // Modal de confirmação customizado (substitui confirm nativo)
    function showConfirm(doc, message, onConfirm) {
        var overlay = doc.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:100000;display:flex;align-items:center;justify-content:center;';
        
        var modal = doc.createElement('div');
        modal.style.cssText = 'background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:20px;max-width:320px;text-align:center;';
        modal.innerHTML = '<p style="color:#fff;margin:0 0 16px;font-size:14px;">' + message + '</p>' +
            '<div style="display:flex;gap:10px;justify-content:center;">' +
            '<button id="confirm-cancel" style="padding:8px 20px;background:#272727;border:none;border-radius:4px;color:#888;cursor:pointer;">' + t('Cancelar') + '</button>' +
            '<button id="confirm-ok" style="padding:8px 20px;background:#dc2626;border:none;border-radius:4px;color:#fff;cursor:pointer;">' + t('Confirmar') + '</button>' +
            '</div>';
        
        overlay.appendChild(modal);
        doc.body.appendChild(overlay);
        
        modal.querySelector('#confirm-cancel').onclick = function() {
            doc.body.removeChild(overlay);
        };
        modal.querySelector('#confirm-ok').onclick = function() {
            doc.body.removeChild(overlay);
            onConfirm();
        };
        overlay.onclick = function(e) {
            if (e.target === overlay) doc.body.removeChild(overlay);
        };
    }

    // Gera badge da equipe (logo ou escudo SVG)
    function createTeamBadge(tag, color, logoUrl) {
        if (logoUrl) {
            // Usa loading="lazy" e adiciona cache-control via URL
            return '<span style="display:inline-flex;align-items:center;margin-left:4px;vertical-align:middle;">' +
                '<img src="' + logoUrl + '" loading="lazy" style="width:14px;height:14px;border-radius:2px;object-fit:cover;vertical-align:middle;">' +
                '</span>';
        }
        return '<span style="display:inline-flex;align-items:center;margin-left:4px;vertical-align:middle;">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="' + color + '" stroke="' + color + '" stroke-width="1" style="vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
            '</span>';
    }

    // Limpa recursos
    function cleanupResources() {
        // Limpa observers
        for (var i = 0; i < activeObservers.length; i++) {
            try { activeObservers[i].disconnect(); } catch(e) {}
        }
        activeObservers = [];
        
        // Limpa timeout
        if (processTimeout) {
            clearTimeout(processTimeout);
            processTimeout = null;
        }
    }

    // Fecha painel
    function closeTeamsPanel(doc) {
        var panel = doc.getElementById('teams-panel');
        if (panel) panel.remove();
        teamsPanelOpen = false;
        cleanupResources();
    }

    // Cria painel de equipes
    function createTeamsPanel(doc) {
        var existing = doc.getElementById('teams-panel');
        if (existing) return existing;

        var panel = doc.createElement('div');
        panel.id = 'teams-panel';
        panel.style.cssText = 'position:fixed;top:0;right:-360px;width:360px;height:100%;background:#141414;border-left:1px solid #232323;z-index:9999;transition:right 0.3s ease;display:flex;flex-direction:column;font-family:"Space Grotesk",sans-serif;user-select:none;';

        panel.innerHTML = '<div style="padding:38px 16px 0 16px;position:relative;">' +
            '<button id="close-teams-btn" style="position:absolute;top:10px;right:10px;background:none;border:none;color:var(--theme-text-muted, #666);cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;" title="' + t('Fechar') + '">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
            '</button>' +
            '<h1 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 16px 0;padding:6px 0 5px 0;border-bottom:3px solid #232323;text-align:center;">' + t('Equipe') + '</h1>' +
            '</div>' +
            '<div id="teams-content" style="flex:1;overflow-y:auto;padding:12px;"></div>';

        doc.body.appendChild(panel);
        setupPanelListeners(doc, panel);
        return panel;
    }

    function setupPanelListeners(doc, panel) {
        var closeBtn = panel.querySelector('#close-teams-btn');
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', function() { closeBtn.style.color = '#fff'; });
            closeBtn.addEventListener('mouseleave', function() { closeBtn.style.color = '#666'; });
            closeBtn.addEventListener('click', function() { toggleTeamsPanel(doc); });
        }
    }

    // Renderiza conteúdo baseado no estado
    function renderTeamsContent(doc) {
        var content = doc.getElementById('teams-content');
        if (!content) return;

        if (!myTeamLoaded) {
            content.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">' + t('Carregando...') + '</div>';
            return;
        }

        if (myTeam) {
            renderMyTeam(doc, content);
        } else {
            renderNoTeam(doc, content);
        }
    }

    // Renderiza quando não tem equipe
    function renderNoTeam(doc, content) {
        // Verifica se é Pro para mostrar botão de criar equipe
        var isPro = (window.__proStatus && (window.__proStatus.is_pro || window.__proStatus.is_vip)) || 
                    (window.__vipStatus && window.__vipStatus.is_vip);
        
        var createBtnHtml = isPro 
            ? '<button id="create-team-btn" style="width:100%;padding:12px;background:#3B82F6;border:none;border-radius:6px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;margin-bottom:12px;">' + t('Criar Equipe') + '</button>'
            : '<div style="padding:12px;background:var(--theme-bg-secondary, #1a1a1a);border:1px solid var(--theme-border-light, #333);border-radius:6px;margin-bottom:12px;">' +
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
              '<svg width="14" height="14" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="currentColor"/><path d="M15 9l-4.5 4.5L8 11" stroke="var(--theme-bg-primary, #141414)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '<span style="color:var(--theme-text-primary, #fff);font-size:12px;font-weight:600;">' + t('Recurso Pro') + '</span>' +
              '</div>' +
              '<p style="color:var(--theme-text-secondary, #888);font-size:12px;margin:0;">' + t('Apenas usuários Pro podem criar equipes.') + '</p>' +
              '</div>';
        
        content.innerHTML = '<div style="text-align:center;padding:20px;">' +
            '<div style="color:#666;margin-bottom:20px;">' + t('Você não está em nenhuma equipe') + '</div>' +
            createBtnHtml +
            '</div>' +
            '<div id="team-invites-section" style="padding:0 4px;"></div>';

        var createBtn = content.querySelector('#create-team-btn');
        if (createBtn) {
            createBtn.addEventListener('mouseenter', function() { createBtn.style.background = '#2563EB'; });
            createBtn.addEventListener('mouseleave', function() { createBtn.style.background = '#3B82F6'; });
            createBtn.addEventListener('click', function() { showCreateTeamForm(doc, content); });
        }

        loadTeamInvites(doc);
    }

    // Formulário de criar equipe
    function showCreateTeamForm(doc, content) {
        content.innerHTML = '<div style="padding:8px;">' +
            '<h3 style="color:#fff;font-size:14px;margin:0 0 16px 0;">' + t('Criar Nova Equipe') + '</h3>' +
            '<div style="margin-bottom:12px;">' +
            '<label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">' + t('Nome da Equipe') + '</label>' +
            '<input id="team-name-input" type="text" maxlength="30" placeholder="Ex: Tigers" style="width:100%;padding:10px;background:#272727;border:none;border-radius:4px;color:#fff;font-size:13px;box-sizing:border-box;">' +
            '</div>' +
            '<div style="margin-bottom:12px;">' +
            '<label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">' + t('Logo da Equipe') + '</label>' +
            '<input id="team-logo-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp" style="display:none;">' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
            '<button id="select-logo-btn" style="padding:8px 12px;background:#272727;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:12px;">' + t('Escolher Imagem') + '</button>' +
            '<span id="logo-filename" style="color:#666;font-size:11px;">' + t('Nenhuma selecionada') + '</span>' +
            '</div>' +
            '<p style="color:#666;font-size:10px;margin:4px 0 0 0;">PNG, JPG ou GIF (máx 512KB)</p>' +
            '</div>' +
            '<div id="team-preview" style="margin-bottom:16px;padding:12px;background:#0f0f0f;border-radius:6px;">' +
            '<div style="color:#888;font-size:11px;margin-bottom:8px;">' + t('Preview') + '</div>' +
            '<div id="preview-content" style="display:flex;align-items:center;gap:6px;">' +
            '<span style="color:#fff;font-size:13px;">Seu Nick</span>' +
            '<span id="preview-badge"></span>' +
            '</div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
            '<button id="cancel-create-btn" style="flex:1;padding:10px;background:#272727;border:none;border-radius:4px;color:#fff;cursor:pointer;font-family:inherit;">' + t('Cancelar') + '</button>' +
            '<button id="confirm-create-btn" style="flex:1;padding:10px;background:#22c55e;border:none;border-radius:4px;color:#fff;cursor:pointer;font-family:inherit;font-weight:600;">' + t('Criar') + '</button>' +
            '</div>' +
            '<p id="create-status" style="color:#ff6b6b;font-size:12px;text-align:center;margin-top:8px;min-height:16px;"></p>' +
            '</div>';

        var nameInput = content.querySelector('#team-name-input');
        var logoInput = content.querySelector('#team-logo-input');
        var selectLogoBtn = content.querySelector('#select-logo-btn');
        var logoFilename = content.querySelector('#logo-filename');
        var previewBadge = content.querySelector('#preview-badge');
        var previewContent = content.querySelector('#preview-content');
        var status = content.querySelector('#create-status');
        
        var selectedLogoBase64 = null;

        // Busca o nick do usuário
        fetch(API_BASE + '/user')
        .then(function(r) { return r.json(); })
        .then(function(user) {
            if (user && user.nick) {
                previewContent.querySelector('span').textContent = user.nick;
            }
        });

        function updatePreview() {
            if (selectedLogoBase64) {
                previewBadge.innerHTML = '<img src="' + selectedLogoBase64 + '" style="width:14px;height:14px;border-radius:2px;object-fit:cover;vertical-align:middle;">';
            } else {
                previewBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#666" stroke="#666" stroke-width="1" style="vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
            }
        }

        selectLogoBtn.addEventListener('click', function() {
            logoInput.click();
        });

        logoInput.addEventListener('change', function() {
            var file = logoInput.files[0];
            if (!file) return;

            if (file.size > 512 * 1024) {
                status.style.color = '#ff6b6b';
                status.textContent = t('Imagem muito grande (máx 512KB)');
                return;
            }

            logoFilename.textContent = file.name;
            
            var reader = new FileReader();
            reader.onload = function(e) {
                selectedLogoBase64 = e.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        });

        updatePreview();

        content.querySelector('#cancel-create-btn').addEventListener('click', function() {
            renderTeamsContent(doc);
        });

        content.querySelector('#confirm-create-btn').addEventListener('click', function() {
            var name = nameInput.value.trim();

            if (!name || name.length < 3) {
                status.textContent = t('Nome deve ter pelo menos 3 caracteres');
                return;
            }

            status.style.color = '#8ED2AB';
            status.textContent = t('Criando...');

            // Cria a equipe primeiro
            fetch(API_BASE + '/teams/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, tag: name.substring(0, 4), color: '#666666' })
            })
            .then(function(r) { return r.json(); })
            .then(function(result) {
                if (result.success) {
                    myTeam = result.team;
                    
                    // Se tem logo, faz upload
                    if (selectedLogoBase64) {
                        status.textContent = t('Enviando logo...');
                        fetch(API_BASE + '/teams/logo', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: selectedLogoBase64 })
                        })
                        .then(function(r) { return r.json(); })
                        .then(function(logoResult) {
                            if (logoResult.success) {
                                myTeam.logo_url = logoResult.logo_url;
                            }
                            renderTeamsContent(doc);
                        });
                    } else {
                        renderTeamsContent(doc);
                    }
                } else {
                    status.style.color = '#ff6b6b';
                    status.textContent = result.error || t('Erro ao criar equipe');
                }
            })
            .catch(function() {
                status.style.color = '#ff6b6b';
                status.textContent = t('Erro de conexão');
            });
        });
    }

    // Renderiza quando tem equipe
    function renderMyTeam(doc, content) {
        var isOwner = myTeam.role === 'owner';
        
        var logoHtml = myTeam.logo_url 
            ? '<img id="team-logo-preview" src="' + myTeam.logo_url + '" style="width:48px;height:48px;border-radius:6px;object-fit:cover;">'
            : '<div id="team-logo-preview" style="width:48px;height:48px;border-radius:6px;background:#272727;display:flex;align-items:center;justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#666" stroke="#666" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>';

        content.innerHTML = '<div style="padding:8px;">' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:16px;background:#0f0f0f;border-radius:8px;">' +
            '<div>' + logoHtml + '</div>' +
            '<div style="flex:1;">' +
            '<div id="team-name-display" style="color:#fff;font-size:16px;font-weight:600;">' + myTeam.name + '</div>' +
            '<div style="color:#666;font-size:12px;">' + (myTeam.member_count || 1) + ' ' + t('membro(s)') + '</div>' +
            '</div>' +
            '</div>' +
            (isOwner ? '<div style="margin-bottom:16px;padding:12px;background:#1a1a1a;border-radius:8px;">' +
            '<div style="color:#888;font-size:12px;margin-bottom:12px;font-weight:600;">' + t('Configurações') + '</div>' +
            '<div style="margin-bottom:12px;">' +
            '<label style="color:#666;font-size:11px;display:block;margin-bottom:4px;">' + t('Nome da Equipe') + '</label>' +
            '<div style="display:flex;gap:8px;">' +
            '<input id="edit-name-input" type="text" value="' + myTeam.name + '" maxlength="30" style="flex:1;padding:8px;background:#272727;border:none;border-radius:4px;color:#fff;font-size:13px;">' +
            '</div>' +
            '</div>' +
            '<div style="margin-bottom:12px;">' +
            '<label style="color:#666;font-size:11px;display:block;margin-bottom:4px;">' + t('Sigla (máx 4)') + '</label>' +
            '<div style="display:flex;gap:8px;">' +
            '<input id="edit-tag-input" type="text" value="' + (myTeam.tag || '') + '" maxlength="4" style="width:80px;padding:8px;background:#272727;border:none;border-radius:4px;color:#fff;font-size:13px;text-transform:uppercase;">' +
            '</div>' +
            '</div>' +
            '<div style="margin-bottom:12px;">' +
            '<label style="color:#666;font-size:11px;display:block;margin-bottom:4px;">' + t('Logo') + '</label>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
            '<input id="logo-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp" style="display:none;">' +
            '<button id="upload-logo-btn" style="padding:8px 12px;background:#272727;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:12px;">' + (myTeam.logo_url ? t('Trocar') : t('Enviar')) + '</button>' +
            '<span id="logo-status" style="color:#666;font-size:11px;"></span>' +
            '</div>' +
            '</div>' +
            '<button id="save-settings-btn" style="width:100%;padding:10px;background:#22c55e;border:none;border-radius:4px;color:#fff;cursor:pointer;font-weight:600;font-size:13px;">' + t('Salvar Alterações') + '</button>' +
            '<p id="settings-status" style="color:#8ED2AB;font-size:12px;text-align:center;margin-top:8px;min-height:16px;"></p>' +
            '</div>' : '') +
            (isOwner ? '<div style="margin-bottom:16px;">' +
            '<label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">' + t('Convidar Membro') + '</label>' +
            '<div style="display:flex;gap:8px;margin-bottom:4px;">' +
            '<input id="invite-input" type="text" placeholder="' + t('Username do Discord') + '" style="flex:1;padding:10px;background:#272727;border:none;border-radius:4px;color:#fff;font-size:13px;">' +
            '<button id="invite-btn" style="padding:10px 16px;background:#3B82F6;border:none;border-radius:4px;color:#fff;cursor:pointer;font-weight:600;">' + t('Convidar') + '</button>' +
            '</div>' +
            '<p id="invite-status" style="color:#8ED2AB;font-size:12px;margin:0;min-height:16px;"></p>' +
            '</div>' : '') +
            '<div style="margin-bottom:12px;color:#888;font-size:12px;">' + t('Membros') + '</div>' +
            '<div id="team-members-list"></div>' +
            '<button id="leave-team-btn" style="width:100%;padding:10px;background:#272727;border:none;border-radius:4px;color:#ff6b6b;cursor:pointer;margin-top:16px;font-family:inherit;">' + (isOwner ? t('Excluir Equipe') : t('Sair da Equipe')) + '</button>' +
            '</div>';

        loadTeamMembers(doc);

        if (isOwner) {
            // Variável pra guardar a logo selecionada
            var pendingLogoBase64 = null;
            
            // Upload de logo
            var logoInput = content.querySelector('#logo-input');
            var uploadBtn = content.querySelector('#upload-logo-btn');
            var logoStatus = content.querySelector('#logo-status');

            uploadBtn.addEventListener('click', function() {
                logoInput.click();
            });

            logoInput.addEventListener('change', function() {
                var file = logoInput.files[0];
                if (!file) return;

                if (file.size > 512 * 1024) {
                    logoStatus.style.color = '#ff6b6b';
                    logoStatus.textContent = 'Máximo 512KB';
                    return;
                }

                var reader = new FileReader();
                reader.onload = function(e) {
                    pendingLogoBase64 = e.target.result;
                    
                    // Mostra preview imediato
                    var logoPreview = content.querySelector('#team-logo-preview');
                    if (logoPreview && logoPreview.tagName === 'IMG') {
                        logoPreview.src = pendingLogoBase64;
                    } else if (logoPreview) {
                        // Substitui o div placeholder por img
                        var img = doc.createElement('img');
                        img.id = 'team-logo-preview';
                        img.src = pendingLogoBase64;
                        img.style.cssText = 'width:48px;height:48px;border-radius:6px;object-fit:cover;';
                        logoPreview.parentNode.replaceChild(img, logoPreview);
                    }
                    
                    logoStatus.style.color = '#8ED2AB';
                    logoStatus.textContent = t('Pronto pra salvar');
                };
                reader.readAsDataURL(file);
            });

            // Botão salvar alterações
            var saveBtn = content.querySelector('#save-settings-btn');
            var settingsStatus = content.querySelector('#settings-status');
            var nameInput = content.querySelector('#edit-name-input');
            var tagInput = content.querySelector('#edit-tag-input');

            saveBtn.addEventListener('click', function() {
                var newName = nameInput.value.trim();
                var newTag = tagInput.value.trim().toUpperCase();

                if (!newName || newName.length < 3) {
                    settingsStatus.style.color = '#ff6b6b';
                    settingsStatus.textContent = t('Nome deve ter pelo menos 3 caracteres');
                    return;
                }

                settingsStatus.style.color = '#8ED2AB';
                settingsStatus.textContent = t('Salvando...');

                // Primeiro atualiza nome e sigla
                fetch(API_BASE + '/teams/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName, tag: newTag })
                })
                .then(function(r) { return r.json(); })
                .then(function(result) {
                    if (result.success) {
                        myTeam.name = newName;
                        myTeam.tag = newTag;
                        
                        // Atualiza o nome no header
                        var nameDisplay = content.querySelector('#team-name-display');
                        if (nameDisplay) nameDisplay.textContent = newName;
                        
                        // Se tem logo pendente, faz upload
                        if (pendingLogoBase64) {
                            fetch(API_BASE + '/teams/logo', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ image: pendingLogoBase64 })
                            })
                            .then(function(r) { return r.json(); })
                            .then(function(logoResult) {
                                if (logoResult.success) {
                                    myTeam.logo_url = logoResult.logo_url;
                                    settingsStatus.textContent = t('Alterações salvas!');
                                    pendingLogoBase64 = null;
                                    logoStatus.textContent = '';
                                    refreshAllBadges();
                                } else {
                                    settingsStatus.style.color = '#ff6b6b';
                                    settingsStatus.textContent = logoResult.error || t('Erro ao salvar');
                                }
                            });
                        } else {
                            settingsStatus.textContent = t('Alterações salvas!');
                            refreshAllBadges();
                        }
                    } else {
                        settingsStatus.style.color = '#ff6b6b';
                        settingsStatus.textContent = result.error || t('Erro ao salvar');
                    }
                })
                .catch(function() {
                    settingsStatus.style.color = '#ff6b6b';
                    settingsStatus.textContent = t('Erro de conexão');
                });
            });

            // Convites
            var inviteBtn = content.querySelector('#invite-btn');
            var inviteInput = content.querySelector('#invite-input');
            var inviteStatus = content.querySelector('#invite-status');

            inviteBtn.addEventListener('click', function() {
                var username = inviteInput.value.trim();
                if (!username) return;

                inviteStatus.style.color = '#8ED2AB';
                inviteStatus.textContent = t('Enviando...');

                fetch(API_BASE + '/teams/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username })
                })
                .then(function(r) { return r.json(); })
                .then(function(result) {
                    if (result.success) {
                        inviteStatus.textContent = t('Convite enviado!');
                        inviteInput.value = '';
                    } else {
                        inviteStatus.style.color = '#ff6b6b';
                        inviteStatus.textContent = result.error || t('Erro ao convidar');
                    }
                });
            });
        }

        content.querySelector('#leave-team-btn').addEventListener('click', function() {
            var msg = isOwner ? t('Tem certeza que deseja EXCLUIR a equipe? Isso não pode ser desfeito.') : t('Tem certeza que deseja sair da equipe?');
            showConfirm(doc, msg, function() {
                var endpoint = isOwner ? '/teams/delete' : '/teams/leave';
                fetch(API_BASE + endpoint, { method: 'POST' })
                .then(function(r) { return r.json(); })
                .then(function(result) {
                    if (result.success) {
                        myTeam = null;
                        renderTeamsContent(doc);
                    }
                });
            });
        });
    }

    // Carrega membros da equipe
    function loadTeamMembers(doc) {
        var list = doc.getElementById('team-members-list');
        if (!list) return;

        fetch(API_BASE + '/teams/members')
        .then(function(r) { return r.json(); })
        .then(function(members) {
            if (!members || !members.length) {
                list.innerHTML = '<div style="color:#666;font-size:13px;">' + t('Nenhum membro') + '</div>';
                return;
            }

            var html = '';
            members.forEach(function(m) {
                var roleLabel = m.role === 'owner' ? '<svg width="12" height="12" viewBox="0 0 576 512" fill="#F4A261" style="margin-left:5px;vertical-align:-1px;"><path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86 427.4c5.5 30.4 32 52.6 63 52.6H427c31 0 57.4-22.2 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"/></svg>' : '';
                html += '<div style="display:flex;align-items:center;padding:10px;background:#1a1a1a;border-radius:6px;margin-bottom:6px;">' +
                    '<div style="flex:1;color:#fff;font-size:13px;">' + (m.discord_name || m.discord_id) + roleLabel + '</div>' +
                    (myTeam.role === 'owner' && m.role !== 'owner' ? '<button class="kick-member-btn" data-id="' + m.discord_id + '" style="padding:4px 10px;background:#272727;border:none;border-radius:4px;color:#ff6b6b;cursor:pointer;font-size:11px;">' + t('Remover') + '</button>' : '') +
                    '</div>';
            });
            list.innerHTML = html;

            list.querySelectorAll('.kick-member-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    showConfirm(doc, t('Remover este membro?'), function() {
                        fetch(API_BASE + '/teams/kick', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ discord_id: btn.dataset.id })
                        })
                        .then(function(r) { return r.json(); })
                        .then(function(result) {
                            if (result.success) loadTeamMembers(doc);
                        });
                    });
                });
            });
        });
    }

    // Carrega convites pendentes
    function loadTeamInvites(doc) {
        var section = doc.getElementById('team-invites-section');
        if (!section) return;

        fetch(API_BASE + '/teams/invites')
        .then(function(r) { return r.json(); })
        .then(function(invites) {
            if (!invites || !invites.length) {
                section.innerHTML = '';
                return;
            }

            var html = '<div style="color:#888;font-size:12px;margin-bottom:8px;">' + t('Convites Pendentes') + '</div>';
            invites.forEach(function(inv) {
                html += '<div style="display:flex;align-items:center;padding:12px;background:#1a1a1a;border-radius:6px;margin-bottom:6px;">' +
                    '<div style="flex:1;">' +
                    '<div style="color:#fff;font-size:13px;font-weight:600;">' + inv.team_name + ' <span style="color:#666;">[' + inv.team_tag + ']</span></div>' +
                    '<div style="color:#666;font-size:11px;">Convite de ' + (inv.from_name || 'alguém') + '</div>' +
                    '</div>' +
                    '<div style="display:flex;gap:6px;">' +
                    '<button class="accept-invite-btn" data-id="' + inv.id + '" style="padding:6px 12px;background:#22c55e;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:12px;font-weight:600;">' + t('Aceitar') + '</button>' +
                    '<button class="reject-invite-btn" data-id="' + inv.id + '" style="padding:6px 12px;background:#272727;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:12px;">' + t('Recusar') + '</button>' +
                    '</div>' +
                    '</div>';
            });
            section.innerHTML = html;

            section.querySelectorAll('.accept-invite-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    fetch(API_BASE + '/teams/invites/accept', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invite_id: parseInt(btn.dataset.id) })
                    })
                    .then(function(r) { return r.json(); })
                    .then(function(result) {
                        if (result.success) {
                            loadMyTeam(doc);
                        }
                    });
                });
            });

            section.querySelectorAll('.reject-invite-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    fetch(API_BASE + '/teams/invites/reject', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invite_id: parseInt(btn.dataset.id) })
                    })
                    .then(function(r) { return r.json(); })
                    .then(function(result) {
                        if (result.success) loadTeamInvites(doc);
                    });
                });
            });
        });
    }

    // Carrega minha equipe
    function loadMyTeam(doc) {
        fetch(API_BASE + '/teams/my')
        .then(function(r) { return r.json(); })
        .then(function(team) {
            // Verifica se a resposta é válida (tem name definido)
            if (team && team.name) {
                myTeam = team;
            } else {
                myTeam = null;
            }
            myTeamLoaded = true;
            renderTeamsContent(doc);
        })
        .catch(function() {
            myTeam = null;
            myTeamLoaded = true;
            renderTeamsContent(doc);
        });
    }

    // Toggle painel
    function toggleTeamsPanel(doc) {
        var panel = doc.getElementById('teams-panel') || createTeamsPanel(doc);
        teamsPanelOpen = !teamsPanelOpen;

        if (teamsPanelOpen) {
            panel.style.right = '0';
            loadMyTeam(doc);
        } else {
            panel.style.right = '-360px';
            cleanupResources();
        }
    }

    // Injeta botão na roomlist
    function injectTeamsButton(iframeDoc) {
        var roomlistView = iframeDoc.querySelector('.roomlist-view');
        if (!roomlistView) return;

        var createRoomBtn = roomlistView.querySelector('[data-hook="create"]');
        if (!createRoomBtn) return;

        var buttonsContainer = createRoomBtn.parentElement;
        if (!buttonsContainer || buttonsContainer.querySelector('#teams-btn')) return;

        var btn = iframeDoc.createElement('button');
        btn.id = 'teams-btn';
        btn.innerHTML = '<i class="icon-users"></i><div>Equipe</div>';

        btn.addEventListener('click', function() {
            toggleTeamsPanel(iframeDoc);
        });

        // Insere depois do botão de amizades ou do create
        var friendsBtn = buttonsContainer.querySelector('#friends-btn');
        if (friendsBtn) {
            friendsBtn.after(btn);
        } else {
            createRoomBtn.after(btn);
        }
    }

    // === BADGE NA LISTA DE JOGADORES ===

    function fetchTeamsByNicks(nicks, callback) {
        if (!nicks.length) { callback({}); return; }

        fetch(API_BASE + '/teams/by-nicks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nicks: nicks })
        })
        .then(function(r) { return r.json(); })
        .then(function(result) { callback(result || {}); })
        .catch(function() { callback({}); });
    }

    function isGhostMode() {
        return localStorage.getItem('ghost_mode') === 'true';
    }

    // Força atualização de todas as badges (remove e re-aplica)
    function refreshAllBadges() {
        var badges = document.querySelectorAll('.team-badge');
        for (var i = 0; i < badges.length; i++) {
            badges[i].remove();
        }
        teamsCache = {};
        processPlayersForTeams();
    }

    function applyTeamBadge(item, teamsData) {
        if (item.querySelector('.team-badge')) return;
        if (isGhostMode()) return;

        var nameEl = item.querySelector('[data-hook="name"]');
        if (!nameEl) return;

        var rawName = (nameEl.textContent || '').trim();
        var name = rawName.replace(/\u200B/g, ''); // Remove caractere invisível
        
        // Busca info da equipe pelo nick
        var teamInfo = teamsData[name];
        
        // Se for o jogador local e não achou no cache, usa a info local
        if (!teamInfo) {
            var playerId = parseInt(item.dataset.playerId, 10);
            var localPlayerId = window.__myLocalPlayerId;
            if (playerId === localPlayerId && myLocalTeamInfo) {
                teamInfo = myLocalTeamInfo;
            }
        }
        
        if (!teamInfo) return;

        var badge = document.createElement('span');
        badge.className = 'team-badge';
        badge.innerHTML = createTeamBadge(teamInfo.tag, teamInfo.color, teamInfo.logo_url);
        badge.title = teamInfo.name;
        nameEl.appendChild(badge);
    }

    function processPlayersForTeams() {
        var players = document.querySelectorAll('[class^="player-list-item"]');
        if (!players.length) return;

        var nicks = [];
        for (var i = 0; i < players.length; i++) {
            var nameEl = players[i].querySelector('[data-hook="name"]');
            if (nameEl) {
                var rawNick = (nameEl.textContent || '').trim();
                var nick = rawNick.replace(/\u200B/g, ''); // Nick limpo
                if (nick && !teamsCache.hasOwnProperty(nick)) {
                    nicks.push(nick);
                }
            }
        }

        // Aplica badges do cache
        for (var j = 0; j < players.length; j++) {
            applyTeamBadge(players[j], teamsCache);
        }

        if (nicks.length === 0) return;

        fetchTeamsByNicks(nicks, function(result) {
            for (var nick in result) {
                teamsCache[nick] = result[nick];
            }
            // Marca nicks sem equipe como null pra não buscar de novo
            for (var k = 0; k < nicks.length; k++) {
                if (!teamsCache[nicks[k]]) {
                    teamsCache[nicks[k]] = null;
                }
            }
            var ps = document.querySelectorAll('[class^="player-list-item"]');
            for (var m = 0; m < ps.length; m++) {
                applyTeamBadge(ps[m], teamsCache);
            }
        });
    }

    // Exporta funções
    window.TeamsSystem = {
        injectTeamsButton: injectTeamsButton,
        toggleTeamsPanel: toggleTeamsPanel,
        processPlayersForTeams: processPlayersForTeams,
        createTeamBadge: createTeamBadge,
        refreshAllBadges: refreshAllBadges
    };

    // Inicializa observer para badges (só no game frame)
    if (typeof Injector !== 'undefined' && Injector.isGameFrame && Injector.isGameFrame()) {
        function debouncedProcess() {
            if (processTimeout) return;
            processTimeout = setTimeout(function() {
                processTimeout = null;
                processPlayersForTeams();
            }, 100);
        }
        
        Injector.onView('room-view', function() {
            teamsCache = {};
            
            // Limpa observers anteriores
            cleanupResources();
            
            // Busca a equipe do jogador local
            fetch(API_BASE + '/teams/my')
            .then(function(r) { return r.json(); })
            .then(function(team) {
                if (team && team.name) {
                    myLocalTeamInfo = {
                        name: team.name,
                        tag: team.tag,
                        color: team.color,
                        logo_url: team.logo_url
                    };
                } else {
                    myLocalTeamInfo = null;
                }
            })
            .catch(function() {
                myLocalTeamInfo = null;
            });
            
            setTimeout(function() {
                processPlayersForTeams();

                var lists = document.querySelectorAll('.player-list-view .list[data-hook="list"]');
                for (var i = 0; i < lists.length; i++) {
                    var observer = new MutationObserver(function(mutations) {
                        for (var j = 0; j < mutations.length; j++) {
                            if (mutations[j].addedNodes.length > 0) {
                                debouncedProcess();
                                break;
                            }
                        }
                    });
                    observer.observe(lists[i], { childList: true });
                    activeObservers.push(observer);
                }
            }, 200);
        });

        Injector.onViewLeave('room-view', function() {
            teamsCache = {};
            cleanupResources();
        });
    }
})();
