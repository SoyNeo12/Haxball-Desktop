'use strict';
(function() {
    var __hxdNoop = function() { };
    if (typeof console !== 'undefined') {
        console.log = __hxdNoop;
        console.warn = __hxdNoop;
        console.error = __hxdNoop;
        console.info = __hxdNoop;
    }

    var BASE_URL = 'http://localhost:5483';
    
    // Carrega o game script do servidor local
    function loadGameScript() {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', BASE_URL + '/secure/game-script', false);
            xhr.send();
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.script) {
                    var script = document.createElement('script');
                    script.textContent = response.script;
                    document.documentElement.appendChild(script);
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }
    
    // Carrega as extensões do servidor local
    function loadExtensions() {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', BASE_URL + '/secure/extensions', false);
            xhr.send();
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.scripts) {
                    var order = ['core', 'welcome', 'styles', 'themes', 'header', 'settings', 'discord', 'verified', 'vip', 'friends', 'teams', 'roomlist', 'chatlinks', 'commands', 'hideui', 'quickavatar', 'hosttoken', 'leaveroom', 'translate', 'ads', 'security', 'autoupdate', 'inputboost', 'shortcuts'];
                    order.forEach(function(name) {
                        if (response.scripts[name]) {
                            try {
                                var script = document.createElement('script');
                                script.textContent = response.scripts[name];
                                document.documentElement.appendChild(script);
                            } catch (e) {}
                        }
                    });
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }
    
    // Fecha o app
    function closeApp() {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', BASE_URL + '/close', false);
            xhr.send();
        } catch (e) {}
    }
    
    // Handler de downloads - escuta mensagens da página e envia pro background
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'haxball-download-request') {
            var data = event.data.data;
            var filename = event.data.filename;
            
            // Converte ArrayBuffer para base64 para enviar via chrome.runtime.sendMessage
            var bytes = new Uint8Array(data);
            var binary = '';
            for (var i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            var base64 = btoa(binary);
            
            // Envia pro background script fazer o download com saveAs
            chrome.runtime.sendMessage({
                action: 'downloadFile',
                base64: base64,
                filename: filename
            });
        }
    });
    
    // Carrega scripts
    var gameLoaded = loadGameScript();
    var extLoaded = loadExtensions();
    
    if (!gameLoaded || !extLoaded) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a1a;color:#fff;font-family:sans-serif;flex-direction:column;gap:16px;"><h2>Erro ao carregar</h2><p style="color:#888;">Não foi possível conectar ao servidor. O app será fechado.</p></div>';
        setTimeout(closeApp, 2000);
    }
})();
