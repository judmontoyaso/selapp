import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener un versículo aleatorio de favorites_verses
    const favorites = await prisma.favorites_verses.findMany();
    
    if (favorites.length === 0) {
      return NextResponse.json({ error: 'No hay versículos favoritos' }, { status: 404 });
    }

    // Seleccionar uno aleatorio
    const randomFavorite = favorites[Math.floor(Math.random() * favorites.length)];

    // Consultar el libro para obtener el nombre
    const book = await prisma.books.findUnique({
      where: { booknum: randomFavorite.booknum }
    });

    if (!book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
    }

    // Construir la referencia bíblica
    const reference = `${book.bookname} ${randomFavorite.chapter}:${randomFavorite.start_verse}`;
    
    // Consultar API de la Biblia (usando Bible API - https://bible-api.com/)
    // Formato: GET https://bible-api.com/john+3:16?translation=rvr95
    const bookAbbreviation = book.bookname.toLowerCase().replace(/\s+/g, '');
    const verseRange = randomFavorite.start_verse === randomFavorite.end_verse 
      ? randomFavorite.start_verse 
      : `${randomFavorite.start_verse}-${randomFavorite.end_verse}`;
    
    const apiUrl = `https://bible-api.com/${bookAbbreviation}+${randomFavorite.chapter}:${verseRange}?translation=rvr95`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      // Si falla la API, usar el texto almacenado
      return NextResponse.json({
        reference,
        text: randomFavorite.text,
        chapter: randomFavorite.chapter,
        verses: `${randomFavorite.start_verse}${randomFavorite.end_verse !== randomFavorite.start_verse ? `-${randomFavorite.end_verse}` : ''}`,
        book: book.bookname,
        source: 'database'
      });
    }

    const data = await response.json();

    return NextResponse.json({
      reference,
      text: data.text || randomFavorite.text,
      chapter: randomFavorite.chapter,
      verses: `${randomFavorite.start_verse}${randomFavorite.end_verse !== randomFavorite.start_verse ? `-${randomFavorite.end_verse}` : ''}`,
      book: book.bookname,
      translation: data.translation_name || 'RVR95',
      source: 'api'
    });

  } catch (error) {
    console.error('Error obteniendo versículo:', error);
    return NextResponse.json(
      { error: 'Error al obtener el versículo' },
      { status: 500 }
    );
  }
}
