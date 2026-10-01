/* Progressive enhancement: content remains visible without JavaScript or motion. */
(() => {
  const root = document.querySelector('.dewford-polished-page #main-content');
  if (!root) return;
  root.querySelectorAll('.accordion-box .acc-btn').forEach((button, index) => {
    const panel = button.nextElementSibling;
    if (!panel) return;
    button.setAttribute('role', 'button');
    button.tabIndex = 0;
    button.id = `dewford-faq-question-${index}`;
    panel.id = `dewford-faq-answer-${index}`;
    button.setAttribute('aria-controls', panel.id);
    panel.setAttribute('aria-labelledby', button.id);
    const sync = () => button.setAttribute('aria-expanded', String(button.classList.contains('active')));
    sync();
    new MutationObserver(sync).observe(button, {attributes: true, attributeFilter: ['class']});
    button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); button.click(); }
    });
  });
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const seen = new WeakSet();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = entry.target;
    observer.unobserve(target);
    target.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}], {duration:700,easing:'cubic-bezier(.2,.7,.2,1)'});
  }), {threshold:.08});
  const discover = () => root.querySelectorAll('.dewford-stage-grid .swiper-slide,.news-block-four,.team-details__progress-single,.dewford-editorial-heading,.about-section .image-column,.dewford-section-heading').forEach(el => {
    if (seen.has(el)) return;
    seen.add(el); observer.observe(el);
  });
  discover();
  const board = root.querySelector('[data-event-list]');
  if (board) new MutationObserver(discover).observe(board,{childList:true});
})();
