import { NextResponse } from 'next/server';
import { getPassage, parseReferenceToUSFM, NVI_NAME } from '@/lib/youversion';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Parámetro q requerido' }, { status: 400 });
  }

  // Convertir la referencia en español a USFM
  const passageId = parseReferenceToUSFM(q.trim());
  if (!passageId) {
    return NextResponse.json(
      { error: 'Referencia bíblica no reconocida. Ejemplo: Juan 3:16, Salmos 23:1' },
      { status: 400 }
    );
  }

  try {
    const passage = await getPassage(passageId);
    return NextResponse.json({
      reference: passage.reference,
      text: passage.content,
      version: 'nvi',
      translation: NVI_NAME
    });
  } catch (error) {
    console.error('YouVersion API error (search):', error);
    return NextResponse.json({ error: 'Versículo no encontrado' }, { status: 404 });
  }
}
