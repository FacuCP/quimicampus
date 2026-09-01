import { Link } from 'react-router-dom'

const LINKS = [
  {
    to: '/tabla-periodica',
    label: 'Tabla periódica',
    icon: '/icons/tabla-periodica.png',
  },
  { to: '/calcular', label: 'Calculadora', icon: '/icons/calculadora.png' },
  { to: '/compuestos', label: 'Compuestos', icon: '/icons/compuestos.png' },
]

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-10 px-4 pt-16 text-center sm:pt-24">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 sm:text-6xl">
          ¡Hola!
        </h1>
        <h1 className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
          Esto es{' '}
          <span className="text-brand-500 dark:text-brand-400">QuimiCampus</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
          Tu espacio para aprender química
        </p>
      </div>

      <nav className="grid w-full grid-cols-3 gap-3 sm:gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-brand-300 bg-brand-400 p-2 text-center text-base font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-300 hover:shadow-md dark:border-brand-600 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400 sm:p-3 sm:text-lg"
          >
            <img
              src={link.icon}
              alt=""
              className="w-3/4 flex-1 object-contain"
            />
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
