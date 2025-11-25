"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DevotionalQuestion {
  id: string;
  question: string;
  questionType: string;
  order: number;
}

interface Devotional {
  id: string;
  date: string;
  title: string;
  theme: string;
  verseReference: string;
  verseText: string;
  reflection: string | null;
  questions: DevotionalQuestion[];
}

interface VerseOfDay {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: string;
  tema?: string;
  date: string;
}

export default function DevotionalsPage() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar devocionales y versículo del día en paralelo
      const [devotionalsRes, verseRes] = await Promise.all([
        fetch('/api/devotionals-ai'),
        fetch('/api/verse-of-day')
      ]);
      
      if (devotionalsRes.ok) {
        const data = await devotionalsRes.json();
        setDevotionals(data.devotionals || []);
      }
      
      if (verseRes.ok) {
        const data = await verseRes.json();
        setVerseOfDay(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-2xl animate-spin">⏳</span>
            <span className="ml-3 text-selapp-brown dark:text-selapp-beige">Cargando...</span>
          </div>
        ) : (
          <>
            {/* Versículo del Día */}
            {verseOfDay && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-selapp-brown dark:text-selapp-beige mb-2">
                    📖 Versículo del Día
                  </h2>
                  <p className="text-sm text-selapp-brown-light dark:text-selapp-beige/70">
                    {new Date(verseOfDay.date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="bg-selapp-beige dark:bg-selapp-brown/20 p-6 rounded-xl border-l-4 border-selapp-brown">
                  <div 
                    className="text-gray-800 dark:text-gray-200 text-xl mb-4 leading-relaxed italic"
                    dangerouslySetInnerHTML={{ __html: `"${verseOfDay.text}"` }}
                  />
                  
                  <div className="flex items-center justify-between">
                    <p className="text-selapp-brown dark:text-selapp-beige font-bold">
                      {verseOfDay.reference}
                    </p>
                    {verseOfDay.tema && (
                      <span className="text-sm bg-selapp-brown text-white px-3 py-1 rounded-full">
                        {verseOfDay.tema}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Devocionales */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 text-selapp-brown dark:text-selapp-beige">
                  💭 Devocionales
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Reflexiones diarias generadas con IA basadas en la Palabra de Dios
                </p>
              </div>

              {devotionals.length > 0 ? (
                <div className="space-y-6">
                  {devotionals.map((devotional) => (
                    <Link 
                      key={devotional.id}
                      href={`/devotionals/${devotional.date.split('T')[0]}`}
                      className="block bg-selapp-beige dark:bg-selapp-brown/20 p-6 rounded-xl border-l-4 border-selapp-brown hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h2 className="text-2xl font-bold text-selapp-brown dark:text-selapp-beige mb-1">
                            {devotional.title}
                          </h2>
                          <p className="text-sm text-selapp-brown-light dark:text-selapp-beige/70">
                            {new Date(devotional.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <span className="text-sm bg-selapp-brown text-white px-3 py-1 rounded-full">
                          {devotional.theme}
                        </span>
                      </div>
                      
                      <p className="text-selapp-brown dark:text-selapp-beige font-semibold mb-2">
                        {devotional.verseReference}
                      </p>
                      
                      <p className="text-gray-700 dark:text-gray-300 italic mb-4 line-clamp-2">
                        "{devotional.verseText}"
                      </p>
                      
                      {devotional.reflection && (
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                          {devotional.reflection}
                        </p>
                      )}
                      
                      <div className="mt-4 flex items-center text-sm text-selapp-brown dark:text-selapp-beige">
                        <span>💭 {devotional.questions.length} preguntas de reflexión</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <span className="text-6xl mb-4 block">📖</span>
                  <p className="text-lg mb-4">
                    Aún no hay devocionales generados.
                  </p>
                  <p className="text-sm">
                    El sistema generará automáticamente un devocional cada día a las 5:30 AM.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
