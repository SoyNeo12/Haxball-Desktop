(function () {
  function inject() {
    var target = document.head || document.documentElement;
    if (!target) return false;

    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('payload_generated.js');
    s.onload = function () {
      this.remove();
      console.log('[HXD] Payload injected correctly');
    };

    target.appendChild(s);
    return true;
  }

  if (!inject()) {
    var observer = new MutationObserver(function (_, obs) {
      if (inject()) obs.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  }
})();
