export const OutputValidator = {
  /**
   * Ensures text contains only safe Unicode characters and no control characters.
   * Characters such as `<` and `>` are allowed because adapters use safe plain-text
   * insertion APIs (`setRangeText` / `insertText`) that never interpret content as HTML.
   */
  validate(text: string): void {
    // Reject control characters except for common whitespace (tab, newline)
    // Range: U+0000 to U+001F (excluding 09, 0A, 0D), and U+007F to U+009F
    const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/;
    if (controlChars.test(text)) {
      throw new Error('Output contains prohibited control characters');
    }
  },
};
