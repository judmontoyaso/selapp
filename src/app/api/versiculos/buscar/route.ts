import { NextResponse } from "next/server";
import { getPassage, parseReferenceToUSFM, NVI_NAME, NVI_BIBLE_ID } from "@/lib/youversion";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Parámetro q requerido" }, { status: 400 });
  }

  const usfm = parseReferenceToUSFM(q.trim());
  if (!usfm) {
    return NextResponse.json(
      { error: "Referencia bíblica no reconocida. Ejemplo: Juan 3:16, Salmos 23:1" },
      { status: 400 }
    );
  }

  try {
    const passage = await getPassage(usfm);
    return NextResponse.json({
      reference: passage.reference,
      text: passage.content,
      usfm,
      bible_id: NVI_BIBLE_ID,
      version: "nvi",
      translation: NVI_NAME,
    });
  } catch (error) {
    console.error("YouVersion API error (buscar):", error);
    return NextResponse.json({ error: "Versículo no encontrado" }, { status: 404 });
  }
}
