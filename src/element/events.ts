import type { BBoardEventMap } from '../public/events.types.js';

/**
 * Utility to safely dispatch typed CustomEvents from the keyboard element.
 */
export function dispatchBBoardEvent<K extends keyof BBoardEventMap>(
  element: HTMLElement,
  eventName: K,
  detail: BBoardEventMap[K]['detail']
): boolean {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    composed: true, // Cross shadow-DOM boundaries if used later
  });
  return element.dispatchEvent(event);
}
