import { useMemo, useRef, useState } from 'react'
import type { Element } from '../../../domain/element/Element'
import type {
  CompoundAnalysis,
  CompoundSelection,
} from '../../../domain/compound/analyzeCompound'
import { analyzeCompound } from '../../../domain/compound/analyzeCompound'
import { Modal } from '../common/Modal'
import { ElementCombobox } from '../element/ElementCombobox'
import { ElementDetailPanel } from '../periodic-table/ElementDetailPanel'
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

const iconButtonClass =
  'rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800'

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.75h.01" />
    </svg>
  )
}

export function CompoundBuilder() {
  const nextId = useRef(2)
  const [rows, setRows] = useState<Row[]>([
    { id: 'row-0', element: null, oxidationState: null },
    { id: 'row-1', element: null, oxidationState: null },
  ])
  const [infoElement, setInfoElement] = useState<Element | null>(null)

  const setElement = (id: string, element: Element | null) =>
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              element,
              oxidationState: element ? defaultOxidationState(element) : null,
            }
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
    <div className="mx-auto max-w-4xl space-y-6">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        <b>Paso 1: </b>Elegí los elementos con los que vas a trabajar<br/> 
        <b>Paso 2: </b>Elegí los números de oxidación, en caso de ser necesarios<br/>
        <b>Paso 3: ¡Descubrí que compuesto es formado!<br/></b>
      </p>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="mx-auto flex w-fit gap-3">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="flex min-h-[15rem] w-56 shrink-0 flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Elemento {index + 1}
                </span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setInfoElement(row.element)}
                    disabled={!row.element}
                    aria-label={`Información del elemento ${index + 1}`}
                    title="Ver información del elemento"
                    className={iconButtonClass}
                  >
                    <InfoIcon />
                  </button>
                  {rows.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label={`Quitar elemento ${index + 1}`}
                      className={iconButtonClass}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <ElementCombobox
                value={row.element}
                onChange={(element) => setElement(row.id, element)}
                onClear={() => setElement(row.id, null)}
              />

              <div>
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  N.º de oxidación
                </span>
                {row.element && row.element.oxidationStates.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {row.element.oxidationStates.map((state) => (
                      <label key={state} className="cursor-pointer">
                        <input
                          type="radio"
                          name={`ox-${row.id}`}
                          value={state}
                          checked={row.oxidationState === state}
                          onChange={() => setOxidationState(row.id, state)}
                          className="peer sr-only"
                        />
                        <span className="inline-block rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-700 peer-checked:border-brand-500 peer-checked:bg-brand-100 peer-checked:font-semibold peer-checked:text-brand-800 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 dark:border-slate-600 dark:text-slate-200 dark:peer-checked:bg-brand-900 dark:peer-checked:text-brand-100">
                          {formatOxidationState(state)}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <span className="inline-block py-1.5 text-sm text-slate-600">
                    {row.element ? 'sin datos' : '—'}
                  </span>
                )}
              </div>

              <p className="mt-auto text-xs text-slate-600 dark:text-slate-300">
                Electronegatividad:{' '}
                {row.element ? (row.element.electronegativity ?? '—') : '—'}
              </p>
            </li>
          ))}

          {rows.length < MAX_ROWS && (
            <li className="w-56 shrink-0">
              <button
                type="button"
                onClick={addRow}
                className="flex h-full min-h-[15rem] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-300 text-brand-700 transition hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-950/40"
              >
                <span className="text-3xl leading-none">+</span>
                <span className="text-sm font-medium">Agregar elemento</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {analysis && <ResultCard analysis={analysis} />}

      <Modal open={infoElement !== null} onClose={() => setInfoElement(null)}>
        <ElementDetailPanel
          element={infoElement}
          onClose={() => setInfoElement(null)}
        />
      </Modal>
    </div>
  )
}

function ResultCard({ analysis }: { analysis: CompoundAnalysis }) {
  if (analysis.kind === 'error') {
    return (
      <div className="mx-auto max-w-xl rounded-xl border-2 border-amber-300 bg-amber-50 p-5 text-center text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        {analysis.error}
      </div>
    )
  }

  const names: [string, string][] = [
    ['Tradicional', analysis.names.traditional],
    ['Stock', analysis.names.stock],
    ['Sistemática (atomicidad)', analysis.names.iupac],
  ]

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border-2 border-brand-300 bg-brand-50/70 p-6 text-center shadow-md dark:border-brand-700 dark:bg-brand-950/30">
      <div>
        <FormulaText
          formula={analysis.formula}
          className="text-4xl font-bold text-slate-900 dark:text-slate-50"
        />
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {analysis.familyLabel}
        </p>
      </div>

      <dl className="space-y-2">
        {names.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {label}
            </dt>
            <dd className="text-slate-900 dark:text-slate-50">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-slate-600 dark:text-slate-300">
        {analysis.explanation}
      </p>
      {analysis.note && (
        <p className="rounded-md bg-white/70 p-2 text-xs text-slate-600 dark:bg-black/20 dark:text-slate-300">
          {analysis.note}
        </p>
      )}
    </div>
  )
}
