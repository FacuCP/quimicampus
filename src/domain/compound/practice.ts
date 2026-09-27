/**
 * Generación de ejercicios para el modo Práctica.
 *
 * Se enumeran combinaciones de elementos + números de oxidación típicos de cada
 * familia, se las pasa por `analyzeCompound` y se conservan las que dan un
 * compuesto válido de la categoría pedida. El resultado es una lista barajada de
 * ejercicios con su fórmula y sus tres nomenclaturas (todas aceptadas como
 * respuesta correcta al nombrar).
 */

import type { Element } from '../element/Element'
import { isMetal } from '../element/Element'
import type { CompoundSelection } from './analyzeCompound'
import { analyzeCompound } from './analyzeCompound'
import { HYDRACID_NAME, OXO_CENTRAL, VOLATILE_HYDRIDE } from './tables'

export type PracticeCategory =
  | 'oxidos'
  | 'hidruros'
  | 'hidracidos'
  | 'sales-binarias'
  | 'hidroxidos'
  | 'oxoacidos'
  | 'oxosales'
  | 'sales-acidas'

export const PRACTICE_CATEGORIES: ReadonlyArray<{
  id: PracticeCategory
  label: string
}> = [
  { id: 'oxidos', label: 'Óxidos' },
  { id: 'hidruros', label: 'Hidruros' },
  { id: 'hidracidos', label: 'Hidrácidos' },
  { id: 'sales-binarias', label: 'Sales binarias' },
  { id: 'hidroxidos', label: 'Hidróxidos' },
  { id: 'oxoacidos', label: 'Oxoácidos' },
  { id: 'oxosales', label: 'Oxosales (sales ternarias)' },
  { id: 'sales-acidas', label: 'Sales ácidas' },
]

/** `family` que devuelve `analyzeCompound` → categoría de práctica. */
const FAMILY_TO_CATEGORY: Record<string, PracticeCategory> = {
  oxido: 'oxidos',
  'oxido-basico': 'oxidos',
  'oxido-acido': 'oxidos',
  peroxido: 'oxidos',
  'hidruro-metalico': 'hidruros',
  'hidruro-volatil': 'hidruros',
  hidracido: 'hidracidos',
  'sal-binaria': 'sales-binarias',
  hidroxido: 'hidroxidos',
  oxoacido: 'oxoacidos',
  oxosal: 'oxosales',
  'sal-acida': 'sales-acidas',
}

/** Valencias con las que se generan ejercicios para cada metal (curadas para el nivel). */
const METAL_VALENCES: Record<string, readonly number[]> = {
  Li: [1],
  Na: [1],
  K: [1],
  Rb: [1],
  Cs: [1],
  Ag: [1],
  Mg: [2],
  Ca: [2],
  Sr: [2],
  Ba: [2],
  Zn: [2],
  Cd: [2],
  Al: [3],
  Fe: [2, 3],
  Co: [2, 3],
  Ni: [2, 3],
  Cu: [1, 2],
  Hg: [1, 2],
  Sn: [2, 4],
  Pb: [2, 4],
  Au: [1, 3],
  Cr: [2, 3],
  Mn: [2, 3],
}

/** No metales que forman anión binario ("-uro"). */
const BINARY_NONMETALS = [
  'F',
  'Cl',
  'Br',
  'I',
  'S',
  'Se',
  'Te',
  'N',
  'P',
  'As',
  'C',
] as const

/** No metales que forman óxido no metálico (ácido). */
const OXIDE_NONMETALS = [
  'Cl',
  'Br',
  'I',
  'S',
  'Se',
  'Te',
  'N',
  'P',
  'As',
  'Sb',
  'C',
  'Si',
  'B',
] as const

export interface CompoundExercise {
  /** Fórmula en ASCII ("Fe2(SO4)3"). */
  formula: string
  familyLabel: string
  category: PracticeCategory
  /** Nomenclaturas correctas; cualquiera se acepta al nombrar. */
  names: { traditional: string; stock: string; iupac: string }
}

type Rng = () => number

function positiveStates(element: Element): number[] {
  return element.oxidationStates.filter((state) => state > 0)
}

function negativeState(element: Element): number | undefined {
  return element.oxidationStates.find((state) => state < 0)
}

