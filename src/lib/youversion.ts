// YouVersion Bible API helper
// Docs: https://developers.youversion.com/api/bibles
// Versiones en español disponibles para esta API key (GET /v1/bibles?language_ranges[]=es*)

export interface BibleVersion {
  id: number;
  key: string;          // clave corta usada en la app y en la URL (?version=)
  abbreviation: string; // abreviatura mostrada en la UI
  name: string;
  available: boolean;   // false = requiere aprobación del publisher en YouVersion
}

export const BIBLE_VERSIONS: Record<string, BibleVersion> = {
  nvi:  { id: 128, key: "nvi",  abbreviation: "NVI",  name: "Nueva Versión Internacional", available: true },
  nbla: { id: 103, key: "nbla", abbreviation: "NBLA", name: "Nueva Biblia de las Américas", available: true },
  lbla: { id: 89,  key: "lbla", abbreviation: "LBLA", name: "La Biblia de las Américas", available: true },
  rva:  { id: 147, key: "rva",  abbreviation: "RVA",  name: "Reina-Valera Antigua", available: true },
  // NTV (Tyndale) disponible vía scraping en getScrapedNtvPassage
  ntv:  { id: 127, key: "ntv",  abbreviation: "NTV",  name: "Nueva Traducción Viviente", available: true },
};

export const DEFAULT_VERSION = "nvi";

/** Resuelve una clave de versión (?version=) a una versión disponible; NVI por defecto. */
export function resolveVersion(key?: string | null): BibleVersion {
  const v = key ? BIBLE_VERSIONS[key.toLowerCase()] : undefined;
  return v && v.available ? v : BIBLE_VERSIONS[DEFAULT_VERSION];
}

// Compatibilidad con código existente
export const NVI_BIBLE_ID = BIBLE_VERSIONS.nvi.id;
export const NVI_NAME = "Nueva Versión Internacional (NVI) 2022";

const YVP_BASE_URL = "https://api.youversion.com/v1";

function getApiKey(): string {
  const key = process.env.YOUVERSION_API_KEY;
  if (!key) throw new Error("YOUVERSION_API_KEY not set");
  return key;
}

export interface YouVersionPassage {
  id: string;       // USFM id e.g. "JHN.3.16"
  content: string;  // Verse text (plain text when format=text)
  reference: string; // Human-readable e.g. "Juan 3:16"
}

/** Scrap de versículos de NTV de YouVersion cuando no están disponibles por API oficial */
export async function getScrapedNtvPassage(passageId: string): Promise<YouVersionPassage> {
  const url = `https://www.bible.com/es/bible/127/${passageId}.NTV`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    },
    next: { revalidate: 3600 } // Caché de 1 hora
  });
  if (!res.ok) {
    throw new Error(`Scraper HTTP error ${res.status}`);
  }
  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  if (!match) {
    throw new Error("NEXT_DATA not found in YouVersion page");
  }
  const data = JSON.parse(match[1]);
  const verseObj = data?.props?.pageProps?.verses?.[0];
  if (!verseObj) {
    throw new Error("Verse content not found in NEXT_DATA");
  }
  return {
    id: passageId,
    content: verseObj.content,
    reference: verseObj.reference?.human || passageId
  };
}

/**
 * Fetch a passage from a YouVersion Bible.
 * @param passageId USFM passage id, e.g. "JHN.3.16" or "PSA.23" or "PSA.23.1-3"
 * @param format  "text" (default) or "html"
 * @param version clave de BIBLE_VERSIONS (default "nvi")
 */
