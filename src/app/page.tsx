"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import AuthButtons from "@/components/AuthButtons";
import SermonCounter from "@/components/SermonCounter";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import { FiBookOpen, FiActivity, FiBookmark } from "react-icons/fi";

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
            <div className="selapp-card p-8 text-center flex flex-col items-center">
              <FiBookOpen className="w-16 h-16 mb-4 text-selapp-accent" />
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Sermones Organizados
              </h3>
              <p className="text-selapp-brown-light">
                Guarda tus notas de predicación con una interfaz tipo chat.
                Adjunta imágenes, organiza por temas y accede desde cualquier dispositivo.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="selapp-card p-8 text-center flex flex-col items-center">
              <FiActivity className="w-16 h-16 mb-4 text-selapp-accent" />
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Lectura Diaria
              </h3>
              <p className="text-selapp-brown-light">
                Rastrea tu progreso de lectura bíblica diaria. Gana semillas,
                sube de nivel y mantén rachas de días consecutivos leyendo.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="selapp-card p-8 text-center flex flex-col items-center">
              <FiBookmark className="w-16 h-16 mb-4 text-selapp-accent" />
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Devocionales
              </h3>
              <p className="text-selapp-brown-light">
                Recibe devocionales diarios con versículos bíblicos y preguntas
                de reflexión. Notificaciones push para no perderte ninguno.
              </p>
            </div>

            {/* Feature 4 - Versículos */}
            <div className="selapp-card p-8 text-center flex flex-col items-center">
              <FiBookmark className="w-16 h-16 mb-4 text-selapp-accent" />
              <h3 className="text-2xl font-bold mb-3 text-selapp-brown">
                Versículos
              </h3>
              <p className="text-selapp-brown-light">
                Busca referencias bíblicas en NVI y guarda tus versículos favoritos para tenerlos siempre a mano.
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
                  <h4 className="font-semibold text-selapp-brown mb-2">Comunidad Segura</h4>
                  <p className="text-selapp-brown-light">Tu crecimiento espiritual apoyado por herramientas sólidas.</p>
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
      {/* Header minimalista */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex-1 pl-16 lg:pl-0"></div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/selapp.png"
              alt="Selapp Logo"
              width={240}
              height={96}
              priority
              className="object-contain opacity-90"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Saludo personalizado - más sutil */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-light text-selapp-brown mb-2">
            Bienvenido, <span className="font-semibold">
              {session.user?.name || session.user?.email?.split('@')[0] || "Usuario"}
            </span>
          </h1>
          <p className="text-selapp-brown-light/80 text-base">
            Continúa tu caminar espiritual
          </p>
        </div>

        {/* Grid principal - 2 columnas en desktop */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Columna izquierda - Versículo del Día y Contador de Sermones */}
          <div className="lg:col-span-2 space-y-8">
            <VerseOfTheDay />

            {/* Contador de sermones guardados */}
            <SermonCounter />
          </div>

          {/* Columna derecha - Acciones rápidas */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-selapp-brown mb-4 text-center lg:text-left">
              Acciones Rápidas
            </h2>

            {/* Card de Sermones - Compacto */}
            <Link href="/sermons" className="block">
              <div className="selapp-card p-6 group hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-transparent hover:border-selapp-accent">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiBookOpen className="w-8 h-8 text-selapp-brown/50 group-hover:text-selapp-accent transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-selapp-brown mb-1 group-hover:text-selapp-brown-dark transition-colors">
                      Sermones
                    </h3>
                    <p className="text-sm text-selapp-brown-light/80 mb-3">
                      Notas de predicación
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-selapp-brown-light/70">
                        <span className="text-selapp-accent">•</span>
                        <span>Interfaz tipo chat</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-selapp-brown-light/70">
                        <span className="text-selapp-accent">•</span>
                        <span>Con imágenes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card de Versículos - Compacto */}
            <Link href="/versiculos" className="block">
              <div className="selapp-card p-6 group hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-transparent hover:border-selapp-accent">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiBookmark className="w-8 h-8 text-selapp-brown/50 group-hover:text-selapp-accent transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-selapp-brown mb-1 group-hover:text-selapp-brown-dark transition-colors">
                      Versículos
                    </h3>
                    <p className="text-sm text-selapp-brown-light/80 mb-3">
                      Busca y guarda tus favoritos
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-selapp-brown-light/70">
                        <span className="text-selapp-accent">•</span>
                        <span>Búsqueda por referencia</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-selapp-brown-light/70">
                        <span className="text-selapp-accent">•</span>
                        <span>Favoritos personales</span>
                      </div>
                    </div>
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
