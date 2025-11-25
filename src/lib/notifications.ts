import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/webpush";
import { generateDevotional } from "@/lib/openai";

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
    console.error("Error checking streaks:", error);
    throw error;
  }
}

/**
 * Generar devocional del día automáticamente a partir del versículo del día
 */
export async function generateDailyDevotional() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si ya existe devocional para hoy
    const existingDevotional = await prisma.devotional.findUnique({
      where: { date: today },
    });

    if (existingDevotional) {
      console.log(`✅ Devocional para ${today.toISOString().split('T')[0]} ya existe`);
      return existingDevotional;
    }

    // Obtener el versículo del día
    const verseOfDay = await prisma.verseOfTheDay.findUnique({
      where: { date: today },
    });

    if (!verseOfDay) {
      console.log(`⚠️ No hay versículo del día para ${today.toISOString().split('T')[0]}`);
      return null;
    }

    console.log(`🤖 Generando devocional con OpenAI para ${verseOfDay.reference}...`);

    // Generar devocional con OpenAI
    const devotionalContent = await generateDevotional(
      verseOfDay.reference,
      verseOfDay.text,
      verseOfDay.tema || "Reflexión Diaria"
    );

    // Crear devocional en la base de datos
    const devotional = await prisma.devotional.create({
      data: {
        date: today,
        title: devotionalContent.title,
        theme: verseOfDay.tema || "Reflexión Diaria",
        verseReference: verseOfDay.reference,
        verseText: verseOfDay.text,
        reflection: devotionalContent.reflection,
        questions: {
          create: devotionalContent.questions.map((q, index) => ({
            order: index + 1,
            question: q.question,
            questionType: q.type || "open",
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    console.log(`✅ Devocional creado: ${devotional.title}`);

    // Notificar a todos los usuarios
    const users = await prisma.user.findMany();
    const notificationPromises = users.map((user) =>
      createNotification({
        userId: user.id,
        type: "verse_of_day",
        title: "📖 Nuevo Devocional Disponible",
        message: `${devotional.title} - ${verseOfDay.reference}`,
        icon: "📖",
        link: "/devotionals",
      })
    );

    await Promise.allSettled(notificationPromises);
    console.log(`✅ Notificaciones enviadas a ${users.length} usuarios`);

    return devotional;
  } catch (error) {
    console.error("Error generando devocional diario:", error);
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
