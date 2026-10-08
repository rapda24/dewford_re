/* Template news grid/details backed by the shared Cloudflare events feed. */
(() => {
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
  let observer, sentinel, pendingFrame, visibleCount=0;
  async function render(){
  try {
    let data;
    try { ({ data } = await DewfordAPI.content('events')); }
    catch (error) { if (!window.DEWFORD_EVENT_SAMPLES?.length) throw error; }
    const source = Array.isArray(data?.posts) ? data.posts : window.DEWFORD_EVENT_SAMPLES || [];
    let posts = source.filter(p => p && typeof p.id === 'string' && typeof p.title === 'string')
      .sort((a,b) => data?.ordered ? 0 : String(b.date || '').localeCompare(String(a.date || '')));
    if (list) {
      const query = new URLSearchParams(location.search).get('q')?.trim().toLowerCase();
      if (query) posts = posts.filter(post => [post.title,post.excerpt].join(' ').toLowerCase().includes(query));
      observer?.disconnect();if(pendingFrame)cancelAnimationFrame(pendingFrame);sentinel?.remove();
      list.replaceChildren();
      if (!posts.length) list.textContent = '새로운 소식을 준비하고 있습니다.';
      const makeCard = post => {
        const card = node('div', 'news-block-four col-lg-4 col-md-6');
        const block = node('div', 'inner-block');
        const imageBox = node('div', 'image-box'); const imageInner = node('div', 'inner-box');
        const figure = node('figure', 'image'); const imageLink = link(post); imageLink.replaceChildren(); const img = photo(post);
        if (img) {
          imageLink.append(img);
          if (list.dataset.eventLayout !== 'photo-title') {
            const clone = img.cloneNode(); clone.alt = ''; clone.setAttribute('aria-hidden','true'); imageLink.append(clone);
          }
        }
        imageLink.setAttribute('aria-label',post.title); figure.append(imageLink); imageInner.append(figure); imageBox.append(imageInner);
        const content = node('div', 'content-box'); const inner = node('div','inner-box');
        const title = node('h4','title'); title.append(link(post));
        if (list.dataset.eventLayout === 'photo-title') {
          inner.append(title);
          content.append(inner);
        } else {
          const excerpt = node('div','text'); excerpt.append(node('span','dewford-event-excerpt',post.excerpt || ''));
          inner.append(title,excerpt);
          content.append(inner);
        }
        const more = link(post,'read-more','자세히 보기 '); const arrow = node('i','icon fa fa-solid fa-arrow-right'); arrow.setAttribute('aria-hidden','true'); more.append(arrow);
        more.setAttribute('aria-label', post.title + ' 자세히 보기');
        content.append(more);
        block.append(imageBox,content); card.append(block); return card;
      };
      let shown=0;
      const columns=()=>Math.max(1,getComputedStyle(list).gridTemplateColumns.split(' ').length);
      const append=count=>{const end=Math.min(posts.length,shown+count);for(;shown<end;shown++)list.append(makeCard(posts[shown]));visibleCount=shown;if(sentinel)sentinel.hidden=shown>=posts.length;};
      append(Math.max(9,visibleCount));
      if(shown<posts.length){
        sentinel=node('div','dewford-event-load-more');const more=node('button','','더 보기');more.type='button';sentinel.append(more);list.after(sentinel);
        const target=sentinel;
        const nextRow=()=>{if(target!==sentinel||shown>=posts.length)return;append(columns());if(shown>=posts.length){observer?.disconnect();return;}pendingFrame=requestAnimationFrame(()=>{const r=target.getBoundingClientRect();if(r.top<innerHeight+200&&r.bottom>0)nextRow();});};
        more.addEventListener('click',nextRow);
        if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))nextRow();},{rootMargin:'200px 0px'});observer.observe(target);}
      }
      return;
    }
    if (!detail) return;
    const post = posts.find(p => p.id === id);
    const title = detail.querySelector('[data-detail-title]');
    detail.querySelector('[data-detail-image]').querySelectorAll(':scope > img, :scope > .dewford-article-image-trigger').forEach(el=>el.remove());
    for(const target of ['[data-detail-meta]','[data-detail-body]','[data-detail-neighbors]','[data-detail-related]'])detail.querySelector(target).replaceChildren();
    detail.querySelectorAll('.dewford-event-gallery').forEach(el=>el.remove());
    if (!post) { title.textContent = '게시물을 찾을 수 없습니다.'; detail.querySelector('.sidebar').hidden = true; return; }
    detail.querySelector('.sidebar').hidden=false;
    title.textContent = post.title; document.title = post.title + ' | Dewford';
    const badge = detail.querySelector('[data-detail-date]');
    if (badge) {
      const date = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(post.date || '');
      badge.hidden = false;
      badge.querySelector('.day').textContent = date ? date[3] : '날짜';
      badge.querySelector('.month').textContent = date ? Number(date[2]) + '월' : '미등록';
      badge.setAttribute('aria-label', date ? `${date[1]}년 ${Number(date[2])}월 ${Number(date[3])}일` : '날짜 미등록');
    }
    const img = photo(post); if (img) { img.loading = 'eager'; detail.querySelector('[data-detail-image]').prepend(imageTrigger(img)); }
    const meta = detail.querySelector('[data-detail-meta]');
    if (post.date) { const li = node('li'); const time = node('time','',post.date); li.append(time); meta.append(li); }
    window.DEWFORD_RICH_TEXT.render(detail.querySelector('[data-detail-body]'),post.content,post.body || post.excerpt || '');
    const gallery = node('div', 'dewford-event-gallery');
    for (const src of (post.gallery || [])) {
      const image = photo({image:src,title:post.title}); if (!image) continue;
      image.style.cssText = 'display:block;max-width:100%;height:auto;margin:0;';
      const trigger=imageTrigger(image);trigger.style.margin='24px 0';gallery.append(trigger);
    }
    if (gallery.childElementCount) detail.querySelector('[data-detail-body]').after(gallery);
    const index = posts.indexOf(post); const neighbors = detail.querySelector('[data-detail-neighbors]');
    const navigation=[{item:posts[index-1],label:'이전 글',icon:'fa-chevron-left'},{href:'event.html',label:'목록',icon:'fa-list'},{item:posts[index+1],label:'다음 글',icon:'fa-chevron-right'}];
    navigation.forEach(({item,href,label,icon})=>{
      const button=node(item||href?'a':'span','dewford-detail-nav-button');
      if(item)button.href='detail.html?id='+encodeURIComponent(item.id);else if(href)button.href=href;else button.setAttribute('aria-disabled','true');
      const symbol=node('i','fas '+icon);symbol.setAttribute('aria-hidden','true');button.append(symbol,node('span','',label));neighbors.append(button);
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
  }
  function imageTrigger(img){const wrapper=node('span','dewford-article-image-trigger');wrapper.append(img);img.dataset.dewfordArticleImage='';img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-haspopup','dialog');img.setAttribute('aria-label',(img.alt||'게시글 이미지')+' 크게 보기');return wrapper;}
  render();window.addEventListener('dewford:content-changed',event=>{if(event.detail?.board==='events')render();});
})();
