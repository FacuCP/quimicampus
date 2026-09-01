import type { Element } from '../../domain/element/Element'
import { filterElements } from '../../domain/element/filterElements'
import type { ElementRepository } from '../../domain/element/ElementRepository'

/** Caso de uso: buscar elementos por coincidencia parcial de nombre o símbolo. */
export class SearchElements {
  private readonly repository: ElementRepository

  constructor(repository: ElementRepository) {
    this.repository = repository
  }

  async execute(query: string, limit?: number): Promise<Element[]> {
    const elements = await this.repository.getAll()
    return filterElements(elements, query, limit)
  }
}
