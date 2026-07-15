// Service Worker - EPI 13 Ruta Materna PWA
const CACHE_NAME = 'epi13-ruta-materna-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Instalación: cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Algunos assets no se cachearon:', err);
      });
    })
  );
});

// Activación: limpiar caches antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: estrategia híbrida
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Supabase / API: Network-first (siempre intentar red primero)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (request.method === 'GET' && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            if (cached) return cached;
            if (request.method === 'GET') {
              return new Response(JSON.stringify({ offline: true, message: 'Sin conexión a internet' }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            throw new Error('Sin conexión');
          });
        })
    );
    return;
  }

  // 2. Assets estáticos: Cache-first
  if (request.method === 'GET' && (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/'
  )) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          fetch(request).then(response => {
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(request, response));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Todo lo demás: Network-only
  event.respondWith(fetch(request));
});

// Sync en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-gestantes') {
    console.log('[SW] Sync background: gestantes');
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SYNC_GESTANTES' }));
      })
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'EPI 13 - Ruta Materna', {
      body: data.body || 'Nueva notificación del sistema',
      icon: 'https://github.com/tsucesarherrera-afk/p/blob/main/imagenes/pngtree-pregnant-woman-vector-art-png-image_15049016.png?raw=true',
      badge: 'https://github.com/tsucesarherrera-afk/p/blob/main/imagenes/pngtree-pregnant-woman-vector-art-png-image_15049016.png?raw=true',
      tag: data.tag || 'epi13',
      requireInteraction: true,
      data: data.url || './'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data || './')
  );
});
