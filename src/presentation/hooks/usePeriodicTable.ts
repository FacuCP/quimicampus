import { useCallback, useEffect, useState } from 'react'
import type { Element } from '../../domain/element/Element'
import { container } from '../../composition/container'

interface PeriodicTableState {
  elements: Element[]
  selected: Element | null
  select: (element: Element) => void
  clearSelection: () => void
  loading: boolean
  error: string | null
}

export function usePeriodicTable(): PeriodicTableState {
  const [elements, setElements] = useState<Element[]>([])
  const [selected, setSelected] = useState<Element | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    container.getPeriodicTable
      .execute()
      .then((result) => {
        if (active) {
          setElements(result)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setError('No se pudo cargar la tabla periódica.')
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const select = useCallback((element: Element) => setSelected(element), [])
  const clearSelection = useCallback(() => setSelected(null), [])

  return { elements, selected, select, clearSelection, loading, error }
}
