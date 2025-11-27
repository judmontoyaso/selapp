"use client";

import { useState, useEffect } from "react";
import type { Level } from "@/lib/levels";
import { BookOpen, Flame, Trophy, Calendar, Sprout, Target, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface ReadingStats {
  totalDays: number;
  totalSeeds: number;
  currentStreak: number;
  maxStreak: number;
  readToday: boolean;
  level: number;
  seedsToNextLevel: number;
  currentLevel: Level;
  nextLevel: Level | null;
  progressPercentage: number;
}

export default function DailyReadingTracker() {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [passage, setPassage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/readings/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const markAsRead = async () => {
    if (stats?.readToday) {
      setMessage("Ya marcaste tu lectura de hoy ✓");
      return;
    }

    if (!passage.trim()) {
      setMessage("Por favor, ingresa el pasaje que leíste");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passage: passage.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("¡Lectura registrada! +10 Semillas");
        setPassage("");
        await loadStats(); // Recargar estadísticas
      } else {
        setMessage(data.error || "Error al registrar lectura");
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage("Error al registrar lectura");
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <div className="selapp-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-selapp-beige rounded-2xl w-1/2"></div>
          <div className="h-6 bg-selapp-beige rounded-xl w-3/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-selapp-beige rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="selapp-card p-8 bg-gradient-to-br from-white via-selapp-beige/20 to-white">
      {/* Header con nivel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} className="text-selapp-brown" strokeWidth={1.5} />
            <h2 className="text-3xl font-serif font-bold text-selapp-brown">Lectura Diaria</h2>
          </div>
          <p className="text-selapp-brown-light text-sm font-light">Cultiva tu jardín espiritual cada día</p>
        </div>
        <div className="flex items-center gap-4 bg-gradient-to-br from-selapp-brown/5 to-selapp-accent/5 px-6 py-4 rounded-2xl shadow-inner border border-selapp-beige-dark/30">
          <span className="text-4xl">{stats.currentLevel.icon}</span>
          <div className="flex flex-col">
            <span className={`text-xl font-bold font-serif ${stats.currentLevel.color}`}>
              {stats.currentLevel.name}
            </span>
            <span className="text-xs text-selapp-brown-light uppercase tracking-wider font-bold">Nivel {stats.currentLevel.level}</span>
          </div>
        </div>
      </div>

      {/* Descripción del nivel */}
      <div className="bg-gradient-to-r from-selapp-brown/5 to-transparent rounded-2xl p-4 mb-6 border-l-[6px] border-selapp-brown">
        <p className="text-sm text-selapp-brown-dark italic font-serif leading-relaxed">&ldquo;{stats.currentLevel.description}&rdquo;</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-5 text-center shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-2">
            <Flame size={24} className="text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-1">{stats.currentStreak}</div>
          <div className="text-xs text-selapp-brown-light font-medium uppercase tracking-wide">Racha actual</div>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-5 text-center shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-2">
            <Trophy size={24} className="text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.maxStreak}</div>
          <div className="text-xs text-selapp-brown-light font-medium uppercase tracking-wide">Racha máxima</div>
        </div>

        <div className="bg-gradient-to-br from-white to-selapp-success/10 rounded-2xl p-5 text-center shadow-sm border border-selapp-success/20 hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-2">
            <Calendar size={24} className="text-selapp-success" />
          </div>
          <div className="text-3xl font-bold text-selapp-success mb-1">{stats.totalDays}</div>
          <div className="text-xs text-selapp-brown-light font-medium uppercase tracking-wide">Días totales</div>
        </div>

        <div className="bg-gradient-to-br from-white to-selapp-accent/10 rounded-2xl p-5 text-center shadow-sm border border-selapp-accent/20 hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-2">
            <Sprout size={24} className="text-selapp-accent" />
          </div>
          <div className="text-3xl font-bold text-selapp-accent mb-1">{stats.totalSeeds}</div>
          <div className="text-xs text-selapp-brown-light font-medium uppercase tracking-wide">Semillas</div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-selapp-beige-dark/30">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-selapp-brown font-medium flex items-center gap-2">
            <Target size={16} />
            {stats.nextLevel ? `Siguiente: ${stats.nextLevel.icon} ${stats.nextLevel.name}` : "¡Nivel máximo alcanzado!"}
          </span>
          <span className="text-selapp-accent font-bold">
            {stats.nextLevel ? `${stats.seedsToNextLevel} semillas` : <Sparkles size={16} />}
          </span>
        </div>
        <div className="w-full bg-selapp-beige rounded-full h-5 overflow-hidden shadow-inner border border-selapp-beige-dark/30">
          <div
            className="bg-gradient-to-r from-selapp-success via-selapp-accent to-selapp-accent-light h-5 rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${stats.progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
          </div>
        </div>
        <div className="text-xs text-selapp-brown-light mt-2 text-center font-medium">
          {stats.progressPercentage.toFixed(1)}% completado hacia el siguiente nivel
        </div>
      </div>

      {/* Input y botón */}
      {!stats.readToday ? (
        <div className="space-y-5">
          <div>
            <label htmlFor="passage-input" className="block text-sm font-bold text-selapp-brown mb-3 uppercase tracking-wide">
              ¿Qué pasaje leíste hoy? *
            </label>
            <input
              id="passage-input"
              type="text"
              placeholder="Ej: Juan 3:16-20, Salmos 23, Génesis 1:1-10"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && passage.trim() && markAsRead()}
              className="selapp-input w-full"
              required
            />
          </div>

          <button
            onClick={markAsRead}
            disabled={loading || !passage.trim()}
            className={`w-full py-4 rounded-full font-bold text-white text-lg transition-all flex items-center justify-center gap-3 shadow-lg
              ${loading || !passage.trim()
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-selapp-success to-selapp-accent hover:from-selapp-success hover:to-selapp-accent-dark hover:shadow-xl hover:-translate-y-0.5'
              }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <BookOpen size={20} />
                <span>Marcar como leído</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-selapp-success/10 to-selapp-success/5 border-2 border-selapp-success/30 rounded-2xl p-8 text-center">
          <CheckCircle2 size={56} className="mx-auto mb-4 text-selapp-success" strokeWidth={1.5} />
          <div className="text-selapp-brown font-bold text-xl mb-2 font-serif">¡Ya leíste hoy!</div>
          <div className="text-selapp-brown-light text-sm">Vuelve mañana para mantener tu racha floreciendo</div>
        </div>
      )}

      {/* Mensaje de feedback */}
      {message && (
        <div className={`mt-5 p-4 rounded-2xl text-center font-medium border-2 ${message.includes('Error') || message.includes('ya marcaste')
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-selapp-success/10 text-selapp-success border-selapp-success/30'
          }`}>
          {message}
        </div>
      )}

      {/* Motivación */}
      {stats.currentStreak > 0 && (
        <div className="mt-8 bg-gradient-to-br from-selapp-accent/5 via-transparent to-selapp-success/5 rounded-2xl p-6 border-2 border-selapp-accent/20">
          <div className="text-center">
            <div className="text-selapp-brown font-bold text-lg mb-3 font-serif">
              {stats.currentStreak >= 30 && "¡Racha legendaria! Eres un ejemplo de constancia"}
              {stats.currentStreak >= 14 && stats.currentStreak < 30 && "¡Dos semanas seguidas! Tu compromiso es inspirador"}
              {stats.currentStreak >= 7 && stats.currentStreak < 14 && "¡Una semana completa! Sigue adelante"}
              {stats.currentStreak >= 3 && stats.currentStreak < 7 && "¡Vas muy bien! No te detengas"}
              {stats.currentStreak < 3 && "¡Buen comienzo! Cada día cuenta"}
            </div>
            {stats.nextLevel && stats.seedsToNextLevel <= 50 && (
              <div className="flex items-center justify-center gap-2 text-sm text-selapp-brown-light mt-3">
                <Sparkles size={16} className="text-selapp-accent" />
                <span>
                  ¡Estás cerca de convertirte en {stats.nextLevel.icon} <span className="font-bold text-selapp-brown">{stats.nextLevel.name}</span>!
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
