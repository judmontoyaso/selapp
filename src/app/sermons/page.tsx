"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Sermon {
  id: string;
  title: string;
  pastor: string;
  date: string;
  _count: {
    messages: number;
  };
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSermon, setNewSermon] = useState({
    title: "",
    pastor: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const response = await fetch("/api/sermons");
      const data = await response.json();
      // Asegurarse de que data sea un array
      setSermons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sermons:", error);
      setSermons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSermon = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSermon),
      });

      if (response.ok) {
        setShowModal(false);
        setNewSermon({ title: "", pastor: "", date: new Date().toISOString().split('T')[0] });
        fetchSermons();
      }
    } catch (error) {
      console.error("Error creating sermon:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Inicio
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              📚 Mis Sermones
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              + Nuevo Sermón
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-300 py-12">
            Cargando sermones...
          </div>
        ) : sermons.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              No hay sermones aún
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Crea tu primer sermón para comenzar a tomar notas
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Crear Primer Sermón
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sermons.map((sermon) => (
              <Link key={sermon.id} href={`/sermons/${sermon.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">📝</div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {sermon._count.messages} mensajes
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                    {sermon.title}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    Pastor: {sermon.pastor}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(sermon.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Modal para crear sermón */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Nuevo Sermón
              </h2>
              <form onSubmit={handleCreateSermon}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Título del Sermón
                  </label>
                  <input
                    type="text"
                    value={newSermon.title}
                    onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                    className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                    placeholder="Ej: El amor de Dios"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Pastor
                  </label>
                  <input
                    type="text"
                    value={newSermon.pastor}
                    onChange={(e) => setNewSermon({ ...newSermon, pastor: e.target.value })}
                    className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                    placeholder="Nombre del pastor"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newSermon.date}
                    onChange={(e) => setNewSermon({ ...newSermon, date: e.target.value })}
                    className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
