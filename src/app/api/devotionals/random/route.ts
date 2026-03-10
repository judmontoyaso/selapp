import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPassage, NVI_NAME } from '@/lib/youversion';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookParam = searchParams.get('book');
    const chapterParam = searchParams.get('chapter');
    const verseParam = searchParams.get('verse');

    let randomVerse;

    // Si se especifican parámetros concretos, buscar ese versículo
    if (bookParam && chapterParam && verseParam) {
      randomVerse = await prisma.bible_verses.findFirst({
        where: {
          libro: bookParam,
          capitulo: parseInt(chapterParam),
          versiculo: verseParam
        }
      });

      if (!randomVerse) {
        return NextResponse.json(
          { error: 'Versículo no encontrado en la base de datos' },
          { status: 404 }
        );
      }
    } else {
      // Versículo aleatorio de la base de datos
      const allVerses = await prisma.bible_verses.findMany({
        where: {
          codigo_libro: { not: null },
          capitulo: { not: null },
          versiculo: { not: null }
        }
      }) as any[];

      if (allVerses.length === 0) {
        return NextResponse.json({ error: 'No hay versículos disponibles' }, { status: 404 });
      }

      randomVerse = allVerses[Math.floor(Math.random() * allVerses.length)];
    }

    const reference = `${randomVerse.libro} ${randomVerse.capitulo}:${randomVerse.versiculo}`;
    const bookCode = randomVerse.codigo_libro || 'GEN';
    const passageId = `${bookCode}.${randomVerse.capitulo}.${randomVerse.versiculo}`;

    try {
      const passage = await getPassage(passageId);
      return NextResponse.json({
        reference: passage.reference || reference,
        text: passage.content,
        chapter: Number(randomVerse.capitulo),
        verses: randomVerse.versiculo || '1',
        book: randomVerse.libro || 'Desconocido',
        tema: randomVerse.tema,
        translation: NVI_NAME,
        version: 'nvi',
        source: 'api'
      });
    } catch (fetchError) {
      console.error('YouVersion API error (random):', fetchError);
    }

    // Fallback si la API falla
    return NextResponse.json({
      reference,
      text: reference,
      chapter: Number(randomVerse.capitulo),
      verses: randomVerse.versiculo || '1',
      book: randomVerse.libro || 'Desconocido',
      tema: randomVerse.tema,
      translation: NVI_NAME,
      version: 'nvi',
      source: 'database'
    });

  } catch (error) {
    console.error('Error obteniendo versículo aleatorio:', error);
    return NextResponse.json(
      { error: 'Error al obtener el versículo' },
      { status: 500 }
    );
  }
}

