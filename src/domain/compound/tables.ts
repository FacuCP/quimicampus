/**
 * Tablas de nomenclatura inorgánica (en español rioplatense).
 * Se cubren los casos habituales de un curso de formulación; combinaciones fuera
 * de estas tablas devuelven un error explicativo en `analyzeCompound`.
 */

/** Raíz "-uro" para binarios (elemento en su estado negativo). */
export const BINARY_ROOT: Record<string, string> = {
  F: 'fluoruro',
  Cl: 'cloruro',
  Br: 'bromuro',
  I: 'yoduro',
  O: 'óxido',
  S: 'sulfuro',
  Se: 'seleniuro',
  Te: 'telururo',
  N: 'nitruro',
  P: 'fosfuro',
  As: 'arseniuro',
  Sb: 'antimoniuro',
  C: 'carburo',
  Si: 'siliciuro',
  B: 'boruro',
  H: 'hidruro',
}

/** No metales que forman hidrácido con el hidrógeno. */
export const HYDRACID_NAME: Record<string, string> = {
  F: 'fluorhídrico',
  Cl: 'clorhídrico',
  Br: 'bromhídrico',
  I: 'yodhídrico',
  S: 'sulfhídrico',
  Se: 'selenhídrico',
  Te: 'telurhídrico',
}

/** Hidruros no metálicos volátiles con nombre común. */
export const VOLATILE_HYDRIDE: Record<string, { common: string; hydrogens: number }> = {
  N: { common: 'amoníaco', hydrogens: 3 },
  P: { common: 'fosfina', hydrogens: 3 },
  As: { common: 'arsina', hydrogens: 3 },
  Sb: { common: 'estibina', hydrogens: 3 },
  C: { common: 'metano', hydrogens: 4 },
  Si: { common: 'silano', hydrogens: 4 },
  B: { common: 'borano', hydrogens: 3 },
}

/** Adjetivos tradicionales del catión metálico con valencia variable. */
export const METAL_TRADITIONAL: Record<string, { low: number; high: number; lowName: string; highName: string }> = {
  Fe: { low: 2, high: 3, lowName: 'ferroso', highName: 'férrico' },
  Cu: { low: 1, high: 2, lowName: 'cuproso', highName: 'cúprico' },
  Hg: { low: 1, high: 2, lowName: 'mercurioso', highName: 'mercúrico' },
  Au: { low: 1, high: 3, lowName: 'auroso', highName: 'áurico' },
  Sn: { low: 2, high: 4, lowName: 'estannoso', highName: 'estánnico' },
  Pb: { low: 2, high: 4, lowName: 'plumboso', highName: 'plúmbico' },
  Pt: { low: 2, high: 4, lowName: 'platinoso', highName: 'platínico' },
  Co: { low: 2, high: 3, lowName: 'cobaltoso', highName: 'cobáltico' },
  Ni: { low: 2, high: 3, lowName: 'niqueloso', highName: 'niquélico' },
  Cr: { low: 2, high: 3, lowName: 'cromoso', highName: 'crómico' },
  Mn: { low: 2, high: 3, lowName: 'manganoso', highName: 'mangánico' },
}

export interface OxoState {
  /** Adjetivo del ácido: "ácido <acid>". */
  acid: string
  /** Nombre del anión / de la oxosal. */
  anion: string
  /** Cantidad de hidrógenos del oxoácido (sobrescribe el valor del elemento). */
  hydrogens?: number
}

export interface OxoCentral {
  /** Hidrógenos por defecto del oxoácido H(n)XO(m). */
  hydrogens: number
  /** Adjetivo "-ico" fijo para la nomenclatura de Stock del ácido. */
  systematic: string
  /** Raíz "-ato" del anión para la nomenclatura sistemática (siempre la misma). */
  systematicAnion: string
  /** Datos por número de oxidación del átomo central. */
  states: Record<number, OxoState>
}

