import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { stripHtml, extractReferences, BOOK_NAME_WORDS } from "@/lib/verse-extract";
import { wordFrequencies } from "@/lib/word-stats";

// GET /api/sermons/insights?sermonId=... (opcional)
// Agrega sobre los sermones del usuario: palabras más usadas, versículos y
// libros más mencionados. Con sermonId limita el análisis a un solo sermón.
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const sermonId = searchParams.get("sermonId");

    const sermons = await prisma.sermons.findMany({
      where: {
        userId: user.id,
        ...(sermonId ? { id: sermonId } : {}),
      },
      orderBy: { date: "desc" },
      include: {
        messages: { select: { content: true } },
      },
    });

    if (sermonId && sermons.length === 0) {
      return NextResponse.json({ error: "Sermón no encontrado" }, { status: 404 });
    }

    // Texto plano combinado de todas las notas
    let fullText = "";
    let totalNotes = 0;
    const verseCounts = new Map<string, { reference: string; usfm: string; count: number }>();
    const bookCounts = new Map<string, { book: string; code: string; count: number }>();

    for (const sermon of sermons) {
      for (const message of sermon.messages) {
        totalNotes++;
        const text = stripHtml(message.content);
        fullText += text + "\n";

        for (const ref of extractReferences(text)) {
          const existing = verseCounts.get(ref.usfm);
          if (existing) existing.count++;
          else verseCounts.set(ref.usfm, { reference: ref.reference, usfm: ref.usfm, count: 1 });

          const book = bookCounts.get(ref.book);
          if (book) book.count++;
          else bookCounts.set(ref.book, { book: ref.bookName, code: ref.book, count: 1 });
        }
      }
    }

    const topVerses = [...verseCounts.values()]
      .sort((a, b) => b.count - a.count || a.reference.localeCompare(b.reference))
      .slice(0, 15);

    const topBooks = [...bookCounts.values()]
      .sort((a, b) => b.count - a.count || a.book.localeCompare(b.book))
      .slice(0, 10);

    // Lista liviana de sermones para el selector de la página de estadísticas
    const sermonList = sermonId
      ? []
      : sermons.map((s) => ({ id: s.id, title: s.title, date: s.date }));

    return NextResponse.json({
      scope: sermonId ? "sermon" : "global",
      totalSermons: sermons.length,
      totalNotes,
      words: wordFrequencies(fullText, 60, BOOK_NAME_WORDS),
      topVerses,
      topBooks,
      sermons: sermonList,
    });
  } catch (error) {
    console.error("Error computing sermon insights:", error);
    return NextResponse.json({ error: "Error al calcular estadísticas" }, { status: 500 });
  }
}
