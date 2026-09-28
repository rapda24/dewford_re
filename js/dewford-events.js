/* Both the home preview and event.html read the same published events JSON. */
(async () => {
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
    const box = element('div', 'dewford-events-status', message);
    if (home) {
      const link = element('a', '', '이벤트 게시판 보기 ↗');
      link.href = 'event.html'; box.append(link);
    }
    list.replaceChildren(box);
  };
  try {
    let data;
    try { ({ data } = await DewfordAPI.content('events')); }
    catch (error) {
      if (!window.DEWFORD_EVENT_SAMPLES?.length) throw error;
    }
    if (!Array.isArray(data?.posts) || !data.posts.length) {
      data = { posts: window.DEWFORD_EVENT_SAMPLES || [] };
    }
    const posts = (Array.isArray(data?.posts) ? data.posts : []).filter(post =>
      post && typeof post.id === 'string' && typeof post.title === 'string'
    ).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    const id = !home && new URLSearchParams(location.search).get('id');
    if (id) {
      const post = posts.find(post => post.id === id);
      if (!post) { showStatus('게시물을 찾을 수 없습니다.'); return; }
      list.hidden = true; list.style.display = 'none';
      const detail = document.querySelector('[data-event-detail]');
      detail.hidden = false; detail.className = 'dewford-event-detail';
      const back = element('a', 'dewford-text-link', '← 전체 소식'); back.href = 'event.html';
      detail.append(back, element('h2', '', post.title), element(post.date ? 'time' : 'span', '', post.date || post.category || ''));
      const url = imageURL(post.image);
      if (url) { const image = element('img'); image.src = url; image.alt = post.title; detail.append(image); }
      detail.append(element('div', 'dewford-event-body', post.body || post.excerpt || ''));
      document.title = post.title + ' | Dewford';
      return;
    }
    if (!posts.length) { showStatus('새로운 소식을 준비하고 있습니다.'); return; }
    list.replaceChildren();
    for (const post of posts) {
      const card = element('article', home ? 'service-block-two' : 'dewford-board-card');
      const inner = element('div', home ? 'inner-box' : '');
      const url = imageURL(post.image);
      if (url) { const image = element('img', home ? 'dewford-event-photo' : ''); image.src = url; image.alt = post.title; image.loading = 'lazy'; inner.append(image); }
      const href = 'event.html?id=' + encodeURIComponent(post.id);
      const heading = () => { const h = element(home ? 'h4' : 'h2', 'title'); const a = element('a', '', post.title); a.href = href; h.append(a); return h; };
      const content = element('div', home ? 'content' : '');
      content.append(element(post.date ? 'time' : 'span', 'dewford-event-category', post.date || post.category || ''), heading()); inner.append(content);
      const overlay = element('div', home ? 'overlay-content' : '');
      if (home) overlay.append(heading());
      overlay.append(element('p', 'text', post.excerpt || ''));
      const more = element('a', 'dewford-text-link', '자세히 보기 ↗'); more.href = href; overlay.append(more);
      inner.append(overlay); card.append(inner);
      if (home) {
        const slide = element('div', 'swiper-slide'); slide.append(card); list.append(slide);
      } else list.append(card);
    }
    if (home && window.Swiper) {
      new Swiper('.service-two-slider', {
        speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500,
        loop: posts.length > 4, slidesPerView: 1, spaceBetween: 0,
        breakpoints: {768:{slidesPerView:2},992:{slidesPerView:3},1400:{slidesPerView:4}},
        keyboard: {enabled:true,onlyInViewport:true}
      });
    }
  } catch (error) {
    showStatus(error.status === 404 ? '새로운 소식을 준비하고 있습니다.' : '소식을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.');
  }
})();
