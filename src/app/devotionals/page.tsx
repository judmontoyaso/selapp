"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface VerseOfDay {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: string;
  version: string;
  tema?: string;
  date: string;
  source: 'database' | 'api-generated';
}

export default function DevotionalsPage() {
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerseOfDay();
  }, []);

  const fetchVerseOfDay = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/verse-of-day');
      const data = await response.json();
      
      if (response.ok) {
        setVerseOfDay(data);
      } else {
        console.error('Error fetching verse of day:', data.error);
        alert('Error al cargar el versículo del día. Por favor, recarga la página.');
      }
    } catch (error) {
      console.error('Error fetching verse of day:', error);
      alert('Error al cargar el versículo del día. Por favor, recarga la página.');
    } finally {
      setLoading(false);
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
              📖 Versículo del Día
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Un versículo especial para meditar hoy
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-2xl animate-spin">⏳</span>
              <span className="ml-3 text-selapp-brown dark:text-selapp-beige">Cargando versículo del día...</span>
            </div>
          ) : verseOfDay ? (
            <div className="bg-selapp-beige dark:bg-selapp-brown/20 p-8 rounded-xl border-l-4 border-selapp-brown shadow-md">
              <div className="text-center mb-4">
                <p className="text-sm text-selapp-brown-light dark:text-selapp-beige/70">
                  {new Date(verseOfDay.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div 
                className="text-gray-800 dark:text-gray-200 text-2xl mb-6 leading-relaxed text-center font-serif italic scripture-styles"
                dangerouslySetInnerHTML={{ __html: verseOfDay.text }}
              />

              <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-selapp-brown/20">
                <div>
                  <p className="text-selapp-brown dark:text-selapp-beige font-bold text-lg mb-1">
                    {verseOfDay.reference}
                  </p>
                  {verseOfDay.tema && (
                    <p className="text-sm text-selapp-brown/70 dark:text-selapp-beige/70">
                      Tema: {verseOfDay.tema}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  {verseOfDay.source === 'api-generated' ? (
                    <>
                      <span>✨</span>
                      <span>Generado hoy</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Versículo del día</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <span className="text-6xl mb-4 block">📖</span>
              <p className="text-lg">
                No se pudo cargar el versículo del día. Por favor, intenta recargar la página.
              </p>
            </div>
          )}

          {/* Botón para buscar más versículos */}
          <div className="mt-8 text-center">
            <Link 
              href="/verse-search"
              className="inline-block bg-selapp-brown hover:bg-selapp-brown/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔍 Buscar otros versículos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
