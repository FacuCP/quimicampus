import { useEffect, useState } from 'react'
import type { Element } from '../../domain/element/Element'
import { container } from '../../composition/container'

/** Devuelve los elementos que coinciden con `query` (búsqueda parcial). */
export function useElementSearch(query: string, limit = 8): Element[] {
  const [results, setResults] = useState<Element[]>([])

  useEffect(() => {
    let active = true
    container.searchElements
      .execute(query, limit)
      .then((found) => {
        if (active) setResults(found)
      })
      .catch(() => {
        if (active) setResults([])
      })
    return () => {
      active = false
    }
  }, [query, limit])

  return results
}
