"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiSearch, FiShuffle, FiHeart, FiTrash2, FiBookOpen } from "react-icons/fi";

interface VerseResult {
  reference: string;
  text: string;
  usfm: string;
  bible_id: number;
  tema?: string;
}

interface Favorito {
  id: string;
  referencia: string;
  usfm: string;
  bible_id: number;
  texto: string;
  tema?: string | null;
  creado_en: string;
}

export default function VersiculosPage() {
  const { data: session } = useSession();

  // Búsqueda
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<VerseResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Aleatorio
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [randomResult, setRandomResult] = useState<VerseResult | null>(null);

  // Favoritos
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null); // usfm being saved
  const [deletingId, setDeletingId] = useState<string | null>(null); // id being deleted

  const fetchFavoritos = useCallback(async () => {
    if (!session) return;
    setLoadingFavoritos(true);
    try {
      const res = await fetch("/api/versiculos/favoritos");
      if (res.ok) {
        const data = await res.json();
        setFavoritos(data.favoritos);
      }
    } catch {
      // silent
    } finally {
      setLoadingFavoritos(false);
    }
  }, [session]);

  useEffect(() => {
    fetchFavoritos();
  }, [fetchFavoritos]);

  const searchVerse = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/versiculos/buscar?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
      } else {
        setSearchError(data.error || "Versículo no encontrado");
      }
    } catch {
      setSearchError("Error de conexión");
    } finally {
      setSearching(false);
    }
  };

  const fetchRandom = async () => {
    setLoadingRandom(true);
    setRandomResult(null);
    try {
      const res = await fetch("/api/versiculos/aleatorio");
      const data = await res.json();
      if (res.ok) setRandomResult(data);
    } catch {
      // silent
    } finally {
      setLoadingRandom(false);
    }
  };

  const saveFavorito = async (verse: VerseResult) => {
    if (!session) return;
    setSavingId(verse.usfm);
    try {
      await fetch("/api/versiculos/favoritos", {
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
      await fetchFavoritos();
    } catch {
      // silent
    } finally {
      setSavingId(null);
    }
  };

  const deleteFavorito = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/versiculos/favoritos?id=${id}`, { method: "DELETE" });
      setFavoritos((prev) => prev.filter((f) => f.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const isFavorito = (usfm: string) => favoritos.some((f) => f.usfm === usfm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white pb-24">
      {/* Header sticky — igual que sermones */}
      <div className="hidden sm:block bg-white/50 backdrop-blur-sm border-b border-selapp-brown/5 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Link href="/" className="text-selapp-brown/60 hover:text-selapp-brown text-sm transition-colors">
            ← Inicio
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 mt-0 max-w-2xl">
        {/* Back link móvil */}
        <Link
          href="/"
          className="sm:hidden text-selapp-brown/60 hover:text-selapp-brown text-sm mb-4 inline-flex items-center gap-1 transition-colors"
        >
          ← Inicio
        </Link>

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-selapp-brown mb-1 flex items-center gap-3">
            <FiBookOpen className="w-7 h-7 text-selapp-accent" />
            Versículos
          </h1>
          <p className="text-selapp-brown-light text-sm sm:text-base">
            Nueva Versión Internacional · NVI 2022
          </p>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-5 sm:p-6 mb-4">
          <h2 className="text-sm font-semibold text-selapp-brown mb-3 flex items-center gap-2 uppercase tracking-wide">
            <FiSearch className="w-4 h-4 text-selapp-accent" /> Buscar por referencia
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchVerse()}
              placeholder="Juan 3:16, Salmos 23:1…"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-selapp-brown/40 focus:border-selapp-brown/30 transition text-base"
            />
            <button
              onClick={searchVerse}
              disabled={searching || !query.trim()}
              className="bg-selapp-brown hover:bg-selapp-brown/90 text-white font-semibold px-4 py-3 rounded-xl disabled:opacity-40 transition-colors shrink-0 flex items-center gap-2"
            >
              {searching ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <>
                  <FiSearch className="w-4 h-4" />
                  <span className="hidden sm:inline">Buscar</span>
                </>
              )}
            </button>
          </div>

          {searchError && <p className="text-red-500 text-sm mt-3">{searchError}</p>}

          {searchResult ? (
            <VerseCard
              verse={searchResult}
              isFavorito={isFavorito(searchResult.usfm)}
              saving={savingId === searchResult.usfm}
              onSave={session ? () => saveFavorito(searchResult) : undefined}
            />
          ) : !searchError ? (
            <p className="text-center text-selapp-brown-light/60 text-sm py-6">
              Escribe una referencia y pulsa Buscar o Enter
            </p>
          ) : null}
        </div>

        {/* Aleatorio */}
        <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-5 sm:p-6 mb-4">
          <h2 className="text-sm font-semibold text-selapp-brown mb-3 flex items-center gap-2 uppercase tracking-wide">
            <FiShuffle className="w-4 h-4 text-selapp-accent" /> Versículo aleatorio
          </h2>
          <button
            onClick={fetchRandom}
            disabled={loadingRandom}
            className="w-full bg-gradient-to-r from-selapp-brown to-selapp-accent text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-40 hover:shadow-md hover:-translate-y-0.5"
          >
            {loadingRandom ? "Cargando…" : "✨ Descubrir versículo"}
          </button>

          {randomResult ? (
            <VerseCard
              verse={randomResult}
              isFavorito={isFavorito(randomResult.usfm)}
              saving={savingId === randomResult.usfm}
              onSave={session ? () => saveFavorito(randomResult) : undefined}
            />
          ) : (
            <p className="text-center text-selapp-brown-light/60 text-sm py-5">
              Toca el botón para descubrir un versículo
            </p>
          )}
        </div>

        {/* Favoritos */}
        {session ? (
          <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-selapp-brown mb-4 flex items-center gap-2 uppercase tracking-wide">
              <FiHeart className="w-4 h-4 text-red-400" /> Mis favoritos
              {favoritos.length > 0 && (
                <span className="ml-auto text-xs text-selapp-brown-light font-normal normal-case">
                  {favoritos.length} versículo{favoritos.length !== 1 ? "s" : ""}
                </span>
              )}
            </h2>

            {loadingFavoritos ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-24 bg-selapp-beige/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : favoritos.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-selapp-beige rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBookOpen className="w-8 h-8 text-selapp-accent/40" />
                </div>
                <p className="text-selapp-brown-light text-sm">
                  Aún no tienes favoritos.<br />Busca un versículo y toca el corazón.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {favoritos.map((f) => (
                  <li
                    key={f.id}
                    className="selapp-card p-4 border-l-4 border-selapp-brown hover:shadow-md transition-all"
                  >
                    {f.tema && (
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 bg-selapp-accent/10 text-selapp-accent">
                        {f.tema}
                      </span>
                    )}
                    <p className="text-gray-800 leading-relaxed font-serif italic mb-3 text-base">
                      {f.texto}
                    </p>
                    <div className="flex items-center justify-between border-t border-selapp-brown/10 pt-2">
                      <p className="font-semibold text-selapp-brown text-sm">{f.referencia}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 bg-selapp-beige px-2 py-0.5 rounded-full border border-selapp-brown/10">NVI</span>
                        <button
                          onClick={() => deleteFavorito(f.id)}
                          disabled={deletingId === f.id}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40"
                          title="Eliminar de favoritos"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-8 text-center">
            <div className="w-16 h-16 bg-selapp-beige rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-7 h-7 text-selapp-accent/40" />
            </div>
            <p className="text-selapp-brown font-semibold mb-1">Guarda tus versículos</p>
            <p className="text-selapp-brown-light text-sm mb-5">
              Inicia sesión para guardar tus favoritos y acceder a ellos desde cualquier dispositivo.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block bg-selapp-brown text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-selapp-brown/90 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function VerseCard({
  verse,
  isFavorito,
  saving,
  onSave,
}: {
  verse: VerseResult;
  isFavorito: boolean;
  saving: boolean;
  onSave?: () => void;
}) {
  return (
    <div className="mt-4 bg-selapp-beige/60 rounded-xl border-l-4 border-selapp-brown p-4 sm:p-5">
      {verse.tema && (
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 bg-selapp-accent/10 text-selapp-accent">
          {verse.tema}
        </span>
      )}
      <p className="text-gray-800 text-base sm:text-lg leading-relaxed font-serif italic mb-4">
        {verse.text}
      </p>
      <div className="flex items-center justify-between border-t border-selapp-brown/10 pt-3">
        <p className="font-semibold text-selapp-brown text-sm">{verse.reference}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
            NVI
          </span>
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving || isFavorito}
              title={isFavorito ? "Ya en favoritos" : "Guardar en favoritos"}
              className={`transition-colors p-1.5 rounded-lg disabled:opacity-50 ${
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
    </div>
  );
}
