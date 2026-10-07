/* Same-origin admin session: cookies stay HttpOnly, CSRF token stays in memory. */
(() => {
  let csrf = '';
  async function request(path, payload, file) {
    const response = await fetch('/api/admin/' + path, {
      method:payload || file ? 'POST' : 'GET', credentials:'same-origin',
      headers:file ? {'Content-Type':file.type,'X-CSRF-Token':csrf} : {'Accept':'application/json',...(payload ? {'Content-Type':'application/json','X-CSRF-Token':csrf} : {})},
      body:file || (payload ? JSON.stringify(payload) : undefined)
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('API_NOT_CONNECTED'); }
    if (!response.ok) { const error = new Error(result.error?.code || 'REQUEST_FAILED'); error.status=response.status; throw error; }
    if (result.data.csrf) csrf = result.data.csrf;
    return result.data;
  }
  window.DewfordAdmin = Object.freeze({
    session:() => request('session'), login:data => request('login', data), logout:() => request('logout', {}),
    inquiries:params => request('inquiries?' + new URLSearchParams(params)), content:() => request('content'), mutate:data => request('content', data), upload:file => request('upload', null, file)
  });
})();
