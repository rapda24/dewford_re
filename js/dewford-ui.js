/* Standalone navigation: no dependency on the source site's WordPress plugins. */
(() => {
  document.querySelectorAll('.services-section-seven .tab-content').forEach(content => {
    const panes = [...content.querySelectorAll('.tab-pane')];
    let cleanup;
    panes.forEach(pane => pane.classList.remove('fade'));
    content.classList.add('dewford-crossfade-tabs');
    const nav = content.closest('.row').querySelector('.service-nav-tab');
    nav.addEventListener('show.bs.tab', () => {
      clearTimeout(cleanup);
      panes.forEach(pane => {
        pane.classList.remove('is-outgoing');
        pane.inert = !pane.classList.contains('active');
      });
      const previous = content.querySelector('.tab-pane.active');
      if (previous) {
        previous.classList.add('is-outgoing');
        previous.inert = true;
      }
    });
    nav.addEventListener('shown.bs.tab', () => {
      content.querySelector('.tab-pane.active').inert = false;
      cleanup = setTimeout(() => {
        panes.forEach(pane => pane.classList.remove('is-outgoing'));
      }, 300);
    });
  });
  document.querySelectorAll('.services-section-seven .service-nav-tab [data-bs-toggle="pill"]').forEach(tab => {
    tab.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && window.bootstrap?.Tab) {
        bootstrap.Tab.getOrCreateInstance(tab).show();
      }
    });
  });
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
  const dialogPhoto = drawer.querySelector('.dewford-dialog-photo');
  const dialogNavigation = drawer.querySelector('.dewford-dialog-navigation');
  const alignDialogBaseline = () => {
    if (!drawer.open || !matchMedia('(min-width:768px)').matches) return;
    const expandedHeight = [...drawer.querySelectorAll('.dewford-dialog-submenu:not([hidden])')]
      .reduce((height, submenu) => height + submenu.getBoundingClientRect().height, 0);
    const collapsedHeight = dialogNavigation.getBoundingClientRect().height - expandedHeight;
    const difference = dialogPhoto.getBoundingClientRect().height - collapsedHeight;
    drawer.style.setProperty('--dewford-dialog-nav-offset', `${Math.max(0, difference)}px`);
    drawer.style.setProperty('--dewford-dialog-photo-offset', `${Math.max(0, -difference)}px`);
  };
  if ('ResizeObserver' in window) {
    const dialogResize = new ResizeObserver(alignDialogBaseline);
    dialogResize.observe(dialogPhoto);
    dialogResize.observe(dialogNavigation);
  }
  window.addEventListener('resize', alignDialogBaseline);
  toggle.addEventListener('click', () => {
    drawer.showModal();
    alignDialogBaseline();
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('dewford-menu-open');
  });
  drawer.querySelectorAll('.dewford-submenu-toggle').forEach(button => {
    const parent = button.closest('.dewford-dialog-row').querySelector('.dewford-dialog-parent');
    const toggleSubmenu = () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      drawer.querySelectorAll('.dewford-submenu-toggle').forEach(other => {
        if (other === button) return;
        other.setAttribute('aria-expanded', 'false');
        other.closest('.dewford-dialog-row').querySelector('.dewford-dialog-parent')?.setAttribute('aria-expanded', 'false');
        document.getElementById(other.getAttribute('aria-controls')).hidden = true;
        other.querySelector('span').textContent = '+';
      });
      button.setAttribute('aria-expanded', String(!expanded));
      parent?.setAttribute('aria-expanded', String(!expanded));
      document.getElementById(button.getAttribute('aria-controls')).hidden = expanded;
      button.querySelector('span').textContent = expanded ? '+' : '−';
    };
    button.addEventListener('click', toggleSubmenu);
    parent?.addEventListener('click', toggleSubmenu);
  });
  drawer.querySelector('.dewford-menu-close').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', event => { if (event.target === drawer && event.clientX < drawer.getBoundingClientRect().left) drawer.close(); });
  drawer.addEventListener('close', () => {
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('dewford-menu-open');
    toggle.focus();
  });
})();
