import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/webpush";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Enviar notificación push directamente
    await sendPushNotification(user.id, {
      title: "🔔 Prueba de Push",
      message: `Notificación enviada a las ${new Date().toLocaleTimeString('es-ES')}`,
      icon: "🔔",
      link: "/",
      tag: "test-push"
    });

    return NextResponse.json({ 
      success: true,
      message: "Push enviado correctamente",
      time: new Date().toLocaleTimeString('es-ES')
    });
  } catch (error: any) {
    console.error("Error enviando test push:", error);
    return NextResponse.json(
      { 
        error: "Error al enviar push",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
