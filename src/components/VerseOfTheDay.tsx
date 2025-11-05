"use client";

import { useEffect, useState } from "react";

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

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<VerseOfDay | null>(null);
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
        setVerse(data);
      } else {
        console.error('Error fetching verse of day:', data.error);
      }
    } catch (error) {
      console.error('Error fetching verse of day:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-selapp-beige to-selapp-cream rounded-2xl shadow-xl p-8 mb-8 border-l-4 border-selapp-accent">
        <div className="flex items-center justify-center">
          <span className="text-2xl animate-spin">⏳</span>
          <span className="ml-3 text-selapp-brown">Cargando versículo del día...</span>
        </div>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-selapp-beige to-selapp-cream rounded-2xl shadow-xl p-8 mb-8 border-l-4 border-selapp-accent">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-selapp-brown flex items-center justify-center gap-2">
          <span className="text-3xl">📖</span>
          Versículo del Día
        </h2>
        <p className="text-sm text-selapp-brown-light mt-1">
          {new Date(verse.date).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div 
        className="text-gray-800 text-xl md:text-2xl mb-6 leading-relaxed text-center font-serif italic scripture-styles"
        dangerouslySetInnerHTML={{ __html: verse.text }}
      />

      <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-selapp-brown/20">
        <div>
          <p className="text-selapp-brown font-bold text-lg">
            {verse.reference}
          </p>
          {verse.tema && (
            <p className="text-sm text-selapp-brown-light">
              Tema: {verse.tema}
            </p>
          )}
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          {verse.source === 'api-generated' ? (
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
  );
}
