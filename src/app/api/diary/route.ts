import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET: Obtener entradas del diario (todas o por fecha)
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
    const dateParam = searchParams.get("date");

    if (dateParam) {
      // Obtener entrada de una fecha específica
      const date = new Date(dateParam);
      date.setHours(0, 0, 0, 0);

      const entry = await prisma.diaryEntry.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: date,
          },
        },
      });

      return NextResponse.json(entry);
    } else {
      // Obtener todas las entradas del usuario (últimas 30)
      const entries = await prisma.diaryEntry.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 30,
      });

      return NextResponse.json(entries);
    }
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    return NextResponse.json(
      { error: "Error al obtener entradas del diario" },
      { status: 500 }
    );
  }
}

// POST: Crear o actualizar entrada del día
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
    const { date, gratitude, thoughts, mood, moodScore, achievements, freeNote } = body;

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    // Usar upsert para crear o actualizar
    const entry = await prisma.diaryEntry.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: entryDate,
        },
      },
      update: {
        gratitude,
        thoughts,
        mood,
        moodScore,
        achievements,
        freeNote,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        date: entryDate,
        gratitude,
        thoughts,
        mood,
        moodScore,
        achievements,
        freeNote,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error saving diary entry:", error);
    return NextResponse.json(
      { error: "Error al guardar entrada del diario" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una entrada
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
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
    }

    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);

    await prisma.diaryEntry.delete({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    return NextResponse.json(
      { error: "Error al eliminar entrada del diario" },
      { status: 500 }
    );
  }
}
