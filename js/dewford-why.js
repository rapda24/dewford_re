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
        rewind: true,
        autoplay: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {
          delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: false
        },
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

/* Reveal the project detail areas from right to left, one item at a time. */
(() => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('#main-content .sec-title-style-three').forEach(title => {
      gsap.from(title, {
        autoAlpha: 0,
        y: 40,
        duration: 0.85,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform',
        scrollTrigger: {
          trigger: title,
          start: 'top 90%',
          once: true
        }
      });
    });
    gsap.from('#main-content .dewford-why-clients .service-block .inner-box', {
      autoAlpha: 0,
      y: 40,
      duration: 0.85,
      stagger: 0.15,
      ease: 'power2.out',
      clearProps: 'opacity,visibility,transform',
      scrollTrigger: {
        trigger: '#main-content .dewford-why-clients .claint-outer',
        start: 'top 90%',
        once: true
      }
    });
    const features = gsap.utils.toArray('#main-content .why-choose-us-four .feature-block');
    gsap.set(features, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(features, {
      start: 'top 90%',
      once: true,
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.18,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform'
      })
    });
    const areas = gsap.utils.toArray('#main-content .project-details__top.dewford-why-copy-rows');
    const items = areas.flatMap(area => {
      const rows = [...area.querySelectorAll(':scope > .dewford-icon-copy-row')];
      return rows.length ? rows : [area];
    });
    gsap.set(items, { autoAlpha: 0, x: 48 });
    ScrollTrigger.batch(items, {
      start: 'top 90%',
      once: true,
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1,
        x: 0,
        duration: 0.85,
        stagger: 0.18,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform'
      })
    });
  });
})();

/* Promise cards become a swipeable carousel only on mobile. */
(() => {
  const slider = document.querySelector('.dewford-why-clients .claint-outer');
  if (!slider || typeof Swiper === 'undefined') return;
  const cards = [...slider.children];
  const mobile = matchMedia('(max-width: 767.98px)');
  let swiper, wrapper, pagination;
  const update = () => {
    if (mobile.matches && !swiper) {
      wrapper = document.createElement('div');
      wrapper.className = 'swiper-wrapper';
      cards.forEach(card => { card.classList.add('swiper-slide'); wrapper.append(card); });
      pagination = document.createElement('div');
      pagination.className = 'swiper-pagination dewford-promises-pagination';
      slider.classList.add('swiper');
      slider.append(wrapper, pagination);
      swiper = new Swiper(slider, {
        rewind: true,
        autoplay: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {
          delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: false
        },
        slidesPerView: 1.08,
        spaceBetween: 16,
        speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500,
        pagination: { el: pagination, clickable: true },
        keyboard: { enabled: true, onlyInViewport: true },
        a11y: { enabled: true, slideLabelMessage: '{{index}} / {{slidesLength}}' }
      });
    } else if (!mobile.matches && swiper) {
      swiper.destroy(true, true);
      swiper = undefined;
      cards.forEach(card => { card.classList.remove('swiper-slide'); slider.append(card); });
      wrapper.remove();
      pagination.remove();
      slider.classList.remove('swiper');
    }
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  };
  mobile.addEventListener('change', update);
  update();
})();
