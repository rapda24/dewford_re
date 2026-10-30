import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { pbkdf2Sync } from 'node:crypto';
import worker from '../server/worker.js';
function environment() {
  const db = new DatabaseSync(':memory:');
  for (const file of ['0001_public_content.sql','0002_inquiries.sql','0003_admin.sql','0004_admin_media.sql','0005_inquiry_status.sql','0006_analytics.sql','0007_inquiry_site.sql']) db.exec(readFileSync(new URL('../migrations/' + file, import.meta.url),'utf8'));
  const DB = {prepare(sql) {
    const statement = db.prepare(sql); let values=[];
    const wrapper={bind(...args){values=args.map(value=>value instanceof ArrayBuffer?new Uint8Array(value):value);return wrapper;},async first(){return statement.get(...values)||null;},async all(){return {results:statement.all(...values)};},async run(){const result=statement.run(...values);return {meta:{changes:Number(result.changes)}};}};
    return wrapper;
  }};
  const password='test-password-123'; const salt='test-salt';
  const env={DB,ADMIN_USERNAME:'admin',ADMIN_PASSWORD_HASH:'pbkdf2$100000$'+salt+'$'+pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')};
  return {env,db,password};
}
async function call(env,path,payload,auth={}) {
  const headers={...(payload?{'Content-Type':'application/json',Origin:'https://dewford.example'}:{}),...(auth.cookie?{Cookie:auth.cookie}:{}),...(auth.csrf?{'X-CSRF-Token':auth.csrf}:{}),...auth.headers};
  const response=await worker.fetch(new Request('https://dewford.example/api/'+path,{method:payload?'POST':'GET',headers,body:payload?JSON.stringify(payload):undefined}),env);
  const body=await response.json();return {response,...body};
}
async function login(env,password){const result=await call(env,'admin/login',{username:'admin',password});assert.equal(result.response.status,200);assert.match(result.response.headers.get('Set-Cookie'),/HttpOnly; SameSite=Strict/);return {cookie:result.response.headers.get('Set-Cookie').split(';')[0],csrf:result.data.csrf};}
const item={title:'새 소식',date:'2026-10-06',body:'내용',image:'images/sub/pop2026_1.png',published:true};
test('calendar categories persist, rename across both calendars, and delete without deleting schedules',async()=>{
  const {env,password}=environment();const auth=await login(env,password);
  let state=(await call(env,'admin/content',null,auth)).data;
  assert.deepEqual(state.boards.calendarCategories,['행사','방학','no class']);
  const mutate=async payload=>{const result=await call(env,'admin/content',{board:'preschool',revision:state.revision,...payload},auth);if(result.response.ok)state=result.data;return result;};
  assert.equal((await mutate({action:'category-save',name:'체험학습'})).response.status,200);
  assert.equal((await mutate({action:'category-save',name:'체험학습'})).response.status,409);
  assert.equal((await mutate({action:'category-save',name:'  '})).response.status,400);
  assert.equal((await mutate({action:'save',item:{...item,category:'없는 분류'}})).response.status,400);
  await mutate({action:'save',item:{...item,category:'체험학습'}});
  await mutate({action:'save',board:'elementary',item:{...item,category:'체험학습'}});
  await mutate({action:'category-save',category:'체험학습',name:'현장학습'});
  assert.equal(state.boards.preschool[0].category,'현장학습');assert.equal(state.boards.elementary[0].category,'현장학습');
  let feed=(await call(env,'content/calendar')).data;
  assert.equal(feed.preschool[0].category,'현장학습');assert.ok(feed.categories.includes('현장학습'));
  assert.equal((await call(env,'admin/content',{board:'preschool',revision:state.revision-1,action:'category-delete',category:'현장학습'},auth)).response.status,409);
  await mutate({action:'category-delete',category:'현장학습'});
  feed=(await call(env,'content/calendar')).data;
  assert.equal(feed.preschool.length,1);assert.equal(feed.elementary.length,1);
  assert.equal(feed.preschool[0].category,undefined);assert.equal(feed.elementary[0].category,undefined);
  await mutate({action:'category-delete',category:'행사'});
  assert.equal((await call(env,'admin/content',null,auth)).data.boards.calendarCategories.includes('행사'),false);
  assert.equal((await mutate({board:'events',action:'category-save',name:'차단'})).response.status,400);
});
test('selected deletion is atomic, scoped to its board, and protected by the content revision',async()=>{
  const {env,password}=environment();const auth=await login(env,password);
  let state=(await call(env,'admin/content',null,auth)).data;
  const mutate=async payload=>{const result=await call(env,'admin/content',{board:'events',revision:state.revision,...payload},auth);if(result.response.ok)state=result.data;return result;};
  for(const title of ['보존','삭제 1','삭제 2'])await mutate({action:'save',item:{...item,title}});
  await mutate({board:'preschool',action:'save',item});
  const ids=state.boards.events.slice(0,2).map(item=>item.id),foreign=state.boards.preschool[0].id;
  for(const invalid of [[],[ids[0],ids[0]],[ids[0],'missing'],[ids[0],foreign]]){
    assert.ok((await mutate({action:'delete-selected',ids:invalid})).response.status>=400);
    assert.equal((await call(env,'admin/content',null,auth)).data.boards.events.length,3);
  }
  assert.equal((await call(env,'admin/content',{board:'events',action:'delete-selected',ids,revision:state.revision-1},auth)).response.status,409);
  await mutate({action:'delete-selected',ids});
  assert.deepEqual(state.boards.events.map(item=>item.title),['보존']);assert.equal(state.boards.preschool.length,1);
  assert.equal((await call(env,'content/events')).data.posts.length,1);
  for(const board of ['preschool','elementary','popups']){
    if(!state.boards[board].length)await mutate({board,action:'save',item});
    await mutate({board,action:'delete-selected',ids:state.boards[board].map(item=>item.id)});
    assert.equal(state.boards[board].length,0);
  }
});
test('admin rejects unauthenticated writes, bad credentials, CSRF and cross-origin requests',async()=>{
  const {env,password}=environment();
  assert.equal((await call(env,'admin/content',{action:'save',board:'events',revision:0,item})).response.status,401);
  assert.equal((await call(env,'admin/login',{username:'admin',password:'wrong'})).response.status,401);
  const auth=await login(env,password);
  assert.equal((await call(env,'admin/content',{action:'save',board:'events',revision:0,item},{cookie:auth.cookie})).response.status,403);
  assert.equal((await call(env,'admin/content',{action:'save',board:'events',revision:0,item},{...auth,headers:{Origin:'https://foreign.example'}})).response.status,403);
  assert.equal((await call(env,'admin/session',null,auth)).data.authenticated,true);
});
test('CRUD, board transfer, ordering, conflict protection and empty public feed',async()=>{
  const {env,password}=environment();const auth=await login(env,password);
  let result=await call(env,'admin/content',{action:'save',board:'events',revision:0,item},auth);
  assert.equal(result.response.status,200);const id=result.data.boards.events[0].id;
  assert.equal((await call(env,'content/events')).data.posts.length,1);
  assert.equal((await call(env,'admin/content',{action:'delete',board:'events',revision:0,id},auth)).response.status,409);
  result=await call(env,'admin/content',{action:'save',board:'events',revision:1,id,item:{...item,title:'수정된 제목'}},auth);assert.equal(result.data.boards.events[0].title,'수정된 제목');
  result=await call(env,'admin/content',{action:'move',board:'events',target:'preschool',revision:2,id,date:'2026-11-10'},auth);assert.equal(result.data.boards.events.length,0);assert.equal((await call(env,'content/calendar')).data.preschool[0].date,'2026-11-10');
  result=await call(env,'admin/content',{action:'save',board:'preschool',revision:3,item:{...item,title:'둘째'}},auth);const second=result.data.boards.preschool[0].id;
  result=await call(env,'admin/content',{action:'reorder',board:'preschool',revision:4,id:second,direction:1},auth);assert.equal(result.data.boards.preschool[1].id,second);
  result=await call(env,'admin/content',{action:'delete',board:'preschool',revision:5,id},auth);assert.equal(result.data.boards.preschool.length,1);
  result=await call(env,'admin/content',{action:'delete',board:'preschool',revision:6,id:second},auth);assert.equal((await call(env,'content/calendar')).data.preschool.length,0);
  assert.deepEqual((await call(env,'content/events')).data.posts,[]);
});
test('drafts and scheduled/disabled popups are not exposed publicly; last popup can be deleted',async()=>{
  const {env,password}=environment();const auth=await login(env,password);
  let result=await call(env,'admin/content',{action:'save',board:'events',revision:0,item:{...item,published:false}},auth);assert.equal((await call(env,'content/events')).data.posts.length,0);
  const popup={title:'예약 팝업',image:item.image,enabled:true,published:true,startsAt:'2099-01-01T00:00:00+09:00',width:500};
  result=await call(env,'admin/content',{action:'save',board:'popups',revision:1,item:popup},auth);const id=result.data.boards.popups[0].id;
  assert.equal((await call(env,'content/popups')).data.popups.length,1);
  result=await call(env,'admin/content',{action:'delete',board:'popups',revision:2,id:'home-2026'},auth);assert.equal((await call(env,'content/popups')).data.popups.length,0);
  result=await call(env,'admin/content',{action:'save',board:'popups',revision:3,id,item:{...popup,startsAt:'',enabled:false}},auth);assert.equal((await call(env,'content/popups')).data.popups.length,0);
  await call(env,'admin/content',{action:'delete',board:'popups',revision:4,id},auth);assert.equal((await call(env,'content/popups')).data.popups.length,0);
});
test('invalid URLs, dates, missing item IDs and logout are handled safely',async()=>{
  const {env,password}=environment();const auth=await login(env,password);
  for(const bad of [{...item,image:'javascript:alert(1)'},{...item,date:'2026-02-30'},{...item,date:'invalid'}])assert.equal((await call(env,'admin/content',{action:'save',board:'events',revision:0,item:bad},auth)).response.status,400);
  assert.equal((await call(env,'admin/content',{action:'delete',board:'events',revision:0,id:'missing'},auth)).response.status,404);
  assert.equal((await call(env,'admin/logout',{},auth)).response.status,200);
  assert.equal((await call(env,'admin/session',null,auth)).data.authenticated,false);
});
test('login is rate-limited and legacy content survives the first save',async()=>{
  const {env,db,password}=environment();
  db.prepare('INSERT INTO public_content(slug,payload,published) VALUES (?,?,1)').run('events',JSON.stringify({posts:[{...item,id:'legacy'}]}));
  const auth=await login(env,password);const result=await call(env,'admin/content',{action:'save',board:'events',revision:0,item},auth);assert.equal(result.data.boards.events.length,2);
  for(let i=0;i<9;i++)await call(env,'admin/login',{username:'admin',password:'wrong'});
  assert.equal((await call(env,'admin/login',{username:'admin',password})).response.status,429);
});
test('authenticated image upload and public media serving; executable formats are rejected',async()=>{
  const {env,password}=environment();const auth=await login(env,password);
  const upload=async bytes=>worker.fetch(new Request('https://dewford.example/api/admin/upload',{method:'POST',headers:{Origin:'https://dewford.example',Cookie:auth.cookie,'X-CSRF-Token':auth.csrf},body:bytes}),env);
  const png=new Uint8Array([137,80,78,71,13,10,26,10]);
  const response=await upload(png);assert.equal(response.status,200);const {data}=await response.json();
  const media=await worker.fetch(new Request('https://dewford.example'+data.url),env);assert.equal(media.status,200);assert.equal(media.headers.get('Content-Type'),'image/png');assert.deepEqual(new Uint8Array(await media.arrayBuffer()),png);
  assert.equal((await upload('<svg onload="alert(1)"></svg>')).status,415);
  assert.equal((await upload(new Uint8Array(5*1024*1024+1))).status,413);
  const large = new Uint8Array(1000001);large.set(png);assert.equal((await upload(large)).status,413);
});

test('D1 image upload creates its table automatically and preserves popup references', async()=>{
  const {env,db,password}=environment();db.exec('DROP TABLE admin_media');const auth=await login(env,password);
  const png=new Uint8Array([137,80,78,71,13,10,26,10]);
  const make=(headers={})=>new Request('https://dewford.example/api/admin/upload',{method:'POST',headers:{Origin:'https://dewford.example',...headers},body:png});
  assert.equal((await worker.fetch(make(),env)).status,401);
  assert.equal((await worker.fetch(make({Cookie:auth.cookie}),env)).status,403);
  const uploaded=await worker.fetch(make({Cookie:auth.cookie,'X-CSRF-Token':auth.csrf}),env);assert.equal(uploaded.status,200);
  const {data}=await uploaded.json();assert.equal(db.prepare('SELECT COUNT(*) AS count FROM admin_media').get().count,1);
  await call(env,'admin/content',{action:'save',board:'popups',revision:0,item:{title:'파일 첨부 팝업',image:data.url,enabled:true,published:true}},auth);
  assert.equal((await call(env,'content/popups')).data.popups[0].image,data.url);
  const response=await worker.fetch(new Request('https://dewford.example'+data.url),env);assert.equal(response.status,200);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),png);
  const missing=await worker.fetch(new Request('https://dewford.example/api/media/00000000-0000-0000-0000-000000000000.png'),env);assert.equal(missing.status,404);
});
test('D1 media storage cap stops new uploads without losing existing images', async()=>{
  const {env,db,password}=environment();const auth=await login(env,password);
  const insert=db.prepare('INSERT INTO admin_media (key, content_type, data, byte_size) VALUES (?, ?, ?, ?)');
  for(let i=0;i<350;i++)insert.run('reserved-'+i,'image/png',new Uint8Array([137,80,78,71]),1000000);
  const response=await worker.fetch(new Request('https://dewford.example/api/admin/upload',{method:'POST',headers:{Origin:'https://dewford.example',Cookie:auth.cookie,'X-CSRF-Token':auth.csrf},body:new Uint8Array([137,80,78,71])}),env);
  assert.equal(response.status,413);assert.equal((await response.json()).error.code,'MEDIA_STORAGE_FULL');
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM admin_media').get().count,350);
});
test('rich content retains allowed formatting, derives plain text, and rejects unsafe embeds', async()=>{
  const {env,password}=environment();const auth=await login(env,password);
  const content={ops:[{insert:'Formatted',attributes:{bold:true,color:'#52196d',link:'javascript:alert(1)',onclick:'attack',background:'url(javascript:attack)'}},{insert:'\n',attributes:{header:2,align:'center'}},{insert:'First item'},{insert:'\n',attributes:{list:'bullet'}}]};
  let result=await call(env,'admin/content',{action:'save',board:'events',revision:0,item:{...item,body:'ignored',content}},auth);
  assert.equal(result.response.status,200);const saved=result.data.boards.events[0];assert.equal(saved.body,'Formatted\nFirst item');assert.deepEqual(saved.content.ops[0].attributes,{bold:true,color:'#52196d'});
  const publicPost=(await call(env,'content/events')).data.posts[0];assert.deepEqual(publicPost.content,saved.content);
  result=await call(env,'admin/content',{action:'move',board:'events',target:'preschool',revision:1,id:saved.id,date:'2026-10-08'},auth);assert.deepEqual(result.data.boards.preschool[0].content,saved.content);
  const badContent=[{ops:[{insert:{image:'javascript:alert(1)'}}]},{ops:[{insert:'x'.repeat(30001)}]},{ops:[{delete:3}]}];
  for(const content of badContent)assert.equal((await call(env,'admin/content',{action:'save',board:'events',revision:2,item:{...item,content}},auth)).response.status,400);
  result=await call(env,'admin/content',{action:'save',board:'preschool',revision:2,id:saved.id,item:{...item,body:'Plain text'}},auth);assert.equal(result.data.boards.preschool[0].content,undefined);
});

