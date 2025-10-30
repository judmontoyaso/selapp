import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import webpush from "web-push";

// Configurar VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: Request) {
  // TODO: Modelo PushSubscription no existe en la base de datos aún
  return NextResponse.json(
    { error: "Endpoint no implementado - Modelo PushSubscription no existe en BD" },
    { status: 501 }
  );
  
  /* DESCOMENTADO CUANDO SE CREE LA TABLA push_subscriptions
  try {
    const body = await request.json();
    const { userId, subscription } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: "userId y subscription son requeridos" },
        { status: 400 }
      );
    }

    // Guardar la suscripción
    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return NextResponse.json(
      { error: "Error al suscribirse a notificaciones" },
      { status: 500 }
    );
  }
  */
}

export async function DELETE(request: Request) {
  // TODO: Modelo PushSubscription no existe en la base de datos aún
  return NextResponse.json(
    { error: "Endpoint no implementado - Modelo PushSubscription no existe en BD" },
    { status: 501 }
  );
  
  /* DESCOMENTADO CUANDO SE CREE LA TABLA push_subscriptions
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "endpoint es requerido" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.delete({
      where: {
        endpoint,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    return NextResponse.json(
      { error: "Error al desuscribirse de notificaciones" },
      { status: 500 }
    );
  }
  */
}
