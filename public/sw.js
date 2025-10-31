self.addEventListener('fetch', (event) => {
  // This is a placeholder service worker.
  // In a real app, you would add logic for caching, offline support, etc.
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