test('consultation inbox is private, searchable and paginated with newest requests first', async()=>{
  const {env,db,password}=environment();
  assert.equal((await call(env,'admin/inquiries')).response.status,401);
  const submitted=await call(env,'inquiries',{name:'학부모',phone:'010-1234-5678',email:'parent@example.com',program:'국제 유치부',message:'상담 문의 <script>',consent:true});
  assert.equal(submitted.response.status,201);
  const auth=await login(env,password);
  let result=await call(env,'admin/inquiries',null,auth);
  assert.equal(result.response.headers.get('Cache-Control'),'no-store');
  assert.equal(result.data.items[0].id,submitted.data.id);
  assert.equal(result.data.items[0].message,'상담 문의 <script>');
  assert.equal((await call(env,'admin/inquiries?q='+encodeURIComponent('010-1234'),null,auth)).data.total,1);
  assert.equal((await call(env,'admin/inquiries?q='+encodeURIComponent("' OR 1=1 --"),null,auth)).data.total,0);
  assert.equal((await call(env,'admin/inquiries?page=-1',null,auth)).response.status,400);
  const insert=db.prepare('INSERT INTO inquiries (id,name,phone,program,consent,created_at) VALUES (?,?,?,?,1,?)');
  for(let i=0;i<21;i++)insert.run('extra-'+String(i).padStart(2,'0'),'추가 상담','010-1111-2222','기타 상담','2099-01-01T00:00:00.000Z');
  result=await call(env,'admin/inquiries',null,auth);
  assert.equal(result.data.total,22);assert.equal(result.data.items.length,20);assert.equal(result.data.items[0].id,'extra-20');
  result=await call(env,'admin/inquiries?page=2',null,auth);assert.equal(result.data.items.length,2);
  assert.equal((await call(env,'inquiries')).response.status,404);
  await call(env,'admin/logout',{},auth);
  assert.equal((await call(env,'admin/inquiries',null,auth)).response.status,401);
});

