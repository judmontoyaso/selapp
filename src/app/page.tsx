import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4 text-blue-600 dark:text-blue-400">
            📝 Notas de Predicación
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Guarda tus notas de sermones como mensajes de chat
          </p>

          <div className="grid md:grid-cols-1 gap-6">
            <Link href="/sermons" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-6xl mb-4 text-center">�</div>
                <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white text-center">
                  Ver Sermones
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Organiza tus notas por sermón, con título, pastor y mensajes
                </p>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Mensajes organizados por sermón</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Adjuntar imágenes a tus notas</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Interfaz tipo WhatsApp/Telegram</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Todo guardado en la nube</span>
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
