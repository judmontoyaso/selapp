import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ruta al archivo SQLite
const sqlitePath = 'C:\\Users\\Acer\\Downloads\\lbla.db';

async function migrateFromSQLite() {
  try {
    console.log('🔄 Conectando a SQLite...\n');
    const db = Database(sqlitePath, { readonly: true });
    
    console.log('📊 Verificando tablas en SQLite:\n');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('Tablas encontradas:', tables);
    
    if (tables.length === 0) {
      console.log('\n⚠️ No se encontraron tablas en la base de datos SQLite');
      db.close();
      return;
    }
    
    // Mostrar estructura de cada tabla
    for (const table of tables as any[]) {
      console.log(`\n📋 Tabla: ${table.name}`);
      const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
      console.log('  Columnas:', info);
      
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as any;
      console.log(`  Registros: ${count.count}`);
    }
    
    console.log('\n');

    // El resto del código de migración...
    db.close();
    console.log('📚 Migrando tabla books...');
    const books = db.prepare('SELECT * FROM books').all();
    console.log(`  Encontrados ${books.length} registros`);
    
    for (const book of books as any[]) {
      await prisma.$executeRaw`
        INSERT INTO books (booknum, bookname, testament, category)
        VALUES (${book.booknum}, ${book.bookname}, ${book.testament || ''}, ${book.category || ''})
        ON CONFLICT (booknum) DO UPDATE SET 
          bookname = EXCLUDED.bookname,
          testament = EXCLUDED.testament,
          category = EXCLUDED.category
      `;
    }
    console.log('  ✅ Books migrados correctamente\n');

    // Migrar words
    console.log('📖 Migrando tabla words...');
    const wordsCount = db.prepare('SELECT COUNT(*) as count FROM words').get() as any;
    console.log(`  Encontrados ${wordsCount.count} registros`);
    
    if (wordsCount.count > 0) {
      const batchSize = 500;
      let offset = 0;
      
      while (offset < wordsCount.count) {
        const words = db.prepare(`SELECT * FROM words LIMIT ${batchSize} OFFSET ${offset}`).all();
        
        for (const word of words as any[]) {
          await prisma.$executeRaw`
            INSERT INTO words (wordid, word, booknum, chnum, versenum)
            VALUES (${word.wordid}, ${word.word}, ${word.booknum}, ${word.chnum}, ${word.versenum})
            ON CONFLICT (wordid) DO NOTHING
          `;
        }
        
        offset += batchSize;
        console.log(`  Progreso: ${Math.min(offset, wordsCount.count)}/${wordsCount.count}`);
      }
      console.log('  ✅ Words migrados correctamente\n');
    }

    // Migrar favorites_verses si existe
    const hasFavorites = tables.find((t: any) => t.name === 'favorites_verses');
    if (hasFavorites) {
      console.log('⭐ Migrando tabla favorites_verses...');
      const favorites = db.prepare('SELECT * FROM favorites_verses').all();
      console.log(`  Encontrados ${favorites.length} registros`);
      
      for (const fav of favorites as any[]) {
        await prisma.$executeRaw`
          INSERT INTO favorites_verses (user_id, booknum, chapter, start_verse, end_verse, text, created_at)
          VALUES (${fav.user_id}, ${fav.booknum}, ${fav.chapter}, ${fav.start_verse}, ${fav.end_verse}, ${fav.text}, ${fav.created_at || new Date()})
        `;
      }
      console.log('  ✅ Favorites migrados correctamente\n');
    }

    db.close();
    console.log('✅ ¡Migración desde SQLite completada!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateFromSQLite();
