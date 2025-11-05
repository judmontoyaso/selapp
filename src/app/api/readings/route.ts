import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// POST: Marcar lectura del día
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { passage } = body;

    // Validar que el pasaje sea requerido
    if (!passage || !passage.trim()) {
      return NextResponse.json(
        { error: "El pasaje leído es requerido" },
        { status: 400 }
      );
    }

    // Obtener la fecha actual en formato de solo fecha (sin hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si ya existe un registro para hoy
    const existingReading = await prisma.dailyReading.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        }
      }
    });

    if (existingReading) {
      return NextResponse.json(
        { error: "Ya marcaste tu lectura de hoy", reading: existingReading },
        { status: 400 }
      );
    }

    // Crear registro de lectura
    const reading = await prisma.dailyReading.create({
      data: {
        userId: user.id,
        date: today,
        passage: passage.trim(),
        seeds: 10, // 10 semillas por día de lectura
      }
    });

    return NextResponse.json({
      message: "¡Lectura registrada! +10 Semillas 🌱",
      reading
    });

  } catch (error) {
    console.error("Error registrando lectura:", error);
    return NextResponse.json(
      { error: "Error al registrar lectura" },
      { status: 500 }
    );
  }
}

// GET: Obtener historial de lecturas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');

    // Obtener lecturas del usuario
    const readings = await prisma.dailyReading.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        date: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ readings });

  } catch (error) {
    console.error("Error obteniendo lecturas:", error);
    return NextResponse.json(
      { error: "Error al obtener lecturas" },
      { status: 500 }
    );
  }
}
