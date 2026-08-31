import type { ElementCategory } from '../../../domain/element/Element'

/** Color de fondo (clase Tailwind) por categoría, para celdas y leyenda. */
export const CATEGORY_BG: Record<ElementCategory, string> = {
  'no-metal': 'bg-emerald-200 dark:bg-emerald-900/60',
  'gas-noble': 'bg-violet-200 dark:bg-violet-900/60',
  'metal-alcalino': 'bg-rose-200 dark:bg-rose-900/60',
  'metal-alcalinoterreo': 'bg-orange-200 dark:bg-orange-900/60',
  metaloide: 'bg-teal-200 dark:bg-teal-900/60',
  halogeno: 'bg-yellow-200 dark:bg-yellow-900/60',
  'metal-de-transicion': 'bg-sky-200 dark:bg-sky-900/60',
  'metal-del-bloque-p': 'bg-slate-200 dark:bg-slate-700',
  lantanido: 'bg-fuchsia-200 dark:bg-fuchsia-900/60',
  actinido: 'bg-pink-200 dark:bg-pink-900/60',
  desconocido: 'bg-slate-100 dark:bg-slate-800',
}
