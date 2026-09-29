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
  let headerHovered = false;
  const update = () => {
    const position = Math.max(0, window.scrollY);
    header.classList.toggle('is-scrolled', position > 0 || headerHovered);
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
  header.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    headerHovered = true;
    update();
  });
  header.addEventListener('pointerleave', () => {
    headerHovered = false;
    update();
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
    drawer.tabIndex = -1;
    drawer.showModal();
    drawer.focus({ preventScroll: true });
    alignDialogBaseline();
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('dewford-menu-open');
  });
  const submenuAnimations = new Map();
  const slideSubmenu = (submenu, open) => {
    const running = submenuAnimations.get(submenu);
    if (!running && submenu.hidden === !open) return;
    const from = submenu.hidden ? 0 : submenu.getBoundingClientRect().height;
    running?.cancel();
    submenuAnimations.delete(submenu);
    submenu.hidden = false;
    submenu.inert = !open;
    const padding = getComputedStyle(submenu).paddingBottom;
    const height = submenu.scrollHeight;
    const finish = () => {
      submenu.hidden = !open;
      submenu.style.removeProperty('overflow');
      submenuAnimations.delete(submenu);
      alignDialogBaseline();
    };
    if (!submenu.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    submenu.style.overflow = 'hidden';
    const animation = submenu.animate([
      {height: `${from}px`, paddingBottom: from ? padding : '0px', opacity: from ? 1 : 0},
      {height: `${open ? height : 0}px`, paddingBottom: open ? padding : '0px', opacity: open ? 1 : 0}
    ], {duration: 350, easing: 'cubic-bezier(.22,.8,.25,1)'});
    submenuAnimations.set(submenu, animation);
    animation.onfinish = finish;
  };
  drawer.querySelectorAll('.dewford-submenu-toggle').forEach(button => {
    const parent = button.closest('.dewford-dialog-row').querySelector('.dewford-dialog-parent');
    const toggleSubmenu = () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      drawer.querySelectorAll('.dewford-submenu-toggle').forEach(other => {
        if (other === button) return;
        other.setAttribute('aria-expanded', 'false');
        other.closest('.dewford-dialog-row').querySelector('.dewford-dialog-parent')?.setAttribute('aria-expanded', 'false');
        slideSubmenu(document.getElementById(other.getAttribute('aria-controls')), false);
        other.querySelector('span').textContent = '+';
      });
      button.setAttribute('aria-expanded', String(!expanded));
      parent?.setAttribute('aria-expanded', String(!expanded));
      slideSubmenu(document.getElementById(button.getAttribute('aria-controls')), !expanded);
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

/* Learning journey cards slide only on mobile. */
(() => {
  const container = document.querySelector('.dewford-home .services-section-three .auto-container');
  const row = container?.querySelector(':scope > .row');
  if (!row || !window.Swiper) return;
  const cards = [...row.children].filter(card => card.classList.contains('service-block-three'));
  const mobile = matchMedia('(max-width:767.98px)');
  let slider;
  const sync = () => {
    if (mobile.matches && !slider) {
      container.classList.add('dewford-journey-slider');
      row.classList.add('swiper-wrapper');
      cards.forEach(card => card.classList.add('swiper-slide'));
      slider = new Swiper(container, {
        slidesPerView: 1.08, spaceBetween: 16,
        speed: matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 400,
        watchOverflow: true, grabCursor: true,
        keyboard: {enabled: true, onlyInViewport: true}
      });
    } else if (!mobile.matches && slider) {
      slider.destroy(true, true);
      slider = null;
      container.classList.remove('dewford-journey-slider');
      row.classList.remove('swiper-wrapper');
      cards.forEach(card => card.classList.remove('swiper-slide'));
    }
  };
  mobile.addEventListener('change', sync);
  sync();
})();

/* Static experience grid on desktop, swipeable cards on mobile. */
(() => {
  const grid = document.querySelector('.dewford-home .service-section-four .dewford-experience-grid');
  if (!grid || !window.Swiper) return;
  const container = document.createElement('div');
  container.className = 'dewford-experience-slider';
  grid.before(container);
  container.append(grid);
  const cards = [...grid.children];
  const mobile = matchMedia('(max-width:767.98px)');
  let slider;
  const sync = () => {
    if (mobile.matches && !slider) {
      grid.classList.add('swiper-wrapper');
      cards.forEach(card => card.classList.add('swiper-slide'));
      slider = new Swiper(container, {
        slidesPerView: 1, spaceBetween: 0, autoHeight: true,
        rewind: true,
        autoplay: {delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true},
        speed: matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 400,
        watchOverflow: true, grabCursor: true,
        keyboard: {enabled: true, onlyInViewport: true}
      });
    } else if (!mobile.matches && slider) {
      slider.destroy(true, true);
      slider = null;
      grid.classList.remove('swiper-wrapper');
      cards.forEach(card => card.classList.remove('swiper-slide'));
    }
  };
  mobile.addEventListener('change', sync);
  sync();
})();

// Keep sentence breaks consistent in mobile copy, including loaded event text.
(() => {
  const excluded = 'script,style,noscript,textarea,input,select,option,svg,canvas,pre,code,[contenteditable="true"],a[href^="mailto:"],a[href^="tel:"]';
  const applyBreaks = root => {
    if (root.nodeType === Node.ELEMENT_NODE && root.closest(excluded)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    if (root.nodeType === Node.TEXT_NODE) nodes.push(root);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.parentElement || node.parentElement.closest(excluded)) return;
      const text = node.nodeValue;
      // A sentence separator has whitespace after it; dots in URLs and numbers do not.
      const pattern = /[.。](?=\s+\S)/g;
      const matches = [...text.matchAll(pattern)];
      if (!matches.length) return;
      const fragment = document.createDocumentFragment();
      let start = 0;
      matches.forEach(match => {
        const end = match.index + 1;
        fragment.append(document.createTextNode(text.slice(start, end)));
        const br = document.createElement('br');
        br.className = 'dewford-mobile-sentence-break';
        fragment.append(br);
        start = end;
      });
      fragment.append(document.createTextNode(text.slice(start)));
      node.replaceWith(fragment);
    });
  };
  applyBreaks(document.body);
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') applyBreaks(record.target);
      else record.addedNodes.forEach(applyBreaks);
    });
  });
  observer.observe(document.body, {subtree:true, childList:true, characterData:true});
})();

// Reveal curriculum cards from alternating sides on mobile scroll.
(() => {
  const cards = [...document.querySelectorAll('.why-choose-us-four .feature-block')];
  if (!cards.length || !('IntersectionObserver' in window)) return;
  const mobile = matchMedia('(max-width:767.98px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let observer;
  const sync = () => {
    if (observer) observer.disconnect();
    cards.forEach(card => card.classList.remove('dewford-curriculum-reveal', 'is-visible'));
    if (!mobile.matches || reduced.matches) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:0.15, rootMargin:'0px 0px -8% 0px'});
    cards.forEach(card => {
      card.classList.add('dewford-curriculum-reveal');
      observer.observe(card);
    });
  };
  mobile.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  sync();
})();
