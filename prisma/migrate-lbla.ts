import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const sqlitePath = 'C:\\Users\\Acer\\Downloads\\lbla.db';

async function inspectAndMigrate() {
  let db;
  
  try {
    console.log('🔄 Abriendo base de datos SQLite...\n');
    db = new Database(sqlitePath, { readonly: true, fileMustExist: true });
    
    // Listar todas las tablas
    console.log('📊 Inspeccionando tablas en lbla.db:\n');
    const tables = db.prepare(`
      SELECT name, sql 
      FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as any[];
    
    if (tables.length === 0) {
      console.log('⚠️ No se encontraron tablas en el archivo SQLite');
      return;
    }
    
    console.log(`Encontradas ${tables.length} tablas:\n`);
    
    // Inspeccionar cada tabla
    for (const table of tables) {
      console.log(`\n📋 Tabla: ${table.name}`);
      console.log(`   SQL: ${table.sql?.substring(0, 100)}...`);
      
      const count = db.prepare(`SELECT COUNT(*) as count FROM \`${table.name}\``).get() as any;
      console.log(`   Registros: ${count.count}`);
      
      if (count.count > 0 && count.count <= 5) {
        const sample = db.prepare(`SELECT * FROM \`${table.name}\` LIMIT 2`).all();
        console.log('   Muestra:', JSON.stringify(sample, null, 2));
      }
    }
    
    console.log('\n\n🔄 Iniciando migración...\n');
    
    // Migrar tabla books si existe
    const booksTable = tables.find(t => t.name.toLowerCase() === 'books');
    if (booksTable) {
      console.log('📚 Migrando tabla books...');
      const books = db.prepare('SELECT * FROM books').all() as any[];
      console.log(`  Encontrados ${books.length} registros`);
      
      let migrated = 0;
      for (const book of books) {
        try {
          await prisma.$executeRaw`
            INSERT INTO books (booknum, bookname, testament, category)
            VALUES (${book.booknum}, ${book.bookname}, ${book.testament || ''}, ${book.category || ''})
            ON CONFLICT (booknum) DO UPDATE SET 
              bookname = EXCLUDED.bookname,
              testament = EXCLUDED.testament,
              category = EXCLUDED.category
          `;
          migrated++;
        } catch (error) {
          console.log(`  ⚠️ Error en book ${book.booknum}: ${error}`);
        }
      }
      console.log(`  ✅ ${migrated} books migrados\n`);
    }
    
    // Migrar tabla words si existe
    const wordsTable = tables.find(t => t.name.toLowerCase() === 'words');
    if (wordsTable) {
      console.log('📖 Migrando tabla words...');
      const count = db.prepare('SELECT COUNT(*) as count FROM words').get() as any;
      console.log(`  Encontrados ${count.count} registros`);
      
      if (count.count > 0) {
        const batchSize = 1000;
        let offset = 0;
        let migrated = 0;
        
        while (offset < count.count) {
          const words = db.prepare(`SELECT * FROM words LIMIT ${batchSize} OFFSET ${offset}`).all() as any[];
          
          for (const word of words) {
            try {
              await prisma.$executeRaw`
                INSERT INTO words (wordid, word, booknum, chnum, versenum)
                VALUES (${word.wordid}, ${word.word || ''}, ${word.booknum}, ${word.chnum}, ${word.versenum})
                ON CONFLICT (wordid) DO NOTHING
              `;
              migrated++;
            } catch (error) {
              // Ignorar errores de duplicados
            }
          }
          
          offset += batchSize;
          console.log(`  Progreso: ${Math.min(offset, count.count)}/${count.count}`);
        }
        console.log(`  ✅ ${migrated} words migrados\n`);
      }
    }
    
    // Migrar favorites_verses si existe
    const favoritesTable = tables.find(t => t.name.toLowerCase() === 'favorites_verses');
    if (favoritesTable) {
      console.log('⭐ Migrando tabla favorites_verses...');
      const favorites = db.prepare('SELECT * FROM favorites_verses').all() as any[];
      console.log(`  Encontrados ${favorites.length} registros`);
      
      let migrated = 0;
      for (const fav of favorites) {
        try {
          await prisma.$executeRaw`
            INSERT INTO favorites_verses (user_id, booknum, chapter, start_verse, end_verse, text, created_at)
            VALUES (${fav.user_id}, ${fav.booknum}, ${fav.chapter}, ${fav.start_verse}, ${fav.end_verse}, ${fav.text}, ${fav.created_at ? new Date(fav.created_at) : new Date()})
          `;
          migrated++;
        } catch (error) {
          console.log(`  ⚠️ Error en favorite: ${error}`);
        }
      }
      console.log(`  ✅ ${migrated} favorites migrados\n`);
    }
    
    console.log('✅ ¡Migración completada!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (db) db.close();
    await prisma.$disconnect();
  }
}

inspectAndMigrate();
