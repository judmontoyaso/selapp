import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Obtener un sermón específico con todos sus mensajes
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const sermon = await prisma.sermon.findUnique({
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
    });

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
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { title, pastor, date } = body;

    const sermon = await prisma.sermon.update({
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
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await prisma.sermon.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sermon:", error);
    return NextResponse.json(
      { error: "Error al eliminar sermón" },
      { status: 500 }
    );
  }
}
