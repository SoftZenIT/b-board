# Composition Engine Design — BBOARD-101

**Epic:** #18 — Composition Engine (Tone, Nasal, Dead-Key)  
**Date:** 2026-04-05  
**Status:** Approved

---

## Problem Statement

Benin languages (Yoruba, Fon-Adja, Baatonum, Dendi) use combining diacritics and tone marks that cannot be expressed as single keystrokes. The keyboard must implement a dead-key composition model: pressing a trigger key (e.g. `´`) arms composition, and the next base key (e.g. `a`) resolves to the composed character (`á`). Currently, `bboard-key-press` fires with the raw layout character — no composition occurs.

---

## Decisions

| Question | Decision |
|----------|----------|
| Integration point | Transparent/inside the element — `bboard-key-press` always fires the final composed char |
| Tone model | Dead-key + base (each trigger maps to one diacritic, standard OS dead-key model) |
| Timeout on armed state | None — stays armed until resolved, Escaped, or blurred |

---

## Architecture

The composition engine is a **pure data-processing module** that sits between key activation and event dispatch in `benin-keyboard.ts`. It has one public seam: `processor.process(keyId, char)`.

### Data Flow

```
User presses key
       ↓
_activateKey(keyId, char)  /  _handleKeydown physical path
       ↓
compositionProcessor.process(keyId, char)
       ├─ char is a dead-key trigger? (including when already armed)
       │     → (re-)arm state, return null (swallow — no bboard-key-press fired)
       │     → element re-renders with armed visual feedback
       ├─ state is armed + char is a composable base?
       │     → look up composed result, reset state, return composed char
       │     → element fires bboard-key-press({ keyId, char: composedChar })
       ├─ state is armed + char is NOT composable?
       │     → reset state, return original char (pass-through)
       └─ no composition active?
             → return original char (pass-through)
```

---

## Module Structure

```
src/composition/
├── index.ts                ← public facade: createCompositionProcessor()
├── state-machine.ts        ← BBOARD-143: armed/idle state + transitions
├── tone-resolver.ts        ← BBOARD-144: trigger + base → composed char (tone mode)
├── nasal-resolver.ts       ← BBOARD-145: trigger + base → composed char (nasal mode)
├── dead-key-detector.ts    ← BBOARD-146: is this char a dead-key trigger?
├── letter-mapper.ts        ← BBOARD-147: delegates to tone/nasal resolver by mode
└── cancellation.ts         ← BBOARD-148: reset state on Escape / blur / detach
```

### Internal Module Contracts

| File | Inputs | Output |
|------|--------|--------|
| `dead-key-detector.ts` | `char`, `compositionMap` | `{ isDeadKey: boolean, mode: 'tone'\|'nasal' } \| null` |
| `state-machine.ts` | event: `arm \| resolve \| cancel` | new `CompositionMode` (`'none' \| 'tone-armed' \| 'nasal-armed'`) |
| `tone-resolver.ts` | `trigger`, `base`, `compositionMap` | composed `string` or `null` |
| `nasal-resolver.ts` | `trigger`, `base`, `compositionMap` | composed `string` or `null` |
| `letter-mapper.ts` | `trigger`, `base`, `mode`, `compositionMap` | composed `string` or `null` (delegates by mode) |
| `cancellation.ts` | state machine ref | resets to `'none'` |

### Public Facade API

```ts
interface CompositionProcessor {
  /** Process a key press. Returns null when a dead key is swallowed. */
  process(keyId: KeyId, char: string): string | null;
  /** Cancel pending composition (Escape / blur / language switch). */
  cancel(): void;
  /** True when a dead key has been pressed and awaits a base key. */
  get isArmed(): boolean;
  /** The trigger character currently pending, or null if not armed. */
  get armedTrigger(): string | null;
}

function createCompositionProcessor(resolvedLayout: ResolvedLayout): CompositionProcessor;
```

---

## Element Integration

### Changes to `benin-keyboard.ts`

**1. Processor field:**
```ts
private _compositionProcessor: CompositionProcessor | null = null;
```
Created when `_resolvedLayout` is first set; recreated on language/layout change (natural state reset).

**2. Virtual key tap (`_activateKey`):**
```ts
// After existing char resolution:
const composed = this._compositionProcessor?.process(keyId, char) ?? char;
if (composed === null) { this.requestUpdate(); return; } // dead key swallowed
dispatchBBoardEvent(this, 'bboard-key-press', { keyId, char: composed });
// Modifier layer toggle continues unchanged
```

**3. Physical keyboard path (`_handleKeydown`):**
```ts
const composed = this._compositionProcessor?.process(keyId, char) ?? char;
if (composed !== null) {
  dispatchBBoardEvent(this, 'bboard-key-press', { keyId, char: composed });
}
```

**4. Cancellation hooks:**

| Event | Action |
|-------|--------|
| `window blur` | `this._compositionProcessor?.cancel()` |
| `disconnectedCallback` | `this._compositionProcessor?.cancel()` |
| `detach()` | `this._compositionProcessor?.cancel()` |
| Escape `keydown` | `this._compositionProcessor?.cancel()` |
| Language/layout change | processor recreated (implicit cancel) |

**5. Visual feedback:**
When `isArmed === true`, the element host receives a `data-composition-armed` attribute during render. This triggers a CSS indicator (subtle pulsing border or overlay) to signal pending composition to the user. No new child component required — the existing `requestUpdate()` after key press handles the re-render.

---

## Testing

### Unit Tests (`src/composition/*.test.ts`)

- `dead-key-detector`: correctly identifies triggers from `compositionMap`; returns null for non-triggers
- `state-machine`: all valid transitions; invalid transitions handled gracefully
- `tone-resolver` / `nasal-resolver`: correct composed char for all tone/nasal combos; `null` on unknown base
- `letter-mapper`: delegates to correct resolver by mode; falls back to original char on no match
- `cancellation`: always resets to `'none'` regardless of current state
- **Facade integration sequences:**
  - Dead key → base key → composed `bboard-key-press`
  - Dead key → Escape → no event, state reset
  - Dead key → invalid base → pass-through with state reset
  - Dead key → blur → no event, state reset

### Element Integration Tests (`src/element/benin-keyboard.test.ts`)

- `bboard-key-press` fires with composed char after dead-key + base sequence
- Dead key alone fires no `bboard-key-press`
- Blur cancels armed state (no stale composition on next key)
- Language switch resets composition (new processor instance)

### E2E Tests (`tests/e2e/composition.spec.ts`)

- Full dead-key sequence in demo page — verify `bboard-key-press` detail has composed char
- Escape cancels pending composition — next key fires unmodified char
- Physical keyboard dead-key + base sequence produces composed char

---

## Subtask Mapping

| Jira | Title | File |
|------|-------|------|
| BBOARD-143 | Composition State Machine | `src/composition/state-machine.ts` |
| BBOARD-144 | Tone-Cycle Generator | `src/composition/tone-resolver.ts` |
| BBOARD-145 | Nasal-Composition Logic | `src/composition/nasal-resolver.ts` |
| BBOARD-146 | Dead-Key Trigger Recognition | `src/composition/dead-key-detector.ts` |
| BBOARD-147 | Base-Letter → Final-Output Mapping | `src/composition/letter-mapper.ts` |
| BBOARD-148 | Composition Cancellation | `src/composition/cancellation.ts` |
