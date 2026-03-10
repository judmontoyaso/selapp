import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPassage, NVI_NAME, NVI_BIBLE_ID } from "@/lib/youversion";

export async function GET() {
  try {
    const allVerses = await prisma.bible_verses.findMany({
      where: {
        codigo_libro: { not: null },
        capitulo: { not: null },
        versiculo: { not: null },
      },
    });

    if (allVerses.length === 0) {
      return NextResponse.json({ error: "No hay versículos disponibles" }, { status: 404 });
    }

    const randomVerse = allVerses[Math.floor(Math.random() * allVerses.length)];

    const reference = `${randomVerse.libro} ${randomVerse.capitulo}:${randomVerse.versiculo}`;
    const bookCode = randomVerse.codigo_libro || "GEN";
    const usfm = `${bookCode}.${randomVerse.capitulo}.${randomVerse.versiculo}`;

    try {
      const passage = await getPassage(usfm);
      return NextResponse.json({
        reference: passage.reference || reference,
        text: passage.content,
        usfm,
        bible_id: NVI_BIBLE_ID,
        tema: randomVerse.tema ?? undefined,
        translation: NVI_NAME,
        version: "nvi",
      });
    } catch {
      // Fallback si YouVersion falla
      return NextResponse.json({
        reference,
        text: reference,
        usfm,
        bible_id: NVI_BIBLE_ID,
        tema: randomVerse.tema ?? undefined,
        translation: NVI_NAME,
        version: "nvi",
      });
    }
  } catch (error) {
    console.error("Error getting random verse:", error);
    return NextResponse.json({ error: "Error al obtener versículo" }, { status: 500 });
  }
}
