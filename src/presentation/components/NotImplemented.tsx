interface NotImplementedProps {
  feature: string
}

export function NotImplemented({ feature }: NotImplementedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 py-20 text-center dark:border-slate-700">
      <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
        {feature}
      </p>
      <p className="text-slate-500 dark:text-slate-400">
        Función sin implementar
      </p>
    </div>
  )
}
