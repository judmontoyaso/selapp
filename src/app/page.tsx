"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";
import SermonCounter from "@/components/SermonCounter";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import Logo, { LogoMark } from "@/components/Logo";
import WordCloud from "@/components/WordCloud";
import {
  FiMessageSquare,
  FiSun,
  FiBookmark,
  FiBarChart2,
  FiBook,
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiCloud,
} from "react-icons/fi";

const FEATURES = [
  {
    icon: <FiMessageSquare className="w-6 h-6" />,
    title: "Notas de sermones",
    text: "Toma notas en vivo con una interfaz tipo chat, adjunta imágenes y compártelas con un link.",
  },
  {
    icon: <FiSun className="w-6 h-6" />,
    title: "Devocionales diarios",
    text: "Versículos y preguntas de reflexión cada día, con recordatorios push para no perder el ritmo.",
  },
  {
    icon: <FiBookmark className="w-6 h-6" />,
    title: "Versículos",
    text: "Busca cualquier referencia en NVI, NBLA, LBLA o RVA y guarda tus favoritos.",
  },
  {
    icon: <FiBarChart2 className="w-6 h-6" />,
    title: "Estadísticas",
    text: "Descubre los versículos, libros y temas más presentes en tus sermones con nubes de palabras.",
  },
];

const BENEFITS = [
  { title: "100% en la nube", text: "Tus notas te siguen a cualquier dispositivo" },
  { title: "Privado y seguro", text: "Solo tú ves tus datos; compartes solo lo que decides" },
  { title: "Funciona sin conexión", text: "Instálala como app y úsala donde estés" },
  { title: "Diseño cálido y limpio", text: "Pensada para concentrarte en lo importante" },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [words, setWords] = useState<any[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/sermons/insights")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data) => {
          setWords(data.words || []);
        })
        .catch(() => {
          // silent
        })
        .finally(() => {
          setWordsLoading(false);
        });
    }
  }, [session]);

  // Loading state
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LogoMark className="w-12 h-12 animate-pulse" />
          <p className="text-selapp-brown-light text-sm">Cargando…</p>
        </div>
      </main>
    );
  }

  // ─── Landing para usuarios no autenticados ───────────────────────────────
  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white">
        {/* Navbar */}
        <header className="container mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <Logo size={36} />
          <AuthButtons />
        </header>

        {/* Hero */}
        <section className="container mx-auto max-w-3xl px-4 pt-14 sm:pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 bg-white/70 border border-selapp-brown/10 text-selapp-brown text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span aria-hidden>🌱</span> Devocionales, sermones y versículos en un solo lugar
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-selapp-brown-dark leading-tight mb-6 text-balance">
            Cultiva tu vida espiritual,
            <br />
            <em className="text-selapp-brown not-italic border-b-4 border-selapp-accent/50">un día a la vez</em>
          </h1>
          <p className="text-lg sm:text-xl text-selapp-brown-light max-w-2xl mx-auto mb-9 leading-relaxed">
            Organiza tus notas de predicación, recibe devocionales diarios y
            guarda los versículos que marcan tu caminar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3.5 bg-selapp-brown text-white rounded-full font-semibold text-base hover:bg-selapp-brown-dark transition-all shadow-md hover:shadow-lg"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-3.5 bg-white text-selapp-brown rounded-full font-semibold text-base border border-selapp-brown/20 hover:border-selapp-brown/50 hover:bg-selapp-beige/60 transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto max-w-6xl px-4 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="selapp-card p-6">
                <div className="w-12 h-12 rounded-xl bg-selapp-beige flex items-center justify-center text-selapp-brown mb-4">
                  {f.icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-selapp-brown-dark mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-selapp-brown-light leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section className="container mx-auto max-w-4xl px-4 pb-20">
          <div className="bg-white rounded-3xl shadow-sm border border-selapp-brown/10 p-8 sm:p-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-center text-selapp-brown-dark mb-10">
              ¿Por qué Selapp?
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4 items-start">
                  <span className="w-7 h-7 rounded-full bg-selapp-accent/15 text-selapp-brown flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-selapp-brown mb-0.5">{b.title}</h4>
                    <p className="text-sm text-selapp-brown-light">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="container mx-auto max-w-4xl px-4 pb-20">
          <div className="bg-gradient-to-br from-selapp-brown to-selapp-brown-dark rounded-3xl px-8 py-12 sm:px-14 sm:py-16 text-center shadow-lg">
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-white mb-3">
              Comienza tu jornada hoy
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Toma la primera nota, guarda el primer versículo y deja que la
              disciplina haga el resto.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-10 py-3.5 bg-selapp-cream text-selapp-brown-dark rounded-full font-semibold hover:bg-white transition-colors shadow-md"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-selapp-brown/10">
          <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Logo size={26} />
            <p className="text-xs text-selapp-brown-light">
              Selapp — tu compañero espiritual digital
            </p>
          </div>
        </footer>
      </main>
    );
  }

  // ─── Dashboard para usuarios autenticados ────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const today = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const firstName =
    session.user?.name?.split(" ")[0] || session.user?.email?.split("@")[0] || "Usuario";

  const quickLinks = [
    {
      href: "/sermons",
      icon: <FiBookOpen className="w-5 h-5" />,
      title: "Sermones",
      text: "Tus notas de predicación",
    },
    {
      href: "/versiculos",
      icon: <FiBookmark className="w-5 h-5" />,
      title: "Versículos",
      text: "Busca y guarda favoritos",
    },
    {
      href: "/sermons/insights",
      icon: <FiBarChart2 className="w-5 h-5" />,
      title: "Estadísticas",
      text: "Nube de palabras y más citados",
    },
    {
      href: "/notes",
      icon: <FiBook className="w-5 h-5" />,
      title: "Diario",
      text: "Tu registro personal",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white pb-16">
      {/* Header */}
      <header className="container mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
        <Logo size={34} />
        {/* espacio superior derecho reservado para la campana y el menú */}
        <span className="w-24" aria-hidden />
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Saludo */}
        <div className="mb-10">
          <p className="text-sm text-selapp-brown-light capitalize mb-1">{today}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-selapp-brown-dark">
            {greeting}, {firstName}
          </h1>
        </div>

        {/* Grid principal */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            <VerseOfTheDay />
            <SermonCounter />

            {/* Nube de palabras de Prédicas */}
            <div className="bg-white rounded-2xl shadow-sm border border-selapp-brown/10 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-selapp-brown mb-4 flex items-center gap-2 uppercase tracking-wide">
                <FiCloud className="w-4 h-4 text-selapp-accent" /> Nube de palabras de tus sermones
              </h2>
              {wordsLoading ? (
                <div className="h-48 bg-selapp-beige/20 rounded-xl animate-pulse flex items-center justify-center text-xs text-selapp-brown-light">
                  Cargando palabras clave...
                </div>
              ) : (
                <WordCloud words={words} />
              )}
            </div>
          </div>

          {/* Columna derecha — accesos rápidos */}
          <div>
            <h2 className="text-sm font-semibold text-selapp-brown uppercase tracking-wide mb-4">
              Accesos rápidos
            </h2>
            <div className="space-y-3">
              {quickLinks.map((l) => (
                <Link key={l.href} href={l.href} className="block group">
                  <div className="selapp-card p-4 flex items-center gap-4 group-hover:border-selapp-accent/40">
                    <span className="w-11 h-11 rounded-xl bg-selapp-beige flex items-center justify-center text-selapp-brown shrink-0 group-hover:bg-selapp-accent/20 transition-colors">
                      {l.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-selapp-brown">{l.title}</span>
                      <span className="block text-xs text-selapp-brown-light truncate">{l.text}</span>
                    </span>
                    <FiChevronRight className="w-4 h-4 text-selapp-brown/30 group-hover:text-selapp-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
