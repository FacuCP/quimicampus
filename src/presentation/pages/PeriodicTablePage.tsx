import { Layout } from '../components/Layout'
import { ElementDetailPanel } from '../components/periodic-table/ElementDetailPanel'
import { PeriodicTableGrid } from '../components/periodic-table/PeriodicTableGrid'
import { usePeriodicTable } from '../hooks/usePeriodicTable'

export function PeriodicTablePage() {
  const { elements, selected, select, clearSelection, loading, error } =
    usePeriodicTable()

  return (
    <Layout title="Tabla periódica" backTo="/">
      {loading && <p className="text-slate-500">Cargando…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <PeriodicTableGrid
              elements={elements}
              selected={selected}
              onSelect={select}
            />
            {/* Panel lateral en pantallas grandes */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <ElementDetailPanel element={selected} />
              </div>
            </div>
          </div>

          {/* Hoja inferior en móvil / tablet */}
          {selected && (
            <div className="fixed inset-x-0 bottom-0 z-20 p-3 lg:hidden">
              <ElementDetailPanel
                element={selected}
                onClose={clearSelection}
              />
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
