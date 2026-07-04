import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Verifica sesión y que el sermón pertenezca al usuario autenticado.
// Devuelve el userId o una respuesta de error lista para retornar.
async function authorizeOwner(sermonId: string): Promise<{ userId: string } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const sermon = await prisma.sermons.findUnique({
    where: { id: sermonId },
    select: { userId: true },
  });
  if (!sermon || sermon.userId !== user.id) {
    // 404 también cuando no es el dueño para no revelar que el id existe
    return NextResponse.json({ error: "Sermón no encontrado" }, { status: 404 });
  }

  return { userId: user.id };
}

// GET: Obtener un sermón específico con todos sus mensajes
// Use a loose type for the context parameter to avoid strict RouteContext typing issues
export async function GET(request: Request, context: any) {
  const { params } = context as { params: { id: string } };
  try {
    const auth = await authorizeOwner(params.id);
    if (auth instanceof NextResponse) return auth;

    const sermon = await prisma.sermons.findUnique({
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
    const auth = await authorizeOwner(params.id);
    if (auth instanceof NextResponse) return auth;

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

// PATCH: Actualizar sermón (alternativa a PUT)
export async function PATCH(request: Request, context: any) {
  return PUT(request, context);
}

// DELETE: Eliminar sermón
export async function DELETE(request: Request, context: any) {
  const { params } = context as { params: { id: string } };
  try {
    const auth = await authorizeOwner(params.id);
    if (auth instanceof NextResponse) return auth;

    await prisma.sermons.delete({
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
