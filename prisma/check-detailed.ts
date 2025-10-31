import { PrismaClient } from '@prisma/client';

const sourceDb = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:6kMYEokm55LCpJyo@db.gfyvjogffxgzkjrompdg.supabase.co:5432/postgres'
});

async function checkDetailedData() {
  try {
    console.log('🔍 Verificación detallada de favorites_verses y words:\n');

    // Verificar con diferentes métodos
    console.log('=== FAVORITES_VERSES ===');
    
    const favCount1 = await sourceDb.$queryRaw`SELECT COUNT(*) as total FROM favorites_verses`;
    console.log('Count directo:', favCount1);

    const favAll = await sourceDb.$queryRaw`SELECT * FROM favorites_verses`;
    console.log('Todos los registros:', favAll);

    const favSchema = await sourceDb.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'favorites_verses'
    `;
    console.log('Estructura de la tabla:', favSchema);

    console.log('\n=== WORDS ===');
    
    const wordsCount1 = await sourceDb.$queryRaw`SELECT COUNT(*) as total FROM words`;
    console.log('Count directo:', wordsCount1);

    const wordsAll = await sourceDb.$queryRaw`SELECT * FROM words`;
    console.log('Todos los registros:', wordsAll);

    const wordsSchema = await sourceDb.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'words'
    `;
    console.log('Estructura de la tabla:', wordsSchema);

    // Verificar si hay restricciones o triggers
    console.log('\n=== POLÍTICAS Y RESTRICCIONES ===');
    
    const policies = await sourceDb.$queryRaw`
      SELECT tablename, policyname, permissive, roles, cmd, qual 
      FROM pg_policies 
      WHERE tablename IN ('favorites_verses', 'words')
    `;
    console.log('Políticas RLS:', policies);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourceDb.$disconnect();
  }
}

checkDetailedData();
