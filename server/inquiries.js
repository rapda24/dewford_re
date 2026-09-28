export async function receiveInquiry(request, env) {
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) return { status: 415, error: 'JSON_REQUIRED' };
  if (Number(request.headers.get('Content-Length')) > 20000) return { status: 413, error: 'PAYLOAD_TOO_LARGE' };
  let body;
  try {
    const reader = request.body?.getReader();
    if (!reader) return { status: 400, error: 'INVALID_INPUT' };
    const chunks = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20000) { await reader.cancel(); return { status: 413, error: 'PAYLOAD_TOO_LARGE' }; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return { status: 400, error: 'INVALID_JSON' }; }
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.website) return { status: 400, error: 'INVALID_INPUT' };
  const { name, phone, email = '', program, message = '', consent } = body;
  if (typeof name !== 'string' || !name.trim() || name.length > 80 ||
      typeof phone !== 'string' || !/^[+\d()\s-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7 ||
      typeof email !== 'string' || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      !['국제 유치부','유치 방과후','초등 방과후','기타 상담'].includes(program) ||
      typeof message !== 'string' || message.length > 3000 || consent !== true) return { status: 400, error: 'INVALID_INPUT' };
  if (!env.DB) return { status: 503, error: 'DATABASE_NOT_CONFIGURED' };
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO inquiries (id, name, phone, email, program, message, consent) VALUES (?, ?, ?, ?, ?, ?, 1)')
    .bind(id, name.trim(), phone.trim(), email.trim(), program, message.trim()).run();
  return { status: 201, data: { id } };
}
