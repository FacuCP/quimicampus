export interface MeasurementUnit {
  readonly id: string
  readonly label: string
  readonly symbol: string
}

/** Catálogo de unidades disponibles para las columnas de la calculadora. */
export const MEASUREMENT_UNITS = [
  { id: 'mol', label: 'Mol', symbol: 'mol' },
  { id: 'gramo', label: 'Gramo', symbol: 'g' },
  { id: 'miligramo', label: 'Miligramo', symbol: 'mg' },
  { id: 'kilogramo', label: 'Kilogramo', symbol: 'kg' },
  { id: 'litro', label: 'Litro', symbol: 'L' },
  { id: 'mililitro', label: 'Mililitro', symbol: 'mL' },
  { id: 'particula', label: 'Partícula', symbol: 'part.' },
] as const satisfies readonly MeasurementUnit[]

export type MeasurementUnitId = (typeof MEASUREMENT_UNITS)[number]['id']

export function unitSymbol(id: MeasurementUnitId): string {
  return MEASUREMENT_UNITS.find((unit) => unit.id === id)?.symbol ?? ''
}
