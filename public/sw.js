const CACHE_NAME = 'caixinhas-v2'; // Incrementado para forçar atualização
const STATIC_CACHE = 'caixinhas-static-v2';
const DYNAMIC_CACHE = 'caixinhas-dynamic-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install - adiciona assets estáticos ao cache
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
  );
  // Não chama skipWaiting aqui para evitar takeover imediato e possíveis reloads
});

// Activate - limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Não chama clients.claim() para evitar tomar controle dos clients durante navegação ativa
});

// Fetch - estratégia:
// - Para páginas HTML sensíveis a auth (login/logout, /api/*) usa network-only
// - Para demais páginas HTML usa network-first e atualiza cache dinâmico
// - Para assets estáticos usa cache-first
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas intercepta requests do mesmo origin
  if (url.origin !== location.origin) return;

  const pathname = url.pathname;

  // Nunca cachear ou interceptar rotas de API e auth (para evitar respostas stale)
  if (pathname.startsWith('/api') || pathname.startsWith('/api/auth') || pathname === '/logout') {
    // Rede direta, sem cache
    event.respondWith(
      fetch(request).catch(() => new Response(null, { status: 502 }))
    );
    return;
  }

  // Para páginas HTML sensíveis (login/logout) usar network-only
  if (request.headers.get('accept')?.includes('text/html')) {
    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/landing')) {
      event.respondWith(
        fetch(request)
          .then((response) => response)
          .catch(() => {
            return caches.match('/offline') || new Response(
              '<!DOCTYPE html><html><body><h1>Você está offline</h1><p>Verifique sua conexão.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          })
      );
      return;
    }

    // Para outras páginas HTML: network-first
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          console.log('[SW] Network failed, trying cache for:', request.url);
          return caches.match(request).then((response) => {
            if (response) return response;
            return caches.match('/offline') || new Response(
              '<!DOCTYPE html><html><body><h1>Você está offline</h1><p>Verifique sua conexão.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // Para assets estáticos, usa cache-first (como antes)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) return response;

        return fetch(request).then((response) => {
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => {
          // Em caso de falha para assets, devolve fallback se existir
          return caches.match('/offline-asset') || Response.error();
        });
      })
  );
});

// Message handler - para comandos do client
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting phase');
    self.skipWaiting();
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
