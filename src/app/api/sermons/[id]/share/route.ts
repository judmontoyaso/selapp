import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createShareToken } from "@/lib/share-token";

// POST: Generar link público de solo lectura para compartir el sermón.
// Solo el dueño del sermón puede generar el link.
export async function POST(request: Request, context: any) {
  const { params } = context as { params: { id: string } };
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const sermon = await prisma.sermons.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true, title: true },
    });
    if (!sermon) {
      return NextResponse.json({ error: "Sermón no encontrado" }, { status: 404 });
    }

    const token = createShareToken(sermon.id);
    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;
    return NextResponse.json({
      url: `${origin}/share/sermon/${token}`,
      title: sermon.title,
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json({ error: "Error al generar el link" }, { status: 500 });
  }
}
