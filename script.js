// Hide the 3D View button on mobile once user scrolls
(function () {
  var toggle = document.getElementById('toggle-3d');
  if (!toggle) return;

  var isMobile = window.matchMedia('(max-width: 640px)').matches;
  if (!isMobile) return;

  var hidden = false;
  window.addEventListener('scroll', function () {
    if (!hidden && window.scrollY > 10) {
      toggle.style.opacity = '0';
      toggle.style.pointerEvents = 'none';
      toggle.style.transform = 'translateY(-12px)';
      hidden = true;
    } else if (hidden && window.scrollY <= 10) {
      toggle.style.opacity = '1';
      toggle.style.pointerEvents = 'auto';
      toggle.style.transform = 'translateY(0)';
      hidden = false;
    }
  }, { passive: true });
})();
