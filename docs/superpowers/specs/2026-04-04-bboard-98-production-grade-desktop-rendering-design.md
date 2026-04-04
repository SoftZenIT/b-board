# BBOARD-98 production-grade desktop rendering design

This spec defines how to complete Epic 15, `BBOARD-98`, in a way that matches
the existing `b-board` architecture and remains maintainable after the initial
desktop UI work lands. It treats the current implementation as a partial
delivery that needs architectural correction before the desktop renderer can be
considered production-grade.

## Overview

`BBOARD-98` targets desktop keyboard rendering, physical key echo, modifier
display, accessibility, and desktop interaction coverage. The repo already
ships part of this work in `src/element/benin-keyboard.ts`, but the current
implementation hardcodes its own keyboard structure and bypasses the documented
`data -> core -> ui` flow described in `docs/ARCHITECTURE.md`.

The goal of this design is to complete the desktop renderer without creating a
second source of truth for layout data or a permanent rendering island inside
the custom element.

## Current state

The current repo contains the main building blocks needed for Epic 15.

- A Lit custom element already exists in `src/element/benin-keyboard.ts`.
- Theme tokens and theme switching already exist in `src/theme/` and
  `docs/theming/`.
- Canonical desktop layout data already exists in `data/layouts/desktop-azerty.json`.
- The layout resolver and resolved runtime types already exist in `src/data/`.
- The public API already exports both the data layer and the custom element.

The current repo also contains several critical gaps.

- The desktop renderer hardcodes a five-row keyboard in
  `src/element/benin-keyboard.ts`.
- The canonical desktop layout JSON defines four rows, so the rendered UI and
  the data model already diverge.
- Width handling is embedded in CSS class branches instead of a layout-driven
  sizing pipeline.
- Physical echo is implemented as a local code map and held-key set, not as a
  logical key mapping derived from resolved layout data.
- Modifier hint behavior is only a cosmetic uppercase transform for single
  letter keys.
- Focus management and keyboard navigation are largely absent.
- The current tests do not provide the desktop interaction coverage described
  in `BBOARD-124`.

## Problem statement

The main problem is not only missing functionality. The larger problem is
boundary drift.

The architecture says UI rendering should consume resolved layout data and keep
behavioral state separate from presentation. The current desktop implementation
mixes these responsibilities inside one public element file:

- public API surface
- browser event wiring
- row and key rendering
- width decisions
- action key styling
- physical key echo state

If Epic 15 continues in this direction, the repo will carry two competing
desktop keyboard models:

1. the data-driven model in `data/` and `core/`
2. the hardcoded DOM-driven model in `src/element/`

That makes future work on mobile rendering, composition, adapters, and
accessibility more expensive and less predictable.

## Design goals

This design keeps Epic 15 focused while correcting the integration model.

- Use layout data as the single source of truth for row structure and width.
- Keep the public custom element thin and instance-scoped.
- Move desktop rendering into focused UI modules under `src/ui/`.
- Keep physical echo, modifier state, and focus state explicit and testable.
- Preserve the public API while allowing internal refactor.
- Add enough test coverage to make later UI work safer.

## Out of scope

This design does not expand Epic 15 into a wider renderer platform rewrite.

- It does not redesign the mobile renderer.
- It does not redesign the data schema for layouts.
- It does not introduce new public APIs unless required to preserve clean
  instance configuration.
- It does not broaden the composition engine beyond what desktop rendering
  needs to project state correctly.

## Target architecture

The production-grade integration uses the existing architectural direction
instead of bypassing it.

### Public shell

`src/element/benin-keyboard.ts` remains the public web component, but its role
changes. It owns:

- public properties
- lifecycle and cleanup
- host-facing browser integration
- engine and resolver wiring
- event bridging across the shadow boundary

It must stop owning desktop layout structure, key sizing logic, and key label
decisions directly.

### UI renderer

Desktop rendering moves into `src/ui/desktop/` and becomes data-driven. The UI
layer owns:

- row rendering
- key rendering
- action key presentation
- modifier hint presentation
- focus ring rendering
- pressed, focused, disabled, and hidden state projection

The UI layer must render from a stable view model and remain ignorant of how
the shell loaded or resolved the data.

### State derivation

Transient desktop UI state moves into `src/ui/state/`. This layer owns:

- held physical keys
- active modifier visibility
- focused key and roving index
- per-key hidden and disabled flags
- derived visual states used by the renderer

This state stays instance-scoped so multiple keyboards can exist on the same
page without leaking behavior into each other.

### Data flow

The renderer must follow this flow:

1. Load `LayoutShape` and `LanguageProfile`.
2. Resolve them into `ResolvedLayout`.
3. Read engine and composition state.
4. Merge transient UI state.
5. Build a desktop render model.
6. Render rows and keys from that model.

Any behavior that cannot be explained as layout data, engine state, transient
UI state, or token-driven styling is likely in the wrong layer.

## Module decomposition

The following module split keeps files focused and testable.

- `src/element/benin-keyboard.ts`
  Thin public shell and lifecycle owner.
- `src/ui/desktop/render-model.ts`
  Builds a stable desktop view model from resolved layout and state.
- `src/ui/desktop/rows.ts`
  Renders row structures from the view model.
- `src/ui/desktop/key.ts`
  Renders character keys, action keys, labels, and ARIA metadata.
