import type { Element } from '../element/Element'
import { isMetal } from '../element/Element'
import type { OxoCentral, OxoState } from './tables'
import {
  BINARY_ROOT,
  HYDRACID_NAME,
  METAL_TRADITIONAL,
  OXO_CENTRAL,
  VOLATILE_HYDRIDE,
  complexMultiplier,
  multiplier,
  roman,
} from './tables'

export interface CompoundSelection {
  element: Element
  /** Número de oxidación elegido por el usuario. */
  oxidationState: number
}

export interface CompoundNames {
  /** Nomenclatura tradicional / clásica. */
  traditional: string
  /** Nomenclatura de Stock. */
  stock: string
  /** Nomenclatura IUPAC (sistemática / de composición). */
  iupac: string
}

export interface CompoundResult {
  kind: 'ok'
  family: string
  familyLabel: string
  /** Fórmula en ASCII; los dígitos se muestran como subíndices en la UI. */
  formula: string
  names: CompoundNames
  /** Cómo se combinan los elementos (roles, electronegatividad). */
  explanation: string
  /** Aclaración cuando la nomenclatura es aproximada o admite variantes. */
  note?: string
}

export interface CompoundError {
  kind: 'error'
  error: string
}

export type CompoundAnalysis = CompoundResult | CompoundError

// --- helpers -----------------------------------------------------------------

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

/** Cruce de cargas simplificado: cuántos cationes y aniones por fórmula unidad. */
function crissCross(cationCharge: number, anionCharge: number) {
  const divisor = gcd(cationCharge, anionCharge)
  return { cation: anionCharge / divisor, anion: cationCharge / divisor }
}

/** Subíndice: se omite cuando vale 1. */
function sub(n: number): string {
  return n > 1 ? String(n) : ''
}

function lower(element: Element): string {
  return element.name.toLowerCase()
}

function isVariableValence(element: Element): boolean {
  return element.oxidationStates.length > 1
}

function stockSuffix(element: Element, state: number): string {
  return isVariableValence(element) ? `(${roman(state)})` : ''
}

/** Adjetivo tradicional del catión ("férrico") o "" si no aplica. */
function metalTraditionalAdjective(element: Element, state: number): string {
  const entry = METAL_TRADITIONAL[element.symbol]
  if (!entry) return ''
  if (state === entry.low) return entry.lowName
  if (state === entry.high) return entry.highName
  return ''
}

/** "<base> férrico" o, si no hay adjetivo, "<base> de hierro". */
function withMetalName(base: string, element: Element, state: number): string {
  const adjective = metalTraditionalAdjective(element, state)
  return adjective ? `${base} ${adjective}` : `${base} de ${lower(element)}`
}

/** Prefijo de atomicidad del primer elemento ("di" en "trióxido de dioro"); sin "mono". */
function metalPrefix(count: number): string {
  return multiplier(count, false)
}

const BI_ANION: Record<string, string> = {
  carbonato: 'bicarbonato',
  sulfato: 'bisulfato',
  sulfito: 'bisulfito',
}

// --- entry point -----------------------------------------------------------

/** Corrige la elisión de vocales en los prefijos ("monoóxido" → "monóxido", "pentaóxido" → "pentóxido"). */
function fixSpelling(name: string): string {
  return name
    .replace(/oó/g, 'ó')
    .replace(/oo/g, 'o')
    .replace(/(tetr|pent|hex|hept|oct)aóxido/g, '$1óxido')
}

export function analyzeCompound(
  selections: CompoundSelection[],
): CompoundAnalysis {
  const result = classifyCompound(selections)
  if (result.kind === 'ok') {
    result.names = {
      traditional: fixSpelling(result.names.traditional),
      stock: fixSpelling(result.names.stock),
      iupac: fixSpelling(result.names.iupac),
    }
  }
  return result
}

