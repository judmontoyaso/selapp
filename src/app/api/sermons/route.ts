import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET: Obtener todos los sermones del usuario autenticado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el usuario por email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const sermons = await prisma.sermons.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        date: "desc",
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(sermons);
  } catch (error) {
    console.error("Error fetching sermons:", error);
    return NextResponse.json(
      { error: "Error al obtener sermones" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo sermón
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el usuario por email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, pastor, date } = body;

    if (!title || !pastor) {
      return NextResponse.json(
        { error: "Título y pastor son requeridos" },
        { status: 400 }
      );
    }

    const sermon = await prisma.sermons.create({
      data: {
        title,
        pastor,
        date: date ? new Date(date) : new Date(),
        userId: user.id,
      },
    });

    return NextResponse.json(sermon);
  } catch (error) {
    console.error("Error creating sermon:", error);
    return NextResponse.json(
      { error: "Error al crear sermón" },
      { status: 500 }
    );
  }
}
