import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");

  try {
    const devotionals = await prisma.devotional.findMany({
      where: topic ? { topic } : undefined,
      include: {
        verses: {
          include: {
            verse: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json(devotionals);
  } catch (error) {
    console.error("Error fetching devotionals:", error);
    return NextResponse.json(
      { error: "Error al obtener devocionales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, topic, content, questions, verseIds } = body;

    const devotional = await prisma.devotional.create({
      data: {
        title,
        topic,
        content,
        questions,
        verses: {
          create: verseIds.map((verseId: string, index: number) => ({
            verseId,
            order: index,
          })),
        },
      },
      include: {
        verses: {
          include: {
            verse: true,
          },
        },
      },
    });

    return NextResponse.json(devotional);
  } catch (error) {
    console.error("Error creating devotional:", error);
    return NextResponse.json(
      { error: "Error al crear devocional" },
      { status: 500 }
    );
  }
}
