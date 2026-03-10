// YouVersion Bible API helper
// Docs: https://developers.youversion.com/api/bibles
// Bible: Nueva Versión Internacional 2022 (NVI-S), id: 128

export const NVI_BIBLE_ID = 128;
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

/**
 * Fetch a passage from the YouVersion NVI 2022 Bible.
 * @param passageId USFM passage id, e.g. "JHN.3.16" or "PSA.23" or "PSA.23.1-3"
 * @param format  "text" (default) or "html"
 */
export async function getPassage(
  passageId: string,
  format: "text" | "html" = "text"
): Promise<YouVersionPassage> {
  const url = `${YVP_BASE_URL}/bibles/${NVI_BIBLE_ID}/passages/${encodeURIComponent(passageId)}?format=${format}`;
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
const BOOK_MAP: Record<string, string> = {
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
