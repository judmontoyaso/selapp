-- Crear tablas de devocionales
-- Ejecuta este SQL en Supabase SQL Editor

-- Tabla principal de devocionales
CREATE TABLE IF NOT EXISTS "Devotional" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "verseReference" TEXT NOT NULL,
    "verseText" TEXT NOT NULL,
    "reflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devotional_pkey" PRIMARY KEY ("id")
);

-- Tabla de preguntas del devocional
CREATE TABLE IF NOT EXISTS "DevotionalQuestion" (
    "id" TEXT NOT NULL,
    "devotionalId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "DevotionalQuestion_pkey" PRIMARY KEY ("id")
);

-- Tabla de respuestas de usuarios
CREATE TABLE IF NOT EXISTS "DevotionalAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "devotionalId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevotionalAnswer_pkey" PRIMARY KEY ("id")
);

-- Índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "Devotional_date_key" ON "Devotional"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "DevotionalAnswer_userId_questionId_key" ON "DevotionalAnswer"("userId", "questionId");

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS "Devotional_date_idx" ON "Devotional"("date");
CREATE INDEX IF NOT EXISTS "DevotionalQuestion_devotionalId_idx" ON "DevotionalQuestion"("devotionalId");
CREATE INDEX IF NOT EXISTS "DevotionalAnswer_userId_devotionalId_idx" ON "DevotionalAnswer"("userId", "devotionalId");

-- Foreign keys
ALTER TABLE "DevotionalQuestion" 
ADD CONSTRAINT "DevotionalQuestion_devotionalId_fkey" 
FOREIGN KEY ("devotionalId") REFERENCES "Devotional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DevotionalAnswer" 
ADD CONSTRAINT "DevotionalAnswer_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DevotionalAnswer" 
ADD CONSTRAINT "DevotionalAnswer_devotionalId_fkey" 
FOREIGN KEY ("devotionalId") REFERENCES "Devotional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DevotionalAnswer" 
ADD CONSTRAINT "DevotionalAnswer_questionId_fkey" 
FOREIGN KEY ("questionId") REFERENCES "DevotionalQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Habilitar RLS (Row Level Security)
ALTER TABLE "Devotional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DevotionalQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DevotionalAnswer" ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: todos pueden leer devocionales
CREATE POLICY "Anyone can read devotionals" ON "Devotional" FOR SELECT USING (true);
CREATE POLICY "Anyone can read questions" ON "DevotionalQuestion" FOR SELECT USING (true);

-- Políticas: usuarios solo pueden ver/editar sus propias respuestas
CREATE POLICY "Users can read own answers" ON "DevotionalAnswer" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own answers" ON "DevotionalAnswer" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own answers" ON "DevotionalAnswer" FOR UPDATE USING (auth.uid()::text = "userId");