function classifyCompound(
  selections: CompoundSelection[],
): CompoundAnalysis {
  if (selections.length < 2) {
    return { kind: 'error', error: 'Elegí al menos dos elementos.' }
  }
  if (selections.length > 4) {
    return { kind: 'error', error: 'El máximo es de cuatro elementos.' }
  }

  const symbols = selections.map((s) => s.element.symbol)
  if (new Set(symbols).size !== symbols.length) {
    return { kind: 'error', error: 'No repitas el mismo elemento.' }
  }
  if (selections.some((s) => s.element.category === 'gas-noble')) {
    return { kind: 'error', error: 'Los gases nobles no forman estos compuestos.' }
  }
  if (selections.some((s) => !Number.isFinite(s.oxidationState))) {
    return {
      kind: 'error',
      error: 'Elegí un número de oxidación para cada elemento.',
    }
  }

  const hydrogen = selections.find((s) => s.element.symbol === 'H')
  const oxygen = selections.find((s) => s.element.symbol === 'O')
  const rest = selections.filter(
    (s) => s.element.symbol !== 'H' && s.element.symbol !== 'O',
  )
  const metals = rest.filter((s) => isMetal(s.element))
  const nonmetals = rest.filter((s) => !isMetal(s.element))
  const hasH = hydrogen !== undefined
  const hasO = oxygen !== undefined

  // Agua / agua oxigenada
  if (hasH && hasO && rest.length === 0) {
    return water(oxygen as CompoundSelection)
  }

  // Binarios con oxígeno
  if (hasO && !hasH && rest.length === 1) {
    return metals.length === 1
      ? metalOxide(metals[0], oxygen as CompoundSelection)
      : acidOxide(nonmetals[0])
  }

  // Binarios con hidrógeno
  if (hasH && !hasO && rest.length === 1) {
    if (metals.length === 1) return metalHydride(metals[0])
    return nonmetalHydride(nonmetals[0])
  }

  // Sal binaria
  if (!hasH && !hasO && metals.length === 1 && nonmetals.length === 1) {
    return binarySalt(metals[0], nonmetals[0])
  }

  // Binario covalente (dos no metales)
  if (!hasH && !hasO && metals.length === 0 && nonmetals.length === 2) {
    return covalentBinary(nonmetals[0], nonmetals[1])
  }

  // Ternarios y cuaternarios con oxígeno
  if (hasO && hasH && metals.length === 1 && nonmetals.length === 0) {
    return hydroxide(metals[0])
  }
  if (hasO && hasH && metals.length === 0 && nonmetals.length === 1) {
    return oxoacid(nonmetals[0])
  }
  if (hasO && !hasH && metals.length === 1 && nonmetals.length === 1) {
    return oxosalt(metals[0], nonmetals[0])
  }
  if (hasO && hasH && metals.length === 1 && nonmetals.length === 1) {
    return acidSalt(metals[0], nonmetals[0])
  }

  return {
    kind: 'error',
    error: 'No reconozco un compuesto habitual para esa combinación de elementos.',
  }
}

// --- familias --------------------------------------------------------------

function requirePositive(sel: CompoundSelection): CompoundError | null {
  if (sel.oxidationState <= 0) {
    return {
      kind: 'error',
      error: `Elegí un número de oxidación positivo para ${sel.element.name}.`,
    }
  }
  return null
}

function water(oxygen: CompoundSelection): CompoundAnalysis {
  if (oxygen.oxidationState === -1) {
    return {
      kind: 'ok',
      family: 'peroxido',
      familyLabel: 'Peróxido',
      formula: 'H2O2',
      names: {
        traditional: 'peróxido de hidrógeno (agua oxigenada)',
        stock: 'peróxido de hidrógeno',
        iupac: 'peróxido de hidrógeno',
      },
      explanation:
        'El oxígeno actúa con −1 (ion peróxido O₂²⁻) y el hidrógeno con +1.',
    }
  }
  return {
    kind: 'ok',
    family: 'oxido',
    familyLabel: 'Óxido',
    formula: 'H2O',
    names: {
      traditional: 'agua',
      stock: 'óxido de hidrógeno',
      iupac: 'óxido de dihidrógeno',
    },
    explanation: 'Hidrógeno (+1) y oxígeno (−2).',
  }
}

