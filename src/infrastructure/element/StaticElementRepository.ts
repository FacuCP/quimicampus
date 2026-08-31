import type { Element } from '../../domain/element/Element'
import type { ElementRepository } from '../../domain/element/ElementRepository'
import { PERIODIC_TABLE_DATA } from './periodicTable.data'

/** Adaptador: sirve los elementos desde el dataset estático embebido. */
export class StaticElementRepository implements ElementRepository {
  getAll(): Promise<Element[]> {
    return Promise.resolve([...PERIODIC_TABLE_DATA])
  }
}
