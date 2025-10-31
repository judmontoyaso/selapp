import { PrismaClient } from '@prisma/client';

const sourceDb = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:6kMYEokm55LCpJyo@db.gfyvjogffxgzkjrompdg.supabase.co:5432/postgres'
});

async function checkData() {
  try {
    console.log('Verificando datos en la base de datos original...\n');

    // Verificar words
    const wordsCount = await sourceDb.$queryRaw`SELECT COUNT(*) FROM words`;
    console.log('Words count:', wordsCount);

    const wordsSample = await sourceDb.$queryRaw`SELECT * FROM words LIMIT 5`;
    console.log('Words sample:', wordsSample);

    // Verificar favorites_verses
    const favCount = await sourceDb.$queryRaw`SELECT COUNT(*) FROM favorites_verses`;
    console.log('\nFavorites count:', favCount);

    const favSample = await sourceDb.$queryRaw`SELECT * FROM favorites_verses LIMIT 5`;
    console.log('Favorites sample:', favSample);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourceDb.$disconnect();
  }
}

checkData();
