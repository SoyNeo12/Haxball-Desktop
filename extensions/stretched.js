// ============================================
// STRETCHED RESOLUTION - UI
// ============================================
(function() {
    var STORAGE_KEY = 'stretched_resolution';
    
    // Função de tradução
    function t(key) {
        return window.__t ? window.__t(key) : key;
    }
    
    var RESOLUTIONS = [
        { label: 'Nativo', width: 0, height: 0 },
        { label: '800x600 (4:3)', width: 800, height: 600 },
        { label: '1024x768 (4:3)', width: 1024, height: 768 },
        { label: '1280x960 (4:3)', width: 1280, height: 960 },
        { label: '1280x1024 (5:4)', width: 1280, height: 1024 },
        { label: '1400x900 (14:9)', width: 1400, height: 900 },
        { label: '1440x1080 (4:3)', width: 1440, height: 1080 }
    ];

    function getSavedResolution() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return { width: 0, height: 0 };
    }

    function saveResolution(width, height) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: width, height: height }));
    }

    function addSettingsOption() {
        // Procura a seção de vídeo
        var videoSection = document.querySelector('[data-hook="videosec"]');
        if (!videoSection) {
            return false;
        }
        
        if (document.getElementById('stretched-res-row')) {
            return true; // Já existe
        }

        var container = document.createElement('div');
        container.id = 'stretched-res-row';
        container.innerHTML = t('Esticar') + ':<select id="stretched-res-select" style="margin-left:8px;"></select>';
        
        var select = container.querySelector('select');
        var currentRes = getSavedResolution();

        RESOLUTIONS.forEach(function(res) {
            var option = document.createElement('option');
            option.value = res.width + 'x' + res.height;
            option.textContent = res.label === 'Nativo' ? t('Nativo') : res.label;
            if (res.width === currentRes.width && res.height === currentRes.height) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.onchange = function() {
            var parts = select.value.split('x');
            saveResolution(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0);
            window.dispatchEvent(new Event('resize'));
        };

        videoSection.appendChild(container);
        return true;
    }

    // Tenta adicionar a cada 500ms quando settings estiver aberto
    setInterval(function() {
        var settingsView = document.querySelector('.dialog.settings-view');
        if (settingsView) {
            addSettingsOption();
        }
    }, 500);
})();