/** Enumera combinaciones candidatas (elemento + nº de oxidación) para una categoría. */
function candidatesFor(
  category: PracticeCategory,
  bySymbol: Map<string, Element>,
): CompoundSelection[][] {
  const hydrogen = bySymbol.get('H')
  const oxygen = bySymbol.get('O')
  if (!hydrogen || !oxygen) return []
  const H: CompoundSelection = { element: hydrogen, oxidationState: 1 }
  const O: CompoundSelection = { element: oxygen, oxidationState: -2 }

  const metals = Object.entries(METAL_VALENCES).flatMap(([symbol, valences]) => {
    const element = bySymbol.get(symbol)
    return element ? valences.map((state) => ({ element, state })) : []
  })
  const resolve = (symbols: readonly string[]) =>
    symbols
      .map((symbol) => bySymbol.get(symbol))
      .filter((element): element is Element => element !== undefined)

  const out: CompoundSelection[][] = []

  switch (category) {
    case 'oxidos':
      for (const { element, state } of metals) {
        out.push([{ element, oxidationState: state }, O])
      }
      for (const element of resolve(OXIDE_NONMETALS)) {
        for (const state of positiveStates(element)) {
          out.push([{ element, oxidationState: state }, O])
        }
      }
      break

    case 'hidruros':
      for (const { element, state } of metals) {
        out.push([{ element, oxidationState: state }, H])
      }
      for (const element of resolve(Object.keys(VOLATILE_HYDRIDE))) {
        out.push([{ element, oxidationState: positiveStates(element)[0] ?? 3 }, H])
      }
      break

    case 'hidracidos':
      for (const element of resolve(Object.keys(HYDRACID_NAME))) {
        out.push([{ element, oxidationState: negativeState(element) ?? -1 }, H])
      }
      break

    case 'sales-binarias':
      for (const { element, state } of metals) {
        for (const nonmetal of resolve(BINARY_NONMETALS)) {
          const negative = negativeState(nonmetal)
          if (negative === undefined) continue
          out.push([
            { element, oxidationState: state },
            { element: nonmetal, oxidationState: negative },
          ])
        }
      }
      break

    case 'hidroxidos':
      for (const { element, state } of metals) {
        out.push([{ element, oxidationState: state }, O, H])
      }
      break

    case 'oxoacidos':
      for (const [symbol, central] of Object.entries(OXO_CENTRAL)) {
        const element = bySymbol.get(symbol)
        if (!element || isMetal(element)) continue
        for (const state of Object.keys(central.states)) {
          out.push([{ element, oxidationState: Number(state) }, H, O])
        }
      }
      break

    case 'oxosales':
    case 'sales-acidas':
      for (const { element, state } of metals) {
        for (const [symbol, central] of Object.entries(OXO_CENTRAL)) {
          const nonmetal = bySymbol.get(symbol)
          if (!nonmetal || isMetal(nonmetal)) continue
          for (const centralState of Object.keys(central.states)) {
            const selection: CompoundSelection[] = [
              { element, oxidationState: state },
              { element: nonmetal, oxidationState: Number(centralState) },
              O,
            ]
            if (category === 'sales-acidas') selection.push(H)
            out.push(selection)
          }
        }
      }
      break
  }

  return out
}

function shuffleInPlace<T>(items: T[], rng: Rng): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
}

/**
 * Genera hasta `count` ejercicios repartidos lo más parejo posible entre las
 * categorías elegidas. Devuelve menos si no hay suficientes combinaciones.
 */
export function generateCompoundExercises(
  elements: Element[],
  categories: PracticeCategory[],
  count: number,
  rng: Rng,
): CompoundExercise[] {
  const bySymbol = new Map(elements.map((element) => [element.symbol, element]))
  const seenFormulas = new Set<string>()
  const byCategory = new Map<PracticeCategory, CompoundExercise[]>()

  for (const category of categories) {
    const bucket: CompoundExercise[] = []
    for (const selection of candidatesFor(category, bySymbol)) {
      const result = analyzeCompound(selection)
      if (result.kind !== 'ok') continue
      if (FAMILY_TO_CATEGORY[result.family] !== category) continue
      if (seenFormulas.has(result.formula)) continue
      seenFormulas.add(result.formula)
      bucket.push({
        formula: result.formula,
        familyLabel: result.familyLabel,
        category,
        names: result.names,
      })
    }
    shuffleInPlace(bucket, rng)
    if (bucket.length > 0) byCategory.set(category, bucket)
  }

  const queues = [...byCategory.values()]
  const picked: CompoundExercise[] = []
  let index = 0
  while (picked.length < count && queues.some((queue) => queue.length > 0)) {
    const queue = queues[index % queues.length]
    const next = queue.pop()
    if (next) picked.push(next)
    index += 1
  }

  shuffleInPlace(picked, rng)
  return picked
}

const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'

/** Normaliza una fórmula escrita por el usuario para compararla (quita espacios, pasa subíndices unicode a dígitos). */
export function normalizeFormulaInput(value: string): string {
  return value
    .replace(/\s+/g, '')
    .replace(/[₀-₉]/g, (digit) => String(SUBSCRIPT_DIGITS.indexOf(digit)))
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** ¿La fórmula tipeada coincide con la del ejercicio? (sensible a mayúsculas de símbolos). */
export function isFormulaCorrect(input: string, exercise: CompoundExercise): boolean {
  const answer = normalizeFormulaInput(input)
  return answer.length > 0 && answer === normalizeFormulaInput(exercise.formula)
}

/** ¿El nombre tipeado coincide con alguna de las nomenclaturas del ejercicio? */
export function isNameCorrect(input: string, exercise: CompoundExercise): boolean {
  const answer = normalizeName(input)
  if (answer.length === 0) return false
  return Object.values(exercise.names).some((name) => {
    const full = normalizeName(name)
    const withoutParenthetical = normalizeName(name.split(' (')[0])
    return answer === full || answer === withoutParenthetical
  })
}
