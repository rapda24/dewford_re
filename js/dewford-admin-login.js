/* Dedicated login page; sessions and credentials use the existing same-origin API. */
(() => {
  const form=document.getElementById('admin-login-form');
  const status=document.getElementById('admin-login-status');
  const toggle=document.getElementById('admin-password-toggle');
  const password=form.elements.password;
  const destination='admin.html'+location.search;
  const errors={INVALID_CREDENTIALS:'아이디 또는 비밀번호가 일치하지 않습니다.',TOO_MANY_ATTEMPTS:'로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.',ADMIN_NOT_CONFIGURED:'관리자 계정이 아직 설정되지 않았습니다.',DATABASE_NOT_CONFIGURED:'데이터베이스 연결이 필요합니다.',DATABASE_UNAVAILABLE:'저장 서버에 연결할 수 없습니다. 데이터베이스 설정을 확인해 주세요.',API_NOT_CONNECTED:'Cloudflare 개발 서버 또는 배포된 사이트에서 이용해 주세요.'};
  const message=error=>errors[error.message]||'로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  toggle.addEventListener('click',()=>{const visible=password.type==='password';password.type=visible?'text':'password';toggle.textContent=visible?'숨기기':'표시';toggle.setAttribute('aria-pressed',String(visible));});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const button=form.querySelector('[type=submit]');if(button.disabled)return;
    button.disabled=true;status.textContent='로그인 중입니다…';
    try{await DewfordAdmin.login(Object.fromEntries(new FormData(form)));form.reset();location.replace(destination);}
    catch(error){status.textContent=message(error);button.disabled=false;}
  });
  (async()=>{try{const auth=await DewfordAdmin.session();if(auth.authenticated)location.replace(destination);}catch(error){status.textContent=message(error);}})();
})();
