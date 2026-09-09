import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'

const OPTIONS = [
  {
    to: '/practica/formar',
    title: 'Formar compuestos',
    description: 'Te damos el nombre y vos escribís la fórmula.',
  },
  {
    to: '/practica/nombrar',
    title: 'Nombrar compuestos',
    description: 'Te damos la fórmula y vos escribís el nombre.',
  },
]

export function PracticaPage() {
  return (
    <Layout title="Práctica" backTo="/">
      <nav className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        {OPTIONS.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            className="flex flex-col gap-2 rounded-xl border border-brand-300 bg-brand-400/90 p-5 text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-300 hover:shadow-md dark:border-brand-600 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400"
          >
            <span className="text-lg font-semibold">{option.title}</span>
            <span className="text-sm opacity-80">{option.description}</span>
          </Link>
        ))}
      </nav>
    </Layout>
  )
}
