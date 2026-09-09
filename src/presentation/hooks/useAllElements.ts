import { useEffect, useState } from 'react'
import type { Element } from '../../domain/element/Element'
import { container } from '../../composition/container'

/** Carga la lista completa de elementos (ordenada por número atómico). */
export function useAllElements(): Element[] {
  const [elements, setElements] = useState<Element[]>([])

  useEffect(() => {
    let active = true
    container.getPeriodicTable
      .execute()
      .then((result) => {
        if (active) setElements(result)
      })
      .catch(() => {
        if (active) setElements([])
      })
    return () => {
      active = false
    }
  }, [])

  return elements
}
