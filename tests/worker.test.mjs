import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/worker.js';
const request = (path, options) => new Request('https://dewford.example' + path, options);

test('root serves index.html without changing the query or HEAD method', async () => {
  for (const method of ['GET', 'HEAD']) {
    const response = await worker.fetch(request('/?source=home', {method}), {
      ASSETS: {fetch: assetRequest => {
        assert.equal(new URL(assetRequest.url).pathname, '/index.html');
        assert.equal(new URL(assetRequest.url).search, '?source=home');
        assert.equal(assetRequest.method, method);
        return new Response(method === 'HEAD' ? null : 'home');
      }}
    });
    assert.equal(response.status, 200);
  }
});

test('static pages bypass the database', async () => {
  const response = await worker.fetch(request('/why-dewford.html'), { ASSETS: { fetch: () => new Response('page') } });
  assert.equal(await response.text(), 'page');
});
test('missing database and unknown routes return JSON errors', async () => {
  assert.equal((await worker.fetch(request('/api/health'), {})).status, 503);
  assert.equal((await worker.fetch(request('/api/unknown'), {})).status, 404);
});
test('content query binds slug and only returns published data', async () => {
  const DB = { prepare(sql) {
    assert.match(sql, /published = 1/);
    return { bind(slug) {
      assert.equal(slug, 'why-dewford');
      return { first: async () => ({ slug, payload: '{"title":"Dewford"}', updated_at: '2026-09-28' }) };
    } };
  } };
  const response = await worker.fetch(request('/api/content/why-dewford'), { DB });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.title, 'Dewford');
});
test('missing content is 404; database failures hide internal details', async () => {
  let DB = { prepare: () => ({ bind: () => ({ first: async () => null }) }) };
  assert.equal((await worker.fetch(request('/api/content/events'), { DB })).status, 404);
  DB = { prepare: () => { throw new Error('private connection detail'); } };
  const response = await worker.fetch(request('/api/health'), { DB });
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private connection/);
});
test('writes are not exposed and cross-origin access uses an allowlist', async () => {
  assert.equal((await worker.fetch(request('/api/content/events', { method: 'POST' }), {})).status, 405);
  assert.equal((await worker.fetch(request('/api/health', { headers: { Origin: 'https://unknown.example' } }), {})).status, 403);
  const response = await worker.fetch(request('/api/health', { method: 'OPTIONS', headers: { Origin: 'https://rapda24.github.io' } }), { ALLOWED_ORIGINS: 'https://rapda24.github.io' });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://rapda24.github.io');
});
