(() => {
 const $=s=>document.querySelector(s),api=window.DewfordAdmin;
 let state,busy=false;
 const login=()=>location.replace('admin-login.html?board=settings');
 async function load(){state=await api.siteInfo();$('#channels-kakao').value=state.kakao;$('#channels-naver').value=state.naver;for(const field of ['academyName','phone','email','address','registration'])$('#settings-'+field).value=state[field];}
 $('#channels-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;busy=true;$('#channels-form button').disabled=true;$('#channels-status').textContent='저장 중입니다.';
  try{state=await api.saveSiteInfo({...Object.fromEntries(['academyName','phone','email','address','registration'].map(field=>[field,$('#settings-'+field).value.trim()])),revision:state.revision,kakao:$('#channels-kakao').value.trim(),naver:$('#channels-naver').value.trim()});$('#channels-status').textContent='저장했습니다. 사이트의 공통 정보에 적용됩니다.';}
  catch(error){if(error.status===401){login();return;}if(error.message==='CONTENT_CHANGED'){await load();$('#channels-status').textContent='다른 화면에서 변경된 최신 주소를 불러왔습니다. 확인 후 다시 저장해 주세요.';}else $('#channels-status').textContent=error.message==='INVALID_SITE_INFO'?'학원 정보와 연락처·이메일 형식을 확인해 주세요.':error.message==='INVALID_CHANNEL_URL'?'카카오톡은 kakao.com, 네이버 톡톡은 naver.com의 올바른 URL을 입력해 주세요.':'저장하지 못했습니다. 다시 시도해 주세요.';}
  finally{busy=false;$('#channels-form button').disabled=false;}
 });
 $('#admin-logout').addEventListener('click',async()=>{try{await api.logout();login();}catch{$('#channels-status').textContent='로그아웃하지 못했습니다.';}});
 (async()=>{try{const auth=await api.session();if(!auth.authenticated){login();return;}await load();$('#admin-auth-loading').hidden=true;$('#admin-workspace').hidden=false;}catch{$('#admin-auth-loading').textContent='공통 정보를 불러오지 못했습니다. 새로고침해 주세요.';}})();
})();
