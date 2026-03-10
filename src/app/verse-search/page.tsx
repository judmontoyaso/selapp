"use client";

import { useState } from "react";
import Link from "next/link";

interface VerseResult {
  reference: string;
  text: string;
  tema?: string;
}

export default function VerseSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<VerseResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [loadingRandom, setLoadingRandom] = useState(false);
  const [randomResult, setRandomResult] = useState<VerseResult | null>(null);

  const searchVerse = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/devotionals/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
      } else {
        setSearchError(data.error || "VersÃ­culo no encontrado");
      }
    } catch {
      setSearchError("Error de conexiÃ³n");
    } finally {
      setLoading(false);
    }
  };

  const fetchRandom = async () => {
    setLoadingRandom(true);
    setRandomResult(null);
    try {
      const res = await fetch("/api/devotionals/random");
      const data = await res.json();
      if (res.ok) setRandomResult(data);
    } catch {
      // silent
    } finally {
      setLoadingRandom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-selapp-beige to-white p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <Link href="/" className="text-selapp-brown/70 hover:text-selapp-brown text-sm mb-8 inline-flex items-center gap-1 transition-colors">
          â† Inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-selapp-brown mb-1">
            VersÃ­culos
          </h1>
          <span className="inline-block text-xs font-medium px-3 py-1 bg-selapp-brown/10 text-selapp-brown rounded-full">
            Nueva VersiÃ³n Internacional Â· NVI 2022
          </span>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-6 mb-5">
          <h2 className="text-base font-semibold text-selapp-brown mb-3 flex items-center gap-2">
            ðŸ” Buscar por referencia
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchVerse()}
              placeholder="Juan 3:16, Salmos 23:1, Filipenses 4:13â€¦"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-selapp-brown/40 focus:border-selapp-brown/30 transition"
            />
            <button
              onClick={searchVerse}
              disabled={loading || !query.trim()}
              className="bg-selapp-brown hover:bg-selapp-brown/90 text-white font-semibold px-5 py-3 rounded-xl disabled:opacity-40 transition-colors min-w-[80px]"
            >
              {loading ? <span className="inline-block animate-spin">â³</span> : "Buscar"}
            </button>
          </div>

          {searchError && (
            <p className="text-red-500 text-sm mt-3">{searchError}</p>
          )}

          {searchResult ? (
            <VerseCard verse={searchResult} color="brown" />
          ) : !searchError && (
            <p className="text-center text-gray-400 text-sm py-8">
              Escribe una referencia y pulsa Enter o Buscar
            </p>
          )}
        </div>

        {/* Random card */}
        <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-6">
          <h2 className="text-base font-semibold text-selapp-brown mb-3 flex items-center gap-2">
            ðŸŽ² VersÃ­culo aleatorio
          </h2>

          <button
            onClick={fetchRandom}
            disabled={loadingRandom}
            className="w-full bg-selapp-accent hover:bg-selapp-accent-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 mb-1"
          >
            {loadingRandom ? "Cargandoâ€¦" : "Descubrir versÃ­culo"}
          </button>

          {randomResult ? (
            <VerseCard verse={randomResult} color="accent" />
          ) : (
            <p className="text-center text-gray-400 text-sm py-6">
              Pulsa el botÃ³n para descubrir un versÃ­culo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VerseCard({
  verse,
  color,
}: {
  verse: VerseResult;
  color: "brown" | "accent";
}) {
  const border = color === "brown" ? "border-selapp-brown" : "border-selapp-accent";
  const badge = color === "brown" ? "bg-selapp-brown/10 text-selapp-brown" : "bg-selapp-accent/10 text-selapp-accent";

  return (
    <div className={`mt-4 bg-selapp-beige/50 rounded-xl border-l-4 ${border} p-5`}>
      {verse.tema && (
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${badge}`}>
          {verse.tema}
        </span>
      )}
      <p className="text-gray-800 text-lg leading-relaxed font-serif italic mb-4">
        {verse.text}
      </p>
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <p className="font-semibold text-selapp-brown text-sm">{verse.reference}</p>
        <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
          NVI
        </span>
      </div>
    </div>
  );
}