function metalOxide(
  metal: CompoundSelection,
  oxygen: CompoundSelection,
): CompoundAnalysis {
  const invalid = requirePositive(metal)
  if (invalid) return invalid
  const m = metal.element
  const s = metal.oxidationState

  if (oxygen.oxidationState === -1) {
    const { cation, anion } = crissCross(s, 2)
    return {
      kind: 'ok',
      family: 'peroxido',
      familyLabel: 'Peróxido',
      formula: `${m.symbol}${sub(cation)}O${sub(anion * 2)}`,
      names: {
        traditional: `peróxido de ${lower(m)}`,
        stock: `peróxido de ${lower(m)}${stockSuffix(m, s)}`,
        iupac: `peróxido de ${lower(m)}`,
      },
      explanation: `${m.name} (+${s}) con el ion peróxido O₂²⁻ (oxígeno −1).`,
    }
  }

  const { cation, anion } = crissCross(s, 2)
  return {
    kind: 'ok',
    family: 'oxido-basico',
    familyLabel: 'Óxido metálico (básico)',
    formula: `${m.symbol}${sub(cation)}O${sub(anion)}`,
    names: {
      traditional: withMetalName('óxido', m, s),
      stock: `óxido de ${lower(m)}${stockSuffix(m, s)}`,
      iupac: `${multiplier(anion)}óxido de ${metalPrefix(cation)}${lower(m)}`,
    },
    explanation: `${m.name} cede electrones (+${s}) al oxígeno (−2): óxido metálico de carácter básico.`,
  }
}

function acidOxide(nonmetal: CompoundSelection): CompoundAnalysis {
  const invalid = requirePositive(nonmetal)
  if (invalid) return invalid
  const x = nonmetal.element
  const s = nonmetal.oxidationState
  const { cation, anion } = crissCross(s, 2)
  const central = OXO_CENTRAL[x.symbol]
  const acid = central?.states[s]?.acid
  return {
    kind: 'ok',
    family: 'oxido-acido',
    familyLabel: 'Óxido no metálico (ácido)',
    formula: `${x.symbol}${sub(cation)}O${sub(anion)}`,
    names: {
      traditional: acid ? `óxido ${acid}` : `óxido de ${lower(x)}`,
      stock: `óxido de ${lower(x)}(${roman(s)})`,
      iupac: `${multiplier(anion)}óxido de ${metalPrefix(cation)}${lower(x)}`,
    },
    note: acid
      ? undefined
      : `No tengo el nombre tradicional para ${x.name} con +${s}.`,
    explanation: `${x.name} (+${s}) frente al oxígeno (−2): óxido no metálico de carácter ácido.`,
  }
}

function metalHydride(metal: CompoundSelection): CompoundAnalysis {
  const invalid = requirePositive(metal)
  if (invalid) return invalid
  const m = metal.element
  const s = metal.oxidationState
  return {
    kind: 'ok',
    family: 'hidruro-metalico',
    familyLabel: 'Hidruro metálico',
    formula: `${m.symbol}H${sub(s)}`,
    names: {
      traditional: withMetalName('hidruro', m, s),
      stock: `hidruro de ${lower(m)}${stockSuffix(m, s)}`,
      iupac: `${multiplier(s)}hidruro de ${lower(m)}`,
    },
    explanation: `${m.name} (+${s}) con hidrógeno (−1).`,
  }
}

