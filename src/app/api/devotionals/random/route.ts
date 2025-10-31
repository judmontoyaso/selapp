import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mapeo de versiones de la Biblia disponibles
const bibleVersions: { [key: string]: { id: string; name: string } } = {
  'nbv': { id: '6b7f504f1b6050c1-01', name: 'Biblica® Open Nueva Biblia Viva 2008 (No disponible)' },
  'rvr1909': { id: '592420522e16049f-01', name: 'Reina Valera 1909' },
  'pdpt': { id: '48acedcf8595c754-01', name: 'Spanish Bible, Palabla de Dios para ti' },
  'pdpt-nt': { id: '48acedcf8595c754-02', name: 'Spanish NT + PP, Palabla de Dios para ti' },
  'simple': { id: 'b32b9d1b64b4ef29-01', name: 'The Holy Bible in Simple Spanish' },
  'fbv-nt': { id: '482ddd53705278cc-01', name: 'The New Testament in Spanish, Free Bible Version' },
  'vbl': { id: '482ddd53705278cc-02', name: 'Versión Biblia Libre' }
};

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la query string
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version') || 'simple'; // Default: The Holy Bible in Simple Spanish (NBV no disponible)
    const bookCodeParam = searchParams.get('book');
    const chapterParam = searchParams.get('chapter');
    const verseParam = searchParams.get('verse');

    // Validar versión
    if (!bibleVersions[version]) {
      return NextResponse.json({
        error: 'Versión de Biblia no válida',
        availableVersions: Object.keys(bibleVersions).map(key => ({
          code: key,
          name: bibleVersions[key].name
        }))
      }, { status: 400 });
    }

    const selectedVersion = bibleVersions[version];

    let randomVerse;

    // Si se especifican parámetros específicos de versículo, usar esos
    if (bookCodeParam && chapterParam && verseParam) {
      // Buscar el versículo específico en la base de datos
      randomVerse = await prisma.bible_verses.findFirst({
        where: {
          libro: bookCodeParam, // Usar el nombre del libro en lugar del código
          capitulo: parseInt(chapterParam),
          versiculo: verseParam
        }
      });

      if (!randomVerse) {
        return NextResponse.json({
          error: 'Versículo no encontrado en la base de datos'
        }, { status: 404 });
      }
    } else {
      // Obtener un versículo aleatorio de bible_verses
      const bibleVerses = await prisma.bible_verses.findMany();

      if (bibleVerses.length === 0) {
        return NextResponse.json({ error: 'No hay versículos disponibles' }, { status: 404 });
      }

      // Seleccionar uno aleatorio
      randomVerse = bibleVerses[Math.floor(Math.random() * bibleVerses.length)];
    }

    // Construir la referencia bíblica
    const reference = `${randomVerse.libro} ${randomVerse.capitulo}:${randomVerse.versiculo}`;

    // Usar el código del libro directamente de la base de datos
    const bookCode = randomVerse.codigo_libro || 'GEN';
    const verseRange = randomVerse.versiculo || '1';

    // Usar rest.api.bible con la versión seleccionada
    const bibleId = selectedVersion.id;
    const bibleVerseID = `${bookCode}.${randomVerse.capitulo}.${verseRange}`;

    const bibleApiUrl = `https://rest.api.bible/v1/bibles/${bibleId}/verses/${bibleVerseID}?include-chapter-numbers=false&include-verse-numbers=false`;

    console.log('Consultando rest.api.bible:', bibleApiUrl, 'con bibleVerseID:', bibleVerseID, 'versión:', selectedVersion.name);

    try {
      const response = await fetch(bibleApiUrl, {
        headers: {
          'api-key': 'C1bni7FKP533XUjJ1Et52'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        return NextResponse.json({
          reference,
          // `data.data?.content` from the API is usually HTML already. Use it when present.
          text: data.data?.content || data.content || `<div class="scripture"><p class="q">Texto del versículo ${randomVerse.libro} ${randomVerse.capitulo}:${randomVerse.versiculo} (próximamente con API)</p><p class="citation">${reference}</p></div>`,
          chapter: Number(randomVerse.capitulo),
          verses: randomVerse.versiculo || '1',
          book: randomVerse.libro || 'Desconocido',
          tema: randomVerse.tema,
          translation: selectedVersion.name,
          version: version,
          source: 'api'
        });
      } else {
        console.log('API Response not ok, status:', response.status);
      }
    } catch (fetchError) {
      console.log('Error de fetch rest.api.bible:', fetchError);
    }

    // Fallback: devolver información del versículo de la base de datos
    return NextResponse.json({
      reference,
      // Devuelve HTML compatible con `scripture-styles` para que el front-end lo renderice con estilos.
      text: `<div class="scripture"><p class="q">Texto del versículo ${randomVerse.libro} ${randomVerse.capitulo}:${randomVerse.versiculo} (próximamente con API)</p><p class="citation">${reference}</p></div>`,
      chapter: Number(randomVerse.capitulo),
      verses: randomVerse.versiculo || '1',
      book: randomVerse.libro || 'Desconocido',
      tema: randomVerse.tema,
      translation: selectedVersion.name,
      version: version,
      source: 'database',
      note: 'Integración con API de Bible próximamente'
    });

  } catch (error) {
    console.error('Error obteniendo devocional:', error);
    return NextResponse.json(
      { error: 'Error al obtener el devocional' },
      { status: 500 }
    );
  }
}