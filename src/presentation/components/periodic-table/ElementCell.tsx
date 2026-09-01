import type { Element } from '../../../domain/element/Element'
import { CATEGORY_BG } from './categoryStyles'

interface ElementCellProps {
  element: Element
  active: boolean
  onSelect: (element: Element) => void
}

export function ElementCell({ element, active, onSelect }: ElementCellProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(element)}
      style={{ gridColumn: element.xpos, gridRow: element.ypos }}
      title={element.name}
      className={`flex aspect-square flex-col items-center justify-center rounded-[3px] p-0.5 text-center leading-none transition hover:z-10 hover:scale-110 hover:ring-2 hover:ring-slate-900 dark:hover:ring-white ${
        CATEGORY_BG[element.category]
      } ${active ? 'z-10 scale-110 ring-2 ring-slate-900 dark:ring-white' : ''}`}
    >
      <span className="text-[0.4rem] text-slate-800 dark:text-slate-300 sm:text-[0.5rem]">
        {element.atomicNumber}
      </span>
      <span className="text-[0.65rem] font-bold text-slate-900 dark:text-slate-50 sm:text-sm">
        {element.symbol}
      </span>
      <span className="mt-px w-full truncate text-[0.3rem] text-slate-700 dark:text-slate-200 sm:text-[0.4rem]">
        {element.name}
      </span>
    </button>
  )
}
