import { GetPeriodicTable } from '../application/element/GetPeriodicTable'
import { SearchElements } from '../application/element/SearchElements'
import { StaticElementRepository } from '../infrastructure/element/StaticElementRepository'

/**
 * Composition root: único lugar donde se instancian la infraestructura y los casos de
 * uso. La capa de presentación consume `container`, nunca importa `infrastructure`.
 */
const elementRepository = new StaticElementRepository()

export const container = {
  getPeriodicTable: new GetPeriodicTable(elementRepository),
  searchElements: new SearchElements(elementRepository),
}
