export type ProportionSide = 'a' | 'b'

export interface ProportionReference {
  /** Cantidad de referencia de la columna A (fila de unidades). */
  readonly a: number
  /** Cantidad de referencia de la columna B (fila de unidades). */
  readonly b: number
}

/**
 * Regla de tres simple tomando la fila de referencia como proporción base.
 * Dada la referencia `a₀ : b₀` y un valor conocido en un lado, devuelve el otro lado.
 */
export function ruleOfThree(
  reference: ProportionReference,
  knownSide: ProportionSide,
  value: number,
): number {
  if (reference.a <= 0 || reference.b <= 0) {
    throw new Error('La fila de referencia debe tener cantidades positivas.')
  }
  return knownSide === 'a'
    ? (value * reference.b) / reference.a
    : (value * reference.a) / reference.b
}
