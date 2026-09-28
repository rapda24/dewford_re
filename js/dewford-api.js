/* Shared JSON client. Nothing is fetched until a page explicitly requests data. */
(() => {
  'use strict';
  async function get(path, payload) {
    const base = (window.DEWFORD_CONFIG?.apiBaseUrl || '/api').replace(/\/$/, '');
    if (location.protocol === 'file:' && !/^https?:\/\//.test(base)) {
      throw new Error('API 요청은 Cloudflare 개발 서버에서 실행하거나 apiBaseUrl을 설정해 주세요.');
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(base + path, {
        method: payload ? 'POST' : 'GET',
        headers: payload ? { Accept: 'application/json', 'Content-Type': 'application/json' } : { Accept: 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal, credentials: 'omit'
      });
      if (!(response.headers.get('Content-Type') || '').includes('application/json')) {
        throw new Error('JSON API에 연결되지 않았습니다. apiBaseUrl을 확인해 주세요.');
      }
      const result = await response.json();
      if (!response.ok) {
        const error = new Error(result.error?.code || 'API_REQUEST_FAILED');
        error.status = response.status;
        throw error;
      }
      return result;
    } finally { clearTimeout(timeout); }
  }
  window.DewfordAPI = Object.freeze({
    health: () => get('/health'),
    inquire: payload => get('/inquiries', payload),
    content: slug => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid content slug');
      return get('/content/' + encodeURIComponent(slug));
    }
  });
})();
