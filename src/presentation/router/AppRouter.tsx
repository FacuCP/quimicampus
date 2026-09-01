import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { CalcularPage } from '../pages/CalcularPage'
import { CompuestosPage } from '../pages/CompuestosPage'
import { HomePage } from '../pages/HomePage'
import { PeriodicTablePage } from '../pages/PeriodicTablePage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="route-fade">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tabla-periodica" element={<PeriodicTablePage />} />
        <Route path="/calcular" element={<CalcularPage />} />
        <Route path="/compuestos" element={<CompuestosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
