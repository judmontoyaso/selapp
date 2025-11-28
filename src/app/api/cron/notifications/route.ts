import { NextResponse } from "next/server";
import {
  notifyVerseOfTheDay,
  notifyReadingReminder,
  notifyDiaryReminder,
  checkAndNotifyStreaks,
  notifyDevotionalMorning,
} from "@/lib/notifications";

// Este endpoint debe ser protegido con una API key en producción
// O configurarse en Vercel Cron Jobs
export async function GET(request: Request) {
  try {
    // Verificar API key (importante para producción)
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.CRON_SECRET;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const task = searchParams.get("task");

    switch (task) {
      case "generate-devotional":
        // Deprecated or handled by n8n
        return NextResponse.json({
          success: true,
          message: "Tarea generate-devotional es un placeholder (n8n maneja la generación)"
        });

      case "devotional-morning":
        await notifyDevotionalMorning();
        return NextResponse.json({ success: true, message: "Notificación de devocional matutino enviada" });

      case "night-reminders":
        await notifyReadingReminder();
        await notifyDiaryReminder();
        await checkAndNotifyStreaks();
        return NextResponse.json({ success: true, message: "Recordatorios nocturnos enviados" });

      case "verse-of-day":
        await notifyVerseOfTheDay();
        return NextResponse.json({ success: true, message: "Notificaciones del versículo del día enviadas" });

      case "reading-reminder":
        await notifyReadingReminder();
        return NextResponse.json({ success: true, message: "Recordatorios de lectura enviados" });

      case "diary-reminder":
        await notifyDiaryReminder();
        return NextResponse.json({ success: true, message: "Recordatorios de diario enviados" });

      case "check-streaks":
        await checkAndNotifyStreaks();
        return NextResponse.json({ success: true, message: "Verificación de rachas completada" });

      case "all":
        // Ejecutar todas las tareas para testing
        await notifyDevotionalMorning();
        await notifyReadingReminder();
        await notifyDiaryReminder();
        await checkAndNotifyStreaks();
        return NextResponse.json({ success: true, message: "Todas las tareas ejecutadas" });

      default:
        return NextResponse.json(
          {
            error: "Tarea no especificada o inválida",
            availableTasks: ["devotional-morning", "night-reminders", "verse-of-day", "reading-reminder", "diary-reminder", "check-streaks", "all"]
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error executing cron task:", error);
    return NextResponse.json(
      { error: "Error ejecutando tarea programada" },
      { status: 500 }
    );
  }
}
