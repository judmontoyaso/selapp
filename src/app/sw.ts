/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// ============================================================================
// LÓGICA DE NOTIFICACIONES PUSH
// ============================================================================

self.addEventListener('push', function (event: PushEvent) {
    let data = { title: 'Selapp', body: 'Nueva notificación', url: '/' };

    if (event.data) {
        try {
            const json = event.data.json();
            data = {
                title: json.title || 'Selapp',
                body: json.message || json.body || 'Nueva notificación',
                url: json.link || json.url || '/',
                ...json
            };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options: any = {
        body: data.body,
        icon: (data as any).icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        // vibrate: [200, 100, 200], // Removido/Comentado según instrucción
        data: {
            url: data.url,
            dateOfArrival: Date.now()
        },
        actions: [
            { action: 'open', title: 'Ver' }
        ],
        tag: (data as any).tag,
        requireInteraction: true // Importante para que no desaparezca sola
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event: NotificationEvent) {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Si ya hay una ventana abierta, enfócala
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return (client as WindowClient).focus();
                }
            }
            // Si no, abre una nueva
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
