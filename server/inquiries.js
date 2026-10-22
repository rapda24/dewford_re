async function notifyInquiry(env, inquiry, origin) {
  if (!env.RESEND_API_KEY || !env.INQUIRY_EMAIL_FROM) {
    console.warn('INQUIRY_EMAIL_NOT_CONFIGURED');
    return;
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `inquiry/${inquiry.id}` },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      from: env.INQUIRY_EMAIL_FROM,
      to: ['admin@dewford.com'],
      subject: `[DEWFORD] ${inquiry.program} 상담 신청`,
      ...(inquiry.email ? { reply_to: inquiry.email } : {}),
      text: ['새 상담 신청이 접수되었습니다.', '', `이름: ${inquiry.name}`, `연락처: ${inquiry.phone}`, `이메일: ${inquiry.email || '미입력'}`, `프로그램: ${inquiry.program}`, '', '상담 내용:', inquiry.message || '(없음)', '', `관리자 페이지: ${origin}/admin-inquiries.html`, `접수 번호: ${inquiry.id}`].join('\n')
    })
  });
  if (!response.ok) throw new Error(`INQUIRY_EMAIL_FAILED_${response.status}`);
}

export async function receiveInquiry(request, env, ctx) {
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
  // Email failures must not turn a stored inquiry into a failed submission.
  const notification = notifyInquiry(env, { id, name: name.trim(), phone: phone.trim(), email: email.trim(), program, message: message.trim() }, new URL(request.url).origin)
    .catch(() => console.error('INQUIRY_EMAIL_DELIVERY_FAILED', { id }));
  if (ctx?.waitUntil) ctx.waitUntil(notification);
  else await notification;
  return { status: 201, data: { id } };
}
