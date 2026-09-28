/* Standalone navigation: no dependency on the source site's WordPress plugins. */
(() => {
  const header = document.querySelector('.dewford-header');
  const drawer = document.querySelector('#dewford-drawer');
  const toggle = document.querySelector('.dewford-menu-toggle');
  const scrollTop = document.querySelector('.dewford-scroll-top');
  const progress = scrollTop?.querySelector('.pxl-scroll-progress-circle path');
  const update = () => {
    const position = Math.max(0, window.scrollY);
    header.classList.toggle('is-scrolled', position > 0);
    if (scrollTop) {
      scrollTop.hidden = position === 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = distance > 0 ? Math.min(1, position / distance) : 0;
      progress.style.strokeDashoffset = String(100 * (1 - ratio));
    }
  };
  scrollTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(document.body);
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('pageshow', update);
  update();
  toggle.addEventListener('click', () => {
    drawer.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('dewford-menu-open');
  });
  drawer.querySelectorAll('.dewford-submenu-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      document.getElementById(button.getAttribute('aria-controls')).hidden = expanded;
      button.querySelector('span').textContent = expanded ? '+' : '−';
    });
  });
  drawer.querySelector('.dewford-menu-close').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', event => { if (event.target === drawer && event.clientX < drawer.getBoundingClientRect().left) drawer.close(); });
  drawer.addEventListener('close', () => {
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('dewford-menu-open');
    toggle.focus();
  });
})();
