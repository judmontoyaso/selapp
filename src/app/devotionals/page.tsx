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

export default function DevotionalsPage() {
  const [devotional, setDevotional] = useState<DevotionalData | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayDevotional();
  }, []);

  const fetchTodayDevotional = async () => {
    try {
      const response = await fetch("/api/devotionals/today");
      const data = await response.json();
      
      if (data?.devotional) {
        setDevotional(data.devotional);
        setAnswers(data.answers || new Array(data.devotional.questions.length).fill(""));
      }
    } catch (error) {
      console.error("Error fetching devotional:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      await fetch("/api/devotionals/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-id-placeholder", // TODO: usar usuario autenticado
          answers,
        }),
      });
      
      alert("¡Devocional completado!");
      fetchTodayDevotional();
    } catch (error) {
      console.error("Error submitting devotional:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Cargando...</div>
      </div>
    );
  }

  if (!devotional) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📖</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              No hay devocional para hoy
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Vuelve mañana para tu devocional diario
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
            {devotional.topic}
          </div>
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            {devotional.title}
          </h1>

          <div className="space-y-4 mb-6">
            {devotional.verses.map((v, index) => (
              <div key={index} className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200 italic mb-2">
                  "{v.verse.text}"
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                  {v.verse.reference}
                </p>
              </div>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {devotional.content}
            </p>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Preguntas de Reflexión
            </h2>
            <div className="space-y-4">
              {devotional.questions.map((question, index) => (
                <div key={index}>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {index + 1}. {question}
                  </label>
                  <textarea
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Escribe tu respuesta..."
                    disabled={!!devotional.completedAt}
                  />
                </div>
              ))}
            </div>

            {!devotional.completedAt && (
              <button
                onClick={handleSubmit}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Completar Devocional
              </button>
            )}

            {devotional.completedAt && (
              <div className="mt-6 bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                ✅ Devocional completado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
