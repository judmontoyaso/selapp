"use client";

import { useEffect, useState } from "react";
import { BookOpen, Tag, Loader2 } from "lucide-react";

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
      <div className="selapp-card p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 size={40} className="animate-spin text-selapp-brown opacity-50" strokeWidth={1.5} />
          <span className="text-selapp-brown-light font-serif italic">Cargando versículo del día...</span>
        </div>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <div className="selapp-card p-8 md:p-10 bg-gradient-to-br from-white via-selapp-beige/10 to-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 pb-6 border-b border-selapp-beige-dark/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-selapp-brown/10 rounded-2xl flex items-center justify-center">
            <BookOpen size={24} className="text-selapp-brown" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-selapp-brown">
              Versículo del Día
            </h2>
            <p className="text-xs text-selapp-brown-light uppercase tracking-wider font-medium">
              {new Date(verse.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>
        {verse.tema && (
          <span className="flex items-center gap-1 text-xs px-4 py-2 bg-selapp-accent/10 text-selapp-accent rounded-full font-bold uppercase tracking-wide">
            <Tag size={12} />
            {verse.tema}
          </span>
        )}
      </div>

      {/* Texto del versículo */}
      <div className="bg-gradient-to-br from-selapp-brown/5 to-transparent rounded-3xl p-8 mb-6 border-l-[8px] border-selapp-brown shadow-inner">
        <div
          className="text-selapp-brown-dark text-xl md:text-2xl leading-relaxed text-center font-serif italic scripture-styles"
          dangerouslySetInnerHTML={{ __html: `"${verse.text}"` }}
        />
      </div>

      {/* Footer con referencia */}
      <div className="flex items-center justify-center pt-6 border-t border-selapp-beige-dark/30">
        <p className="text-selapp-brown font-bold text-lg">
          {verse.reference}
        </p>
      </div>
    </div>
  );
}
