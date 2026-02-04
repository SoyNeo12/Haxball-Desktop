// ============================================
// COMMANDS - Zoom com + e -
// Os comandos /gif, /ungif, /mute, /unmute, /mutelist
// foram movidos para o game-min.js
// ============================================
(function() {
    if (Injector.isMainFrame()) return;

    var CAMERA_STORAGE_KEY = 'haxclient_camera_level';
    var cameraLevel = 3;
    var zoomSetup = false;

    function loadCameraLevel() {
        try {
            var saved = localStorage.getItem(CAMERA_STORAGE_KEY);
            if (saved !== null) {
                cameraLevel = parseInt(saved);
                if (isNaN(cameraLevel) || cameraLevel < 0 || cameraLevel > 7) {
                    cameraLevel = 3;
                }
            }
        } catch (e) {
            cameraLevel = 3;
        }
    }

    function saveCameraLevel() {
        localStorage.setItem(CAMERA_STORAGE_KEY, cameraLevel.toString());
    }

    function setCameraLevel(level) {
        if (level < 0) level = 0;
        if (level > 7) level = 7;
        cameraLevel = level;
        saveCameraLevel();
        
        var keyCode = 48 + level;
        var key = level.toString();
        
        var keydownEvent = new KeyboardEvent('keydown', {
            key: key,
            code: 'Digit' + key,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });
        
        var keyupEvent = new KeyboardEvent('keyup', {
            key: key,
            code: 'Digit' + key,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(keydownEvent);
        document.dispatchEvent(keyupEvent);
    }

    function setupZoomKeys() {
        if (zoomSetup) return;
        zoomSetup = true;
        
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.ctrlKey) return;
            
            if (e.code === 'Equal' || e.code === 'NumpadAdd' || (e.key === '+')) {
                e.preventDefault();
                setCameraLevel(cameraLevel - 1);
                return;
            }
            
            if (e.code === 'Minus' || e.code === 'NumpadSubtract' || (e.key === '-')) {
                e.preventDefault();
                setCameraLevel(cameraLevel + 1);
                return;
            }
            
            if (e.code >= 'Digit0' && e.code <= 'Digit7') {
                cameraLevel = parseInt(e.key);
                saveCameraLevel();
            }
        });
        
        Injector.log('Zoom keys setup complete');
    }

    function init() {
        loadCameraLevel();
        setupZoomKeys();
        Injector.log('Commands module loaded (zoom only)');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
