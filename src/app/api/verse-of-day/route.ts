import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BIBLE_API_KEY = "C1bni7FKP533XUjJ1Et52";
const BIBLE_API_URL = "https://api.scripture.api.bible/v1";

// Versión por defecto
const DEFAULT_VERSION = "simple"; // Biblia en Español Simple

export async function GET() {
  try {
    // Obtener la fecha de hoy en formato YYYY-MM-DD (UTC)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Intentar obtener el versículo del día existente
    let verseOfDay = await prisma.verseOfTheDay.findUnique({
      where: { date: today }
    });

    // Si ya existe, devolverlo
    if (verseOfDay) {
      return NextResponse.json({
        reference: verseOfDay.reference,
        text: verseOfDay.text,
        book: verseOfDay.book,
        chapter: verseOfDay.chapter,
        verse: verseOfDay.verse,
        version: verseOfDay.version,
        tema: verseOfDay.tema,
        date: verseOfDay.date,
        source: 'database'
      });
    }

    // Si no existe, generar uno nuevo desde la API
    const randomVerse = await generateRandomVerse();
    
    // Guardar en la base de datos
    verseOfDay = await prisma.verseOfTheDay.create({
      data: {
        date: today,
        reference: randomVerse.reference,
        text: randomVerse.text,
        book: randomVerse.book,
        chapter: randomVerse.chapter,
        verse: randomVerse.verse,
        version: randomVerse.version || DEFAULT_VERSION,
        tema: randomVerse.tema
      }
    });

    return NextResponse.json({
      reference: verseOfDay.reference,
      text: verseOfDay.text,
      book: verseOfDay.book,
      chapter: verseOfDay.chapter,
      verse: verseOfDay.verse,
      version: verseOfDay.version,
      tema: verseOfDay.tema,
      date: verseOfDay.date,
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

// Función para generar un versículo aleatorio desde la API
async function generateRandomVerse() {
  try {
    // Primero intentar obtener desde nuestra base de datos de versículos favoritos
    const dbVerse = await prisma.bible_verses.findFirst({
      orderBy: {
        id: 'asc'
      },
      skip: Math.floor(Math.random() * 100) // Saltar aleatoriamente
    });

    if (dbVerse && dbVerse.libro && dbVerse.capitulo && dbVerse.versiculo) {
      // Obtener el texto desde la API de Bible
      const verseText = await fetchVerseFromAPI(
        dbVerse.libro,
        Number(dbVerse.capitulo),
        dbVerse.versiculo
      );

      return {
        reference: `${dbVerse.libro} ${dbVerse.capitulo}:${dbVerse.versiculo}`,
        text: verseText,
        book: dbVerse.libro,
        chapter: Number(dbVerse.capitulo),
        verse: dbVerse.versiculo,
        version: DEFAULT_VERSION,
        tema: dbVerse.tema || undefined
      };
    }

    // Si no hay versículos en la BD, usar uno predefinido
    const fallbackVerses = [
      { book: "Juan", chapter: 3, verse: "16" },
      { book: "Salmos", chapter: 23, verse: "1" },
      { book: "Filipenses", chapter: 4, verse: "13" },
      { book: "Proverbios", chapter: 3, verse: "5-6" },
      { book: "Romanos", chapter: 8, verse: "28" }
    ];

    const randomFallback = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)];
    const verseText = await fetchVerseFromAPI(
      randomFallback.book,
      randomFallback.chapter,
      randomFallback.verse
    );

    return {
      reference: `${randomFallback.book} ${randomFallback.chapter}:${randomFallback.verse}`,
      text: verseText,
      book: randomFallback.book,
      chapter: randomFallback.chapter,
      verse: randomFallback.verse,
      version: DEFAULT_VERSION
    };

  } catch (error) {
    console.error("Error generating random verse:", error);
    // Último recurso: Juan 3:16
    return {
      reference: "Juan 3:16",
      text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
      book: "Juan",
      chapter: 3,
      verse: "16",
      version: DEFAULT_VERSION
    };
  }
}

// Función auxiliar para obtener texto del versículo desde la API
async function fetchVerseFromAPI(book: string, chapter: number, verse: string): Promise<string> {
  try {
    const response = await fetch(
      `${BIBLE_API_URL}/bibles/${DEFAULT_VERSION}/search?query=${encodeURIComponent(`${book} ${chapter}:${verse}`)}`,
      {
        headers: {
          "api-key": BIBLE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    
    if (data.data?.passages && data.data.passages.length > 0) {
      return data.data.passages[0].content || data.data.passages[0].text || "";
    }

    return `${book} ${chapter}:${verse}`;
  } catch (error) {
    console.error("Error fetching from Bible API:", error);
    return `${book} ${chapter}:${verse}`;
  }
}
