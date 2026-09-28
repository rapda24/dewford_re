/* Template motion from script.js/custom-gsap.js, scoped to the imported sections. */
(() => {
  const titles = [...document.querySelectorAll('[data-scroll-emphasis]')].map(node => node.closest('h1,h2')).filter((title, i, all) => title && all.indexOf(title) === i);
  titles.forEach(title => {
    title.style.setProperty('--dewford-title-ink', getComputedStyle(title).color);
    title.classList.add('dewford-scroll-title');
  });
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('main .anim-fade-move').forEach(item => {
    const direction = item.dataset.fadeFrom || 'bottom';
    const offset = Number(item.dataset.fadeOffset || 50);
    const settings = {opacity:0,ease:item.dataset.ease || 'power2.out',duration:Number(item.dataset.duration || 1.15),delay:Number(item.dataset.delay || .15),scrollTrigger:{trigger:item,start:'top 85%'}};
    settings[['left','right'].includes(direction) ? 'x' : 'y'] = ['left','top'].includes(direction) ? -offset : offset;
    gsap.from(item, settings);
  });
  if (window.SplitType) titles.forEach(title => {
    const chars = [];
    title.querySelectorAll('[data-scroll-emphasis]').forEach(emphasis => {
      emphasis.setAttribute('aria-label', emphasis.textContent.replace(/\s+/g, ' ').trim());
      const split = new SplitType(emphasis, {types:'words, chars'});
      split.chars.forEach(char => char.setAttribute('aria-hidden', 'true'));
      chars.push(...split.chars);
    });
    const hero = title.id === 'dewford-hero-title';
    gsap.fromTo(chars, {opacity:.3}, {
      opacity:1, stagger:.06, duration:.2, ease:'none',
      scrollTrigger:{trigger:title,start:hero ? 'top 95%' : 'top 85%',end:hero ? 'top 50%' : 'top 45%',scrub:true,invalidateOnRefresh:true}
    });
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
