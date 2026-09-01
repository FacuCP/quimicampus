import { Layout } from '../components/Layout'
import { ProportionTable } from '../components/calcular/ProportionTable'

export function CalcularPage() {
  return (
    <Layout title="Calcular" backTo="/">
      <ProportionTable />
    </Layout>
  )
}
