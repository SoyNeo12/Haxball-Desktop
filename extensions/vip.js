// ============================================
// PRO - Sistema de usuários Pro
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

    var API_BASE = 'http://localhost:5483';
    var proStatus = null;
    var proSettings = null;

    function t(key) { return window.__t ? window.__t(key) : key; }

    var PRO_BANNERS = {
        'none': { name: 'Nenhum', gradient: 'none' },
        'gold': { name: 'Ouro', gradient: 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(255,193,7,0.25) 50%, rgba(255,215,0,0.15) 100%)' },
        'diamond': { name: 'Diamante', gradient: 'linear-gradient(90deg, rgba(185,242,255,0.15) 0%, rgba(0,191,255,0.25) 50%, rgba(185,242,255,0.15) 100%)' },
        'fire': { name: 'Fogo', gradient: 'linear-gradient(90deg, rgba(255,69,0,0.15) 0%, rgba(255,140,0,0.25) 50%, rgba(255,69,0,0.15) 100%)' },
        'emerald': { name: 'Esmeralda', gradient: 'linear-gradient(90deg, rgba(0,201,87,0.15) 0%, rgba(80,200,120,0.25) 50%, rgba(0,201,87,0.15) 100%)' },
        'purple': { name: 'Roxo', gradient: 'linear-gradient(90deg, rgba(138,43,226,0.15) 0%, rgba(186,85,211,0.25) 50%, rgba(138,43,226,0.15) 100%)' },
        'rainbow': { name: 'Arco-íris', gradient: 'linear-gradient(90deg, rgba(255,0,0,0.2) 0%, rgba(255,127,0,0.2) 17%, rgba(255,255,0,0.2) 33%, rgba(0,255,0,0.2) 50%, rgba(0,127,255,0.2) 67%, rgba(139,0,255,0.2) 83%, rgba(255,0,0,0.2) 100%)' },
        'neon': { name: 'Neon', gradient: 'linear-gradient(90deg, rgba(57,255,20,0.15) 0%, rgba(0,255,255,0.25) 50%, rgba(57,255,20,0.15) 100%)' },
        'sunset': { name: 'Pôr do Sol', gradient: 'linear-gradient(90deg, rgba(255,94,77,0.15) 0%, rgba(255,154,0,0.25) 50%, rgba(255,94,77,0.15) 100%)' },
        'ocean': { name: 'Oceano', gradient: 'linear-gradient(90deg, rgba(0,105,148,0.15) 0%, rgba(0,168,232,0.25) 50%, rgba(0,105,148,0.15) 100%)' },
        'midnight': { name: 'Meia-noite', gradient: 'linear-gradient(90deg, rgba(25,25,112,0.2) 0%, rgba(72,61,139,0.3) 50%, rgba(25,25,112,0.2) 100%)' },
        'cherry': { name: 'Cereja', gradient: 'linear-gradient(90deg, rgba(222,49,99,0.15) 0%, rgba(255,105,180,0.25) 50%, rgba(222,49,99,0.15) 100%)' },
        'custom': { name: 'Personalizado', gradient: 'none' }
    };
    window.__proBanners = PRO_BANNERS;

    var PRO_FONTS = {
        'default': { name: 'Padrão', family: 'Space Grotesk' },
        'roboto': { name: 'Roboto', family: 'Roboto' },
        'poppins': { name: 'Poppins', family: 'Poppins' },
        'montserrat': { name: 'Montserrat', family: 'Montserrat' },
        'oswald': { name: 'Oswald', family: 'Oswald' },
        'raleway': { name: 'Raleway', family: 'Raleway' },
        'ubuntu': { name: 'Ubuntu', family: 'Ubuntu' },
        'quicksand': { name: 'Quicksand', family: 'Quicksand' },
        'comfortaa': { name: 'Comfortaa', family: 'Comfortaa' },
        'righteous': { name: 'Righteous', family: 'Righteous' },
        'orbitron': { name: 'Orbitron', family: 'Orbitron' },
        'pressstart': { name: 'Press Start 2P', family: 'Press Start 2P' }
    };
    window.__proFonts = PRO_FONTS;

    function loadProStatus() {
        return fetch(API_BASE + '/vip/status').then(function(r) { return r.json(); }).then(function(data) {
            proStatus = data;
            window.__proStatus = data;
            window.__vipStatus = { is_vip: data.is_vip || data.is_pro };
            return data;
        }).catch(function() {
            proStatus = { is_pro: false };
            window.__proStatus = proStatus;
            window.__vipStatus = { is_vip: false };
            return proStatus;
        });
    }

    function loadProSettings() {
        return fetch(API_BASE + '/vip/settings').then(function(r) { return r.json(); }).then(function(data) {
            proSettings = data;
            window.__proSettings = data;
            try { localStorage.setItem('haxclient_pro_settings', JSON.stringify(data)); } catch(e) {}
            if (window.__refreshVerifiedBadges) window.__refreshVerifiedBadges();
            if (window.__refreshProBanners) window.__refreshProBanners();
            if (window.__refreshProFonts) window.__refreshProFonts();
            return data;
        }).catch(function() {
            proSettings = {};
            window.__proSettings = proSettings;
            return proSettings;
        });
    }

    function saveProSettings(settings) {
        return fetch(API_BASE + '/vip/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        }).then(function(r) { return r.json(); }).then(function(data) {
            if (data.success) {
                proSettings = Object.assign({}, proSettings, settings);
                window.__proSettings = proSettings;
                try { localStorage.setItem('haxclient_pro_settings', JSON.stringify(proSettings)); } catch(e) {}
                if (window.__refreshVerifiedBadges) window.__refreshVerifiedBadges();
                if (window.__refreshProBanners) window.__refreshProBanners();
                if (window.__refreshProFonts) window.__refreshProFonts();
            }
            return data;
        });
    }

    function openPaymentPage() {
        // Desabilitado - pagamento não disponível
    }

    function closePopup() {
        var overlay = document.getElementById('pro-popup-overlay');
        if (overlay) overlay.remove();
    }

    function showProPopup() {
        closePopup();
        var overlay = document.createElement('div');
        overlay.id = 'pro-popup-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:10001;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
        var popup = document.createElement('div');
        popup.style.cssText = 'background:#0d0d0d;border:1px solid #222;border-radius:16px;width:600px;box-shadow:0 25px 80px rgba(0,0,0,0.7);';
        loadProStatus().then(function(status) {
            if (status.is_pro || status.is_vip) {
                renderProContent(popup, status);
            } else {
                renderNonProContent(popup);
            }
        });
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) closePopup(); });
        document.addEventListener('keydown', function escH(e) { if (e.key === 'Escape') { closePopup(); document.removeEventListener('keydown', escH); } });
    }

    function renderNonProContent(popup) {
        // Ícones SVG para cada benefício
        var ICONS = {
            palette: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
            verified: '<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="currentColor"/><path d="M15 9l-4.5 4.5L8 11" stroke="#0d0d0d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            team: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            rocket: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
            heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
        };
        
        popup.innerHTML = 
            '<div style="padding:20px 28px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="color:#fff;font-size:20px;font-weight:600;">Pro</span>' +
                '<button id="pro-close-btn" style="background:none;border:none;color:#555;cursor:pointer;padding:4px;display:flex;transition:color 0.15s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#555\'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
            '</div>' +
            '<div style="padding:28px;">' +
                // Benefícios em lista simples
                '<div style="display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">' +
                    // Item 1 - Personalização
                    '<div style="display:flex;gap:14px;align-items:flex-start;">' +
                        '<div style="color:#888;flex-shrink:0;margin-top:2px;">' + ICONS.palette + '</div>' +
                        '<div>' +
                            '<div style="color:#fff;font-size:14px;font-weight:500;margin-bottom:4px;">' + t('Personalização Total') + '</div>' +
                            '<div style="color:#666;font-size:12px;line-height:1.5;">' + t('Altere cores, fontes e gradientes do seu nick e chat. Destaque-se na lista de jogadores com banners exclusivos.') + '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    // Item 2 - Verificado
                    '<div style="display:flex;gap:14px;align-items:flex-start;">' +
                        '<div style="color:#888;flex-shrink:0;margin-top:2px;">' + ICONS.verified + '</div>' +
                        '<div>' +
                            '<div style="color:#fff;font-size:14px;font-weight:500;margin-bottom:4px;">' + t('Verificado Exclusivo') + '</div>' +
                            '<div style="color:#666;font-size:12px;line-height:1.5;">' + t('Ganhe um selo de verificado único com a cor que você escolher.') + '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    // Item 3 - Equipes
                    '<div style="display:flex;gap:14px;align-items:flex-start;">' +
                        '<div style="color:#888;flex-shrink:0;margin-top:2px;">' + ICONS.team + '</div>' +
                        '<div>' +
                            '<div style="color:#fff;font-size:14px;font-weight:500;margin-bottom:4px;">' + t('Criar Equipes') + '</div>' +
                            '<div style="color:#666;font-size:12px;line-height:1.5;">' + t('Monte sua própria equipe e jogue com amigos usando identidade visual única.') + '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    // Item 4 - Acesso Antecipado
                    '<div style="display:flex;gap:14px;align-items:flex-start;">' +
                        '<div style="color:#888;flex-shrink:0;margin-top:2px;">' + ICONS.rocket + '</div>' +
                        '<div>' +
                            '<div style="color:#fff;font-size:14px;font-weight:500;margin-bottom:4px;">' + t('Acesso Antecipado') + '</div>' +
                            '<div style="color:#666;font-size:12px;line-height:1.5;">' + t('Seja o primeiro a testar novos recursos antes de todo mundo.') + '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    // Item 5 - Apoiar
                    '<div style="display:flex;gap:14px;align-items:flex-start;">' +
                        '<div style="color:#888;flex-shrink:0;margin-top:2px;">' + ICONS.heart + '</div>' +
                        '<div>' +
                            '<div style="color:#fff;font-size:14px;font-weight:500;margin-bottom:4px;">' + t('Apoie o Projeto') + '</div>' +
                            '<div style="color:#666;font-size:12px;line-height:1.5;">' + t('Sua assinatura ajuda a manter o aplicativo funcionando e evoluindo.') + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                    '<button id="pro-buy-btn" style="width:100%;padding:14px;background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.15s;" onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">' +
                        t('Assinar por R$19,90/mês') +
                    '</button>' +
                    '<button id="pro-boost-btn" style="width:100% !important;padding:14px !important;background:#f47fff !important;border:none !important;border-radius:8px !important;color:#fff !important;font-size:14px !important;font-weight:600 !important;cursor:pointer !important;transition:opacity 0.15s !important;" onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">' +
                        t('Adquirir com Boost') +
                    '</button>' +
                '</div>' +
            '</div>';
        popup.querySelector('#pro-close-btn').onclick = closePopup;
        
        // Handler do botão de pagamento - Kiwify (abre no navegador padrão)
        popup.querySelector('#pro-buy-btn').onclick = function() {
            var checkoutUrl = 'https://pay.kiwify.com.br/KNZt8Vy';
            fetch(API_BASE + '/open-external', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: checkoutUrl })
            }).catch(function() {
                // Fallback: abre na mesma janela se falhar
                window.open(checkoutUrl, '_blank');
            });
        };
        
        // Handler do botão de boost - verifica cargo no servidor
        popup.querySelector('#pro-boost-btn').onclick = function() {
            var btn = popup.querySelector('#pro-boost-btn');
            var originalText = btn.textContent;
            btn.textContent = t('Verificando...');
            btn.disabled = true;
            btn.style.opacity = '0.7';
            
            fetch(API_BASE + '/vip/check-boost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            }).then(function(r) { return r.json(); }).then(function(data) {
                if (data.is_booster && data.pro_activated) {
                    btn.textContent = t('PRO Ativado!');
                    btn.style.background = '#22c55e';
                    setTimeout(function() {
                        closePopup();
                        showProPopup(); // Reabre com conteúdo PRO
                    }, 1500);
                } else {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    var errorMsg = data.error || '';
                    if (errorMsg.includes('No access token')) {
                        btn.textContent = t('Faça logout e login novamente');
                        btn.style.background = '#dc2626';
                    } else {
                        btn.textContent = t('Dê boost no Discord primeiro');
                        btn.style.background = '#dc2626';
                        window.open('https://discord.gg/haxballdesktop', '_blank');
                    }
                    setTimeout(function() {
                        btn.textContent = originalText;
                        btn.style.background = '#f47fff';
                    }, 3000);
                }
            }).catch(function(err) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.textContent = t('Erro ao verificar');
                btn.style.background = '#dc2626';
                setTimeout(function() {
                    btn.textContent = originalText;
                    btn.style.background = '#f47fff';
                }, 3000);
            });
        };
    }

    function renderProContent(popup, status) {
        loadProSettings().then(function(settings) {
            fetch(API_BASE + '/user').then(function(r) { return r.json(); }).then(function(u) {
                renderProUI(popup, status, settings, u.nick || 'Player');
            }).catch(function() { renderProUI(popup, status, settings, 'Player'); });
        });
    }

    function renderProUI(popup, status, settings, userNick) {
        var currentBanner = settings.banner || 'none';
        var currentFont = settings.font || 'default';
        var verifiedColor = settings.verified_color || '#249EF0';
        var nickColor = settings.nick_color || '#249EF0';
        var verifiedGradient = settings.verified_gradient || '';
        var nickGradient = settings.nick_gradient || '';
        var customBannerC1 = settings.custom_banner_color1 || '#6366f1';
        var customBannerC2 = settings.custom_banner_color2 || '#8b5cf6';

        var bannerOpts = '';
        for (var bk in PRO_BANNERS) bannerOpts += '<option value="' + bk + '"' + (bk === currentBanner ? ' selected' : '') + '>' + PRO_BANNERS[bk].name + '</option>';
        var fontOpts = '';
        for (var fk in PRO_FONTS) fontOpts += '<option value="' + fk + '"' + (fk === currentFont ? ' selected' : '') + '>' + PRO_FONTS[fk].name + '</option>';

        popup.innerHTML = 
            '<div style="padding:16px 24px;border-bottom:1px solid #1a1a1a;display:flex;justify-content:space-between;align-items:center;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<span style="color:#fff;font-size:16px;font-weight:600;">' + t('Personalização') + '</span>' +
                    '<span style="padding:3px 8px;background:#fff;color:#000;font-size:9px;font-weight:700;border-radius:4px;">' + t('Ativo') + '</span>' +
                '</div>' +
                '<button id="pro-close-btn" style="background:none;border:none;color:#444;cursor:pointer;padding:4px;display:flex;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
            '</div>' +
            '<div style="padding:20px 24px;">' +
                // Preview
                '<div style="text-align:center;margin-bottom:20px;">' +
                    '<div id="pro-preview" style="display:inline-flex;align-items:center;gap:6px;padding:14px 28px;background:#111;border-radius:8px;border:1px solid #222;">' +
                        '<span id="preview-nick" style="font-size:15px;font-weight:600;color:' + nickColor + ';">' + userNick + '</span>' +
                        '<span id="preview-badge" style="display:inline-flex;align-items:center;"></span>' +
                    '</div>' +
                '</div>' +
                // Cores - Nick e Verificado lado a lado
                '<div style="display:flex;gap:16px;margin-bottom:16px;">' +
                    // Nick
                    '<div style="flex:1;background:#111;border-radius:8px;padding:14px;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                            '<span style="color:#999;font-size:11px;font-weight:500;">NICK</span>' +
                            '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="nick-grad-check"' + (nickGradient ? ' checked' : '') + ' style="width:13px;height:13px;accent-color:#6366f1;cursor:pointer;"><span style="color:#666;font-size:10px;">Gradiente</span></label>' +
                        '</div>' +
                        '<div style="display:flex;gap:8px;align-items:center;">' +
                            '<div style="position:relative;width:38px;height:38px;border-radius:6px;overflow:hidden;border:2px solid #333;cursor:pointer;" title="Cor sólida">' +
                                '<input type="color" id="nick-color" value="' + nickColor + '" style="position:absolute;top:-8px;left:-8px;width:54px;height:54px;border:none;cursor:pointer;">' +
                            '</div>' +
                            '<div id="nick-grad-colors" style="display:' + (nickGradient ? 'flex' : 'none') + ';gap:8px;align-items:center;">' +
                                '<span style="color:#444;font-size:14px;">→</span>' +
                                '<div style="position:relative;width:38px;height:38px;border-radius:6px;overflow:hidden;border:2px solid #333;cursor:pointer;">' +
                                    '<input type="color" id="nick-grad1" value="' + (nickGradient.split(',')[0] || '#f59e0b') + '" style="position:absolute;top:-8px;left:-8px;width:54px;height:54px;border:none;cursor:pointer;">' +
                                '</div>' +
                                '<div style="position:relative;width:38px;height:38px;border-radius:6px;overflow:hidden;border:2px solid #333;cursor:pointer;">' +
                                    '<input type="color" id="nick-grad2" value="' + (nickGradient.split(',')[1] || '#ef4444') + '" style="position:absolute;top:-8px;left:-8px;width:54px;height:54px;border:none;cursor:pointer;">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    // Verificado
                    '<div style="flex:1;background:#111;border-radius:8px;padding:14px;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                            '<span style="color:#999;font-size:11px;font-weight:500;">VERIFICADO</span>' +
                            '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="verified-grad-check"' + (verifiedGradient ? ' checked' : '') + ' style="width:13px;height:13px;accent-color:#6366f1;cursor:pointer;"><span style="color:#666;font-size:10px;">Gradiente</span></label>' +
                        '</div>' +
                        '<div style="display:flex;gap:8px;align-items:center;">' +
                            '<div style="position:relative;width:38px;height:38px;border-radius:6px;overflow:hidden;border:2px solid #333;cursor:pointer;" title="Cor sólida">' +
                                '<input type="color" id="verified-color" value="' + verifiedColor + '" style="position:absolute;top:-8px;left:-8px;width:54px;height:54px;border:none;cursor:pointer;">' +
                            '</div>' +
                            '<div id="verified-grad-colors" style="display:' + (verifiedGradient ? 'flex' : 'none') + ';gap:8px;align-items:center;">' +
                                '<span style="color:#444;font-size:14px;">→</span>' +
                                '<div style="position:relative;width:38px;height:38px;border-radius:6px;overflow:hidden;border:2px solid #333;cursor:pointer;">' +
                                    '<input type="color" id="verified-grad1" value="' + (verifiedGradient.split(',')[0] || '#6366f1') + '" style="position:absolute;top:-8px;left:-8px;width:54px;height:54px;border:none;cursor:pointer;">' +
                                '</div>' +
                                '<div style="position:relative;width:38px;height:38px;border-radius:6px;overflow:hidden;border:2px solid #333;cursor:pointer;">' +
                                    '<input type="color" id="verified-grad2" value="' + (verifiedGradient.split(',')[1] || '#ec4899') + '" style="position:absolute;top:-8px;left:-8px;width:54px;height:54px;border:none;cursor:pointer;">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                // Botão sincronizar
                '<button id="sync-colors-btn" style="width:100%;padding:10px;background:#1a1a1a;border:1px solid #222;border-radius:6px;color:#888;font-size:12px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/></svg>' + t('Sincronizar cores (Nick → Verificado)') + '</button>' +
                // Fonte e Banner
                '<div style="display:flex;gap:12px;margin-bottom:20px;">' +
                    '<div style="flex:1;">' +
                        '<label style="display:block;color:#666;font-size:10px;font-weight:500;margin-bottom:6px;text-transform:uppercase;">' + t('Fonte') + '</label>' +
                        '<select id="font-select" style="width:100%;padding:11px 12px;background:#111;border:1px solid #222;border-radius:6px;color:#fff;font-size:13px;cursor:pointer;outline:none;">' + fontOpts + '</select>' +
                    '</div>' +
                    '<div style="flex:1;">' +
                        '<label style="display:block;color:#666;font-size:10px;font-weight:500;margin-bottom:6px;text-transform:uppercase;">' + t('Banner') + '</label>' +
                        '<select id="banner-select" style="width:100%;padding:11px 12px;background:#111;border:1px solid #222;border-radius:6px;color:#fff;font-size:13px;cursor:pointer;outline:none;">' + bannerOpts + '</select>' +
                    '</div>' +
                '</div>' +
                // Banner customizado
                '<div id="custom-banner-colors" style="display:' + (currentBanner === 'custom' ? 'flex' : 'none') + ';gap:10px;align-items:center;margin-bottom:20px;padding:12px;background:#111;border-radius:6px;">' +
                    '<span style="color:#666;font-size:11px;">' + t('Cores do banner:') + '</span>' +
                    '<div style="position:relative;width:32px;height:32px;border-radius:5px;overflow:hidden;border:2px solid #333;cursor:pointer;">' +
                        '<input type="color" id="banner-c1" value="' + customBannerC1 + '" style="position:absolute;top:-6px;left:-6px;width:44px;height:44px;border:none;cursor:pointer;">' +
                    '</div>' +
                    '<div style="position:relative;width:32px;height:32px;border-radius:5px;overflow:hidden;border:2px solid #333;cursor:pointer;">' +
                        '<input type="color" id="banner-c2" value="' + customBannerC2 + '" style="position:absolute;top:-6px;left:-6px;width:44px;height:44px;border:none;cursor:pointer;">' +
                    '</div>' +
                '</div>' +
                // Salvar
                '<button id="pro-save-btn" style="width:100%;padding:13px;background:#fff;border:none;border-radius:8px;color:#000;font-size:13px;font-weight:600;cursor:pointer;">' + t('Salvar Alterações') + '</button>' +
                '<p style="color:#333;font-size:10px;margin-top:12px;text-align:center;">' + t('Válido até') + ': ' + (status.expires_at ? new Date(status.expires_at).toLocaleDateString() : t('Vitalício')) + '</p>' +
            '</div>';

        setupProHandlers(popup, userNick);
    }

    function setupProHandlers(popup, userNick) {
        var closeBtn = popup.querySelector('#pro-close-btn');
        var verifiedColor = popup.querySelector('#verified-color');
        var verifiedGradCheck = popup.querySelector('#verified-grad-check');
        var verifiedGradColors = popup.querySelector('#verified-grad-colors');
        var verifiedGrad1 = popup.querySelector('#verified-grad1');
        var verifiedGrad2 = popup.querySelector('#verified-grad2');
        var nickColor = popup.querySelector('#nick-color');
        var nickGradCheck = popup.querySelector('#nick-grad-check');
        var nickGradColors = popup.querySelector('#nick-grad-colors');
        var nickGrad1 = popup.querySelector('#nick-grad1');
        var nickGrad2 = popup.querySelector('#nick-grad2');
        var fontSelect = popup.querySelector('#font-select');
        var bannerSelect = popup.querySelector('#banner-select');
        var customBannerColors = popup.querySelector('#custom-banner-colors');
        var bannerC1 = popup.querySelector('#banner-c1');
        var bannerC2 = popup.querySelector('#banner-c2');
        var syncBtn = popup.querySelector('#sync-colors-btn');
        var saveBtn = popup.querySelector('#pro-save-btn');
        var previewEl = popup.querySelector('#pro-preview');
        var previewNick = popup.querySelector('#preview-nick');
        var previewBadge = popup.querySelector('#preview-badge');

        closeBtn.onclick = closePopup;

        function updatePreview() {
            var font = PRO_FONTS[fontSelect.value] ? PRO_FONTS[fontSelect.value].family : 'Space Grotesk';
            previewNick.style.setProperty('font-family', "'" + font + "', sans-serif", 'important');

            if (nickGradCheck.checked) {
                var ng = 'linear-gradient(90deg, ' + nickGrad1.value + ', ' + nickGrad2.value + ')';
                previewNick.style.background = ng;
                previewNick.style.webkitBackgroundClip = 'text';
                previewNick.style.webkitTextFillColor = 'transparent';
                previewNick.style.backgroundClip = 'text';
            } else {
                previewNick.style.background = 'none';
                previewNick.style.webkitBackgroundClip = 'unset';
                previewNick.style.webkitTextFillColor = 'unset';
                previewNick.style.backgroundClip = 'unset';
                previewNick.style.color = nickColor.value;
            }

            if (verifiedGradCheck.checked) {
                previewBadge.innerHTML = '<svg width="15" height="15" viewBox="0 0 22 22"><defs><linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="' + verifiedGrad1.value + '"/><stop offset="100%" stop-color="' + verifiedGrad2.value + '"/></linearGradient></defs><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="url(#vg)"/><path d="M15 9l-4.5 4.5L8 11" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            } else {
                previewBadge.innerHTML = '<svg width="15" height="15" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="' + verifiedColor.value + '"/><path d="M15 9l-4.5 4.5L8 11" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }

            var bannerKey = bannerSelect.value;
            if (bannerKey === 'custom') {
                previewEl.style.background = 'linear-gradient(90deg, ' + bannerC1.value + '33 0%, ' + bannerC2.value + '44 50%, ' + bannerC1.value + '33 100%)';
            } else if (PRO_BANNERS[bannerKey] && PRO_BANNERS[bannerKey].gradient !== 'none') {
                previewEl.style.background = PRO_BANNERS[bannerKey].gradient;
            } else {
                previewEl.style.background = '#111';
            }
        }

        // Sincronizar cores (Nick → Verificado)
        syncBtn.onclick = function() {
            verifiedColor.value = nickColor.value;
            verifiedGradCheck.checked = nickGradCheck.checked;
            verifiedGradColors.style.display = nickGradColors.style.display;
            verifiedGrad1.value = nickGrad1.value;
            verifiedGrad2.value = nickGrad2.value;
            updatePreview();
            syncBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' + t('Sincronizado!');
            setTimeout(function() {
                syncBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/></svg>' + t('Sincronizar cores (Nick → Verificado)');
            }, 1500);
        };

        verifiedGradCheck.onchange = function() { verifiedGradColors.style.display = verifiedGradCheck.checked ? 'flex' : 'none'; updatePreview(); };
        nickGradCheck.onchange = function() { nickGradColors.style.display = nickGradCheck.checked ? 'flex' : 'none'; updatePreview(); };
        bannerSelect.onchange = function() { customBannerColors.style.display = bannerSelect.value === 'custom' ? 'flex' : 'none'; updatePreview(); };

        verifiedColor.oninput = updatePreview;
        verifiedGrad1.oninput = updatePreview;
        verifiedGrad2.oninput = updatePreview;
        nickColor.oninput = updatePreview;
        nickGrad1.oninput = updatePreview;
        nickGrad2.oninput = updatePreview;
        fontSelect.onchange = updatePreview;
        bannerC1.oninput = updatePreview;
        bannerC2.oninput = updatePreview;

        saveBtn.onclick = function() {
            saveBtn.textContent = 'Salvando...';
            saveBtn.disabled = true;

            var settingsToSave = {
                verified_color: verifiedColor.value,
                nick_color: nickColor.value,
                banner: bannerSelect.value,
                font: fontSelect.value,
                verified_gradient: verifiedGradCheck.checked ? verifiedGrad1.value + ',' + verifiedGrad2.value : '',
                nick_gradient: nickGradCheck.checked ? nickGrad1.value + ',' + nickGrad2.value : '',
                custom_banner_color1: bannerC1.value,
                custom_banner_color2: bannerC2.value
            };

            saveProSettings(settingsToSave).then(function(result) {
                if (result.success) {
                    saveBtn.textContent = 'Salvo!';
                    saveBtn.style.background = '#22c55e';
                } else {
                    saveBtn.textContent = 'Erro';
                    saveBtn.style.background = '#ef4444';
                }
                setTimeout(function() {
                    saveBtn.textContent = t('Salvar Alterações');
                    saveBtn.style.background = '#fff';
                    saveBtn.disabled = false;
                }, 1500);
            }).catch(function() {
                saveBtn.textContent = 'Erro';
                saveBtn.style.background = '#ef4444';
                setTimeout(function() {
                    saveBtn.textContent = t('Salvar Alterações');
                    saveBtn.style.background = '#fff';
                    saveBtn.disabled = false;
                }, 1500);
            });
        };

        updatePreview();
    }

    function init() {
        if (!Injector.isGameFrame()) return;
        fetch(API_BASE + '/user').then(function(r) { return r.json(); }).then(function(data) {
            if (data.nick) {
                window.__myNick = data.nick;
                try { localStorage.setItem('haxclient_my_nick', data.nick); } catch(e) {}
            }
        }).catch(function() {});
        loadProStatus().then(function(status) {
            if (status.is_pro || status.is_vip) loadProSettings();
        });
        window.__showProPopup = showProPopup;
        window.__proLoadStatus = loadProStatus;
        window.__proLoadSettings = loadProSettings;
        window.__proIsPro = function() { return proStatus && (proStatus.is_pro || proStatus.is_vip); };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
