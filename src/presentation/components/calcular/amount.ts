/** Convierte lo escrito por el usuario (acepta coma o punto decimal) a número. */
export function parseAmount(raw: string): number | null {
  const normalized = raw.replace(',', '.').trim()
  if (normalized === '') return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

/** Formatea un resultado calculado a un texto corto y legible. */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return ''
  return Number(value.toPrecision(6)).toString()
}
