import { PrismaClient } from '@prisma/client';

const sourceDb = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:6kMYEokm55LCpJyo@db.gfyvjogffxgzkjrompdg.supabase.co:5432/postgres'
});

async function listTables() {
  try {
    console.log('📊 Lista de tablas en la base de datos original:\n');

    // Listar todas las tablas del schema public
    const tables = await sourceDb.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('Tablas encontradas:');
    console.log(tables);
    console.log('\n');

    // Contar registros en cada tabla
    for (const table of tables as any[]) {
      const tableName = table.table_name;
      try {
        const count = await sourceDb.$queryRawUnsafe(`SELECT COUNT(*) FROM "${tableName}"`);
        console.log(`${tableName}: ${(count as any)[0].count} registros`);
      } catch (error) {
        console.log(`${tableName}: Error al contar - ${error}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourceDb.$disconnect();
  }
}

listTables();
