const CACHE = 'linsen-v1';
const ASSETS = ['.', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname === 'api.github.com') return; // Sync-Anfragen nie cachen
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fresh = fetch(e.request)
        .then((res) => {
          if (res.ok && url.origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});

self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}
  const title = data.title || '👁️ Linsen wechseln!';
  const body = data.body || 'Zeit, deine Kontaktlinsen zu wechseln. Bitte in der App bestätigen.';
  e.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body,
      icon: 'icons/icon-180.png',
      badge: 'icons/icon-180.png',
      tag: 'linsen-reminder',
      renotify: true
    });
    if (navigator.setAppBadge && data.badge) {
      try { await navigator.setAppBadge(data.badge); } catch (err) {}
    }
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const wins = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.includes('/linsen')) { w.focus(); return; }
    }
    await clients.openWindow('./');
  })());
});