function nonmetalHydride(nonmetal: CompoundSelection): CompoundAnalysis {
  const x = nonmetal.element

  const hydracid = HYDRACID_NAME[x.symbol]
  if (hydracid) {
    const negative = x.oxidationStates.find((v) => v < 0)
    const hydrogens = negative ? -negative : x.symbol === 'S' ? 2 : 1
    const root = BINARY_ROOT[x.symbol] ?? `${lower(x)}uro`
    return {
      kind: 'ok',
      family: 'hidracido',
      familyLabel: 'Hidrácido',
      formula: `H${sub(hydrogens)}${x.symbol}`,
      names: {
        traditional: `ácido ${hydracid}`,
        stock: `${root} de hidrógeno`,
        iupac: `${root} de hidrógeno`,
      },
      note: 'El nombre "ácido …hídrico" corresponde a la disolución acuosa; la sustancia pura es "… de hidrógeno".',
      explanation: `${x.name} es más electronegativo que el hidrógeno, así que actúa con carga negativa.`,
    }
  }

  const volatile = VOLATILE_HYDRIDE[x.symbol]
  if (volatile) {
    return {
      kind: 'ok',
      family: 'hidruro-volatil',
      familyLabel: 'Hidruro no metálico',
      formula: `${x.symbol}H${sub(volatile.hydrogens)}`,
      names: {
        traditional: volatile.common,
        stock: `${multiplier(volatile.hydrogens)}hidruro de ${lower(x)}`,
        iupac: `${multiplier(volatile.hydrogens)}hidruro de ${lower(x)}`,
      },
      explanation: `Hidruro molecular de ${x.name}; su nombre común es "${volatile.common}".`,
    }
  }

  return {
    kind: 'error',
    error: `No tengo un nombre habitual para el hidruro de ${x.name}.`,
  }
}

function binarySalt(
  metal: CompoundSelection,
  nonmetal: CompoundSelection,
): CompoundAnalysis {
  const invalid = requirePositive(metal)
  if (invalid) return invalid
  const m = metal.element
  const x = nonmetal.element
  const ms = metal.oxidationState

  let negative = nonmetal.oxidationState
  if (negative >= 0) {
    const fallback = x.oxidationStates.find((v) => v < 0)
    if (fallback === undefined) {
      return {
        kind: 'error',
        error: `Elegí un número de oxidación negativo para ${x.name}.`,
      }
    }
    negative = fallback
  }
  const anionCharge = -negative
  const { cation, anion } = crissCross(ms, anionCharge)
  const root = BINARY_ROOT[x.symbol] ?? `${lower(x)}uro`
  return {
    kind: 'ok',
    family: 'sal-binaria',
    familyLabel: 'Sal binaria (sal neutra)',
    formula: `${m.symbol}${sub(cation)}${x.symbol}${sub(anion)}`,
    names: {
      traditional: withMetalName(root, m, ms),
      stock: `${root} de ${lower(m)}${stockSuffix(m, ms)}`,
      iupac: `${multiplier(anion)}${root} de ${metalPrefix(cation)}${lower(m)}`,
    },
    explanation: `${m.name} (+${ms}) con ${x.name} (${negative}).`,
  }
}

function covalentBinary(
  first: CompoundSelection,
  second: CompoundSelection,
): CompoundAnalysis {
  const enFirst = first.element.electronegativity ?? 0
  const enSecond = second.element.electronegativity ?? 0
  const positive = enFirst <= enSecond ? first : second
  const negative = positive === first ? second : first

  const positiveState =
    positive.oxidationState > 0
      ? positive.oxidationState
      : positive.element.oxidationStates.find((v) => v > 0)
  let negativeState = negative.oxidationState
  if (negativeState >= 0) {
    negativeState =
      negative.element.oxidationStates.find((v) => v < 0) ?? negativeState
  }
  if (!positiveState || negativeState >= 0) {
    return {
      kind: 'error',
      error: `No pude asignar números de oxidación compatibles a ${first.element.name} y ${second.element.name}.`,
    }
  }

  const { cation, anion } = crissCross(positiveState, -negativeState)
  const p = positive.element
  const n = negative.element
  const root = BINARY_ROOT[n.symbol] ?? `${lower(n)}uro`
  const anionPrefix = multiplier(anion)
  const positivePrefix = metalPrefix(cation)
  return {
    kind: 'ok',
    family: 'binario-covalente',
    familyLabel: 'Compuesto binario entre no metales',
    formula: `${p.symbol}${sub(cation)}${n.symbol}${sub(anion)}`,
    names: {
      traditional: `${anionPrefix}${root} de ${positivePrefix}${lower(p)}`,
      stock: `${root} de ${lower(p)}(${roman(positiveState)})`,
      iupac: `${anionPrefix}${root} de ${positivePrefix}${lower(p)}`,
    },
    note: 'Los compuestos entre dos no metales se nombran con la nomenclatura sistemática (prefijos).',
    explanation: `${n.name} (EN ${enNumber(n)}) es más electronegativo que ${p.name} (EN ${enNumber(p)}), así que ${p.name} actúa con carga positiva.`,
  }
}

