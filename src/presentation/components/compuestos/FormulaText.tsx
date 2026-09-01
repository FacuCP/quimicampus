interface FormulaTextProps {
  formula: string
  className?: string
}

/** Muestra una fórmula ASCII ("Fe2(SO4)3") con los dígitos como subíndices. */
export function FormulaText({ formula, className }: FormulaTextProps) {
  const tokens = formula.match(/\d+|\D+/g) ?? []
  return (
    <span className={className}>
      {tokens.map((token, index) =>
        /^\d+$/.test(token) ? (
          <sub key={index}>{token}</sub>
        ) : (
          <span key={index}>{token}</span>
        ),
      )}
    </span>
  )
}
