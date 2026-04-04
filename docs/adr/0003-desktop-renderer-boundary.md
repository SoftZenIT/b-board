# ADR 0003: Thin element shell for desktop renderer

## Status

Accepted

## Context

Epic 15 shipped partial desktop rendering inside `src/element/benin-keyboard.ts`,
which created a second source of truth for desktop layout behavior. The element
mixed data loading, layout resolution, physical echo tracking, modifier display
logic, and DOM rendering in a single class. This made the rendering logic hard to
test in isolation and meant row structure, widths, modifier hints, echo, and
accessibility all lived in one file.

## Decision

Keep `<benin-keyboard>` as the public Lit shell and move desktop rendering into
focused `src/ui/desktop/` modules that render from resolved layout data.

The rendering pipeline is:

1. `src/data/` — loads JSON and resolves to a `ResolvedLayout`
2. `src/ui/desktop/render-model.ts` — derives a pure `DesktopRenderModel` from
   `ResolvedLayout` and `DesktopRenderState`
3. `src/ui/desktop/key.ts` / `src/ui/desktop/rows.ts` — render model → Lit
   `TemplateResult`
4. `src/element/benin-keyboard.ts` — thin shell: owns lifecycle, data loading via
   `scheduleUpdate()`, theme integration, and keyboard event registration

Physical echo and focus state are managed by `src/ui/state/desktop-state.ts` and
`src/ui/state/focus-controller.ts`. The mapping from browser key codes to logical
key IDs lives in `src/ui/desktop/physical-key-map.ts`.

## Consequences

- Layout JSON remains the single source of truth for row structure and key widths.
- The element keeps all lifecycle and host-integration responsibilities.
- Desktop rendering is independently testable without bootstrapping the custom
  element: unit tests cover the render model, key renderer, row renderer, state
  manager, and focus controller in isolation.
- The `src/ui/` module boundary is respected: ui modules import only from
  `src/core/` and `src/public/`, never from `src/data/`.
- The element (`src/element/`) is not tracked by the boundary linter and may
  import from any layer to wire the pipeline together.
