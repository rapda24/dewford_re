/* In-page editing is available only after the server confirms the admin session. */
(async()=>{
  if(!window.DewfordAdmin)return;
  let auth,state;
  try{auth=await DewfordAdmin.session();if(!auth.authenticated)return;state=await DewfordAdmin.content();}catch{return;}
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='css/dewford-admin-tools.css';document.head.append(stylesheet);
  const composer=document.createElement('dialog');composer.className='dewford-admin-composer';composer.setAttribute('aria-label','게시글 편집');
  const frame=document.createElement('iframe');frame.title='게시글 편집창';composer.append(frame);document.body.append(composer);
  let previousOverflow,opener,refreshing=false;
  function openEditor(board,action,extra={}){
    opener=document.activeElement;const params=new URLSearchParams({embedded:'1',board,...extra});params.set(action,'1');
    if(action==='edit'||action==='move')params.set(action,extra.id);
    frame.src='admin.html?'+params;previousOverflow=document.documentElement.style.overflow;composer.showModal();document.documentElement.style.overflow='hidden';
  }
  composer.addEventListener('close',()=>{frame.src='about:blank';document.documentElement.style.overflow=previousOverflow||'';if(opener?.isConnected)opener.focus({preventScroll:true});});
  composer.addEventListener('click',event=>{if(event.target!==composer)return;const r=composer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)composer.close();});
  const errorText=error=>error.status===401?'로그인이 만료되었습니다. 다시 로그인해 주세요.':error.status===409?'다른 화면에서 내용이 변경되었습니다. 최신 목록을 확인한 뒤 다시 시도해 주세요.':'요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  async function updateViews(board){
    state=await DewfordAdmin.content();document.querySelectorAll('.dewford-admin-tools:not(.dewford-admin-toolbar)').forEach(el=>el.remove());
    window.dispatchEvent(new CustomEvent('dewford:content-changed',{detail:{board}}));sync();
  }
  window.addEventListener('message',async event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.source!=='dewford-editor')return;
    const data=event.data;
    if(data.type==='close'){if(composer.open)composer.close();}
    else if(data.type==='saved'&&!refreshing){refreshing=true;try{await updateViews(data.board);}catch(error){alert(errorText(error));}finally{refreshing=false;}}
    else if(data.type==='session-expired'){if(composer.open)composer.close();alert('로그인이 만료되었습니다. 다시 로그인한 뒤 이용해 주세요.');}
    else if(data.type==='error'){if(composer.open)composer.close();alert(data.message||'편집창을 불러오지 못했습니다.');}
  });
  function toolbar(container,board,date){
    const existing=container.querySelector(':scope > .dewford-admin-toolbar');
    if(existing){const create=existing.querySelector('button');if(create.dataset.date!==(date||''))create.dataset.date=date||'';return;}
    const tools=document.createElement('div');tools.className='dewford-admin-tools dewford-admin-toolbar';
    const create=document.createElement('button');create.type='button';create.textContent='글쓰기';create.dataset.date=date||'';
    create.addEventListener('click',()=>{const date=container.querySelector('[data-date][aria-pressed="true"]')?.dataset.date||create.dataset.date;openEditor(board,'new',date?{date}:{});});
    const manage=document.createElement('a');manage.href='admin.html?board='+board;manage.textContent='게시판 관리';tools.append(create,manage);container.prepend(tools);
  }
  function buttons(container,board,id){
    if(!id||container.querySelector(':scope > .dewford-admin-tools'))return;
    const item=state.boards[board].find(item=>item.id===id);if(!item)return;
    const tools=document.createElement('div');tools.className='dewford-admin-tools';
    const add=(label,fn)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>fn(button));tools.append(button);return button;};
    add('수정',()=>openEditor(board,'edit',{id}));add('이동',()=>openEditor(board,'move',{id}));
    for(const [label,direction]of[['↑',-1],['↓',1]]){
      const button=add(label,async button=>{button.disabled=true;try{await DewfordAdmin.mutate({action:'reorder',board,id,direction,revision:state.revision});await updateViews(board);}catch(error){alert(errorText(error));button.disabled=false;}});
      button.setAttribute('aria-label',direction<0?'위로 이동':'아래로 이동');
    }
    const remove=add('삭제',async button=>{if(!confirm(`“${item.title}” 항목을 삭제할까요?`))return;button.disabled=true;try{await DewfordAdmin.mutate({action:'delete',board,id,revision:state.revision});await updateViews(board);}catch(error){alert(errorText(error));button.disabled=false;}});remove.className='dewford-admin-delete';container.append(tools);
  }
  function sync(){
    const calendar=document.querySelector('[data-dewford-calendar]');
    if(calendar){const board=calendar.dataset.dewfordCalendar;const selected=calendar.querySelector('[data-date][aria-pressed="true"]')?.dataset.date;toolbar(calendar,board,selected);calendar.querySelectorAll('[data-calendar-id]').forEach(row=>{let id=row.dataset.calendarId;if(!id){const matches=state.boards[board].filter(item=>item.title===row.querySelector('strong')?.textContent&&item.date===selected);if(matches.length===1)id=matches[0].id;}buttons(row,board,id);});}
    const list=document.querySelector('[data-event-list]');
    if(list){toolbar(list.closest('.auto-container')||list.closest('section')||list.parentElement,'events');list.querySelectorAll('a[href*="detail.html?id="]').forEach(link=>{const id=new URL(link.href).searchParams.get('id');const card=link.closest('.news-block-four,.team-block-two,.service-block-three,.dr-news-card,.dewford-board-card,.service-block-two');if(card)buttons(card,'events',id);});}
    const detail=document.querySelector('[data-detail-title]');
    if(detail){toolbar(document.querySelector('#main-content'),'events');buttons(detail.parentElement,'events',new URLSearchParams(location.search).get('id'));}
  }
  sync();let scheduled=false;
  const main=document.querySelector('#main-content');if(main)new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();});}).observe(main,{childList:true,subtree:true});
})();