test('tuition settings require admin/CSRF, publish independently of popups, and reject stale saves',async()=>{
  const {env,password}=environment();
  assert.equal((await call(env,'admin/tuition')).response.status,401);
  assert.equal((await call(env,'admin/tuition',{image:item.image,revision:0})).response.status,401);
  const auth=await login(env,password);
  const initial=(await call(env,'admin/tuition',null,auth)).data;
  assert.equal(initial.revision,0);assert.equal(initial.image,'images/sub/pop2026_1.png');
  assert.equal((await call(env,'admin/tuition',{image:item.image,revision:0},{cookie:auth.cookie})).response.status,403);
  for(const image of ['javascript:alert(1)','admin.html',''])assert.equal((await call(env,'admin/tuition',{image,revision:0},auth)).response.status,400);
  const saved=await call(env,'admin/tuition',{image:'images/sub/communication.jpeg',revision:0},auth);
  assert.equal(saved.response.status,200);assert.equal(saved.data.revision,1);
  assert.equal((await call(env,'content/tuition')).data.image,'images/sub/communication.jpeg');
  await call(env,'admin/content',{action:'save',board:'popups',revision:0,item:{title:'다른 팝업',image:item.image,enabled:true}},auth);
  assert.equal((await call(env,'content/tuition')).data.image,'images/sub/communication.jpeg');
  assert.equal((await call(env,'admin/tuition',{image:item.image,revision:0},auth)).response.status,409);
  assert.equal((await call(env,'admin/tuition',null,auth)).data.image,'images/sub/communication.jpeg');
});

