const publicPages = new Set(['/why-dewford.html', '/rolling-enrollment.html', '/index.html', '/contact.html', '/admissions-inquiry.html', '/preschool-calendar.html', '/international-preschool.html', '/event.html', '/elementary-esl.html', '/educational-philosophy.html', '/elementary-calendar.html', '/detail.html', '/elementary-international.html']);
export const koreaDay = (now = Date.now()) => new Date(now + 9 * 3600000).toISOString().slice(0, 10);
export async function recordVisit(request, env) {
  const bad = () => { throw Object.assign(new Error('INVALID_VISIT'), {status:400}); };
  if (request.headers.get('Origin') !== new URL(request.url).origin) throw Object.assign(new Error('ORIGIN_NOT_ALLOWED'), {status:403});
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) bad();
  const reader = request.body?.getReader(); if (!reader) bad();
  let size=0, chunks=[];
  while (true) { const {value,done}=await reader.read(); if(done)break; size+=value.length; if(size>1024){await reader.cancel();bad();} chunks.push(value); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{bad();}
  if (!body || !publicPages.has(body.path) || typeof body.visitor !== 'string' || !/^[a-f0-9]{32}$/.test(body.visitor) || !['mobile','desktop'].includes(body.device)) bad();
  if (/bot|crawler|spider|headless/i.test(request.headers.get('User-Agent') || '')) return;
  const day=koreaDay();
  await env.DB.prepare(`INSERT INTO site_visits(day,visitor,path,device,views) VALUES(?,?,?,?,1)
    ON CONFLICT(day,visitor,path,device) DO UPDATE SET views=views+1`).bind(day,body.visitor,body.path,body.device).run();
  await env.DB.prepare('DELETE FROM site_visits WHERE day < ?').bind(koreaDay(Date.now()-400*86400000)).run();
}
export async function visitStats(env, url) {
  const days=Number(url.searchParams.get('days') || 30);
  if (![7,30,90].includes(days)) throw Object.assign(new Error('INVALID_RANGE'),{status:400});
  const today=koreaDay(), month=today.slice(0,7)+'-01', start=koreaDay(Date.now()-(days-1)*86400000);
  const summary=await env.DB.prepare(`SELECT COUNT(DISTINCT CASE WHEN day=? THEN visitor END) AS todayVisitors,
    COALESCE(SUM(CASE WHEN day=? THEN views ELSE 0 END),0) AS todayViews,
    COUNT(DISTINCT CASE WHEN day>=? THEN day||visitor END) AS monthVisitors,
    COALESCE(SUM(CASE WHEN day>=? THEN views ELSE 0 END),0) AS monthViews FROM site_visits WHERE day>=?`).bind(today,today,month,month,month).first();
  const daily=await env.DB.prepare('SELECT day,COUNT(DISTINCT visitor) AS visitors,SUM(views) AS views FROM site_visits WHERE day>=? GROUP BY day ORDER BY day').bind(start).all();
  const pages=await env.DB.prepare('SELECT path,SUM(views) AS views FROM site_visits WHERE day>=? GROUP BY path ORDER BY views DESC,path').bind(start).all();
  const devices=await env.DB.prepare('SELECT device,SUM(views) AS views FROM site_visits WHERE day>=? GROUP BY device').bind(start).all();
  return {today,start,days,summary,daily:daily.results,pages:pages.results,devices:devices.results};
}
