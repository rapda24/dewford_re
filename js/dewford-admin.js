(() => {
  const $ = selector => document.querySelector(selector);
  const api = window.DewfordAdmin;
  const names = {events:'이벤트 게시판',preschool:'유치부 캘린더',elementary:'초등부 캘린더',popups:'팝업 관리'};
  const params = new URLSearchParams(location.search);
  if(['inquiries','tuition','channels'].includes(params.get('board'))){location.replace('admin-'+params.get('board')+'.html');return;}
  const embedded=params.get('embedded')==='1';if(embedded)document.body.classList.add('admin-embedded');
  const notifyParent=(type,extra={})=>{if(embedded&&parent!==window)parent.postMessage({source:'dewford-editor',type,...extra},location.origin);};
  let board = names[params.get('board')] ? params.get('board') : 'events';
  let state, movingId, busy = false, uploading = false, editorVersion = 0;
  const editor = $('#admin-editor'), form = $('#admin-edit-form');
  const richEditor=new Quill('#admin-rich-editor',{theme:'snow',formats:['header','size','bold','italic','underline','strike','color','background','list','blockquote','align'],modules:{toolbar:[[{header:[2,3,false]},{size:['small',false,'large','huge']}],['bold','italic','underline','strike'],[{color:['#111111','#52196d','#f5a100','#b33939','#277a50','#315fc4','#756b7a']},{background:['#ffffff','#fff1ad','#e8ddf0']}],[{list:'ordered'},{list:'bullet'},'blockquote',{align:[]}],['clean']]}});
  richEditor.root.setAttribute('aria-labelledby','admin-body-label');richEditor.root.setAttribute('role','textbox');richEditor.root.setAttribute('aria-multiline','true');
  const toolbar=richEditor.getModule('toolbar').container;const labels={bold:'굵게',italic:'기울임',underline:'밑줄',strike:'취소선',blockquote:'인용문',clean:'서식 지우기',list:'목록',header:'제목 스타일',size:'글자 크기',color:'글자 색',background:'강조 색',align:'정렬'};
  toolbar.querySelectorAll('button,select').forEach(el=>{const format=Array.from(el.classList).find(name=>name.startsWith('ql-'))?.slice(3);if(labels[format]){el.setAttribute('aria-label',labels[format]);el.title=labels[format];}if(el.tagName==='BUTTON')el.type='button';});
  const errors = {ADMIN_NOT_CONFIGURED:'관리자 계정이 아직 설정되지 않았습니다. 관리자 설정 안내를 확인해 주세요.',DATABASE_NOT_CONFIGURED:'데이터베이스 연결이 필요합니다.',DATABASE_UNAVAILABLE:'저장 서버에 연결할 수 없습니다. 데이터베이스 설정과 마이그레이션을 확인해 주세요.',API_NOT_CONNECTED:'Cloudflare 개발 서버 또는 배포된 사이트에서 이용해 주세요.',INVALID_CREDENTIALS:'아이디 또는 비밀번호가 일치하지 않습니다.',TOO_MANY_ATTEMPTS:'로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.',CONTENT_CHANGED:'다른 화면에서 내용이 변경되었습니다. 목록을 새로 불러왔습니다. 다시 확인해 주세요.',UNAUTHORIZED:'로그인이 만료되었습니다. 다시 로그인해 주세요.',MEDIA_NOT_CONFIGURED:'이미지 저장소에 연결할 수 없습니다.',IMAGE_TOO_LARGE:'이미지 용량을 줄이지 못했습니다. 더 작은 이미지로 다시 첨부해 주세요.',IMAGE_PROCESSING_FAILED:'이미지 파일을 읽지 못했습니다. 다른 PNG, JPEG, WebP 파일을 선택해 주세요.',MEDIA_STORAGE_FULL:'이미지 저장 공간이 가득 찼습니다. 사이트 관리자에게 저장 공간 정리를 요청해 주세요.',UNSUPPORTED_IMAGE:'PNG, JPEG, WebP 파일만 사용할 수 있습니다.',PAYLOAD_TOO_LARGE:'이미지 용량을 줄이지 못했습니다. 더 작은 파일로 다시 첨부해 주세요.',INVALID_DATE:'날짜 또는 노출 기간을 확인해 주세요.',INVALID_URL:'이미지 또는 링크 주소를 확인해 주세요.',INVALID_INPUT:'입력한 내용을 확인해 주세요.',CSRF_INVALID:'세션을 새로 확인하려면 페이지를 새로고침해 주세요.'};
  const message = error => errors[error.message] || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  const node = (tag, text, cls) => {const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;};
  function imageURL(value) {if(typeof value!=='string'||!value.trim())return '';try {const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
  function loginView() {if(embedded){notifyParent('session-expired');return;}location.replace('admin-login.html'+location.search);}
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
    try {state=await api.mutate({...payload,board,revision:state.revision});$('#admin-status').textContent='저장했습니다.';notifyParent('saved',{board,action:payload.action,id:payload.id});return true;}
    catch(error){$('#admin-status').textContent=message(error);if(error.status===409)await refresh();if(error.status===401)loginView();return false;}
    finally{busy=false;if(state&& !$('#admin-workspace').hidden)render();}
  }
  const localTime=value=>value?new Date(Date.parse(value)+9*3600000).toISOString().slice(0,16):'';
  function edit(item={}) {
    editorVersion++;form.reset();$('#admin-editor-status').textContent='';setUploading(false);
    const popup=board==='popups';editor.classList.toggle('admin-popup-editor',popup);document.querySelector('[data-post-fields]').hidden=popup;document.querySelector('[data-popup-fields]').hidden=!popup;
    form.elements.date.required=!popup;$('#admin-image-upload').required=popup&&!item.image;
    $('#admin-editor-title').textContent=`${names[board]} ${item.id?'수정':'등록'}`;
    for(const key of ['id','title','image','excerpt','link'])form.elements[key].value=item[key]||'';
    form.elements.date.value=item.date||new Date().toLocaleDateString('en-CA');form.elements.body.value=item.body||item.description||'';
    if(item.content?.ops)richEditor.setContents(item.content);else richEditor.setText(form.elements.body.value);richEditor.history.clear();
    form.elements.gallery.value=(item.gallery||[]).join('\n');form.elements.width.value=item.width||480;
    form.elements.startsAt.value=localTime(item.startsAt);form.elements.endsAt.value=localTime(item.endsAt);
    form.elements.enabled.checked=item.enabled!==false;form.elements.published.checked=item.published!==false;
    preview();galleryPreview();editor.showModal();
  }
  function preview(){
    const img=$('#admin-image-preview'),url=imageURL(form.elements.image.value);
    img.hidden=!url;$('#admin-image-remove').hidden=!url;
    if(url)img.src=url;else img.removeAttribute('src');
    $('#admin-image-upload').required=board==='popups'&&!url;
  }
  function galleryImages(){return form.elements.gallery.value.split('\n').map(value=>value.trim()).filter(Boolean);}
  function galleryPreview(){
    const container=$('#admin-gallery-preview');container.replaceChildren();
    galleryImages().forEach((url,index)=>{
      const figure=node('figure'),img=node('img');img.src=imageURL(url);img.alt=`추가 사진 ${index+1}`;
      const remove=node('button','삭제');remove.type='button';remove.disabled=uploading;remove.setAttribute('aria-label',`추가 사진 ${index+1} 삭제`);
      remove.addEventListener('click',()=>{form.elements.gallery.value=galleryImages().filter((_,i)=>i!==index).join('\n');galleryPreview();});
      figure.append(img,remove);container.append(figure);
    });
  }
  function setUploading(value){
    uploading=value;form.querySelector('[type=submit]').disabled=value;
    $('#admin-image-upload').disabled=value;$('#admin-gallery-upload').disabled=value;$('#admin-image-remove').disabled=value;
    galleryPreview();
  }
  function validFiles(files){
    if(files.some(file=>!['image/png','image/jpeg','image/webp'].includes(file.type))){$('#admin-editor-status').textContent='PNG, JPEG, WebP 이미지 파일을 선택해 주세요.';return false;}
    if(files.some(file=>file.size>20*1024*1024)){$('#admin-editor-status').textContent='이미지 파일은 한 장당 20MB 이하로 선택해 주세요.';return false;}
    return true;
  }
  async function optimizedImage(file){
    let bitmap;
    try{
      bitmap=await createImageBitmap(file);
      if(file.size<=900000&&Math.max(bitmap.width,bitmap.height)<=1920)return file;
      const canvas=document.createElement('canvas');
      let scale=Math.min(1,1920/Math.max(bitmap.width,bitmap.height));
      for(let attempt=0;attempt<7;attempt++){
        canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
        canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
        for(const quality of [.9,.8,.7]){
          const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
          if(blob&&blob.size<=900000){const ext=blob.type==='image/webp'?'webp':blob.type==='image/png'?'png':'jpg';return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.'+ext,{type:blob.type});}
        }
        scale*=.8;
      }
      throw new Error('IMAGE_TOO_LARGE');
    }catch(error){if(error.message==='IMAGE_TOO_LARGE')throw error;throw new Error('IMAGE_PROCESSING_FAILED');}
    finally{bitmap?.close();}
  }
  $('#admin-image-upload').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    if(!validFiles([file])){event.target.value='';return;}
    const version=editorVersion;setUploading(true);$('#admin-editor-status').textContent='이미지를 업로드하고 있습니다…';
    try{const result=await api.upload(await optimizedImage(file));if(version!==editorVersion)return;form.elements.image.value=result.url;preview();$('#admin-editor-status').textContent='이미지를 첨부했습니다. 저장을 눌러 적용해 주세요.';}
    catch(error){if(version===editorVersion){event.target.value='';$('#admin-editor-status').textContent=message(error);}}
    finally{if(version===editorVersion)setUploading(false);}
  });
  $('#admin-gallery-upload').addEventListener('change',async event=>{
    const files=Array.from(event.target.files);if(!files.length)return;
    if(!validFiles(files)){event.target.value='';return;}
    if(galleryImages().length+files.length>20){$('#admin-editor-status').textContent='추가 사진은 최대 20장까지 첨부할 수 있습니다.';event.target.value='';return;}
    const version=editorVersion;setUploading(true);
    try{for(let i=0;i<files.length;i++){
      $('#admin-editor-status').textContent=`추가 사진 업로드 중… (${i+1}/${files.length})`;
      const result=await api.upload(await optimizedImage(files[i]));if(version!==editorVersion)return;
      form.elements.gallery.value=[...galleryImages(),result.url].join('\n');galleryPreview();
    }$('#admin-editor-status').textContent='추가 사진을 첨부했습니다. 저장을 눌러 적용해 주세요.';}
    catch(error){if(version===editorVersion)$('#admin-editor-status').textContent=message(error);}
    finally{if(version===editorVersion){event.target.value='';setUploading(false);}}
  });
  $('#admin-image-remove').addEventListener('click',()=>{form.elements.image.value='';$('#admin-image-upload').value='';preview();});
  editor.addEventListener('close',()=>{editorVersion++;setUploading(false);notifyParent('close');});
  document.querySelectorAll('[data-close-editor]').forEach(button=>button.addEventListener('click',()=>editor.close()));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(uploading||busy)return;if(board==='popups'&&!form.elements.image.value){$('#admin-editor-status').textContent='팝업에 사용할 이미지를 파일로 첨부해 주세요.';$('#admin-image-upload').focus();return;}form.elements.body.value=richEditor.getText().trim();const data=Object.fromEntries(new FormData(form));const item={...data,published:form.elements.published.checked,enabled:form.elements.enabled.checked,gallery:data.gallery.split('\n').map(v=>v.trim()).filter(Boolean),...(board!=='popups'?{content:richEditor.getContents()}: {})};
    item.startsAt=data.startsAt?data.startsAt+':00+09:00':'';item.endsAt=data.endsAt?data.endsAt+':00+09:00':'';
    const saved=await mutation({action:'save',id:data.id||undefined,item});if(saved)editor.close();else $('#admin-editor-status').textContent=$('#admin-status').textContent;
  });
  function move(item){movingId=item.id;const moveForm=$('#admin-move-form');moveForm.elements.target.replaceChildren();for(const key of ['events','preschool','elementary']){if(key===board)continue;const option=node('option',names[key]);option.value=key;moveForm.elements.target.append(option);}moveForm.elements.date.value=item.date||'';$('#admin-move-status').textContent='';$('#admin-move').showModal();}
  $('#admin-move').addEventListener('close',()=>notifyParent('close'));
  $('#admin-move-cancel').addEventListener('click',()=>$('#admin-move').close());
  $('#admin-move-form').addEventListener('submit',async event=>{event.preventDefault();const fields=Object.fromEntries(new FormData(event.target));if(await mutation({action:'move',id:movingId,...fields}))$('#admin-move').close();else $('#admin-move-status').textContent=$('#admin-status').textContent;});
  $('#admin-create').addEventListener('click',()=>edit());$('#admin-search').addEventListener('input',render);
  document.querySelectorAll('[data-board]').forEach(button=>button.addEventListener('click',()=>{if(busy)return;board=button.dataset.board;$('#admin-search').value='';history.replaceState(null,'','admin.html?board='+board);render();}));
  $('#admin-logout').addEventListener('click',async()=>{try{await api.logout();state=null;loginView();$('#admin-status').textContent='로그아웃했습니다.';}catch(error){$('#admin-status').textContent=message(error);}});
  function openRequested(){const moveId=params.get('move');if(moveId){const item=state.boards[board].find(i=>i.id===moveId);if(item&&board!=='popups')move(item);return;}const id=params.get('edit');if(id){const item=state.boards[board].find(i=>i.id===id);if(item)edit(item);}else if(params.get('new')==='1'){edit();if(params.get('date'))form.elements.date.value=params.get('date');}}
  (async()=>{try{const auth=await api.session();if(auth.authenticated){await refresh();openRequested();}else loginView();}catch(error){$('#admin-auth-loading').textContent=message(error);notifyParent('error',{message:message(error)});}})();
})();