test('inquiry stages, selected deletion, filtered bulk actions and full export are private and validated',async()=>{
  const {env,db,password}=environment();const auth=await login(env,password);
  const insert=db.prepare('INSERT INTO inquiries (id,name,phone,program,consent) VALUES (?,?,?,?,1)');
  for(let n=0;n<25;n++)insert.run('request-'+n,n<23?'검색대상':'다른상담','01012345678','유치부');
  assert.equal((await call(env,'admin/inquiries',{action:'delete',scope:'all'},{})).response.status,401);
  assert.equal((await call(env,'admin/inquiries',{action:'delete',scope:'all'},{cookie:auth.cookie})).response.status,403);
  assert.equal((await call(env,'admin/inquiries',{action:'status',scope:'all',status:'bad'},auth)).response.status,400);
  assert.equal((await call(env,'admin/inquiries',{action:'delete',scope:'selected',ids:[]},auth)).response.status,400);
  assert.equal((await call(env,'admin/inquiries',null,auth)).data.items[0].status,'received');
  let result=await call(env,'admin/inquiries',{action:'status',scope:'selected',ids:['request-0'],status:'contacting'},auth);
  assert.equal(result.data.changed,1);assert.equal(db.prepare('SELECT status FROM inquiries WHERE id=?').get('request-0').status,'contacting');
  result=await call(env,'admin/inquiries',{action:'status',scope:'all',q:'검색대상',status:'completed'},auth);assert.equal(result.data.changed,23);
  assert.equal(db.prepare('SELECT status FROM inquiries WHERE id=?').get('request-24').status,'received');
  result=await call(env,'admin/inquiries?export=1&q='+encodeURIComponent('검색대상'),null,auth);assert.equal(result.data.items.length,23);
  assert.equal((await call(env,'admin/inquiries?export=1')).response.status,401);
  result=await call(env,'admin/inquiries',{action:'delete',scope:'selected',ids:['request-0','request-1']},auth);assert.equal(result.data.changed,2);
  result=await call(env,'admin/inquiries',{action:'delete',scope:'all',q:'검색대상'},auth);assert.equal(result.data.changed,21);
  assert.equal((await call(env,'admin/inquiries',null,auth)).data.total,2);
});

