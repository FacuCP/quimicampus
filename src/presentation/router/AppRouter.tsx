import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CalcularPage } from '../pages/CalcularPage'
import { EcuacionesPage } from '../pages/EcuacionesPage'
import { HomePage } from '../pages/HomePage'
import { PeriodicTablePage } from '../pages/PeriodicTablePage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tabla-periodica" element={<PeriodicTablePage />} />
        <Route path="/calcular" element={<CalcularPage />} />
        <Route path="/ecuaciones" element={<EcuacionesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
