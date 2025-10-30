import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const category = searchParams.get("category");

  if (!userId) {
    return NextResponse.json(
      { error: "userId es requerido" },
      { status: 400 }
    );
  }

  try {
    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(category && { category }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Error al obtener notas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, content, category, tags } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "userId y content son requeridos" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title,
        content,
        category: category || "sermon",
        tags: tags || [],
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Error al crear nota" },
      { status: 500 }
    );
  }
}
