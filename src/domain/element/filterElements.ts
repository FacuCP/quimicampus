import type { Element } from './Element'

const DIACRITICS = /[̀-ͯ]/g

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(DIACRITICS, '').trim()
}

/**
 * Búsqueda parcial e insensible a acentos/mayúsculas por nombre o símbolo.
 * Con `query` vacío devuelve los primeros `limit` elementos (útil para el desplegable).
 */
export function filterElements(
  elements: Element[],
  query: string,
  limit = 8,
): Element[] {
  const q = normalize(query)
  if (q === '') return elements.slice(0, limit)
  return elements
    .filter(
      (element) =>
        normalize(element.name).includes(q) ||
        normalize(element.symbol).includes(q),
    )
    .slice(0, limit)
}
