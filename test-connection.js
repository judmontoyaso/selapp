const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = "postgresql://postgres:.Jd0521ms.@db.dwwzqwcoqlasgvpniwiu.supabase.co:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...\n');
  console.log('URL:', DATABASE_URL.replace(/:.+@/, ':****@'));
  console.log('');
  
  try {
    // Probar conexión simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ CONEXIÓN EXITOSA');
    console.log('Resultado:', result);
    
    // Probar si las tablas existen
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\n📊 Tablas en la base de datos:');
    console.log(tables);
    
  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN\n');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Meta:', error.meta);
    console.error('\nError completo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
