import { NextResponse } from "next/server";
import { getPassage, parseReferenceToUSFM, resolveVersion } from "@/lib/youversion";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const bible = resolveVersion(searchParams.get("version"));

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
    const passage = await getPassage(usfm, "text", bible.key);
    return NextResponse.json({
      reference: passage.reference,
      text: passage.content,
      usfm,
      bible_id: bible.id,
      version: bible.key,
      abbreviation: bible.abbreviation,
      translation: bible.name,
    });
  } catch (error) {
    console.error("YouVersion API error (buscar):", error);
    return NextResponse.json({ error: "Versículo no encontrado" }, { status: 404 });
  }
}
