"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, BookOpen, ChevronLeft, Calendar, Tag, MessageCircle, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-selapp-beige selection:bg-selapp-accent/30 p-6 pb-16">
      <div className="container mx-auto max-w-5xl">
        <Link href="/" className="group inline-flex items-center gap-2 text-selapp-brown hover:text-selapp-brown-dark mb-8 transition-colors">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al inicio</span>
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={48} className="animate-spin text-selapp-brown opacity-50" strokeWidth={1.5} />
            <span className="text-selapp-brown-light font-serif italic">Cargando devocionales...</span>
          </div>
        ) : (
          <>
            {/* Versículo del Día */}
            {verseOfDay && (
              <div className="selapp-card p-8 md:p-10 mb-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <BookOpen size={32} className="text-selapp-brown" strokeWidth={1.5} />
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-selapp-brown">
                      Versículo del Día
                    </h2>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-selapp-brown-light">
                    <Calendar size={14} />
                    <p>
                      {new Date(verseOfDay.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-selapp-brown/5 to-selapp-beige/50 p-8 rounded-3xl border-l-[8px] border-selapp-brown shadow-inner">
                  <div
                    className="text-selapp-brown-dark text-xl md:text-2xl mb-6 leading-relaxed italic font-serif text-center"
                    dangerouslySetInnerHTML={{ __html: `"${verseOfDay.text}"` }}
                  />

                  <div className="flex items-center justify-center gap-4 pt-6 border-t border-selapp-brown/20">
                    <p className="text-selapp-brown font-bold text-lg">
                      {verseOfDay.reference}
                    </p>
                    {verseOfDay.tema && (
                      <span className="flex items-center gap-1 text-xs bg-selapp-brown text-white px-4 py-2 rounded-full font-medium shadow-sm">
                        <Tag size={12} />
                        {verseOfDay.tema}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Devocionales */}
            <div className="selapp-card p-8 md:p-10">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Heart size={32} className="text-selapp-accent" strokeWidth={1.5} />
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-selapp-brown">
                    Devocionales
                  </h1>
                </div>
                <p className="text-selapp-brown-light text-lg font-light max-w-2xl mx-auto">
                  Reflexiones diarias generadas con IA basadas en la Palabra de Dios
                </p>
              </div>

              {devotionals.length > 0 ? (
                <div className="space-y-6">
                  {devotionals.map((devotional) => (
                    <Link
                      key={devotional.id}
                      href={`/devotionals/${devotional.date.split('T')[0]}`}
                      className="block group"
                    >
                      <div className="bg-gradient-to-br from-white to-selapp-beige/30 p-6 md:p-8 rounded-2xl border-l-[6px] border-selapp-accent hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                          <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-selapp-brown mb-2 group-hover:text-selapp-brown-dark transition-colors">
                              {devotional.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                              <Calendar size={14} />
                              <p>
                                {new Date(devotional.date).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-sm bg-selapp-accent/10 text-selapp-accent px-4 py-2 rounded-full font-bold uppercase tracking-wide">
                            <Tag size={14} />
                            {devotional.theme}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-selapp-brown font-bold mb-2 flex items-center gap-2">
                            <BookOpen size={16} />
                            {devotional.verseReference}
                          </p>

                          <div
                            className="text-selapp-brown-dark italic mb-4 line-clamp-2 font-serif text-lg pl-6 border-l-2 border-selapp-beige-dark"
                            dangerouslySetInnerHTML={{ __html: `"${devotional.verseText}"` }}
                          />
                        </div>

                        {devotional.reflection && (
                          <p className="text-selapp-brown-light line-clamp-3 mb-4 leading-relaxed">
                            {devotional.reflection}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-selapp-beige-dark/30">
                          <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                            <MessageCircle size={16} />
                            <span className="font-medium">{devotional.questions.length} preguntas de reflexión</span>
                          </div>
                          <span className="text-selapp-accent group-hover:translate-x-1 transition-transform font-medium text-sm">
                            Leer más →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-selapp-brown/40 py-16">
                  <BookOpen size={64} className="mx-auto mb-6 opacity-20" strokeWidth={1} />
                  <p className="text-lg mb-4 font-medium">
                    Aún no hay devocionales generados.
                  </p>
                  <p className="text-sm text-selapp-brown-light max-w-md mx-auto">
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
