import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPassage, NVI_NAME, NVI_BIBLE_ID } from "@/lib/youversion";

export async function GET() {
  try {
    // 1. Buscar siempre el último versículo en versiculos_diarios (guardado por n8n)
    const stored = await prisma.versiculos_diarios.findFirst({
      orderBy: { creado_en: 'desc' }
    });

    if (stored) {
      return NextResponse.json({
        reference: stored.referencia,
        text: stored.texto,
        usfm: stored.usfm,
        bible_id: stored.bible_id,
        version: 'nvi',
        tema: stored.tema,
        translation: NVI_NAME,
        date: stored.creado_en.toISOString(),
        source: 'n8n'
      });
    }

    // 2. Fallback: generarlo desde bible_verses
    const dailyVerse = await generateDailyVerse();

    return NextResponse.json({
      reference: dailyVerse.reference,
      text: dailyVerse.text,
      usfm: dailyVerse.usfm,
      bible_id: NVI_BIBLE_ID,
      book: dailyVerse.book,
      chapter: dailyVerse.chapter,
      verse: dailyVerse.verse,
      version: 'nvi',
      tema: dailyVerse.tema,
      translation: NVI_NAME,
      date: new Date().toISOString(),
      source: 'generated'
    });

  } catch (error) {
    console.error("Error fetching verse of the day:", error);
    return NextResponse.json(
      { error: "Error al obtener el versículo del día" },
      { status: 500 }
    );
  }
}

// Función para generar un versículo basado en la fecha del día
async function generateDailyVerse() {
  try {
    // Obtener todos los versículos de la base de datos
    const allVerses = await prisma.bible_verses.findMany({
      where: {
        libro: { not: null },
        capitulo: { not: null },
        versiculo: { not: null },
        codigo_libro: { not: null }
      }
    });

    if (allVerses.length === 0) {
      // Si no hay versículos en la BD, usar lista predefinida
      return await getFallbackVerse();
    }

    // Usar la fecha del día como semilla para generar un índice consistente
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % allVerses.length;
    
    const selectedVerse = allVerses[index];

    // Construir la referencia bíblica
    const reference = `${selectedVerse.libro} ${selectedVerse.capitulo}:${selectedVerse.versiculo}`;

    const bookCode = selectedVerse.codigo_libro || 'GEN';
    const verseRange = selectedVerse.versiculo || '1';
    const passageId = `${bookCode}.${selectedVerse.capitulo}.${verseRange}`;

    try {
      const passage = await getPassage(passageId);
      return {
        reference: passage.reference || reference,
        text: passage.content,
        usfm: passageId,
        book: selectedVerse.libro!,
        chapter: Number(selectedVerse.capitulo),
        verse: selectedVerse.versiculo!,
        tema: selectedVerse.tema || undefined
      };
    } catch (fetchError) {
      console.error('YouVersion API error (verse-of-day):', fetchError);
    }

    // Fallback si la API falla
    return {
      reference,
      text: reference,
      usfm: passageId,
      book: selectedVerse.libro!,
      chapter: Number(selectedVerse.capitulo),
      verse: selectedVerse.versiculo!,
      tema: selectedVerse.tema || undefined
    };

  } catch (error) {
    console.error("Error generating daily verse:", error);
    return await getFallbackVerse();
  }
}

// Función para obtener un versículo de respaldo
async function getFallbackVerse() {
  const fallbackVerses = [
    { book: "Juan", chapter: 3, verse: "16", bookCode: "JHN", tema: "Amor de Dios" },
    { book: "Salmos", chapter: 23, verse: "1", bookCode: "PSA", tema: "Confianza" },
    { book: "Filipenses", chapter: 4, verse: "13", bookCode: "PHP", tema: "Fortaleza" },
    { book: "Proverbios", chapter: 3, verse: "5-6", bookCode: "PRO", tema: "Confianza en Dios" },
    { book: "Romanos", chapter: 8, verse: "28", bookCode: "ROM", tema: "Propósito de Dios" },
    { book: "Mateo", chapter: 11, verse: "28", bookCode: "MAT", tema: "Descanso en Cristo" },
    { book: "Isaías", chapter: 41, verse: "10", bookCode: "ISA", tema: "No temas" }
  ];

  // Usar la fecha del día para seleccionar uno
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % fallbackVerses.length;
  
  const selected = fallbackVerses[index];
  const reference = `${selected.book} ${selected.chapter}:${selected.verse}`;

  // Intentar obtener desde la API
  const passageId = `${selected.bookCode}.${selected.chapter}.${selected.verse}`;

  try {
    const passage = await getPassage(passageId);
    return {
      reference: passage.reference || reference,
      text: passage.content,
      usfm: passageId,
      book: selected.book,
      chapter: selected.chapter,
      verse: selected.verse,
      tema: selected.tema
    };
  } catch (fetchError) {
    console.error('YouVersion API error (fallback):', fetchError);
  }

  // Último fallback: devolver solo la referencia como texto
  return {
    reference,
    text: reference,
    usfm: passageId,
    book: selected.book,
    chapter: selected.chapter,
    verse: selected.verse,
    tema: selected.tema
  };
}
