// public/service-worker.js

self.addEventListener('push', function (event) {
  let data = { title: 'Selapp', body: 'Nueva notificación', url: '/' };

  if (event.data) {
    try {
      const json = event.data.json();
      data = {
        title: json.title || 'Selapp',
        body: json.message || json.body || 'Nueva notificación',
        url: json.link || json.url || '/',
        icon: json.icon || '/icon-192x192.png',
        tag: json.tag
      };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: 'Ver' }
    ],
    tag: data.tag,
    requireInteraction: true // Importante para que no desaparezca sola en algunos móviles
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function (clientList) {
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

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});
