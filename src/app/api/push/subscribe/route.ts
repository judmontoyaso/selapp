import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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

    const subscription = await request.json();

    // Guardar o actualizar suscripción
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Error al guardar suscripción" },
      { status: 500 }
    );
  }
}

// Desuscribir
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 });
    }

    await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting push subscription:", error);
    return NextResponse.json(
      { error: "Error al eliminar suscripción" },
      { status: 500 }
    );
  }
}
