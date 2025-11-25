import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// Endpoint para crear notificaciones de prueba
export async function POST(request: Request) {
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

    // Crear notificación de prueba
    const notification = await createNotification({
      userId: user.id,
      type: "custom",
      title: "🧪 Notificación de Prueba",
      message: `Esta es una notificación de prueba enviada a las ${new Date().toLocaleTimeString('es-ES')}. ¡El sistema funciona correctamente!`,
      icon: "🧪",
      link: "/",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Notificación de prueba creada",
      notification 
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json(
      { error: "Error al crear notificación de prueba" },
      { status: 500 }
    );
  }
}

// GET: También permitir crear notificación de prueba con GET
export async function GET(request: Request) {
  return POST(request);
}
