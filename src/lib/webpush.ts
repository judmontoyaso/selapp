import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Configurar VAPID keys (solo una vez)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@selapp.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface PushNotificationData {
  title: string;
  message: string;
  icon?: string;
  link?: string;
  tag?: string;
}

/**
 * Enviar notificación push a un usuario específico
 */
export async function sendPushNotification(userId: string, data: PushNotificationData) {
  try {
    // Obtener todas las suscripciones del usuario
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log(`Usuario ${userId} no tiene suscripciones push`);
      return;
    }

    const payload = JSON.stringify({
      title: data.title,
      message: data.message,
      icon: data.icon || "/icon-192x192.png",
      link: data.link || "/",
      tag: data.tag || "notification",
    });

    // Enviar a todas las suscripciones del usuario
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
          console.log(`✅ Push enviado a ${sub.endpoint.substring(0, 50)}...`);
        } catch (error: any) {
          // Si la suscripción expiró, eliminarla
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`🗑️ Eliminando suscripción expirada: ${sub.id}`);
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            console.error("Error enviando push:", error);
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`📊 Push enviado: ${successful} exitosos, ${failed} fallidos`);
  } catch (error) {
    console.error("Error en sendPushNotification:", error);
    throw error;
  }
}

/**
 * Enviar notificación push a todos los usuarios
 */
export async function sendPushToAll(data: PushNotificationData) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      include: { user: true },
    });

    if (subscriptions.length === 0) {
      console.log("No hay suscripciones push activas");
      return;
    }

    const payload = JSON.stringify({
      title: data.title,
      message: data.message,
      icon: data.icon || "/icon-192x192.png",
      link: data.link || "/",
      tag: data.tag || "notification",
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`📊 Push masivo: ${successful} exitosos, ${failed} fallidos de ${subscriptions.length} total`);
  } catch (error) {
    console.error("Error en sendPushToAll:", error);
    throw error;
  }
}
