import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DevotionalQuestions {
  title: string;
  reflection: string;
  questions: Array<{
    question: string;
    type: "open" | "reflection" | "action";
  }>;
}

/**
 * Genera un devocional completo con preguntas usando OpenAI
 */
export async function generateDevotional(
  verseReference: string,
  verseText: string,
  theme: string
): Promise<DevotionalQuestions> {
  try {
    const prompt = `Eres un pastor cristiano experimentado creando un devocional diario.

Versículo: ${verseReference}
"${verseText}"

Tema: ${theme}

Crea un devocional completo en español con:
1. Un título inspirador (máximo 50 caracteres)
2. Una reflexión profunda (200-300 palabras) que conecte el versículo con la vida diaria
3. Tres preguntas para reflexionar:
   - Pregunta 1 (reflexión personal): Una pregunta introspectiva sobre cómo el versículo aplica a la vida personal
   - Pregunta 2 (aplicación práctica): Una pregunta sobre acciones concretas que se pueden tomar
   - Pregunta 3 (compromiso): Una pregunta sobre cómo vivir este versículo esta semana

Responde SOLO con un JSON válido en este formato exacto:
{
  "title": "título aquí",
  "reflection": "reflexión completa aquí",
  "questions": [
    {"question": "pregunta 1", "type": "reflection"},
    {"question": "pregunta 2", "type": "action"},
    {"question": "pregunta 3", "type": "action"}
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un pastor cristiano que crea devocionales profundos y prácticos. Respondes SOLO con JSON válido, sin texto adicional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No se recibió respuesta de OpenAI");
    }

    const result = JSON.parse(content);
    return result as DevotionalQuestions;
  } catch (error) {
    console.error("Error generando devocional con OpenAI:", error);
    throw error;
  }
}

/**
 * Genera solo preguntas para un versículo existente
 */
export async function generateQuestions(
  verseReference: string,
  verseText: string,
  theme: string
): Promise<Array<{ question: string; type: string }>> {
  try {
    const result = await generateDevotional(verseReference, verseText, theme);
    return result.questions;
  } catch (error) {
    console.error("Error generando preguntas:", error);
    throw error;
  }
}
