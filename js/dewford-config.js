/* Cloudflare hosting: keep /api.
 * GitHub Pages frontend + separate Worker: use https://YOUR-WORKER.workers.dev/api.
 * Public configuration only; never put API tokens or database credentials here.
 */
window.DEWFORD_CONFIG = Object.freeze({ apiBaseUrl: '/api' });
