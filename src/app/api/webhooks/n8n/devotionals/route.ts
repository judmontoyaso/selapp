import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Webhook para recibir devocionales desde n8n
export async function POST(request: Request) {
  try {
    // Verificar secreto para seguridad
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      verseReference,
      verseText,
      theme,
      title,
      reflection,
      questions,
    } = body;

    // Validar campos requeridos
    if (!date || !verseReference || !verseText || !theme) {
      return NextResponse.json(
        {
          error: "Campos requeridos: date, verseReference, verseText, theme",
          received: body,
        },
        { status: 400 }
      );
    }

    // n8n envía los datos completos ya generados con OpenAI
    const devotionalData = {
      title: title || theme,
      reflection: reflection || "",
      questions: questions || [],
    };

    // Validar que vengan las preguntas
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Se requieren al menos 1 pregunta" },
        { status: 400 }
      );
    }

    // Crear devocional en la base de datos
    const devotional = await prisma.devotional.create({
      data: {
        date: new Date(date),
        title: devotionalData.title,
        theme,
        verseReference,
        verseText,
        reflection: devotionalData.reflection,
        questions: {
          create: devotionalData.questions.map((q: any, index: number) => ({
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

    console.log(`✅ Devocional creado para ${date}: ${devotional.title}`);

    return NextResponse.json({
      success: true,
      devotional,
    });
  } catch (error: any) {
    console.error("Error en webhook n8n:", error);
    return NextResponse.json(
      {
        error: error.message || "Error al procesar webhook",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

// GET: Endpoint de prueba
export async function GET() {
  return NextResponse.json({
    message: "Webhook n8n para devocionales",
    usage: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_N8N_WEBHOOK_SECRET",
      },
      body: {
        date: "2025-11-25",
        verseReference: "Juan 3:16",
        verseText: "Porque de tal manera amó Dios al mundo...",
        theme: "Amor de Dios",
        title: "El amor infinito de Dios",
        reflection: "Texto de reflexión...",
        questions: [
          { question: "¿Pregunta 1?", type: "open" },
          { question: "¿Pregunta 2?", type: "open" },
          { question: "¿Pregunta 3?", type: "open" }
        ],
      },
    },
  });
}
