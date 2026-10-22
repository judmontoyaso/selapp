"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiBookOpen, FiSmile, FiHeart, FiTarget, FiEdit, FiSave, FiX, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";
import { Skeleton } from "@/components/ui/skeleton";

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
  { type: 'gratitude' as const, icon: <FiHeart className="w-8 h-8 text-selapp-accent" />, minIcon: <FiHeart className="w-5 h-5" />, label: 'Gratitud', placeholder: 'Hoy agradezco por (gratitud)...' },
  { type: 'mood' as const, icon: <FiSmile className="w-8 h-8 text-selapp-accent" />, minIcon: <FiSmile className="w-5 h-5" />, label: 'Estado de ánimo', placeholder: '¿Cómo me siento hoy?' },
  { type: 'thoughts' as const, icon: <FiBookOpen className="w-8 h-8 text-selapp-accent" />, minIcon: <FiBookOpen className="w-5 h-5" />, label: 'Pensamientos y oración', placeholder: 'He estado pensando en / motivo de oracion...' },
  { type: 'achievements' as const, icon: <FiTarget className="w-8 h-8 text-selapp-accent" />, minIcon: <FiTarget className="w-5 h-5" />, label: 'Logros espirituales', placeholder: 'Hoy aprendí / logro espiritual...' },
  { type: 'freeNote' as const, icon: <FiEdit className="w-8 h-8 text-selapp-accent" />, minIcon: <FiEdit className="w-5 h-5" />, label: 'Nota libre y oración', placeholder: 'Escribe tu reflexión o motivo de oracion libremente...' },
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

    let payload: any = {
      date: new Date().toISOString().split("T")[0],
    };

    if (activeSection === 'mood') {
      if (!selectedMood) {
        toast.info("Por favor selecciona un estado de ánimo");
        return;
      }
      payload.mood = selectedMood.emoji;
      payload.moodScore = selectedMood.score;
    } else {
      if (!inputValue.trim()) {
        toast.info("Por favor escribe algo antes de guardar");
        return;
      }
      payload[activeSection] = inputValue;
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
        toast.success("Guardado exitosamente");
      } else {
        toast.error("Error al guardar");
      }
    } catch (error) {
      console.error("Error saving thought:", error);
      toast.error("Error al guardar");
    }
  };

  const handleDeleteEntry = async () => {
    try {
      const response = await fetch("/api/diary", {
        method: "DELETE",
      });
      if (response.ok) {
        setTodayEntry(null);
        toast.success("Entrada eliminada exitosamente");
      } else {
        setTodayEntry(null);
        toast.success("Entrada eliminada");
      }
    } catch (error) {
      console.error("Error al eliminar nota:", error);
      toast.error("Error al eliminar nota");
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
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white dark:from-background dark:to-card flex items-center justify-center">
        <div className="text-selapp-brown dark:text-foreground text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white dark:from-background dark:to-card p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-selapp-brown dark:text-selapp-beige hover:underline mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-selapp-brown dark:text-foreground mb-2">
            📖 Mi Diario Espiritual
          </h1>
          <p className="text-selapp-brown-light dark:text-muted-foreground">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-8 space-y-4 animate-pulse">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {todayEntry && (
              <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-selapp-brown/10 dark:border-border p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-selapp-brown dark:text-foreground flex items-center gap-2">
                    <FiBookOpen className="w-5 h-5 text-selapp-accent" /> Registrado hoy
                  </h2>
                  <button
                    onClick={handleDeleteEntry}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium transition-colors"
                    title="Eliminar entrada de hoy"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    Eliminar nota de hoy
                  </button>
                </div>

                {todayEntry.gratitude && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 dark:text-muted-foreground font-semibold flex items-center gap-2 mb-1">
                      <FiHeart className="w-4 h-4" /> Gratitud
                    </p>
                    <p className="text-selapp-brown dark:text-foreground">{todayEntry.gratitude}</p>
                  </div>
                )}

                {todayEntry.mood && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 dark:text-muted-foreground font-semibold flex items-center gap-2 mb-1">
                      <FiSmile className="w-4 h-4" /> Estado de ánimo
                    </p>
                    <p className="text-3xl">{todayEntry.mood}</p>
                  </div>
                )}

                {todayEntry.thoughts && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 dark:text-muted-foreground font-semibold flex items-center gap-2 mb-1">
                      <FiBookOpen className="w-4 h-4" /> Pensamientos y oración
                    </p>
                    <div 
                      className="text-selapp-brown dark:text-foreground prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: todayEntry.thoughts }}
                    />
                  </div>
                )}

                {todayEntry.achievements && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 dark:text-muted-foreground font-semibold flex items-center gap-2 mb-1">
                      <FiTarget className="w-4 h-4" /> Logros
                    </p>
                    <p className="text-selapp-brown dark:text-foreground">{todayEntry.achievements}</p>
                  </div>
                )}

                {todayEntry.freeNote && (
                  <div className="border-l-4 border-selapp-accent pl-4 py-2">
                    <p className="text-sm text-selapp-brown/60 dark:text-muted-foreground font-semibold flex items-center gap-2 mb-1">
                      <FiEdit className="w-4 h-4" /> Nota libre
                    </p>
                    <div 
                      className="text-selapp-brown dark:text-foreground prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: todayEntry.freeNote }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Estado vacío cuando no hay notas */}
            {!todayEntry && !activeSection && (
              <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-selapp-brown/10 dark:border-border p-8 mb-6 text-center space-y-3">
                <span className="text-4xl block mb-2">📖</span>
                <h3 className="font-semibold text-lg text-foreground">
                  No tienes notas registradas hoy
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No hay notas aún en tu diario. Comienza escribiendo tu reflexión diaria, motivos de oración o agradecimiento en las categorías abajo.
                </p>
              </div>
            )}

            {!activeSection && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {thoughtTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => openSection(type.type)}
                    className="w-full bg-white dark:bg-card hover:bg-selapp-beige/30 dark:hover:bg-accent rounded-xl shadow-sm border border-selapp-brown/10 dark:border-border p-6 transition-all text-left flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center p-3 bg-selapp-beige/30 dark:bg-accent rounded-full">
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-selapp-brown dark:text-foreground">{type.label}</h3>
                      <p className="text-sm text-selapp-brown/60 dark:text-muted-foreground">{type.placeholder}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeSection && (
              <div className="bg-white dark:bg-card rounded-2xl shadow-md border border-border p-6 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-selapp-brown dark:text-foreground flex items-center gap-3">
                    {thoughtTypes.find(t => t.type === activeSection)?.icon}
                    <span>{thoughtTypes.find(t => t.type === activeSection)?.label}</span>
                  </h2>
                  <button
                    onClick={closeSection}
                    className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {activeSection === 'mood' ? (
                  <div className="flex gap-4 justify-center flex-wrap py-4">
                    {moodEmojis.map((m) => (
                      <button
                        key={m.score}
                        onClick={() => setSelectedMood({ emoji: m.emoji, score: m.score })}
                        className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                          selectedMood?.score === m.score
                            ? "bg-selapp-accent text-white shadow-md scale-110"
                            : "bg-selapp-beige/30 dark:bg-accent hover:bg-selapp-beige/50"
                        }`}
                      >
                        <span className="text-4xl mb-2">{m.emoji}</span>
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                ) : activeSection === 'freeNote' ? (
                  <div className="border border-border rounded-xl p-3 bg-background">
                    <RichTextEditor
                      content={inputValue}
                      onChange={setInputValue}
                      placeholder={thoughtTypes.find(t => t.type === activeSection)?.placeholder || "Escribe tu nota..."}
                    />
                  </div>
                ) : (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={thoughtTypes.find(t => t.type === activeSection)?.placeholder}
                    rows={activeSection === 'gratitude' ? 3 : 5}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-selapp-accent resize-none bg-background text-foreground"
                    autoFocus
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeSection}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 px-6 rounded-xl transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveThought}
                    className="flex-1 bg-selapp-accent hover:bg-selapp-accent-dark text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <FiSave className="w-5 h-5" /> Guardar
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
