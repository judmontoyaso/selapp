import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDevotional } from "@/lib/openai";

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
      book,
      chapter,
      verse,
      theme,
      title,
      reflection,
      questions,
      generateWithAI = true,
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

    let devotionalData = {
      title: title || theme,
      reflection: reflection || "",
      questions: questions || [],
    };

    // Generar con OpenAI si no vienen los datos completos
    if (generateWithAI && (!title || !questions || questions.length === 0)) {
      console.log(`🤖 Generando devocional con OpenAI para ${verseReference}...`);
      try {
        devotionalData = await generateDevotional(verseReference, verseText, theme);
        console.log("✅ Devocional generado con éxito");
      } catch (error) {
        console.error("❌ Error con OpenAI:", error);
        // Continuar con datos manuales si falla OpenAI
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
      generatedWithAI: generateWithAI && devotionalData.questions.length > 0,
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
        book: "Juan",
        chapter: 3,
        verse: "16",
        generateWithAI: true,
      },
    },
  });
}
