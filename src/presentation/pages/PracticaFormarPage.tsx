import { Layout } from '../components/Layout'
import { CompoundPractice } from '../components/practica/CompoundPractice'

export function PracticaFormarPage() {
  return (
    <Layout title="Formar compuestos" backTo="/practica">
      <CompoundPractice mode="formula" />
    </Layout>
  )
}
