import { useEffect, useMemo, useState } from 'react'
import type {
  CompoundExercise,
  PracticeCategory,
} from '../../../domain/compound/practice'
import {
  PRACTICE_CATEGORIES,
  generateCompoundExercises,
  isFormulaCorrect,
  isNameCorrect,
} from '../../../domain/compound/practice'
import { useAllElements } from '../../hooks/useAllElements'
import { FormulaText } from '../compuestos/FormulaText'

const EXERCISE_COUNT = 10

type Mode = 'formula' | 'name'
type Phase = 'setup' | 'playing' | 'done'

interface CompoundPracticeProps {
  /** `formula`: se muestra el nombre y se pide la fórmula. `name`: al revés. */
  mode: Mode
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
const primaryButtonClass =
  'rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300'
const secondaryButtonClass =
  'rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-950/40'

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function CompoundPractice({ mode }: CompoundPracticeProps) {
  const elements = useAllElements()
  const [phase, setPhase] = useState<Phase>('setup')
  const [selected, setSelected] = useState<Set<PracticeCategory>>(new Set())
  const [exercises, setExercises] = useState<CompoundExercise[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [startedAt, setStartedAt] = useState(0)
  const [finishedAt, setFinishedAt] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [noResults, setNoResults] = useState(false)

  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [phase])

  const isCorrect = useMemo(
    () => (index: number) =>
      mode === 'formula'
        ? isFormulaCorrect(answers[index] ?? '', exercises[index])
        : isNameCorrect(answers[index] ?? '', exercises[index]),
    [mode, answers, exercises],
  )

  const toggleCategory = (id: PracticeCategory) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const start = () => {
    const generated = generateCompoundExercises(
      elements,
      [...selected],
      EXERCISE_COUNT,
      Math.random,
    )
    if (generated.length === 0) {
      setNoResults(true)
      return
    }
    setExercises(generated)
    setAnswers(new Array(generated.length).fill(''))
    setStartedAt(Date.now())
    setNow(Date.now())
    setFinishedAt(null)
    setNoResults(false)
    setPhase('playing')
  }

  const finish = () => {
    setFinishedAt(Date.now())
    setPhase('done')
  }

  const restart = () => {
    setPhase('setup')
    setExercises([])
    setAnswers([])
    setFinishedAt(null)
  }

  const elapsedMs = (finishedAt ?? now) - startedAt
  const score = exercises.reduce(
    (total, _, index) => total + (isCorrect(index) ? 1 : 0),
    0,
  )

  // --- Configuración -------------------------------------------------------
  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Elegí una o más categorías y tocá <b>Comenzar</b>. Vas a resolver hasta{' '}
          {EXERCISE_COUNT} compuestos al azar mientras corre el cronómetro.
        </p>

        <div className="flex flex-wrap gap-2">
          {PRACTICE_CATEGORIES.map((category) => {
            const active = selected.has(category.id)
            return (
              <label key={category.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleCategory(category.id)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition peer-checked:border-brand-500 peer-checked:bg-brand-100 peer-checked:font-semibold peer-checked:text-brand-800 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 dark:border-slate-600 dark:text-slate-200 dark:peer-checked:bg-brand-900 dark:peer-checked:text-brand-100">
                  {category.label}
                </span>
              </label>
            )
          })}
        </div>

        {noResults && (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            No se pudieron generar compuestos para esa selección. Probá con otras
            categorías.
          </p>
        )}

        <button
          type="button"
          onClick={start}
          disabled={selected.size === 0 || elements.length === 0}
          className={primaryButtonClass}
        >
          Comenzar
        </button>
      </div>
    )
  }

  // --- Juego y resultados ------------------------------------------------
  const done = phase === 'done'

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-24">
      {done && (
        <div className="rounded-2xl border-2 border-brand-300 bg-brand-50/70 p-5 text-center dark:border-brand-700 dark:bg-brand-950/30">
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {score} / {exercises.length}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {score === 1 ? 'acierto' : 'aciertos'} · Tiempo {formatTime(elapsedMs)}
          </p>
        </div>
      )}

      <ol className="space-y-3">
        {exercises.map((exercise, index) => {
          const correct = done && isCorrect(index)
          const wrong = done && !isCorrect(index)
          return (
            <li
              key={`${exercise.formula}-${index}`}
              className={`rounded-xl border p-3 ${
                correct
                  ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                  : wrong
                    ? 'border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 w-5 shrink-0 text-right text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div>
                    {mode === 'formula' ? (
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {exercise.names.stock}
                      </p>
                    ) : (
                      <FormulaText
                        formula={exercise.formula}
                        className="text-2xl font-bold text-slate-900 dark:text-slate-50"
                      />
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {exercise.familyLabel}
                    </p>
                  </div>

                  <input
                    type="text"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={answers[index] ?? ''}
                    disabled={done}
                    onChange={(event) =>
                      setAnswers((current) =>
                        current.map((value, i) =>
                          i === index ? event.target.value : value,
                        ),
                      )
                    }
                    placeholder={
                      mode === 'formula'
                        ? 'Fórmula (ej. H2SO4)'
                        : 'Nombre del compuesto'
                    }
                    className={inputClass}
                  />

                  {done && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {mode === 'formula' ? (
                        <>
                          Respuesta correcta:{' '}
                          <FormulaText
                            formula={exercise.formula}
                            className="font-semibold text-slate-900 dark:text-slate-50"
                          />
                        </>
                      ) : (
                        <>
                          Respuestas correctas:{' '}
                          <span className="font-semibold text-slate-900 dark:text-slate-50">
                            {exercise.names.traditional}
                          </span>{' '}
                          · {exercise.names.stock} · {exercise.names.iupac}
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {done ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={start} className={primaryButtonClass}>
            Practicar de nuevo
          </button>
          <button
            type="button"
            onClick={restart}
            className={secondaryButtonClass}
          >
            Cambiar categorías
          </button>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <span
              className="font-mono text-lg tabular-nums text-slate-800 dark:text-slate-100"
              aria-label="Cronómetro"
            >
              ⏱ {formatTime(elapsedMs)}
            </span>
            <button
              type="button"
              onClick={finish}
              className={primaryButtonClass}
            >
              Finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
