// Frecuencia de palabras para nubes de palabras de sermones.
// Filtra stopwords del español y palabras muy cortas.

const STOPWORDS_ES = new Set([
  // artículos, preposiciones, conjunciones
  "el", "la", "los", "las", "un", "una", "unos", "unas", "lo", "al", "del",
  "a", "ante", "bajo", "con", "contra", "de", "desde", "durante", "en", "entre",
  "hacia", "hasta", "mediante", "para", "por", "según", "segun", "sin", "sobre", "tras",
  "y", "e", "ni", "o", "u", "pero", "sino", "aunque", "porque", "pues", "como",
  "cuando", "mientras", "si", "que", "qué", "quien", "quién", "quienes", "cual",
  "cuál", "cuales", "cuáles", "donde", "dónde", "cuanto", "cuánto", "cuanta",
  "cuánta", "cuantos", "cuántos", "cuantas", "cuántas",
  // pronombres
  "yo", "tú", "tu", "él", "ella", "ello", "nosotros", "nosotras", "vosotros",
  "vosotras", "ellos", "ellas", "usted", "ustedes", "me", "te", "se", "nos", "os",
  "le", "les", "mi", "mis", "tus", "su", "sus", "nuestro", "nuestra", "nuestros",
  "nuestras", "vuestro", "vuestra", "mío", "mio", "mía", "mia", "tuyo", "tuya",
  "suyo", "suya", "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso",
  "esos", "esas", "aquel", "aquella", "aquello", "aquellos", "aquellas", "algo",
  "alguien", "nadie", "nada", "cada", "otro", "otra", "otros", "otras", "mismo",
  "misma", "mismos", "mismas", "tanto", "tanta", "tantos", "tantas", "tal", "tales",
  // verbos comunes / auxiliares
  "ser", "es", "soy", "eres", "somos", "son", "era", "eras", "éramos", "eran",
  "fue", "fui", "fuimos", "fueron", "será", "sera", "serán", "seran", "sería",
  "seria", "sido", "siendo", "estar", "está", "esta", "estás", "estas", "estoy",
  "estamos", "están", "estan", "estaba", "estaban", "estuvo", "estado", "haber",
  "ha", "he", "has", "hemos", "han", "había", "habia", "habían", "habian", "hay",
  "haya", "hubo", "habrá", "habra", "hacer", "hace", "hacen", "hacía", "hacia",
  "hizo", "hecho", "haciendo", "tener", "tiene", "tienen", "tengo", "tenemos",
  "tenía", "tenia", "tenían", "tenian", "tuvo", "tenido", "poder", "puede",
  "pueden", "puedo", "podemos", "podía", "podia", "pudo", "podrá", "podra",
  "ir", "va", "van", "voy", "vamos", "iba", "iban", "decir", "dice", "dicen",
  "dijo", "dicho", "dar", "da", "dan", "dio", "dado", "ver", "ve", "ven", "vio",
  "visto", "saber", "sabe", "saben", "sabía", "sabia", "supo", "querer", "quiere",
  "quieren", "quiso", "deber", "debe", "deben", "debemos", "debía", "debia",
  // adverbios y muletillas
  "no", "sí", "si", "más", "mas", "menos", "muy", "mucho", "mucha", "muchos",
  "muchas", "poco", "poca", "pocos", "pocas", "todo", "toda", "todos", "todas",
  "también", "tambien", "tampoco", "ya", "aún", "aun", "todavía", "todavia",
  "ahora", "antes", "después", "despues", "luego", "entonces", "aquí", "aqui",
  "ahí", "ahi", "allí", "alli", "allá", "alla", "así", "asi", "bien", "mal",
  "casi", "solo", "sólo", "solamente", "siempre", "nunca", "jamás", "jamas",
  "quizás", "quizas", "tal vez", "vez", "veces", "hoy", "ayer", "mañana", "manana",
  "ejemplo", "parte", "cosa", "cosas", "forma", "manera", "momento", "tiempo",
  "día", "dia", "días", "dias", "año", "ano", "años", "anos",
  "uno", "dos", "tres", "tan", "san", "don", "etc", "ver", "vas", "van", "fin",
  "les", "las", "los", "sea", "son", "eso", "esa", "ese", "por", "con", "del",
  // conectores de predicación frecuentes que no aportan al tema
  "capítulo", "capitulo", "versículo", "versiculo", "vers", "dice", "texto",
]);

// Versiones bíblicas y abreviaturas comunes que NO deben figurar en la nube de palabras
export const BIBLE_VERSIONS = new Set([
  // Siglas en español
  "nvi", "ntv", "rvr", "rv", "rv60", "rvr60", "rv1960", "rvr1960", "rv95", "rvr95", "rv1909", "rvr1909",
  "dhh", "tla", "lbla", "nbla", "nblh", "btx", "nbv", "pdt", "bj", "bbla", "bla", "nbj",
  "vulgata", "septuaginta",
  // Siglas comunes en inglés / traducciones
  "kjv", "nkjv", "esv", "nasb", "niv", "amp", "csb", "msg", "nrsv", "nlt",
  // Palabras genéricas sobre versiones
  "version", "versión", "versiones", "traduccion", "traducción", "traducciones",
  "valera", "reina",
]);

export interface WordCount {
  text: string;
  count: number;
}

// Nombres propios/reverentes que se muestran con mayúscula inicial en la nube
const PROPER_NOUNS_ES = new Set([
  "dios", "señor", "jesús", "jesus", "jesucristo", "cristo", "espíritu",
  "espiritu", "jehová", "jehova", "yahvé", "yahve", "biblia", "israel",
  "padre", "santo",
]);

function displayWord(token: string): string {
  return PROPER_NOUNS_ES.has(token)
    ? token.charAt(0).toUpperCase() + token.slice(1)
    : token;
}

/**
 * Calcula las palabras más frecuentes de un texto plano en español.
 * @param text texto plano (usar stripHtml antes si viene de TipTap)
 * @param limit máximo de palabras a devolver
 * @param exclude palabras adicionales a ignorar (p. ej. nombres de libros bíblicos)
 */
export function wordFrequencies(text: string, limit = 80, exclude?: Set<string>): WordCount[] {
  const counts = new Map<string, number>();

  const tokens = text
    .toLowerCase()
    // conservar letras (con tildes/ñ) y separar todo lo demás
    .split(/[^a-záéíóúüñ]+/u);

  // Palabras cortas con peso teológico que el mínimo de longitud eliminaría
  const shortWhitelist = new Set(["fe"]);

  for (const token of tokens) {
    if (token.length < 3 && !shortWhitelist.has(token)) continue;
    if (STOPWORDS_ES.has(token)) continue;
    if (BIBLE_VERSIONS.has(token)) continue;
    if (exclude?.has(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([text, count]) => ({ text: displayWord(text), count }))
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text))
    .slice(0, limit);
}
