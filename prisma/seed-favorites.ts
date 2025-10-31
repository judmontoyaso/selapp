import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFavorites() {
  try {
    console.log('🌱 Agregando versículos favoritos de prueba...\n');

    const favorites = [
      {
        user_id: BigInt(1),
        booknum: 1, // Génesis
        chapter: 1,
        start_verse: 1,
        end_verse: 1,
        text: 'En el principio creó Dios los cielos y la tierra.'
      },
      {
        user_id: BigInt(1),
        booknum: 19, // Salmos
        chapter: 23,
        start_verse: 1,
        end_verse: 1,
        text: 'Jehová es mi pastor; nada me faltará.'
      },
      {
        user_id: BigInt(1),
        booknum: 43, // Juan
        chapter: 3,
        start_verse: 16,
        end_verse: 16,
        text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'
      },
      {
        user_id: BigInt(1),
        booknum: 20, // Proverbios
        chapter: 3,
        start_verse: 5,
        end_verse: 6,
        text: 'Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, Y él enderezará tus veredas.'
      },
      {
        user_id: BigInt(1),
        booknum: 50, // Filipenses
        chapter: 4,
        start_verse: 13,
        end_verse: 13,
        text: 'Todo lo puedo en Cristo que me fortalece.'
      }
    ];

    for (const fav of favorites) {
      await prisma.$executeRaw`
        INSERT INTO favorites_verses (user_id, booknum, chapter, start_verse, end_verse, text)
        VALUES (${fav.user_id}, ${fav.booknum}, ${fav.chapter}, ${fav.start_verse}, ${fav.end_verse}, ${fav.text})
      `;
    }

    console.log(`✅ ${favorites.length} versículos favoritos agregados correctamente!\n`);

    // Verificar
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM favorites_verses`;
    console.log('Total en favorites_verses:', count);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFavorites();
