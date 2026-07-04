import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPassage, resolveVersion } from "@/lib/youversion";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bible = resolveVersion(searchParams.get("version"));

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
      const passage = await getPassage(usfm, "text", bible.key);
      return NextResponse.json({
        reference: passage.reference || reference,
        text: passage.content,
        usfm,
        bible_id: bible.id,
        tema: randomVerse.tema ?? undefined,
        translation: bible.name,
        version: bible.key,
        abbreviation: bible.abbreviation,
      });
    } catch {
      // Fallback si YouVersion falla
      return NextResponse.json({
        reference,
        text: reference,
        usfm,
        bible_id: bible.id,
        tema: randomVerse.tema ?? undefined,
        translation: bible.name,
        version: bible.key,
        abbreviation: bible.abbreviation,
      });
    }
  } catch (error) {
    console.error("Error getting random verse:", error);
    return NextResponse.json({ error: "Error al obtener versículo" }, { status: 500 });
  }
}
