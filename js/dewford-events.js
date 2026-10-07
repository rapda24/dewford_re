/* Both the home preview and event.html read the same published events JSON. */
(() => {
  const list = document.querySelector('[data-event-list]');
  if (!list) return;
  const home = list.dataset.eventList === 'home';
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const imageURL = value => {
    if (typeof value !== 'string') return '';
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const showStatus = message => {
    if (home) list.parentElement.swiper?.destroy(true, true);
    const box = element('div', 'dewford-events-status', message);
    if (home) {
      const link = element('a', '', '이벤트 게시판 보기 ↗');
      link.href = 'event.html'; box.append(link);
    }
    list.replaceChildren(box);
  };
  async function render(){
  try {
    let data;
    try { ({ data } = await DewfordAPI.content('events')); }
    catch (error) {
      if (!window.DEWFORD_EVENT_SAMPLES?.length) throw error;
    }
    if (!Array.isArray(data?.posts)) {
      data = { posts: window.DEWFORD_EVENT_SAMPLES || [] };
    }
    const posts = (Array.isArray(data?.posts) ? data.posts : []).filter(post =>
      post && typeof post.id === 'string' && typeof post.title === 'string'
    ).sort((a, b) => data?.ordered ? 0 : String(b.date || '').localeCompare(String(a.date || '')));
    const id = !home && new URLSearchParams(location.search).get('id');
    if (id) {
      const post = posts.find(post => post.id === id);
      if (!post) { showStatus('게시물을 찾을 수 없습니다.'); return; }
      list.hidden = true; list.style.display = 'none';
      const detail = document.querySelector('[data-event-detail]');
      detail.replaceChildren();
      detail.hidden = false; detail.className = 'dewford-event-detail';
      const back = element('a', 'dewford-text-link', '← 전체 소식'); back.href = 'event.html';
      detail.append(back, element('h2', '', post.title), element(post.date ? 'time' : 'span', '', post.date || ''));
      const url = imageURL(post.image);
      if (url) { const image = element('img'); image.src = url; image.alt = post.title; detail.append(image); }
      const body=element('div','dewford-event-body');window.DEWFORD_RICH_TEXT.render(body,post.content,post.body || post.excerpt || '');detail.append(body);
      document.title = post.title + ' | DEWFORD';
      return;
    }
    if (!posts.length) { showStatus('새로운 소식을 준비하고 있습니다.'); return; }
    if(home)list.parentElement.swiper?.destroy(true,true);
    list.replaceChildren();
    if (home && list.dataset.eventLayout === 'team-two') {
      for (const post of posts) {
        const href = 'detail.html?id=' + encodeURIComponent(post.id);
        const card = element('article', 'team-block-two swiper-slide');
        const inner = element('div', 'inner-block');
        const imageBox = element('div', 'image-box');
        const figure = element('figure', 'image');
        const imageLink = element('a'); imageLink.href = href;
        imageLink.className = 'dewford-event-image';
        imageLink.setAttribute('aria-label', post.title);
        imageLink.style.backgroundImage = 'url(' + JSON.stringify(imageURL(post.image) || 'images/optimized/main_38-768.webp') + ')';
        figure.append(imageLink); imageBox.append(figure);
        const content = element('div', 'content-box');
        const info = element('div', 'info-box');
        const title = element('h5', 'name');
        const link = element('a', '', post.title); link.href = href; title.append(link);
        info.append(title);
        content.append(info); inner.append(imageBox, content); card.append(inner); list.append(card);
      }
      const slider = list.parentElement;
      new Swiper(slider, {
        slidesPerView: 1, spaceBetween: 30, speed: 600, rewind: true,
        autoplay: {delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: false},
        watchOverflow: true, grabCursor: true,
        breakpoints: {768: {slidesPerView: 2}, 992: {slidesPerView: 3}},
        keyboard: {enabled: true, onlyInViewport: true},
        pagination: {el: slider.querySelector('.dewford-event-pagination'), clickable: true}
      });
      const heading = list.closest('.teams-section-two').querySelector('.sec-title-box');
      const reference = document.querySelector('.features-section-three .sec-right-box');
      if (reference && !heading.dataset.adminResizeBound) {
        heading.dataset.adminResizeBound = '1';
        const alignHeading = () => {
          heading.style.setProperty('--intro-start', Math.max(0, reference.getBoundingClientRect().left - heading.getBoundingClientRect().left) + 'px');
        };
        new ResizeObserver(alignHeading).observe(document.documentElement);
        window.addEventListener('resize', alignHeading);
        alignHeading();
      }
      return;
    }
    for (const post of posts) {
      if (home && list.dataset.eventLayout === 'service-four') {
        const slide = element('div', 'swiper-slide');
        const card = element('article', 'service-block-four');
        const inner = element('div', 'inner-box');
        const href = 'detail.html?id=' + encodeURIComponent(post.id);
        const heading = () => {
          const title = element('h4', 'title');
          const link = element('a', '', post.title); link.href = href; title.append(link); return title;
        };
        const excerpt = post.excerpt || '아이들의 배움과 성장이 담긴 이야기를 만나보세요.';
        const content = element('div', 'content');
        content.append(heading(), element('div', 'text', excerpt));
        const overlay = element('div', 'overlay-content');
        overlay.append(heading(), element('div', 'text', excerpt));
        const meta = element('ul', 'list-info');
        for (const value of [post.date].filter(Boolean)) {
          const item = element('li');
          const icon = element('i', 'fa-light fa-calendar'); icon.setAttribute('aria-hidden', 'true');
          item.append(icon, document.createTextNode(' ' + value)); meta.append(item);
        }
        overlay.append(meta);
        const box = element('div', 'btn-box');
        const more = element('a', 'theme-btn btn-style-two'); more.href = href;
        const arrow = element('i', 'icon fa-light fa-arrow-right'); arrow.setAttribute('aria-hidden', 'true');
        more.append(element('span', 'btn-title', '이벤트 자세히 보기'), arrow); box.append(more); overlay.append(box);
        inner.append(content, overlay); card.append(inner); slide.append(card); list.append(slide);
        continue;
      }
      if (home && list.dataset.eventLayout === 'journal') {
        const card = element('article', 'dr-news-card');
        const href = 'detail.html?id=' + encodeURIComponent(post.id);
        const photo = element('a', 'dr-news-photo'); photo.href = href;
        photo.setAttribute('aria-label', post.title);
        const url = imageURL(post.image);
        if (url) {
          const image = element('img'); image.src = url; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async'; photo.append(image);
        } else photo.append(element('span', 'dr-news-placeholder', 'DEWFORD'));
        const content = element('div', 'dr-news-copy');
        content.append(element(post.date ? 'time' : 'span', 'dr-news-meta', post.date || 'DEWFORD'));
        const title = element('h3'); const link = element('a', '', post.title); link.href = href; title.append(link);
        content.append(title, element('p', '', post.excerpt || ''));
        const more = element('a', 'dr-link', '자세히 보기'); more.href = href;
        const arrow = element('i', '', '↗'); arrow.setAttribute('aria-hidden', 'true'); more.append(arrow); content.append(more);
        card.append(photo, content); list.append(card);
        continue;
      }
      const card = element('article', home ? 'service-block-two' : 'dewford-board-card');
      const inner = element('div', home ? 'inner-box' : '');
      const url = imageURL(post.image);
      if (url) { const image = element('img', home ? 'dewford-event-photo' : ''); image.src = url; image.alt = post.title; image.loading = 'lazy'; inner.append(image); }
      const href = 'detail.html?id=' + encodeURIComponent(post.id);
      const heading = () => { const h = element(home ? 'h4' : 'h2', 'title'); const a = element('a', '', post.title); a.href = href; h.append(a); return h; };
      const content = element('div', home ? 'content' : '');
      content.append(element(post.date ? 'time' : 'span', 'dewford-event-category', post.date || ''), heading()); inner.append(content);
      const overlay = element('div', home ? 'overlay-content' : '');
      if (home) overlay.append(heading());
      overlay.append(element('p', 'text', post.excerpt || ''));
      const more = element('a', 'theme-btn btn-style-two dewford-event-button');
      more.append(element('span', 'btn-title', '자세히 보기'));
      const arrow = element('i', 'icon fa-light fa-arrow-right');
      arrow.setAttribute('aria-hidden', 'true');
      more.append(arrow); more.href = href; overlay.append(more);
      inner.append(overlay); card.append(inner);
      if (home) {
        const slide = element('div', 'swiper-slide'); slide.append(card); list.append(slide);
      } else list.append(card);
    }
    if (home && list.dataset.eventLayout === 'service-four') {
      const slider = list.parentElement;
      slider.swiper?.destroy(true, true);
      const section = list.closest('.service-section-four');
      new Swiper(slider, {
        speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000,
        slidesPerView: 1, spaceBetween: 0, rewind: true, watchOverflow: true,
        autoplay: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {
          delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true
        },
        breakpoints: {768:{slidesPerView:2},1400:{slidesPerView:3},1599:{slidesPerView:4}},
        navigation: {
          prevEl: section.querySelector('.slider-prev'),
          nextEl: section.querySelector('.slider-next')
        }
      });
      return;
    }
    if (home && window.Swiper && list.dataset.eventLayout !== 'journal') {
      new Swiper('.service-two-slider', {
        speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500,
        loop: posts.length > 4, slidesPerView: 1, spaceBetween: 0,
        autoplay: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        breakpoints: {768:{slidesPerView:2},992:{slidesPerView:3},1400:{slidesPerView:4}},
        keyboard: {enabled:true,onlyInViewport:true}
      });
    }
  } catch (error) {
    showStatus(error.status === 404 ? '새로운 소식을 준비하고 있습니다.' : '소식을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.');
  }
  }
  render();window.addEventListener('dewford:content-changed',event=>{if(event.detail?.board==='events')render();});
})();
