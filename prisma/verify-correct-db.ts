import { PrismaClient } from '@prisma/client';

// Conectar EXPLÍCITAMENTE a la base de datos correcta
const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:.Jd0521ms.@db.dwwzqwcoqlasgvpniwiu.supabase.co:5432/postgres'
});

async function verifyCorrectDatabase() {
  try {
    console.log('🔍 Verificando TU BASE DE DATOS (db.dwwzqwcoqlasgvpniwiu):\n');

    // Verificar books
    const booksCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM books`;
    console.log('📚 Books:', booksCount);

    const booksSample = await prisma.$queryRaw`SELECT * FROM books LIMIT 3`;
    console.log('Muestra:', booksSample);

    // Verificar bible_verses
    const versesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM bible_verses`;
    console.log('\n📜 Bible_verses:', versesCount);

    const versesSample = await prisma.$queryRaw`SELECT * FROM bible_verses LIMIT 3`;
    console.log('Muestra:', versesSample);

    // Verificar favorites_verses
    const favCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM favorites_verses`;
    console.log('\n⭐ Favorites_verses:', favCount);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCorrectDatabase();
