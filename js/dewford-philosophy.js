/* Element-level entrance motion; sticky containers remain untransformed. */
(() => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const scope = '#main-content.dewford-philosophy-content';
    gsap.utils.toArray(`${scope} .about-section-home-two .sec-title-style-two, ${scope} .about-section-home-two .content, ${scope} .about-block-home-two, ${scope} .services-section .dewford-section-heading, ${scope} .services-section .service-block`).forEach((item, index) => {
      gsap.from(item, {
        y: 28, opacity: 0, duration: 0.8, ease: 'power2.out',
        delay: item.classList.contains('about-block-home-two') ? (index % 2) * 0.12 : 0,
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: item, start: 'top 92%', once: true }
      });
    });
    const photo = document.querySelector(`${scope} .dewford-philosophy-teacher-photo`);
    if (photo) {
      gsap.from(photo, {
        clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power3.out',
        clearProps: 'clipPath',
        scrollTrigger: { trigger: photo, start: 'top 90%', once: true }
      });
    }
  });
})();
