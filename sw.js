// Китайская тарабарщина — сервис-воркер приложения.
// Страница всегда берётся из сети (чтобы обновления приходили сразу),
// кэш — только запасной вариант без интернета. Запросы к базе не кэшируются.
const CACHE = 'tarabar-v1';
const SHELL = ['/', '/index.html', '/icon-192.png', '/icon-512-app.png', '/favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Supabase, шрифты, CDN — напрямую
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('/index.html', copy)); return res; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
