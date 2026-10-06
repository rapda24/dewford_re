const encoder = new TextEncoder();
const boards = ['events', 'preschool', 'elementary', 'popups'];
const fail = (code, status = 400) => { throw Object.assign(new Error(code), { status }); };
const digest = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))), b => b.toString(16).padStart(2, '0')).join('');
const equal = (a, b) => { let diff = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return diff === 0; };
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
const cookie = (request, value, age) => `dewford_admin=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
export async function readBody(request, limit = 100000) {
  const reader = request.body?.getReader(); if (!reader) fail('INVALID_INPUT');
  let size = 0; const chunks = [];
  while (true) { const {value, done} = await reader.read(); if (done) break; size += value.length; if (size > limit) { await reader.cancel(); fail('PAYLOAD_TOO_LARGE', 413); } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
async function input(request) {
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) fail('JSON_REQUIRED', 415);
  try { return JSON.parse(new TextDecoder().decode(await readBody(request, 150000))); } catch (error) { if (error.status) throw error; fail('INVALID_JSON'); }
}
async function session(request, env, required = true) {
  const token = /(?:^|;\s*)dewford_admin=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('Cookie') || '')?.[1];
  const record = token ? await env.DB.prepare('SELECT csrf, expires_at FROM admin_sessions WHERE token_hash = ? AND expires_at > ?').bind(await digest(token), Date.now()).first() : null;
  if (!record && required) fail('UNAUTHORIZED', 401);
  return record ? {...record, tokenHash: await digest(token)} : null;
}
async function passwordMatches(password, stored) {
  const [scheme, iterations, salt, expected] = (stored || '').split('$');
  if (scheme !== 'pbkdf2' || !/^[a-f0-9]{64}$/.test(expected || '') || Number(iterations) !== 100000) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bytes = new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:encoder.encode(salt), iterations:Number(iterations)}, key, 256));
  return equal(Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''), expected);
}
async function staticJSON(request, env, path, fallback) {
  if (!env.ASSETS) return fallback;
  const response = await env.ASSETS.fetch(new Request(new URL(path, request.url)));
  try { return response.ok ? await response.json() : fallback; } catch { return fallback; }
}
export async function loadState(request, env) {
  const row = await env.DB.prepare('SELECT revision, payload FROM admin_content WHERE id = 1').bind().first();
  if (row) return {revision:row.revision, boards:JSON.parse(row.payload)};
  const rows = await env.DB.prepare("SELECT slug, payload FROM public_content WHERE slug IN ('events', 'calendar', 'popups') AND published = 1").all();
  const existing = Object.fromEntries(rows.results.map(r => [r.slug, JSON.parse(r.payload)]));
  const events = existing.events || await staticJSON(request, env, '/js/data/dewford-events.json', {posts:[]});
  const calendar = existing.calendar || await staticJSON(request, env, '/js/data/dewford-calendar.json', {});
  const normalize = (items, board) => (items || []).map((item, i) => ({...item, id:item.id || `legacy-${board}-${i}`, published:item.published !== false}));
  return {revision:0, boards:{events:normalize(events.posts, 'events'), preschool:normalize(calendar.preschool, 'preschool'), elementary:normalize(calendar.elementary, 'elementary'), popups:normalize(existing.popups?.popups || [{id:'home-2026', title:'DEWFORD 안내', image:'images/sub/pop2026_1.png', enabled:true, published:true, width:480}])}};
}
export async function managedPublic(request, env, slug) {
  if (!['events','calendar','popups'].includes(slug)) return null;
  const row = await env.DB.prepare('SELECT revision, payload FROM admin_content WHERE id = 1').bind().first();
  if (!row) return null;
  const state = JSON.parse(row.payload);
  const visible = items => items.filter(item => item.published !== false);
  if (slug === 'events') return {posts:visible(state.events), ordered:true};
  if (slug === 'calendar') return {preschool:visible(state.preschool), elementary:visible(state.elementary)};
  const now = Date.now();
  return {popups:visible(state.popups).filter(p => p.enabled && (!p.startsAt || Date.parse(p.startsAt) <= now) && (!p.endsAt || Date.parse(p.endsAt) >= now))};
}
function text(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail('INVALID_INPUT');
  return value.trim();
}
function safeURL(value, required = false) {
  value = text(value || '', 2000, required); if (!value) return '';
  if (/^(images\/|\/api\/media\/)[a-zA-Z0-9_./%-]+$/.test(value) && !value.includes('..')) return value;
  if (/^(?:\/)?[a-zA-Z0-9_-]+\.html(?:[?#][a-zA-Z0-9_=&%.-]*)?$/.test(value)) return value;
  try { const url = new URL(value); if (['http:','https:'].includes(url.protocol)) return url.href; } catch {}
  fail('INVALID_URL');
}
function date(value, required = false) {
  value = text(value || '', 10, required);
  if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value + 'T00:00:00Z')) || new Date(value + 'T00:00:00Z').toISOString().slice(0,10) !== value)) fail('INVALID_DATE');
  return value;
}
function itemInput(item, board, previous = {}) {
  if (!item || typeof item !== 'object') fail('INVALID_INPUT');
  const record = {...previous, title:text(item.title, 200, true), image:safeURL(item.image, board === 'popups'), published:item.published !== false};
  delete record.category;
  if (board === 'popups') {
    record.enabled = item.enabled === true; record.link = safeURL(item.link);
    record.width = Number(item.width || 480); if (record.width < 240 || record.width > 1000 || !Number.isInteger(record.width)) fail('INVALID_INPUT');
    for (const field of ['startsAt','endsAt']) { record[field] = text(item[field] || '', 40); if (record[field] && !Number.isFinite(Date.parse(record[field]))) fail('INVALID_DATE'); }
    if (record.startsAt && record.endsAt && Date.parse(record.startsAt) > Date.parse(record.endsAt)) fail('INVALID_DATE');
  } else {
    record.date = date(item.date, true);
    record.body = text(item.body || '', 30000); record.description = record.body;
    record.excerpt = text(item.excerpt || '', 1000);
    if (item.gallery && !Array.isArray(item.gallery)) fail('INVALID_INPUT');
    record.gallery = (item.gallery || []).map(src => safeURL(src, true)); if (record.gallery.length > 20) fail('INVALID_INPUT');
    if (record.body !== (previous.body || previous.description || '')) delete record.content;
  }
  return record;
}
export function mutateState(state, body) {
  if (!body || typeof body !== 'object') fail('INVALID_INPUT');
  if (!boards.includes(body.board)) fail('INVALID_BOARD');
  const list = state.boards[body.board]; const index = list.findIndex(item => item.id === body.id);
  if (body.action === 'save') {
    if (body.id && index < 0) fail('ITEM_NOT_FOUND', 404);
    const item = itemInput(body.item, body.board, index >= 0 ? list[index] : {});
    item.id = index >= 0 ? list[index].id : crypto.randomUUID(); item.updatedAt = new Date().toISOString();
    if (index >= 0) list[index] = item; else list.unshift(item);
  } else {
    if (index < 0) fail('ITEM_NOT_FOUND', 404);
    if (body.action === 'delete') list.splice(index, 1);
    else if (body.action === 'reorder') {
      if (![1,-1].includes(body.direction)) fail('INVALID_INPUT');
      const target = index + body.direction;
      if (target >= 0 && target < list.length) [list[index],list[target]] = [list[target],list[index]];
    } else if (body.action === 'move') {
      if (!boards.includes(body.target) || body.target === body.board || [body.target,body.board].includes('popups')) fail('INVALID_BOARD');
      if (state.boards[body.target].some(item => item.id === body.id)) fail('DUPLICATE_ITEM', 409);
      const item = list[index]; item.date = date(body.date || item.date, true);
      item.description = item.body || item.description || ''; item.body = item.body || item.description;
      list.splice(index,1); state.boards[body.target].unshift(item);
    } else fail('INVALID_ACTION');
  }
  return state;
}
export async function adminRoute(request, env) {
  const path = new URL(request.url).pathname;
  if (!env.DB) fail('DATABASE_NOT_CONFIGURED', 503);
  if (request.method === 'POST') {
    if (request.headers.get('Origin') !== new URL(request.url).origin) fail('ORIGIN_NOT_ALLOWED', 403);
  }
  if (path === '/api/admin/login' && request.method === 'POST') {
    if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD_HASH) fail('ADMIN_NOT_CONFIGURED', 503);
    const body = await input(request); if (!body || typeof body !== 'object') fail('INVALID_INPUT'); const username = text(body.username, 100); if (typeof body.password !== 'string' || body.password.length > 500) fail('INVALID_INPUT'); const password = body.password;
    const now = Date.now(); const bucket = await digest((request.headers.get('CF-Connecting-IP') || 'local') + ':' + Math.floor(now / 900000));
    await env.DB.prepare('DELETE FROM admin_login_limits WHERE expires_at < ?').bind(now).run();
    const attempt = await env.DB.prepare('INSERT INTO admin_login_limits (bucket, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(bucket, now + 900000).first();
    if (attempt.attempts > 10) fail('TOO_MANY_ATTEMPTS', 429);
    const valid = await passwordMatches(password, env.ADMIN_PASSWORD_HASH);
    if (!equal(username, env.ADMIN_USERNAME) || !valid) fail('INVALID_CREDENTIALS', 401);
    const token = random(); const csrf = random();
    await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(now).run();
    await env.DB.prepare('INSERT INTO admin_sessions (token_hash, csrf, expires_at) VALUES (?, ?, ?)').bind(await digest(token), csrf, now + 28800000).run();
    return {data:{authenticated:true, csrf}, headers:{'Set-Cookie':cookie(request, token, 28800)}};
  }
  const auth = await session(request, env, false);
  if (path === '/api/admin/session' && request.method === 'GET') return {data:auth ? {authenticated:true, csrf:auth.csrf} : {authenticated:false}};
  if (!auth) fail('UNAUTHORIZED', 401);
  if (request.method === 'POST' && !equal(request.headers.get('X-CSRF-Token') || '', auth.csrf)) fail('CSRF_INVALID', 403);
  if (path === '/api/admin/logout' && request.method === 'POST') {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(auth.tokenHash).run();
    return {data:{authenticated:false}, headers:{'Set-Cookie':cookie(request, '', 0)}};
  }
  if (path === '/api/admin/content' && request.method === 'GET') return {data:await loadState(request, env)};
  if (path === '/api/admin/content' && request.method === 'POST') {
    const body = await input(request); if (!body || typeof body !== 'object') fail('INVALID_INPUT'); const state = await loadState(request, env);
    if (body.revision !== state.revision) fail('CONTENT_CHANGED', 409);
    mutateState(state, body); const payload = JSON.stringify(state.boards); if (encoder.encode(payload).length > 1500000) fail('CONTENT_TOO_LARGE', 413);
    const result = await env.DB.prepare('INSERT INTO admin_content (id, revision, payload) VALUES (1, 1, ?) ON CONFLICT(id) DO UPDATE SET revision = admin_content.revision + 1, payload = excluded.payload WHERE admin_content.revision = ?').bind(payload, body.revision).run();
    if (!result.meta.changes) fail('CONTENT_CHANGED', 409);
    return {data:{...state,revision:state.revision + 1}};
  }
  if (path === '/api/admin/upload' && request.method === 'POST') {
    if (!env.MEDIA) fail('MEDIA_NOT_CONFIGURED', 503);
    const bytes = await readBody(request, 5 * 1024 * 1024);
    let type, extension;
    if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) {type='image/png';extension='png';}
    else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {type='image/jpeg';extension='jpg';}
    else if (new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP') {type='image/webp';extension='webp';}
    else fail('UNSUPPORTED_IMAGE', 415);
    const key = crypto.randomUUID() + '.' + extension;
    await env.MEDIA.put(key, bytes, {httpMetadata:{contentType:type}});
    return {data:{url:'/api/media/' + key}};
  }
  fail('NOT_FOUND', 404);
}
