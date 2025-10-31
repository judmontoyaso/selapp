"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Verse {
  reference: string;
  text: string;
}

interface DevotionalData {
  id: string;
  title: string;
  topic: string;
  content: string;
  questions: string[];
  verses: Array<{
    verse: Verse;
  }>;
  completedAt?: string;
}

interface FavoriteVerse {
  reference: string;
  text: string;
  chapter: number;
  verses: string;
  book: string;
  tema?: string;
  translation?: string;
  version?: string;
  source: 'api' | 'database';
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

export default function DevotionalsPage() {
  const [favoriteVerse, setFavoriteVerse] = useState<FavoriteVerse | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('simple');
  const [currentVerseInfo, setCurrentVerseInfo] = useState<{book: string, chapter: number, verse: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchRandomFavoriteVerse = async (version?: string) => {
    const versionToUse = version || selectedVersion;
    setLoadingVerse(true);
    try {
      let url = `/api/devotionals/random?version=${versionToUse}`;
      
      // Si hay información de versículo actual y se está cambiando versión, usar el mismo versículo
      if (version && currentVerseInfo) {
        url += `&book=${encodeURIComponent(currentVerseInfo.book)}&chapter=${currentVerseInfo.chapter}&verse=${currentVerseInfo.verse}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setFavoriteVerse(data);
        // Guardar información del versículo para cambios futuros de versión
        setCurrentVerseInfo({
          book: data.book,
          chapter: data.chapter,
          verse: data.verses
        });
      } else {
        alert(data.error || "Error al obtener versículo");
      }
    } catch (error) {
      console.error("Error fetching favorite verse:", error);
      alert("Error al obtener versículo favorito");
    } finally {
      setLoadingVerse(false);
    }
  };

  const searchVerse = async () => {
    if (!searchQuery.trim()) {
      alert("Por favor ingresa una referencia bíblica (ej: Juan 3:16)");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/devotionals/search?q=${encodeURIComponent(searchQuery)}&version=${selectedVersion}`);
      const data = await response.json();

      if (response.ok) {
        setFavoriteVerse(data);
        setCurrentVerseInfo(null); // Limpiar info del versículo actual ya que es una búsqueda nueva
      } else {
        alert(data.error || "Error al buscar versículo");
      }
    } catch (error) {
      console.error("Error searching verse:", error);
      alert("Error al buscar versículo");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="text-selapp-brown dark:text-selapp-beige hover:underline mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-selapp-brown dark:text-selapp-beige">
              Devocionales y Versículos
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Busca versículos específicos o obtén uno aleatorio de la Biblia
            </p>

            <div className="max-w-md mx-auto mb-6">
              <label htmlFor="bible-version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Versión de la Biblia
              </label>
              <select
                id="bible-version"
                value={selectedVersion}
                onChange={(e) => {
                  const newVersion = e.target.value;
                  setSelectedVersion(newVersion);
                  // Si ya hay un versículo generado, cambiar su versión
                  if (favoriteVerse && currentVerseInfo) {
                    fetchRandomFavoriteVerse(newVersion);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-selapp-brown focus:border-transparent transition-colors"
              >
                {bibleVersions.map((version) => (
                  <option key={version.code} value={version.code}>
                    {version.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campo de búsqueda */}
          <div className="max-w-md mx-auto mb-6">
            <label htmlFor="verse-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Versículo
            </label>
            <div className="flex gap-2">
              <input
                id="verse-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Juan 3:16"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-selapp-brown focus:border-transparent transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && searchVerse()}
              />
              <button
                onClick={searchVerse}
                disabled={searching}
                className="bg-selapp-brown hover:bg-selapp-brown/90 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {searching ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>🔍</span>
                )}
                Buscar
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingresa referencias como &quot;Juan 3:16&quot;, &quot;Génesis 1:1&quot;, etc.
            </p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">O</span>
              <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
            </div>
          </div>

          <button
            onClick={() => fetchRandomFavoriteVerse()}
            disabled={loadingVerse}
            className="w-full bg-selapp-brown hover:bg-selapp-brown/90 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3 mb-6 text-lg"
          >
            {loadingVerse ? (
              <>
                <span className="animate-spin text-2xl">⏳</span>
                Cargando...
              </>
            ) : (
              <>
                <span className="text-2xl">🔄</span>
                Versículo Aleatorio
              </>
            )}
          </button>

          {favoriteVerse && (
            <div className="bg-selapp-beige dark:bg-selapp-brown/20 p-8 rounded-xl border-l-4 border-selapp-brown shadow-md">
              <div 
                className="text-gray-800 dark:text-gray-200 text-2xl mb-6 leading-relaxed text-center font-serif italic scripture-styles"
                dangerouslySetInnerHTML={{ __html: favoriteVerse.text }}
              />
              {favoriteVerse.note && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center italic">
                  {favoriteVerse.note}
                </p>
              )}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-selapp-brown/20">
                <div>
                  <p className="text-selapp-brown dark:text-selapp-beige font-bold text-lg mb-1">
                    {favoriteVerse.reference}
                  </p>
                  {favoriteVerse.tema && (
                    <p className="text-sm text-selapp-brown/70 dark:text-selapp-beige/70">
                      Tema: {favoriteVerse.tema}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  {favoriteVerse.source === 'api' ? (
                    <>
                      <span>🌐</span>
                      <span>API Bible</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Base de datos</span>
                    </>
                  )}
                  {favoriteVerse.translation && ` • ${favoriteVerse.translation}`}
                </span>
              </div>
            </div>
          )}

          {!favoriteVerse && !loadingVerse && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <span className="text-6xl mb-4 block">📖</span>
              <p className="text-lg">
                Haz clic en el botón para obtener un versículo de la Biblia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
