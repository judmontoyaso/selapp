"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface DevotionalQuestion {
  id: string;
  question: string;
  questionType: string;
  order: number;
  answers?: { answer: string }[];
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

export default function DevotionalDetailPage() {
  const params = useParams();
  const date = params.date as string;
  const { data: session } = useSession();
  
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasAnswers, setHasAnswers] = useState(false);

  useEffect(() => {
    fetchDevotional();
  }, [date]);

  const fetchDevotional = async () => {
    setLoading(true);
    try {
      const dateOnly = date.split('T')[0];
      const response = await fetch(`/api/devotionals-ai?date=${dateOnly}&includeAnswers=true`);
      const data = await response.json();
      
      if (response.ok) {
        setDevotional(data);
        
        // Cargar respuestas existentes
        const existingAnswers: { [key: string]: string } = {};
        let foundAnswers = false;
        data.questions.forEach((q: DevotionalQuestion) => {
          if (q.answers && q.answers.length > 0) {
            existingAnswers[q.id] = q.answers[0].answer;
            foundAnswers = true;
          }
        });
        setAnswers(existingAnswers);
        setHasAnswers(foundAnswers);
        // No permitir edición hasta que usuario presione "Editar"
        setIsEditing(!foundAnswers);
      }
    } catch (error) {
      console.error('Error fetching devotional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAnswers = async () => {
    if (!session) {
      alert('Debes iniciar sesión para guardar tus respuestas');
      return;
    }

    setSaving(true);
    try {
      const savePromises = Object.entries(answers).map(([questionId, answer]) => {
        if (!answer.trim()) return Promise.resolve();
        
        return fetch('/api/devotionals-ai/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            devotionalId: devotional?.id,
            questionId,
            answer: answer.trim()
          })
        });
      });

      await Promise.all(savePromises);
      alert('✅ Respuestas guardadas exitosamente');
      setIsEditing(false);
      setHasAnswers(true);
    } catch (error) {
      console.error('Error saving answers:', error);
      alert('❌ Error al guardar respuestas');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <span className="text-2xl animate-spin">⏳</span>
            <span className="ml-3 text-selapp-brown dark:text-selapp-beige">Cargando devocional...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!devotional) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/devotionals" className="text-selapp-brown dark:text-selapp-beige hover:underline mb-4 inline-block">
            ← Volver a devocionales
          </Link>
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <span className="text-6xl mb-4 block">📖</span>
            <p className="text-lg">Devocional no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/devotionals" className="text-selapp-brown dark:text-selapp-beige hover:underline mb-4 inline-block">
          ← Volver a devocionales
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-selapp-brown dark:text-selapp-beige">
                {devotional.title}
              </h1>
              <span className="text-sm bg-selapp-brown text-white px-3 py-1 rounded-full">
                {devotional.theme}
              </span>
            </div>
            <p className="text-sm text-selapp-brown-light dark:text-selapp-beige/70">
              {new Date(devotional.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Versículo */}
          <div className="bg-selapp-beige dark:bg-selapp-brown/20 p-6 rounded-xl border-l-4 border-selapp-brown mb-8">
            <p className="text-selapp-brown dark:text-selapp-beige font-bold text-lg mb-3">
              {devotional.verseReference}
            </p>
            <div 
              className="text-gray-800 dark:text-gray-200 text-xl leading-relaxed italic mb-4"
              dangerouslySetInnerHTML={{ __html: `"${devotional.verseText}"` }}
            />
          </div>

          {/* Reflexión */}
          {devotional.reflection && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-selapp-brown dark:text-selapp-beige mb-4">
                💭 Reflexión
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {devotional.reflection}
                </p>
              </div>
            </div>
          )}

          {/* Preguntas de Reflexión */}
          {devotional.questions && devotional.questions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-selapp-brown dark:text-selapp-beige mb-4">
                🤔 Preguntas de Reflexión
              </h2>
              <div className="space-y-6">
                {devotional.questions.map((question, index) => (
                  <div 
                    key={question.id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                  >
                    <p className="text-gray-800 dark:text-gray-200 font-medium mb-3">
                      {index + 1}. {question.question}
                    </p>
                    
                    {session ? (
                      <>
                        {isEditing ? (
                          <textarea
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Escribe tu reflexión aquí..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                     focus:ring-2 focus:ring-selapp-brown focus:border-transparent
                                     min-h-[100px] resize-y"
                          />
                        ) : (
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {answers[question.id] || <span className="italic text-gray-400">Sin respuesta</span>}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Inicia sesión para guardar tus respuestas
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Botones Editar/Guardar/Cancelar */}
              {session && (
                <div className="mt-6 flex justify-end gap-3">
                  {!isEditing && hasAnswers && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold 
                               py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                    >
                      ✏️ Editar Respuestas
                    </button>
                  )}
                  
                  {isEditing && (
                    <>
                      {hasAnswers && (
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            fetchDevotional(); // Recargar respuestas originales
                          }}
                          className="bg-gray-400 hover:bg-gray-500 text-white font-bold 
                                   py-3 px-8 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={handleSaveAnswers}
                        disabled={saving}
                        className="bg-selapp-brown hover:bg-selapp-brown/90 text-white font-bold 
                                 py-3 px-8 rounded-lg transition-colors disabled:opacity-50 
                                 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            💾 Guardar Respuestas
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mensaje motivacional */}
          {!session && (
            <div className="mt-8 p-6 bg-selapp-beige/30 dark:bg-selapp-brown/10 rounded-lg border border-selapp-brown/20">
              <p className="text-center text-gray-600 dark:text-gray-400">
                💡 <Link href="/api/auth/signin" className="text-selapp-brown dark:text-selapp-beige underline">
                  Inicia sesión
                </Link> para guardar tus reflexiones
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
