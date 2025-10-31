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
  translation?: string;
  source: 'api' | 'database';
}

export default function DevotionalsPage() {
  const [favoriteVerse, setFavoriteVerse] = useState<FavoriteVerse | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(false);

  const fetchRandomFavoriteVerse = async () => {
    setLoadingVerse(true);
    try {
      const response = await fetch("/api/favorites/random");
      const data = await response.json();
      
      if (response.ok) {
        setFavoriteVerse(data);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="text-selapp-brown dark:text-selapp-beige hover:underline mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-selapp-brown dark:text-selapp-beige">
              Versículo del Día
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Obtén un versículo aleatorio de tus favoritos
            </p>
          </div>

          <button
            onClick={fetchRandomFavoriteVerse}
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
                <span className="text-2xl">📖</span>
                Obtener Versículo Aleatorio
              </>
            )}
          </button>

          {favoriteVerse && (
            <div className="bg-selapp-beige dark:bg-selapp-brown/20 p-8 rounded-xl border-l-4 border-selapp-brown shadow-md">
              <p className="text-gray-800 dark:text-gray-200 text-2xl mb-6 leading-relaxed text-center font-serif">
                <q className="italic">{favoriteVerse.text}</q>
              </p>
              <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-selapp-brown/20">
                <p className="text-selapp-brown dark:text-selapp-beige font-bold text-lg">
                  {favoriteVerse.reference}
                </p>
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
                Haz clic en el botón para obtener un versículo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
