import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BIBLE_API_KEY = "C1bni7FKP533XUjJ1Et52";

// Mapeo de versiones de la Biblia disponibles (igual que en /api/devotionals/random)
const bibleVersions: { [key: string]: { id: string; name: string } } = {
  'nbv': { id: '6b7f504f1b6050c1-01', name: 'Biblica® Open Nueva Biblia Viva 2008 (No disponible)' },
  'rvr1909': { id: '592420522e16049f-01', name: 'Reina Valera 1909' },
  'pdpt': { id: '48acedcf8595c754-01', name: 'Spanish Bible, Palabla de Dios para ti' },
  'pdpt-nt': { id: '48acedcf8595c754-02', name: 'Spanish NT + PP, Palabla de Dios para ti' },
  'simple': { id: 'b32b9d1b64b4ef29-01', name: 'The Holy Bible in Simple Spanish' },
  'fbv-nt': { id: '482ddd53705278cc-01', name: 'The New Testament in Spanish, Free Bible Version' },
  'vbl': { id: '482ddd53705278cc-02', name: 'Versión Biblia Libre' }
};

// Versión por defecto
const DEFAULT_VERSION = "simple";

export async function GET() {
  try {
    // Generar versículo del día basado en la fecha (mismo para todos los usuarios)
    const dailyVerse = await generateDailyVerse();

    return NextResponse.json({
      reference: dailyVerse.reference,
      text: dailyVerse.text,
      book: dailyVerse.book,
      chapter: dailyVerse.chapter,
      verse: dailyVerse.verse,
      version: DEFAULT_VERSION,
      tema: dailyVerse.tema,
      translation: bibleVersions[DEFAULT_VERSION].name,
      date: new Date().toISOString(),
      source: 'api-generated'
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

    // Obtener el texto desde la API de Bible usando rest.api.bible
    const bookCode = selectedVerse.codigo_libro || 'GEN';
    const verseRange = selectedVerse.versiculo || '1';
    const bibleId = bibleVersions[DEFAULT_VERSION].id;
    const bibleVerseID = `${bookCode}.${selectedVerse.capitulo}.${verseRange}`;

    const bibleApiUrl = `https://rest.api.bible/v1/bibles/${bibleId}/verses/${bibleVerseID}?include-chapter-numbers=false&include-verse-numbers=false`;

    console.log('Versículo del día - Consultando rest.api.bible:', bibleApiUrl);

    try {
      const response = await fetch(bibleApiUrl, {
        headers: {
          'api-key': BIBLE_API_KEY
        },
        cache: 'force-cache'
      });

      if (response.ok) {
        const data = await response.json();
        const verseText = data.data?.content || data.content || `<div class="scripture"><p class="q">${reference}</p></div>`;
        
        return {
          reference,
          text: verseText,
          book: selectedVerse.libro!,
          chapter: Number(selectedVerse.capitulo),
          verse: selectedVerse.versiculo!,
          tema: selectedVerse.tema || undefined
        };
      }
    } catch (fetchError) {
      console.error('Error de fetch rest.api.bible:', fetchError);
    }

    // Fallback si la API falla
    return {
      reference,
      text: `<div class="scripture"><p class="q">${reference}</p></div>`,
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
  const bibleId = bibleVersions[DEFAULT_VERSION].id;
  const bibleVerseID = `${selected.bookCode}.${selected.chapter}.${selected.verse}`;
  const bibleApiUrl = `https://rest.api.bible/v1/bibles/${bibleId}/verses/${bibleVerseID}?include-chapter-numbers=false&include-verse-numbers=false`;

  try {
    const response = await fetch(bibleApiUrl, {
      headers: {
        'api-key': BIBLE_API_KEY
      },
      cache: 'force-cache'
    });

    if (response.ok) {
      const data = await response.json();
      const verseText = data.data?.content || data.content || `<div class="scripture"><p class="q">${reference}</p></div>`;
      
      return {
        reference,
        text: verseText,
        book: selected.book,
        chapter: selected.chapter,
        verse: selected.verse,
        tema: selected.tema
      };
    }
  } catch (fetchError) {
    console.error('Error de fetch rest.api.bible (fallback):', fetchError);
  }

  // Último fallback
  return {
    reference,
    text: `<div class="scripture"><p class="q">${reference}</p></div>`,
    book: selected.book,
    chapter: selected.chapter,
    verse: selected.verse,
    tema: selected.tema
  };
}
