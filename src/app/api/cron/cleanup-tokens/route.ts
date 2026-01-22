import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Cron job para limpiar tokens de recuperación de contraseña expirados
 * Ejecutar diariamente para mantener la base de datos limpia
 */
export async function GET(request: Request) {
  try {
    // Verificar autorización con CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Eliminar tokens que:
    // 1. Ya expiraron
    // 2. Fueron usados hace más de 24 horas
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          // Tokens expirados
          { expires: { lt: now } },
          // Tokens usados hace más de 24 horas
          {
            AND: [
              { used: true },
              { createdAt: { lt: oneDayAgo } }
            ]
          }
        ]
      }
    });

    console.log(`[Cleanup] Eliminados ${result.count} tokens de recuperación`);

    return NextResponse.json({
      success: true,
      message: 'Tokens limpiados exitosamente',
      deleted: result.count,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error en cleanup de tokens:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al limpiar tokens' 
      },
      { status: 500 }
    );
  }
}
