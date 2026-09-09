/**
 * Configuración electrónica de un elemento a partir de su número atómico.
 *
 * Se llena según el principio de Aufbau (orden de Madelung n+l) y luego se
 * aplican las anomalías conocidas (Cr, Cu, Pd, Ag, Au, lantánidos/actínidos…),
 * expresadas como el traslado de electrones de un subnivel a otro respecto de
 * la predicción. Para elementos muy pesados sin anomalía tabulada el resultado
 * es la predicción de Aufbau y puede no coincidir con el valor experimental.
 */

const SUBSHELL_LETTER = ['s', 'p', 'd', 'f'] as const
const SUBSHELL_CAPACITY = [2, 6, 10, 14]

/** Orden de llenado (n, l) según la regla de Madelung. */
const FILL_ORDER: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [2, 0],
  [2, 1],
  [3, 0],
  [3, 1],
  [4, 0],
  [3, 2],
  [4, 1],
  [5, 0],
  [4, 2],
  [5, 1],
  [6, 0],
  [4, 3],
  [5, 2],
  [6, 1],
  [7, 0],
  [5, 3],
  [6, 2],
  [7, 1],
]

interface ElectronMove {
  readonly from: readonly [number, number]
  readonly to: readonly [number, number]
  readonly count?: number
}

/** Anomalías respecto de la predicción de Aufbau: mover `count` electrones de `from` a `to`. */
const ANOMALIES: Record<number, readonly ElectronMove[]> = {
  24: [{ from: [4, 0], to: [3, 2] }], // Cr
  29: [{ from: [4, 0], to: [3, 2] }], // Cu
  41: [{ from: [5, 0], to: [4, 2] }], // Nb
  42: [{ from: [5, 0], to: [4, 2] }], // Mo
  44: [{ from: [5, 0], to: [4, 2] }], // Ru
  45: [{ from: [5, 0], to: [4, 2] }], // Rh
  46: [{ from: [5, 0], to: [4, 2], count: 2 }], // Pd
  47: [{ from: [5, 0], to: [4, 2] }], // Ag
  57: [{ from: [4, 3], to: [5, 2] }], // La
  58: [{ from: [4, 3], to: [5, 2] }], // Ce
  64: [{ from: [4, 3], to: [5, 2] }], // Gd
  78: [{ from: [6, 0], to: [5, 2] }], // Pt
  79: [{ from: [6, 0], to: [5, 2] }], // Au
  89: [{ from: [5, 3], to: [6, 2] }], // Ac
  90: [{ from: [5, 3], to: [6, 2], count: 2 }], // Th
  91: [{ from: [5, 3], to: [6, 2] }], // Pa
  92: [{ from: [5, 3], to: [6, 2] }], // U
  93: [{ from: [5, 3], to: [6, 2] }], // Np
  96: [{ from: [5, 3], to: [6, 2] }], // Cm
  103: [{ from: [6, 2], to: [7, 1] }], // Lr
}

/** Z de cada gas noble, para la notación abreviada [Xe] 4f¹⁴ … */
const NOBLE_GASES: ReadonlyArray<readonly [number, string]> = [
  [2, 'He'],
  [10, 'Ne'],
  [18, 'Ar'],
  [36, 'Kr'],
  [54, 'Xe'],
  [86, 'Rn'],
]

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
}

function superscript(value: number): string {
  return String(value)
    .split('')
    .map((digit) => SUPERSCRIPTS[digit] ?? digit)
    .join('')
}

function key(n: number, l: number): string {
  return `${n},${l}`
}

/** Devuelve los subniveles ocupados (n, l, electrones) ordenados por (n, l). */
function occupiedSubshells(
  atomicNumber: number,
): Array<{ n: number; l: number; electrons: number }> {
  const counts = new Map<string, number>()
  let remaining = atomicNumber

  for (const [n, l] of FILL_ORDER) {
    if (remaining <= 0) break
    const electrons = Math.min(remaining, SUBSHELL_CAPACITY[l])
    counts.set(key(n, l), electrons)
    remaining -= electrons
  }

  for (const move of ANOMALIES[atomicNumber] ?? []) {
    const amount = move.count ?? 1
    const fromKey = key(move.from[0], move.from[1])
    const toKey = key(move.to[0], move.to[1])
    counts.set(fromKey, (counts.get(fromKey) ?? 0) - amount)
    counts.set(toKey, (counts.get(toKey) ?? 0) + amount)
  }

  // Se conserva el orden de llenado (regla de las diagonales): 4s antes que 3d, etc.
  return [...counts.entries()]
    .map(([entry, electrons]) => {
      const [n, l] = entry.split(',').map(Number)
      return { n, l, electrons }
    })
    .filter((subshell) => subshell.electrons > 0)
}

function render(
  subshells: Array<{ n: number; l: number; electrons: number }>,
): string {
  return subshells
    .map(
      ({ n, l, electrons }) =>
        `${n}${SUBSHELL_LETTER[l]}${superscript(electrons)}`,
    )
    .join(' ')
}

/** Configuración electrónica completa, p. ej. `"1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶"` (ordenada por n, l). */
export function electronConfiguration(atomicNumber: number): string {
  return render(occupiedSubshells(atomicNumber))
}

/** Configuración abreviada con el gas noble anterior, p. ej. `"[Ar] 3d⁶ 4s²"`. */
export function electronConfigurationShort(atomicNumber: number): string {
  const core = NOBLE_GASES.filter(([z]) => z < atomicNumber).at(-1)
  if (!core) return electronConfiguration(atomicNumber)

  const [coreZ, coreSymbol] = core
  const coreCounts = new Map(
    occupiedSubshells(coreZ).map((s) => [key(s.n, s.l), s.electrons]),
  )
  const valence = occupiedSubshells(atomicNumber)
    .map((s) => ({
      ...s,
      electrons: s.electrons - (coreCounts.get(key(s.n, s.l)) ?? 0),
    }))
    .filter((s) => s.electrons > 0)

  return `[${coreSymbol}] ${render(valence)}`.trim()
}
