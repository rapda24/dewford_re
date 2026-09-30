(() => {
  const slider = document.querySelector('.dewford-why-services');
  if (!slider || typeof Swiper === 'undefined') return;
  const mobile = window.matchMedia('(max-width: 767.98px)');
  let swiper;
  const updateBackground = () => {
    const card = slider.querySelectorAll('.service-block-two')[swiper.activeIndex];
    slider.closest('.outer-box').style.backgroundImage = `url("${card.dataset.bg}")`;
  };
  const update = () => {
    if (mobile.matches && !swiper) {
      swiper = new Swiper(slider, {
        slidesPerView: 1, spaceBetween: 0, speed: 500,
        keyboard: { enabled: true, onlyInViewport: true },
        pagination: { el: slider.querySelector('.dewford-why-pagination'), clickable: true },
        a11y: { enabled: true }
      });
      swiper.on('slideChange', updateBackground);
      updateBackground();
    } else if (!mobile.matches && swiper) {
      swiper.destroy(true, true);
      swiper = undefined;
    }
  };
  mobile.addEventListener('change', update);
  update();
})();
