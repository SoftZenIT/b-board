export const ATTACHMENT_STATES = ['detached', 'attached'] as const
export type AttachmentState = (typeof ATTACHMENT_STATES)[number]

export const FOCUS_STATES = ['blurred', 'focused'] as const
export type FocusState = (typeof FOCUS_STATES)[number]

export const SURFACE_STATES = ['hidden', 'visible'] as const
export type SurfaceState = (typeof SURFACE_STATES)[number]

export const INTERACTION_STATES = ['idle', 'active'] as const
export type InteractionState = (typeof INTERACTION_STATES)[number]

export const COMPOSITION_SUBSTATES = ['inactive', 'composing'] as const
export type CompositionSubstate = (typeof COMPOSITION_SUBSTATES)[number]

export interface ReadySubstates {
  attachment:  AttachmentState
  focus:       FocusState
  surface:     SurfaceState
  interaction: InteractionState
  composition: CompositionSubstate
}

export const INITIAL_SUBSTATES: Readonly<ReadySubstates> = Object.freeze({
  attachment:  'detached',
  focus:       'blurred',
  surface:     'hidden',
  interaction: 'idle',
  composition: 'inactive',
})

export interface Substates {
  get(): Readonly<ReadySubstates>
  set(updates: Partial<ReadySubstates>): void
  reset(): void
}
