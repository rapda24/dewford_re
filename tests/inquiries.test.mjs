import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/worker.js';
const valid = { name: '테스트', phone: '010-0000-0000', email: '', program: '기타 상담', message: 'local test', consent: true };
const req = data => new Request('https://dewford.example/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
test('consultation rejects missing consent and invalid fields before storage', async () => {
  for (const body of [{...valid, consent:false}, {...valid, name:''}, {...valid, email:'invalid'}, {...valid, website:'spam'}, {...valid, message:'a'.repeat(3001)}]) {
    assert.equal((await worker.fetch(req(body), {})).status, 400);
  }
});
test('consultation stores private fields with bound parameters and returns only ID', async () => {
  let values;
  const DB = { prepare(sql) { assert.match(sql, /^INSERT INTO inquiries/); return { bind(...args) { values=args; return { run: async () => ({success:true}) }; } }; } };
  const response=await worker.fetch(req(valid), {DB});
  assert.equal(response.status,201);assert.equal(values[1],valid.name);
  const body=await response.json();assert.deepEqual(Object.keys(body.data),['id']);
  assert.equal((await worker.fetch(new Request('https://dewford.example/api/inquiries'),{DB})).status,404);
});
test('consultation reports DB failure rather than claiming success', async () => {
  assert.equal((await worker.fetch(req(valid), {})).status,503);
  assert.equal((await worker.fetch(req(valid), {DB:{prepare(){throw new Error('private');}}})).status,503);
});

test('consultation emails the saved inquiry and keeps acceptance on mail failure', async t => {
  let stored=false;
  const DB={prepare(){return {bind(){return {async run(){stored=true;return {success:true};}};}};}};
  const env={DB,RESEND_API_KEY:'test-key',INQUIRY_EMAIL_FROM:'DEWFORD <notifications@dewford.com>'};
  const sent=[];
  t.mock.method(globalThis,'fetch',async (url,options)=>{
    assert.equal(stored,true);
    assert.equal(url,'https://api.resend.com/emails');
    assert.equal(options.headers.Authorization,'Bearer test-key');
    const payload=JSON.parse(options.body);sent.push(payload);
    assert.deepEqual(payload.to,['admin@dewford.com']);
    assert.match(payload.text,/010-0000-0000/);
    assert.match(payload.text,/admin-inquiries\.html/);
    assert.match(options.headers['Idempotency-Key'],/^inquiry\//);
    return new Response('{}',{status:sent.length===1?200:503});
  });
  t.mock.method(console,'error',()=>{});
  const pending=[];
  const response=await worker.fetch(req({...valid,email:'parent@example.com'}),env,{waitUntil:promise=>pending.push(promise)});
  assert.equal(response.status,201);await Promise.all(pending);
  assert.equal(sent[0].reply_to,'parent@example.com');
  assert.equal((await worker.fetch(req(valid),env)).status,201);
  assert.equal(sent[1].reply_to,undefined);
});

test('a failed database write never sends a notification',async t=>{
  const send=t.mock.method(globalThis,'fetch',async()=>{throw new Error('unexpected send');});
  const response=await worker.fetch(req(valid),{DB:{prepare(){throw new Error('db failure');}},RESEND_API_KEY:'test',INQUIRY_EMAIL_FROM:'notifications@dewford.com'});
  assert.equal(response.status,503);assert.equal(send.mock.callCount(),0);
});