- `src/ui/desktop/physical-key-map.ts`
  Maps `KeyboardEvent.code` values to logical key IDs.
- `src/ui/state/desktop-state.ts`
  Stores held keys, active modifiers, and per-instance UI state.
- `src/ui/state/focus-controller.ts`
  Handles Tab, Shift+Tab, arrow navigation, and focus persistence.
- `src/ui/styles/desktop.css`
  Defines token-driven desktop-only styling and responsive buckets.

This split is intentionally small. It keeps Epic 15 bounded while creating
clear seams for later work.

## Jira task remapping

The Jira tasks describe the required behavior, but not the best implementation
shape. The work should be grouped by maintainable code boundaries instead of
task titles alone.

### Shell and wiring

`BBOARD-115` maps to the public shell and integration wiring only. It should
not also absorb row rendering, sizing, and state logic.

### Layout and sizing

`BBOARD-116` and `BBOARD-117` belong in one slice. Row structure and width
calculation both depend on resolved slot metadata and responsive rules.

### Key presentation

`BBOARD-118`, `BBOARD-120`, `BBOARD-122`, and `BBOARD-123` belong in one key
presentation pipeline. Labels, modifier hints, disabled states, hidden states,
and action key styling are all key-level view-model concerns.

### Physical echo

`BBOARD-119` stays as a separate slice because it needs dedicated mapping and
state handling. It still must consume the same logical key model as the
renderer.

### Accessibility

`BBOARD-121` stays separate because focus and keyboard navigation are
cross-cutting infrastructure, not styling polish.

### Validation

`BBOARD-124` stays last. The E2E layer should validate stable architecture
instead of chasing moving DOM structure during refactor.

## Functional gap map

This section defines the implementation gaps that remain after the current Epic
15 commits.

### Implemented partially

- Lit shell exists.
- Theme-driven styling exists.
- Basic physical echo exists.
- Some action key styling exists.
- Public properties for desktop behavior exist.

### Missing or structurally incorrect

- Desktop rendering is not driven by the canonical four-row layout JSON.
- Width calculation is not derived from slot widths and responsive buckets.
- Label rendering is not resolved from language and layer data.
- Modifier display does not reflect actual modifier state.
- Physical echo does not map from browser codes to logical layout keys through
  a dedicated module.
- Focus ring behavior exists only as CSS, not as a navigation model.
- Disabled behavior is global instead of per-key.
- Hidden key behavior is absent.
- Desktop interaction E2E coverage is absent.

## Safety and maintainability rules

The implementation must satisfy the following non-negotiable rules.

### Single source of truth

The row count, slot order, key widths, and layer structure must come from the
layout data pipeline. No desktop matrix may be hardcoded in the custom element
or renderer.

### Instance safety

Global keyboard listeners must be attached and detached per component instance.
Held-key state, focus state, and modifier visibility must never be shared
across component instances.

### Boundary discipline

The custom element must not become the permanent owner of desktop rendering
logic. Rendering belongs in `src/ui/`, data resolution belongs in `src/data/`,
and engine behavior belongs in `src/core/`.

### Public API stability

The refactor must preserve current public imports and existing public
properties unless a documented API change is explicitly approved.

### Token-driven styling

Dimensions, spacing, focus rings, and interactive states must use design
tokens or CSS variables derived from layout metadata. Avoid file-local magic
numbers.

### Accessibility as behavior

Accessibility is part of the acceptance criteria. Focus order, ARIA metadata,
disabled semantics, and keyboard navigation must be implemented as first-class
behavior.

## Testing strategy

The tests must mirror the architecture so failures are easy to localize.

### Unit tests

Unit tests must cover:

- render-model derivation from `ResolvedLayout`
- width derivation from slot metadata
- label generation and modifier display logic
- physical key mapping
- focus-controller transitions

### Component tests

Component tests must cover:

- property-to-render updates on `<benin-keyboard>`
- listener registration and cleanup
- per-instance state isolation
- disabled and hidden key semantics

### End-to-end tests

Desktop E2E coverage must include:

- desktop rendering at supported viewport widths
- physical key echo on keydown and keyup
- click interaction on virtual keys
- modifier display behavior
- focus navigation with Tab and arrow keys
- theme and language switching on desktop
- accessibility assertions for focus and ARIA metadata

### Regression tests

Regression coverage must include:

- mismatch protection between layout JSON row count and rendered row count
- multiple mounted keyboard instances
- no layout drift when theme changes
- no layout overflow across supported desktop width buckets

## Exit criteria

Epic 15 is only complete when all of the following are true.

- Desktop rendering consumes resolved layout data.
- The public shell is thin and delegates rendering.
- Physical echo uses a dedicated logical key mapping path.
- Modifier display reflects actual state, not placeholder text transforms.
- Focus navigation is fully implemented and test-covered.
- Hidden and disabled key semantics are implemented per key.
- Playwright desktop interaction coverage exists and is reliable.
- The architectural correction is documented for future contributors.

## ADR requirement

This refactor changes how the repo interprets the UI boundary for keyboard
rendering. That is a significant architectural decision. The implementation
phase should add an ADR that documents:

- why the element shell is kept thin
- why layout data is the source of truth
- why transient UI state is separated from rendering

## Next steps

The next step is to convert this design into an implementation plan that
breaks the work into sequential, reviewable changesets. That plan should
preserve the public API while replacing the current hardcoded desktop renderer
with a data-driven renderer aligned to the repo architecture.
