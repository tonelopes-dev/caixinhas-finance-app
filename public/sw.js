/**
 * Service Worker - Caixinhas Finance App
 * Versão: v20260112-175747
 * Build: 2026-01-12T17:57:47.300Z
 * Ambiente: PRODUCTION
 */

const VERSION = 'v20260112-175747';
const CACHE_NAME = `caixinhas-${VERSION}`;
const STATIC_CACHE = `caixinhas-static-${VERSION}`;
const DYNAMIC_CACHE = `caixinhas-dynamic-${VERSION}`;
const IS_DEV = false;

// Assets críticos para cache inicial
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ============================================================================
// INSTALL - Cacheia assets estáticos essenciais
// ============================================================================
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log(`[SW ${VERSION}] Caching static assets`);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Em DEV: pula waiting para forçar atualização imediata
        // Em PROD: aguarda para não interromper sessões ativas
        if (IS_DEV) {
          console.log(`[SW ${VERSION}] DEV mode: skipping waiting`);
          return self.skipWaiting();
        }
      })
  );
});

// ============================================================================
// ACTIVATE - Limpa caches antigos e assume controle
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remove qualquer cache que não seja da versão atual
            if (!cacheName.includes(VERSION)) {
              console.log(`[SW ${VERSION}] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Em DEV: assume controle imediatamente
        // Em PROD: assume controle de novos clients apenas
        if (IS_DEV) {
          console.log(`[SW ${VERSION}] DEV mode: claiming clients`);
          return self.clients.claim();
        }
      })
  );
});

// ============================================================================
// FETCH - Estratégias de cache inteligentes
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas intercepta requests do mesmo origin
  if (url.origin !== location.origin) return;

  const pathname = url.pathname;

  // ========================================
  // ESTRATÉGIA 1: Network-only (sem cache)
  // ========================================
  // Rotas de autenticação e API sempre direto da rede
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/api/auth') || 
    pathname === '/logout'
  ) {
    event.respondWith(
      fetch(request).catch(() => 
        new Response(JSON.stringify({ error: 'Network unavailable' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // ========================================
  // ESTRATÉGIA 2: Network-first (HTML)
  // ========================================
  // Páginas HTML sempre tentam rede primeiro
  if (request.headers.get('accept')?.includes('text/html')) {
    // Em DEV: sempre network-only para ver mudanças imediatas
    if (IS_DEV) {
      event.respondWith(
        fetch(request).catch(() => 
          caches.match(request).then(response => 
            response || new Response(
              '<!DOCTYPE html><html><body><h1>Offline</h1></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            )
          )
        )
      );
      return;
    }

    // Em PROD: network-first com fallback para cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => 
              cache.put(request, responseClone)
            );
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            if (response) return response;
            return new Response(
              '<!DOCTYPE html><html><body><h1>Offline</h1><p>Sem conexão.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // ========================================
  // ESTRATÉGIA 3: Stale-while-revalidate (Assets estáticos)
  // ========================================
  // Assets (JS, CSS, imagens): serve do cache mas atualiza em background
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => 
                cache.put(request, responseClone)
              );
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || Response.error());

        // Retorna cache imediatamente, mas atualiza em background
        return cachedResponse || fetchPromise;
      })
  );
});

// ============================================================================
// MESSAGE - Comandos do client
// ============================================================================
self.addEventListener('message', (event) => {
  console.log(`[SW ${VERSION}] Received message:`, event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${VERSION}] Force updating...`);
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }
});

// ============================================================================
// NOTIFICATION CLICK
// ============================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

console.log(`[SW ${VERSION}] Service Worker loaded and ready!`);
