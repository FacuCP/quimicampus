import type { Element } from '../../../domain/element/Element'
import { ElementCell } from './ElementCell'

interface PeriodicTableGridProps {
  elements: Element[]
  selected: Element | null
  onSelect: (element: Element) => void
}

export function PeriodicTableGrid({
  elements,
  selected,
  onSelect,
}: PeriodicTableGridProps) {
  return (
    <div className="-mx-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:px-0">
      <p className="mb-2 text-xs text-slate-400 sm:hidden">
        Deslizá horizontalmente para ver toda la tabla
      </p>
      <div
        className="grid min-w-[480px] gap-[2px] sm:min-w-[640px] sm:gap-[3px]"
        style={{
          gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(7, auto) 0.75rem repeat(2, auto)',
        }}
      >
        {/* Marcadores del bloque f dentro de la tabla principal */}
        <div
          style={{ gridColumn: 3, gridRow: 6 }}
          className="flex aspect-square items-center justify-center rounded-[3px] bg-fuchsia-100 text-[0.5rem] text-slate-500 dark:bg-fuchsia-950/60 dark:text-slate-400"
        >
          57-71
        </div>
        <div
          style={{ gridColumn: 3, gridRow: 7 }}
          className="flex aspect-square items-center justify-center rounded-[3px] bg-pink-100 text-[0.5rem] text-slate-500 dark:bg-pink-950/60 dark:text-slate-400"
        >
          89-103
        </div>

        {elements.map((element) => (
          <ElementCell
            key={element.atomicNumber}
            element={element}
            active={selected?.atomicNumber === element.atomicNumber}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