export const OXO_CENTRAL: Record<string, OxoCentral> = {
  Cl: {
    hydrogens: 1,
    systematic: 'clórico',
    systematicAnion: 'clorato',
    states: {
      1: { acid: 'hipocloroso', anion: 'hipoclorito' },
      3: { acid: 'cloroso', anion: 'clorito' },
      5: { acid: 'clórico', anion: 'clorato' },
      7: { acid: 'perclórico', anion: 'perclorato' },
    },
  },
  Br: {
    hydrogens: 1,
    systematic: 'brómico',
    systematicAnion: 'bromato',
    states: {
      1: { acid: 'hipobromoso', anion: 'hipobromito' },
      3: { acid: 'bromoso', anion: 'bromito' },
      5: { acid: 'brómico', anion: 'bromato' },
      7: { acid: 'perbrómico', anion: 'perbromato' },
    },
  },
  I: {
    hydrogens: 1,
    systematic: 'yódico',
    systematicAnion: 'yodato',
    states: {
      1: { acid: 'hipoyodoso', anion: 'hipoyodito' },
      3: { acid: 'yodoso', anion: 'yodito' },
      5: { acid: 'yódico', anion: 'yodato' },
      7: { acid: 'peryódico', anion: 'peryodato' },
    },
  },
  S: {
    hydrogens: 2,
    systematic: 'sulfúrico',
    systematicAnion: 'sulfato',
    states: {
      2: { acid: 'hiposulfuroso', anion: 'hiposulfito' },
      4: { acid: 'sulfuroso', anion: 'sulfito' },
      6: { acid: 'sulfúrico', anion: 'sulfato' },
    },
  },
  Se: {
    hydrogens: 2,
    systematic: 'selénico',
    systematicAnion: 'seleniato',
    states: {
      4: { acid: 'selenioso', anion: 'selenito' },
      6: { acid: 'selénico', anion: 'seleniato' },
    },
  },
  Te: {
    hydrogens: 2,
    systematic: 'telúrico',
    systematicAnion: 'telurato',
    states: {
      4: { acid: 'teluroso', anion: 'telurito' },
      6: { acid: 'telúrico', anion: 'telurato' },
    },
  },
  N: {
    hydrogens: 1,
    systematic: 'nítrico',
    systematicAnion: 'nitrato',
    states: {
      3: { acid: 'nitroso', anion: 'nitrito' },
      5: { acid: 'nítrico', anion: 'nitrato' },
    },
  },
  P: {
    hydrogens: 3,
    systematic: 'fosfórico',
    systematicAnion: 'fosfato',
    states: {
      3: { acid: 'fosforoso', anion: 'fosfito' },
      5: { acid: 'fosfórico', anion: 'fosfato' },
    },
  },
  As: {
    hydrogens: 3,
    systematic: 'arsénico',
    systematicAnion: 'arseniato',
    states: {
      3: { acid: 'arsenioso', anion: 'arsenito' },
      5: { acid: 'arsénico', anion: 'arseniato' },
    },
  },
  Sb: {
    hydrogens: 3,
    systematic: 'antimónico',
    systematicAnion: 'antimoniato',
    states: {
      3: { acid: 'antimonioso', anion: 'antimonito' },
      5: { acid: 'antimónico', anion: 'antimoniato' },
    },
  },
  C: {
    hydrogens: 2,
    systematic: 'carbónico',
    systematicAnion: 'carbonato',
    states: {
      4: { acid: 'carbónico', anion: 'carbonato' },
    },
  },
  Si: {
    hydrogens: 4,
    systematic: 'silícico',
    systematicAnion: 'silicato',
    states: {
      4: { acid: 'silícico', anion: 'silicato' },
    },
  },
  B: {
    hydrogens: 3,
    systematic: 'bórico',
    systematicAnion: 'borato',
    states: {
      3: { acid: 'bórico', anion: 'borato' },
    },
  },
  Mn: {
    hydrogens: 2,
    systematic: 'mangánico',
    systematicAnion: 'manganato',
    states: {
      6: { acid: 'mangánico', anion: 'manganato', hydrogens: 2 },
      7: { acid: 'permangánico', anion: 'permanganato', hydrogens: 1 },
    },
  },
  Cr: {
    hydrogens: 2,
    systematic: 'crómico',
    systematicAnion: 'cromato',
    states: {
      6: { acid: 'crómico', anion: 'cromato', hydrogens: 2 },
    },
  },
}

const MULTIPLIERS = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa']
const COMPLEX_MULTIPLIERS = ['', '', 'bis', 'tris', 'tetrakis', 'pentakis', 'hexakis']
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

/** Prefijo multiplicativo (mono, di, tri…). `withMono` controla si se escribe "mono". */
export function multiplier(n: number, withMono = true): string {
  if (n <= 1) return withMono ? MULTIPLIERS[1] : ''
  return MULTIPLIERS[n] ?? `${n}·`
}

/** Prefijo para grupos complejos entre paréntesis (bis, tris…). */
export function complexMultiplier(n: number): string {
  if (n <= 1) return ''
  return COMPLEX_MULTIPLIERS[n] ?? `${n}·`
}

export function roman(n: number): string {
  return ROMAN[n] ?? String(n)
}
