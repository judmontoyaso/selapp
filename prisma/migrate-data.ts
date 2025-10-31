import { PrismaClient } from '@prisma/client';

// Base de datos de origen
const sourceDb = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:6kMYEokm55LCpJyo@db.gfyvjogffxgzkjrompdg.supabase.co:5432/postgres'
});

// Base de datos de destino (usará DATABASE_URL del .env)
const targetDb = new PrismaClient();

async function migrateData() {
  try {
    console.log('🔄 Iniciando migración de datos...\n');

    // Desactivar RLS temporalmente en la base de datos de origen
    await sourceDb.$executeRaw`SET session_replication_role = replica;`;

    // Migrar books
    console.log('📚 Migrando tabla books...');
    const books = await sourceDb.$queryRaw`SELECT * FROM books`;
    console.log(`  Encontrados ${(books as any[]).length} registros`);
    
    if ((books as any[]).length > 0) {
      await targetDb.$executeRaw`TRUNCATE TABLE books CASCADE`;
      for (const book of books as any[]) {
        await targetDb.$executeRaw`
          INSERT INTO books (booknum, bookname, testament, category)
          VALUES (${book.booknum}, ${book.bookname}, ${book.testament}, ${book.category})
        `;
      }
      console.log('  ✅ Books migrados correctamente\n');
    }

    // Migrar words
    console.log('📖 Migrando tabla words...');
    const words = await sourceDb.$queryRaw`SELECT * FROM words`;
    console.log(`  Encontrados ${(words as any[]).length} registros`);
    
    if ((words as any[]).length > 0) {
      await targetDb.$executeRaw`TRUNCATE TABLE words CASCADE`;
      
      // Migrar en lotes de 100 para evitar problemas
      const batchSize = 100;
      const wordsArray = words as any[];
      
      for (let i = 0; i < wordsArray.length; i += batchSize) {
        const batch = wordsArray.slice(i, i + batchSize);
        
        for (const w of batch) {
          await targetDb.$executeRaw`
            INSERT INTO words (wordid, word, booknum, chnum, versenum)
            VALUES (${w.wordid}, ${w.word}, ${w.booknum}, ${w.chnum}, ${w.versenum})
          `;
        }
        
        console.log(`  Progreso: ${Math.min(i + batchSize, wordsArray.length)}/${wordsArray.length}`);
      }
      console.log('  ✅ Words migrados correctamente\n');
    }

    // Migrar bible_verses
    console.log('📜 Migrando tabla bible_verses...');
    const bibleVerses = await sourceDb.$queryRaw`SELECT * FROM bible_verses`;
    console.log(`  Encontrados ${(bibleVerses as any[]).length} registros`);
    
    if ((bibleVerses as any[]).length > 0) {
      await targetDb.$executeRaw`TRUNCATE TABLE bible_verses CASCADE`;
      
      const batchSize = 100;
      const versesArray = bibleVerses as any[];
      
      for (let i = 0; i < versesArray.length; i += batchSize) {
        const batch = versesArray.slice(i, i + batchSize);
        
        for (const v of batch) {
          await targetDb.$executeRaw`
            INSERT INTO bible_verses (id, tema, libro, capitulo, versiculo, codigo_libro)
            OVERRIDING SYSTEM VALUE
            VALUES (${v.id}, ${v.tema}, ${v.libro}, ${v.capitulo}, ${v.versiculo}, ${v.codigo_libro})
            ON CONFLICT (id) DO NOTHING
          `;
        }
        
        console.log(`  Progreso: ${Math.min(i + batchSize, versesArray.length)}/${versesArray.length}`);
      }
      console.log('  ✅ Bible verses migrados correctamente\n');
    }

    // Migrar favorites_verses
    console.log('⭐ Migrando tabla favorites_verses...');
    const favoriteVerses = await sourceDb.$queryRaw`SELECT * FROM favorites_verses`;
    console.log(`  Encontrados ${(favoriteVerses as any[]).length} registros`);
    
    if ((favoriteVerses as any[]).length > 0) {
      await targetDb.$executeRaw`TRUNCATE TABLE favorites_verses CASCADE`;
      
      for (const fv of favoriteVerses as any[]) {
        await targetDb.$executeRaw`
          INSERT INTO favorites_verses (id, user_id, booknum, chapter, start_verse, end_verse, text, created_at)
          OVERRIDING SYSTEM VALUE
          VALUES (${fv.id}, ${fv.user_id}, ${fv.booknum}, ${fv.chapter}, ${fv.start_verse}, ${fv.end_verse}, ${fv.text}, ${fv.created_at})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      
      console.log('  ✅ Favorite verses migrados correctamente\n');
    }

    console.log('✅ ¡Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

migrateData();
