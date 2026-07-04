// Tokens de compartir sin estado: HMAC-SHA256 del id del sermón firmado con
// NEXTAUTH_SECRET. Nadie puede forjar un link sin el secreto, y no requiere
// cambios en la base de datos.

import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET not set");
  return secret;
}

function sign(sermonId: string): string {
  return createHmac("sha256", getSecret())
    .update(`share:sermon:${sermonId}`)
    .digest("base64url")
    .slice(0, 27);
}

/** Genera el token público para compartir un sermón. */
export function createShareToken(sermonId: string): string {
  return `${Buffer.from(sermonId, "utf8").toString("base64url")}.${sign(sermonId)}`;
}

/** Verifica un token y devuelve el id del sermón, o null si es inválido. */
export function verifyShareToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  let sermonId: string;
  try {
    sermonId = Buffer.from(token.slice(0, dot), "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!sermonId) return null;

  const expected = Buffer.from(sign(sermonId));
  const received = Buffer.from(token.slice(dot + 1));
  if (expected.length !== received.length) return null;
  return timingSafeEqual(expected, received) ? sermonId : null;
}
