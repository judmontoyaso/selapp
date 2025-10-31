"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
  const router = useRouter();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSermon, setNewSermon] = useState({
    title: "",
    pastor: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const res = await fetch("/api/sermons");
      const data = await res.json();
      
      // Verificar que data sea un array
      if (Array.isArray(data)) {
        setSermons(data);
      } else {
        console.error("Error: API no retornó un array:", data);
        setSermons([]);
      }
    } catch (error) {
      console.error("Error fetching sermons:", error);
      setSermons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSermon = async (sermonId: string, sermonTitle: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el sermón "${sermonTitle}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/sermons/${sermonId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Actualizar la lista de sermones
        setSermons(sermons.filter(sermon => sermon.id !== sermonId));
      } else {
        alert("Error al eliminar el sermón");
      }
    } catch (error) {
      console.error("Error deleting sermon:", error);
      alert("Error al eliminar el sermón");
    }
  };

  const handleCreateSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSermon),
      });

      if (res.ok) {
        const createdSermon = await res.json();
        setShowModal(false);
        setNewSermon({
          title: "",
          pastor: "",
          date: new Date().toISOString().split("T")[0],
        });
        // Redirigir al sermón recién creado en modo editar
        router.push(`/sermons/${createdSermon.id}?mode=chat`);
      }
    } catch (error) {
      console.error("Error creating sermon:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white">
      <div className="bg-white/80 backdrop-blur-sm border-b border-selapp-brown/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/selapp.png"
                alt="Selapp"
                width={120}
                height={48}
                className="object-contain"
              />
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="bg-selapp-brown hover:bg-selapp-brown-dark text-white px-6 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              + Nuevo Sermón
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-selapp-brown mb-2">
          📖 Mis Sermones
        </h1>
        <p className="text-selapp-brown-light mb-8">
          Organiza y gestiona tus predicaciones
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-selapp-brown border-t-transparent"></div>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-12 selapp-card">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-selapp-brown-light mb-4">
              Aún no tienes sermones
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-selapp-brown hover:bg-selapp-brown-dark text-white px-6 py-2 rounded-full transition-all duration-200"
            >
              Crear mi primer sermón
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.map((sermon) => (
              <div key={sermon.id} className="block relative group">
                <Link href={`/sermons/${sermon.id}`} className="block">
                  <div className="selapp-card p-6 group h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">📖</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-selapp-brown-light bg-selapp-beige px-3 py-1 rounded-full">
                          {sermon._count.messages} mensajes
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteSermon(sermon.id, sermon.title);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar sermón"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-selapp-brown mb-2 group-hover:text-selapp-brown-dark transition-colors">
                      {sermon.title}
                    </h3>
                    <p className="text-selapp-brown-light text-sm mb-2">
                      Pastor: {sermon.pastor}
                    </p>
                    <p className="text-selapp-brown-light text-xs">
                      {new Date(sermon.date).toLocaleDateString("es", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-selapp-brown mb-6">
              Nuevo Sermón
            </h2>
            <form onSubmit={handleCreateSermon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-selapp-brown mb-2">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={newSermon.title}
                  onChange={(e) =>
                    setNewSermon({ ...newSermon, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-selapp-brown/20 focus:border-selapp-brown focus:ring-2 focus:ring-selapp-brown/20 outline-none transition-all"
                  placeholder="Título del sermón"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-selapp-brown mb-2">
                  Pastor
                </label>
                <input
                  type="text"
                  required
                  value={newSermon.pastor}
                  onChange={(e) =>
                    setNewSermon({ ...newSermon, pastor: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-selapp-brown/20 focus:border-selapp-brown focus:ring-2 focus:ring-selapp-brown/20 outline-none transition-all"
                  placeholder="Nombre del pastor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-selapp-brown mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={newSermon.date}
                  onChange={(e) =>
                    setNewSermon({ ...newSermon, date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-selapp-brown/20 focus:border-selapp-brown focus:ring-2 focus:ring-selapp-brown/20 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-selapp-brown/20 text-selapp-brown hover:bg-selapp-beige transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-selapp-brown hover:bg-selapp-brown-dark text-white transition-all shadow-lg hover:shadow-xl"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
