import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

// GET /api/versiculos/favoritos — lista favoritos del usuario
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const favoritos = await prisma.versiculos_favoritos.findMany({
    where: { user_id: userId },
    orderBy: { creado_en: "desc" },
  });

  return NextResponse.json({ favoritos: favoritos.map((f) => ({ ...f, id: f.id.toString() })) });
}

// POST /api/versiculos/favoritos — agregar favorito
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { referencia?: string; usfm?: string; bible_id?: number; texto?: string; tema?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { referencia, usfm, bible_id, texto, tema } = body;
  if (!referencia || !usfm || !bible_id || !texto) {
    return NextResponse.json(
      { error: "Campos requeridos: referencia, usfm, bible_id, texto" },
      { status: 400 }
    );
  }

  // Evitar duplicados silenciosamente
  const existing = await prisma.versiculos_favoritos.findUnique({
    where: { user_id_usfm: { user_id: userId, usfm } },
  });
  if (existing) {
    return NextResponse.json({ favorito: { ...existing, id: existing.id.toString() }, duplicate: true });
  }

  const favorito = await prisma.versiculos_favoritos.create({
    data: {
      user_id: userId,
      referencia,
      usfm,
      bible_id,
      texto,
      tema: tema ?? null,
    },
  });

  return NextResponse.json({ favorito: { ...favorito, id: favorito.id.toString() } }, { status: 201 });
}

// DELETE /api/versiculos/favoritos?id=123 — eliminar favorito
export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Parámetro id requerido" }, { status: 400 });
  }

  // Verificar que el favorito pertenece al usuario
  const favorito = await prisma.versiculos_favoritos.findUnique({
    where: { id: BigInt(id) },
  });

  if (!favorito || favorito.user_id !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.versiculos_favoritos.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ ok: true });
}
