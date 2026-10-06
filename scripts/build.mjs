import { cp, mkdir, readdir, rm, stat, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
let references = '';
for (const entry of await readdir(root)) {
  if (entry.endsWith('.html')) references += await readFile(path.join(root, entry), 'utf8');
}
for (const folder of ['css', 'js']) {
  for (const entry of await readdir(path.join(root, folder))) {
    if (/\.(css|js)$/.test(entry)) references += await readFile(path.join(root, folder, entry), 'utf8');
  }
}
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
// Explicit public assets only: server code, database migrations and secrets stay private.
for (const dir of ['css', 'js', 'images', 'fonts', 'plugins', 'video']) {
  await cp(path.join(root, dir), path.join(dist, dir), {
    recursive: true,
    filter: async source => {
      const info = await stat(source);
      if (info.isFile() && info.size > 25 * 1024 * 1024) {
        // This original is not referenced by any current page; retain it in source only.
        if (['images/', 'video/'].some(prefix => path.relative(root, source).startsWith(prefix)) && !references.includes(path.basename(source))) {
          console.log('Source-only oversized asset: ' + path.relative(root, source));
          return false;
        }
        throw new Error('Asset exceeds Cloudflare 25 MiB limit: ' + source);
      }
      return true;
    }
  });
}
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index_bu.html') {
    await cp(path.join(root, entry.name), path.join(dist, entry.name));
  }
}
console.log('Built public website in dist/');
