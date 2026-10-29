(() => {
  const $=s=>document.querySelector(s),api=window.DewfordAdmin;
  const login=()=>location.replace('admin-login.html?board=analytics');
  const number=n=>Number(n).toLocaleString('ko-KR');
  function table(target,headers,rows){
    const host=$(target);host.replaceChildren();
    if(!rows.length){host.textContent='수집된 방문 기록이 없습니다.';return;}
    const table=document.createElement('table'),head=table.createTHead().insertRow();
    for(const title of headers){const th=document.createElement('th');th.scope='col';th.textContent=title;head.append(th);}
    const body=table.createTBody();
    for(const row of rows){const tr=body.insertRow();for(const value of row)tr.insertCell().textContent=value;}
    host.append(table);
  }
  let busy=false;
  async function load(){
    if(busy)return;busy=true;$('#analytics-refresh').disabled=true;$('#analytics-days').disabled=true;
    $('#analytics-status').textContent='통계를 불러오는 중입니다.';
    try{
      const data=await api.analytics($('#analytics-days').value),s=data.summary;
      for(const [id,key] of [['today-visitors','todayVisitors'],['today-views','todayViews'],['month-visitors','monthVisitors'],['month-views','monthViews']])$('#'+id).textContent=number(s[key]);
      const byDay=new Map(data.daily.map(row=>[row.day,row]));const daily=[];
      for(let i=0;i<data.days;i++){const day=new Date(Date.parse(data.start+'T00:00:00Z')+i*86400000).toISOString().slice(0,10),row=byDay.get(day);daily.push([day,number(row?.visitors||0),number(row?.views||0)]);}
      table('#analytics-daily',['날짜','방문자','조회수'],daily.reverse());
      table('#analytics-pages',['페이지','조회수'],data.pages.map(row=>[row.path==='/index.html'?'홈 (/index.html)':row.path,number(row.views)]));
      const total=data.devices.reduce((sum,row)=>sum+Number(row.views),0);
      table('#analytics-devices',['기기','조회수','비율'],data.devices.map(row=>[row.device==='mobile'?'모바일·태블릿':'PC',number(row.views),(100*row.views/total).toFixed(1)+'%']));
      $('#analytics-status').textContent=`${data.start} ~ ${data.today} · 한국 시간 기준 · 조회 완료`;
    }catch(error){if(error.status===401){login();return;}$('#analytics-status').textContent='통계를 불러오지 못했습니다. DB 통계 마이그레이션 적용 여부를 확인한 뒤 다시 시도해 주세요.';}
    finally{busy=false;$('#analytics-refresh').disabled=false;$('#analytics-days').disabled=false;}
  }
  $('#analytics-days').addEventListener('change',load);$('#analytics-refresh').addEventListener('click',load);
  $('#admin-logout').addEventListener('click',async()=>{try{await api.logout();login();}catch{$('#analytics-status').textContent='로그아웃하지 못했습니다.';}});
  (async()=>{try{const auth=await api.session();if(!auth.authenticated){login();return;}$('#admin-auth-loading').hidden=true;$('#admin-workspace').hidden=false;await load();}catch{$('#admin-auth-loading').textContent='관리 화면을 불러오지 못했습니다. 새로고침해 주세요.';}})();
})();
