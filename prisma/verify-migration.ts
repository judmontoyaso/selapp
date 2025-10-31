import { PrismaClient } from '@prisma/client';

const targetDb = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('✅ Verificando datos migrados en tu base de datos actual:\n');

    // Verificar books
    const booksCount = await targetDb.$queryRaw`SELECT COUNT(*) FROM books`;
    console.log(`📚 Books: ${(booksCount as any)[0].count} registros`);
    
    const booksSample = await targetDb.$queryRaw`SELECT * FROM books LIMIT 3`;
    console.log('Muestra:');
    (booksSample as any[]).forEach((book: any) => {
      console.log(`  - ${book.bookname} (${book.testament})`);
    });

    // Verificar bible_verses
    const versesCount = await targetDb.$queryRaw`SELECT COUNT(*) FROM bible_verses`;
    console.log(`\n📜 Bible verses: ${(versesCount as any)[0].count} registros`);
    
    const versesSample = await targetDb.$queryRaw`SELECT * FROM bible_verses LIMIT 3`;
    console.log('Muestra:');
    (versesSample as any[]).forEach((verse: any) => {
      console.log(`  - ${verse.libro} ${verse.capitulo}:${verse.versiculo}`);
    });

    console.log('\n✅ Migración verificada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await targetDb.$disconnect();
  }
}

verifyMigration();
