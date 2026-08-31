import type { Element } from '../../domain/element/Element'
import type { ElementRepository } from '../../domain/element/ElementRepository'

/** Caso de uso: obtener todos los elementos ordenados por número atómico. */
export class GetPeriodicTable {
  private readonly repository: ElementRepository

  constructor(repository: ElementRepository) {
    this.repository = repository
  }

  async execute(): Promise<Element[]> {
    const elements = await this.repository.getAll()
    return [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber)
  }
}
