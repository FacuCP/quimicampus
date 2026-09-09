import { Layout } from '../components/Layout'
import { CompoundPractice } from '../components/practica/CompoundPractice'

export function PracticaNombrarPage() {
  return (
    <Layout title="Nombrar compuestos" backTo="/practica">
      <CompoundPractice mode="name" />
    </Layout>
  )
}
