import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Limpiar suscripciones del usuario y forzar re-suscripción
export async function POST() {
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

    // Eliminar todas las suscripciones del usuario
    const deleted = await prisma.pushSubscription.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ 
      success: true,
      message: `${deleted.count} suscripciones eliminadas. Recarga la página para crear una nueva.`,
      deletedCount: deleted.count
    });
  } catch (error) {
    console.error("Error limpiando suscripciones:", error);
    return NextResponse.json(
      { error: "Error al limpiar suscripciones" },
      { status: 500 }
    );
  }
}
