import { isLanguageId, type LanguageId } from '../public/types.js';

export class BeninKeyboard extends HTMLElement {
  private _language: LanguageId = 'yoruba';

  constructor() {
    super();
    // Lifecycle setup will go here
  }

  static get observedAttributes(): string[] {
    return ['language'];
  }

  connectedCallback(): void {
    // Engine initialization will happen here
  }

  disconnectedCallback(): void {
    // Cleanup
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'language' && isLanguageId(newValue)) {
      this.language = newValue;
    }
  }

  get language(): LanguageId {
    return this._language;
  }

  set language(value: LanguageId) {
    if (isLanguageId(value) && this._language !== value) {
      this._language = value;
      this.setAttribute('language', value);
      // Event emission will be wired here later
    }
  }

  /**
   * Attaches the keyboard to a specific DOM target.
   * @param target The HTML element to receive input.
   */
  attach(target: HTMLElement): void {
    // Will delegate to engine.setSubstates({ attachment: 'attached' })
    // and dispatcher logic once fully wired.
    console.debug('[BeninKeyboard] attach() called', target);
  }

  /**
   * Detaches the keyboard from the current target.
   */
  detach(): void {
    console.debug('[BeninKeyboard] detach() called');
  }

  /**
   * Opens the virtual keyboard UI.
   */
  openKeyboard(): void {
    console.debug('[BeninKeyboard] openKeyboard() called');
  }

  /**
   * Closes the virtual keyboard UI.
   */
  closeKeyboard(): void {
    console.debug('[BeninKeyboard] closeKeyboard() called');
  }
}

if (!customElements.get('benin-keyboard')) {
  customElements.define('benin-keyboard', BeninKeyboard);
}
