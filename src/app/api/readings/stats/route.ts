import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProgressToNextLevel } from "@/lib/levels";

// Función para calcular rachas
function calculateStreaks(readings: { date: Date }[]) {
  if (readings.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }

  // Ordenar por fecha descendente
  const sortedReadings = readings.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDate = new Date(sortedReadings[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);

  // Verificar si la racha actual está activa (hoy o ayer)
  if (mostRecentDate.getTime() === today.getTime() || 
      mostRecentDate.getTime() === yesterday.getTime()) {
    currentStreak = 1;

    // Calcular racha actual
    for (let i = 1; i < sortedReadings.length; i++) {
      const currentDate = new Date(sortedReadings[i].date);
      currentDate.setHours(0, 0, 0, 0);
      
      const prevDate = new Date(sortedReadings[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);
      
      const daysDiff = (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calcular racha máxima
  maxStreak = tempStreak;
  for (let i = 1; i < sortedReadings.length; i++) {
    const currentDate = new Date(sortedReadings[i].date);
    currentDate.setHours(0, 0, 0, 0);
    
    const prevDate = new Date(sortedReadings[i - 1].date);
    prevDate.setHours(0, 0, 0, 0);
    
    const daysDiff = (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 1) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, maxStreak };
}

// GET: Obtener estadísticas de lectura
export async function GET() {
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

    // Obtener todas las lecturas del usuario
    const readings = await prisma.dailyReading.findMany({
      where: {
        userId: user.id
      },
      select: {
        date: true,
        seeds: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calcular estadísticas
    const totalDays = readings.length;
    const totalSeeds = readings.reduce((sum: number, reading: any) => sum + reading.seeds, 0);
    const { currentStreak, maxStreak } = calculateStreaks(readings);

    // Verificar si leyó hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const readToday = readings.some((reading: any) => {
      const readingDate = new Date(reading.date);
      readingDate.setHours(0, 0, 0, 0);
      return readingDate.getTime() === today.getTime();
    });

    // Obtener información del nivel usando el nuevo sistema
    const levelProgress = getProgressToNextLevel(totalSeeds);

    return NextResponse.json({
      totalDays,
      totalSeeds,
      currentStreak,
      maxStreak,
      readToday,
      currentLevel: levelProgress.currentLevel,
      nextLevel: levelProgress.nextLevel,
      seedsToNextLevel: levelProgress.seedsToNextLevel,
      progressPercentage: levelProgress.progressPercentage,
      // Mantener compatibilidad con el código anterior
      level: levelProgress.currentLevel.level
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
