import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CalcularPage } from '../pages/CalcularPage'
import { CompuestosPage } from '../pages/CompuestosPage'
import { HomePage } from '../pages/HomePage'
import { PeriodicTablePage } from '../pages/PeriodicTablePage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tabla-periodica" element={<PeriodicTablePage />} />
        <Route path="/calcular" element={<CalcularPage />} />
        <Route path="/compuestos" element={<CompuestosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
