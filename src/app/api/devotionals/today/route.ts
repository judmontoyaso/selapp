import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Por ahora devolvemos un devocional de ejemplo
    // TODO: Crear tabla devocionales y sistema completo
    
    const devotional = {
      id: "1",
      title: "Fe que Transforma",
      topic: "Fe",
      content: `La fe es el fundamento de nuestra relación con Dios. No se trata simplemente de creer que Dios existe, sino de confiar plenamente en Él y en Sus promesas.

Cuando enfrentamos desafíos en nuestra vida, es nuestra fe la que nos sostiene. La fe nos permite ver más allá de las circunstancias presentes y confiar en que Dios está obrando para nuestro bien.

Hoy, reflexionemos sobre cómo nuestra fe se refleja en nuestras acciones diarias. ¿Estamos viviendo de acuerdo a lo que decimos creer?`,
      questions: [
        "¿Cómo has visto a Dios actuar en tu vida recientemente?",
        "¿Qué área de tu vida necesitas entregar completamente a Dios?",
        "¿De qué manera puedes fortalecer tu fe esta semana?"
      ],
      verses: [
        {
          verse: {
            reference: "Hebreos 11:1",
            text: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve."
          }
        },
        {
          verse: {
            reference: "Romanos 10:17",
            text: "Así que la fe es por el oír, y el oír, por la palabra de Dios."
          }
        }
      ],
      completedAt: null
    };

    return NextResponse.json({ devotional, answers: [] });
  } catch (error) {
    console.error("Error fetching today's devotional:", error);
    return NextResponse.json(
      { error: "Error al obtener el devocional del día" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, answers } = body;

    // Por ahora solo logueamos
    console.log("Devocional completado por usuario:", userId);
    console.log("Respuestas:", answers);

    return NextResponse.json({ 
      success: true,
      message: "Devocional completado exitosamente" 
    });
  } catch (error) {
    console.error("Error updating devotional:", error);
    return NextResponse.json(
      { error: "Error al actualizar devocional" },
      { status: 500 }
    );
  }
}
