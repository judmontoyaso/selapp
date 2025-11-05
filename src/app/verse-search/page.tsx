"use client";

import { useState } from "react";
import Link from "next/link";

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
  // Estados para búsqueda por referencia
  const [query, setQuery] = useState('');
  const [searchVersion, setSearchVersion] = useState('simple');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<FavoriteVerse | null>(null);
  const [currentSearchInfo, setCurrentSearchInfo] = useState<{book: string, chapter: number, verse: string} | null>(null);

  // Estados para versículo aleatorio
  const [randomVersion, setRandomVersion] = useState('simple');
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [randomResult, setRandomResult] = useState<FavoriteVerse | null>(null);
  const [currentRandomInfo, setCurrentRandomInfo] = useState<{book: string, chapter: number, verse: string} | null>(null);

  // Función para buscar versículo por referencia
  const searchVerse = async () => {
    if (!query.trim()) {
      alert('Por favor ingresa una referencia bíblica (ej: Juan 3:16)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/devotionals/search?q=${encodeURIComponent(query)}&version=${searchVersion}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
        setCurrentSearchInfo({
          book: data.book,
          chapter: data.chapter,
          verse: data.verses
        });
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

  // Cambiar versión del versículo buscado (mantiene el mismo versículo)
  const handleSearchVersionChange = async (newVersion: string) => {
    setSearchVersion(newVersion);
    if (searchResult && currentSearchInfo) {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/devotionals/search?q=${encodeURIComponent(`${currentSearchInfo.book} ${currentSearchInfo.chapter}:${currentSearchInfo.verse}`)}&version=${newVersion}`
        );
        const data = await res.json();
        if (res.ok) {
          setSearchResult(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para obtener versículo aleatorio
  const fetchRandomVerse = async (version?: string) => {
    const versionToUse = version || randomVersion;
    setLoadingRandom(true);
    try {
      let url = `/api/devotionals/random?version=${versionToUse}`;
      
      // Si se está cambiando versión de un versículo ya cargado, mantener el mismo versículo
      if (version && currentRandomInfo) {
        url += `&book=${encodeURIComponent(currentRandomInfo.book)}&chapter=${currentRandomInfo.chapter}&verse=${currentRandomInfo.verse}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setRandomResult(data);
        setCurrentRandomInfo({
          book: data.book,
          chapter: data.chapter,
          verse: data.verses
        });
      } else {
        alert(data.error || 'Error al obtener versículo');
      }
    } catch (err) {
      console.error(err);
      alert('Error al obtener versículo aleatorio');
    } finally {
      setLoadingRandom(false);
    }
  };

  // Cambiar versión del versículo aleatorio (mantiene el mismo versículo)
  const handleRandomVersionChange = (newVersion: string) => {
    setRandomVersion(newVersion);
    if (randomResult && currentRandomInfo) {
      fetchRandomVerse(newVersion);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white p-6">
      <div className="container mx-auto max-w-5xl">
        <Link href="/" className="text-selapp-brown hover:underline mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-selapp-brown mb-2 text-center">Versículos Bíblicos</h1>
        <p className="text-center text-gray-600 mb-8">
          Busca referencias específicas o descubre versículos aleatorios
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SECCIÓN 1: Buscar por Referencia */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🔍</span>
              <h2 className="text-2xl font-bold text-selapp-brown">Buscar por Referencia</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ingresa una referencia bíblica específica
            </p>

            {/* Selector de versión para búsqueda */}
            <div className="mb-4">
              <label htmlFor="search-version" className="block text-sm font-medium text-gray-700 mb-2">
                Versión
              </label>
              <select 
                id="search-version"
                value={searchVersion} 
                onChange={(e) => handleSearchVersionChange(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-selapp-brown"
              >
                {bibleVersions.map(v => (
                  <option key={v.code} value={v.code}>{v.name}</option>
                ))}
              </select>
              {searchResult && currentSearchInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Cambiar la versión mantendrá la misma referencia
                </p>
              )}
            </div>

            {/* Campo de búsqueda */}
            <div className="mb-4">
              <label htmlFor="verse-query" className="block text-sm font-medium text-gray-700 mb-2">
                Referencia
              </label>
              <div className="flex gap-2">
                <input
                  id="verse-query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchVerse()}
                  placeholder="Ej: Juan 3:16"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-selapp-brown"
                />
                <button 
                  onClick={searchVerse} 
                  disabled={loading} 
                  className="bg-selapp-brown hover:bg-selapp-brown/90 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {loading ? '⏳' : '🔍'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ej: Juan 3:16, Génesis 1:1, Salmos 23:1
              </p>
            </div>

            {/* Resultado de búsqueda */}
            {searchResult ? (
              <div className="bg-selapp-beige p-4 rounded-lg border-l-4 border-selapp-brown">
                <div 
                  className="text-gray-800 text-lg mb-3 leading-relaxed font-serif italic" 
                  dangerouslySetInnerHTML={{ __html: searchResult.text }} 
                />
                <div className="pt-3 border-t border-selapp-brown/20">
                  <p className="font-bold text-selapp-brown">{searchResult.reference}</p>
                  {searchResult.tema && (
                    <p className="text-sm text-selapp-brown-light">Tema: {searchResult.tema}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-5xl mb-2">📖</div>
                <p className="text-sm">Ingresa una referencia y haz clic en buscar</p>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: Versículo Aleatorio */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎲</span>
              <h2 className="text-2xl font-bold text-selapp-brown">Versículo Aleatorio</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Descubre un versículo sorpresa de la Biblia
            </p>

            {/* Selector de versión para aleatorio */}
            <div className="mb-4">
              <label htmlFor="random-version" className="block text-sm font-medium text-gray-700 mb-2">
                Versión
              </label>
              <select 
                id="random-version"
                value={randomVersion} 
                onChange={(e) => handleRandomVersionChange(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-selapp-brown"
              >
                {bibleVersions.map(v => (
                  <option key={v.code} value={v.code}>{v.name}</option>
                ))}
              </select>
              {randomResult && currentRandomInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Cambiar la versión mantendrá el mismo versículo
                </p>
              )}
            </div>

            {/* Botón generar aleatorio */}
            <button
              onClick={() => fetchRandomVerse()}
              disabled={loadingRandom}
              className="w-full bg-selapp-accent hover:bg-selapp-accent-dark text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3 mb-4 shadow-md"
            >
              {loadingRandom ? (
                <>
                  <span className="animate-spin text-xl">⏳</span>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🔄</span>
                  <span>Generar Versículo</span>
                </>
              )}
            </button>

            {/* Resultado aleatorio */}
            {randomResult ? (
              <div className="bg-selapp-beige p-4 rounded-lg border-l-4 border-selapp-accent">
                <div 
                  className="text-gray-800 text-lg mb-3 leading-relaxed font-serif italic" 
                  dangerouslySetInnerHTML={{ __html: randomResult.text }} 
                />
                <div className="pt-3 border-t border-selapp-accent/20">
                  <p className="font-bold text-selapp-brown">{randomResult.reference}</p>
                  {randomResult.tema && (
                    <p className="text-sm text-selapp-brown-light">Tema: {randomResult.tema}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-5xl mb-2">✨</div>
                <p className="text-sm">Haz clic en el botón para descubrir un versículo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
