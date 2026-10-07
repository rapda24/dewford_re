(() => {
  const $ = selector => document.querySelector(selector);
  const api = window.DewfordAdmin;
  let page = 1, query = '', busy = false, items = [], total = 0, current = null;
  const selected = new Set();
  const stages = {received:'접수', contacting:'연락 중', scheduled:'상담 예약', completed:'상담 완료'};
  const node = (tag, text, className) => {const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;};
  const date = value => new Date(value).toLocaleString('ko-KR', {timeZone:'Asia/Seoul',hour12:false});
  const login = () => location.replace('admin-login.html?board=inquiries');
  function selection() {
    $('#inquiry-selected').textContent=`${selected.size}건 선택`;
    $('#inquiry-selected-status').disabled=busy||!selected.size;$('#inquiry-selected-delete').disabled=busy||!selected.size;
    const all=$('#inquiry-select-all');all.checked=items.length>0&&selected.size===items.length;all.indeterminate=selected.size>0&&selected.size<items.length;
  }
  function options(select) {for(const [value,label] of Object.entries(stages)){const option=node('option',label);option.value=value;select.append(option);}}
  options($('#inquiry-bulk-status'));options($('#inquiry-detail-stage'));
  function detail(item) {
    current=item;$('#inquiry-detail-stage').value=item.status;$('#inquiry-detail-status').textContent='';
    const fields=$('#inquiry-fields');fields.replaceChildren();
    for(const [label,value] of [['상담 상태',stages[item.status]],['접수일 (한국 시간)',date(item.created_at)],['학부모 성함',item.name],['연락처',item.phone],['이메일',item.email||'미입력'],['관심 과정',item.program],['상담 내용',item.message||'미입력'],['개인정보 수집·이용 동의',item.consent===1?'동의':'미동의']]) {
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
      items=data.items;total=data.total;selected.clear();
      if(page>1&&!items.length){page=Math.max(1,Math.ceil(total/data.pageSize));busy=false;return load();}
      const list=$('#admin-list');list.replaceChildren();
      $('#admin-count').textContent=`총 ${data.total}건`;
      if(!data.items.length)list.append(node('p',query?'검색 결과가 없습니다.':'접수된 상담 신청이 없습니다.','admin-empty'));
      data.items.forEach(item=>{
        const row=node('article','','admin-item inquiry-item');
        const check=node('input','');check.type='checkbox';check.className='inquiry-row-check';check.setAttribute('aria-label',item.name+' 상담 선택');check.addEventListener('change',()=>{check.checked?selected.add(item.id):selected.delete(item.id);selection();});
        const copy=node('div','','admin-item-copy');const title=node('button',item.name+' · '+item.program,'inquiry-open');title.type='button';title.addEventListener('click',()=>detail(item));copy.append(title,node('span',stages[item.status],'inquiry-stage'));
        const meta=node('div','','admin-item-meta');meta.append(node('span',date(item.created_at)),node('span',item.phone));copy.append(meta);
        const actions=node('div','','admin-item-actions');const button=node('button','상세 보기','admin-action-edit');button.type='button';button.setAttribute('aria-label',item.name+' 상담 상세 보기');button.addEventListener('click',()=>detail(item));const remove=node('button','삭제','inquiry-delete');remove.type='button';remove.addEventListener('click',()=>mutate('delete','selected',[item.id]));actions.append(button,remove);row.append(check,copy,actions);list.append(row);
      });
      $('#inquiry-page').textContent=`${page} / ${Math.max(1,Math.ceil(data.total/data.pageSize))} 페이지`;
      $('#inquiry-prev').disabled=page<=1;$('#inquiry-next').disabled=page*data.pageSize>=data.total;
      $('#admin-status').textContent='';
    } catch(error) {
      if(error.status===401){login();return;}
      $('#admin-list').replaceChildren();$('#admin-count').textContent='';$('#inquiry-page').textContent='';
      $('#admin-status').textContent=error.message==='API_NOT_CONNECTED'?'Cloudflare 개발 서버 또는 배포된 사이트에서 이용해 주세요.':'접수 내역을 불러오지 못했습니다. 데이터베이스 연결을 확인하고 새로고침해 주세요.';
    } finally {
      busy=false;selection();$('#inquiry-refresh').disabled=false;$('#inquiry-search-form button').disabled=false;
    }
  }
  async function mutate(action,scope,ids=[...selected],status=$('#inquiry-bulk-status').value) {
    if(busy)return false;
    const count=scope==='all'?total:ids.length;
    if(!count)return false;
    if((action==='delete'||scope==='all')&&!confirm(`${scope==='all'?'검색 결과 전체':'선택한 상담'} ${count}건을 ${action==='delete'?'영구 삭제':stages[status]+' 상태로 변경'}하시겠습니까?`))return false;
    busy=true;selection();$('#inquiry-detail-save').disabled=true;
    try {
      const result=await api.updateInquiries({action,scope,ids,status,q:query});
      if(current&&ids.includes(current.id)&&action==='status'){current.status=status;$('#inquiry-detail-stage').value=status;const fields=$('#inquiry-fields');fields.querySelector('dd').textContent=stages[status];}
      busy=false;await load();
      const message=`${result.changed}건 ${action==='delete'?'삭제':'상태 변경'} 완료`;
      $('#admin-status').textContent=message;$('#inquiry-detail-status').textContent=message;
      return true;
    } catch(error) {
      if(error.status===401){login();return false;}
      const message='처리하지 못했습니다. 다시 시도해 주세요.';$('#admin-status').textContent=message;$('#inquiry-detail-status').textContent=message;return false;
    } finally {busy=false;selection();$('#inquiry-detail-save').disabled=false;}
  }
  $('#inquiry-select-all').addEventListener('change',event=>{if(busy)return;selected.clear();if(event.target.checked)items.forEach(item=>selected.add(item.id));document.querySelectorAll('.inquiry-row-check').forEach(check=>check.checked=event.target.checked);selection();});
  for(const scope of ['selected','all'])for(const action of ['status','delete'])$('#inquiry-'+scope+'-'+action).addEventListener('click',()=>mutate(action,scope));
  $('#inquiry-detail-save').addEventListener('click',()=>{if(current)mutate('status','selected',[current.id],$('#inquiry-detail-stage').value);});
  $('#inquiry-export').addEventListener('click',async()=>{
    if(busy)return;const button=$('#inquiry-export');button.disabled=true;
    try {
      const data=await api.inquiries({q:query,export:1});
      const escape=value=>String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
      const rows=[['접수일 (한국 시간)','상담 상태','학부모 성함','연락처','이메일','관심 과정','상담 내용','개인정보 동의'],...data.items.map(item=>[date(item.created_at),stages[item.status],item.name,item.phone,item.email,item.program,item.message,item.consent===1?'동의':'미동의'])];
      const xml='<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="상담 접수"><Table>'+rows.map(row=>'<Row>'+row.map(value=>'<Cell><Data ss:Type="String">'+escape(value)+'</Data></Cell>').join('')+'</Row>').join('')+'</Table></Worksheet></Workbook>';
      const url=URL.createObjectURL(new Blob([xml],{type:'application/vnd.ms-excel;charset=utf-8'}));const link=node('a','');link.href=url;link.download='상담접수-'+new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'})+'.xml';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      $('#admin-status').textContent=`${data.items.length}건의 엑셀 파일을 다운로드했습니다.`;
    }catch(error){if(error.status===401)login();else $('#admin-status').textContent='엑셀 파일을 다운로드하지 못했습니다. 다시 시도해 주세요.';}finally{button.disabled=false;}
  });
  $('#inquiry-search-form').addEventListener('submit',event=>{event.preventDefault();if(busy)return;query=$('#admin-search').value.trim();page=1;load();});
  $('#inquiry-refresh').addEventListener('click',()=>load());
  $('#inquiry-prev').addEventListener('click',()=>{if(!busy){page--;load();}});
  $('#inquiry-next').addEventListener('click',()=>{if(!busy){page++;load();}});
  $('#inquiry-close').addEventListener('click',()=>$('#inquiry-detail').close());
  $('#admin-logout').addEventListener('click',async()=>{try{await api.logout();login();}catch{$('#admin-status').textContent='로그아웃하지 못했습니다. 다시 시도해 주세요.';}});
  (async()=>{try{const auth=await api.session();if(!auth.authenticated){login();return;}$('#admin-auth-loading').hidden=true;$('#admin-workspace').hidden=false;await load();}catch{$('#admin-auth-loading').textContent='관리 화면에 연결하지 못했습니다. 페이지를 새로고침해 주세요.';}})();
})();
