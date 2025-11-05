"use client";

import { useState, useEffect } from "react";
import type { Level } from "@/lib/levels";

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
      setMessage("Ya marcaste tu lectura de hoy ✅");
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
        setMessage("¡Lectura registrada! +10 Semillas �");
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-2 border-green-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-900">📖 Lectura Diaria</h2>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-md border-2 border-green-300">
          <span className="text-3xl">{stats.currentLevel.icon}</span>
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${stats.currentLevel.color}`}>
              {stats.currentLevel.name}
            </span>
            <span className="text-xs text-gray-600">Nivel {stats.currentLevel.level}</span>
          </div>
        </div>
      </div>

      {/* Descripción del nivel */}
      <div className="bg-white rounded-lg p-3 mb-4 border-l-4 border-green-500">
        <p className="text-sm text-gray-700 italic">"{stats.currentLevel.description}"</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-orange-600">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600 mt-1">Racha actual 🔥</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-amber-600">{stats.maxStreak}</div>
          <div className="text-sm text-gray-600 mt-1">Racha máxima 🏆</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600">{stats.totalDays}</div>
          <div className="text-sm text-gray-600 mt-1">Días totales 📅</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{stats.totalSeeds}</div>
          <div className="text-sm text-gray-600 mt-1">Semillas 🌱</div>
        </div>
      </div>

      {/* Barra de progreso de Semillas */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-gray-700 font-medium">
            {stats.nextLevel ? `Siguiente: ${stats.nextLevel.icon} ${stats.nextLevel.name}` : "¡Nivel máximo alcanzado!"}
          </span>
          <span className="text-green-700 font-bold">
            {stats.nextLevel ? `${stats.seedsToNextLevel} semillas restantes` : "🎉"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
            style={{ width: `${stats.progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-1 text-center">
          {stats.progressPercentage.toFixed(1)}% completado
        </div>
      </div>

      {/* Botón para marcar lectura */}
      {!stats.readToday ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="passage-input" className="block text-sm font-medium text-green-800 mb-2">
              ¿Qué pasaje leíste hoy? *
            </label>
            <input
              id="passage-input"
              type="text"
              placeholder="Ej: Juan 3:16-20, Salmos 23, Génesis 1:1-10"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-400 focus:outline-none text-gray-800"
              required
            />
          </div>
          
          <button
            onClick={markAsRead}
            disabled={loading || !passage.trim()}
            className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all
              ${loading || !passage.trim()
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }`}
          >
            {loading ? '⏳ Guardando...' : '📖 Marcar como leído'}
          </button>
        </div>
      ) : (
        <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-green-800 font-bold text-lg">¡Ya leíste hoy!</div>
          <div className="text-green-600 text-sm mt-1">Vuelve mañana para mantener tu racha</div>
        </div>
      )}

      {/* Mensaje de feedback */}
      {message && (
        <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
          message.includes('Error') || message.includes('ya marcaste')
            ? 'bg-red-100 text-red-700 border-2 border-red-300'
            : 'bg-green-100 text-green-700 border-2 border-green-300'
        }`}>
          {message}
        </div>
      )}

      {/* Motivación según racha y progreso */}
      {stats.currentStreak > 0 && (
        <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
          <div className="text-center">
            <div className="text-green-800 font-bold text-lg mb-2">
              {stats.currentStreak >= 30 && "🔥 ¡Racha legendaria! Eres un ejemplo de constancia"}
              {stats.currentStreak >= 14 && stats.currentStreak < 30 && "⭐ ¡Dos semanas seguidas! Tu compromiso es inspirador"}
              {stats.currentStreak >= 7 && stats.currentStreak < 14 && "🎯 ¡Una semana completa! Sigue adelante"}
              {stats.currentStreak >= 3 && stats.currentStreak < 7 && "💪 ¡Vas muy bien! No te detengas"}
              {stats.currentStreak < 3 && "🌱 ¡Buen comienzo! Cada día cuenta"}
            </div>
            {stats.nextLevel && stats.seedsToNextLevel <= 50 && (
              <div className="text-sm text-green-700 mt-2">
                ¡Estás cerca de convertirte en {stats.nextLevel.icon} <span className="font-bold">{stats.nextLevel.name}</span>!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
