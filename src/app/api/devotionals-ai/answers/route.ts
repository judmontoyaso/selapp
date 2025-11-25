import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET: Obtener respuestas del usuario para un devocional
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
    const devotionalId = searchParams.get("devotionalId");

    if (!devotionalId) {
      return NextResponse.json(
        { error: "devotionalId es requerido" },
        { status: 400 }
      );
    }

    const answers = await prisma.devotionalAnswer.findMany({
      where: {
        userId: user.id,
        devotionalId,
      },
      include: {
        question: true,
      },
      orderBy: {
        question: {
          order: "asc",
        },
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Error al obtener respuestas" },
      { status: 500 }
    );
  }
}

// POST: Guardar/actualizar respuesta a una pregunta
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
    const { devotionalId, questionId, answer } = body;

    if (!devotionalId || !questionId || !answer) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Crear o actualizar respuesta
    const devotionalAnswer = await prisma.devotionalAnswer.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
      update: {
        answer,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        devotionalId,
        questionId,
        answer,
      },
      include: {
        question: true,
      },
    });

    return NextResponse.json(devotionalAnswer);
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Error al guardar respuesta" },
      { status: 500 }
    );
  }
}
