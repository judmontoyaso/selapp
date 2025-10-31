import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCurrentDatabase() {
  try {
    console.log('🔍 Verificando datos en tu base de datos ACTUAL:\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...\n');

    // Verificar books
    const booksCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM books`;
    console.log('📚 Books:', booksCount);

    const booksSample = await prisma.$queryRaw`SELECT * FROM books LIMIT 5`;
    console.log('Muestra de books:');
    console.log(booksSample);

    // Verificar bible_verses
    const versesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM bible_verses`;
    console.log('\n📜 Bible_verses:', versesCount);

    const versesSample = await prisma.$queryRaw`SELECT * FROM bible_verses LIMIT 5`;
    console.log('Muestra de bible_verses:');
    console.log(versesSample);

    // Verificar favorites_verses
    const favoritesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM favorites_verses`;
    console.log('\n⭐ Favorites_verses:', favoritesCount);

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCurrentDatabase();
