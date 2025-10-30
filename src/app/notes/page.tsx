"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Note {
  id: string;
  title?: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes?userId=user-id-placeholder"); // TODO: usar usuario autenticado
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-id-placeholder", // TODO: usar usuario autenticado
          title: newTitle || undefined,
          content: newNote,
          category: "sermon",
          tags: [],
        }),
      });

      if (response.ok) {
        setNewNote("");
        setNewTitle("");
        fetchNotes();
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            Notas de Predicación
          </h1>

          <form onSubmit={handleSubmit} className="mb-6">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título (opcional)"
              className="w-full p-3 mb-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              className="w-full p-3 mb-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
              rows={5}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Guardar Nota
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">
              Cargando notas...
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600 dark:text-gray-300">
                No tienes notas guardadas aún
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {note.title && (
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                    {note.title}
                  </h3>
                )}
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-3">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatDate(note.createdAt)}</span>
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                    {note.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
