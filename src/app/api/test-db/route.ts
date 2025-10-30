import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Intentar una query simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      status: "✅ Conexión exitosa",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error de conexión:", error);
    
    return NextResponse.json(
      {
        status: "❌ Error de conexión",
        error: error.message,
        code: error.code,
        meta: error.meta,
        clientVersion: error.clientVersion,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