function enNumber(element: Element): string {
  return element.electronegativity === null
    ? 'sin dato'
    : String(element.electronegativity)
}

function hydroxide(metal: CompoundSelection): CompoundAnalysis {
  const invalid = requirePositive(metal)
  if (invalid) return invalid
  const m = metal.element
  const s = metal.oxidationState
  const { anion } = crissCross(s, 1)
  const formula = anion > 1 ? `${m.symbol}(OH)${anion}` : `${m.symbol}OH`
  return {
    kind: 'ok',
    family: 'hidroxido',
    familyLabel: 'Hidróxido',
    formula,
    names: {
      traditional: withMetalName('hidróxido', m, s),
      stock: `hidróxido de ${lower(m)}${stockSuffix(m, s)}`,
      iupac: `${anion > 1 ? multiplier(anion, false) : ''}hidróxido de ${lower(m)}`,
    },
    explanation: `${m.name} (+${s}) con el ion hidróxido OH⁻.`,
  }
}

interface OxoData {
  hydrogens: number
  oxygens: number
  central: OxoCentral
  state: OxoState
}

function resolveOxo(
  nonmetal: CompoundSelection,
): OxoData | CompoundError {
  const x = nonmetal.element
  const s = nonmetal.oxidationState
  const central = OXO_CENTRAL[x.symbol]
  if (!central) {
    return { kind: 'error', error: `No tengo datos de oxoácidos para ${x.name}.` }
  }
  const state = central.states[s]
  if (!state) {
    const options = Object.keys(central.states).join(', ')
    return {
      kind: 'error',
      error: `${x.name} no forma un oxoácido habitual con +${s}. Probá con: ${options}.`,
    }
  }
  const hydrogens = state.hydrogens ?? central.hydrogens
  const oxygens = (hydrogens + s) / 2
  if (!Number.isInteger(oxygens) || oxygens <= 0) {
    return {
      kind: 'error',
      error: `La combinación no da un oxoácido válido (oxígenos = ${oxygens}).`,
    }
  }
  return { hydrogens, oxygens, central, state }
}

function isOxoError(value: OxoData | CompoundError): value is CompoundError {
  return (value as CompoundError).kind === 'error'
}

function oxoacid(nonmetal: CompoundSelection): CompoundAnalysis {
  const invalid = requirePositive(nonmetal)
  if (invalid) return invalid
  const resolved = resolveOxo(nonmetal)
  if (isOxoError(resolved)) return resolved
  const x = nonmetal.element
  const s = nonmetal.oxidationState
  const { hydrogens, oxygens, central, state } = resolved
  return {
    kind: 'ok',
    family: 'oxoacido',
    familyLabel: 'Oxoácido',
    formula: `H${sub(hydrogens)}${x.symbol}O${sub(oxygens)}`,
    names: {
      traditional: `ácido ${state.acid}`,
      stock: `ácido ${central.systematic}(${roman(s)})`,
      iupac: `${state.anion} de hidrógeno`,
    },
    note: 'La nomenclatura IUPAC de oxoácidos admite variantes según el texto; se muestra la forma de composición ("… de hidrógeno").',
    explanation: `Hidrógeno (+1), ${x.name} (+${s}) y oxígeno (−2).`,
  }
}

