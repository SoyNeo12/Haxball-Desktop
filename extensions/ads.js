// ============================================
// ADS - Remove propagandas
// ============================================
(async function () {
  const el = await Injector.waitForElement('.rightbar');
  if (!el) return;

  const rightbar = document.querySelector('.rightbar');
  if (rightbar) {
    rightbar.innerHTML = '';
    rightbar.style.display = 'none';
  }
  Injector.injectCSS('rightbar-hide', '.rightbar { display: none !important; width: 0 !important; }');
  Injector.log('Ads removed');
})();
