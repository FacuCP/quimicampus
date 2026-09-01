import type { MeasurementUnitId } from '../../../domain/measurement/Unit'
import { MEASUREMENT_UNITS } from '../../../domain/measurement/Unit'

interface UnitSelectProps {
  value: MeasurementUnitId
  onChange: (unit: MeasurementUnitId) => void
}

export function UnitSelect({ value, onChange }: UnitSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as MeasurementUnitId)}
      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
    >
      {MEASUREMENT_UNITS.map((unit) => (
        <option key={unit.id} value={unit.id}>
          {unit.label} ({unit.symbol})
        </option>
      ))}
    </select>
  )
}
