import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white">
      {/* Header con logo */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/selapp.png"
            alt="Selapp Logo"
            width={300}
            height={120}
            priority
            className="object-contain"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-selapp-brown">
            Devocionales y Notas de Predicación
          </h1>
          <p className="text-center text-selapp-brown-light text-lg mb-12 max-w-2xl mx-auto">
            Una forma elegante y moderna de organizar tus sermones y devocionales diarios
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Card de Sermones */}
            <Link href="/sermons" className="block">
              <div className="selapp-card p-8 group">
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
              <div className="selapp-card p-8 group">
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
          </div>
        </div>
      </div>
    </main>
  );
}
