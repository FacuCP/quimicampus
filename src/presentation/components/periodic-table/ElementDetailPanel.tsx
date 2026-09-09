import type { Element } from '../../../domain/element/Element'
import { categoryLabel } from '../../../domain/element/Element'
import {
  electronConfiguration,
  electronConfigurationShort,
} from '../../../domain/element/electronConfiguration'
import { CATEGORY_BG } from './categoryStyles'

interface ElementDetailPanelProps {
  element: Element | null
  /** Si se indica, muestra un botón de cierre (útil como hoja inferior en móvil). */
  onClose?: () => void
}

export function ElementDetailPanel({ element, onClose }: ElementDetailPanelProps) {
  if (!element) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 p-6 text-center text-slate-600 dark:border-slate-700">
        Tocá un elemento para ver sus datos
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-xl border border-slate-200 p-4 shadow-lg dark:border-slate-700 lg:p-5 lg:shadow-none ${
        CATEGORY_BG[element.category]
      }`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-2 top-2 rounded-md px-2 py-1 text-slate-800 hover:bg-black/10 dark:text-slate-300"
        >
          ✕
        </button>
      )}
      <div className="flex items-baseline justify-between pr-6">
        <span className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
          {element.symbol}
        </span>
        <span className="text-xs text-slate-800 dark:text-slate-300">
          Z = {element.atomicNumber}
        </span>
      </div>
      <p className="mt-1 text-base font-medium text-slate-800 dark:text-slate-100">
        {element.name}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-700 dark:text-slate-200">
        <dt className="text-slate-700 dark:text-slate-200">Masa atómica</dt>
        <dd>{element.atomicMass} u</dd>
        <dt className="text-slate-700 dark:text-slate-200">Categoría</dt>
        <dd>{categoryLabel(element.category)}</dd>
        <dt className="text-slate-700 dark:text-slate-200">Electronegatividad</dt>
        <dd>{element.electronegativity ?? '—'}</dd>
        <dt className="text-slate-700 dark:text-slate-200">Período</dt>
        <dd>{element.period}</dd>
        <dt className="text-slate-700 dark:text-slate-200">Grupo</dt>
        <dd>{element.group ?? '—'}</dd>
        <dt className="text-slate-700 dark:text-slate-200">N.º de oxidación</dt>
        <dd>
          {element.oxidationStates.length > 0
            ? element.oxidationStates
                .map((value) =>
                  value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : '0',
                )
                .join(', ')
            : '—'}
        </dd>
      </dl>
      <div className="mt-3 border-t border-black/10 pt-2 dark:border-white/10">
        <p className="text-xs text-slate-700 dark:text-slate-200">
          Configuración electrónica
        </p>
        <p className="mt-0.5 font-mono text-sm text-slate-900 dark:text-slate-50">
          {electronConfigurationShort(element.atomicNumber)}
        </p>
        <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
          {electronConfiguration(element.atomicNumber)}
        </p>
      </div>
    </div>
  )
}
