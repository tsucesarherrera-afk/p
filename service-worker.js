const CACHE_NAME = 'epi-ruta-materna-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-48x48.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-144x144.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png'
];

// Instalación: cachear shell de la app
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Shell cacheado');
      return self.skipWaiting();
    }).catch((err) => {
      console.warn('[SW] Error cacheando:', err);
      // Continuar igual para no bloquear la instalación
      return self.skipWaiting();
    })
  );
});

// Activación: limpiar caches antiguas y tomar control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Eliminando cache antigua:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: estrategia híbrida
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Peticiones a Supabase (API): siempre red, con fallback offline
  if (url.hostname.includes('supabase') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardar en cache dinámica para offline básico
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Si no hay cache y no hay red, devolver respuesta offline para JSON
            if (request.headers.get('accept')?.includes('application/json')) {
              return new Response(
                JSON.stringify({ error: 'Sin conexión a internet', offline: true }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              );
            }
            return caches.match('./index.html');
          });
        })
    );
    return;
  }

  // 2. Recursos de la app (HTML, iconos, manifest): cache-first
  if (request.mode === 'navigate' || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Refrescar en background
          fetch(request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // 3. Todo lo demás (CDN, imágenes externas): pasar directo
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => {
        // Último recurso: devolver HTML para navegación
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Mensajes desde la app (skip waiting manual)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
