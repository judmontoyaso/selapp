import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/webpush";

interface CreateNotificationParams {
  userId: string;
  type: "verse_of_day" | "reading_reminder" | "diary_reminder" | "achievement" | "custom";
  title: string;
  message: string;
  icon?: string;
  link?: string;
}

/**
 * Crear una notificación para un usuario
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        icon: params.icon,
        link: params.link,
      },
    });

    // Enviar notificación push
    try {
      await sendPushNotification(params.userId, {
        title: params.title,
        message: params.message,
        icon: params.icon,
        link: params.link,
        tag: params.type,
      });
    } catch (pushError) {
      console.error("Error enviando push (pero notificación creada):", pushError);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Crear notificación del versículo del día para todos los usuarios
 */
export async function notifyVerseOfTheDay() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      userId: user.id,
      type: "verse_of_day" as const,
      title: "📖 Nuevo Versículo del Día",
      message: "Ya está disponible el versículo del día. ¡No te lo pierdas!",
      icon: "📖",
      link: "/",
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    console.log(`✅ Notificaciones del versículo del día enviadas a ${users.length} usuarios`);
  } catch (error) {
    console.error("Error sending verse of the day notifications:", error);
  }
}

/**
 * Recordatorio para leer la Biblia
 */
export async function notifyReadingReminder() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Encontrar usuarios que NO han leído hoy
    const usersWithoutReading = await Promise.all(
      users.map(async (user) => {
        const reading = await prisma.dailyReading.findFirst({
          where: {
            userId: user.id,
            date: today,
          },
        });

        return reading ? null : user.id;
      })
    );

    const usersToNotify = usersWithoutReading.filter((id) => id !== null) as string[];

    if (usersToNotify.length > 0) {
      const notifications = usersToNotify.map((userId) => ({
        userId,
        type: "reading_reminder" as const,
        title: "📚 Recordatorio de Lectura",
        message: "Aún no has registrado tu lectura bíblica de hoy. ¡Tómate un momento para leer!",
        icon: "📚",
        link: "/",
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      console.log(`✅ Recordatorios de lectura enviados a ${usersToNotify.length} usuarios`);
    }
  } catch (error) {
    console.error("Error sending reading reminders:", error);
  }
}

/**
 * Recordatorio para escribir en el diario
 */
export async function notifyDiaryReminder() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Encontrar usuarios que NO han escrito en el diario hoy
    const usersWithoutDiary = await Promise.all(
      users.map(async (user) => {
        const entry = await prisma.diaryEntry.findFirst({
          where: {
            userId: user.id,
            date: today,
          },
        });

        return entry ? null : user.id;
      })
    );

    const usersToNotify = usersWithoutDiary.filter((id) => id !== null) as string[];

    if (usersToNotify.length > 0) {
      const notifications = usersToNotify.map((userId) => ({
        userId,
        type: "diary_reminder" as const,
        title: "✍️ ¿Cómo estuvo tu día?",
        message: "Tómate un momento para escribir en tu diario espiritual. Reflexiona sobre tu día.",
        icon: "✍️",
        link: "/notes",
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      console.log(`✅ Recordatorios de diario enviados a ${usersToNotify.length} usuarios`);
    }
  } catch (error) {
    console.error("Error sending diary reminders:", error);
  }
}

/**
 * Notificación de logro (ejemplo: racha de lecturas)
 */
export async function notifyAchievement(userId: string, achievement: {
  title: string;
  message: string;
  icon?: string;
}) {
  try {
    await createNotification({
      userId,
      type: "achievement",
      title: achievement.title,
      message: achievement.message,
      icon: achievement.icon || "🏆",
      link: "/",
    });

    console.log(`✅ Notificación de logro enviada al usuario ${userId}`);
  } catch (error) {
    console.error("Error sending achievement notification:", error);
  }
}

/**
 * Verificar rachas y enviar notificaciones de logros
 */
export async function checkAndNotifyStreaks() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      // Obtener últimas 7 lecturas
      const readings = await prisma.dailyReading.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 7,
      });

      // Racha de 7 días
      if (readings.length === 7) {
        const dates = readings.map((r) => r.date.getTime());
        const isConsecutive = dates.every((date, i) => {
          if (i === 0) return true;
          const diff = (dates[i - 1] - date) / (1000 * 60 * 60 * 24);
          return diff === 1;
        });

        if (isConsecutive) {
          await notifyAchievement(user.id, {
            title: "🔥 ¡Racha de 7 días!",
            message: "¡Increíble! Has leído la Biblia durante 7 días consecutivos. ¡Sigue así!",
            icon: "🔥",
          });
        }
      }

      // Total de semillas (puntos)
      const totalSeeds = await prisma.dailyReading.aggregate({
        where: { userId: user.id },
        _sum: { seeds: true },
      });

      const seeds = totalSeeds._sum.seeds || 0;

      // Notificar hitos de semillas
      if (seeds === 100) {
        await notifyAchievement(user.id, {
          title: "🌱 ¡100 Semillas de Fe!",
          message: "Has alcanzado 100 semillas de fe. ¡Tu crecimiento espiritual está floreciendo!",
          icon: "🌱",
        });
      } else if (seeds === 500) {
        await notifyAchievement(user.id, {
          title: "🌳 ¡500 Semillas de Fe!",
          message: "¡Impresionante! 500 semillas de fe. Eres un ejemplo de dedicación.",
          icon: "🌳",
        });
      } else if (seeds === 1000) {
        await notifyAchievement(user.id, {
          title: "🏆 ¡1000 Semillas de Fe!",
          message: "¡Increíble logro! Has alcanzado 1000 semillas de fe. ¡Eres un verdadero discípulo!",
          icon: "🏆",
        });
      }
    }

    console.log("✅ Verificación de rachas completada");
  } catch (error) {
    console.error("Error checking streaks:", error);
  }
}
