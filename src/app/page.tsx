"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import AuthButtons from "@/components/AuthButtons";
import DailyReadingTracker from "@/components/DailyReadingTracker";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import { BookOpen, Heart, Search, Book, Leaf, ArrowRight, Shield, Cloud, Award, Layout } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-selapp-beige flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Image
            src="/selapp.png"
            alt="Selapp Logo"
            width={150}
            height={60}
            className="opacity-50 grayscale"
          />
          <div className="text-selapp-brown-light font-serif italic">Cargando tu espacio...</div>
        </div>
      </main>
    );
  }

  // Landing page para usuarios no autenticados
  if (!session) {
    return (
      <main className="min-h-screen bg-selapp-beige selection:bg-selapp-accent/30">
        {/* Header */}
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-12">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <Image
                src="/selapp.png"
                alt="Selapp Logo"
                width={280}
                height={100}
                priority
                className="object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <AuthButtons />
            </div>
          </div>

          {/* Hero Section */}
          <div className="max-w-5xl mx-auto text-center mb-24 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-selapp-accent/10 rounded-full blur-3xl -z-10"></div>

            <h1 className="text-6xl md:text-7xl font-serif font-bold mb-8 text-selapp-brown leading-tight">
              Tu Santuario <br />
              <span className="text-selapp-accent italic">Espiritual Digital</span>
            </h1>
            <p className="text-xl md:text-2xl text-selapp-brown-light mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Un espacio diseñado para la paz, la reflexión y el crecimiento.
              Organiza tus sermones, profundiza en la Palabra y cultiva tu vida espiritual.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/auth/signup"
                className="px-10 py-4 bg-selapp-brown text-white rounded-full font-medium text-lg hover:bg-selapp-brown-dark transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group"
              >
                Comenzar Ahora
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/signin"
                className="px-10 py-4 bg-white text-selapp-brown rounded-full font-medium text-lg hover:bg-selapp-beige transition-all shadow-md hover:shadow-lg border border-selapp-beige-dark/50"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 px-4">
            {/* Feature 1 */}
            <div className="selapp-card p-8 text-center group hover:bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-selapp-beige rounded-2xl flex items-center justify-center mx-auto mb-6 text-selapp-brown group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <BookOpen size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-selapp-brown">
                Sermones Organizados
              </h3>
              <p className="text-selapp-brown-light text-sm leading-relaxed">
                Guarda tus notas de predicación con una interfaz limpia.
                Adjunta imágenes y organiza por temas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="selapp-card p-8 text-center group hover:bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-selapp-beige rounded-2xl flex items-center justify-center mx-auto mb-6 text-selapp-brown group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Leaf size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-selapp-brown">
                Crecimiento Diario
              </h3>
              <p className="text-selapp-brown-light text-sm leading-relaxed">
                Rastrea tu lectura bíblica. Gana semillas de fe y
                mantén tu jardín espiritual floreciendo.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="selapp-card p-8 text-center group hover:bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-selapp-beige rounded-2xl flex items-center justify-center mx-auto mb-6 text-selapp-brown group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Heart size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-selapp-brown">
                Devocionales
              </h3>
              <p className="text-selapp-brown-light text-sm leading-relaxed">
                Recibe alimento espiritual diario con versículos y
                preguntas para la reflexión profunda.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="selapp-card p-8 text-center group hover:bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-selapp-beige rounded-2xl flex items-center justify-center mx-auto mb-6 text-selapp-brown group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Search size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-selapp-brown">
                Búsqueda Rápida
              </h3>
              <p className="text-selapp-brown-light text-sm leading-relaxed">
                Encuentra versículos y referencias bíblicas al instante
                para tus estudios o momentos de necesidad.
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-xl p-12 md:p-16 mb-24 border border-selapp-beige-dark/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-selapp-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-16 text-selapp-brown">
              ¿Por qué elegir Selapp?
            </h2>
            <div className="grid md:grid-cols-2 gap-12 relative z-10">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-selapp-brown text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Cloud size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-selapp-brown mb-2">100% en la Nube</h4>
                  <p className="text-selapp-brown-light leading-relaxed">Accede a tus notas y progreso desde cualquier dispositivo, en cualquier momento.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-selapp-brown text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-selapp-brown mb-2">Privado y Seguro</h4>
                  <p className="text-selapp-brown-light leading-relaxed">Tu espacio personal es sagrado. Tus datos están protegidos y son solo para tus ojos.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-selapp-brown text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-selapp-brown mb-2">Gamificación Espiritual</h4>
                  <p className="text-selapp-brown-light leading-relaxed">Un sistema suave de niveles y semillas que motiva tu constancia sin generar estrés.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-selapp-brown text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Layout size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-selapp-brown mb-2">Diseño Santuario</h4>
                  <p className="text-selapp-brown-light leading-relaxed">Una interfaz libre de distracciones, diseñada para fomentar la paz y la concentración.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="max-w-3xl mx-auto text-center pb-24">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-selapp-brown">
              Comienza tu Jornada Hoy
            </h2>
            <p className="text-xl text-selapp-brown-light mb-10 font-light">
              Únete a una comunidad de personas comprometidas con su crecimiento espiritual.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-12 py-5 bg-selapp-accent text-white rounded-full font-medium text-xl hover:bg-selapp-accent-dark transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard para usuarios autenticados
  return (
    <main className="min-h-screen bg-selapp-beige selection:bg-selapp-accent/30 pb-12">
      {/* Header minimalista */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex-1 pl-16 lg:pl-0"></div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/selapp.png"
              alt="Selapp Logo"
              width={200}
              height={80}
              priority
              className="object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">

        {/* Saludo personalizado */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/50 blur-3xl rounded-full -z-10"></div>
          <h1 className="text-4xl md:text-5xl font-serif text-selapp-brown mb-3 tracking-tight">
            Bienvenido, <span className="font-bold italic text-selapp-brown-dark">
              {session.user?.name || session.user?.email?.split('@')[0] || "Usuario"}
            </span>
          </h1>
          <p className="text-selapp-brown-light text-lg font-light">
            Que la paz de Dios guarde tu corazón y tus pensamientos hoy.
          </p>
        </div>

        {/* Grid principal - 2 columnas en desktop */}
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Columna izquierda - Contenido Principal (8 columnas) */}
          <div className="lg:col-span-8 space-y-8">
            <VerseOfTheDay />

            {/* Tracker de lectura diaria */}
            <DailyReadingTracker />
          </div>

          {/* Columna derecha - Acciones rápidas (4 columnas) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 mb-2 px-2">
              <div className="h-px bg-selapp-brown/20 flex-1"></div>
              <h2 className="text-sm font-bold text-selapp-brown uppercase tracking-widest">
                Acciones Rápidas
              </h2>
              <div className="h-px bg-selapp-brown/20 flex-1"></div>
            </div>

            {/* Card de Sermones */}
            <Link href="/sermons" className="block group">
              <div className="selapp-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 border-l-[6px] border-l-transparent hover:border-l-selapp-brown relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={64} />
                </div>
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-12 h-12 bg-selapp-brown/10 text-selapp-brown rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-selapp-brown group-hover:text-white transition-colors">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-selapp-brown mb-1 font-serif">
                      Sermones
                    </h3>
                    <p className="text-sm text-selapp-brown-light mb-3">
                      Notas de predicación y estudios
                    </p>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-selapp-beige-dark/50 px-2 py-1 rounded-full text-selapp-brown-dark font-medium">Chat Interface</span>
                      <span className="text-[10px] bg-selapp-beige-dark/50 px-2 py-1 rounded-full text-selapp-brown-dark font-medium">Imágenes</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card de Devocionales */}
            <Link href="/devotionals" className="block group">
              <div className="selapp-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 border-l-[6px] border-l-transparent hover:border-l-selapp-accent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Heart size={64} />
                </div>
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-12 h-12 bg-selapp-accent/10 text-selapp-accent rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-selapp-accent group-hover:text-white transition-colors">
                    <Heart size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-selapp-brown mb-1 font-serif">
                      Devocionales
                    </h3>
                    <p className="text-sm text-selapp-brown-light mb-3">
                      Reflexiones diarias y oración
                    </p>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-selapp-beige-dark/50 px-2 py-1 rounded-full text-selapp-brown-dark font-medium">Diario</span>
                      <span className="text-[10px] bg-selapp-beige-dark/50 px-2 py-1 rounded-full text-selapp-brown-dark font-medium">Reflexión</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card de Buscar Versículos */}
            <Link href="/verse-search" className="block group">
              <div className="selapp-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 border-l-[6px] border-l-transparent hover:border-l-selapp-brown-light relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Search size={64} />
                </div>
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-12 h-12 bg-selapp-brown-light/10 text-selapp-brown-light rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-selapp-brown-light group-hover:text-white transition-colors">
                    <Search size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-selapp-brown mb-1 font-serif">
                      Buscar Versículos
                    </h3>
                    <p className="text-sm text-selapp-brown-light">
                      Referencias bíblicas rápidas
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
