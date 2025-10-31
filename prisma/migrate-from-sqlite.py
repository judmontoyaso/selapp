import sqlite3
from prisma import Prisma
import asyncio

async def migrate_from_sqlite():
    # Conectar a SQLite
    sqlite_path = r"C:\Users\Acer\Documents\Projects\Bible\bible.db"  # Ajusta el nombre del archivo
    
    try:
        conn = sqlite3.connect(sqlite_path)
        cursor = conn.cursor()
        
        # Conectar a PostgreSQL con Prisma
        prisma = Prisma()
        await prisma.connect()
        
        print("🔄 Iniciando migración desde SQLite...\n")
        
        # Migrar books
        print("📚 Migrando tabla books...")
        cursor.execute("SELECT * FROM books")
        books = cursor.fetchall()
        print(f"  Encontrados {len(books)} registros")
        
        for book in books:
            await prisma.execute_raw(
                f"""
                INSERT INTO books (booknum, bookname, testament, category)
                VALUES ({book[0]}, '{book[1]}', '{book[2] if len(book) > 2 else ''}', '{book[3] if len(book) > 3 else ''}')
                ON CONFLICT (booknum) DO NOTHING
                """
            )
        print("  ✅ Books migrados\n")
        
        # Migrar words
        print("📖 Migrando tabla words...")
        cursor.execute("SELECT COUNT(*) FROM words")
        count = cursor.fetchone()[0]
        print(f"  Encontrados {count} registros")
        
        if count > 0:
            batch_size = 1000
            offset = 0
            
            while offset < count:
                cursor.execute(f"SELECT * FROM words LIMIT {batch_size} OFFSET {offset}")
                words = cursor.fetchall()
                
                for word in words:
                    await prisma.execute_raw(
                        f"""
                        INSERT INTO words (wordid, word, booknum, chnum, versenum)
                        VALUES ({word[0]}, '{word[1] if len(word) > 1 else ''}', {word[2] if len(word) > 2 else 'NULL'}, {word[3] if len(word) > 3 else 'NULL'}, {word[4] if len(word) > 4 else 'NULL'})
                        ON CONFLICT (wordid) DO NOTHING
                        """
                    )
                
                offset += batch_size
                print(f"  Progreso: {min(offset, count)}/{count}")
        
        print("  ✅ Words migrados\n")
        
        print("✅ Migración completada!")
        
        conn.close()
        await prisma.disconnect()
        
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(migrate_from_sqlite())
