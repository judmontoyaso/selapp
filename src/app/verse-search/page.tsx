"use client";

import { useState } from "react";
import Link from "next/link";

interface Verse {
  reference: string;
  text: string;
}

interface FavoriteVerse {
  reference: string;
  text: string;
  chapter?: number;
  verses?: string;
  book?: string;
  tema?: string;
  translation?: string;
  version?: string;
  source?: 'api' | 'database';
  note?: string;
}

const bibleVersions = [
  { code: 'simple', name: 'Biblia en Español Simple' },
  { code: 'rvr1909', name: 'Reina Valera 1909' },
  { code: 'pdpt', name: 'Palabra de Dios para Ti' },
  { code: 'pdpt-nt', name: 'Palabra de Dios para Ti (NT)' },
  { code: 'fbv-nt', name: 'Biblia Libre (NT)' },
  { code: 'vbl', name: 'Versión Biblia Libre' },
  { code: 'nbv', name: 'Nueva Biblia Viva 2008 (No disponible)' }
];

export default function VerseSearchPage() {
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('simple');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FavoriteVerse | null>(null);

  const searchVerse = async () => {
    if (!query.trim()) {
      alert('Por favor ingresa una referencia bíblica (ej: Juan 3:16)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/devotionals/search?q=${encodeURIComponent(query)}&version=${version}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Error al buscar versículo');
      }
    } catch (err) {
      console.error(err);
      alert('Error al buscar versículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white p-6">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="text-selapp-brown hover:underline mb-4 inline-block">← Volver al inicio</Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-selapp-brown mb-4">Buscar Versículos</h1>
          <p className="text-sm text-gray-600 mb-6">Busca por referencia (ej: Juan 3:16) y elige la versión de la Biblia.</p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Versión</label>
            <select value={version} onChange={(e) => setVersion(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
              {bibleVersions.map(v => (
                <option key={v.code} value={v.code}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Referencia</label>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchVerse()}
                placeholder="Ej: Juan 3:16"
                className="flex-1 px-4 py-3 border rounded-lg"
              />
              <button onClick={searchVerse} disabled={loading} className="bg-selapp-brown text-white px-4 py-3 rounded-lg disabled:opacity-50">
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-selapp-beige p-6 rounded-lg border-l-4 border-selapp-brown">
              <div className="text-2xl font-serif italic mb-4" dangerouslySetInnerHTML={{ __html: result.text }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-selapp-brown">{result.reference}</p>
                  {result.tema && <p className="text-sm text-selapp-brown-light">Tema: {result.tema}</p>}
                </div>
                <div className="text-sm text-gray-600">{result.source === 'api' ? 'API' : 'Base de datos'}{result.translation ? ` • ${result.translation}` : ''}</div>
              </div>
            </div>
          )}

          {!result && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-6xl">🔎</div>
              <p className="mt-4">Realiza una búsqueda para ver el versículo aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
