import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Parámetro q requerido' }, { status: 400 });
  }

  try {
    const apiUrl = `https://rest.api.bible/v1/bibles/b32b9d1b64b4ef29-01/search?query=${q}`;

    const response = await fetch(apiUrl, {
      headers: {
        'api-key': 'C1bni7FKP533XUjJ1Et52'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data?.passages?.length) {
      return NextResponse.json({ error: 'Versículo no encontrado' }, { status: 404 });
    }

    const passage = data.data.passages[0];

    return NextResponse.json({
      reference: passage.reference,
      text: passage.content,
      version: 'simple',
      translation: 'The Holy Bible in Simple Spanish'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
