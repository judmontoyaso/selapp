"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import AuthButtons from "@/components/AuthButtons";
import DailyReadingTracker from "@/components/DailyReadingTracker";
import VerseOfTheDay from "@/components/VerseOfTheDay";

export default function Home() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center">
        <div className="text-selapp-brown text-xl">Cargando...</div>
      </main>
    );
  }

  // Landing page para usuarios no autenticados
  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <Image
                src="/selapp.png"
                alt="Selapp Logo"
                width={300}
                height={120}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <AuthButtons />
            </div>
          </div>

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-selapp-brown">
              Tu Compañero Espiritual Digital
            </h1>
            <p className="text-xl md:text-2xl text-selapp-brown-light mb-8 max-w-3xl mx-auto">
              Organiza tus sermones, crece en tu lectura diaria de la Biblia, 
              y mantén un registro de tu caminar espiritual
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-selapp-accent text-white rounded-lg font-semibold text-lg hover:bg-selapp-accent-dark transition-colors shadow-lg"
              >
                Comenzar Ahora
              </Link>
              <Link 
                href="/auth/signin"
                className="px-8 py-4 bg-white text-selapp-brown rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-selapp-brown"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="selapp-card p-8 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Sermones Organizados
              </h3>
              <p className="text-selapp-brown-light">
                Guarda tus notas de predicación con una interfaz tipo chat. 
                Adjunta imágenes, organiza por temas y accede desde cualquier dispositivo.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="selapp-card p-8 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Lectura Diaria
              </h3>
              <p className="text-selapp-brown-light">
                Rastrea tu progreso de lectura bíblica diaria. Gana semillas, 
                sube de nivel y mantén rachas de días consecutivos leyendo.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="selapp-card p-8 text-center">
              <div className="text-6xl mb-4">🙏</div>
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Devocionales
              </h3>
              <p className="text-selapp-brown-light">
                Recibe devocionales diarios con versículos bíblicos y preguntas 
                de reflexión. Notificaciones push para no perderte ninguno.
              </p>
            </div>

            {/* Feature 4 - Buscar Versículos */}
            <div className="selapp-card p-8 text-center">
              <div className="text-6xl mb-4">🔎</div>
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Buscar Versículos
              </h3>
              <p className="text-selapp-brown-light">
                Busca referencias bíblicas rápidas y abre el versículo en la vista completa.
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-selapp-brown">
              ¿Por qué elegir Selapp?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <h4 className="font-semibold text-selapp-brown mb-2">100% en la Nube</h4>
                  <p className="text-selapp-brown-light">Accede a tus notas desde cualquier dispositivo</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <h4 className="font-semibold text-selapp-brown mb-2">Privado y Seguro</h4>
                  <p className="text-selapp-brown-light">Tus datos están protegidos y solo tú los ves</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <h4 className="font-semibold text-selapp-brown mb-2">Gamificación</h4>
                  <p className="text-selapp-brown-light">Sistema de niveles y recompensas por tu constancia</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <h4 className="font-semibold text-selapp-brown mb-2">Interfaz Intuitiva</h4>
                  <p className="text-selapp-brown-light">Diseño moderno y fácil de usar</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-selapp-brown">
              Comienza tu Jornada Hoy
            </h2>
            <p className="text-lg text-selapp-brown-light mb-8">
              Únete a una comunidad de personas comprometidas con su crecimiento espiritual
            </p>
            <Link 
              href="/auth/signup"
              className="inline-block px-10 py-5 bg-selapp-accent text-white rounded-lg font-semibold text-xl hover:bg-selapp-accent-dark transition-colors shadow-xl"
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
    <main className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white">
      {/* Header con logo y auth buttons */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1"></div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/selapp.png"
              alt="Selapp Logo"
              width={300}
              height={120}
              priority
              className="object-contain"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <AuthButtons />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Versículo del Día */}
          <VerseOfTheDay />

          {/* Componente de seguimiento de lectura diaria */}
          <DailyReadingTracker />

          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-selapp-brown">
            Bienvenido, {session.user?.email?.split('@')[0]}
          </h1>
          <p className="text-center text-selapp-brown-light text-lg mb-12 max-w-2xl mx-auto">
            ¿Qué deseas hacer hoy?
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Card de Sermones */}
            <Link href="/sermons" className="block">
              <div className="selapp-card p-8 group hover:shadow-xl transition-shadow">
                <div className="text-6xl mb-4 text-center">📖</div>
                <h2 className="text-2xl font-bold mb-3 text-selapp-brown text-center group-hover:text-selapp-brown-dark transition-colors">
                  Sermones
                </h2>
                <p className="text-selapp-brown-light text-center mb-4">
                  Organiza tus notas de predicación de forma visual y práctica
                </p>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                    <span className="text-selapp-accent text-lg">✓</span>
                    <span>Interfaz tipo chat</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                    <span className="text-selapp-accent text-lg">✓</span>
                    <span>Adjunta imágenes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                    <span className="text-selapp-accent text-lg">✓</span>
                    <span>Todo en la nube</span>
                  </div>
                </div>
              </div>
            </Link>
            {/* Card de Devocionales */}
            <Link href="/devotionals" className="block">
              <div className="selapp-card p-8 group hover:shadow-xl transition-shadow">
                <div className="text-6xl mb-4 text-center">🙏</div>
                <h2 className="text-2xl font-bold mb-3 text-selapp-brown text-center group-hover:text-selapp-brown-dark transition-colors">
                  Devocionales
                </h2>
                <p className="text-selapp-brown-light text-center mb-4">
                  Devocionales diarios con versículos y reflexiones
                </p>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                    <span className="text-selapp-accent text-lg">✓</span>
                    <span>Versículos diarios</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                    <span className="text-selapp-accent text-lg">✓</span>
                    <span>Preguntas de reflexión</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-selapp-brown-light">
                    <span className="text-selapp-accent text-lg">✓</span>
                    <span>Notificaciones push</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card de Buscar Versículos */}
            <Link href="/verse-search" className="block">
              <div className="selapp-card p-8 group hover:shadow-xl transition-shadow">
                <div className="text-6xl mb-4 text-center">🔎</div>
                <h2 className="text-2xl font-bold mb-3 text-selapp-brown text-center group-hover:text-selapp-brown-dark transition-colors">
                  Buscar Versículos
                </h2>
                <p className="text-selapp-brown-light text-center mb-4">
                  Busca referencias bíblicas y abre el versículo completo.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
