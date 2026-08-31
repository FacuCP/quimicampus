import type { Element } from '../../../domain/element/Element'
import { categoryLabel } from '../../../domain/element/Element'
import { CATEGORY_BG } from './categoryStyles'

interface ElementDetailPanelProps {
  element: Element | null
  /** Si se indica, muestra un botón de cierre (útil como hoja inferior en móvil). */
  onClose?: () => void
}

export function ElementDetailPanel({ element, onClose }: ElementDetailPanelProps) {
  if (!element) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 p-6 text-center text-slate-400 dark:border-slate-700">
        Tocá un elemento para ver sus datos
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-xl border border-slate-200 p-5 shadow-lg dark:border-slate-700 lg:p-6 lg:shadow-none ${
        CATEGORY_BG[element.category]
      }`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-2 top-2 rounded-md px-2 py-1 text-slate-600 hover:bg-black/10 dark:text-slate-300"
        >
          ✕
        </button>
      )}
      <div className="flex items-baseline justify-between pr-6">
        <span className="text-4xl font-bold text-slate-900 dark:text-slate-50 sm:text-5xl">
          {element.symbol}
        </span>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Z = {element.atomicNumber}
        </span>
      </div>
      <p className="mt-1 text-lg font-medium text-slate-800 dark:text-slate-100">
        {element.name}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700 dark:text-slate-200">
        <dt className="text-slate-500 dark:text-slate-400">Masa atómica</dt>
        <dd>{element.atomicMass} u</dd>
        <dt className="text-slate-500 dark:text-slate-400">Categoría</dt>
        <dd>{categoryLabel(element.category)}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Período</dt>
        <dd>{element.period}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Grupo</dt>
        <dd>{element.group ?? '—'}</dd>
      </dl>
    </div>
  )
}
