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
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-selapp-brown/10">
        <div className="flex items-center justify-center">
          <span className="text-2xl animate-spin">⏳</span>
          <span className="ml-3 text-selapp-brown-light">Cargando versículo del día...</span>
        </div>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-selapp-brown/10 hover:shadow-md transition-shadow">
      {/* Header minimalista */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-selapp-brown/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📖</span>
          <div>
            <h2 className="text-xl font-semibold text-selapp-brown">
              Versículo del Día
            </h2>
            <p className="text-xs text-selapp-brown-light/70">
              {new Date(verse.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>
        {verse.tema && (
          <span className="text-xs px-3 py-1 bg-selapp-accent/10 text-selapp-accent rounded-full font-medium">
            {verse.tema}
          </span>
        )}
      </div>

      {/* Texto del versículo - más espacioso y legible */}
      <div 
        className="text-gray-800 text-xl md:text-2xl mb-6 leading-relaxed text-center font-serif scripture-styles px-4"
        dangerouslySetInnerHTML={{ __html: verse.text }}
      />

      {/* Footer minimalista */}
      <div className="flex items-center justify-center pt-4 border-t border-selapp-brown/10">
        <p className="text-selapp-brown font-semibold text-base">
          {verse.reference}
        </p>
      </div>
    </div>
  );
}