test('consultation channel settings are protected, validated and published independently',async()=>{
 const {env,password}=environment();const auth=await login(env,password);
 assert.equal((await call(env,'admin/channels')).response.status,401);
 const initial=await call(env,'admin/channels',null,auth);assert.equal(initial.data.revision,0);
 const settings={kakao:'https://pf.kakao.com/new-channel/chat',naver:'https://talk.naver.com/profile/new-profile',revision:0};
 assert.equal((await call(env,'admin/channels',settings,{cookie:auth.cookie})).response.status,403);
 for(const bad of ['javascript:alert(1)','https://kakao.com.evil.example/chat','https://user:password@pf.kakao.com/chat'])assert.equal((await call(env,'admin/channels',{...settings,kakao:bad},auth)).response.status,400);
 assert.equal((await call(env,'admin/channels',settings,auth)).response.status,200);
 assert.equal((await call(env,'admin/channels',settings,auth)).response.status,409);
 const published=await call(env,'content/channels');assert.deepEqual(published.data,{kakao:settings.kakao,naver:settings.naver});
 const saved=await call(env,'admin/channels',null,auth);assert.equal(saved.data.revision,1);assert.equal(saved.data.kakao,settings.kakao);
});

test('shared site information saves with SNS links and legacy channel writes preserve basic info',async()=>{
 const {env,password}=environment();const auth=await login(env,password);
 const previous=await call(env,'admin/site-info',null,auth);
 assert.equal(previous.data.academyName,'듀포드인터내셔널컬리지어학원');
 const settings={...previous.data,academyName:'새 학원',phone:'02-1234-5678',email:'office@example.com',address:'서울시 용산구 새주소 12',registration:'제999호'};
 assert.equal((await call(env,'admin/site-info',settings)).response.status,401);
 assert.equal((await call(env,'admin/site-info',settings,{cookie:auth.cookie})).response.status,403);
 assert.equal((await call(env,'admin/site-info',{...settings,email:'invalid'},auth)).response.status,400);
 assert.equal((await call(env,'admin/site-info',{...settings,academyName:''},auth)).response.status,400);
 assert.equal((await call(env,'admin/site-info',settings,auth)).response.status,200);
 assert.equal((await call(env,'admin/site-info',settings,auth)).response.status,409);
 const publicInfo=(await call(env,'content/site-info')).data;
 assert.equal(publicInfo.phone,settings.phone);assert.equal(publicInfo.address,settings.address);assert.equal(publicInfo.registration,settings.registration);assert.equal(publicInfo.revision,undefined);
 assert.equal((await call(env,'admin/channels',{revision:1,kakao:'https://pf.kakao.com/another/chat',naver:settings.naver},auth)).response.status,200);
 assert.equal((await call(env,'content/site-info')).data.academyName,'새 학원');
});


