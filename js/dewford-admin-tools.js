/* Management buttons appear only after the server confirms an admin session. */
(async () => {
  if (!window.DewfordAdmin) return;
  let auth;
  try {auth=await DewfordAdmin.session();} catch {return;}
  if (!auth.authenticated) return;
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='css/dewford-admin-tools.css';document.head.append(stylesheet);
  let state;
  try {state=await DewfordAdmin.content();} catch {return;}
  const toolbar=(container,board,date)=>{
    const existing=container.querySelector(':scope > .dewford-admin-toolbar');if(existing){const create=existing.querySelector('a');const next='admin.html?board='+board+'&new=1'+(date?'&date='+encodeURIComponent(date):'');if(create.getAttribute('href')!==next)create.setAttribute('href',next);return;}
    const tools=document.createElement('div');tools.className='dewford-admin-tools dewford-admin-toolbar';
    const create=document.createElement('a');create.href='admin.html?board='+board+'&new=1'+(date?'&date='+encodeURIComponent(date):'');create.textContent='글쓰기';
    const manage=document.createElement('a');manage.href='admin.html?board='+board;manage.textContent='게시판 관리';tools.append(create,manage);container.prepend(tools);
  };
  function buttons(container,board,id){
    if(!id||container.querySelector(':scope > .dewford-admin-tools'))return;
    const item=state.boards[board].find(item=>item.id===id);if(!item)return;
    const tools=document.createElement('div');tools.className='dewford-admin-tools';
    const edit=document.createElement('a');edit.href='admin.html?board='+board+'&edit='+encodeURIComponent(id);edit.textContent='수정';tools.append(edit);
    const move=document.createElement('a');move.href='admin.html?board='+board+'&move='+encodeURIComponent(id);move.textContent='이동';tools.append(move);
    for(const [label,direction] of [['↑',-1],['↓',1]]){const reorder=document.createElement('button');reorder.type='button';reorder.textContent=label;reorder.setAttribute('aria-label',label==='↑'?'위로 이동':'아래로 이동');reorder.addEventListener('click',async()=>{reorder.disabled=true;try{await DewfordAdmin.mutate({action:'reorder',board,id,direction,revision:state.revision});location.reload();}catch{alert('순서를 변경하지 못했습니다. 페이지를 새로고침해 주세요.');reorder.disabled=false;}});tools.append(reorder);}
    const remove=document.createElement('button');remove.type='button';remove.textContent='삭제';remove.addEventListener('click',async()=>{
      if(!confirm(`“${item.title}” 항목을 삭제할까요?`))return;
      remove.disabled=true;
      try{await DewfordAdmin.mutate({action:'delete',board,id,revision:state.revision});location.reload();}catch{alert('삭제하지 못했습니다. 로그인 상태와 최신 내용을 확인하려면 페이지를 새로고침해 주세요.');remove.disabled=false;}
    });tools.append(remove);container.append(tools);
  }
  function sync(){
    const calendar=document.querySelector('[data-dewford-calendar]');
    if(calendar){const board=calendar.dataset.dewfordCalendar;toolbar(calendar,board,document.querySelector('[data-date][aria-pressed="true"]')?.dataset.date);calendar.querySelectorAll('[data-calendar-id]').forEach(row=>{let id=row.dataset.calendarId;if(!id){const date=document.querySelector('[data-date][aria-pressed="true"]')?.dataset.date;const matches=state.boards[board].filter(item=>item.title===row.querySelector('strong')?.textContent&&item.date===date);if(matches.length===1)id=matches[0].id;}buttons(row,board,id);});}
    const list=document.querySelector('[data-event-list]');
    if(list){toolbar(list.closest('section')||list.parentElement,'events');list.querySelectorAll('a[href*="detail.html?id="]').forEach(link=>{const id=new URL(link.href).searchParams.get('id');const card=link.closest('.news-block-four,.team-block-two,.service-block-three,.dr-news-card,.dewford-board-card,.service-block-two');if(card)buttons(card,'events',id);});}
    const detail=document.querySelector('[data-detail-title]');
    if(detail){const main=document.querySelector('#main-content');toolbar(main,'events');buttons(detail.parentElement,'events',new URLSearchParams(location.search).get('id'));}
  }
  sync();let scheduled=false;
  new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();});}).observe(document.querySelector('#main-content'),{childList:true,subtree:true});
})();
