// Sistema de niveles para lectura diaria de la Biblia
// Basado en el concepto de crecimiento espiritual

export interface Level {
  level: number;
  name: string;
  icon: string;
  seedsRequired: number;
  color: string;
  description: string;
}

export const LEVELS: Level[] = [
  { 
    level: 1, 
    name: "Semilla", 
    icon: "🌱", 
    seedsRequired: 0,
    color: "text-green-600",
    description: "Comenzando tu viaje en la Palabra"
  },
  { 
    level: 2, 
    name: "Brote", 
    icon: "🌿", 
    seedsRequired: 100,
    color: "text-green-700",
    description: "Creciendo en fe día a día"
  },
  { 
    level: 3, 
    name: "Planta", 
    icon: "🪴", 
    seedsRequired: 300,
    color: "text-emerald-600",
    description: "Arraigado en la Palabra"
  },
  { 
    level: 4, 
    name: "Árbol Joven", 
    icon: "🌳", 
    seedsRequired: 600,
    color: "text-emerald-700",
    description: "Fuerte y firme en la fe"
  },
  { 
    level: 5, 
    name: "Árbol Fuerte", 
    icon: "🌲", 
    seedsRequired: 1000,
    color: "text-teal-700",
    description: "Como árbol plantado junto a corrientes de agua"
  },
  { 
    level: 6, 
    name: "Bosque", 
    icon: "🌴", 
    seedsRequired: 1500,
    color: "text-cyan-700",
    description: "Abundante en frutos del Espíritu"
  },
  { 
    level: 7, 
    name: "Maestro", 
    icon: "📚", 
    seedsRequired: 2100,
    color: "text-blue-700",
    description: "Enseñando la Palabra con sabiduría"
  },
  { 
    level: 8, 
    name: "Sabio", 
    icon: "👴", 
    seedsRequired: 2800,
    color: "text-indigo-700",
    description: "Lleno de conocimiento y discernimiento"
  },
  { 
    level: 9, 
    name: "Profeta", 
    icon: "⚡", 
    seedsRequired: 3600,
    color: "text-purple-700",
    description: "Hablando la verdad de Dios con poder"
  },
  { 
    level: 10, 
    name: "Santo", 
    icon: "✨", 
    seedsRequired: 4500,
    color: "text-amber-600",
    description: "Resplandeciendo con la gloria de Dios"
  },
];

// Función para obtener el nivel actual basado en las semillas
export function getCurrentLevel(totalSeeds: number): Level {
  // Encontrar el nivel más alto que el usuario ha alcanzado
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalSeeds >= LEVELS[i].seedsRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0]; // Por defecto, nivel 1
}

// Función para obtener el siguiente nivel
export function getNextLevel(currentLevel: number): Level | null {
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel + 1);
  return nextLevelIndex !== -1 ? LEVELS[nextLevelIndex] : null;
}

// Función para calcular el progreso al siguiente nivel
export function getProgressToNextLevel(totalSeeds: number): {
  currentLevel: Level;
  nextLevel: Level | null;
  seedsToNextLevel: number;
  progressPercentage: number;
} {
  const currentLevel = getCurrentLevel(totalSeeds);
  const nextLevel = getNextLevel(currentLevel.level);
  
  if (!nextLevel) {
    // Ya está en el nivel máximo
    return {
      currentLevel,
      nextLevel: null,
      seedsToNextLevel: 0,
      progressPercentage: 100
    };
  }
  
  const seedsInCurrentLevel = totalSeeds - currentLevel.seedsRequired;
  const seedsNeededForNextLevel = nextLevel.seedsRequired - currentLevel.seedsRequired;
  const progressPercentage = (seedsInCurrentLevel / seedsNeededForNextLevel) * 100;
  const seedsToNextLevel = nextLevel.seedsRequired - totalSeeds;
  
  return {
    currentLevel,
    nextLevel,
    seedsToNextLevel,
    progressPercentage: Math.min(progressPercentage, 100)
  };
}
