"use client";

import { useEffect } from "react";

export default function PushNotifications() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado:", registration);

      // Solicitar permiso para notificaciones
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeToPush(registration);
      }
    } catch (error) {
      console.error("Error al registrar Service Worker:", error);
    }
  }

  async function subscribeToPush(registration: ServiceWorkerRegistration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ),
      });

      // Enviar suscripción al servidor
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-id-placeholder", // TODO: usar usuario autenticado
          subscription,
        }),
      });

      console.log("Suscrito a notificaciones push");
    } catch (error) {
      console.error("Error al suscribirse a push:", error);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return null;
}
