import { Layout } from '../components/Layout'
import { CompoundBuilder } from '../components/compuestos/CompoundBuilder'

export function CompuestosPage() {
  return (
    <Layout title="Compuestos" backTo="/">
      <CompoundBuilder />
    </Layout>
  )
}
