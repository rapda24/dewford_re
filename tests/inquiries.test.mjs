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
