/* Template news grid/details backed by the shared Cloudflare events feed. */
(async () => {
  const list = document.querySelector('[data-event-list="board"]');
  const detail = document.querySelector('[data-news-detail]');
  if (!list && !detail) return;
  const id = new URLSearchParams(location.search).get('id');
  const href = post => 'detail.html?id=' + encodeURIComponent(post.id);
  if (list && id) { location.replace('detail.html' + location.search); return; }
  const node = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  };
  const photo = post => {
    try {
      const url = new URL(post.image, location.href);
      if (!post.image || !['http:', 'https:'].includes(url.protocol)) return null;
      const img = node('img'); img.src = url.href; img.alt = post.title; img.loading = 'lazy'; return img;
    } catch { return null; }
  };
  const link = (post, cls, text) => { const a = node('a', cls, text || post.title); a.href = href(post); return a; };
  try {
    let data;
    try { ({ data } = await DewfordAPI.content('events')); }
    catch (error) { if (!window.DEWFORD_EVENT_SAMPLES?.length) throw error; }
    const source = Array.isArray(data?.posts) && data.posts.length ? data.posts : window.DEWFORD_EVENT_SAMPLES || [];
    let posts = source.filter(p => p && typeof p.id === 'string' && typeof p.title === 'string')
      .sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
    if (list) {
      const query = new URLSearchParams(location.search).get('q')?.trim().toLowerCase();
      if (query) posts = posts.filter(post => [post.title,post.category,post.excerpt].join(' ').toLowerCase().includes(query));
      list.replaceChildren();
      if (!posts.length) list.textContent = '새로운 소식을 준비하고 있습니다.';
      posts.forEach(post => {
        const card = node('div', 'news-block-four col-lg-4 col-md-6');
        const block = node('div', 'inner-block');
        const imageBox = node('div', 'image-box'); const imageInner = node('div', 'inner-box');
        const figure = node('figure', 'image'); const imageLink = link(post); imageLink.replaceChildren(); const img = photo(post);
        if (img) { const clone = img.cloneNode(); clone.alt = ''; clone.setAttribute('aria-hidden','true'); imageLink.append(img, clone); }
        imageLink.setAttribute('aria-label',post.title); figure.append(imageLink); imageInner.append(figure); imageBox.append(imageInner);
        const content = node('div', 'content-box'); const inner = node('div','inner-box');
        const title = node('h4','title'); title.append(link(post));
        const excerpt = node('div','text'); excerpt.append(node('span','dewford-event-excerpt',post.excerpt || ''));
        const category = node('p', 'dewford-story-category', post.category || 'DEWFORD LIFE');
        inner.append(category,title,excerpt);
        const more = link(post,'read-more','자세히 보기 '); const arrow = node('i','icon fa fa-solid fa-arrow-right'); arrow.setAttribute('aria-hidden','true'); more.append(arrow);
        content.append(inner,more); block.append(imageBox,content); card.append(block); list.append(card);
      });
      return;
    }
    if (!detail) return;
    const post = posts.find(p => p.id === id);
    const title = detail.querySelector('[data-detail-title]');
    if (!post) { title.textContent = '게시물을 찾을 수 없습니다.'; detail.querySelector('.sidebar').hidden = true; return; }
    title.textContent = post.title; document.title = post.title + ' | Dewford';
    const badge = detail.querySelector('[data-detail-date]');
    if (badge) {
      const date = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(post.date || '');
      badge.hidden = false;
      badge.querySelector('.day').textContent = date ? date[3] : '날짜';
      badge.querySelector('.month').textContent = date ? Number(date[2]) + '월' : '미등록';
      badge.setAttribute('aria-label', date ? `${date[1]}년 ${Number(date[2])}월 ${Number(date[3])}일` : '날짜 미등록');
    }
    const img = photo(post); if (img) { img.loading = 'eager'; detail.querySelector('[data-detail-image]').prepend(img); }
    const meta = detail.querySelector('[data-detail-meta]');
    const categoryItem = node('li');
    const categoryLink = node('a', '', post.category || 'DEWFORD EVENTS');
    categoryLink.href = post.category ? 'event.html?q=' + encodeURIComponent(post.category) : 'event.html';
    const categoryIcon = node('i', 'fas fa-folder-open');
    categoryIcon.setAttribute('aria-hidden', 'true');
    categoryLink.prepend(categoryIcon, document.createTextNode(' '));
    categoryItem.append(categoryLink); meta.append(categoryItem);
    if (post.date) { const li = node('li'); const time = node('time','',post.date); li.append(time); meta.append(li); }
    detail.querySelector('[data-detail-body]').textContent = post.body || post.excerpt || '';
    const postTags = detail.querySelector('[data-detail-post-tags]');
    if (postTags && post.category) {
      const tag = node('a','',post.category);
      tag.href = 'event.html?q=' + encodeURIComponent(post.category);
      postTags.append(tag);
    }
    const index = posts.indexOf(post); const neighbors = detail.querySelector('[data-detail-neighbors]');
    [[posts[index-1],'prev','이전 소식'],[posts[index+1],'next','다음 소식']].forEach(([item,cls,label]) => {
      if (!item) return; const div = node('div',cls); const a = link(item); a.prepend(node('span','dewford-neighbor-label',label)); div.append(a); neighbors.append(div);
    });
    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
    categories.forEach(category => {
      const li = node('li'); const a = node('a','',category); a.href = 'event.html?q=' + encodeURIComponent(category);
      const categoryIcons = { 'FIELD TRIP': 'fa-map-location-dot', MUSIC: 'fa-music', 'SCHOOL LIFE': 'fa-school', LITERACY: 'fa-book-open', COMMUNITY: 'fa-users' };
      const icon = node('i', 'fas ' + (categoryIcons[category.toUpperCase()] || 'fa-folder-open') + ' dewford-category-icon');
      icon.setAttribute('aria-hidden','true'); a.prepend(icon);
      a.append(node('span','lnr-icon-arrow-right')); li.append(a); detail.querySelector('[data-detail-categories]').append(li);
      const tag = node('a','',category); tag.href = a.href; detail.querySelector('[data-detail-tags]').append(tag);
    });
    const related = detail.querySelector('[data-detail-related]');
    posts.filter(p => p.id !== id).slice(0,3).forEach(item => {
      const li = node('li'); const image = node('div','sidebar__post-image'); const img = photo(item);
      if (img) { const a=link(item);a.replaceChildren(img);a.setAttribute('aria-label',item.title);image.append(a); }
      const content=node('div','sidebar__post-content');const heading=node('h3');heading.append(link(item));content.append(heading);li.append(image,content);related.append(li);
    });
  } catch {
    const message = '소식을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.';
    if (list) list.textContent = message;
    if (detail) detail.querySelector('[data-detail-title]').textContent = message;
  }
})();
