import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Por seguridad, siempre respondemos con éxito aunque el usuario no exista
    // Esto previene que atacantes descubran qué emails están registrados
    if (!user) {
      return NextResponse.json({
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      });
    }

    // Verificar que el usuario tenga contraseña (no OAuth)
    if (!user.password) {
      return NextResponse.json({
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      });
    }

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token válido por 1 hora

    // Guardar el token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    // Enviar email de recuperación
    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      return NextResponse.json(
        { error: 'No se pudo enviar el email de recuperación. Por favor, intenta más tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar tu solicitud' },
      { status: 500 }
    );
  }
}
