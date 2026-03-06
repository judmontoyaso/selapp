import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET: Obtener todos los sermones del usuario autenticado (con paginación)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const searchQuery = searchParams.get("search") || "";

    // Asegurar valores válidos
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 12;
    const skip = (validPage - 1) * validLimit;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el usuario por email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Construir la cláusula de búsqueda (Deep Search)
    const whereClause: Prisma.sermonsWhereInput = {
      userId: user.id,
      ...(searchQuery.trim() !== "" ? {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { pastor: { contains: searchQuery, mode: "insensitive" } },
          {
            messages: {
              some: {
                content: { contains: searchQuery, mode: "insensitive" }
              }
            }
          }
        ]
      } : {})
    };

    const [total, sermons] = await Promise.all([
      prisma.sermons.count({
        where: whereClause
      }),
      prisma.sermons.findMany({
        where: whereClause,
        orderBy: {
          date: "desc",
        },
        skip: skip,
        take: validLimit,
        include: {
          _count: {
            select: { messages: true },
          },
        },
      })
    ]);

    return NextResponse.json({
      data: sermons,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit)
      }
    });
  } catch (error) {
    console.error("Error fetching sermons:", error);
    return NextResponse.json(
      { error: "Error al obtener sermones" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo sermón
export async function POST(request: Request) {
  let bodyData: any = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el usuario por email
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
    bodyData = body; // Guardar para usar en catch si es necesario
    const { title, pastor, date, id } = body;

    if (!title || !pastor) {
      return NextResponse.json(
        { error: "Título y pastor son requeridos" },
        { status: 400 }
      );
    }

    const sermon = await prisma.sermons.create({
      data: {
        ...(id && { id }), // Use client ID if provided
        title,
        pastor,
        date: date ? new Date(date) : new Date(),
        userId: user.id,
      },
    });

    return NextResponse.json(sermon);
  } catch (error) {
    console.error("Error creating sermon:", error);
    // Check for unique constraint violation (if ID already exists)
    if ((error as any).code === 'P2002') {
      // If it already exists, return the existing one or success to ensure idempotency
      // For simplicity, we'll fetch and return it, or just return success.
      // Ideally we fetch it to return the same shape.
      if (bodyData?.id) {
        const existing = await prisma.sermons.findUnique({ where: { id: bodyData.id } });
        if (existing) return NextResponse.json(existing);
      }
    }
    return NextResponse.json(
      { error: "Error al crear sermón" },
      { status: 500 }
    );
  }
}