test('social URLs are validated, published and preserved by legacy channel saves',async()=>{
 const {env,password}=environment();const auth=await login(env,password);
 const initial=(await call(env,'admin/site-info',null,auth)).data;
 assert.equal(initial.instagram,'https://www.instagram.com/dewfordcoltd/');
 assert.equal(initial.facebook,'https://www.facebook.com/profile.php?id=61595122751751');
 const settings={...initial,instagram:'https://www.instagram.com/new_dewford/',facebook:'https://www.facebook.com/new.dewford'};
 for(const [field,value] of [['instagram','https://instagram.com.evil.example/profile'],['facebook','javascript:alert(1)'],['facebook','https://instagram.com/profile']]){
  assert.equal((await call(env,'admin/site-info',{...settings,[field]:value},auth)).response.status,400);
 }
 assert.equal((await call(env,'admin/site-info',settings,auth)).response.status,200);
 const published=(await call(env,'content/site-info')).data;
 assert.equal(published.instagram,settings.instagram);assert.equal(published.facebook,settings.facebook);
 assert.equal((await call(env,'admin/channels',{revision:1,kakao:settings.kakao,naver:settings.naver},auth)).response.status,200);
 const preserved=(await call(env,'content/site-info')).data;
 assert.equal(preserved.instagram,settings.instagram);assert.equal(preserved.facebook,settings.facebook);
});

test('calendar date ranges validate, publish, edit and move with duration preserved',async()=>{
 const {env,password}=environment();const auth=await login(env,password);
 for(const endDate of ['2026-10-01','2026-02-30','invalid']){
  assert.equal((await call(env,'admin/content',{action:'save',board:'preschool',revision:0,item:{...item,startDate:'2026-10-06',endDate}},auth)).response.status,400);
 }
 let result=await call(env,'admin/content',{action:'save',board:'preschool',revision:0,item:{...item,startDate:'2026-10-06',endDate:'2026-10-15'}},auth);
 assert.equal(result.response.status,200);
 const saved=result.data.boards.preschool[0];assert.equal(saved.date,'2026-10-06');assert.equal(saved.endDate,'2026-10-15');
 const published=(await call(env,'content/calendar')).data.preschool[0];assert.equal(published.startDate,'2026-10-06');assert.equal(published.endDate,'2026-10-15');
 result=await call(env,'admin/content',{action:'move',board:'preschool',target:'elementary',revision:1,id:saved.id,date:'2026-11-01'},auth);
 assert.equal(result.response.status,200);assert.equal(result.data.boards.elementary[0].startDate,'2026-11-01');assert.equal(result.data.boards.elementary[0].endDate,'2026-11-10');
 result=await call(env,'admin/content',{action:'save',board:'elementary',revision:2,id:saved.id,item:{...item,date:'2026-11-04'}},auth);
 assert.equal(result.response.status,200);assert.equal(result.data.boards.elementary[0].startDate,'2026-11-04');assert.equal(result.data.boards.elementary[0].endDate,'2026-11-04');
});


test('calendar marker color validates, persists through edits and publishes',async()=>{
 const {env,password}=environment();const auth=await login(env,password);
 for(const backgroundColor of ['red','#fff','url(evil)',123])assert.equal((await call(env,'admin/content',{action:'save',board:'elementary',revision:0,item:{...item,backgroundColor}},auth)).response.status,400);
 let result=await call(env,'admin/content',{action:'save',board:'elementary',revision:0,item:{...item,backgroundColor:'#52196d'}},auth);
 assert.equal(result.response.status,200);const saved=result.data.boards.elementary[0];
 assert.equal((await call(env,'content/calendar')).data.elementary[0].backgroundColor,'#52196d');
 result=await call(env,'admin/content',{action:'save',board:'elementary',revision:1,id:saved.id,item:{...item,title:'수정'}},auth);
 assert.equal(result.response.status,200);assert.equal(result.data.boards.elementary[0].backgroundColor,'#52196d');
 result=await call(env,'admin/content',{action:'save',board:'elementary',revision:2,id:saved.id,item:{...item,backgroundColor:'#cdebdc'}},auth);
 assert.equal(result.response.status,200);assert.equal((await call(env,'content/calendar')).data.elementary[0].backgroundColor,'#cdebdc');
});

