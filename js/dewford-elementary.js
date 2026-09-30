/* Three-level course sliders, scoped to the elementary program pages. */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.dewford-elementary-slider').forEach(function (element) {
    new Swiper(element, {
      speed: 700,
      loop: false,
      slidesPerView: 1,
      spaceBetween: 0,
      watchOverflow: true,
      breakpoints: {768: {slidesPerView: 2}, 992: {slidesPerView: 3}},
      navigation: {
        nextEl: element.querySelector('.slider-next'),
        prevEl: element.querySelector('.slider-prev')
      }
    });
  });
});
