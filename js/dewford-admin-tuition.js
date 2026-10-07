(() => {
  const $=selector=>document.querySelector(selector),api=window.DewfordAdmin;
  let state,image='',busy=false;
  const login=()=>location.replace('admin-login.html?board=tuition');
  const errors={CONTENT_CHANGED:'다른 화면에서 교습비가 변경되어 최신 이미지를 불러왔습니다. 다시 확인해 주세요.',API_NOT_CONNECTED:'Cloudflare 개발 서버 또는 배포된 사이트에서 이용해 주세요.',IMAGE_TOO_LARGE:'이미지 용량을 줄이지 못했습니다. 더 작은 용량의 이미지로 첨부해 주세요.',MEDIA_STORAGE_FULL:'이미지 저장 공간이 가득 찼습니다.',CSRF_INVALID:'페이지를 새로고침한 뒤 다시 저장해 주세요.'};
  const message=error=>errors[error.message]||'요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  function preview(){const img=$('#tuition-preview');img.hidden=!image;if(image)img.src=image;else img.removeAttribute('src');}
  function setBusy(value){busy=value;$('#tuition-upload').disabled=value;$('#tuition-form [type=submit]').disabled=value;}
  async function refresh(){state=await api.tuition();image=state.image;preview();}
  async function optimize(file){
    if(file.size<=1000000)return file;
    const bitmap=await createImageBitmap(file);
    try{const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);
      for(const quality of [.92,.82,.72,.62,.52]){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob&&blob.size<=1000000)return blob;}
      throw new Error('IMAGE_TOO_LARGE');
    }finally{bitmap.close();}
  }
  $('#tuition-upload').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file||busy)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){$('#tuition-status').textContent='20MB 이하 PNG, JPEG, WebP 이미지를 선택해 주세요.';event.target.value='';return;}
    setBusy(true);$('#tuition-status').textContent='이미지를 업로드하고 있습니다.';
    try{const result=await api.upload(await optimize(file));image=result.url;preview();$('#tuition-status').textContent='이미지를 첨부했습니다. 저장을 눌러 적용해 주세요.';}
    catch(error){$('#tuition-status').textContent=message(error);event.target.value='';if(error.status===401)login();}
    finally{setBusy(false);}
  });
  $('#tuition-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!state)return;setBusy(true);$('#tuition-status').textContent='저장 중입니다.';
    try{state=await api.saveTuition({image,revision:state.revision});$('#tuition-status').textContent='저장했습니다. 홈페이지의 교습비 팝업에 반영되었습니다.';}
    catch(error){if(error.status===401){login();return;}if(error.status===409)await refresh();$('#tuition-status').textContent=message(error);}
    finally{setBusy(false);}
  });
  $('#admin-logout').addEventListener('click',async()=>{try{await api.logout();login();}catch(error){$('#tuition-status').textContent=message(error);}});
  (async()=>{try{const auth=await api.session();if(!auth.authenticated){login();return;}await refresh();$('#admin-auth-loading').hidden=true;$('#admin-workspace').hidden=false;}catch(error){$('#admin-auth-loading').textContent=message(error);}})();
})();