test('visit analytics deduplicates daily browsers, counts views and requires admin authentication',async()=>{
  const {env,password}=environment();
  const visit={path:'/index.html',visitor:'a'.repeat(32),device:'desktop'};
  assert.equal((await call(env,'analytics/visit',visit)).response.status,200);
  await call(env,'analytics/visit',visit);
  await call(env,'analytics/visit',{...visit,path:'/event.html'});
  await call(env,'analytics/visit',{...visit,visitor:'b'.repeat(32),device:'mobile'});
  assert.equal((await call(env,'admin/analytics')).response.status,401);
  assert.equal((await call(env,'analytics/visit',{...visit,path:'/admin.html'})).response.status,400);
  assert.equal((await call(env,'analytics/visit',visit,{headers:{Origin:'https://evil.example'}})).response.status,403);
  assert.equal((await call(env,'analytics/visit',visit,{headers:{Origin:''}})).response.status,403);
  await call(env,'analytics/visit',visit,{headers:{'User-Agent':'test crawler'}});
  const auth=await login(env,password);
  const result=await call(env,'admin/analytics?days=7',null,auth);
  assert.equal(result.response.status,200);
  assert.equal(result.data.summary.todayVisitors,2);
  assert.equal(result.data.summary.todayViews,4);
  assert.equal(result.data.daily[0].visitors,2);
  assert.equal(result.data.pages[0].views,3);
  assert.equal((await call(env,'admin/analytics?days=365',null,auth)).response.status,400);
});

test('site targets control events, calendars and popups, including direct detail feeds', async () => {
 const {env,password}=environment(),auth=await login(env,password);
 let state=(await call(env,'admin/content',null,auth)).data;
 const save=async (board,entry)=>{
  const result=await call(env,'admin/content',{board,revision:state.revision,action:'save',item:entry},auth);
  if(result.response.ok)state=result.data;
  return result;
 };
 for(const board of ['events','preschool','elementary','popups']) {
  for(const [title,sites] of [['한국어',['ko']],['English',['en']],['Both',['ko','en']]]) {
   assert.equal((await save(board,{...item,title,sites,enabled:true,...(board==='popups'?{link:'/en/admissions-inquiry.html'}:{})})).response.status,200);
  }
  const before=state.revision;
  for(const sites of [[],['fr'],['en','en'],'en']) {
   assert.equal((await save(board,{...item,sites,enabled:true})).response.status,400);
   assert.equal(state.revision,before);
  }
 }
 for(const language of ['ko','en']) {
  for(const [slug,key] of [['events','posts'],['calendar','preschool'],['calendar','elementary'],['popups','popups']]) {
   const feed=(await call(env,'content/'+slug+'?lang='+language)).data[key];
   assert.deepEqual(feed.filter(p=>p.id!=='home-2026').map(p=>p.title).sort(),[language==='en'?'English':'한국어','Both'].sort());
  }
 }
 // An old record without site targets stays on the Korean site only.
 {
  const legacy={events:[{...item,id:'legacy'}],preschool:[],elementary:[],popups:[]};
  const other=environment();
  other.db.prepare('INSERT INTO admin_content(id,revision,payload) VALUES (1,1,?)').run(JSON.stringify(legacy));
  assert.equal((await call(other.env,'content/events?lang=en')).data.posts.length,0);
  assert.equal((await call(other.env,'content/events')).data.posts.length,1);
 }
});

test('legacy public feeds are filtered before the first admin save', async () => {
 const {env,db}=environment();
 db.prepare('INSERT INTO public_content(slug,payload,published) VALUES (?,?,1)').run('events',JSON.stringify({posts:[{...item,id:'legacy'}]}));
 assert.equal((await call(env,'content/events?lang=en')).data.posts.length,0);
 assert.equal((await call(env,'content/events?lang=ko')).data.posts.length,1);
});

test('academy information is localized while social links remain shared', async () => {
 const {env,password}=environment(),auth=await login(env,password);
 const initial=(await call(env,'admin/site-info',null,auth)).data;
 const settings={...initial,academyName:'한국어 학원',en:{academyName:'English Academy',phone:'+82-2-6401-1012',email:'english@dewford.com',address:'27 Jangmun-ro, Seoul',registration:'No. 3355'}};
 assert.equal((await call(env,'admin/site-info',{...settings,en:{...settings.en,email:'bad'}},auth)).response.status,400);
 assert.equal((await call(env,'admin/site-info',settings,auth)).response.status,200);
 const ko=(await call(env,'content/site-info?lang=ko')).data,en=(await call(env,'content/site-info?lang=en')).data;
 assert.equal(ko.academyName,'한국어 학원');assert.equal(en.academyName,'English Academy');assert.equal(en.address,settings.en.address);
 for(const key of ['kakao','naver','instagram','facebook'])assert.equal(ko[key],en[key]);
});

