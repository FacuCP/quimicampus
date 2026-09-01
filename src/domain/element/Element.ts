export type ElementCategory =
  | 'no-metal'
  | 'gas-noble'
  | 'metal-alcalino'
  | 'metal-alcalinoterreo'
  | 'metaloide'
  | 'halogeno'
  | 'metal-de-transicion'
  | 'metal-del-bloque-p'
  | 'lantanido'
  | 'actinido'
  | 'desconocido'

export interface Element {
  /** Número atómico (Z). */
  readonly atomicNumber: number
  /** Símbolo químico, p. ej. "He". */
  readonly symbol: string
  /** Nombre en español. */
  readonly name: string
  /** Masa atómica estándar (u). */
  readonly atomicMass: number
  readonly category: ElementCategory
  /** Período (fila) al que pertenece el elemento. */
  readonly period: number
  /** Grupo (columna) IUPAC 1..18, o null para lantánidos/actínidos. */
  readonly group: number | null
  /** Columna en la grilla visual (1..18). */
  readonly xpos: number
  /** Fila en la grilla visual (1..7 tabla principal, 9..10 lantánidos/actínidos). */
  readonly ypos: number
  /** Electronegatividad de Pauling, o null si no está definida (p. ej. gases nobles ligeros). */
  readonly electronegativity: number | null
  /** Números de oxidación más habituales, de menor a mayor. Vacío si no hay datos. */
  readonly oxidationStates: readonly number[]
}

const METAL_CATEGORIES: ReadonlySet<ElementCategory> = new Set([
  'metal-alcalino',
  'metal-alcalinoterreo',
  'metal-de-transicion',
  'metal-del-bloque-p',
  'lantanido',
  'actinido',
])

/** Un elemento cuenta como metal a los fines de la formulación química. */
export function isMetal(element: Element): boolean {
  return METAL_CATEGORIES.has(element.category)
}

const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'no-metal': 'No metal',
  'gas-noble': 'Gas noble',
  'metal-alcalino': 'Metal alcalino',
  'metal-alcalinoterreo': 'Metal alcalinotérreo',
  metaloide: 'Metaloide',
  halogeno: 'Halógeno',
  'metal-de-transicion': 'Metal de transición',
  'metal-del-bloque-p': 'Metal del bloque p',
  lantanido: 'Lantánido',
  actinido: 'Actínido',
  desconocido: 'Desconocido',
}

export function categoryLabel(category: ElementCategory): string {
  return CATEGORY_LABELS[category]
}
