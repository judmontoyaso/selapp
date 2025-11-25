// public/service-worker.js

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message || data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.link || data.url || '/',
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'open',
          title: 'Ver ahora',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/icon-192x192.png'
        }
      ],
      tag: data.tag || 'notification',
      requireInteraction: false,
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Selapp', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Si ya hay una ventana abierta, enfócala
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