export async function getPassage(
  passageId: string,
  format: "text" | "html" = "text",
  version: string = DEFAULT_VERSION
): Promise<YouVersionPassage> {
  const bible = resolveVersion(version);

  if (bible.key === "ntv") {
    try {
      return await getScrapedNtvPassage(passageId);
    } catch (scrapeErr) {
      console.warn("NTV Scraping failed, falling back to NVI via official API:", scrapeErr);
      return getPassage(passageId, format, DEFAULT_VERSION);
    }
  }

  const url = `${YVP_BASE_URL}/bibles/${bible.id}/passages/${encodeURIComponent(passageId)}?format=${format}`;
  const res = await fetch(url, {
    headers: { "X-YVP-App-Key": getApiKey() },
    next: { revalidate: 3600 }, // Cache 1 hour at Next.js level
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouVersion API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<YouVersionPassage>;
}

// ---------------------------------------------------------------------------
// Spanish book name → USFM 3-letter code
// Covers all 66 canonical books + common abbreviations used in Spanish
// ---------------------------------------------------------------------------
export const BOOK_MAP: Record<string, string> = {
  // Pentateuco
  "génesis": "GEN", "genesis": "GEN", "gén": "GEN", "gen": "GEN",
  "éxodo": "EXO", "exodo": "EXO", "éx": "EXO", "ex": "EXO",
  "levítico": "LEV", "levitico": "LEV", "lev": "LEV",
  "números": "NUM", "numeros": "NUM", "núm": "NUM", "num": "NUM",
  "deuteronomio": "DEU", "deut": "DEU", "deu": "DEU",
  // Históricos
  "josué": "JOS", "josue": "JOS", "jos": "JOS",
  "jueces": "JDG", "jue": "JDG",
  "rut": "RUT", "rt": "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1sa": "1SA", "1s": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2sa": "2SA", "2s": "2SA",
  "1 reyes": "1KI", "1reyes": "1KI", "1re": "1KI", "1r": "1KI",
  "2 reyes": "2KI", "2reyes": "2KI", "2re": "2KI", "2r": "2KI",
  "1 crónicas": "1CH", "1 cronicas": "1CH", "1crónicas": "1CH", "1cronicas": "1CH", "1cr": "1CH",
  "2 crónicas": "2CH", "2 cronicas": "2CH", "2crónicas": "2CH", "2cronicas": "2CH", "2cr": "2CH",
  "esdras": "EZR", "esd": "EZR",
  "nehemías": "NEH", "nehemias": "NEH", "neh": "NEH",
  "ester": "EST", "est": "EST",
  // Poéticos
  "job": "JOB",
  "salmos": "PSA", "salmo": "PSA", "sal": "PSA", "ps": "PSA", "psa": "PSA",
  "proverbios": "PRO", "prov": "PRO", "pro": "PRO", "pr": "PRO",
  "eclesiastés": "ECC", "eclesiastes": "ECC", "ecl": "ECC",
  "cantares": "SNG", "cantardeloscantares": "SNG", "cantar": "SNG", "cnt": "SNG",
  // Profetas mayores
  "isaías": "ISA", "isaias": "ISA", "is": "ISA", "isa": "ISA",
  "jeremías": "JER", "jeremias": "JER", "jer": "JER",
  "lamentaciones": "LAM", "lam": "LAM",
  "ezequiel": "EZK", "eze": "EZK", "ez": "EZK",
  "daniel": "DAN", "dan": "DAN", "dn": "DAN",
  // Profetas menores
  "oseas": "HOS", "os": "HOS",
  "joel": "JOL", "jl": "JOL",
  "amós": "AMO", "amos": "AMO", "am": "AMO",
  "abdías": "OBA", "abdias": "OBA", "abd": "OBA",
  "jonás": "JON", "jonas": "JON", "jon": "JON",
  "miqueas": "MIC", "miq": "MIC", "mic": "MIC",
  "nahúm": "NAM", "nahum": "NAM", "nah": "NAM",
  "habacuc": "HAB", "hab": "HAB",
  "sofonías": "ZEP", "sofonias": "ZEP", "sof": "ZEP",
  "hageo": "HAG", "hag": "HAG",
  "zacarías": "ZEC", "zacarias": "ZEC", "zac": "ZEC",
  "malaquías": "MAL", "malaquias": "MAL", "mal": "MAL",
  // Evangelios
  "mateo": "MAT", "mt": "MAT", "mat": "MAT",
  "marcos": "MRK", "mr": "MRK", "mc": "MRK", "mrk": "MRK",
  "lucas": "LUK", "lc": "LUK", "luk": "LUK",
  "juan": "JHN", "jn": "JHN", "jhn": "JHN",
  // Hechos y epístolas
  "hechos": "ACT", "act": "ACT", "hch": "ACT",
  "romanos": "ROM", "rom": "ROM", "ro": "ROM",
  "1 corintios": "1CO", "1corintios": "1CO", "1co": "1CO", "1cor": "1CO",
  "2 corintios": "2CO", "2corintios": "2CO", "2co": "2CO", "2cor": "2CO",
  "gálatas": "GAL", "galatas": "GAL", "gal": "GAL",
  "efesios": "EPH", "ef": "EPH", "efe": "EPH", "eph": "EPH",
  "filipenses": "PHP", "fil": "PHP", "php": "PHP",
  "colosenses": "COL", "col": "COL",
  "1 tesalonicenses": "1TH", "1tesalonicenses": "1TH", "1ts": "1TH", "1tes": "1TH",
  "2 tesalonicenses": "2TH", "2tesalonicenses": "2TH", "2ts": "2TH", "2tes": "2TH",
  "1 timoteo": "1TI", "1timoteo": "1TI", "1ti": "1TI", "1tm": "1TI",
  "2 timoteo": "2TI", "2timoteo": "2TI", "2ti": "2TI", "2tm": "2TI",
  "tito": "TIT", "tit": "TIT",
  "filemón": "PHM", "filemon": "PHM", "flm": "PHM",
  "hebreos": "HEB", "heb": "HEB",
  "santiago": "JAS", "stg": "JAS", "jas": "JAS",
  "1 pedro": "1PE", "1pedro": "1PE", "1pe": "1PE", "1p": "1PE",
  "2 pedro": "2PE", "2pedro": "2PE", "2pe": "2PE", "2p": "2PE",
  "1 juan": "1JN", "1juan": "1JN", "1jn": "1JN", "1jn.": "1JN",
  "2 juan": "2JN", "2juan": "2JN", "2jn": "2JN",
  "3 juan": "3JN", "3juan": "3JN", "3jn": "3JN",
  "judas": "JUD", "jud": "JUD",
  "apocalipsis": "REV", "ap": "REV", "apo": "REV", "rev": "REV",
};

/**
 * Convert a Spanish Bible reference to USFM passage id.
 * Supports:
 *  - "Juan 3:16"       → "JHN.3.16"
 *  - "Salmos 23:1-3"   → "PSA.23.1-3"
 *  - "Génesis 1"       → "GEN.1"
 *  - "Salmo 23"        → "PSA.23"
 *  - "1 Juan 3:16"     → "1JN.3.16"
 *
 * Returns null if the reference cannot be parsed.
 */
export function parseReferenceToUSFM(reference: string): string | null {
  // Normalize: remove extra spaces, lowercase
  const normalized = reference.trim().toLowerCase().replace(/\s+/g, " ");

  // Match pattern: (optional number prefix) book_name chapter(:verse(-endverse)?)?
  // e.g. "1 juan 3:16", "salmos 23:1-3", "génesis 1"
  const match = normalized.match(
    /^(\d\s)?([a-záéíóúüñ]+(?:\s[a-záéíóúüñ]+)*)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/
  );

  if (!match) return null;

  const [, numPrefix, bookName, chapter, startVerse, endVerse] = match;

  // Build the lookup key
  const bookKey = numPrefix
    ? `${numPrefix.trim()} ${bookName}`.replace(/\s+/g, " ")
    : bookName;

  const usfmCode = BOOK_MAP[bookKey] ?? BOOK_MAP[bookName];
  if (!usfmCode) return null;

  if (startVerse) {
    if (endVerse) {
      return `${usfmCode}.${chapter}.${startVerse}-${endVerse}`;
    }
    return `${usfmCode}.${chapter}.${startVerse}`;
  }

  return `${usfmCode}.${chapter}`;
}

/**
 * Escanea el contenido de un texto (HTML) en busca de menciones de citas bíblicas.
 * Si encuentra citas válidas que no estén ya dentro de una cita blockquote,
 * consulta el texto del versículo por API/scraping y lo concatena al final del contenido.
 */
export async function autoLinkBibleVerses(content: string): Promise<string> {
  if (!content) return content;

  // Regex para encontrar referencias en formato "Libro Capitulo:Versiculo(-VersiculoFinal)?"
  const regex = /(?:[123]\s+)?(?:génesis|genesis|gén|gen|éxodo|exodo|éx|ex|levítico|levitico|lev|números|numeros|núm|num|deuteronomio|deut|deu|josué|josue|jos|jueces|jue|rut|rt|samuel|sam|sa|s|reyes|rey|re|r|crónicas|cronicas|cr|esdras|esd|nehemías|nehemias|neh|ester|est|job|salmos|salmo|sal|ps|psa|proverbios|prov|pro|pr|eclesiastés|eclesiastes|ecl|cantares|cantardeloscantares|cantar|cnt|isaías|isaias|is|isa|jeremías|jeremias|jer|lamentaciones|lam|ezequiel|eze|ez|daniel|dan|dn|oseas|os|joel|jl|amós|amos|am|abdías|abdias|abd|jonás|jonas|jon|miqueas|miq|mic|nahúm|nahum|nah|habacuc|hab|sofonías|sofonias|sof|hageo|hag|zacarías|zacarias|zac|malaquías|malaquias|mal|mateo|mt|mat|marcos|mr|mc|mrk|lucas|lc|luk|juan|jn|jhn|hechos|act|hch|romanos|rom|ro|corintios|co|cor|gálatas|gal|efesios|ef|efe|eph|filipenses|fil|php|colosenses|col|tesalonicenses|ts|tes|timoteo|ti|tm|tito|tit|filemón|filemon|flm|hebreos|heb|santiago|stg|jas|pedro|pe|p|judas|jud|apocalipsis|ap|apo|rev)\s+\d+:\d+(?:-\d+)?/gi;

  // Limpiar etiquetas HTML temporales para hacer el match de forma limpia
  const cleanText = content.replace(/<[^>]*>/g, " ");
  const matches = cleanText.match(regex);
  if (!matches) return content;

  // Eliminar duplicados
  const uniqueRefs = Array.from(new Set(matches.map(m => m.trim().toLowerCase())));
  
  let appendedBlocks = "";

  for (const ref of uniqueRefs) {
    // Si la referencia ya está dentro de un blockquote (ej: en una edición previa), no volver a adjuntarla
    const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const insideBlockquoteRegex = new RegExp(`<blockquote[^>]*>[\\s\\S]*?${escapedRef}[\\s\\S]*?<\/blockquote>`, "i");
    if (insideBlockquoteRegex.test(content)) {
      continue;
    }

    try {
      const usfm = parseReferenceToUSFM(ref);
      if (usfm) {
        // Consultar pasaje (por defecto NVI)
        const passage = await getPassage(usfm, "text", "nvi");
        if (passage && passage.content) {
          appendedBlocks += `<blockquote class="border-l-4 border-selapp-accent pl-4 italic my-3 text-selapp-brown-light bg-selapp-beige/30 py-2 rounded-r"><strong>${passage.reference} (NVI):</strong> ${passage.content}</blockquote>`;
        }
      }
    } catch (err) {
      console.warn(`[AutoLink] Error consultando versículo para "${ref}":`, err);
    }
  }

  return content + appendedBlocks;
}
