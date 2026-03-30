import { INITIAL_SUBSTATES, type ReadySubstates, type Substates } from './substate.types.js'

/**
 * Creates a substates store for the five ready-state dimensions.
 * get() returns a frozen copy. set() merges partial updates. reset() restores initial values.
 * @example
 * const ss = createSubstates()
 * ss.set({ attachment: 'attached', focus: 'focused' })
 * ss.get() // { attachment: 'attached', focus: 'focused', surface: 'hidden', ... }
 */
export function createSubstates(): Substates {
  let current: ReadySubstates = { ...INITIAL_SUBSTATES }

  return {
    get(): Readonly<ReadySubstates> {
      return Object.freeze({ ...current })
    },

    set(updates: Partial<ReadySubstates>): void {
      current = { ...current, ...updates }
    },

    reset(): void {
      current = { ...INITIAL_SUBSTATES }
    },
  }
}
