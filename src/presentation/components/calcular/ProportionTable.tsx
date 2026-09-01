import { useMemo, useRef, useState } from 'react'
import type { Element } from '../../../domain/element/Element'
import type { MeasurementUnitId } from '../../../domain/measurement/Unit'
import { unitSymbol } from '../../../domain/measurement/Unit'
import type { ProportionSide } from '../../../domain/proportion/ruleOfThree'
import { ruleOfThree } from '../../../domain/proportion/ruleOfThree'
import { formatAmount, parseAmount } from './amount'
import { ElementCombobox } from '../element/ElementCombobox'
import { UnitSelect } from './UnitSelect'

interface ExtraRow {
  id: string
  /** Lado en el que el usuario escribió; el otro se calcula por regla de tres. */
  source: ProportionSide
  raw: string
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
const computedClass =
  'w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-500 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'

export function ProportionTable() {
  const [elementA, setElementA] = useState<Element | null>(null)
  const [elementB, setElementB] = useState<Element | null>(null)
  const [unitA, setUnitA] = useState<MeasurementUnitId>('mol')
  const [unitB, setUnitB] = useState<MeasurementUnitId>('mol')
  const [refA, setRefA] = useState('')
  const [refB, setRefB] = useState('')
  const [rows, setRows] = useState<ExtraRow[]>([])
  const nextId = useRef(0)

  const reference = useMemo(() => {
    const a = parseAmount(refA)
    const b = parseAmount(refB)
    if (a === null || b === null || a <= 0 || b <= 0) return null
    return { a, b }
  }, [refA, refB])

  const canAddRow = elementA !== null && elementB !== null && reference !== null

  const addRow = () => {
    nextId.current += 1
    setRows((current) => [
      ...current,
      { id: `row-${nextId.current}`, source: 'a', raw: '' },
    ])
  }

  const removeRow = (id: string) =>
    setRows((current) => current.filter((row) => row.id !== id))

  const editRow = (id: string, side: ProportionSide, raw: string) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, source: side, raw } : row)),
    )

  /** Valor a mostrar en la celda `side` de una fila extra. */
  const cellValue = (row: ExtraRow, side: ProportionSide): string => {
    if (side === row.source) return row.raw
    const typed = parseAmount(row.raw)
    if (typed === null || reference === null) return ''
    try {
      return formatAmount(ruleOfThree(reference, row.source, typed))
    } catch {
      return ''
    }
  }

  const renderExtraCell = (row: ExtraRow, side: ProportionSide, unit: MeasurementUnitId) => {
    const isComputed = side !== row.source && cellValue(row, side) !== ''
    return (
      <div className="flex items-center gap-1.5">
        <input
          inputMode="decimal"
          value={cellValue(row, side)}
          onChange={(event) => editRow(row.id, side, event.target.value)}
          placeholder="0"
          title={isComputed ? 'Calculado por regla de tres' : undefined}
          className={isComputed ? computedClass : inputClass}
        />
        <span className="shrink-0 text-xs text-slate-400">{unitSymbol(unit)}</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Elegí un elemento por columna y una cantidad de referencia con su unidad. Después
        agregá filas: al cargar un valor en una columna, la otra se calcula con regla de
        tres respecto de la fila de referencia.
      </p>

      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-1/2" />
          <col className="w-1/2" />
        </colgroup>
        <tbody>
          <tr>
            {([['A', elementA, setElementA], ['B', elementB, setElementB]] as const).map(
              ([key, value, setValue]) => (
                <td
                  key={key}
                  className="border border-slate-200 p-2 align-top dark:border-slate-700"
                >
                  <span className="mb-1 block text-xs font-medium text-slate-400">
                    Columna {key}
                  </span>
                  <ElementCombobox value={value} onChange={setValue} />
                </td>
              ),
            )}
          </tr>

          <tr>
            {(
              [
                ['A', unitA, setUnitA, refA, setRefA],
                ['B', unitB, setUnitB, refB, setRefB],
              ] as const
            ).map(([key, unit, setUnit, ref, setRef]) => (
              <td
                key={key}
                className="border border-slate-200 p-2 align-top dark:border-slate-700"
              >
                <div className="flex flex-col gap-1.5">
                  <UnitSelect value={unit} onChange={setUnit} />
                  <input
                    inputMode="decimal"
                    value={ref}
                    onChange={(event) => setRef(event.target.value)}
                    placeholder="Cantidad de referencia"
                    className={inputClass}
                  />
                </div>
              </td>
            ))}
          </tr>

          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border border-slate-200 p-2 dark:border-slate-700">
                {renderExtraCell(row, 'a', unitA)}
              </td>
              <td className="border border-slate-200 p-2 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">{renderExtraCell(row, 'b', unitB)}</div>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label="Eliminar fila"
                    className="shrink-0 rounded px-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          disabled={!canAddRow}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          + Agregar fila
        </button>
        {!canAddRow && (
          <span className="text-xs text-slate-400">
            Completá ambos elementos y las cantidades de referencia.
          </span>
        )}
      </div>
    </div>
  )
}
