"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DiaryEntry {
  id: string;
  date: string;
  gratitude?: string;
  thoughts?: string;
  mood?: string;
  moodScore?: number;
  achievements?: string;
  freeNote?: string;
}

const moodEmojis = [
  { emoji: "😢", label: "Muy triste", score: 1 },
  { emoji: "😔", label: "Triste", score: 2 },
  { emoji: "😐", label: "Normal", score: 3 },
  { emoji: "😊", label: "Feliz", score: 4 },
  { emoji: "😄", label: "Muy feliz", score: 5 },
];

const thoughtTypes = [
  { type: 'gratitude' as const, icon: '🙏', label: 'Agradecer', placeholder: 'Hoy agradezco por...' },
  { type: 'mood' as const, icon: '💭', label: 'Cómo me siento', placeholder: '' },
  { type: 'thoughts' as const, icon: '💡', label: 'Qué pienso', placeholder: 'He estado pensando en...' },
  { type: 'achievements' as const, icon: '🎯', label: 'Qué logré', placeholder: 'Hoy aprendí / logré...' },
  { type: 'freeNote' as const, icon: '📝', label: 'Nota libre', placeholder: 'Escribe lo que quieras...' },
];

export default function DiaryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; score: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadTodayEntry();
    }
  }, [session]);

  const loadTodayEntry = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/diary?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        setTodayEntry(data || null);
      }
    } catch (error) {
      console.error("Error loading diary entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveThought = async () => {
    if (!activeSection) return;
    
    const today = new Date().toISOString().split("T")[0];
    
    let payload: any = {
      date: today,
    };

    if (activeSection === 'mood') {
      if (!selectedMood) {
        alert("⚠️ Por favor selecciona un estado de ánimo");
        return;
      }
      payload.mood = selectedMood.emoji;
      payload.moodScore = selectedMood.score;
    } else {
      if (!inputValue.trim()) {
        alert("⚠️ Por favor escribe algo");
        return;
      }
      payload[activeSection] = inputValue.trim();
    }

    if (todayEntry) {
      payload = {
        ...todayEntry,
        ...payload,
      };
    }

    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        setTodayEntry(savedEntry);
        setInputValue("");
        setSelectedMood(null);
        setActiveSection(null);
        alert("✅ Guardado exitosamente");
      } else {
        alert("❌ Error al guardar");
      }
    } catch (error) {
      console.error("Error saving thought:", error);
      alert("❌ Error al guardar");
    }
  };

  const openSection = (type: string) => {
    setActiveSection(type);
    setInputValue("");
    setSelectedMood(null);
  };

  const closeSection = () => {
    setActiveSection(null);
    setInputValue("");
    setSelectedMood(null);
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center">
        <div className="text-selapp-brown text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-selapp-brown hover:underline mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-selapp-brown mb-2">📖 Mi Diario Espiritual</h1>
          <p className="text-selapp-brown-light">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-2xl animate-spin inline-block">⏳</span>
            <p className="text-selapp-brown-light mt-4">Cargando...</p>
          </div>
        ) : (
          <>
            {todayEntry && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
                <h2 className="text-xl font-bold text-selapp-brown mb-4">📋 Registrado hoy</h2>
                
                {todayEntry.gratitude && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 font-semibold">🙏 Agradecimiento</p>
                    <p className="text-selapp-brown">{todayEntry.gratitude}</p>
                  </div>
                )}
                
                {todayEntry.mood && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 font-semibold">💭 Estado de ánimo</p>
                    <p className="text-3xl">{todayEntry.mood}</p>
                  </div>
                )}
                
                {todayEntry.thoughts && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 font-semibold">💡 Pensamientos</p>
                    <p className="text-selapp-brown">{todayEntry.thoughts}</p>
                  </div>
                )}
                
                {todayEntry.achievements && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 font-semibold">🎯 Logros</p>
                    <p className="text-selapp-brown">{todayEntry.achievements}</p>
                  </div>
                )}
                
                {todayEntry.freeNote && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 font-semibold">📝 Nota libre</p>
                    <p className="text-selapp-brown">{todayEntry.freeNote}</p>
                  </div>
                )}
              </div>
            )}

            {!activeSection && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-selapp-brown mb-4">¿Qué quieres registrar?</h2>
                {thoughtTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => openSection(type.type)}
                    className="w-full bg-white hover:bg-selapp-beige/30 rounded-xl shadow-sm p-6 transition-all text-left flex items-center gap-4"
                  >
                    <span className="text-4xl">{type.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-selapp-brown">{type.label}</h3>
                      <p className="text-sm text-selapp-brown/60">{type.placeholder}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeSection && (
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-selapp-brown">
                    {thoughtTypes.find(t => t.type === activeSection)?.icon}{' '}
                    {thoughtTypes.find(t => t.type === activeSection)?.label}
                  </h2>
                  <button
                    onClick={closeSection}
                    className="text-selapp-brown/60 hover:text-selapp-brown text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {activeSection === 'mood' ? (
                  <div className="flex gap-4 justify-center flex-wrap py-4">
                    {moodEmojis.map((m) => (
                      <button
                        key={m.score}
                        onClick={() => setSelectedMood({ emoji: m.emoji, score: m.score })}
                        className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                          selectedMood?.score === m.score
                            ? "bg-selapp-accent text-white shadow-md scale-110"
                            : "bg-selapp-beige/30 hover:bg-selapp-beige/50"
                        }`}
                      >
                        <span className="text-4xl mb-2">{m.emoji}</span>
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={thoughtTypes.find(t => t.type === activeSection)?.placeholder}
                    rows={activeSection === 'gratitude' ? 2 : activeSection === 'freeNote' ? 8 : 5}
                    className="w-full px-4 py-3 border border-selapp-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-selapp-accent resize-none"
                    autoFocus
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeSection}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveThought}
                    className="flex-1 bg-selapp-accent hover:bg-selapp-accent-dark text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    💾 Guardar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
