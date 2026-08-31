import type { Element } from './Element'

/** Puerto: fuente de elementos de la tabla periódica. */
export interface ElementRepository {
  getAll(): Promise<Element[]>
}
