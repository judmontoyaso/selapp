import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { ensureApiKeyTable } from "@/lib/api-key-db";
import crypto from "crypto";

export const VALID_MCP_PERMISSIONS = ["read", "write", "delete"] as const;
export type McpPermission = (typeof VALID_MCP_PERMISSIONS)[number];

function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return ["read", "write"];
  }
  const filtered = input
    .map((p) => String(p).trim().toLowerCase())
    .filter((p): p is McpPermission =>
      (VALID_MCP_PERMISSIONS as readonly string[]).includes(p)
    );

  const unique = Array.from(new Set(filtered));
  // Asegurar que al menos tenga permiso de lectura ("read")
  if (!unique.includes("read")) {
    unique.unshift("read");
  }
  return unique;
}

function generateApiKey(): string {
  return `sel_live_${crypto.randomBytes(24).toString("hex")}`;
}

async function getAuthenticatedUser() {
  await ensureApiKeyTable();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true },
  });
}

// GET /api/mcp/keys — Lista las claves MCP del usuario actual con sus permisos
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        key: true,
        permissions: true,
        createdAt: true,
        lastUsedAt: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      keys: keys.map((k) => ({
        ...k,
        permissions:
          Array.isArray(k.permissions) && k.permissions.length > 0
            ? k.permissions
            : ["read", "write"],
      })),
    });
  } catch (error: any) {
    console.error("Error fetching MCP keys:", error);
    return NextResponse.json(
      { error: "Error al obtener las claves MCP" },
      { status: 500 }
    );
  }
}

// POST /api/mcp/keys — Genera una nueva clave MCP (con permisos) o regenera una existente
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = (body.name as string)?.trim() || "MCP Personal";
    const regenerateId = (body.regenerateId as string)?.trim();
    const permissions = sanitizePermissions(body.permissions);

    const newKeyValue = generateApiKey();

    if (regenerateId) {
      const existing = await prisma.apiKey.findFirst({
        where: { id: regenerateId, userId: user.id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Clave no encontrada" },
          { status: 404 }
        );
      }

      const updated = await prisma.apiKey.update({
        where: { id: existing.id },
        data: {
          key: newKeyValue,
          createdAt: new Date(),
          lastUsedAt: null,
          isActive: true,
        },
      });

      return NextResponse.json({ apiKey: updated });
    }

    const count = await prisma.apiKey.count({
      where: { userId: user.id },
    });
    if (count >= 10) {
      return NextResponse.json(
        { error: "Has alcanzado el límite máximo de 10 claves MCP por cuenta." },
        { status: 400 }
      );
    }

    const created = await prisma.apiKey.create({
      data: {
        key: newKeyValue,
        name,
        permissions,
        userId: user.id,
        isActive: true,
      },
    });

    return NextResponse.json({ apiKey: created }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating/regenerating MCP key:", error);
    return NextResponse.json(
      { error: "Error al generar la clave MCP" },
      { status: 500 }
    );
  }
}

// PATCH /api/mcp/keys — Actualiza en vivo los permisos o el nombre de una clave sin cambiar su token
export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const keyId = (body.id as string)?.trim();

    if (!keyId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la clave" },
        { status: 400 }
      );
    }

    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Clave no encontrada" },
        { status: 404 }
      );
    }

    const updateData: { permissions?: string[]; name?: string; isActive?: boolean } = {};

    if (body.permissions !== undefined) {
      updateData.permissions = sanitizePermissions(body.permissions);
    }

    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const updated = await prisma.apiKey.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({ apiKey: updated });
  } catch (error: any) {
    console.error("Error updating MCP key permissions:", error);
    return NextResponse.json(
      { error: "Error al actualizar los permisos de la clave MCP" },
      { status: 500 }
    );
  }
}

// DELETE /api/mcp/keys?id=... — Revoca y elimina una clave MCP del usuario
export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let keyId = searchParams.get("id");

    if (!keyId) {
      const body = await request.json().catch(() => ({}));
      keyId = body.id;
    }

    if (!keyId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la clave a revocar" },
        { status: 400 }
      );
    }

    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Clave no encontrada" },
        { status: 404 }
      );
    }

    await prisma.apiKey.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, deletedId: existing.id });
  } catch (error: any) {
    console.error("Error deleting MCP key:", error);
    return NextResponse.json(
      { error: "Error al revocar la clave MCP" },
      { status: 500 }
    );
  }
}
