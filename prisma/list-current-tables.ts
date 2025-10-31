import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:.Jd0521ms.@db.dwwzqwcoqlasgvpniwiu.supabase.co:5432/postgres'
});

async function listTables() {
  try {
    console.log('📊 Listando TODAS las tablas en db.dwwzqwcoqlasgvpniwiu:\n');

    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('Tablas encontradas:', tables);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listTables();
