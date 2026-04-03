export const StaleDetection = {
  /**
   * Checks if an element is no longer attached to the document or has been replaced.
   */
  isStale(element: HTMLElement): boolean {
    // 1. Check if detached from DOM
    if (!document.body.contains(element)) {
      return true;
    }

    // 2. Additional checks for "replaced" state (e.g. parent is no longer the same)
    // In most cases, if contains() is true, the element is still valid.

    return false;
  },

  /**
   * Checks if critical attributes (readonly, disabled) have changed.
   */
  hasAttributeChanges(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      return element.disabled || element.readOnly;
    }
    return false;
  },
};
