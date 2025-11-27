import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Helper para configurar VAPID
const configureVapid = () => {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@selapp.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured. Check NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
};

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
    configureVapid();

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
          console.log(`✅ Push enviado a ${sub.endpoint.substring(0, 30)}...`);
        } catch (error: any) {
          // Si la suscripción expiró o es inválida, eliminarla
          if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 401) {
            console.log(`🗑️ Eliminando suscripción expirada (${error.statusCode}): ${sub.id}`);
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => { });
          } else {
            console.error(`❌ Error enviando push (statusCode: ${error.statusCode}):`, error.message);
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`📊 Push para usuario ${userId}: ${successful} exitosos, ${failed} fallidos`);

    // Si todas fallaron, notificar al usuario que debe reactivar
    if (successful === 0 && subscriptions.length > 0) {
      console.log(`⚠️ Usuario ${userId} necesita reactivar notificaciones`);
    }
  } catch (error) {
    console.error("Error en sendPushNotification:", error);
    // No lanzar error para no romper el flujo principal (ej: cron job)
  }
}

/**
 * Enviar notificación push a todos los usuarios
 */
export async function sendPushToAll(data: PushNotificationData) {
  try {
    configureVapid();

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
          // Eliminar suscripciones expiradas o inválidas
          if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 401) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => { });
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`📊 Push masivo: ${successful} exitosos, ${failed} fallidos de ${subscriptions.length} total`);

    return { successful, failed, total: subscriptions.length };
  } catch (error) {
    console.error("Error en sendPushToAll:", error);
    // No lanzar error para no romper el flujo principal
  }
}
