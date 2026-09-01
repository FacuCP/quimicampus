import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LayoutProps {
  title: string
  /** Si se indica, muestra un enlace "volver" hacia esa ruta. */
  backTo?: string
  children: ReactNode
}

/**
 * Marco común de las páginas secundarias: mismo ancho, mismo encabezado
 * (botón "volver" + título) en la misma posición en todas.
 */
export function Layout({ title, backTo, children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-3 py-5 sm:gap-6 sm:px-4 sm:py-8">
      <header className="flex flex-wrap items-center gap-3 sm:gap-4">
        {backTo && (
          <Link
            to={backTo}
            className="rounded-md border border-brand-300 px-3 py-1 text-sm text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-950/40"
          >
            ← Volver
          </Link>
        )}
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
          {title}
        </h1>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
