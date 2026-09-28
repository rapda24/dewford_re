import { receiveInquiry } from './inquiries.js';

function json(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api' && !url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    const headers = { Vary: 'Origin' };
    if (origin && origin !== url.origin && !allowed.includes(origin)) {
      return json({ error: { code: 'ORIGIN_NOT_ALLOWED' } }, 403, headers);
    }
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        ...headers, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Accept, Content-Type', 'Access-Control-Max-Age': '600'
      } });
    }
    if (request.method === 'POST' && url.pathname === '/api/inquiries') {
      try {
        const result = await receiveInquiry(request, env);
        return json(result.error ? { error: { code: result.error } } : { data: result.data }, result.status, headers);
      } catch { return json({ error: { code: 'DATABASE_UNAVAILABLE' } }, 503, headers); }
    }
    if (request.method !== 'GET') {
      return json({ error: { code: 'METHOD_NOT_ALLOWED' } }, 405, { ...headers, Allow: 'GET, OPTIONS' });
    }
    const contentMatch = /^\/api\/content\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(url.pathname);
    if (url.pathname !== '/api/health' && !contentMatch) {
      return json({ error: { code: 'NOT_FOUND' } }, 404, headers);
    }
    if (!env.DB) return json({ error: { code: 'DATABASE_NOT_CONFIGURED' } }, 503, headers);
    try {
      if (url.pathname === '/api/health') {
        await env.DB.prepare('SELECT 1 FROM public_content LIMIT 1').all();
        return json({ data: { status: 'ok', database: 'ready' } }, 200, headers);
      }
      const row = await env.DB.prepare(
        'SELECT slug, payload, updated_at FROM public_content WHERE slug = ? AND published = 1'
      ).bind(contentMatch[1]).first();
      if (!row) return json({ error: { code: 'CONTENT_NOT_FOUND' } }, 404, headers);
      return json({ data: JSON.parse(row.payload), meta: { slug: row.slug, updatedAt: row.updated_at } }, 200, headers);
    } catch {
      return json({ error: { code: 'DATABASE_UNAVAILABLE' } }, 503, headers);
    }
  }
};
