(() => {
  const $ = selector => document.querySelector(selector);
  const api = window.DewfordAdmin;
  let page = 1, query = '', busy = false;
  const node = (tag, text, className) => {const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;};
  const date = value => new Date(value).toLocaleString('ko-KR', {timeZone:'Asia/Seoul',hour12:false});
  const login = () => location.replace('admin-login.html?board=inquiries');
  function detail(item) {
    const fields=$('#inquiry-fields');fields.replaceChildren();
    for(const [label,value] of [['접수일 (한국 시간)',date(item.created_at)],['학부모 성함',item.name],['연락처',item.phone],['이메일',item.email||'미입력'],['관심 과정',item.program],['상담 내용',item.message||'미입력'],['개인정보 수집·이용 동의',item.consent===1?'동의':'미동의']]) {
      fields.append(node('dt',label),node('dd',value));
    }
    $('#inquiry-detail').showModal();
  }
  async function load() {
    if(busy)return;busy=true;
    document.querySelectorAll('#inquiry-refresh,#inquiry-prev,#inquiry-next,#inquiry-search-form button').forEach(el=>el.disabled=true);
    $('#admin-status').textContent='상담 접수 내역을 불러오고 있습니다.';
    try {
      const data=await api.inquiries({page,q:query});
      const list=$('#admin-list');list.replaceChildren();
      $('#admin-count').textContent=`총 ${data.total}건`;
      if(!data.items.length)list.append(node('p',query?'검색 결과가 없습니다.':'접수된 상담 신청이 없습니다.','admin-empty'));
      data.items.forEach(item=>{
        const row=node('article','','admin-item inquiry-item');
        const copy=node('div','','admin-item-copy');copy.append(node('h2',item.name+' · '+item.program));
        const meta=node('div','','admin-item-meta');meta.append(node('span',date(item.created_at)),node('span',item.phone));copy.append(meta);
        const actions=node('div','','admin-item-actions');const button=node('button','상세 보기','admin-action-edit');button.type='button';button.setAttribute('aria-label',item.name+' 상담 상세 보기');button.addEventListener('click',()=>detail(item));actions.append(button);row.append(copy,actions);list.append(row);
      });
      $('#inquiry-page').textContent=`${page} / ${Math.max(1,Math.ceil(data.total/data.pageSize))} 페이지`;
      $('#inquiry-prev').disabled=page<=1;$('#inquiry-next').disabled=page*data.pageSize>=data.total;
      $('#admin-status').textContent='';
    } catch(error) {
      if(error.status===401){login();return;}
      $('#admin-list').replaceChildren();$('#admin-count').textContent='';$('#inquiry-page').textContent='';
      $('#admin-status').textContent=error.message==='API_NOT_CONNECTED'?'Cloudflare 개발 서버 또는 배포된 사이트에서 이용해 주세요.':'접수 내역을 불러오지 못했습니다. 데이터베이스 연결을 확인하고 새로고침해 주세요.';
    } finally {
      busy=false;$('#inquiry-refresh').disabled=false;$('#inquiry-search-form button').disabled=false;
    }
  }
  $('#inquiry-search-form').addEventListener('submit',event=>{event.preventDefault();if(busy)return;query=$('#admin-search').value.trim();page=1;load();});
  $('#inquiry-refresh').addEventListener('click',()=>load());
  $('#inquiry-prev').addEventListener('click',()=>{if(!busy){page--;load();}});
  $('#inquiry-next').addEventListener('click',()=>{if(!busy){page++;load();}});
  for(const id of ['#inquiry-close','#inquiry-done'])$(id).addEventListener('click',()=>$('#inquiry-detail').close());
  $('#admin-logout').addEventListener('click',async()=>{try{await api.logout();login();}catch{$('#admin-status').textContent='로그아웃하지 못했습니다. 다시 시도해 주세요.';}});
  (async()=>{try{const auth=await api.session();if(!auth.authenticated){login();return;}$('#admin-auth-loading').hidden=true;$('#admin-workspace').hidden=false;await load();}catch{$('#admin-auth-loading').textContent='관리 화면에 연결하지 못했습니다. 페이지를 새로고침해 주세요.';}})();
})();
