import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { generateDevotional } from "@/lib/openai";

// GET: Obtener devocionales (todos o de una fecha específica)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const includeAnswers = searchParams.get("includeAnswers") === "true";

    const session = await getServerSession();
    const userId = session?.user?.email
      ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id
      : null;

    if (date) {
      // Obtener devocional de una fecha específica
      const devotional = await prisma.devotional.findUnique({
        where: { date: new Date(date) },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: includeAnswers && userId
              ? {
                  answers: {
                    where: { userId },
                  },
                }
              : false,
          },
        },
      });

      if (!devotional) {
        return NextResponse.json(
          { error: "Devocional no encontrado para esta fecha" },
          { status: 404 }
        );
      }

      return NextResponse.json(devotional);
    }

    // Obtener todos los devocionales (ordenados por fecha descendente)
    const devotionals = await prisma.devotional.findMany({
      orderBy: { date: "desc" },
      take: 30,
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Formatear fechas para asegurar compatibilidad
    const formattedDevotionals = devotionals.map(d => ({
      ...d,
      date: d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date
    }));

    return NextResponse.json({ devotionals: formattedDevotionals });
  } catch (error) {
    console.error("Error fetching devotionals:", error);
    return NextResponse.json(
      { error: "Error al obtener devocionales" },
      { status: 500 }
    );
  }
}

// POST: Crear devocional (con OpenAI o datos manuales)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      date,
      verseReference,
      verseText,
      book,
      chapter,
      verse,
      theme,
      title,
      reflection,
      questions,
      useAI = true,
    } = body;

    // Validar campos requeridos
    if (!date || !verseReference || !verseText || !theme) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: date, verseReference, verseText, theme" },
        { status: 400 }
      );
    }

    let devotionalData = {
      title: title || theme,
      reflection: reflection || "",
      questions: questions || [],
    };

    // Generar con OpenAI si se solicita
    if (useAI && !title) {
      try {
        devotionalData = await generateDevotional(verseReference, verseText, theme);
      } catch (error) {
        console.error("Error con OpenAI, usando datos manuales:", error);
      }
    }

    // Crear devocional en la base de datos
    const devotional = await prisma.devotional.create({
      data: {
        date: new Date(date),
        title: devotionalData.title,
        theme,
        verseReference,
        verseText,
        book: book || verseReference.split(" ")[0],
        chapter: chapter || parseInt(verseReference.match(/\d+/)?.[0] || "1"),
        verse: verse || verseReference.split(":")[1] || "1",
        reflection: devotionalData.reflection,
        questions: {
          create: devotionalData.questions.map((q, index) => ({
            order: index + 1,
            question: q.question,
            questionType: q.type || "open",
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(devotional);
  } catch (error: any) {
    console.error("Error creating devotional:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear devocional" },
      { status: 500 }
    );
  }
}
