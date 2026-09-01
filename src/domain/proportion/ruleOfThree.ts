/**
 * Regla de tres simple entre dos columnas de la fila de referencia.
 *
 * La fila de referencia establece que `referenceKnown` unidades de una magnitud
 * equivalen a `referenceTarget` de otra. Dado `value` de la primera, devuelve cuánto
 * corresponde de la segunda: `value · referenceTarget / referenceKnown`.
 */
export function ruleOfThree(
  referenceKnown: number,
  referenceTarget: number,
  value: number,
): number {
  if (referenceKnown <= 0 || referenceTarget <= 0) {
    throw new Error('Las cantidades de referencia deben ser positivas.')
  }
  return (value * referenceTarget) / referenceKnown
}
