/* Kalluumeysato Soomaaliyeed — service worker
   Network-first: app-ku mar walba wuxuu isku dayaa inuu helo nooca ugu cusub;
   haddii internet la'aan jiro, wuxuu isticmaalaa kii la keydiyey.
   Marka aad wax weyn bedesho, kor u qaad nambarka: v3 -> v4 */
const CACHE = 'kalluumeysato-v3';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Open-Meteo, Supabase iyo wax kasta oo dibadda ah toos ayay u mar
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(m => m || caches.match('index.html')))
  );
});
