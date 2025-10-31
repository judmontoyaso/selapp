import { prisma } from './src/lib/prisma.js';

async function checkBooks() {
  try {
    const books = await prisma.bible_verses.findMany({
      select: { libro: true },
      distinct: ['libro'],
      orderBy: { libro: 'asc' },
      take: 20
    });

    console.log('Libros disponibles:');
    books.forEach(book => console.log(book.libro));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBooks();