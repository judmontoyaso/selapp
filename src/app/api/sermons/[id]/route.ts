import { prisma, safeQuery } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Obtener un sermón específico con todos sus mensajes
// Use a loose type for the context parameter to avoid strict RouteContext typing issues
export async function GET(request: Request, context: any) {
  const { params } = context as { params: { id: string } };
  try {
    const sermon = await safeQuery(() =>
      prisma.sermons.findUnique({
        where: {
          id: params.id,
        },
        include: {
          messages: {
            orderBy: {
              order: "asc",
            },
            include: {
              images: true,
            },
          },
        },
      })
    );

    if (!sermon) {
      return NextResponse.json(
        { error: "Sermón no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(sermon);
  } catch (error) {
    console.error("Error fetching sermon:", error);
    return NextResponse.json(
      { error: "Error al obtener sermón" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar sermón
export async function PUT(request: Request, context: any) {
  const { params } = context as { params: { id: string } };
  try {
    const body = await request.json();
    const { title, pastor, date } = body;

    const sermon = await prisma.sermons.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title && { title }),
        ...(pastor && { pastor }),
        ...(date && { date: new Date(date) }),
      },
    });

    return NextResponse.json(sermon);
  } catch (error) {
    console.error("Error updating sermon:", error);
    return NextResponse.json(
      { error: "Error al actualizar sermón" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar sermón
export async function DELETE(request: Request, context: any) {
  const { params } = context as { params: { id: string } };
  try {
    await safeQuery(() =>
      prisma.sermons.delete({
        where: {
          id: params.id,
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sermon:", error);
    return NextResponse.json(
      { error: "Error al eliminar sermón" },
      { status: 500 }
    );
  }
}
