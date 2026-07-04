// Extracción de referencias bíblicas desde texto libre (notas de sermones).
// Reutiliza el BOOK_MAP de youversion.ts para reconocer nombres y abreviaturas en español.

import { BOOK_MAP } from "./youversion";

// Nombre canónico en español por código USFM (para mostrar resultados agregados)
export const USFM_TO_SPANISH: Record<string, string> = {
  GEN: "Génesis", EXO: "Éxodo", LEV: "Levítico", NUM: "Números", DEU: "Deuteronomio",
  JOS: "Josué", JDG: "Jueces", RUT: "Rut", "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Reyes", "2KI": "2 Reyes", "1CH": "1 Crónicas", "2CH": "2 Crónicas",
  EZR: "Esdras", NEH: "Nehemías", EST: "Ester", JOB: "Job", PSA: "Salmos",
  PRO: "Proverbios", ECC: "Eclesiastés", SNG: "Cantares", ISA: "Isaías",
  JER: "Jeremías", LAM: "Lamentaciones", EZK: "Ezequiel", DAN: "Daniel",
  HOS: "Oseas", JOL: "Joel", AMO: "Amós", OBA: "Abdías", JON: "Jonás",
  MIC: "Miqueas", NAM: "Nahúm", HAB: "Habacuc", ZEP: "Sofonías", HAG: "Hageo",
  ZEC: "Zacarías", MAL: "Malaquías", MAT: "Mateo", MRK: "Marcos", LUK: "Lucas",
  JHN: "Juan", ACT: "Hechos", ROM: "Romanos", "1CO": "1 Corintios", "2CO": "2 Corintios",
  GAL: "Gálatas", EPH: "Efesios", PHP: "Filipenses", COL: "Colosenses",
  "1TH": "1 Tesalonicenses", "2TH": "2 Tesalonicenses", "1TI": "1 Timoteo",
  "2TI": "2 Timoteo", TIT: "Tito", PHM: "Filemón", HEB: "Hebreos", JAS: "Santiago",
  "1PE": "1 Pedro", "2PE": "2 Pedro", "1JN": "1 Juan", "2JN": "2 Juan",
  "3JN": "3 Juan", JUD: "Judas", REV: "Apocalipsis",
};

// Tokens de nombres de libros (minúscula, con singulares comunes) para poder
// excluirlos de la nube de palabras: ya están representados en "libros más citados".
export const BOOK_NAME_WORDS: Set<string> = (() => {
  const words = new Set<string>();
  const add = (w: string) => {
    words.add(w);
    // variante sin tildes ("génesis" → "genesis")
    words.add(w.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  };
  for (const name of Object.values(USFM_TO_SPANISH)) {
    for (const w of name.toLowerCase().split(/\s+/)) {
      if (!/^\d+$/.test(w)) add(w);
    }
  }
  for (const extra of ["salmo", "proverbio", "cantar", "crónica", "corintio", "efesio", "romano", "hebreo", "filipense", "colosense", "tesalonicense", "gálata"]) {
    add(extra);
  }
  return words;
})();

export interface ExtractedReference {
  usfm: string;        // "JHN.3.16" o "JHN.3.16-18" o "JHN.3"
  book: string;        // código USFM: "JHN"
  bookName: string;    // "Juan"
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  reference: string;   // legible: "Juan 3:16-18"
}

/** Quita etiquetas HTML y entidades comunes; devuelve texto plano. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n");
}

// Alternación de alias ordenada de más largo a más corto para que "1 corintios"
// gane sobre "corintios" y "salmos" sobre "sal".
const ALIASES = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);
const ALIAS_PATTERN = ALIASES
  .map((a) => a.replace(/\s+/g, "\\s+"))
  .join("|");

// (inicio o no-letra/dígito) alias, espacio(s), capítulo, y opcional :versículo(-fin)
const REF_REGEX = new RegExp(
  `(?<![\\p{L}\\d])(${ALIAS_PATTERN})\\s+(\\d{1,3})(?:\\s*:\\s*(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?)?(?![\\p{L}\\d])`,
  "giu"
);

/**
 * Extrae referencias bíblicas de un texto en español.
 * Los alias muy cortos (≤3 letras, tipo "sal", "jn", "is") solo cuentan si traen
 * capítulo Y versículo ("Jn 3:16"), para evitar falsos positivos con palabras comunes.
 */
export function extractReferences(text: string): ExtractedReference[] {
  const normalized = text.toLowerCase();
  const results: ExtractedReference[] = [];

  for (const match of normalized.matchAll(REF_REGEX)) {
    const [, rawAlias, chapterStr, verseStr, verseEndStr] = match;
    const aliasKey = rawAlias.replace(/\s+/g, " ").trim();
    const code = BOOK_MAP[aliasKey];
    if (!code) continue;

    // Alias cortos sin ":versículo" → demasiado ambiguos, descartar
    const aliasLetters = aliasKey.replace(/[\s\d]/g, "");
    if (aliasLetters.length <= 3 && !verseStr) continue;

    const chapter = parseInt(chapterStr, 10);
    if (!chapter || chapter > 150) continue;

    const verseStart = verseStr ? parseInt(verseStr, 10) : undefined;
    const verseEnd = verseEndStr ? parseInt(verseEndStr, 10) : undefined;
    const bookName = USFM_TO_SPANISH[code] ?? code;

    let usfm = `${code}.${chapter}`;
    let reference = `${bookName} ${chapter}`;
    if (verseStart) {
      usfm += `.${verseStart}`;
      reference += `:${verseStart}`;
      if (verseEnd && verseEnd > verseStart) {
        usfm += `-${verseEnd}`;
        reference += `-${verseEnd}`;
      }
    }

    results.push({ usfm, book: code, bookName, chapter, verseStart, verseEnd, reference });
  }

  return results;
}
