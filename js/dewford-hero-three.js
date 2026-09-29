(() => {
  const hero = document.querySelector('.dewford-hero-three');
  if (!hero || typeof Swiper === 'undefined') return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pause = hero.querySelector('.hero-pause');
  const slider = new Swiper(hero.querySelector('.banner-active'), {
    slidesPerView: 1,
    rewind: true,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: reducedMotion.matches ? 0 : 1000,
    autoplay: reducedMotion.matches ? false : { delay: 6000, disableOnInteraction: false },
    navigation: { prevEl: hero.querySelector('.array-prev'), nextEl: hero.querySelector('.array-next') },
    a11y: { prevSlideMessage: '이전 사진', nextSlideMessage: '다음 사진', slideLabelMessage: '{{index}} / {{slidesLength}}' },
    on: { slideChange(swiper) { hero.querySelector('.hero-slide-count').textContent = `${String(swiper.realIndex + 1).padStart(2, '0')} / 03`; } }
  });
  function syncPause() {
    pause.textContent = slider.autoplay.running ? 'Ⅱ' : '▶';
    pause.setAttribute('aria-label', slider.autoplay.running ? '슬라이드 자동 재생 정지' : '슬라이드 자동 재생 시작');
  }
  pause.addEventListener('click', () => { slider.autoplay.running ? slider.autoplay.stop() : slider.autoplay.start(); syncPause(); });
  hero.addEventListener('focusin', () => { slider.autoplay.stop(); syncPause(); });
  reducedMotion.addEventListener('change', () => { slider.params.speed = reducedMotion.matches ? 0 : 1000; if (reducedMotion.matches) slider.autoplay.stop(); syncPause(); });
  syncPause();
})();
