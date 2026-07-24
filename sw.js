const CACHE_NAME = 'adriaska-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // للـ API calls (Supabase, Telegram) - لا cache
  if (e.request.url.includes('supabase.co') ||
      e.request.url.includes('api.telegram') ||
      e.request.url.includes('callmebot') ||
      e.request.url.includes('tesseract')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() =>
      e.request.destination === 'document'
        ? caches.match('./index.html')
        : new Response('', {status: 503})
    ))
  );
});
