/* Template motion from script.js/custom-gsap.js, scoped to the imported sections. */
(() => {
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('main .anim-fade-move').forEach(item => {
    const direction = item.dataset.fadeFrom || 'bottom';
    const offset = Number(item.dataset.fadeOffset || 50);
    const settings = {opacity:0,ease:item.dataset.ease || 'power2.out',duration:Number(item.dataset.duration || 1.15),delay:Number(item.dataset.delay || .15),scrollTrigger:{trigger:item,start:'top 85%'}};
    settings[['left','right'].includes(direction) ? 'x' : 'y'] = ['left','top'].includes(direction) ? -offset : offset;
    gsap.from(item, settings);
  });
  if (window.SplitType) document.querySelectorAll('main .text-reveal-anim').forEach(title => {
    const split = new SplitType(title, {types:'chars'});
    gsap.from(split.chars, {scrollTrigger:{trigger:title,start:'top 75%',end:'top 25%',scrub:true},opacity:.6,stagger:5,ease:'back.out'});
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
