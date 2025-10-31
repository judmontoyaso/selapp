import { PrismaClient } from '@prisma/client';

const sourceDb = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:6kMYEokm55LCpJyo@db.gfyvjogffxgzkjrompdg.supabase.co:5432/postgres'
});

async function checkRLS() {
  try {
    console.log('🔒 Verificando políticas RLS en las tablas:\n');

    // Verificar qué tablas tienen RLS activado
    const rlsTables = await sourceDb.$queryRaw`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('Tablas con RLS:');
    for (const table of rlsTables as any[]) {
      const status = table.rowsecurity ? '🔒 RLS ACTIVADO' : '🔓 Sin RLS';
      console.log(`${table.tablename}: ${status}`);
    }

    console.log('\n📋 Intentando leer con rol postgres:\n');

    // Intentar leer words directamente
    const words = await sourceDb.$queryRaw`SELECT * FROM words LIMIT 5`;
    console.log(`words: ${(words as any[]).length} registros leídos`);

    // Intentar leer favorites_verses directamente
    const favs = await sourceDb.$queryRaw`SELECT * FROM favorites_verses LIMIT 5`;
    console.log(`favorites_verses: ${(favs as any[]).length} registros leídos`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourceDb.$disconnect();
  }
}

checkRLS();
