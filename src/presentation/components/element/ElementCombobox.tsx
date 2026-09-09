import { useId, useRef, useState } from 'react'
import type { UIEvent } from 'react'
import type { Element } from '../../../domain/element/Element'
import { useElementSearch } from '../../hooks/useElementSearch'

/** Opción extra (p. ej. "Soluto" / "Solvente") que no es un elemento químico. */
export interface ComboboxExtraChoice {
  id: string
  label: string
}

interface ElementComboboxProps {
  value: Element | null
  onChange: (element: Element) => void
  /** Si se indica, muestra una ✕ para borrar la selección actual. */
  onClear?: () => void
  placeholder?: string
  /** Opciones adicionales que se muestran arriba de la lista de elementos. */
  extraChoices?: ComboboxExtraChoice[]
  /** Id de la opción extra seleccionada, si la selección actual no es un elemento. */
  selectedExtraId?: string | null
  onChooseExtra?: (id: string) => void
}

const PAGE_SIZE = 10

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export function ElementCombobox({
  value,
  onChange,
  onClear,
  placeholder,
  extraChoices = [],
  selectedExtraId,
  onChooseExtra,
}: ElementComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const results = useElementSearch(query, visibleCount)
  const listId = useId()
  const closeTimer = useRef<number | undefined>(undefined)

  // Al llegar cerca del final de la lista, se muestran PAGE_SIZE elementos más.
  const handleListScroll = (event: UIEvent<HTMLUListElement>) => {
    const el = event.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight > 48) return
    setVisibleCount((current) =>
      results.length >= current ? current + PAGE_SIZE : current,
    )
  }

  const q = normalize(query)
  const matchingExtras =
    q === ''
      ? extraChoices
      : extraChoices.filter((choice) => normalize(choice.label).includes(q))

  const selectedExtraLabel = selectedExtraId
    ? (extraChoices.find((choice) => choice.id === selectedExtraId)?.label ?? '')
    : ''
  const selectedLabel = value
    ? `${value.symbol} — ${value.name}`
    : selectedExtraLabel
  const hasSelection = value !== null || Boolean(selectedExtraId)
  const showClear = hasSelection && onClear !== undefined && !open

  const choose = (element: Element) => {
    window.clearTimeout(closeTimer.current)
    onChange(element)
    setQuery('')
    setOpen(false)
  }

  const chooseExtra = (id: string) => {
    window.clearTimeout(closeTimer.current)
    onChooseExtra?.(id)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        value={open ? query : selectedLabel}
        placeholder={placeholder ?? 'Buscar elemento…'}
        onChange={(event) => {
          setQuery(event.target.value)
          setVisibleCount(PAGE_SIZE)
          setOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setVisibleCount(PAGE_SIZE)
          setOpen(true)
        }}
        onBlur={() => {
          closeTimer.current = window.setTimeout(() => setOpen(false), 120)
        }}
        className={`w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${
          showClear ? 'pr-8' : ''
        }`}
      />
      {showClear && (
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault()
            onClear?.()
          }}
          aria-label="Borrar selección"
          title="Borrar selección"
          className="absolute inset-y-0 right-1 my-auto h-6 w-6 rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      )}
      {open && (results.length > 0 || matchingExtras.length > 0) && (
        <ul
          id={listId}
          onScroll={handleListScroll}
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {matchingExtras.map((choice) => (
            <li key={`extra-${choice.id}`}>
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault()
                  chooseExtra(choice.id)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-brand-50 dark:hover:bg-brand-950/40"
              >
                <span className="inline-flex shrink-0 rounded bg-brand-100 px-1.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                  Rol
                </span>
                <span className="truncate text-slate-700 dark:text-slate-200">
                  {choice.label}
                </span>
              </button>
            </li>
          ))}
          {matchingExtras.length > 0 && results.length > 0 && (
            <li aria-hidden className="my-1 border-t border-slate-200 dark:border-slate-700" />
          )}
          {results.map((element) => (
            <li key={element.atomicNumber}>
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault()
                  choose(element)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-brand-50 dark:hover:bg-brand-950/40"
              >
                <span className="inline-flex w-8 shrink-0 justify-center rounded bg-slate-100 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {element.symbol}
                </span>
                <span className="truncate text-slate-700 dark:text-slate-200">
                  {element.name}
                </span>
                <span className="ml-auto shrink-0 text-xs text-slate-600">
                  Z&nbsp;{element.atomicNumber}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
