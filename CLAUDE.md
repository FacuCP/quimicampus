# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check the whole project (`tsc -b`, using the project-references graph) then produce a production build in `dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — run Oxlint (the linter here is Oxlint, not ESLint)

There is no test runner configured. `tsc -b` is the only type-check entry point; run `npm run build` to verify types.

## Architecture

Client-only React 19 + TypeScript SPA (Vite), styled with **Tailwind CSS v4** (via the
`@tailwindcss/vite` plugin), routed with **react-router-dom v7**. UI copy is in Spanish;
the app is branded "QuimiCampus".

`src/index.css` holds the `@import "tailwindcss"`, a `@theme` block defining the
`--color-brand-*` scale (a mint/turquoise around `#1CE6C8`) used for primary buttons,
focus rings and accents, the tinted `body` background, and the `route-fade` keyframe.
`AppRouter` wraps `<Routes>` in a `<div key={location.pathname} className="route-fade">`
so each navigation fades the new page in (respects `prefers-reduced-motion`). `html` has
`scrollbar-gutter: stable` so the layout doesn't shift when the scrollbar toggles between
routes.

`HomePage`'s three cards are a `grid-cols-3` row of `aspect-square` links, each showing an
icon from `public/icons/<route>.svg` (`tabla-periodica.svg`, `calcular.svg`,
`compuestos.svg` — currently copies of `placeholder.svg`; replace the file to set a real
icon, see `public/icons/README.md`).

The app is a small chemistry toolbox: a home page linking to three sections —
`/tabla-periodica` (full interactive 118-element periodic table), `/calcular` (rule-of-three
proportion table) and `/compuestos` (inorganic-compound name generator).

### Clean architecture layers (`src/`)

Dependencies point inward; each layer may only import from layers listed under it.

- `domain/` — entities, ports and pure logic. `element/Element.ts` (`Element` interface with
  `electronegativity` + `oxidationStates`, `categoryLabel`, `isMetal`),
  `element/ElementRepository.ts` (port), `element/filterElements.ts` (accent-insensitive
  partial search), `measurement/Unit.ts` (`MEASUREMENT_UNITS` catalog + `unitSymbol`),
  `proportion/ruleOfThree.ts`, `compound/tables.ts` (nomenclature data) +
  `compound/analyzeCompound.ts` (classify a set of `{element, oxidationState}` into a
  compound family, build the formula, and name it three ways). Imports nothing from other
  layers.
- `application/` — use cases. `element/GetPeriodicTable.ts` (sorted by atomic number) and
  `element/SearchElements.ts` (`repo.getAll()` + `filterElements`). Imports `domain` only.
  Note `analyzeCompound` is a pure domain function — presentation calls it directly, no use
  case or container entry needed.
- `infrastructure/` — adapters. `element/periodicTable.data.ts` is the flat 118-element
  dataset (Spanish names, standard masses, grid coords, Pauling electronegativity, common
  oxidation states); `element/StaticElementRepository.ts` implements the port from that data.
- `composition/container.ts` — the composition root. The **only** module that instantiates
  infrastructure and wires use cases. Presentation imports `container`, never `infrastructure`.
- `presentation/` — React. `router/AppRouter.tsx`, `pages/*`, `components/*`, `hooks/*`
  (`usePeriodicTable`, `useElementSearch` — each calls the matching `container.*` use case).
  Talks to inner layers through `container` and `domain` types only.

If you regenerate `periodicTable.data.ts`, the generator script lives in the scratchpad
(`gen.mjs`) — it computes `xpos`/`ypos` from period/group (lanthanides at `ypos 9`,
actinides at `ypos 10`) and merges in the `EN` (electronegativity) and `OX` (oxidation
states) maps. `PeriodicTableGrid` positions each cell with inline `gridColumn`/`gridRow`.

The layout is responsive (mobile-first Tailwind breakpoints). Every secondary page uses
`components/Layout.tsx` — one fixed `max-w-5xl` frame with the "← Volver" link + `<h1>` in
the same position on all pages; each page's content caps its own width below that. The
periodic grid keeps a `min-w` and scrolls horizontally; `ElementDetailPanel` renders as a
sticky side column at `lg:` and above, and as a fixed bottom sheet (close button wired to
`clearSelection`) below that — see `PeriodicTablePage`.

`/calcular` is `components/calcular/ProportionTable.tsx`: a `table-fixed` of 2–`MAX_COLUMNS`
(3) columns ("Agregar/Quitar columna"). Row 1 = centred "Elemento A/B/C" title; row 2 =
`ElementCombobox` + `UnitSelect` per column; row 3 = the reference quantities (tinted);
rows 4+ ("Agregar fila") are data rows storing only `{ source, raw }` — the column index
the user typed into and its text. Every other cell is derived at render via
`ruleOfThree(refs[source], refs[col], typed)`; typing into a derived cell moves `source`.
Units are labels only — no conversion, just proportion on the raw numbers.

`/compuestos` is `components/compuestos/CompoundBuilder.tsx`: a centred (`w-fit mx-auto`)
`flex` row (scrolls) of fixed-size (`w-56 min-h-[15rem]`) element cards plus a dashed
"Agregar elemento" card of the same size (up to `MAX_ROWS` = 4). Each card has an
`ElementCombobox`, the oxidation state as a radio-pill group (`peer`/`peer-checked`
styling, options from `element.oxidationStates`), electronegativity, and an info button
that opens `ElementDetailPanel` inside `components/common/Modal.tsx`. It calls
`analyzeCompound` live and shows the result in a centred, brand-bordered box: formula
(`FormulaText` turns `"Fe2(SO4)3"` into subscripts), family, and traditional/Stock/IUPAC
names. `analyzeCompound` covers binary (oxides, peroxides, hydrides, hydracids, salts),
ternary (hydroxides, oxoacids, oxosalts) and quaternary (acid salts) families via the
tables in `tables.ts`; systematic IUPAC names for oxoacids/oxosalts are approximate (the
result carries a `note`). `ElementCombobox` lives in `components/element/` (shared by both
`/calcular` and `/compuestos`).

### Conventions

- `verbatimModuleSyntax` is on → type-only imports must use `import type { ... }`.
- `erasableSyntaxOnly` is on → **no TS parameter properties** (`constructor(private x)`);
  declare the field and assign it in the constructor body.
- Category → Tailwind background classes are mapped in
  `presentation/components/periodic-table/categoryStyles.ts`.
