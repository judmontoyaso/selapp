import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentDb() {
  try {
    console.log('🔍 Verificando base de datos ACTUAL:\n');

    const favCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM favorites_verses`;
    console.log('favorites_verses:', favCount);

    const favData = await prisma.$queryRaw`SELECT * FROM favorites_verses`;
    console.log('\nDatos:', favData);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentDb();
