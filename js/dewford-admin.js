(() => {
  const $ = selector => document.querySelector(selector);
  const api = window.DewfordAdmin;
  const names = {events:'이벤트 게시판',preschool:'유치부 캘린더',elementary:'초등부 캘린더',popups:'팝업 관리'};
  const params = new URLSearchParams(location.search);
  let board = names[params.get('board')] ? params.get('board') : 'events';
  let state, movingId, busy = false;
  const editor = $('#admin-editor'), form = $('#admin-edit-form');
  const errors = {ADMIN_NOT_CONFIGURED:'관리자 계정이 아직 설정되지 않았습니다. 관리자 설정 안내를 확인해 주세요.',DATABASE_NOT_CONFIGURED:'데이터베이스 연결이 필요합니다.',DATABASE_UNAVAILABLE:'저장 서버에 연결할 수 없습니다. 데이터베이스 설정과 마이그레이션을 확인해 주세요.',API_NOT_CONNECTED:'Cloudflare 개발 서버 또는 배포된 사이트에서 이용해 주세요.',INVALID_CREDENTIALS:'아이디 또는 비밀번호가 일치하지 않습니다.',TOO_MANY_ATTEMPTS:'로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.',CONTENT_CHANGED:'다른 화면에서 내용이 변경되었습니다. 목록을 새로 불러왔습니다. 다시 확인해 주세요.',UNAUTHORIZED:'로그인이 만료되었습니다. 다시 로그인해 주세요.',MEDIA_NOT_CONFIGURED:'이미지 업로드 저장소가 설정되지 않았습니다. 이미지 주소를 직접 입력하거나 R2를 연결해 주세요.',UNSUPPORTED_IMAGE:'PNG, JPEG, WebP 파일만 사용할 수 있습니다.',PAYLOAD_TOO_LARGE:'파일은 5MB 이하로 업로드해 주세요.',INVALID_DATE:'날짜 또는 노출 기간을 확인해 주세요.',INVALID_URL:'이미지 또는 링크 주소를 확인해 주세요.',INVALID_INPUT:'입력한 내용을 확인해 주세요.',CSRF_INVALID:'세션을 새로 확인하려면 페이지를 새로고침해 주세요.'};
  const message = error => errors[error.message] || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  const node = (tag, text, cls) => {const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;};
  function imageURL(value) {if(typeof value!=='string'||!value.trim())return '';try {const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
  function loginView() {location.replace('admin-login.html'+location.search);}
  async function refresh() {state=await api.content();render();}
  function render() {
    $('#admin-auth-loading').hidden=true;$('#admin-workspace').hidden=false;$('#admin-logout').hidden=false;
    const descriptions={events:'아이들의 배움과 성장의 순간을 전합니다.',preschool:'유치부의 수업과 활동, 주요 일정을 관리합니다.',elementary:'초등 과정의 학습과 활동, 주요 일정을 관리합니다.',popups:'홈페이지에 표시할 안내 이미지와 노출 기간을 관리합니다.'};
    $('#admin-board-title').textContent=names[board];$('#admin-board-description').textContent=descriptions[board];
    const all=state.boards[board],published=all.filter(item=>item.published!==false).length;
    $('#admin-total').textContent=all.length;$('#admin-published').textContent=published;$('#admin-drafts').textContent=all.length-published;
    const publicLink=$('#admin-public-link');publicLink.href={events:'event.html',preschool:'preschool-calendar.html',elementary:'elementary-calendar.html',popups:'index.html'}[board];publicLink.textContent=board==='popups'?'홈페이지 보기 ↗':'게시판 보기 ↗';
    document.querySelectorAll('[data-board]').forEach(button=>{if(button.dataset.board===board)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    $('#admin-create').textContent=board==='popups'?'+ 팝업 등록':'+ 글쓰기';
    const query=$('#admin-search').value.trim().toLowerCase();const items=state.boards[board].filter(item=>item.title.toLowerCase().includes(query));
    $('#admin-count').textContent=`${items.length}개`;const list=$('#admin-list');list.replaceChildren();
    if(!items.length)list.append(node('p','등록된 항목이 없습니다.','admin-empty'));
    items.forEach(item=>{
      const row=node('article',null,'admin-item');
      const photo=node('div',null,'admin-item-photo');if(item.image&&imageURL(item.image)){const img=node('img');img.src=imageURL(item.image);img.alt='';img.loading='lazy';photo.append(img);}else photo.append(node('span','—'));row.append(photo);
      const copy=node('div',null,'admin-item-copy');copy.append(node('h2',item.title));
      const meta=node('div',null,'admin-item-meta');
      if(item.date)meta.append(node('span',item.date,'admin-item-date'));
      meta.append(node('span',item.published===false?'비공개':'공개','admin-badge'+(item.published===false?' is-draft':'')));
      if(board==='popups')meta.append(node('span',item.enabled?'사용 중':'사용 안 함','admin-badge'+(!item.enabled?' is-draft':'')));
      copy.append(meta);
      if(board==='popups')copy.append(node('p',`${item.startsAt?new Date(item.startsAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'시작 제한 없음'} → ${item.endsAt?new Date(item.endsAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'종료 제한 없음'}`,'admin-item-schedule'));
      row.append(copy);const actions=node('div',null,'admin-item-actions');
      const add=(label,fn)=>{const b=node('button',label,label==='수정'?'admin-action-edit':label==='삭제'?'admin-action-delete':'');b.type='button';if(label==='↑'||label==='↓')b.setAttribute('aria-label',label==='↑'?'위로 이동':'아래로 이동');b.disabled=busy;b.addEventListener('click',fn);actions.append(b);};
      add('수정',()=>edit(item));
      if(board!=='popups')add('이동',()=>move(item));
      add('↑',()=>mutation({action:'reorder',id:item.id,direction:-1}));add('↓',()=>mutation({action:'reorder',id:item.id,direction:1}));
      add('삭제',()=>{if(confirm(`“${item.title}” 항목을 삭제할까요?`))mutation({action:'delete',id:item.id});});
      row.append(actions);list.append(row);
    });
  }
  async function mutation(payload) {
    if(busy)return false;busy=true;render();$('#admin-status').textContent='저장 중입니다…';
    try {state=await api.mutate({...payload,board,revision:state.revision});$('#admin-status').textContent='저장했습니다.';return true;}
    catch(error){$('#admin-status').textContent=message(error);if(error.status===409)await refresh();if(error.status===401)loginView();return false;}
    finally{busy=false;if(state&& !$('#admin-workspace').hidden)render();}
  }
  const localTime=value=>value?new Date(Date.parse(value)+9*3600000).toISOString().slice(0,16):'';
  function edit(item={}) {
    form.reset();$('#admin-editor-status').textContent='';
    const popup=board==='popups';editor.classList.toggle('admin-popup-editor',popup);document.querySelector('[data-post-fields]').hidden=popup;document.querySelector('[data-popup-fields]').hidden=!popup;
    form.elements.date.required=!popup;form.elements.image.required=popup;
    $('#admin-editor-title').textContent=`${names[board]} ${item.id?'수정':'등록'}`;
    for(const key of ['id','title','image','excerpt','link'])form.elements[key].value=item[key]||'';
    form.elements.date.value=item.date||new Date().toLocaleDateString('en-CA');form.elements.body.value=item.body||item.description||'';
    form.elements.gallery.value=(item.gallery||[]).join('\n');form.elements.width.value=item.width||480;
    form.elements.startsAt.value=localTime(item.startsAt);form.elements.endsAt.value=localTime(item.endsAt);
    form.elements.enabled.checked=item.enabled!==false;form.elements.published.checked=item.published!==false;
    preview();editor.showModal();
  }
  function preview(){const img=$('#admin-image-preview'),url=imageURL(form.elements.image.value);img.hidden=!url;if(url)img.src=url;else img.removeAttribute('src');}
  $('#admin-image-upload').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;if(file.size>5*1024*1024){$('#admin-editor-status').textContent='파일은 5MB 이하로 선택해 주세요.';return;}
    const save=form.querySelector('[type=submit]');save.disabled=true;$('#admin-editor-status').textContent='이미지 업로드 중입니다…';
    try{const result=await api.upload(file);form.elements.image.value=result.url;preview();$('#admin-editor-status').textContent='이미지를 업로드했습니다. 저장 버튼을 눌러 적용해 주세요.';}catch(error){$('#admin-editor-status').textContent=message(error);}finally{save.disabled=false;}
  });
  form.elements.image.addEventListener('input',preview);
  document.querySelectorAll('[data-close-editor]').forEach(button=>button.addEventListener('click',()=>editor.close()));
  form.addEventListener('submit',async event=>{
    event.preventDefault();const data=Object.fromEntries(new FormData(form));const item={...data,published:form.elements.published.checked,enabled:form.elements.enabled.checked,gallery:data.gallery.split('\n').map(v=>v.trim()).filter(Boolean)};
    item.startsAt=data.startsAt?data.startsAt+':00+09:00':'';item.endsAt=data.endsAt?data.endsAt+':00+09:00':'';
    const saved=await mutation({action:'save',id:data.id||undefined,item});if(saved)editor.close();else $('#admin-editor-status').textContent=$('#admin-status').textContent;
  });
  function move(item){movingId=item.id;const moveForm=$('#admin-move-form');moveForm.elements.target.replaceChildren();for(const key of ['events','preschool','elementary']){if(key===board)continue;const option=node('option',names[key]);option.value=key;moveForm.elements.target.append(option);}moveForm.elements.date.value=item.date||'';$('#admin-move-status').textContent='';$('#admin-move').showModal();}
  $('#admin-move-cancel').addEventListener('click',()=>$('#admin-move').close());
  $('#admin-move-form').addEventListener('submit',async event=>{event.preventDefault();const fields=Object.fromEntries(new FormData(event.target));if(await mutation({action:'move',id:movingId,...fields}))$('#admin-move').close();else $('#admin-move-status').textContent=$('#admin-status').textContent;});
  $('#admin-create').addEventListener('click',()=>edit());$('#admin-search').addEventListener('input',render);
  document.querySelectorAll('[data-board]').forEach(button=>button.addEventListener('click',()=>{if(busy)return;board=button.dataset.board;$('#admin-search').value='';history.replaceState(null,'','admin.html?board='+board);render();}));
  $('#admin-logout').addEventListener('click',async()=>{try{await api.logout();state=null;loginView();$('#admin-status').textContent='로그아웃했습니다.';}catch(error){$('#admin-status').textContent=message(error);}});
  function openRequested(){const moveId=params.get('move');if(moveId){const item=state.boards[board].find(i=>i.id===moveId);if(item&&board!=='popups')move(item);return;}const id=params.get('edit');if(id){const item=state.boards[board].find(i=>i.id===id);if(item)edit(item);}else if(params.get('new')==='1'){edit();if(params.get('date'))form.elements.date.value=params.get('date');}}
  (async()=>{try{const auth=await api.session();if(auth.authenticated){await refresh();openRequested();}else loginView();}catch(error){$('#admin-auth-loading').textContent=message(error);}})();
})();
