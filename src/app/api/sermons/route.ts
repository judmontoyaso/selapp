import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Obtener todos los sermones
export async function GET() {
  try {
    const sermons = await prisma.sermon.findMany({
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
    const body = await request.json();
    const { title, pastor, date } = body;

    if (!title || !pastor) {
      return NextResponse.json(
        { error: "Título y pastor son requeridos" },
        { status: 400 }
      );
    }

    const sermon = await prisma.sermon.create({
      data: {
        title,
        pastor,
        date: date ? new Date(date) : new Date(),
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
