"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiBookOpen, FiFileText, FiTrash2, FiPlus } from "react-icons/fi";

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
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white pb-24">
      {/* Header flotante solo para logo en desktop, oculto en móvil ya que no aporta y choca */}
      <div className="hidden sm:block bg-white/50 backdrop-blur-sm border-b border-selapp-brown/5 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/selapp.png"
                alt="Selapp"
                width={100}
                height={40}
                className="object-contain w-[100px] h-[40px]"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mt-4 sm:mt-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-selapp-brown mb-2 flex items-center gap-3">
          <FiBookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-selapp-accent" />
          Mis Sermones
        </h1>
        <p className="text-selapp-brown-light mb-6 text-sm sm:text-base max-w-md">
          Organiza y gestiona tus notas dominicales y predicaciones.
        </p>

        <div className="mb-10 flex justify-start">
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-medium bg-gradient-to-r from-selapp-brown to-selapp-accent shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            {/* Brillo sutil de fondo */}
            <div className="absolute inset-0 w-full h-full bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <FiPlus className="w-5 h-5 relative z-10" />
            <span className="relative z-10 border-l border-white/20 pl-2">Crear Sermón</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-selapp-brown border-t-transparent"></div>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-16 selapp-card flex flex-col items-center max-w-lg mx-auto border-dashed border-2">
            <div className="w-20 h-20 bg-selapp-beige rounded-full flex items-center justify-center mb-6 shadow-sm">
              <FiFileText className="w-10 h-10 text-selapp-accent" />
            </div>
            <h3 className="text-xl font-bold text-selapp-brown mb-2">Aún no tienes notas</h3>
            <p className="text-selapp-brown-light mb-8 text-base">
              Comienza a guardar tus predicaciones usando nuestro formato estilo chat.
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
                  <div className="selapp-card p-6 group h-full hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-transparent hover:border-selapp-accent">
                    <div className="flex items-start justify-between mb-4">
                      {/* Icono con fondo circular que da "vida" */}
                      <div className="flex-shrink-0 w-12 h-12 bg-selapp-beige group-hover:bg-selapp-accent/10 rounded-full flex items-center justify-center transition-colors">
                        <FiBookOpen className="w-6 h-6 text-selapp-accent" />
                      </div>
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
                          className="text-red-500/70 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar sermón"
                        >
                          <FiTrash2 className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-selapp-brown">
                Nuevo Sermón
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="sm:hidden text-gray-400 hover:text-gray-600 p-2"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSermon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-selapp-brown mb-1 sm:mb-2">
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
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-selapp-brown mb-1 sm:mb-2">
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
                <label className="block text-sm font-medium text-selapp-brown mb-1 sm:mb-2">
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
              <div className="flex gap-3 pt-6 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="hidden sm:block flex-1 px-6 py-3 rounded-xl border border-selapp-brown/20 text-selapp-brown hover:bg-selapp-beige transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-selapp-brown hover:bg-selapp-brown-dark text-white transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Crear Sermón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
