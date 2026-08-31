import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/tabla-periodica', label: 'Tabla periódica' },
  { to: '/calcular', label: 'Calcular' },
  { to: '/ecuaciones', label: 'Ecuaciones' },
]

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-4 py-10 text-center sm:gap-10 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
          Bienvenidos
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Elegí una herramienta para empezar
        </p>
      </div>
      <nav className="grid w-full gap-3 sm:grid-cols-3 sm:gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-xl border border-slate-200 bg-white px-6 py-6 text-lg font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 sm:py-8"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
