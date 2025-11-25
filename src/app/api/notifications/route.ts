import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET: Obtener notificaciones del usuario
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva notificación
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

    const body = await request.json();
    const { type, title, message, icon, link } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title y message son requeridos" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: type || "custom",
        title,
        message,
        icon,
        link,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Error al crear notificación" },
      { status: 500 }
    );
  }
}

// PATCH: Marcar notificaciones como leídas
export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marcar todas las notificaciones como leídas
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json({ success: true, message: "Todas las notificaciones marcadas como leídas" });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "notificationIds debe ser un array" },
        { status: 400 }
      );
    }

    // Marcar notificaciones específicas como leídas
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.id,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Error al marcar notificaciones como leídas" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar notificaciones
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      // Eliminar todas las notificaciones leídas
      await prisma.notification.deleteMany({
        where: {
          userId: user.id,
          read: true,
        },
      });

      return NextResponse.json({ success: true, message: "Notificaciones leídas eliminadas" });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "ID de notificación requerido" },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Error al eliminar notificación" },
      { status: 500 }
    );
  }
}
