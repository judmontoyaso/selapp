import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: Crear nuevo mensaje en un sermón
// Use a loose type for the context parameter to avoid strict RouteContext typing issues
export async function POST(request: Request, context: any) {
  const { params } = context as { params: { id: string } };
  try {
    const body = await request.json();
    const { content, imageUrls } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "El contenido del mensaje es requerido" },
        { status: 400 }
      );
    }

    // Obtener el número de mensajes actuales para calcular el orden
    const messageCount = await prisma.message.count({
      where: {
        sermonId: params.id,
      },
    });

    // Crear el mensaje con sus imágenes
    const message = await prisma.message.create({
      data: {
        sermonId: params.id,
        content,
        order: messageCount,
        ...(imageUrls && imageUrls.length > 0 && {
          images: {
            create: imageUrls.map((img: any) => ({
              url: img.url,
              fileName: img.fileName,
              fileSize: img.fileSize,
            })),
          },
        }),
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Error al crear mensaje" },
      { status: 500 }
    );
  }
}
