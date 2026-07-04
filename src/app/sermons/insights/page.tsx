"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FiBarChart2, FiBook, FiBookOpen, FiFileText, FiCloud } from "react-icons/fi";
import WordCloud, { CloudWord } from "@/components/WordCloud";

interface TopVerse {
  reference: string;
  usfm: string;
  count: number;
}

interface TopBook {
  book: string;
  code: string;
  count: number;
}

interface SermonOption {
  id: string;
  title: string;
  date: string;
}

interface Insights {
  scope: "global" | "sermon";
  totalSermons: number;
  totalNotes: number;
  words: CloudWord[];
  topVerses: TopVerse[];
  topBooks: TopBook[];
  sermons: SermonOption[];
}

export default function SermonInsightsPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [sermonOptions, setSermonOptions] = useState<SermonOption[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async (sermonId: string) => {
    setLoading(true);
    try {
      const url = sermonId
        ? `/api/sermons/insights?sermonId=${sermonId}`
        : "/api/sermons/insights";
      const res = await fetch(url);
      if (res.ok) {
        const data: Insights = await res.json();
        setInsights(data);
        // La lista de sermones solo viene en el scope global; conservarla
        if (data.sermons.length > 0) setSermonOptions(data.sermons);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights(selectedSermon);
  }, [selectedSermon, fetchInsights]);

  const maxBookCount = insights?.topBooks[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white pb-24">
      {/* Header sticky */}
      <div className="hidden sm:block bg-white/50 backdrop-blur-sm border-b border-selapp-brown/5 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Link href="/sermons" className="text-selapp-brown/60 hover:text-selapp-brown text-sm transition-colors">
            ← Sermones
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <Link
          href="/sermons"
          className="sm:hidden text-selapp-brown/60 hover:text-selapp-brown text-sm mb-4 inline-flex items-center gap-1 transition-colors"
        >
          ← Sermones
        </Link>

        {/* Título */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-selapp-brown-dark mb-1 flex items-center gap-3">
            <FiBarChart2 className="w-7 h-7 text-selapp-accent" />
            Estadísticas
          </h1>
          <p className="text-selapp-brown-light text-sm sm:text-base">
            Palabras y versículos más presentes en tus sermones
          </p>
        </div>

        {/* Filtro por sermón */}
        <div className="mb-6">
          <select
            value={selectedSermon}
            onChange={(e) => setSelectedSermon(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-selapp-brown/20 rounded-xl text-selapp-brown text-sm font-medium focus:outline-none focus:ring-2 focus:ring-selapp-brown/40"
            aria-label="Filtrar por sermón"
          >
            <option value="">Todos los sermones</option>
            {sermonOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {loading || !insights ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/70 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-72 bg-white/70 rounded-2xl animate-pulse" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-64 bg-white/70 rounded-2xl animate-pulse" />
              <div className="h-64 bg-white/70 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Tiles de resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatTile
                icon={<FiBookOpen className="w-4 h-4" />}
                label={insights.scope === "sermon" ? "Sermón" : "Sermones"}
                value={insights.totalSermons}
              />
              <StatTile
                icon={<FiFileText className="w-4 h-4" />}
                label="Notas"
                value={insights.totalNotes}
              />
              <StatTile
                icon={<FiBook className="w-4 h-4" />}
                label="Libros citados"
                value={insights.topBooks.length}
              />
              <StatTile
                icon={<FiBookOpen className="w-4 h-4" />}
                label="Versículos distintos"
                value={insights.topVerses.length}
              />
            </div>

            {/* Nube de palabras */}
            <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-5 sm:p-6 mb-4">
              <h2 className="text-sm font-semibold text-selapp-brown mb-4 flex items-center gap-2 uppercase tracking-wide">
                <FiCloud className="w-4 h-4 text-selapp-accent" /> Nube de palabras
              </h2>
              <WordCloud words={insights.words} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Versículos más mencionados */}
              <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-selapp-brown mb-4 uppercase tracking-wide">
                  📖 Versículos más mencionados
                </h2>
                {insights.topVerses.length === 0 ? (
                  <p className="text-selapp-brown-light/60 text-sm py-6 text-center">
                    No se detectaron referencias bíblicas en las notas.
                  </p>
                ) : (
                  <ol className="space-y-2">
                    {insights.topVerses.map((v, i) => (
                      <li key={v.usfm}>
                        <Link
                          href={`/versiculos?q=${encodeURIComponent(v.reference)}`}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-selapp-beige/60 transition-colors group"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-bold text-selapp-accent w-5 text-right shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm font-semibold text-selapp-brown truncate group-hover:underline">
                              {v.reference}
                            </span>
                          </span>
                          <span className="text-xs text-selapp-brown-light bg-selapp-beige px-2 py-0.5 rounded-full shrink-0">
                            {v.count}×
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Libros más citados */}
              <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-selapp-brown mb-4 uppercase tracking-wide">
                  📚 Libros más citados
                </h2>
                {insights.topBooks.length === 0 ? (
                  <p className="text-selapp-brown-light/60 text-sm py-6 text-center">
                    No se detectaron libros citados en las notas.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {insights.topBooks.map((b) => (
                      <li key={b.code} className="flex items-center gap-3">
                        <span className="w-28 text-sm text-selapp-brown truncate shrink-0" title={b.book}>
                          {b.book}
                        </span>
                        <span className="flex-1 h-3.5 bg-selapp-beige-dark/40 rounded-full overflow-hidden">
                          <span
                            className="block h-full bg-selapp-brown rounded-full transition-all"
                            style={{ width: `${Math.max(4, (b.count / maxBookCount) * 100)}%` }}
                          />
                        </span>
                        <span className="w-8 text-right text-xs font-semibold text-selapp-brown-light shrink-0">
                          {b.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-4">
      <div className="flex items-center gap-1.5 text-selapp-brown-light text-xs font-medium mb-1">
        <span className="text-selapp-accent">{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-bold text-selapp-brown">{value}</p>
    </div>
  );
}
