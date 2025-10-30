import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Modelos DailyDevotional/Devotional/Verse no existen en la base de datos aún
  return NextResponse.json(
    { error: "Endpoint no implementado - Modelos DailyDevotional/Devotional/Verse no existen en BD" },
    { status: 501 }
  );
  
  /* DESCOMENTADO CUANDO SE CREEN LAS TABLAS daily_devotionals/devotionals/verses
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyDevotional = await prisma.dailyDevotional.findFirst({
      where: {
        scheduledFor: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        devotional: {
          include: {
            verses: {
              include: {
                verse: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json(dailyDevotional);
  } catch (error) {
    console.error("Error fetching today's devotional:", error);
    return NextResponse.json(
      { error: "Error al obtener el devocional del día" },
      { status: 500 }
    );
  }
  */
}

export async function POST(request: Request) {
  // TODO: Modelos DailyDevotional/Devotional/Verse no existen en la base de datos aún
  return NextResponse.json(
    { error: "Endpoint no implementado - Modelos DailyDevotional/Devotional/Verse no existen en BD" },
    { status: 501 }
  );
  
  /* DESCOMENTADO CUANDO SE CREEN LAS TABLAS daily_devotionals/devotionals/verses
  try {
    const body = await request.json();
    const { userId, answers } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyDevotional = await prisma.dailyDevotional.findFirst({
      where: {
        userId,
        scheduledFor: {
          gte: today,
        },
      },
    });

    if (!dailyDevotional) {
      return NextResponse.json(
        { error: "No se encontró el devocional de hoy" },
        { status: 404 }
      );
    }

    const updated = await prisma.dailyDevotional.update({
      where: {
        id: dailyDevotional.id,
      },
      data: {
        answers,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating devotional:", error);
    return NextResponse.json(
      { error: "Error al actualizar devocional" },
      { status: 500 }
    );
  }
  */
}
