import { useMemo, useRef, useState } from 'react'
import type { Element } from '../../../domain/element/Element'
import type { MeasurementUnitId } from '../../../domain/measurement/Unit'
import { unitSymbol } from '../../../domain/measurement/Unit'
import { ruleOfThree } from '../../../domain/proportion/ruleOfThree'
import { formatAmount, parseAmount } from './amount'
import { ElementCombobox } from '../element/ElementCombobox'
import { UnitSelect } from './UnitSelect'

const MAX_COLUMNS = 3
const COLUMN_LABELS = ['A', 'B', 'C']

interface Column {
  element: Element | null
  unit: MeasurementUnitId
}

interface ExtraRow {
  id: string
  /** Índice de la columna en la que el usuario escribió; las demás se calculan. */
  source: number
  raw: string
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
const computedClass =
  'w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200'
const secondaryButtonClass =
  'rounded-md border border-brand-300 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-950/40'
const cellClass = 'border border-slate-200 p-2 align-top dark:border-slate-700'

function makeColumn(): Column {
  return { element: null, unit: 'mol' }
}

function columnLabel(index: number): string {
  return COLUMN_LABELS[index] ?? String(index + 1)
}

export function ProportionTable() {
  const [columns, setColumns] = useState<Column[]>([makeColumn(), makeColumn()])
  const [referenceRow, setReferenceRow] = useState<string[]>(['', ''])
  const [rows, setRows] = useState<ExtraRow[]>([])
  const nextId = useRef(0)

  const references = useMemo(
    () => referenceRow.map((value) => parseAmount(value)),
    [referenceRow],
  )
  const ready =
    columns.every((column) => column.element !== null) &&
    references.length === columns.length &&
    references.every((value) => value !== null && value > 0)

  const updateColumn = (index: number, patch: Partial<Column>) =>
    setColumns((current) =>
      current.map((column, i) => (i === index ? { ...column, ...patch } : column)),
    )

  const setReference = (index: number, value: string) =>
    setReferenceRow((current) =>
      current.map((entry, i) => (i === index ? value : entry)),
    )

  const addColumn = () => {
    if (columns.length >= MAX_COLUMNS) return
    setColumns((current) => [...current, makeColumn()])
    setReferenceRow((current) => [...current, ''])
  }

  const removeColumn = () => {
    if (columns.length <= 2) return
    const removed = columns.length - 1
    setColumns((current) => current.slice(0, -1))
    setReferenceRow((current) => current.slice(0, -1))
    setRows((current) =>
      current.map((row) =>
        row.source === removed ? { ...row, source: 0, raw: '' } : row,
      ),
    )
  }

  const addRow = () => {
    nextId.current += 1
    setRows((current) => [
      ...current,
      { id: `row-${nextId.current}`, source: 0, raw: '' },
    ])
  }

  const removeRow = (id: string) =>
    setRows((current) => current.filter((row) => row.id !== id))

  const editRow = (id: string, source: number, raw: string) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, source, raw } : row)),
    )

  /** Valor a mostrar en la celda de la columna `index` de una fila calculada. */
  const cellValue = (row: ExtraRow, index: number): string => {
    if (index === row.source) return row.raw
    const typed = parseAmount(row.raw)
    const known = references[row.source]
    const target = references[index]
    if (typed === null || known === null || target === null) return ''
    try {
      return formatAmount(ruleOfThree(known, target, typed))
    } catch {
      return ''
    }
  }

  const colWidth = `${100 / columns.length}%`

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        <b>Paso 1: </b>Elegí los elementos y las unidades con las que vas a trabajar <br/> 
        <b>Paso 2: </b>Escribí los valores de referencia para cada elemento <br/>
        <b>Paso 3: </b>Agregá tantas filas como quieras para realizar los calculos necesarios <br/>
      </p>

      <div className="-mx-1 overflow-x-auto px-1">
        <table
          className="w-full table-fixed border-collapse"
          style={{
            minWidth: columns.length > 2 ? `${columns.length * 11}rem` : undefined,
          }}
        >
          <colgroup>
            {columns.map((_, index) => (
              <col key={index} style={{ width: colWidth }} />
            ))}
          </colgroup>
          <tbody>
            {/* Fila 1: títulos */}
            <tr>
              {columns.map((_, index) => (
                <td
                  key={index}
                  className={`${cellClass} text-center text-sm font-semibold text-slate-800 dark:text-slate-100`}
                >
                  Elemento {columnLabel(index)}
                </td>
              ))}
            </tr>

            {/* Fila 2: elemento + unidad */}
            <tr>
              {columns.map((column, index) => (
                <td key={index} className={cellClass}>
                  <div className="flex flex-col gap-1.5">
                    <ElementCombobox
                      value={column.element}
                      onChange={(element) => updateColumn(index, { element })}
                      onClear={() => updateColumn(index, { element: null })}
                    />
                    <UnitSelect
                      value={column.unit}
                      onChange={(unit) => updateColumn(index, { unit })}
                    />
                  </div>
                </td>
              ))}
            </tr>

            {/* Fila 3: cantidades de referencia */}
            <tr>
              {columns.map((column, index) => (
                <td
                  key={index}
                  className={`${cellClass} bg-brand-50 dark:bg-brand-950/30`}
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      inputMode="decimal"
                      value={referenceRow[index] ?? ''}
                      onChange={(event) => setReference(index, event.target.value)}
                      placeholder="Cantidad"
                      className={inputClass}
                    />
                    <span className="shrink-0 text-xs text-slate-600">
                      {unitSymbol(column.unit)}
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Filas 4+: datos calculados */}
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column, index) => {
                  const value = cellValue(row, index)
                  const isComputed = index !== row.source && value !== ''
                  const isLast = index === columns.length - 1
                  return (
                    <td key={index} className={cellClass}>
                      <div className="flex items-center gap-1.5">
                        <input
                          inputMode="decimal"
                          value={value}
                          onChange={(event) =>
                            editRow(row.id, index, event.target.value)
                          }
                          placeholder="0"
                          title={
                            isComputed ? 'Calculado por regla de tres' : undefined
                          }
                          className={isComputed ? computedClass : inputClass}
                        />
                        <span className="shrink-0 text-xs text-slate-600">
                          {unitSymbol(column.unit)}
                        </span>
                        {isLast && (
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            aria-label="Eliminar fila"
                            className="shrink-0 rounded px-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          disabled={!ready}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300"
        >
          + Agregar valor
        </button>
        <button
          type="button"
          onClick={addColumn}
          disabled={columns.length >= MAX_COLUMNS}
          className={secondaryButtonClass}
        >
          + Agregar elemento
        </button>
        {columns.length > 2 && (
          <button
            type="button"
            onClick={removeColumn}
            className={secondaryButtonClass}
          >
            − Quitar columna
          </button>
        )}
        {!ready && (
          <span className="text-xs text-slate-600">
            Completá todos los elementos y las cantidades de referencia.
          </span>
        )}
      </div>
    </div>
  )
}
