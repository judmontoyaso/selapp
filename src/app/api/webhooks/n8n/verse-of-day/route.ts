import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseReferenceToUSFM, getPassage, NVI_BIBLE_ID, NVI_NAME } from "@/lib/youversion";

// POST /api/webhooks/n8n/verse-of-day
// Llamado por n8n para guardar el versículo diario en la tabla versiculos_diarios.
//
// Body esperado: { reference: "Juan 3:16", tema: "Amor de Dios" }
// Header: Authorization: Bearer <N8N_WEBHOOK_SECRET>

export async function POST(request: Request) {
  // Validar secret
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { reference?: string; tema?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { reference, tema } = body;

  if (!reference) {
    return NextResponse.json(
      { error: "Campo 'reference' requerido. Ej: { reference: 'Juan 3:16', tema: 'Amor de Dios' }" },
      { status: 400 }
    );
  }

  if (!tema) {
    return NextResponse.json(
      { error: "Campo 'tema' requerido." },
      { status: 400 }
    );
  }

  // Parsear referencia en español → USFM
  const usfm = parseReferenceToUSFM(reference.trim());
  if (!usfm) {
    return NextResponse.json(
      { error: `No se pudo parsear la referencia: "${reference}". Usa formato: "Libro capítulo:versículo"` },
      { status: 400 }
    );
  }

  // Obtener texto desde YouVersion NVI
  let texto = reference;
  let resolvedReference = reference;
  try {
    const passage = await getPassage(usfm);
    texto = passage.content;
    resolvedReference = passage.reference;
  } catch (err) {
    console.error("YouVersion error in verse-of-day webhook:", err);
    // Continuar — guardar con el texto de referencia como fallback
  }

  try {
    const saved = await prisma.versiculos_diarios.create({
      data: {
        tema,
        referencia: resolvedReference,
        usfm,
        bible_id: NVI_BIBLE_ID,
        texto,
      }
    });

    return NextResponse.json({
      message: "Versículo guardado exitosamente",
      id: saved.id.toString(),
      reference: resolvedReference,
      usfm,
      texto,
      translation: NVI_NAME,
    });
  } catch (err) {
    console.error("DB error in verse-of-day webhook:", err);
    return NextResponse.json({ error: "Error al guardar en la base de datos" }, { status: 500 });
  }
}

