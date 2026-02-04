// Bloqueia clique direito no iframe do reCAPTCHA
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}, true);

// Bloqueia links do reCAPTCHA (Privacy, Terms) para não abrir no Iron
document.addEventListener('click', function(e) {
    var target = e.target;
    
    while (target && target.tagName !== 'A') {
        target = target.parentElement;
    }
    
    if (target && target.href) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);
