(function() {
    'use strict';
    
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        var zoomLevel = parseFloat(localStorage.getItem('haxball_zoom') || '1');
        var extrapolation = parseInt(localStorage.getItem('haxball_extrapolation') || '0');
        
        if (e.ctrlKey && e.key.toUpperCase() === 'E') {
            e.preventDefault();
            e.stopPropagation();
            extrapolation = extrapolation - 50;
            if (extrapolation < -200) extrapolation = -200;
            localStorage.setItem('haxball_extrapolation', extrapolation);
            
            var cmdInput = document.querySelector('input[data-hook="input"]') || document.querySelector('.chatbox-view input[type="text"]');
            if (cmdInput) {
                cmdInput.value = '/extrapolation ' + extrapolation;
                var event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, cancelable: true });
                cmdInput.dispatchEvent(event);
            }
            return;
        }
        
        if (e.ctrlKey && e.key === '0') {
            zoomLevel = 1;
            localStorage.setItem('haxball_zoom', zoomLevel);
            document.body.style.zoom = zoomLevel;
            return;
        }
        
        if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            e.stopPropagation();
            zoomLevel += 0.1;
            if (zoomLevel > 2) zoomLevel = 2;
            localStorage.setItem('haxball_zoom', zoomLevel);
            document.body.style.zoom = zoomLevel;
            return;
        }
        
        if (e.ctrlKey && (e.key === '-' || e.key === '_')) {
            e.preventDefault();
            e.stopPropagation();
            zoomLevel -= 0.1;
            if (zoomLevel < 0.5) zoomLevel = 0.5;
            localStorage.setItem('haxball_zoom', zoomLevel);
            document.body.style.zoom = zoomLevel;
            return;
        }
    }, true);
    
    Injector.log('Shortcuts loaded');
})();
