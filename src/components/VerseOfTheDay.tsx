"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiHeart } from "react-icons/fi";

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
  usfm?: string;
  bible_id?: number;
}

export default function VerseOfTheDay() {
  const { data: session } = useSession();
  const [verse, setVerse] = useState<VerseOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingFav, setSavingFav] = useState(false);
  const [isFavorito, setIsFavorito] = useState(false);

  useEffect(() => {
    fetchVerseOfDay();
  }, []);

  // Check if current verse is already saved as favorite
  useEffect(() => {
    if (!session || !verse?.usfm) return;
    fetch("/api/versiculos/favoritos")
      .then((r) => r.json())
      .then((data) => {
        if (data.favoritos?.some((f: { usfm: string }) => f.usfm === verse.usfm)) {
          setIsFavorito(true);
        }
      })
      .catch(() => {});
  }, [session, verse?.usfm]);

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

  const saveFavorito = async () => {
    if (!verse?.usfm) return;
    setSavingFav(true);
    try {
      const res = await fetch("/api/versiculos/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referencia: verse.reference,
          usfm: verse.usfm,
          bible_id: verse.bible_id,
          texto: verse.text,
          tema: verse.tema,
        }),
      });
      if (res.ok) setIsFavorito(true);
    } catch (error) {
      console.error("Error saving favorite:", error);
    } finally {
      setSavingFav(false);
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

      {/* Texto del versículo */}
      <div className="text-gray-800 text-xl md:text-2xl mb-6 leading-relaxed text-center font-serif px-4">
        {verse.text}
      </div>

      {/* Footer minimalista */}
      <div className="flex items-center justify-between pt-4 border-t border-selapp-brown/10">
        <div className="flex items-center gap-2">
          <p className="text-selapp-brown font-semibold text-base">{verse.reference}</p>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">NVI</span>
        </div>
        {session && verse.usfm && (
          <button
            onClick={saveFavorito}
            disabled={savingFav || isFavorito}
            title={isFavorito ? "Guardado en favoritos" : "Guardar en favoritos"}
            className={`p-1.5 rounded-full transition-colors ${
              isFavorito
                ? "text-red-400 cursor-default"
                : "text-gray-400 hover:text-red-400 hover:bg-red-50"
            }`}
          >
            <FiHeart className={`w-5 h-5 ${isFavorito ? "fill-red-400" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}
