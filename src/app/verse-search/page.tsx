"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Sparkles, BookOpen, ChevronLeft, ArrowRight, Lightbulb, Loader2 } from "lucide-react";

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
  const [currentSearchInfo, setCurrentSearchInfo] = useState<{ book: string, chapter: number, verse: string } | null>(null);

  // Estados para versículo aleatorio
  const [randomVersion, setRandomVersion] = useState('simple');
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [randomResult, setRandomResult] = useState<FavoriteVerse | null>(null);
  const [currentRandomInfo, setCurrentRandomInfo] = useState<{ book: string, chapter: number, verse: string } | null>(null);

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
    <div className="min-h-screen bg-selapp-beige selection:bg-selapp-accent/30 p-6 pb-16">
      <div className="container mx-auto max-w-6xl">
        <Link href="/" className="group inline-flex items-center gap-2 text-selapp-brown hover:text-selapp-brown-dark mb-8 transition-colors">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-selapp-brown mb-4">
            Versículos Bíblicos
          </h1>
          <p className="text-lg text-selapp-brown-light font-light max-w-2xl mx-auto">
            Busca referencias específicas o descubre versículos sorpresa que inspiren tu día
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* SECCIÓN 1: Buscar por Referencia */}
          <div className="selapp-card p-8 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-selapp-brown/10 rounded-2xl flex items-center justify-center text-selapp-brown">
                <Search size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-selapp-brown">Buscar por Referencia</h2>
                <p className="text-sm text-selapp-brown-light">Ingresa una referencia específica</p>
              </div>
            </div>

            {/* Selector de versión para búsqueda */}
            <div className="mb-5">
              <label htmlFor="search-version" className="block text-sm font-bold text-selapp-brown mb-2 uppercase tracking-wide">
                Versión Bíblica
              </label>
              <select
                id="search-version"
                value={searchVersion}
                onChange={(e) => handleSearchVersionChange(e.target.value)}
                className="selapp-input w-full"
              >
                {bibleVersions.map(v => (
                  <option key={v.code} value={v.code}>{v.name}</option>
                ))}
              </select>
              {searchResult && currentSearchInfo && (
                <p className="text-xs text-selapp-brown-light mt-2 flex items-center gap-1">
                  <Lightbulb size={12} />
                  Cambiar la versión mantendrá la misma referencia
                </p>
              )}
            </div>

            {/* Campo de búsqueda */}
            <div className="mb-6">
              <label htmlFor="verse-query" className="block text-sm font-bold text-selapp-brown mb-2 uppercase tracking-wide">
                Referencia
              </label>
              <div className="flex gap-3">
                <input
                  id="verse-query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchVerse()}
                  placeholder="Ej: Juan 3:16"
                  className="selapp-input flex-1"
                />
                <button
                  onClick={searchVerse}
                  disabled={loading}
                  className="selapp-button px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-selapp-brown-light/70 mt-2">
                Ejemplos: Juan 3:16, Génesis 1:1, Salmos 23:1
              </p>
            </div>

            {/* Resultado de búsqueda */}
            {searchResult ? (
              <div className="bg-gradient-to-br from-selapp-beige/50 to-white p-6 rounded-2xl border-l-[6px] border-selapp-brown shadow-inner">
                <div
                  className="text-selapp-brown-dark text-lg mb-4 leading-relaxed font-serif italic"
                  dangerouslySetInnerHTML={{ __html: searchResult.text }}
                />
                <div className="pt-4 border-t border-selapp-brown/10 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-selapp-brown mb-1">{searchResult.reference}</p>
                    {searchResult.tema && (
                      <span className="text-xs bg-selapp-brown/10 text-selapp-brown px-3 py-1 rounded-full font-medium">
                        {searchResult.tema}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-selapp-brown/30 py-12 border-2 border-dashed border-selapp-beige-dark rounded-2xl">
                <BookOpen size={56} className="mx-auto mb-4 opacity-20" strokeWidth={1} />
                <p className="text-sm font-medium">Ingresa una referencia y haz clic en buscar</p>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: Versículo Aleatorio */}
          <div className="selapp-card p-8 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-selapp-accent/10 rounded-2xl flex items-center justify-center text-selapp-accent">
                <Sparkles size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-selapp-brown">Versículo Aleatorio</h2>
                <p className="text-sm text-selapp-brown-light">Descubre una sorpresa de la Biblia</p>
              </div>
            </div>

            {/* Selector de versión para aleatorio */}
            <div className="mb-5">
              <label htmlFor="random-version" className="block text-sm font-bold text-selapp-brown mb-2 uppercase tracking-wide">
                Versión Bíblica
              </label>
              <select
                id="random-version"
                value={randomVersion}
                onChange={(e) => handleRandomVersionChange(e.target.value)}
                className="selapp-input w-full"
              >
                {bibleVersions.map(v => (
                  <option key={v.code} value={v.code}>{v.name}</option>
                ))}
              </select>
              {randomResult && currentRandomInfo && (
                <p className="text-xs text-selapp-brown-light mt-2 flex items-center gap-1">
                  <Lightbulb size={12} />
                  Cambiar la versión mantendrá el mismo versículo
                </p>
              )}
            </div>

            {/* Botón generar aleatorio */}
            <button
              onClick={() => fetchRandomVerse()}
              disabled={loadingRandom}
              className="w-full bg-gradient-to-r from-selapp-accent to-selapp-accent-light hover:from-selapp-accent-dark hover:to-selapp-accent text-white font-bold py-4 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loadingRandom ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generar Versículo</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Resultado aleatorio */}
            {randomResult ? (
              <div className="bg-gradient-to-br from-selapp-accent/5 to-selapp-beige/50 p-6 rounded-2xl border-l-[6px] border-selapp-accent shadow-inner">
                <div
                  className="text-selapp-brown-dark text-lg mb-4 leading-relaxed font-serif italic"
                  dangerouslySetInnerHTML={{ __html: randomResult.text }}
                />
                <div className="pt-4 border-t border-selapp-accent/10 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-selapp-brown mb-1">{randomResult.reference}</p>
                    {randomResult.tema && (
                      <span className="text-xs bg-selapp-accent/10 text-selapp-accent px-3 py-1 rounded-full font-medium">
                        {randomResult.tema}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-selapp-brown/30 py-12 border-2 border-dashed border-selapp-beige-dark rounded-2xl">
                <Sparkles size={56} className="mx-auto mb-4 opacity-20" strokeWidth={1} />
                <p className="text-sm font-medium">Haz clic en el botón para descubrir un versículo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
