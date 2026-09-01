import { useMemo, useRef, useState } from 'react'
import type { Element } from '../../../domain/element/Element'
import type {
  CompoundAnalysis,
  CompoundSelection,
} from '../../../domain/compound/analyzeCompound'
import { analyzeCompound } from '../../../domain/compound/analyzeCompound'
import { ElementCombobox } from '../element/ElementCombobox'
import { FormulaText } from './FormulaText'

interface Row {
  id: string
  element: Element | null
  oxidationState: number | null
}

const MAX_ROWS = 4

function defaultOxidationState(element: Element): number | null {
  const states = element.oxidationStates
  if (states.length === 0) return null
  if (states.length === 1) return states[0]
  if (element.symbol === 'O') return -2
  return states.find((value) => value > 0) ?? states[0]
}

function formatOxidationState(value: number): string {
  if (value > 0) return `+${value}`
  if (value < 0) return `−${Math.abs(value)}`
  return '0'
}

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'

export function CompoundBuilder() {
  const nextId = useRef(2)
  const [rows, setRows] = useState<Row[]>([
    { id: 'row-0', element: null, oxidationState: null },
    { id: 'row-1', element: null, oxidationState: null },
  ])

  const setElement = (id: string, element: Element) =>
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, element, oxidationState: defaultOxidationState(element) }
          : row,
      ),
    )

  const setOxidationState = (id: string, oxidationState: number) =>
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, oxidationState } : row,
      ),
    )

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return
    setRows((current) => [
      ...current,
      { id: `row-${nextId.current++}`, element: null, oxidationState: null },
    ])
  }

  const removeRow = (id: string) =>
    setRows((current) =>
      current.length <= 2 ? current : current.filter((row) => row.id !== id),
    )

  const selections = useMemo<CompoundSelection[]>(
    () =>
      rows
        .filter(
          (row): row is Row & { element: Element; oxidationState: number } =>
            row.element !== null && row.oxidationState !== null,
        )
        .map((row) => ({
          element: row.element,
          oxidationState: row.oxidationState,
        })),
    [rows],
  )

  const analysis = useMemo(
    () => (selections.length >= 2 ? analyzeCompound(selections) : null),
    [selections],
  )

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Elegí entre 2 y 4 elementos y, para cada uno, su número de oxidación. El
        compuesto y sus nombres se calculan al instante.
      </p>

      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-[12rem] flex-1">
                <span className="mb-1 block text-xs font-medium text-slate-400">
                  Elemento {index + 1}
                </span>
                <ElementCombobox
                  value={row.element}
                  onChange={(element) => setElement(row.id, element)}
                />
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-slate-400">
                  N.º de oxidación
                </span>
                {row.element && row.element.oxidationStates.length > 0 ? (
                  <select
                    className={selectClass}
                    value={row.oxidationState ?? ''}
                    onChange={(event) =>
                      setOxidationState(row.id, Number(event.target.value))
                    }
                  >
                    {row.element.oxidationStates.map((state) => (
                      <option key={state} value={state}>
                        {formatOxidationState(state)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="inline-block py-1.5 text-sm text-slate-400">
                    {row.element ? 'sin datos' : '—'}
                  </span>
                )}
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-slate-400">
                  Electronegatividad
                </span>
                <span className="inline-block py-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {row.element
                    ? (row.element.electronegativity ?? '—')
                    : '—'}
                </span>
              </div>

              {rows.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Quitar elemento ${index + 1}`}
                  className="ml-auto self-center rounded px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {rows.length < MAX_ROWS && (
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          + Agregar elemento
        </button>
      )}

      {analysis && <ResultCard analysis={analysis} />}
    </div>
  )
}

function ResultCard({ analysis }: { analysis: CompoundAnalysis }) {
  if (analysis.kind === 'error') {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        {analysis.error}
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <FormulaText
          formula={analysis.formula}
          className="text-3xl font-bold text-slate-900 dark:text-slate-50"
        />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {analysis.familyLabel}
        </span>
      </div>

      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
        <dt className="font-medium text-slate-500 dark:text-slate-400">
          Tradicional
        </dt>
        <dd className="text-slate-800 dark:text-slate-100">
          {analysis.names.traditional}
        </dd>
        <dt className="font-medium text-slate-500 dark:text-slate-400">Stock</dt>
        <dd className="text-slate-800 dark:text-slate-100">
          {analysis.names.stock}
        </dd>
        <dt className="font-medium text-slate-500 dark:text-slate-400">IUPAC</dt>
        <dd className="text-slate-800 dark:text-slate-100">
          {analysis.names.iupac}
        </dd>
      </dl>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {analysis.explanation}
      </p>
      {analysis.note && (
        <p className="rounded-md bg-slate-100 p-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {analysis.note}
        </p>
      )}
    </div>
  )
}