function oxosalt(
  metal: CompoundSelection,
  nonmetal: CompoundSelection,
): CompoundAnalysis {
  const metalInvalid = requirePositive(metal)
  if (metalInvalid) return metalInvalid
  const nonmetalInvalid = requirePositive(nonmetal)
  if (nonmetalInvalid) return nonmetalInvalid
  const resolved = resolveOxo(nonmetal)
  if (isOxoError(resolved)) return resolved

  const m = metal.element
  const ms = metal.oxidationState
  const x = nonmetal.element
  const xs = nonmetal.oxidationState
  const { hydrogens, oxygens, central, state } = resolved
  const anionCharge = hydrogens
  const { cation, anion } = crissCross(ms, anionCharge)

  const anionInner = `${x.symbol}O${sub(oxygens)}`
  const formula =
    anion > 1
      ? `${m.symbol}${sub(cation)}(${anionInner})${anion}`
      : `${m.symbol}${sub(cation)}${anionInner}`

  const systematicAnion = `${multiplier(oxygens)}oxo${central.systematicAnion}(${roman(xs)})`
  const iupacAnion =
    anion > 1 ? `${complexMultiplier(anion)}(${systematicAnion})` : systematicAnion

  return {
    kind: 'ok',
    family: 'oxosal',
    familyLabel: 'Oxosal (sal ternaria)',
    formula,
    names: {
      traditional: withMetalName(state.anion, m, ms),
      stock: `${state.anion} de ${lower(m)}${stockSuffix(m, ms)}`,
      iupac: `${iupacAnion} de ${metalPrefix(cation)}${lower(m)}`,
    },
    note: 'El nombre IUPAC sistemático de oxosales es aproximado; el nombre de Stock es el de uso más frecuente.',
    explanation: `${m.name} (+${ms}) con el anión ${state.anion} (${x.name} +${xs}, carga ${anionCharge}−).`,
  }
}

function acidSalt(
  metal: CompoundSelection,
  nonmetal: CompoundSelection,
): CompoundAnalysis {
  const metalInvalid = requirePositive(metal)
  if (metalInvalid) return metalInvalid
  const nonmetalInvalid = requirePositive(nonmetal)
  if (nonmetalInvalid) return nonmetalInvalid
  const resolved = resolveOxo(nonmetal)
  if (isOxoError(resolved)) return resolved

  const { hydrogens, oxygens, central, state } = resolved
  if (hydrogens < 2) {
    return {
      kind: 'error',
      error: `${nonmetal.element.name} con +${nonmetal.oxidationState} no forma sal ácida: su oxoácido tiene un solo hidrógeno.`,
    }
  }

  const m = metal.element
  const ms = metal.oxidationState
  const x = nonmetal.element
  const keptHydrogens = hydrogens - 1
  const { cation, anion } = crissCross(ms, 1)
  const anionInner = `H${sub(keptHydrogens)}${x.symbol}O${sub(oxygens)}`
  const formula =
    anion > 1
      ? `${m.symbol}${sub(cation)}(${anionInner})${anion}`
      : `${m.symbol}${sub(cation)}${anionInner}`

  const hydrogenPrefix = keptHydrogens > 1 ? multiplier(keptHydrogens) : ''
  const compositionAnion = `${hydrogenPrefix}hidrogeno${state.anion}`
  const traditionalAnion =
    keptHydrogens === 1 && BI_ANION[state.anion]
      ? BI_ANION[state.anion]
      : `${state.anion} ácido`

  return {
    kind: 'ok',
    family: 'sal-acida',
    familyLabel: 'Sal ácida (sal cuaternaria)',
    formula,
    names: {
      traditional: `${traditionalAnion} de ${lower(m)}${
        metalTraditionalAdjective(m, ms) ? ` (${roman(ms)})` : ''
      }`,
      stock: `${compositionAnion} de ${lower(m)}${stockSuffix(m, ms)}`,
      iupac: `${compositionAnion} de ${metalPrefix(cation)}${lower(m)}`,
    },
    note: `Sal ácida con ${keptHydrogens} hidrógeno${keptHydrogens > 1 ? 's' : ''} sin neutralizar (uno menos que el ácido ${central.systematic}).`,
    explanation: `${m.name} (+${ms}) con el anión ${compositionAnion}.`,
  }
}
