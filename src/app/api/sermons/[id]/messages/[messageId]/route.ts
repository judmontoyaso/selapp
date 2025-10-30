import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT: Actualizar mensaje
export async function PUT(
  request: Request,
  context: any
) {
  const { params } = context as { params: { id: string; messageId: string } };
  
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "El contenido es requerido" },
        { status: 400 }
      );
    }

    const message = await prisma.message.update({
      where: {
        id: params.messageId,
      },
      data: {
        content,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Error al actualizar mensaje" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar mensaje
export async function DELETE(
  request: Request,
  context: any
) {
  const { params } = context as { params: { id: string; messageId: string } };
  
  try {
    await prisma.message.delete({
      where: {
        id: params.messageId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Error al eliminar mensaje" },
      { status: 500 }
    );
  }
}
