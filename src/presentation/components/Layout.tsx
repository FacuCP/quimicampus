import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LayoutProps {
  title: string
  /** Si se indica, muestra un enlace "volver" hacia esa ruta. */
  backTo?: string
  children: ReactNode
}

export function Layout({ title, backTo, children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-5 sm:gap-6 sm:px-4 sm:py-8">
      <header className="flex flex-wrap items-center gap-3 sm:gap-4">
        {backTo && (
          <Link
            to={backTo}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
