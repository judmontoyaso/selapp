"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PushNotificationSetup() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!session) return;

    // Verificar soporte de notificaciones
    if (!("Notification" in window)) {
      console.log("Este navegador no soporta notificaciones");
      return;
    }

    setPermission(Notification.permission);

    // Registrar service worker
    if ("serviceWorker" in navigator) {
      registerServiceWorker();
    }

    // Mostrar prompt después de 3 segundos si no han dado permiso
    if (Notification.permission === "default") {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/"
      });
      
      await navigator.serviceWorker.ready;
      console.log("✅ Service Worker registrado y activo:", registration);

      // Verificar si ya está suscrito
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      // Si tiene permiso y no está suscrito, suscribir automáticamente
      if (Notification.permission === "granted" && !subscription) {
        await subscribeToPush(registration);
      }
    } catch (error) {
      console.error("❌ Error registrando Service Worker:", error);
    }
  };

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.error("VAPID public key no configurada");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Guardar suscripción en el servidor
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setShowPrompt(false);
        console.log("✅ Suscrito a notificaciones push");
        
        // Enviar notificación de prueba inmediatamente
        registration.showNotification("¡Notificaciones Activadas! 🎉", {
          body: "Ahora recibirás avisos del versículo del día y recordatorios",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: "welcome",
          requireInteraction: false,
        });
      }
    } catch (error) {
      console.error("❌ Error suscribiendo a push:", error);
    }
  };

  const requestPermission = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        console.log("✅ Permiso de notificaciones concedido");
        // Registrar service worker y suscribir
        const registration = await navigator.serviceWorker.ready;
        await subscribeToPush(registration);
      } else {
        console.log("❌ Permiso de notificaciones denegado");
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("❌ Error solicitando permiso:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!session || !showPrompt || permission === "granted") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-xl shadow-2xl border-2 border-selapp-accent p-6 animate-slide-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-selapp-brown/60 hover:text-selapp-brown text-xl"
      >
        ✕
      </button>

      <div className="flex items-start gap-4">
        <div className="text-4xl">🔔</div>
        <div className="flex-1">
          <h3 className="font-bold text-selapp-brown mb-2">
            ¿Activar notificaciones?
          </h3>
          <p className="text-sm text-selapp-brown/70 mb-4">
            Recibe avisos del versículo del día, recordatorios y logros directamente en tu dispositivo
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="flex-1 bg-selapp-accent hover:bg-selapp-accent-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Activar
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
