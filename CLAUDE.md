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
`@tailwindcss/vite` plugin; `src/index.css` is just `@import "tailwindcss"`), routed with
**react-router-dom v7**. UI copy is in Spanish.

The app is a small toolbox: a `Bienvenidos` home page linking to three sections —
`/tabla-periodica` (full interactive 118-element periodic table), `/calcular` and
`/ecuaciones` (both placeholder "Función sin implementar" screens).

### Clean architecture layers (`src/`)

Dependencies point inward; each layer may only import from layers listed under it.

- `domain/` — entities, ports and pure logic. `element/Element.ts` (`Element` interface,
  `ElementCategory`, `categoryLabel`), `element/ElementRepository.ts` (port),
  `element/filterElements.ts` (accent-insensitive partial search), `measurement/Unit.ts`
  (`MEASUREMENT_UNITS` catalog + `unitSymbol`), `proportion/ruleOfThree.ts` (rule-of-three
  proportion). Imports nothing from other layers.
- `application/` — use cases. `element/GetPeriodicTable.ts` (sorted by atomic number) and
  `element/SearchElements.ts` (`repo.getAll()` + `filterElements`). Imports `domain` only.
- `infrastructure/` — adapters. `element/periodicTable.data.ts` is the flat 118-element
  dataset (Spanish names, standard masses, grid coords); `element/StaticElementRepository.ts`
  implements the port from that data.
- `composition/container.ts` — the composition root. The **only** module that instantiates
  infrastructure and wires use cases. Presentation imports `container`, never `infrastructure`.
- `presentation/` — React. `router/AppRouter.tsx`, `pages/*`, `components/*`, `hooks/*`
  (`usePeriodicTable`, `useElementSearch` — each calls the matching `container.*` use case).
  Talks to inner layers through `container` and `domain` types only.

If you regenerate `periodicTable.data.ts`, the generator script lives in the scratchpad
(`gen.mjs`) — it computes `xpos`/`ypos` from period/group, placing lanthanides at `ypos 9`
and actinides at `ypos 10`. `PeriodicTableGrid` positions each cell with inline
`gridColumn`/`gridRow` from those coords.

The layout is responsive (mobile-first Tailwind breakpoints). The periodic grid keeps a
`min-w` and scrolls horizontally on small screens; `ElementDetailPanel` renders as a sticky
side column at `lg:` and above, and as a fixed bottom sheet (with a close button wired to
`clearSelection`) below that — see `PeriodicTablePage`.

`/calcular` is `components/calcular/ProportionTable.tsx`: a 2-column table where row 1 picks
an element per column (`ElementCombobox`, backed by `useElementSearch`), row 2 sets a
reference unit + amount, and "Agregar fila" adds rows. Each extra row stores only
`{ source, raw }` — the side the user typed and its text; the opposite cell is derived at
render via `ruleOfThree` against the row-2 reference. Typing into the derived cell flips
`source`. Units are labels only — no unit conversion, just proportion on the raw numbers.

### Conventions

- `verbatimModuleSyntax` is on → type-only imports must use `import type { ... }`.
- `erasableSyntaxOnly` is on → **no TS parameter properties** (`constructor(private x)`);
  declare the field and assign it in the constructor body.
- Category → Tailwind background classes are mapped in
  `presentation/components/periodic-table/categoryStyles.ts`.