test('both consultation sites arrive in the shared inbox and export with source labels', async () => {
 const {env,password}=environment(),auth=await login(env,password);
 for(const site of ['ko','en']) {
  assert.equal((await call(env,'inquiries',{name:'Parent '+site,phone:'010-1234-5678',program:'기타 상담',message:'Question',consent:true,site})).response.status,201);
 }
 const inbox=(await call(env,'admin/inquiries',null,auth)).data;
 assert.equal(inbox.total,2);assert.deepEqual(inbox.items.map(i=>i.site).sort(),['en','ko']);
 assert.equal((await call(env,'admin/inquiries?export=1',null,auth)).data.items.length,2);
 assert.equal((await call(env,'inquiries',{name:'Invalid',phone:'010-1234-5678',program:'기타 상담',consent:true,site:'fr'})).response.status,400);
});

test('bulk display changes preserve other sites, content and order and validate atomically',async()=>{
 const {env,password}=environment(),auth=await login(env,password);
 let state=(await call(env,'admin/content',null,auth)).data;
 const mutate=async payload=>{const result=await call(env,'admin/content',{board:'events',revision:state.revision,...payload},auth);if(result.response.ok)state=result.data;return result;};
 for(const title of ['untouched','first','second'])await mutate({action:'save',item:{...item,title}});
 const ids=state.boards.events.slice(0,2).map(p=>p.id),original=structuredClone(state.boards.events);
 for(const payload of [
  {ids:[]},{ids:[ids[0],ids[0]]},{ids:[ids[0],'missing']},{sites:[]},{sites:['fr']},{published:'true'},{display:'wrong'}
 ]) {
  const result=await mutate({action:'display-selected',ids,display:'add',sites:['en'],...payload});
  assert.ok(result.response.status>=400);
  assert.deepEqual((await call(env,'admin/content',null,auth)).data.boards.events,original);
 }
 assert.equal((await call(env,'admin/content',{board:'events',action:'display-selected',ids,display:'add',sites:['en'],revision:state.revision-1},auth)).response.status,409);
 await mutate({action:'display-selected',ids,display:'add',sites:['en'],published:true});
 assert.equal((await call(env,'content/events?lang=en')).data.posts.length,2);
 assert.equal((await call(env,'content/events?lang=ko')).data.posts.length,3);
 await mutate({action:'display-selected',ids,display:'remove',sites:['ko']});
 assert.equal((await call(env,'content/events?lang=ko')).data.posts.length,1);
 assert.equal((await call(env,'content/events?lang=en')).data.posts.length,2);
 await mutate({action:'display-selected',ids,display:'keep',published:false});
 assert.equal((await call(env,'content/events?lang=en')).data.posts.length,0);
 await mutate({action:'display-selected',ids,display:'keep',published:true});
 assert.equal((await call(env,'content/events?lang=en')).data.posts.length,2);
 await mutate({action:'display-selected',ids,display:'remove',sites:['en']});
 assert.equal((await call(env,'content/events?lang=en')).data.posts.length,0);
 assert.deepEqual(state.boards.events.map(p=>p.id),original.map(p=>p.id));
 assert.deepEqual(state.boards.events[2],original[2]);
 for(let i=0;i<2;i++){assert.equal(state.boards.events[i].body,original[i].body);assert.deepEqual(state.boards.events[i].sites,[]);}
});

test('popup and calendar publication can be toggled without changing site targets',async()=>{
 const {env,password}=environment(),auth=await login(env,password);
 let state=(await call(env,'admin/content',null,auth)).data;
 for(const board of ['popups','preschool','elementary']){
  let result=await call(env,'admin/content',{board,revision:state.revision,action:'save',item:{...item,sites:['ko','en'],enabled:true}},auth);state=result.data;
  const id=state.boards[board][0].id;
  for(const published of [false,true]){
   result=await call(env,'admin/content',{board,revision:state.revision,action:'display-selected',ids:[id],display:'keep',published},auth);
   assert.equal(result.response.status,200);state=result.data;
   assert.equal(state.boards[board][0].published,published);assert.deepEqual(state.boards[board][0].sites,['ko','en']);
   const feed=(await call(env,'content/'+(board==='popups'?'popups':'calendar')+'?lang=en')).data[board];
   assert.equal(feed.some(p=>p.id===id),published);
  }
 }
});
